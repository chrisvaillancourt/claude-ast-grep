// Pure byte work for previews: file decoding, UTF-8 byte offsets to string
// indices, applying replacements, the unified diff, SHA-256. ast-grep reports
// UTF-8 byte offsets; a JS string is indexed in UTF-16 units, so every offset
// goes through `charIndices` and nothing slices a string by a byte offset.

export type Decoded = { ok: true; text: string; bytes: number } | { ok: false; reason: string }

/** The bytes of `$.fs.read(path, { as: 'bytes' })`'s base64. */
export function base64Bytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

/** Strict UTF-8: no overlongs, no surrogates, nothing past U+10FFFF, no cut sequence. */
export function isUtf8(b: Uint8Array): boolean {
  let i = 0
  while (i < b.length) {
    const c = b[i]!
    if (c < 0x80) {
      i++
      continue
    }
    let n: number
    let min: number
    let cp: number
    if (c >= 0xc2 && c <= 0xdf) [n, min, cp] = [1, 0x80, c & 0x1f]
    else if (c >= 0xe0 && c <= 0xef) [n, min, cp] = [2, 0x800, c & 0x0f]
    else if (c >= 0xf0 && c <= 0xf4) [n, min, cp] = [3, 0x10000, c & 0x07]
    else return false
    for (let k = 1; k <= n; k++) {
      const d = b[i + k]
      if (d === undefined || (d & 0xc0) !== 0x80) return false
      cp = (cp << 6) | (d & 0x3f)
    }
    if (cp < min || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return false
    i += n + 1
  }
  return true
}

/** A file's bytes as text, or why the mod won't touch it. */
export function decodeFile(b64: string): Decoded {
  const bytes = base64Bytes(b64)
  if (bytes.includes(0)) return { ok: false, reason: 'holds a NUL byte (binary?)' }
  if (!isUtf8(bytes)) return { ok: false, reason: 'is not valid UTF-8' }
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return { ok: false, reason: 'starts with a byte-order mark' }
  return { ok: true, text: new TextDecoder().decode(bytes), bytes: bytes.length }
}

export function utf8Length(s: string): number {
  return new TextEncoder().encode(s).length
}

/**
 * The UTF-16 index of each UTF-8 byte offset in `text`, in one pass; null when
 * one is out of range or inside a character.
 */
export function charIndices(text: string, offsets: readonly number[]): Map<number, number> | null {
  const want = [...new Set(offsets)].sort((a, b) => a - b)
  const out = new Map<number, number>()
  let w = 0
  let byte = 0
  let i = 0
  while (w < want.length) {
    const target = want[w]!
    if (target === byte) {
      out.set(target, i)
      w++
      continue
    }
    if (target < byte || i >= text.length) return null
    const cp = text.codePointAt(i)!
    byte += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4
    i += cp > 0xffff ? 2 : 1
  }
  return out
}

/** A replacement as ast-grep reported it: the match and what replaces which bytes. */
export type Rep = { start: number; end: number; text: string; rStart?: number; rEnd?: number; replacement?: string }
/** A replacement in string indices of the before text. */
export type Span = { start: number; end: number; text: string }

export type Plan =
  | { ok: true; after: string; spans: Span[] }
  | { ok: false; code: 'OVERLAP' | 'BAD_OFFSET' | 'SNAPSHOT_MISMATCH'; message: string }

/**
 * The after text: each replacement applied by byte offset, from the end of the
 * file to the start. Refuses overlapping replacements, offsets that don't land
 * on a character, and a match whose text isn't what the snapshot holds there.
 */
export function planEdits(before: string, reps: readonly Rep[]): Plan {
  const sorted = [...reps].sort((a, b) => a.rStart! - b.rStart! || a.rEnd! - b.rEnd!)
  for (let k = 1; k < sorted.length; k++) {
    const p = sorted[k - 1]!
    const q = sorted[k]!
    if (q.rStart! < p.rEnd! || q.rStart === p.rStart) {
      return {
        ok: false,
        code: 'OVERLAP',
        message: `Two replacements overlap (bytes ${p.rStart}-${p.rEnd} and ${q.rStart}-${q.rEnd}): the pattern matches inside its own match. Narrow the pattern so matches do not nest.`,
      }
    }
  }
  const idx = charIndices(before, sorted.flatMap(r => [r.start, r.end, r.rStart!, r.rEnd!]))
  if (!idx) return { ok: false, code: 'BAD_OFFSET', message: 'ast-grep reported a byte offset outside the file or inside a character.' }
  const spans: Span[] = []
  for (const r of sorted) {
    if (before.slice(idx.get(r.start)!, idx.get(r.end)!) !== r.text) {
      return { ok: false, code: 'SNAPSHOT_MISMATCH', message: 'A match reported by ast-grep is not the text the file holds at that offset.' }
    }
    spans.push({ start: idx.get(r.rStart!)!, end: idx.get(r.rEnd!)!, text: r.replacement! })
  }
  let after = before
  for (let k = spans.length - 1; k >= 0; k--) {
    const s = spans[k]!
    after = after.slice(0, s.start) + s.text + after.slice(s.end)
  }
  return { ok: true, after, spans }
}

/** Lines with their terminators; no empty line after a final newline. */
function splitLines(s: string): string[] {
  return s.match(/[^\n]*\n|[^\n]+$/g) ?? []
}

function render(prefix: string, line: string): string {
  return line.endsWith('\n') ? `${prefix}${line}` : `${prefix}${line}\n\\ No newline at end of file\n`
}

const CONTEXT = 3

type Block = { first: number; last: number; added: string[] }

/**
 * The unified diff from `before` to `after`, given the spans that made it.
 * Exact: only lines a replacement touches are removed and added, every other
 * line is context, and applying it to `before` gives `after`.
 */
export function unifiedDiff(path: string, before: string, after: string, spans: readonly Span[]): string {
  const head = `--- a/${path}\n+++ b/${path}\n`
  const old = splitLines(before)
  if (old.length === 0) {
    const added = splitLines(after)
    return added.length === 0 ? head : `${head}@@ -0,0 +1,${added.length} @@\n${added.map(l => render('+', l)).join('')}`
  }
  const starts: number[] = []
  let at = 0
  for (const l of old) {
    starts.push(at)
    at += l.length
  }
  const lineOf = (pos: number) => {
    let lo = 0
    let hi = old.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid]! <= pos) lo = mid
      else hi = mid - 1
    }
    return lo
  }
  const endOf = (line: number) => starts[line]! + old[line]!.length

  // Blocks: runs of lines touched by spans, grown until the new text ends a line.
  const blocks: Block[] = []
  let k = 0
  while (k < spans.length) {
    const first = lineOf(spans[k]!.start)
    let last = lineOf(Math.max(spans[k]!.start, spans[k]!.end - 1))
    let j = k + 1
    for (;;) {
      while (j < spans.length && lineOf(spans[j]!.start) <= last) {
        last = Math.max(last, lineOf(Math.max(spans[j]!.start, spans[j]!.end - 1)))
        j++
      }
      let text = before.slice(starts[first]!, endOf(last))
      for (let q = j - 1; q >= k; q--) {
        const s = spans[q]!
        text = text.slice(0, s.start - starts[first]!) + s.text + text.slice(s.end - starts[first]!)
      }
      if (text !== '' && !text.endsWith('\n') && last < old.length - 1) {
        last++
        continue
      }
      blocks.push({ first, last, added: splitLines(text) })
      break
    }
    k = j
  }

  let out = head
  let delta = 0
  let b = 0
  while (b < blocks.length) {
    let e = b
    while (e + 1 < blocks.length && blocks[e + 1]!.first - blocks[e]!.last - 1 <= 2 * CONTEXT) e++
    const from = Math.max(0, blocks[b]!.first - CONTEXT)
    const to = Math.min(old.length - 1, blocks[e]!.last + CONTEXT)
    let body = ''
    let added = 0
    let removed = 0
    let line = from
    for (let q = b; q <= e; q++) {
      const blk = blocks[q]!
      for (; line < blk.first; line++) body += render(' ', old[line]!)
      for (; line <= blk.last; line++) body += render('-', old[line]!)
      for (const a of blk.added) body += render('+', a)
      removed += blk.last - blk.first + 1
      added += blk.added.length
    }
    for (; line <= to; line++) body += render(' ', old[line]!)
    const oldCount = to - from + 1
    const newCount = oldCount - removed + added
    const newStart = newCount === 0 ? from + delta : from + 1 + delta
    out += `@@ -${from + 1},${oldCount} +${newStart},${newCount} @@\n${body}`
    delta += newCount - oldCount
    b = e + 1
  }
  return out
}

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('')
}

export async function sha256Bytes(bytes: Uint8Array): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', bytes))
}

export async function sha256Text(text: string): Promise<string> {
  return sha256Bytes(new TextEncoder().encode(text))
}
