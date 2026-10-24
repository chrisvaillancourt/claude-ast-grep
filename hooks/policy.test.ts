import { describe, expect, test } from 'claude-code/testing'

import {
  INITIAL,
  MAX_SEARCH_JSON,
  configFrom,
  formatSearch,
  isActive,
  parseArgs,
  relativeTo,
  statusText,
  validatePreview,
  validatePreviewId,
  validateSearch,
} from './policy'
import { isSupported, parseVersion } from './cli'
import type { CliMatch } from './cli'

describe('options and command', () => {
  test('defaults and clamps', async () => {
    expect(configFrom({})).toEqual({ enabled: true, alwaysLoaded: false, binary: 'ast-grep', timeoutMs: 30000 })
    expect(configFrom({ timeoutSeconds: 1, binary: '  ', enabled: false })).toEqual({ enabled: false, alwaysLoaded: false, binary: 'ast-grep', timeoutMs: 5000 })
    expect(configFrom({ timeoutSeconds: 9999, binary: '/opt/bin/ast-grep' }).timeoutMs).toBe(300000)
  })

  test('parseArgs reads status, on, off, discard and rejects the rest', async () => {
    expect(parseArgs('')).toEqual({ kind: 'status' })
    expect(parseArgs(' ON ')).toEqual({ kind: 'set', mode: 'on' })
    expect(parseArgs('off')).toEqual({ kind: 'set', mode: 'off' })
    expect(parseArgs('discard')).toEqual({ kind: 'discard' })
    expect(parseArgs('bogus')).toEqual({ kind: 'help', error: 'Unknown argument: bogus' })
  })

  test('a session override beats the enabled option', async () => {
    expect(isActive(configFrom({}), INITIAL)).toBe(true)
    expect(isActive(configFrom({ enabled: false }), INITIAL)).toBe(false)
    expect(isActive(configFrom({ enabled: false }), { ...INITIAL, mode: 'on' })).toBe(true)
  })

  test('status names the state, the version and the pending preview', async () => {
    const preview = {
      id: 'p1', sessionId: 's', root: '/r', createdAt: 0, expiresAt: 10 * 60_000, pattern: 'foo($A)', rewrite: 'bar($A)', language: 'ts',
      replacements: 3, files: [], state: 'pending' as const, runId: null,
    }
    const text = statusText(configFrom({}), { ...INITIAL, preview, last: 'applied p0: 1 written' }, 60_000, 'ast-grep 0.51.0')
    expect(text).toBe(
      'on (from the enabled option); ast-grep 0.51.0.\n' +
      'Pending preview p1: 3 replacements in 0 files, expires in 9 min.\n' +
      'Last apply: applied p0: 1 written',
    )
  })

  test('versions: 0.51.0 and newer are supported', async () => {
    expect(parseVersion('ast-grep 0.51.0\n')).toEqual([0, 51, 0])
    expect(parseVersion('nope')).toBeNull()
    expect(isSupported([0, 51, 0])).toBe(true)
    expect(isSupported([0, 52, 3])).toBe(true)
    expect(isSupported([0, 50, 9])).toBe(false)
  })
})

describe('tool input', () => {
  test('search: defaults, and every field checked', async () => {
    expect(validateSearch({ pattern: 'foo($A)', language: 'ts' })).toEqual({
      ok: true, value: { pattern: 'foo($A)', language: 'ts', paths: ['.'], globs: [], maxResults: 50 },
    })
    const bad = (input: Record<string, unknown>) => {
      const r = validateSearch(input)
      return r.ok ? 'ok' : r.error
    }
    expect(bad({ pattern: '  ', language: 'ts' })).toBe('pattern is empty')
    expect(bad({ pattern: 'x'.repeat(16 * 1024 + 1), language: 'ts' })).toBe('pattern is longer than 16 KiB')
    expect(bad({ pattern: 'x', language: 'ts; rm' })).toBe('language must be a language name such as typescript, python or rust')
    expect(bad({ pattern: 'x', language: 'ts', paths: [] })).toBe('paths must hold 1 to 16 paths')
    expect(bad({ pattern: 'x', language: 'ts', paths: ['a\u0000b'] })).toBe('paths[0] is not a usable path')
    expect(bad({ pattern: 'x', language: 'ts', globs: Array(17).fill('*') })).toBe('globs must hold at most 16 globs')
    expect(bad({ pattern: 'x', language: 'ts', maxResults: 201 })).toBe('maxResults must be an integer from 1 to 200')
    expect(bad({ pattern: 'x', language: 'ts', maxResults: 2.5 })).toBe('maxResults must be an integer from 1 to 200')
  })

  test('preview: paths required, rewrite may be empty', async () => {
    expect(validatePreview({ pattern: 'foo($A)', rewrite: '', language: 'ts', paths: ['src'] })).toEqual({
      ok: true, value: { pattern: 'foo($A)', rewrite: '', language: 'ts', paths: ['src'], globs: [] },
    })
    const r = validatePreview({ pattern: 'foo($A)', language: 'ts', paths: ['src'] })
    expect(r.ok ? 'ok' : r.error).toBe('rewrite must be a string (empty deletes each match)')
    const p = validatePreview({ pattern: 'foo($A)', rewrite: 'x', language: 'ts' })
    expect(p.ok ? 'ok' : p.error).toBe('paths must hold 1 to 16 paths')
  })

  test('preview ids', async () => {
    expect(validatePreviewId({ previewId: 'ag-1a2b' })).toEqual({ ok: true, value: 'ag-1a2b' })
    const r = validatePreviewId({ previewId: '../x' })
    expect(r.ok ? 'ok' : r.error).toBe('previewId must be the id a preview returned')
  })
})

describe('paths', () => {
  test('relativeTo keeps paths inside the root only', async () => {
    expect(relativeTo('/r/p', '/r/p')).toBe('.')
    expect(relativeTo('/r/p', '/r/p/src/a.ts')).toBe('src/a.ts')
    expect(relativeTo('/r/p', '/r/pp/a.ts')).toBeNull()
    expect(relativeTo('/r/p', '/r')).toBeNull()
    expect(relativeTo('/', '/a')).toBe('a')
  })
})

describe('formatSearch', () => {
  const match = (i: number, text = `foo(${i})`): CliMatch => ({
    file: 'src/a.ts', start: i * 10, end: i * 10 + 6, line: i + 1, column: 1, text, lines: text, captures: { A: String(i) }, multi: {},
  })

  test('matches with positions and captures; truncated when there were more', async () => {
    const out = JSON.parse(formatSearch([match(0), match(1), match(2)], 2))
    expect(out).toEqual({
      status: 'ok',
      matches: [
        { file: 'src/a.ts', line: 1, column: 1, text: 'foo(0)', lines: 'foo(0)', captures: { A: '0' } },
        { file: 'src/a.ts', line: 2, column: 1, text: 'foo(1)', lines: 'foo(1)', captures: { A: '1' } },
      ],
      count: 2,
      truncated: true,
      note: 'More than 2 matches; narrow paths or globs, or raise maxResults (at most 200).',
    })
  })

  test('none is an explicit empty result', async () => {
    expect(JSON.parse(formatSearch([], 50))).toEqual({ status: 'ok', matches: [], count: 0, truncated: false, note: 'No matches.' })
  })

  test('long text is cut and marked; the whole result stays under its byte budget', async () => {
    const long = 'x'.repeat(5000)
    const many = Array.from({ length: 200 }, (_, i) => match(i, long))
    const text = formatSearch(many, 200)
    expect(new TextEncoder().encode(text).length).toBeLessThanOrEqual(MAX_SEARCH_JSON)
    const out = JSON.parse(text)
    expect(out.truncated).toBe(true)
    expect(out.matches[0].text).toBe('x'.repeat(400) + '… (4600 more characters)')
    expect(out.count).toBe(out.matches.length)
  })
})
