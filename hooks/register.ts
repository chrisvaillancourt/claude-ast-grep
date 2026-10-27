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
  isSkippedHidden,
  parseArgs,
  previewText,
  relativeTo,
  statusText,
  transition,
  validatePreview,
  validatePreviewId,
  validateSearch,
} from './policy'
import type { ErrorCode, LifeEvent, Step } from './policy'
import type { Config, FileStatus, Preview, PreviewFile, Session } from '../types'

const NAME = 'ast-grep'
const SEARCH = 'mcp__ast-grep__search'
const PREVIEW = 'mcp__ast-grep__preview'
const APPLY = 'mcp__ast-grep__apply'
const DISCARD = 'mcp__ast-grep__discard'

// Change the shape tag when Session's fields change: a value an older version
// stored (it outlives a hot reload) then reads as INITIAL instead of breaking.
const sessionAtom = atom({ plugin: 'ast-grep', key: 'session' } as const, INITIAL, { shape: 'session-4' })

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
    $.ui.log(text)
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

/** Applies one lifecycle event in one versioned update; returns what the transition did. */
async function step($: EngineInterface, ev: LifeEvent): Promise<Step> {
  let out: Step = { record: INITIAL, actions: [] }
  await update($, sessionAtom, s => {
    // Liveness is asked inside the update, of the record's own run id, on every retry.
    out = transition(s, ev, config, runId => liveRuns.has(runId))
    return out.record
  })
  return out
}

function denialOf(st: Step): { code: ErrorCode; message: string } | null {
  for (const a of st.actions) if (a.kind === 'denied') return { code: a.code, message: a.message }
  return null
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
  const raw = await scan($, where.root, rule, q.value.maxResults + 1, { paths, globs: q.value.globs })
  const matches = raw.filter(m => !isSkippedHidden(m.file, paths))
  const skipped = [...new Set(raw.filter(m => isSkippedHidden(m.file, paths)).map(m => m.file))]
  return formatSearch(matches, q.value.maxResults, skipped)
}

async function preview($: EngineInterface, e: Record<string, unknown> & { agentId?: string }): Promise<string> {
  const s = await guard($, e)
  const q = validatePreview(e)
  if (!q.ok) throw new Refusal('INVALID_INPUT', q.error)
  // Fail fast; the publish transition decides again at the end.
  await step($, { type: 'expire', now: await $.clock.now() })
  const busy = (await read($, sessionAtom)).preview
  if (busy) throw new Refusal('PREVIEW_PENDING', `Preview ${busy.id} is still pending; apply or discard it first.`)
  const where = await whereNow($)
  await ensureCli($)
  const paths = await scopePaths($, where.root, q.value.paths)
  const rule = ruleText({ pattern: q.value.pattern, language: q.value.language, fix: q.value.rewrite })

  const found = await scan($, where.root, rule, MAX_REPLACEMENTS + 1, { paths, globs: q.value.globs })
  if (found.length > MAX_REPLACEMENTS) throw new Refusal('TOO_LARGE', `More than ${MAX_REPLACEMENTS} replacements; narrow paths or globs.`)
  const all = [...new Set(found.map(m => m.file))].sort()
  // Hidden files are out of the default scope (README), and the result names any left out.
  const names = all.filter(f => !isSkippedHidden(f, paths))
  const skippedHidden = all.filter(f => isSkippedHidden(f, paths))
  if (names.length === 0) {
    return JSON.stringify({ status: 'no-matches', previewId: null, note: 'Nothing matched: no preview was made and no file changes.', ...(skippedHidden.length > 0 ? { skippedHidden: skippedHidden.slice(0, 50), skippedHiddenCount: skippedHidden.length } : {}) })
  }
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
    epoch: s.epoch,
  }
  const now = await whereNow($).catch(() => ({ sessionId: '', root: '' }))
  const denied = denialOf(await step($, { type: 'publish', preview: p, epoch: s.epoch, where: now, now: at }))
  if (denied) throw new Refusal(denied.code, denied.code === 'PREVIEW_PENDING' ? denied.message : `No preview was kept: ${denied.message}.`)
  log($, `preview ${p.id}: ${replacements} replacements in ${files.length} files`)
  const out = JSON.parse(previewText(p, diff)) as Record<string, unknown>
  if (unchanged.length > 0) out.unchanged = unchanged
  if (skippedHidden.length > 0) {
    out.skippedHidden = skippedHidden.slice(0, 50)
    out.skippedHiddenCount = skippedHidden.length
  }
  return JSON.stringify(out)
}

/**
 * The last step before a Write call: the current session id and resolved root,
 * then the `writeAuthorized` transition, which allows the write only for the
 * run that owns the preview, in the preview's own epoch, with the tools on, in
 * the same session and directory. Nothing is awaited between an allowed write
 * and its Write call.
 */
async function authorizeWrite($: EngineInterface, id: string, runId: string, index: number): Promise<{ code: ErrorCode; message: string } | null> {
  const where = await whereNow($).catch(() => ({ sessionId: '', root: '' }))
  return denialOf(await step($, { type: 'writeAuthorized', id, runId, index, where }))
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
  await guard($, e)
  const q = validatePreviewId(e)
  if (!q.ok) throw new Refusal('INVALID_INPUT', q.error)
  const id = q.value
  const where = await whereNow($)
  // Claim it: pending -> applying, under a run id only this copy of the module knows.
  // The run is live from before its claim, so no transition ever sees it applying and not live.
  const runId = newId('run')
  liveRuns.add(runId)
  let started: Step
  try {
    started = await step($, { type: 'applyStart', id, runId, where, now: await $.clock.now() })
  } catch (err) {
    liveRuns.delete(runId)
    throw err
  }
  const refused = denialOf(started)
  if (refused) {
    liveRuns.delete(runId)
    // Reported from the record the transition decided on, not from a separate read.
    const held = started.record.preview
    throw new Refusal(refused.code, refused.message, refused.code === 'INTERRUPTED' && held ? { files: fileReport(held.files) } : {})
  }
  const p = started.record.preview!
  try {
    // 1. Every target unchanged, before any write.
    const changed: string[] = []
    for (const f of p.files) {
      const st = await $.fs.stat(f.abs, { resolve: true }).catch(() => undefined)
      const snap = st && !st.isLink && st.kind === 'file' && st.realPath === f.abs ? await snapshot($, f.abs) : null
      if (snap?.hash !== f.beforeHash) changed.push(f.path)
    }
    if (changed.length > 0) {
      await step($, { type: 'applyEnd', id, runId, retain: false, summary: `${id} not applied: ${changed.join(', ')} changed after the preview` })
      throw new Refusal('STALE', `Nothing was written: ${changed.join(', ')} changed after the preview. The preview was dropped; preview again.`, { changed })
    }
    // 2. Every write allowed by the permission check, before any write.
    for (const f of p.files) {
      const v = await $.tool.check({ tool: 'Write', input: { file_path: f.abs, content: f.after } })
      if (v.decision === 'deny') {
        const end = await step($, { type: 'applyEnd', id, runId, retain: true, summary: `${id}: not applied, writing ${f.path} would be denied` })
        const kept = end.actions.some(x => x.kind === 'kept')
        throw new Refusal('WRITE_DENIED', `Nothing was written: writing ${f.path} would be denied${v.reason ? ` (${v.reason})` : ''}. ${kept ? 'The preview stays pending.' : 'The preview was revoked by /ast-grep off during the apply and dropped; preview again.'}`, { files: fileReport(p.files) })
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
      const denied = await authorizeWrite($, id, runId, i)
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
      await step($, { type: 'writeResult', id, runId, index: i, status: o.status, ...(o.note ? { note: o.note } : {}) })
      if (o.status !== 'written') break
      written++
    }
    const report = fileReport(files)
    const summary = `${id}: ${written} of ${files.length} files written`
    const stop = files.find(f => f.status !== 'written')
    // Nothing written and the first file read back unchanged after a refusal or a
    // tool error: the preview is still exact, so it stays pending for another try.
    const retain = written === 0 && (stop?.status === 'refused' || stop?.status === 'failed')
    const end = await step($, { type: 'applyEnd', id, runId, retain, summary })
    const keep = end.actions.some(x => x.kind === 'kept')
    log($, `apply ${summary}`)
    if (!stop) {
      return JSON.stringify({
        status: 'applied', previewId: id, files: report,
        note: `Wrote ${written} files exactly as previewed. Read a file before editing it with Edit: this conversation has not seen its new content.`,
      })
    }
    const code: ErrorCode = stop.status === 'refused' ? 'WRITE_DENIED' : 'NOT_APPLIED'
    const after = keep
      ? 'The preview stays pending: apply it again once the write can go through, or discard it.'
      : retain ? 'The preview was revoked by /ast-grep off during the apply and dropped; preview again.' : 'The preview was dropped.'
    throw new Refusal(code, `${written} of ${files.length} files written; stopped at ${stop.path} (${stop.status}${stop.note ? `: ${stop.note}` : ''}). Files after it were not touched. ${after}${written > 0 ? ' Read the written files before editing them.' : ''}`, { files: report })
  } finally {
    liveRuns.delete(runId)
  }
}

async function discard($: EngineInterface, e: Record<string, unknown> & { agentId?: string }): Promise<string> {
  if (e.agentId !== undefined) throw new Refusal('SUBAGENT', 'The ast-grep tools serve the main conversation only.')
  const q = validatePreviewId(e)
  if (!q.ok) throw new Refusal('INVALID_INPUT', q.error)
  const done = await step($, { type: 'discard', id: q.value })
  const refused = denialOf(done)
  if (refused) throw new Refusal(refused.code, refused.message)
  return JSON.stringify({ status: 'discarded', previewId: q.value })
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
    // A fresh copy of the module has no live apply: one left applying was interrupted.
    await step($, { type: 'reload' })
    return next(e)
  })

  on('session.end', async ($, e, next) => {
    // /clear starts a new conversation in the same process: no preview carries over.
    if (e.reason === 'clear') await step($, { type: 'clear' })
    return next(e)
  })

  on('command.run', { command: NAME }, async ($, e) => {
    const cmd = parseArgs(e.args)
    if (cmd.kind === 'help') return { text: cmd.error ? `${cmd.error}\n${USAGE}` : USAGE }
    if (cmd.kind === 'set') {
      await step($, cmd.mode === 'off' ? { type: 'off' } : { type: 'on' })
    }
    if (cmd.kind === 'discard') {
      const done = await step($, { type: 'discard', id: null })
      const refused = denialOf(done)
      if (refused?.code === 'BUSY') return { text: `${refused.message} It can't be discarded.` }
      // Reported from the preview the transition removed, not from a separate read.
      const gone = done.actions.find(a => a.kind === 'discarded')
      const held = gone?.kind === 'discarded' ? gone.preview : null
      if (refused || !held) return { text: 'No preview to discard.' }
      const lines = held.files.map(f => `  ${f.path}: ${f.status}${f.note ? ` (${f.note})` : ''}`)
      const broken = held.state !== 'pending'
      return { text: [`Discarded preview ${held.id}${broken ? ' (an interrupted apply)' : ''}.`, ...(broken ? lines : [])].join('\n') }
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
