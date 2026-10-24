// The ast-grep CLI adapter, pure: the rule the mod generates, the argument
// vector, and the parser that turns one `$.process.run` result into matches or
// a coded error. Recorded outputs live in corpus.ts; cli.test.ts replays them.

/** The most stdout the mod accepts from one run (the engine's own cut is 4 MiB). */
export const MAX_STDOUT = 1024 * 1024

/** Excludes every path segment that starts with a dot. */
export const HIDDEN_GLOB = '!.*'

export type CliMatch = {
  /** As ast-grep printed it: relative to the run's directory, or `STDIN`. */
  file: string
  /** UTF-8 byte offsets of the match in the file. */
  start: number
  end: number
  /** 1-based line, and 1-based column in characters, of the match's start. */
  line: number
  column: number
  text: string
  /** The whole source lines the match spans. */
  lines: string
  captures: Record<string, string>
  multi: Record<string, string[]>
  /** Rewrite runs only: the replacement text and the UTF-8 byte range it replaces. */
  replacement?: string
  rStart?: number
  rEnd?: number
}

export type CliError = { ok: false; code: 'INVALID_RULE' | 'UNSUPPORTED_LANGUAGE' | 'CLI_ERROR' | 'CLI_OUTPUT'; message: string }
export type ScanResult = { ok: true; matches: CliMatch[] } | CliError

export type RunResult = {
  exitCode: number
  stdout: string
  stderr: string
  isStdoutTruncated: boolean
  isStderrTruncated: boolean
}

/** The inline rule: one pattern in one language, with the rewrite as `fix` when there is one. */
export function ruleText(q: { pattern: string; language: string; fix?: string }): string {
  const rule: Record<string, unknown> = { id: 'mod', language: q.language, severity: 'hint', rule: { pattern: q.pattern } }
  if (q.fix !== undefined) rule.fix = q.fix
  return JSON.stringify(rule)
}

export type ScanTarget = { paths: readonly string[]; globs?: readonly string[] } | { stdin: true }

export function scanArgv(o: { binary: string; config: string; rule: string; maxResults: number } & ScanTarget): string[] {
  const argv = [
    o.binary, 'scan', '--inline-rules', o.rule, '--config', o.config, '--custom-languages', 'ignore',
    '--json=compact', '--max-results', String(o.maxResults), '--threads', '2', '--color', 'never',
  ]
  if ('stdin' in o) return [...argv, '--stdin']
  for (const g of o.globs ?? []) argv.push('--globs', g)
  // Hidden paths are excluded by ast-grep itself, before its result cap, and
  // after the caller's globs so a later glob can't bring them back. ast-grep
  // 0.51.0 still scans a hidden path named explicitly (checked live).
  argv.push('--globs', HIDDEN_GLOB)
  return [...argv, '--', ...o.paths]
}

const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g

function clip(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n)}… (${s.length - n} more characters)`
}

/** The "Caused by" chain of an ast-grep error, one line per cause. */
function causes(stderr: string): string[] {
  return stderr
    .split('\n')
    .map(l => l.replace(ANSI, ''))
    .filter(l => l.startsWith('╰▻'))
    .map(l => l.slice(2).trim())
    .filter(l => l !== '')
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function bad(message: string): CliError {
  return { ok: false, code: 'CLI_OUTPUT', message: `ast-grep's output was not in the expected shape: ${message}` }
}

function parseOne(raw: unknown, rewrite: boolean, i: number): CliMatch | string {
  if (!isObj(raw)) return `match ${i} is not an object`
  const { text, file, lines, range } = raw
  if (typeof text !== 'string' || typeof file !== 'string' || typeof lines !== 'string') return `match ${i} lacks text, file or lines`
  if (!isObj(range) || !isObj(range.byteOffset) || !isObj(range.start)) return `match ${i} lacks its range`
  const { start, end } = range.byteOffset
  const { line, column } = range.start
  if (!isInt(start) || !isInt(end) || end < start || !isInt(line) || !isInt(column)) return `match ${i} has a bad range`
  const captures: Record<string, string> = {}
  const multi: Record<string, string[]> = {}
  const mv = raw.metaVariables
  if (mv !== undefined) {
    if (!isObj(mv)) return `match ${i} has bad metaVariables`
    if (mv.single !== undefined) {
      if (!isObj(mv.single)) return `match ${i} has bad single metaVariables`
      for (const [k, v] of Object.entries(mv.single)) {
        if (!isObj(v) || typeof v.text !== 'string') return `match ${i} has a bad capture ${k}`
        captures[k] = v.text
      }
    }
    if (mv.multi !== undefined) {
      if (!isObj(mv.multi)) return `match ${i} has bad multi metaVariables`
      for (const [k, v] of Object.entries(mv.multi)) {
        if (!Array.isArray(v) || !v.every(n => isObj(n) && typeof n.text === 'string')) return `match ${i} has a bad capture ${k}`
        multi[k] = v.map(n => (n as { text: string }).text)
      }
    }
  }
  const match: CliMatch = { file, start, end, line: line + 1, column: column + 1, text, lines, captures, multi }
  if (rewrite) {
    const ro = raw.replacementOffsets
    if (typeof raw.replacement !== 'string' || !isObj(ro) || !isInt(ro.start) || !isInt(ro.end) || ro.end < ro.start) {
      return `match ${i} lacks its replacement or replacementOffsets`
    }
    match.replacement = raw.replacement
    match.rStart = ro.start
    match.rEnd = ro.end
  }
  return match
}

/**
 * One run's result as matches, sorted by file then offset, or a coded error.
 * Any stderr, a nonzero exit, a cut stream, output over MAX_STDOUT, malformed
 * JSON or a missing field is an error: never an empty success.
 */
export function parseScan(r: RunResult, o: { rewrite: boolean }): ScanResult {
  if (r.isStdoutTruncated || r.isStderrTruncated || r.stdout.length > MAX_STDOUT) {
    return { ok: false, code: 'CLI_OUTPUT', message: 'ast-grep printed more output than the mod accepts (1 MiB); narrow the paths or globs.' }
  }
  const stderr = r.stderr.replace(ANSI, '').trim()
  if (r.exitCode !== 0 || stderr !== '') {
    const why = causes(r.stderr)
    if (why.some(c => c.includes('SgLang'))) {
      return {
        ok: false,
        code: 'UNSUPPORTED_LANGUAGE',
        message: 'ast-grep has no built-in language by that name (see `ast-grep --help` or https://ast-grep.github.io/reference/languages.html).',
      }
    }
    if (stderr.includes('Cannot parse rule') && why.length > 0) {
      return { ok: false, code: 'INVALID_RULE', message: clip(`ast-grep rejected the pattern: ${why.join('; ')}`, 2000) }
    }
    const detail = stderr === '' ? `exit code ${r.exitCode}` : stderr
    return { ok: false, code: 'CLI_ERROR', message: clip(`ast-grep reported an error: ${detail}`, 2000) }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(r.stdout)
  } catch {
    return bad('not JSON')
  }
  if (!Array.isArray(parsed)) return bad('not a JSON array')
  const matches: CliMatch[] = []
  for (let i = 0; i < parsed.length; i++) {
    const one = parseOne(parsed[i], o.rewrite, i)
    if (typeof one === 'string') return bad(one)
    matches.push(one)
  }
  matches.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.start - b.start || a.end - b.end))
  return { ok: true, matches }
}

/** The version from `ast-grep --version` ("ast-grep 0.51.0"), or null. */
export function parseVersion(stdout: string): [number, number, number] | null {
  const m = /(\d+)\.(\d+)\.(\d+)/.exec(stdout)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

/** Whether a version is one the mod was checked against or newer (0.51.0 and up). */
export function isSupported(v: [number, number, number]): boolean {
  const [a, b] = v
  return a > 0 || b >= 51
}
