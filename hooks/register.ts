import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { isSupported, parseScan, parseVersion, ruleText, scanArgv } from './cli'
import type { CliMatch, RunResult, ScanTarget } from './cli'
import { base64Bytes, decodeFile, planEdits, sha256Bytes, sha256Text, unifiedDiff, utf8Length } from './edit'
import {
  INITIAL,
  MAX_DIFF_BYTES,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_REPLACEMENTS,
  MAX_SNAPSHOT_BYTES,
  PREVIEW_TTL_MS,
  TOOLS,
  USAGE,
  configFrom,
  errorText,
  formatSearch,
  isActive,
  parseArgs,
  previewText,
  relativeTo,
  statusText,
  validatePreview,
  validatePreviewId,
  validateSearch,
} from './policy'
import type { ErrorCode } from './policy'
import type { Config, FileStatus, Preview, PreviewFile, Session } from '../types'

const NAME = 'ast-grep'
const SEARCH = 'mcp__ast-grep__search'
const PREVIEW = 'mcp__ast-grep__preview'
const APPLY = 'mcp__ast-grep__apply'
const DISCARD = 'mcp__ast-grep__discard'

// Change the shape tag when Session's fields change: a value an older version
// stored (it outlives a hot reload) then reads as INITIAL instead of breaking.
const sessionAtom = atom({ plugin: 'ast-grep', key: 'session' } as const, INITIAL, { shape: 'session-3' })

// Module variables reset on a hot reload; register and session.start run again then.
let config: Config = configFrom({})
/** `ast-grep --version`, once checked in this module's life. */
let version: string | null = null
/** Applies running in this copy of the module. A preview `applying` under any other run id was interrupted. */
const liveRuns = new Set<string>()

/** A tool's refusal: thrown inside the hooks, answered as `{ deny }` by `serve`. */
class Refusal extends Error {
  constructor(readonly code: ErrorCode, message: string, readonly extra: Record<string, unknown> = {}) {
    super(message)
  }
}

/** Best effort: reporting must never throw out of a hook. */
function log($: EngineInterface, text: string) {
  try {
    $.ui.log(`${NAME}: ${text}`)
  } catch {
    // nothing to do
  }
}

function newId(prefix: string): string {
  const b = crypto.getRandomValues(new Uint8Array(6))
  return `${prefix}-${[...b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}

async function registerTools($: EngineInterface) {
  const isDeferred = !config.alwaysLoaded
  for (const t of [TOOLS.search, TOOLS.preview, TOOLS.apply, TOOLS.discard]) {
    await $.tool.register({ name: t.name, description: t.description, inputSchema: t.inputSchema, isDeferred })
  }
}

// ---------- the session root and paths ----------

type Where = { sessionId: string; root: string }

async function whereNow($: EngineInterface): Promise<Where> {
  const sessionId = await $.session.id()
  const cwd = await $.session.cwd()
  const st = await $.fs.stat(cwd, { resolve: true }).catch(() => undefined)
  if (!st?.realPath || st.kind !== 'dir') throw new Refusal('PATH', 'The session directory could not be resolved.')
  return { sessionId, root: st.realPath }
}

/** Input paths as paths relative to the root, each checked to exist and resolve inside it. */
async function scopePaths($: EngineInterface, root: string, paths: readonly string[]): Promise<string[]> {
  const out: string[] = []
  for (const p of paths) {
    const st = await $.fs.stat(p.startsWith('/') ? p : `${root}/${p}`, { resolve: true }).catch(() => undefined)
    if (!st) throw new Refusal('PATH', `${p} does not exist.`)
    const rel = st.realPath ? relativeTo(root, st.realPath) : null
    if (rel === null) throw new Refusal('PATH', `${p} is outside the session directory (${root}); the mod works inside it only.`)
    if (st.kind !== 'file' && st.kind !== 'dir') throw new Refusal('PATH', `${p} is neither a file nor a directory.`)
    out.push(rel)
  }
  return out
}

/** A matched file's absolute path, refused unless it is a regular file reached by no symbolic link. */
async function checkTarget($: EngineInterface, root: string, file: string): Promise<{ path: string; abs: string; size: number }> {
  const path = file.replace(/^\.\//, '')
  if (path.startsWith('/') || path.split('/').some(s => s === '..' || s === '')) {
    throw new Refusal('CLI_OUTPUT', `ast-grep reported a file path the mod does not accept: ${file}`)
  }
  const abs = root === '/' ? `/${path}` : `${root}/${path}`
  const st = await $.fs.stat(abs, { resolve: true }).catch(() => undefined)
  if (!st) throw new Refusal('STALE', `${path} disappeared while previewing.`)
  if (st.isLink || st.realPath !== abs) throw new Refusal('UNSUPPORTED_FILE', `${path} is reached through a symbolic link; the mod does not follow links.`)
  if (st.kind !== 'file') throw new Refusal('UNSUPPORTED_FILE', `${path} is not a regular file.`)
  if (st.size > MAX_FILE_BYTES) throw new Refusal('TOO_LARGE', `${path} is ${st.size} bytes; the mod rewrites files up to ${MAX_FILE_BYTES} bytes.`)
  return { path, abs, size: st.size }
}

/** The file's bytes and their hash, or null when it can't be read. */
async function snapshot($: EngineInterface, abs: string): Promise<{ b64: string; hash: string } | null> {
  try {
    const { base64 } = await $.fs.read(abs, { as: 'bytes' })
    return { b64: base64, hash: await sha256Bytes(base64Bytes(base64)) }
  } catch {
    return null
  }
}

// ---------- the CLI ----------

async function ensureCli($: EngineInterface): Promise<void> {
  if (version) return
  let r: RunResult
  try {
    r = await $.process.run([config.binary, '--version'], { timeoutMs: config.timeoutMs })
  } catch (err) {
    throw new Refusal('CLI_MISSING', `Could not run ${config.binary} (${err instanceof Error ? err.message : String(err)}). Install ast-grep 0.51 or newer (brew install ast-grep), or set the binary option.`)
  }
  const v = parseVersion(r.stdout)
  if (r.exitCode !== 0 || !v) throw new Refusal('CLI_MISSING', `${config.binary} --version did not print a version; is it ast-grep?`)
  if (!isSupported(v)) throw new Refusal('CLI_VERSION', `ast-grep ${v.join('.')} is older than 0.51.0, the version this mod was checked against.`)
  version = `ast-grep ${v.join('.')}`
}

async function scan($: EngineInterface, root: string, rule: string, maxResults: number, target: ScanTarget, stdin?: string): Promise<CliMatch[]> {
  const argv = scanArgv({ binary: config.binary, config: `${$.plugin.root}/assets/sgconfig.yml`, rule, maxResults, ...target })
  let r: RunResult
  try {
    r = await $.process.run(argv, { cwd: root, timeoutMs: config.timeoutMs, ...(stdin !== undefined ? { stdin } : {}) })
  } catch (err) {
    throw new Refusal('CLI_ERROR', `ast-grep did not finish (${err instanceof Error ? err.message : String(err)}); the limit is ${config.timeoutMs / 1000} s per run.`)
  }
  const parsed = parseScan(r, { rewrite: rule.includes('"fix":') })
  if (!parsed.ok) throw new Refusal(parsed.code, parsed.message)
  return parsed.matches
}

// ---------- guards shared by the tools ----------

async function guard($: EngineInterface, e: { agentId?: string }): Promise<Session> {
  if (e.agentId !== undefined) throw new Refusal('SUBAGENT', 'The ast-grep tools serve the main conversation only; run this from there.')
  const s = await read($, sessionAtom)
  if (!isActive(config, s)) throw new Refusal('OFF', 'ast-grep is off for this session (/ast-grep on turns it back on).')
  return s
}

/** The pending preview `id` or the reason there isn't one. Drops an expired or foreign one. */
async function pendingPreview($: EngineInterface, id: string, where: Where): Promise<Preview> {
  const p = (await read($, sessionAtom)).preview
  if (!p || p.id !== id) {
    throw new Refusal('UNKNOWN_PREVIEW', p ? `No preview ${id}; the pending one is ${p.id}.` : `No preview ${id} is pending: it was applied, discarded, dropped or never made. Preview again.`)
  }
  if (p.state === 'applying') {
    if (p.runId && liveRuns.has(p.runId)) throw new Refusal('BUSY', `Preview ${id} is being applied right now.`)
    throw new Refusal('INTERRUPTED', `An apply of preview ${id} was interrupted by a reload; it is never resumed. Check the files, then /ast-grep discard.`, { files: fileReport(p.files) })
  }
  if (p.sessionId !== where.sessionId || p.root !== where.root) {
    await dropPreview($, id)
    throw new Refusal('SESSION_CHANGED', `Preview ${id} belongs to another conversation or directory; it was dropped.`)
  }
  if ((await $.clock.now()) >= p.expiresAt) {
    await dropPreview($, id)
    throw new Refusal('EXPIRED', `Preview ${id} expired (previews last 15 minutes); it was dropped. Preview again.`)
  }
  return p
}

async function dropPreview($: EngineInterface, id: string, last?: string) {
  await update($, sessionAtom, s => (s.preview?.id === id ? { ...s, preview: null, last: last ?? s.last } : s))
}

function fileReport(files: readonly PreviewFile[]) {
  return files.map(f => (f.note ? { path: f.path, status: f.status, note: f.note } : { path: f.path, status: f.status }))
}

// ---------- the tools ----------

async function search($: EngineInterface, e: Record<string, unknown> & { agentId?: string }): Promise<string> {
  await guard($, e)
  const q = validateSearch(e)
  if (!q.ok) throw new Refusal('INVALID_INPUT', q.error)
  const where = await whereNow($)
  await ensureCli($)
  const paths = await scopePaths($, where.root, q.value.paths)
  const rule = ruleText({ pattern: q.value.pattern, language: q.value.language })
  const matches = await scan($, where.root, rule, q.value.maxResults + 1, { paths, globs: q.value.globs })
  return formatSearch(matches, q.value.maxResults)
}

async function preview($: EngineInterface, e: Record<string, unknown> & { agentId?: string }): Promise<string> {
  const s = await guard($, e)
  const q = validatePreview(e)
  if (!q.ok) throw new Refusal('INVALID_INPUT', q.error)
  const busy = s.preview
  if (busy && (busy.state === 'applying' || (await $.clock.now()) < busy.expiresAt)) {
    throw new Refusal('PREVIEW_PENDING', `Preview ${busy.id} is still pending; apply or discard it first.`)
  }
  const where = await whereNow($)
  await ensureCli($)
  const paths = await scopePaths($, where.root, q.value.paths)
  const rule = ruleText({ pattern: q.value.pattern, language: q.value.language, fix: q.value.rewrite })

  const found = await scan($, where.root, rule, MAX_REPLACEMENTS + 1, { paths, globs: q.value.globs })
  if (found.length > MAX_REPLACEMENTS) throw new Refusal('TOO_LARGE', `More than ${MAX_REPLACEMENTS} replacements; narrow paths or globs.`)
  const names = [...new Set(found.map(m => m.file))].sort()
  if (names.length === 0) return JSON.stringify({ status: 'no-matches', previewId: null, note: 'Nothing matched: no preview was made and no file changes.' })
  if (names.length > MAX_FILES) throw new Refusal('TOO_LARGE', `The rewrite touches ${names.length} files; a preview holds at most ${MAX_FILES}. Narrow paths or globs.`)

  const files: PreviewFile[] = []
  const unchanged: string[] = []
  let diff = ''
  let stored = 0
  let replacements = 0
  for (const name of names) {
    const t = await checkTarget($, where.root, name)
    const snap = await snapshot($, t.abs)
    if (!snap) throw new Refusal('STALE', `${t.path} could not be read.`)
    const decoded = decodeFile(snap.b64)
    if (!decoded.ok) throw new Refusal('UNSUPPORTED_FILE', `${t.path} ${decoded.reason}; the mod rewrites UTF-8 text only.`)
    // The replacements come from the bytes just read, never from the discovery run.
    const reps = await scan($, where.root, rule, MAX_REPLACEMENTS + 1, { stdin: true }, decoded.text)
    if (reps.length === 0) throw new Refusal('STALE', `${t.path} changed while previewing (its matches are gone). Preview again.`)
    const plan = planEdits(decoded.text, reps)
    if (!plan.ok) throw new Refusal(plan.code, `${t.path}: ${plan.message}`)
    if (plan.after === decoded.text) {
      unchanged.push(t.path)
      continue
    }
    stored += decoded.bytes + utf8Length(plan.after)
    if (stored > MAX_SNAPSHOT_BYTES) throw new Refusal('TOO_LARGE', `The files' before and after text pass ${MAX_SNAPSHOT_BYTES / 1024} KiB; narrow paths or globs.`)
    diff += unifiedDiff(t.path, decoded.text, plan.after, plan.spans)
    if (utf8Length(diff) > MAX_DIFF_BYTES) throw new Refusal('TOO_LARGE', `The diff passes ${MAX_DIFF_BYTES / 1024} KiB; narrow paths or globs so the whole diff can be shown.`)
    replacements += reps.length
    files.push({
      path: t.path, abs: t.abs, before: decoded.text, beforeHash: snap.hash, after: plan.after, afterHash: await sha256Text(plan.after),
      replacements: reps.length, status: 'unstarted',
    })
  }
  if (files.length === 0) {
    return JSON.stringify({ status: 'no-changes', previewId: null, unchanged, note: 'Every match already reads as its rewrite: no preview was made.' })
  }
  // Every target must still hold what was read, now that all are read.
  for (const f of files) {
    const again = await snapshot($, f.abs)
    if (again?.hash !== f.beforeHash) throw new Refusal('STALE', `${f.path} changed while previewing. Preview again.`)
  }
  const at = (await $.clock.now())
  const p: Preview = {
    id: newId('ag'), sessionId: where.sessionId, root: where.root, createdAt: at, expiresAt: at + PREVIEW_TTL_MS,
    pattern: q.value.pattern, rewrite: q.value.rewrite, language: q.value.language, replacements, files, state: 'pending', runId: null,
  }
  const denied = await authorize($, { ...where, epoch: s.epoch }, { kind: 'publish', preview: p })
  if (denied) throw new Refusal(denied.code, denied.code === 'PREVIEW_PENDING' ? denied.message : `No preview was kept: ${denied.message}.`)
  log($, `preview ${p.id}: ${replacements} replacements in ${files.length} files`)
  const out = JSON.parse(previewText(p, diff)) as Record<string, unknown>
  if (unchanged.length > 0) out.unchanged = unchanged
  return JSON.stringify(out)
}

/** The facts an operation started from; it may act only while they still hold. */
type Op = { sessionId: string; root: string; epoch: number }

/** What an operation asks to do: publish its preview, or issue the Write of file `index` of a run. */
type Act = { kind: 'publish'; preview: Preview } | { kind: 'write'; id: string; runId: string; index: number }

type Denial = { code: ErrorCode; message: string }

/** Whether `act` may happen in state `s`, or why not. Pure: the one rule for write authority. */
function decide(s: Session, op: Op, act: Act, now: number): Denial | null {
  if (s.epoch !== op.epoch) return { code: 'REVOKED', message: 'ast-grep was turned off after this operation started' }
  if (!isActive(config, s)) return { code: 'OFF', message: 'ast-grep is off for this session' }
  if (act.kind === 'publish') {
    const held = s.preview
    if (held && (held.state === 'applying' || now < held.expiresAt)) {
      return { code: 'PREVIEW_PENDING', message: `Preview ${held.id} became pending meanwhile; apply or discard it first.` }
    }
    return null
  }
  const p = s.preview
  if (!p || p.id !== act.id || p.state !== 'applying' || p.runId !== act.runId) {
    return { code: 'SESSION_CHANGED', message: 'the apply lost its preview (cleared, discarded or the conversation changed) before this write' }
  }
  return null
}

function transition(s: Session, act: Act): Session {
  if (act.kind === 'publish') return { ...s, preview: act.preview }
  const p = s.preview!
  return { ...s, preview: { ...p, files: p.files.map((f, k) => (k === act.index ? { ...f, status: 'writing' as const } : f)) } }
}

/**
 * The single authorization step before a side effect: the session and its
 * directory are still the ones `op` started in, then one versioned update
 * decides and, when allowed, applies the act (publish, or mark the file
 * `writing`). Nothing may be awaited between an allowed write and its Write call.
 */
async function authorize($: EngineInterface, op: Op, act: Act): Promise<Denial | null> {
  const now = await whereNow($).catch(() => null)
  if (!now || now.sessionId !== op.sessionId) return { code: 'SESSION_CHANGED', message: 'the conversation changed (a /clear?) before this step' }
  if (now.root !== op.root) return { code: 'SESSION_CHANGED', message: `the session directory changed (${op.root} -> ${now.root}) before this step` }
  const at = await $.clock.now()
  let denial: Denial | null = null
  await update($, sessionAtom, s => {
    denial = decide(s, op, act, at)
    return denial ? s : transition(s, act)
  })
  return denial
}

async function setFile($: EngineInterface, id: string, runId: string, i: number, status: FileStatus, note?: string) {
  await update($, sessionAtom, s => {
    const p = s.preview
    if (!p || p.id !== id || p.runId !== runId) return s
    const files = p.files.map((f, k) => (k === i ? (note ? { ...f, status, note } : { ...f, status }) : f))
    return { ...s, preview: { ...p, files } }
  })
}

type WriteOutcome = 'ok' | 'deny' | 'error' | 'threw'

function outcome(kind: WriteOutcome, hash: string | null, f: PreviewFile, extra: { staged?: boolean; userModified?: boolean; reason?: string }): { status: FileStatus; note?: string } {
  if (kind === 'ok') {
    if (hash === f.afterHash) return extra.userModified ? { status: 'written', note: 'accepted with edits that left it as previewed' } : { status: 'written' }
    if (hash === f.beforeHash) return { status: 'not-written', note: extra.staged ? 'held for review instead of written' : 'the Write tool left it unchanged' }
    return { status: 'differs', note: extra.userModified ? 'the person edited the proposed content' : 'the file does not hold the previewed content' }
  }
  if (hash !== f.beforeHash) return { status: 'unknown', note: 'the write did not succeed, yet the file changed' }
  if (kind === 'deny') return { status: 'refused', note: extra.reason }
  return { status: 'failed', note: extra.reason }
}

async function apply($: EngineInterface, e: Record<string, unknown> & { agentId?: string }): Promise<string> {
  const { epoch } = await guard($, e)
  const q = validatePreviewId(e)
  if (!q.ok) throw new Refusal('INVALID_INPUT', q.error)
  const id = q.value
  const where = await whereNow($)
  const p = await pendingPreview($, id, where)

  // Claim it: pending -> applying, under a run id only this copy of the module knows.
  const runId = newId('run')
  let claimed = false
  await update($, sessionAtom, s => {
    claimed = s.preview?.id === id && s.preview.state === 'pending' && s.epoch === epoch
    return claimed ? { ...s, preview: { ...s.preview!, state: 'applying' as const, runId } } : s
  })
  if (!claimed) throw new Refusal('BUSY', `Preview ${id} is no longer pending.`)
  liveRuns.add(runId)
  try {
    // 1. Every target unchanged, before any write.
    const changed: string[] = []
    for (const f of p.files) {
      const st = await $.fs.stat(f.abs, { resolve: true }).catch(() => undefined)
      const snap = st && !st.isLink && st.kind === 'file' && st.realPath === f.abs ? await snapshot($, f.abs) : null
      if (snap?.hash !== f.beforeHash) changed.push(f.path)
    }
    if (changed.length > 0) {
      await dropPreview($, id, `${id} not applied: ${changed.join(', ')} changed after the preview`)
      throw new Refusal('STALE', `Nothing was written: ${changed.join(', ')} changed after the preview. The preview was dropped; preview again.`, { changed })
    }
    // 2. Every write allowed by the permission check, before any write.
    for (const f of p.files) {
      const v = await $.tool.check({ tool: 'Write', input: { file_path: f.abs, content: f.after } })
      if (v.decision === 'deny') {
        await update($, sessionAtom, s => (s.preview?.id === id && s.preview.runId === runId ? { ...s, preview: { ...s.preview, state: 'pending' as const, runId: null } } : s))
        throw new Refusal('WRITE_DENIED', `Nothing was written: writing ${f.path} would be denied${v.reason ? ` (${v.reason})` : ''}. The preview stays pending.`, { files: fileReport(p.files) })
      }
    }
    // 3. Write each file through the Write tool, then read it back.
    const files = p.files.map(f => ({ ...f }))
    let written = 0
    for (let i = 0; i < files.length; i++) {
      const f = files[i]!
      const before = await snapshot($, f.abs)
      if (before?.hash !== f.beforeHash) {
        f.status = 'not-written'
        f.note = 'changed after the preview, right before its write'
        break
      }
      // The last step before the Write: nothing is awaited between it and the call.
      const denied = await authorize($, { sessionId: p.sessionId, root: p.root, epoch }, { kind: 'write', id, runId, index: i })
      if (denied) {
        f.status = 'not-written'
        f.note = denied.message
        break
      }
      let kind: WriteOutcome = 'ok'
      const extra: { staged?: boolean; userModified?: boolean; reason?: string } = {}
      try {
        const r = await $.tool.call({ tool: 'Write', file_path: f.abs, content: f.after })
        if (r.deny !== undefined) {
          kind = 'deny'
          extra.reason = r.deny
        } else if (r.isError) {
          kind = 'error'
          extra.reason = typeof r.text === 'string' ? r.text.slice(0, 300) : 'the Write tool reported an error'
        } else {
          const res = r.result as { staged?: boolean; userModified?: boolean } | undefined
          extra.staged = res?.staged === true
          extra.userModified = res?.userModified === true
        }
      } catch (err) {
        kind = 'threw'
        extra.reason = err instanceof Error ? err.message : String(err)
      }
      const back = await snapshot($, f.abs)
      const o = outcome(kind, back?.hash ?? null, f, extra)
      f.status = o.status
      if (o.note) f.note = o.note
      await setFile($, id, runId, i, o.status, o.note)
      if (o.status !== 'written') break
      written++
    }
    const report = fileReport(files)
    const summary = `${id}: ${written} of ${files.length} files written`
    const stop = files.find(f => f.status !== 'written')
    // Nothing written and the first file read back unchanged after a refusal or a
    // tool error: the preview is still exact, so it stays pending for another try.
    const keep = written === 0 && (stop?.status === 'refused' || stop?.status === 'failed')
    if (keep) {
      await update($, sessionAtom, s => (s.preview?.id === id && s.preview.runId === runId
        ? { ...s, last: summary, preview: { ...s.preview, state: 'pending' as const, runId: null, files: s.preview.files.map(f => ({ ...f, status: 'unstarted' as const })) } }
        : s))
    } else await dropPreview($, id, summary)
    log($, `apply ${summary}`)
    if (!stop) {
      return JSON.stringify({
        status: 'applied', previewId: id, files: report,
        note: `Wrote ${written} files exactly as previewed. Read a file before editing it with Edit: this conversation has not seen its new content.`,
      })
    }
    const code: ErrorCode = stop.status === 'refused' ? 'WRITE_DENIED' : 'NOT_APPLIED'
    const after = keep ? 'The preview stays pending: apply it again once the write can go through, or discard it.' : 'The preview was dropped.'
    throw new Refusal(code, `${written} of ${files.length} files written; stopped at ${stop.path} (${stop.status}${stop.note ? `: ${stop.note}` : ''}). Files after it were not touched. ${after}${written > 0 ? ' Read the written files before editing them.' : ''}`, { files: report })
  } finally {
    liveRuns.delete(runId)
  }
}

async function discard($: EngineInterface, e: Record<string, unknown> & { agentId?: string }): Promise<string> {
  if (e.agentId !== undefined) throw new Refusal('SUBAGENT', 'The ast-grep tools serve the main conversation only.')
  const q = validatePreviewId(e)
  if (!q.ok) throw new Refusal('INVALID_INPUT', q.error)
  const p = (await read($, sessionAtom)).preview
  if (!p || p.id !== q.value) throw new Refusal('UNKNOWN_PREVIEW', `No preview ${q.value} is pending.`)
  if (p.state === 'applying' && p.runId && liveRuns.has(p.runId)) throw new Refusal('BUSY', `Preview ${p.id} is being applied right now.`)
  await dropPreview($, p.id)
  return JSON.stringify({ status: 'discarded', previewId: p.id })
}

type ToolName = 'search' | 'preview' | 'apply' | 'discard'

async function runTool($: EngineInterface, e: Record<string, unknown> & { agentId?: string }, tool: ToolName): Promise<string> {
  if (tool === 'search') return search($, e)
  if (tool === 'preview') return preview($, e)
  if (tool === 'apply') return apply($, e)
  return discard($, e)
}

/** Runs one tool: its answer as `{ result }`, every refusal as `{ deny }` with the error JSON. */
async function serve($: EngineInterface, e: Record<string, unknown> & { agentId?: string }, tool: ToolName) {
  try {
    return { result: await runTool($, e, tool) }
  } catch (err) {
    if (err instanceof Refusal) return { deny: errorText(err.code, err.message, err.extra) }
    log($, `internal error: ${err instanceof Error ? err.message : String(err)}`)
    return { deny: errorText('INTERNAL', `The ast-grep mod failed: ${err instanceof Error ? err.message : String(err)}. /ast-grep status shows any pending or interrupted preview.`) }
  }
}

const FAILED = (tool: string) => ({ deny: errorText('INTERNAL', `The ast-grep ${tool} tool failed inside the plugin; /ast-grep status shows any pending or interrupted preview.`) })

export const register: Register = (on, options) => {
  config = configFrom(options)

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: NAME,
      description: 'Show ast-grep status, turn its tools on or off, or discard the pending preview',
      argumentHint: '[status|on|off|discard]',
    })
    await registerTools($)
    return next(e)
  })

  on('session.end', async ($, e, next) => {
    // /clear starts a new conversation in the same process: no preview carries over.
    if (e.reason === 'clear') await update($, sessionAtom, s => ({ ...INITIAL, mode: s.mode }))
    return next(e)
  })

  on('command.run', { command: NAME }, async ($, e) => {
    const cmd = parseArgs(e.args)
    if (cmd.kind === 'help') return { text: cmd.error ? `${cmd.error}\n${USAGE}` : USAGE }
    if (cmd.kind === 'set') {
      await update($, sessionAtom, s => {
        const live = s.preview?.state === 'applying' && s.preview.runId !== null && liveRuns.has(s.preview.runId)
        // Off bumps the epoch: every running operation loses its authority, and on never restores it.
        return { ...s, mode: cmd.mode, epoch: cmd.mode === 'off' ? s.epoch + 1 : s.epoch, preview: cmd.mode === 'off' && !live ? null : s.preview }
      })
    }
    if (cmd.kind === 'discard') {
      const p = (await read($, sessionAtom)).preview
      if (p?.state === 'applying' && p.runId && liveRuns.has(p.runId)) return { text: `Preview ${p.id} is being applied right now; it can't be discarded.` }
      if (p) {
        await dropPreview($, p.id)
        const lines = p.files.map(f => `  ${f.path}: ${f.status}${f.note ? ` (${f.note})` : ''}`)
        return { text: [`Discarded preview ${p.id}${p.state === 'applying' ? ' (an interrupted apply)' : ''}.`, ...(p.state === 'applying' ? lines : [])].join('\n') }
      }
      return { text: 'No preview to discard.' }
    }
    return { text: statusText(config, await read($, sessionAtom), (await $.clock.now()), version) }
  }).catch(() => ({ text: "The command failed inside the plugin; run with --debug for the reason." }))

  // The tools are this plugin's own: nothing beneath answers them, so a failure
  // here answers with a refusal rather than falling through.
  on('tool.call', { tool: SEARCH }, ($, e) => serve($, e as never, 'search')).catch(() => FAILED('search'))
  on('tool.call', { tool: PREVIEW }, ($, e) => serve($, e as never, 'preview')).catch(() => FAILED('preview'))
  on('tool.call', { tool: APPLY }, ($, e) => serve($, e as never, 'apply')).catch(() => FAILED('apply'))
  on('tool.call', { tool: DISCARD }, ($, e) => serve($, e as never, 'discard')).catch(() => FAILED('discard'))
}
