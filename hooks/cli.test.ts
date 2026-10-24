import { describe, expect, test } from 'claude-code/testing'

import { CORPUS } from './corpus'
import { parseScan, ruleText, scanArgv } from './cli'
import type { CliMatch } from './cli'

const run = (name: string) => {
  const c = CORPUS.find(x => x.name === name)
  if (!c) throw new Error(`no corpus case ${name}`)
  return c
}

const m = (o: Partial<CliMatch> & Pick<CliMatch, 'file' | 'start' | 'end' | 'text'>): CliMatch => ({
  line: 1,
  column: 1,
  lines: o.text,
  captures: {},
  multi: {},
  ...o,
})

describe('rule and argv', () => {
  test('the rule is the JSON the corpus was recorded with', async () => {
    expect(ruleText({ pattern: 'foo($A)', language: 'typescript' }))
      .toBe('{"id":"mod","language":"typescript","severity":"hint","rule":{"pattern":"foo($A)"}}')
    expect(ruleText({ pattern: 'foo($A)', language: 'typescript', fix: '' }))
      .toBe('{"id":"mod","language":"typescript","severity":"hint","rule":{"pattern":"foo($A)"},"fix":""}')
  })

  test('scan over paths ends with -- and the paths; globs come before it', async () => {
    const rule = ruleText({ pattern: 'x', language: 'ts' })
    expect(scanArgv({ binary: 'ast-grep', config: '/p/assets/sgconfig.yml', rule, maxResults: 51, paths: ['-src', 'b'], globs: ['*.ts', '!x'] })).toEqual([
      'ast-grep', 'scan', '--inline-rules', rule, '--config', '/p/assets/sgconfig.yml', '--custom-languages', 'ignore',
      '--json=compact', '--max-results', '51', '--threads', '2', '--color', 'never',
      '--globs', '*.ts', '--globs', '!x', '--', '-src', 'b',
    ])
    expect(scanArgv({ binary: 'ast-grep', config: 'c', rule, maxResults: 3, stdin: true }).slice(-1)).toEqual(['--stdin'])
  })
})

// Every recorded output, with the exact result the parser must give.
describe('corpus', () => {
  test('search: sorted by file and offset, 1-based positions, captures', async () => {
    expect(parseScan(run('search-basic').result, { rewrite: false })).toEqual({
      ok: true,
      matches: [
        m({ file: 'src/a.ts', start: 10, end: 16, column: 11, text: 'foo(1)', lines: 'const a = foo(1)', captures: { A: '1' } }),
        m({ file: 'src/a.ts', start: 17, end: 23, line: 2, text: 'foo(2)', captures: { A: '2' } }),
        m({ file: 'src/d.ts', start: 0, end: 6, text: 'foo(4)', captures: { A: '4' } }),
      ],
    })
  })

  test('multi captures keep every node, separators included', async () => {
    const r = parseScan(run('search-multi').result, { rewrite: false })
    if (!r.ok) throw new Error(r.message)
    expect(r.matches.map(x => [x.file, x.text, x.multi])).toEqual([
      ['src/a.ts', 'foo(1)', { ARGS: ['1'] }],
      ['src/a.ts', 'foo(2)', { ARGS: ['2'] }],
      ['src/b.ts', 'foo(x, y)', { ARGS: ['x', ',', 'y'] }],
      ['src/d.ts', 'foo(4)', { ARGS: ['4'] }],
    ])
    // b.ts has a non-ASCII comment line before the match: offsets are bytes.
    expect(r.matches[2]).toMatchObject({ start: 25, end: 34, line: 2, column: 11 })
  })

  test('--max-results caps the output', async () => {
    const r = parseScan(run('search-max').result, { rewrite: false })
    expect(r.ok && r.matches.length).toBe(1)
  })

  test('no match is an empty success', async () => {
    expect(parseScan(run('no-match').result, { rewrite: false })).toEqual({ ok: true, matches: [] })
  })

  test('an invalid pattern is INVALID_RULE with the cause, never an empty result', async () => {
    expect(parseScan(run('invalid-pattern').result, { rewrite: false })).toEqual({
      ok: false,
      code: 'INVALID_RULE',
      message: 'ast-grep rejected the pattern: Rule must specify a set of AST kinds to match. Try adding `kind` rule.',
    })
  })

  test('a missing path exits 0 with [] and stderr: an error', async () => {
    expect(parseScan(run('missing-path').result, { rewrite: false })).toEqual({
      ok: false,
      code: 'CLI_ERROR',
      message: 'ast-grep reported an error: ERROR: nope.ts: No such file or directory (os error 2)',
    })
  })

  test('an unknown language is UNSUPPORTED_LANGUAGE', async () => {
    expect(parseScan(run('bad-language').result, { rewrite: false })).toEqual({
      ok: false,
      code: 'UNSUPPORTED_LANGUAGE',
      message: 'ast-grep has no built-in language by that name (see `ast-grep --help` or https://ast-grep.github.io/reference/languages.html).',
    })
  })

  test('rewrite: replacement and its byte offsets', async () => {
    expect(parseScan(run('discover').result, { rewrite: true })).toEqual({
      ok: true,
      matches: [
        m({ file: 'src/a.ts', start: 10, end: 16, column: 11, text: 'foo(1)', lines: 'const a = foo(1)', captures: { A: '1' }, replacement: 'bar(1)', rStart: 10, rEnd: 16 }),
        m({ file: 'src/a.ts', start: 17, end: 23, line: 2, text: 'foo(2)', captures: { A: '2' }, replacement: 'bar(2)', rStart: 17, rEnd: 23 }),
        m({ file: 'src/d.ts', start: 0, end: 6, text: 'foo(4)', captures: { A: '4' }, replacement: 'bar(4)', rStart: 0, rEnd: 6 }),
      ],
    })
  })

  test('stdin runs name the file STDIN; empty and multiline replacements stay exact', async () => {
    const empty = parseScan(run('empty-rewrite').result, { rewrite: true })
    expect(empty.ok && empty.matches.map(x => [x.file, x.replacement, x.rStart, x.rEnd])).toEqual([['STDIN', '', 0, 6]])
    const multi = parseScan(run('multiline').result, { rewrite: true })
    expect(multi.ok && multi.matches.map(x => x.replacement)).toEqual(['bar(\n  1,\n)', 'bar(\n  2,\n)'])
    const uni = parseScan(run('unicode').result, { rewrite: true })
    expect(uni.ok && uni.matches.map(x => [x.rStart, x.rEnd])).toEqual([[20, 26]])
  })

  test('nested matches both come back (the overlap is refused later, by the edit)', async () => {
    const r = parseScan(run('nested').result, { rewrite: true })
    expect(r.ok && r.matches.map(x => [x.rStart, x.rEnd])).toEqual([[0, 11], [4, 10]])
  })
})

describe('malformed output', () => {
  const ok = { exitCode: 0, stdout: '[]', stderr: '', isStdoutTruncated: false, isStderrTruncated: false }

  const rows = [
    ['truncated stdout', { ...ok, isStdoutTruncated: true }, 'CLI_OUTPUT'],
    ['truncated stderr', { ...ok, isStderrTruncated: true }, 'CLI_OUTPUT'],
    ['not JSON', { ...ok, stdout: '[{' }, 'CLI_OUTPUT'],
    ['not an array', { ...ok, stdout: '{}' }, 'CLI_OUTPUT'],
    ['a match without byte offsets', { ...ok, stdout: '[{"text":"x","file":"a","lines":"x","range":{}}]' }, 'CLI_OUTPUT'],
    ['nonzero exit with no stderr', { ...ok, exitCode: 2, stdout: '' }, 'CLI_ERROR'],
    ['a deprecation warning on stderr', { ...ok, stderr: 'warning: sg is deprecated' }, 'CLI_ERROR'],
    ['too much stdout', { ...ok, stdout: '[' + ' '.repeat(1024 * 1024) + ']' }, 'CLI_OUTPUT'],
  ] as const

  test('every malformed result is an error with its code', async () => {
    const got = rows.map(([name, result]) => {
      const r = parseScan(result, { rewrite: false })
      return [name, r.ok ? 'ok' : r.code]
    })
    expect(got).toEqual(rows.map(([name, , code]) => [name, code]))
  })

  test('a rewrite run whose match has no replacement is CLI_OUTPUT', async () => {
    const r = parseScan(run('search-basic').result, { rewrite: true })
    expect(r.ok ? 'ok' : r.code).toBe('CLI_OUTPUT')
  })
})
