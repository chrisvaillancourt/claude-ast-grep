// Pure decisions and text: options, bounds, tool input checks, the /ast-grep
// command, status, results. No `$`, no I/O; register.ts wires them to events.
import type { CliMatch } from './cli'
import type { Config, FileStatus, Mode, Preview, Session } from '../types'

const KIB = 1024

/** Fixed bounds. README's "Fixed bounds" table lists them; change both together. */
export const MAX_PATTERN = 16 * KIB
export const MAX_REWRITE = 16 * KIB
export const MAX_PATHS = 16
export const MAX_GLOBS = 16
export const DEFAULT_RESULTS = 50
export const MAX_RESULTS = 200
export const MAX_SEARCH_JSON = 32 * KIB
export const MAX_FIELD = 400
export const MAX_MULTI_NODES = 50
export const MAX_REPLACEMENTS = 1000
export const MAX_FILES = 20
export const MAX_FILE_BYTES = 256 * KIB
export const MAX_SNAPSHOT_BYTES = 1024 * KIB
export const MAX_DIFF_BYTES = 64 * KIB
export const PREVIEW_TTL_MS = 15 * 60_000

export const INITIAL: Session = { mode: null, preview: null, last: null, epoch: 0 }

export function configFrom(options: Record<string, unknown>): Config {
  const secs = typeof options.timeoutSeconds === 'number' && Number.isFinite(options.timeoutSeconds) ? options.timeoutSeconds : 30
  const binary = typeof options.binary === 'string' && options.binary.trim() !== '' ? options.binary.trim() : 'ast-grep'
  return {
    enabled: options.enabled !== false,
    alwaysLoaded: options.alwaysLoaded === true,
    binary,
    timeoutMs: Math.round(Math.min(300, Math.max(5, secs)) * 1000),
  }
}

export function isActive(config: Config, session: Session): boolean {
  return session.mode === null ? config.enabled : session.mode === 'on'
}

export type Command = { kind: 'set'; mode: Mode } | { kind: 'status' } | { kind: 'discard' } | { kind: 'help'; error?: string }

export function parseArgs(args: string): Command {
  const word = args.trim().toLowerCase()
  if (word === '' || word === 'status') return { kind: 'status' }
  if (word === 'on' || word === 'off') return { kind: 'set', mode: word }
  if (word === 'discard') return { kind: 'discard' }
  if (word === 'help') return { kind: 'help' }
  return { kind: 'help', error: `Unknown argument: ${args.trim()}` }
}

export const USAGE = 'Usage: /ast-grep [status|on|off|discard]'

export function statusText(config: Config, s: Session, now: number, version: string | null): string {
  const state = isActive(config, s) ? 'on' : 'off'
  const source = s.mode === null ? 'from the enabled option' : 'set for this session'
  const lines = [`${state} (${source}); ${version ?? 'ast-grep not checked yet'}.`]
  const p = s.preview
  if (p && p.state === 'applying') lines.push(`Preview ${p.id} is being applied, or its apply was interrupted (/ast-grep discard clears it).`)
  else if (p) {
    const mins = Math.max(0, Math.ceil((p.expiresAt - now) / 60_000))
    lines.push(`Pending preview ${p.id}: ${p.replacements} replacements in ${p.files.length} files, ${p.expiresAt <= now ? 'expired' : `expires in ${mins} min`}.`)
  } else lines.push('No pending preview.')
  if (s.last) lines.push(`Last apply: ${s.last}`)
  return lines.join('\n')
}

// ---------- results ----------

export type ErrorCode =
  | 'OFF' | 'SUBAGENT' | 'INVALID_INPUT' | 'INVALID_RULE' | 'UNSUPPORTED_LANGUAGE' | 'CLI_ERROR' | 'CLI_OUTPUT'
  | 'CLI_MISSING' | 'CLI_VERSION' | 'PATH' | 'UNSUPPORTED_FILE' | 'OVERLAP' | 'BAD_OFFSET' | 'SNAPSHOT_MISMATCH'
  | 'TOO_LARGE' | 'NO_CHANGES' | 'PREVIEW_PENDING' | 'UNKNOWN_PREVIEW' | 'EXPIRED' | 'BUSY' | 'STALE'
  | 'WRITE_DENIED' | 'NOT_APPLIED' | 'REVOKED' | 'SESSION_CHANGED' | 'INTERRUPTED' | 'INTERNAL'

/** A refusal's text: JSON the model reads as the tool's error. */
export function errorText(code: ErrorCode, message: string, extra: Record<string, unknown> = {}): string {
  return JSON.stringify({ status: 'error', code, message, ...extra })
}

export function clip(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n)}… (${s.length - n} more characters)`
}

/** Search matches as the tool's JSON, at most `max`, within MAX_SEARCH_JSON bytes. */
export function formatSearch(matches: readonly CliMatch[], max: number, skippedHidden: readonly string[] = []): string {
  const rows: Record<string, unknown>[] = []
  let truncated = matches.length > max
  let note = truncated ? `More than ${max} matches; narrow paths or globs, or raise maxResults (at most ${MAX_RESULTS}).` : ''
  const enc = new TextEncoder()
  const shell = (n: number, why: string) => JSON.stringify({ status: 'ok', matches: [], count: n, truncated: true, note: why })
  let used = enc.encode(shell(9999, note || 'x'.repeat(120))).length
  for (const m of matches.slice(0, max)) {
    const row: Record<string, unknown> = { file: m.file, line: m.line, column: m.column, text: clip(m.text, MAX_FIELD), lines: clip(m.lines, MAX_FIELD) }
    if (Object.keys(m.captures).length > 0) {
      row.captures = Object.fromEntries(Object.entries(m.captures).map(([k, v]) => [k, clip(v, MAX_FIELD)]))
    }
    if (Object.keys(m.multi).length > 0) {
      row.multi = Object.fromEntries(Object.entries(m.multi).map(([k, v]) => [k, v.slice(0, MAX_MULTI_NODES).map(x => clip(x, MAX_FIELD))]))
      const cut = Object.entries(m.multi).filter(([, v]) => v.length > MAX_MULTI_NODES)
      if (cut.length > 0) row.multiTruncated = Object.fromEntries(cut.map(([k, v]) => [k, v.length]))
    }
    const size = enc.encode(JSON.stringify(row)).length + 1
    if (used + size > MAX_SEARCH_JSON) {
      truncated = true
      note = `Result cut at ${MAX_SEARCH_JSON / KIB} KiB after ${rows.length} matches; narrow paths or globs.`
      break
    }
    used += size
    rows.push(row)
  }
  if (!truncated) note = rows.length === 0 ? 'No matches.' : ''
  const out: Record<string, unknown> = { status: 'ok', matches: rows, count: rows.length, truncated }
  if (rows.some(r => r.multiTruncated !== undefined)) {
    out.capturesTruncated = true
    note = `${note ? `${note} ` : ''}Some $$$ captures were cut to ${MAX_MULTI_NODES} nodes; multiTruncated gives each one's full count.`
  }
  if (note) out.note = note
  if (skippedHidden.length > 0) {
    // ast-grep excludes hidden paths itself; one it returned anyway was dropped here, after its cap.
    out.truncated = true
    out.note = `${out.note ? `${out.note} ` : ''}ast-grep returned hidden files that were dropped; other matches may be missing.`
    out.skippedHidden = skippedHidden.slice(0, 50)
    out.skippedHiddenCount = skippedHidden.length
  }
  return JSON.stringify(out)
}

export function previewText(p: Preview, diff: string): string {
  return JSON.stringify({
    status: 'preview',
    previewId: p.id,
    expiresAt: new Date(p.expiresAt).toISOString(),
    files: p.files.map(f => ({ path: f.path, replacements: f.replacements })),
    replacements: p.replacements,
    note: 'Files NOT modified yet. Call apply with this previewId to write exactly this diff, or discard to drop it.',
    diff,
  })
}

// ---------- tool input ----------

export type Checked<T> = { ok: true; value: T } | { ok: false; error: string }

export type SearchInput = { pattern: string; language: string; paths: string[]; globs: string[]; maxResults: number }
export type PreviewInput = { pattern: string; rewrite: string; language: string; paths: string[]; globs: string[] }

const LANGUAGE = /^[A-Za-z][A-Za-z0-9_+#-]{0,31}$/
const PREVIEW_ID = /^[a-z0-9-]{1,64}$/

function bytes(s: string): number {
  return new TextEncoder().encode(s).length
}

function list(v: unknown, name: string, min: number, max: number, maxLen: number): Checked<string[]> {
  if (!Array.isArray(v) || v.length < min || v.length > max) {
    return { ok: false, error: min > 0 ? `${name} must hold ${min} to ${max} ${name}` : `${name} must hold at most ${max} ${name}` }
  }
  for (let i = 0; i < v.length; i++) {
    const s = v[i]
    if (typeof s !== 'string' || s.trim() === '' || s.length > maxLen || s.includes('\u0000')) {
      return { ok: false, error: `${name}[${i}] is not a usable ${name === 'paths' ? 'path' : 'glob'}` }
    }
  }
  return { ok: true, value: v as string[] }
}

function common(e: Record<string, unknown>): Checked<{ pattern: string; language: string; globs: string[] }> {
  const { pattern, language } = e
  if (typeof pattern !== 'string' || pattern.trim() === '') return { ok: false, error: 'pattern is empty' }
  if (bytes(pattern) > MAX_PATTERN) return { ok: false, error: 'pattern is longer than 16 KiB' }
  if (typeof language !== 'string' || !LANGUAGE.test(language)) {
    return { ok: false, error: 'language must be a language name such as typescript, python or rust' }
  }
  const globs = e.globs === undefined ? { ok: true as const, value: [] } : list(e.globs, 'globs', 0, MAX_GLOBS, 1024)
  if (!globs.ok) return globs
  return { ok: true, value: { pattern, language, globs: globs.value } }
}

export function validateSearch(e: Record<string, unknown>): Checked<SearchInput> {
  const c = common(e)
  if (!c.ok) return c
  const paths = e.paths === undefined ? { ok: true as const, value: ['.'] } : list(e.paths, 'paths', 1, MAX_PATHS, 4096)
  if (!paths.ok) return paths
  const maxResults = e.maxResults === undefined ? DEFAULT_RESULTS : e.maxResults
  if (typeof maxResults !== 'number' || !Number.isInteger(maxResults) || maxResults < 1 || maxResults > MAX_RESULTS) {
    return { ok: false, error: `maxResults must be an integer from 1 to ${MAX_RESULTS}` }
  }
  return { ok: true, value: { ...c.value, paths: paths.value, maxResults } }
}

export function validatePreview(e: Record<string, unknown>): Checked<PreviewInput> {
  const c = common(e)
  if (!c.ok) return c
  if (typeof e.rewrite !== 'string') return { ok: false, error: 'rewrite must be a string (empty deletes each match)' }
  if (bytes(e.rewrite) > MAX_REWRITE) return { ok: false, error: 'rewrite is longer than 16 KiB' }
  const paths = list(e.paths, 'paths', 1, MAX_PATHS, 4096)
  if (!paths.ok) return paths
  return { ok: true, value: { pattern: c.value.pattern, rewrite: e.rewrite, language: c.value.language, paths: paths.value, globs: c.value.globs } }
}

export function validatePreviewId(e: Record<string, unknown>): Checked<string> {
  const id = e.previewId
  if (typeof id !== 'string' || !PREVIEW_ID.test(id)) return { ok: false, error: 'previewId must be the id a preview returned' }
  return { ok: true, value: id }
}

const isHiddenSegment = (seg: string) => seg.startsWith('.') && seg !== '.' && seg !== '..'

/**
 * Whether a matched file (relative to the root) is skipped as hidden: some
 * segment starts with a dot, and the file is not inside a hidden path the
 * caller named explicitly. ast-grep 0.51.0 skips hidden directories while walking but
 * still reports a hidden file at the top of a scanned directory, so the mod
 * applies the rule itself.
 */
export function isSkippedHidden(file: string, scopes: readonly string[]): boolean {
  if (!file.split('/').some(isHiddenSegment)) return false
  const named = scopes.some(sc => sc !== '.' && sc.split('/').some(isHiddenSegment) && (file === sc || file.startsWith(`${sc}/`)))
  return !named
}

/** `real` relative to `root` (both resolved, `/`-separated), `.` for the root itself, or null when outside. */
export function relativeTo(root: string, real: string): string | null {
  if (real === root) return '.'
  const base = root.endsWith('/') ? root : `${root}/`
  return real.startsWith(base) ? real.slice(base.length) : null
}

// ---------- tool descriptions (fixed: they never change per turn) ----------

const LANG_HINT = 'ast-grep language name, one per call (typescript, tsx, javascript, python, rust, go, java, ...).'
const PATHS_HINT = 'Files or directories inside the session\'s directory, relative or absolute. ast-grep\'s ignore files apply; hidden files are skipped.'
const GLOBS_HINT = 'ast-grep --globs filters (gitignore syntax, ! to exclude). A positive glob overrides ignore files.'

export const TOOLS = {
  search: {
    name: 'search',
    description:
      'Structural code search with ast-grep: find code by syntax pattern, not text. A pattern is code with metavariables: ' +
      '$A matches one node, $$$ARGS any number (e.g. `console.log($A)`, `function $F($$$P) { $$$B }`). Returns each match\'s ' +
      'file, 1-based line and column, text, source lines and captures, as JSON. Read-only. Errors (invalid pattern, unknown ' +
      'language, missing path) are reported as errors, never as no matches.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'The ast-grep pattern.' },
        language: { type: 'string', description: LANG_HINT },
        paths: { type: 'array', items: { type: 'string' }, description: `${PATHS_HINT} Default: the whole directory.` },
        globs: { type: 'array', items: { type: 'string' }, description: GLOBS_HINT },
        maxResults: { type: 'integer', minimum: 1, maximum: MAX_RESULTS, description: `Default ${DEFAULT_RESULTS}.` },
      },
      required: ['pattern', 'language'],
      additionalProperties: false,
    },
  },
  preview: {
    name: 'preview',
    description:
      'Preview a structural rewrite with ast-grep: every match of the pattern is replaced by the rewrite template ' +
      '(metavariables from the pattern are substituted). Changes NO file. Returns a previewId and the complete unified diff; ' +
      'then call apply with the previewId to write exactly that diff, or discard. One preview may be pending at a time; it ' +
      `expires after 15 minutes. Refused when matches nest, or over ${MAX_FILES} files or a ${MAX_DIFF_BYTES / KIB} KiB diff.`,
    inputSchema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'The ast-grep pattern to replace.' },
        rewrite: { type: 'string', description: 'The replacement template, e.g. `logger.info($A)`. Empty deletes each match.' },
        language: { type: 'string', description: LANG_HINT },
        paths: { type: 'array', items: { type: 'string' }, description: PATHS_HINT },
        globs: { type: 'array', items: { type: 'string' }, description: GLOBS_HINT },
      },
      required: ['pattern', 'rewrite', 'language', 'paths'],
      additionalProperties: false,
    },
  },
  apply: {
    name: 'apply',
    description:
      'Write a pending ast-grep preview: exactly the diff the preview showed, file by file through the Write tool (the usual ' +
      'permission checks apply). Nothing is written if any target changed since the preview. Read a file again before editing it.',
    inputSchema: {
      type: 'object',
      properties: { previewId: { type: 'string', description: 'The id preview returned.' } },
      required: ['previewId'],
      additionalProperties: false,
    },
  },
  discard: {
    name: 'discard',
    description: 'Drop a pending ast-grep preview without writing anything.',
    inputSchema: {
      type: 'object',
      properties: { previewId: { type: 'string', description: 'The id preview returned.' } },
      required: ['previewId'],
      additionalProperties: false,
    },
  },
} as const

// ---------- the preview lifecycle: one state machine ----------
//
// Every change to the session record goes through `transition`, applied inside
// one versioned `update` (register.ts `step`). A preview keeps the epoch it was
// published under; it has authority only while that epoch is the session's and
// the tools are on. `/ast-grep off` bumps the epoch, so nothing begun before it
// (a preview being built, an apply, a refused apply asking to stay pending) can
// act again, and `on` never restores it.

export type Where = { sessionId: string; root: string }

export type LifeEvent =
  | { type: 'publish'; preview: Preview; epoch: number; where: Where; now: number }
  | { type: 'applyStart'; id: string; runId: string; epoch: number; where: Where; now: number; live: boolean }
  | { type: 'writeAuthorized'; id: string; runId: string; index: number; where: Where }
  | { type: 'writeResult'; id: string; runId: string; index: number; status: FileStatus; note?: string }
  | { type: 'applyEnd'; id: string; runId: string; retain: boolean; summary: string }
  | { type: 'off'; live: boolean }
  | { type: 'on' }
  | { type: 'clear' }
  | { type: 'discard'; id: string | null; live: boolean }
  | { type: 'expire'; now: number }
  | { type: 'reload' }

export type LifeAction =
  | { kind: 'published' | 'applying' | 'authorized' | 'recorded' | 'kept' | 'discarded' | 'interrupted' }
  | { kind: 'dropped'; preview: Preview; why: string }
  | { kind: 'denied'; code: ErrorCode; message: string }

export type Step = { record: Session; actions: LifeAction[] }

const deny = (record: Session, code: ErrorCode, message: string, more: LifeAction[] = []): Step =>
  ({ record, actions: [...more, { kind: 'denied', code, message }] })

const drop = (s: Session, why: string, last?: string): Step =>
  s.preview
    ? { record: { ...s, preview: null, last: last ?? s.last }, actions: [{ kind: 'dropped', preview: s.preview, why }] }
    : { record: s, actions: [] }

/** Whether `p` still holds authority in `s`: its own epoch is the current one and the tools are on. */
function current(s: Session, p: Preview, config: Config): boolean {
  return p.epoch === s.epoch && isActive(config, s)
}

const sameWhere = (p: { sessionId: string; root: string }, w: Where) => p.sessionId === w.sessionId && p.root === w.root

/** A pending preview that can never be applied: expired, or from an older epoch. */
function dead(s: Session, p: Preview, now: number): boolean {
  return p.state === 'pending' && (now >= p.expiresAt || p.epoch !== s.epoch)
}

function ownRun(s: Session, id: string, runId: string): Preview | null {
  const p = s.preview
  return p && p.id === id && p.runId === runId && p.state === 'applying' ? p : null
}

export function transition(s: Session, e: LifeEvent, config: Config): Step {
  switch (e.type) {
    case 'publish': {
      if (e.epoch !== s.epoch) return deny(s, 'REVOKED', 'ast-grep was turned off after this preview started')
      if (!isActive(config, s)) return deny(s, 'OFF', 'ast-grep is off for this session')
      if (!sameWhere(e.preview, e.where)) return deny(s, 'SESSION_CHANGED', 'the conversation or its directory changed while previewing')
      const held = s.preview
      let base: Step = { record: s, actions: [] }
      if (held) {
        if (!dead(s, held, e.now)) return deny(s, 'PREVIEW_PENDING', `Preview ${held.id} became pending meanwhile; apply or discard it first.`)
        base = drop(s, 'replaced: it had expired or was revoked')
      }
      return { record: { ...base.record, preview: { ...e.preview, epoch: s.epoch } }, actions: [...base.actions, { kind: 'published' }] }
    }
    case 'applyStart': {
      const p = s.preview
      if (!p || p.id !== e.id) {
        return deny(s, 'UNKNOWN_PREVIEW', p ? `No preview ${e.id}; the pending one is ${p.id}.` : `No preview ${e.id} is pending: it was applied, discarded, dropped or never made. Preview again.`)
      }
      if (p.state === 'applying' && e.live) return deny(s, 'BUSY', `Preview ${p.id} is being applied right now.`)
      if (p.state !== 'pending') return deny(s, 'INTERRUPTED', `An apply of preview ${p.id} was interrupted (a reload or a failure inside the plugin); it is never resumed. Check the files, then /ast-grep discard.`)
      if (e.epoch !== s.epoch || p.epoch !== s.epoch) {
        const d = drop(s, 'revoked by /ast-grep off')
        return deny(d.record, 'REVOKED', `Preview ${p.id} was revoked by /ast-grep off and dropped. Preview again.`, d.actions)
      }
      if (!isActive(config, s)) return deny(s, 'OFF', 'ast-grep is off for this session (/ast-grep on turns it back on).')
      if (!sameWhere(p, e.where)) {
        const d = drop(s, 'another conversation or directory')
        return deny(d.record, 'SESSION_CHANGED', `Preview ${p.id} belongs to another conversation or directory; it was dropped.`, d.actions)
      }
      if (e.now >= p.expiresAt) {
        const d = drop(s, 'expired')
        return deny(d.record, 'EXPIRED', `Preview ${p.id} expired (previews last 15 minutes); it was dropped. Preview again.`, d.actions)
      }
      return { record: { ...s, preview: { ...p, state: 'applying', runId: e.runId } }, actions: [{ kind: 'applying' }] }
    }
    case 'writeAuthorized': {
      const p = ownRun(s, e.id, e.runId)
      if (!p) return deny(s, 'SESSION_CHANGED', 'the apply lost its preview (cleared, discarded or the conversation changed) before this write')
      if (p.epoch !== s.epoch) return deny(s, 'REVOKED', 'ast-grep was turned off during the apply')
      if (!isActive(config, s)) return deny(s, 'OFF', 'ast-grep is off for this session')
      if (!sameWhere(p, e.where)) return deny(s, 'SESSION_CHANGED', `the conversation or its directory changed (${p.root} -> ${e.where.root}) before this write`)
      const files = p.files.map((f, k) => (k === e.index ? { ...f, status: 'writing' as const } : f))
      return { record: { ...s, preview: { ...p, files } }, actions: [{ kind: 'authorized' }] }
    }
    case 'writeResult': {
      const p = ownRun(s, e.id, e.runId)
      if (!p) return { record: s, actions: [] }
      const files = p.files.map((f, k) => {
        if (k !== e.index) return f
        const { note: _old, ...rest } = f
        return e.note ? { ...rest, status: e.status, note: e.note } : { ...rest, status: e.status }
      })
      return { record: { ...s, preview: { ...p, files } }, actions: [{ kind: 'recorded' }] }
    }
    case 'applyEnd': {
      const p = ownRun(s, e.id, e.runId)
      if (!p) return { record: s, actions: [] }
      if (e.retain && current(s, p, config)) {
        const files = p.files.map(f => {
          const { note: _n, ...rest } = f
          return { ...rest, status: 'unstarted' as const }
        })
        return { record: { ...s, last: e.summary, preview: { ...p, state: 'pending', runId: null, files } }, actions: [{ kind: 'kept' }] }
      }
      return drop(s, e.retain ? 'revoked by /ast-grep off during the apply' : 'used', e.summary)
    }
    case 'off': {
      const next = { ...s, mode: 'off' as const, epoch: s.epoch + 1 }
      const p = s.preview
      // A running apply keeps its record so it can report; it has lost authority (epoch) and ends dropped.
      if (p && p.state === 'applying' && e.live) return { record: next, actions: [] }
      return drop(next, 'turned off')
    }
    case 'on':
      return { record: { ...s, mode: 'on' }, actions: [] }
    case 'clear':
      return { record: { ...INITIAL, mode: s.mode, epoch: s.epoch + 1 }, actions: [] }
    case 'discard': {
      const p = s.preview
      if (!p || (e.id !== null && p.id !== e.id)) return deny(s, 'UNKNOWN_PREVIEW', `No preview ${e.id ?? ''} is pending.`.replace('  ', ' '))
      if (p.state === 'applying' && e.live) return deny(s, 'BUSY', `Preview ${p.id} is being applied right now.`)
      return { record: { ...s, preview: null }, actions: [{ kind: 'discarded' }] }
    }
    case 'expire': {
      const p = s.preview
      return p && dead(s, p, e.now) ? drop(s, p.epoch !== s.epoch ? 'revoked' : 'expired') : { record: s, actions: [] }
    }
    case 'reload': {
      const p = s.preview
      if (!p || p.state !== 'applying') return { record: s, actions: [] }
      return { record: { ...s, preview: { ...p, state: 'interrupted' } }, actions: [{ kind: 'interrupted' }] }
    }
  }
}
