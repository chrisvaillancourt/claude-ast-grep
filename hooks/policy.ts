// Pure decisions and text: options, bounds, tool input checks, the /ast-grep
// command, status, results. No `$`, no I/O; register.ts wires them to events.
import type { CliMatch } from './cli'
import type { Config, Mode, Preview, Session } from '../types'

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
export function formatSearch(matches: readonly CliMatch[], max: number): string {
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
      row.multi = Object.fromEntries(Object.entries(m.multi).map(([k, v]) => [k, v.slice(0, 50).map(x => clip(x, MAX_FIELD))]))
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
  if (note) out.note = note
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
