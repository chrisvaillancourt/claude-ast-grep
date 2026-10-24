import { describe, expect, test } from 'claude-code/testing'

import { CORPUS } from './corpus'
import { parseScan } from './cli'
import { decodeFile, planEdits, sha256Bytes, sha256Text, unifiedDiff } from './edit'

const b64 = (bytes: number[]) => btoa(String.fromCharCode(...bytes))
const utf8 = (s: string) => [...new TextEncoder().encode(s)]

/** Plans the recorded stdin run `name` over its own input, as preview does. */
function plan(name: string) {
  const c = CORPUS.find(x => x.name === name)!
  const r = parseScan(c.result, { rewrite: true })
  if (!r.ok) throw new Error(r.message)
  return { before: c.stdin!, result: planEdits(c.stdin!, r.matches) }
}

describe('decodeFile', () => {
  test('valid UTF-8 comes back as text, bytes untouched', async () => {
    expect(decodeFile(b64(utf8('é😀\r\nx')))).toEqual({ ok: true, text: 'é😀\r\nx', bytes: utf8('é😀\r\nx').length })
  })

  test('NUL, invalid UTF-8 and a byte-order mark are refused with a reason', async () => {
    expect(decodeFile(b64([0x61, 0x00, 0x62]))).toEqual({ ok: false, reason: 'holds a NUL byte (binary?)' })
    expect(decodeFile(b64([0x61, 0xc3]))).toEqual({ ok: false, reason: 'is not valid UTF-8' })
    expect(decodeFile(b64([0xc0, 0xaf]))).toEqual({ ok: false, reason: 'is not valid UTF-8' }) // overlong
    expect(decodeFile(b64([0xed, 0xa0, 0x80]))).toEqual({ ok: false, reason: 'is not valid UTF-8' }) // surrogate
    expect(decodeFile(b64([0xef, 0xbb, 0xbf, 0x61]))).toEqual({ ok: false, reason: 'starts with a byte-order mark' })
  })
})

describe('planEdits on recorded runs', () => {
  test('Unicode before the match: byte offsets land on the right characters', async () => {
    const { result } = plan('unicode')
    expect(result).toMatchObject({ ok: true, after: 'const s = "é😀"; bar(1)\n' })
  })

  test('CRLF is kept on every line', async () => {
    expect(plan('crlf').result).toMatchObject({ ok: true, after: 'bar(1)\r\nconst x = 2\r\nbar(3)\r\n' })
  })

  test('no final newline stays that way', async () => {
    expect(plan('no-final-newline').result).toMatchObject({ ok: true, after: 'const x = 1\nbar(2)' })
  })

  test('multiline replacements', async () => {
    expect(plan('multiline').result).toMatchObject({ ok: true, after: 'bar(\n  1,\n)\nbar(\n  2,\n)\n' })
  })

  test('an empty replacement deletes the match', async () => {
    expect(plan('empty-rewrite').result).toMatchObject({ ok: true, after: ';\nkeep();\n' })
  })

  test('nested matches overlap: refused', async () => {
    expect(plan('nested').result).toEqual({
      ok: false,
      code: 'OVERLAP',
      message: 'Two replacements overlap (bytes 0-11 and 4-10): the pattern matches inside its own match. Narrow the pattern so matches do not nest.',
    })
  })
})

describe('planEdits checks', () => {
  const rep = (start: number, end: number, text: string, replacement = 'X') =>
    ({ start, end, text, rStart: start, rEnd: end, replacement })

  test('an offset inside a multi-byte character is refused', async () => {
    const r = planEdits('é', [rep(1, 2, 'x')])
    expect(r.ok ? 'ok' : r.code).toBe('BAD_OFFSET')
  })

  test('an offset past the end is refused', async () => {
    const r = planEdits('ab', [rep(1, 5, 'b')])
    expect(r.ok ? 'ok' : r.code).toBe('BAD_OFFSET')
  })

  test('a match whose text differs from the snapshot is refused', async () => {
    const r = planEdits('abc', [rep(0, 1, 'z')])
    expect(r.ok ? 'ok' : r.code).toBe('SNAPSHOT_MISMATCH')
  })

  test('two insertions at the same place overlap', async () => {
    const r = planEdits('ab', [rep(1, 1, ''), rep(1, 1, '')])
    expect(r.ok ? 'ok' : r.code).toBe('OVERLAP')
  })

  test('adjacent replacements are fine', async () => {
    expect(planEdits('ab', [rep(0, 1, 'a', '1'), rep(1, 2, 'b', '2')])).toMatchObject({ ok: true, after: '12' })
  })
})

describe('unifiedDiff', () => {
  const diffOf = (before: string, reps: { start: number; end: number; text: string; replacement: string }[]) => {
    const r = planEdits(before, reps.map(x => ({ ...x, rStart: x.start, rEnd: x.end })))
    if (!r.ok) throw new Error(r.message)
    return unifiedDiff('src/x.ts', before, r.after, r.spans)
  }

  test('one changed line with context', async () => {
    const before = 'a\nb\nc\nfoo(1)\nd\ne\nf\ng\n'
    expect(diffOf(before, [{ start: 6, end: 12, text: 'foo(1)', replacement: 'bar(1)' }])).toBe(
      '--- a/src/x.ts\n+++ b/src/x.ts\n@@ -1,7 +1,7 @@\n a\n b\n c\n-foo(1)\n+bar(1)\n d\n e\n f\n',
    )
  })

  test('nearby changes share a hunk; unchanged lines between them stay context', async () => {
    const r = plan('crlf')
    if (!r.result.ok) throw new Error(r.result.message)
    expect(unifiedDiff('c.ts', r.before, r.result.after, r.result.spans)).toBe(
      '--- a/c.ts\n+++ b/c.ts\n@@ -1,3 +1,3 @@\n-foo(1)\r\n+bar(1)\r\n const x = 2\r\n-foo(3)\r\n+bar(3)\r\n',
    )
  })

  test('far apart changes get their own hunks, with line numbers shifted by earlier ones', async () => {
    const lines = Array.from({ length: 20 }, (_, i) => `l${i}`)
    lines[2] = 'foo(1)'
    lines[15] = 'foo(2)'
    const before = lines.join('\n') + '\n'
    const at = (s: string) => new TextEncoder().encode(before.slice(0, before.indexOf(s))).length
    const d = diffOf(before, [
      { start: at('foo(1)'), end: at('foo(1)') + 6, text: 'foo(1)', replacement: 'x\ny' },
      { start: at('foo(2)'), end: at('foo(2)') + 6, text: 'foo(2)', replacement: 'bar(2)' },
    ])
    expect(d).toBe(
      '--- a/src/x.ts\n+++ b/src/x.ts\n' +
      '@@ -1,6 +1,7 @@\n l0\n l1\n-foo(1)\n+x\n+y\n l3\n l4\n l5\n' +
      '@@ -13,7 +14,7 @@\n l12\n l13\n l14\n-foo(2)\n+bar(2)\n l16\n l17\n l18\n',
    )
  })

  test('a missing final newline is marked', async () => {
    const r = plan('no-final-newline')
    if (!r.result.ok) throw new Error(r.result.message)
    expect(unifiedDiff('n.ts', r.before, r.result.after, r.result.spans)).toBe(
      '--- a/n.ts\n+++ b/n.ts\n@@ -1,2 +1,2 @@\n const x = 1\n-foo(2)\n\\ No newline at end of file\n+bar(2)\n\\ No newline at end of file\n',
    )
  })

  test('a deleted newline joins the next line into the change', async () => {
    const before = 'a;\nb\n'
    // replace "a;\n" (bytes 0-3) with "a" : the file becomes "ab\n"
    expect(diffOf(before, [{ start: 0, end: 3, text: 'a;\n', replacement: 'a' }])).toBe(
      '--- a/src/x.ts\n+++ b/src/x.ts\n@@ -1,2 +1,1 @@\n-a;\n-b\n+ab\n',
    )
  })

  test('applying the diff gives the stored after text (multiline)', async () => {
    const r = plan('multiline')
    if (!r.result.ok) throw new Error(r.result.message)
    expect(unifiedDiff('m.ts', r.before, r.result.after, r.result.spans)).toBe(
      '--- a/m.ts\n+++ b/m.ts\n@@ -1,2 +1,6 @@\n-foo(1)\n+bar(\n+  1,\n+)\n-foo(2)\n+bar(\n+  2,\n+)\n',
    )
  })
})

describe('hashes', () => {
  test('SHA-256 of text equals SHA-256 of its UTF-8 bytes', async () => {
    const h = await sha256Text('é\r\n')
    expect(h).toBe(await sha256Bytes(new TextEncoder().encode('é\r\n')))
    expect(await sha256Text('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })
})
