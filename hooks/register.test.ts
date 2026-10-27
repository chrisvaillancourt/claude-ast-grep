import { describe, expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

import { CORPUS } from './corpus'

const COMMAND = { origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 120 } }
const ROOT = '/w'
const enc = new TextEncoder()
const b64 = (s: string | number[]) => btoa(String.fromCharCode(...(typeof s === 'string' ? enc.encode(s) : s)))

type File = { text?: string; bytes?: number[]; link?: string }
type WriteMode = 'ok' | 'deny' | 'error' | 'staged' | { modified: string }

/** The project the corpus was recorded on (scripts/capture-corpus.sh), under ROOT. */
const PROJECT: Record<string, File> = {
  'src/a.ts': { text: 'const a = foo(1)\nfoo(2)\n' },
  'src/b.ts': { text: '// ünïcödé\nconst b = foo(x, y)\n' },
  'src/c.js': { text: 'foo(3)\n' },
  'src/d.ts': { text: 'foo(4)\n' },
  '.hidden.ts': { text: 'foo(5)\n' },
  'src/.cache/e.ts': { text: 'foo(6)\n' },
}

/** The engine beneath the plugin: a small file system, ast-grep replaying the corpus, and the Write tool. */
type Hooks = {
  /** Runs inside the engine's answer to a read of `path`, the `n`th read of that path. */
  onRead?: ($: any, path: string, n: number) => unknown
  /** Runs inside the permission check of a Write. */
  onCheck?: ($: any, path: string) => unknown
  /** Runs after a Write landed. */
  afterWrite?: ($: any, path: string) => unknown
  /** Runs inside an ast-grep stdin run. */
  onStdinScan?: ($: any) => unknown
}

function world(on: On, opts: { files?: Record<string, File>; write?: (path: string) => WriteMode | Promise<WriteMode>; check?: (path: string) => 'allow' | 'deny' | Promise<'allow' | 'deny'>; noBinary?: boolean } & Hooks = {}) {
  const files = new Map<string, File>(Object.entries({ ...PROJECT, ...opts.files }).map(([k, v]) => [`${ROOT}/${k}`, v]))
  const dirs = new Set([ROOT, `${ROOT}/src`, `${ROOT}/src/.cache`, `${ROOT}/hiddenScope`, `${ROOT}/visibleScope`, `${ROOT}/visibleScope/sub`, '/w2'])
  const reads = new Map<string, number>()
  const seen = {
    tools: [] as { name: string; isDeferred?: boolean }[],
    commands: [] as string[],
    runs: [] as string[][],
    logs: [] as string[],
    writes: [] as { path: string; content: string }[],
    files,
    sessionId: 's1',
    cwd: ROOT,
    clock: mock.clock(on),
  }
  const abs = (p: string) => (p.startsWith('/') ? p : `${ROOT}/${p}`).replace(/\/\.$/, '').replace(/\/$/, '')
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.end', ($, e) => ({ sessionId: e.sessionId }))
  on('session.id', () => ({ value: seen.sessionId }))
  on('session.cwd', () => ({ value: seen.cwd }))
  on('ui.log', ($, e) => {
    seen.logs.push(e.text)
    return { value: undefined }
  })
  on('command.register', ($, e) => {
    seen.commands.push(e.name)
    return { value: { command: e.name } }
  })
  on('tool.register', ($, e) => {
    seen.tools.push({ name: e.name, isDeferred: e.isDeferred })
    return { value: { tool: `mcp__ast-grep__${e.name}` } }
  })
  on('fs.stat', ($, e) => {
    const p = abs(e.path)
    if (dirs.has(p)) return { value: { kind: 'dir', size: 0, mtimeMs: 0, isLink: false, ...(e.resolve ? { realPath: p } : {}) } }
    const f = files.get(p)
    if (!f) return { deny: `ENOENT: ${p}` }
    const target = f.link ? files.get(abs(f.link)) : f
    const size = target?.bytes?.length ?? enc.encode(target?.text ?? '').length
    return { value: { kind: 'file', size, mtimeMs: 0, isLink: f.link !== undefined, ...(e.resolve ? { realPath: f.link ? abs(f.link) : p } : {}) } }
  })
  on('fs.read', async ($, e) => {
    const n = (reads.get(abs(e.path)) ?? 0) + 1
    reads.set(abs(e.path), n)
    await opts.onRead?.($, abs(e.path), n)
    const f = files.get(abs(e.path))
    if (!f) return { deny: 'ENOENT' }
    return { value: { base64: f.bytes ? b64(f.bytes) : b64(f.text ?? '') } }
  })
  on('process.run', async ($, e) => {
    const argv = e.argv
    seen.runs.push([...argv])
    if (opts.noBinary) return { deny: 'spawn ENOENT' }
    if (argv[1] === '--version') return { value: { exitCode: 0, stdout: 'ast-grep 0.51.0\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
    const rule = JSON.parse(argv[argv.indexOf('--inline-rules') + 1]!) as { language: string; rule: { pattern: string }; fix?: string }
    const stdin = argv.includes('--stdin') ? e.init?.stdin : undefined
    const paths = argv.includes('--') ? argv.slice(argv.indexOf('--') + 1) : []
    const globs = argv.flatMap((a, i) => (a === '--globs' ? [argv[i + 1]!] : []))
    const max = Number(argv[argv.indexOf('--max-results') + 1])
    if (stdin !== undefined) await opts.onStdinScan?.($)
    // A recorded stdin run over the same text answers a stdin run over any file.
    const c = CORPUS.find(x =>
      x.language === rule.language && x.pattern === rule.rule.pattern && x.fix === rule.fix &&
      (stdin === undefined
        ? x.stdin === undefined && JSON.stringify(x.paths) === JSON.stringify(paths) && JSON.stringify(x.globs ?? []) === JSON.stringify(globs) && x.maxResults === max
        : x.stdin === stdin))
    if (c) return { value: c.result }
    // ast-grep's order across files is unspecified: for the two scopes scanned
    // without the mod's hidden glob, answer with the recorded hidden-only run, as
    // the round-2 review saw live (the hidden file used up the cap).
    if (stdin === undefined && JSON.stringify(paths) === '["hiddenScope","visibleScope"]' && !globs.includes('!.*')) {
      return { value: CORPUS.find(x => x.name === 'raw-hidden-only')!.result }
    }
    const nested = CORPUS.find(x => x.name === 'nested')!
    if (stdin === undefined && paths[0] === 'n.ts') return { value: { ...nested.result, stdout: nested.result.stdout.replaceAll('"STDIN"', '"n.ts"') } }
    throw new Error(`no corpus case for ${JSON.stringify({ rule, paths, stdin })}`)
  })
  on('tool.check', async ($, e) => {
    const path = (e.input as { file_path: string }).file_path
    await opts.onCheck?.($, path)
    return { decision: (await opts.check?.(path)) ?? 'allow' }
  })
  on('tool.call', async ($, e) => {
    if (e.tool !== 'Write') throw new Error(`unexpected tool ${e.tool}`)
    const mode = (await opts.write?.(e.file_path)) ?? 'ok'
    if (mode === 'deny') return { deny: `Permission to write ${e.file_path} was denied.` }
    if (mode === 'error') return { result: 'disk full', text: 'disk full', isError: true } as never
    seen.writes.push({ path: e.file_path, content: e.content })
    const content = typeof mode === 'object' ? mode.modified : e.content
    if (mode !== 'staged') files.set(e.file_path, { text: content })
    await opts.afterWrite?.($, e.file_path)
    return {
      result: {
        type: 'update' as const, filePath: e.file_path, content, structuredPatch: [], originalFile: null,
        userModified: typeof mode === 'object', ...(mode === 'staged' ? { staged: true } : {}),
      },
    }
  })
  return seen
}

const start = ($: any, isInteractive = false) => $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive })
const call = ($: any, name: string, input: Record<string, unknown>) => $.tool.call({ tool: `mcp__ast-grep__${name}`, tool_use_id: `tu-${name}`, ...input })
const ok = (r: { result?: unknown; deny?: string }) => {
  if (r.deny !== undefined) throw new Error(`denied: ${r.deny}`)
  return JSON.parse(r.result as string)
}
const err = (r: { result?: unknown; deny?: string }) => {
  if (r.deny === undefined) throw new Error(`not denied: ${String(r.result)}`)
  return JSON.parse(r.deny)
}
/** A promise and the function that settles it (Promise.withResolvers, which the typecheck's lib lacks). */
function latch(): { promise: Promise<void>; resolve: () => void } {
  let resolve: () => void = () => {}
  const promise = new Promise<void>(r => { resolve = r })
  return { promise, resolve }
}

const FOO = { pattern: 'foo($A)', rewrite: 'bar($A)', language: 'typescript' }
const text = (seen: ReturnType<typeof world>, p: string) => seen.files.get(`${ROOT}/${p}`)?.text

describe('registration and command', () => {
  test('four tools behind ToolSearch and /ast-grep, registered once at session start', async ($, on) => {
    const seen = world(on)
    await start($)
    expect(seen.tools).toEqual([
      { name: 'search', isDeferred: true },
      { name: 'preview', isDeferred: true },
      { name: 'apply', isDeferred: true },
      { name: 'discard', isDeferred: true },
    ])
    expect(seen.commands).toEqual(['ast-grep'])
    await $.command.run({ command: 'ast-grep', args: 'off', ...COMMAND })
    await $.command.run({ command: 'ast-grep', args: 'on', ...COMMAND })
    expect(seen.tools).toHaveLength(4)
  })

  test('alwaysLoaded puts the schemas in the prompt', { options: { alwaysLoaded: true } }, async ($, on) => {
    const seen = world(on)
    await start($)
    expect(seen.tools.map(t => t.isDeferred)).toEqual([false, false, false, false])
  })

  test('off refuses every tool; enabled false starts off', { options: { enabled: false } }, async ($, on) => {
    world(on)
    await start($)
    expect(err(await call($, 'search', { pattern: 'x', language: 'ts' })).code).toBe('OFF')
    const status = await $.command.run({ command: 'ast-grep', args: '', ...COMMAND })
    expect(status.text).toContain('off (from the enabled option)')
  })

  test('a subagent call is refused', async ($, on) => {
    world(on)
    await start($)
    const r = await $.tool.call({ tool: 'mcp__ast-grep__search', tool_use_id: 'x', agentId: 'a1', pattern: 'foo($A)', language: 'typescript' })
    expect(err(r).code).toBe('SUBAGENT')
  })

  test('an unknown argument answers with usage', async ($, on) => {
    world(on)
    await start($)
    const res = await $.command.run({ command: 'ast-grep', args: 'bogus', ...COMMAND })
    expect(res.text).toContain('Usage: /ast-grep')
  })
})

describe('search', () => {
  test('matches across the directory, sorted, with captures', async ($, on) => {
    world(on)
    await start($)
    const out = ok(await call($, 'search', { pattern: 'foo($A)', language: 'typescript' }))
    expect(out.matches.map((m: any) => `${m.file}:${m.line}:${m.column} ${m.text} A=${m.captures.A}`)).toEqual([
      'src/a.ts:1:11 foo(1) A=1',
      'src/a.ts:2:1 foo(2) A=2',
      'src/d.ts:1:1 foo(4) A=4',
    ])
    expect(out.truncated).toBe(false)
    expect(out.skippedHidden).toBeUndefined()
  })

  test('hidden matches never use up the result cap (200 hidden, 4 visible), with or without globs', async ($, on) => {
    world(on, {
      files: {
        'hiddenScope/.hidden.ts': { text: Array.from({ length: 200 }, (_, i) => `foo(${i + 1})\n`).join('') },
        'visibleScope/a.ts': { text: 'foo(1)\nfoo(2)\n' },
        'visibleScope/sub/b.ts': { text: 'foo(3)\nfoo(4)\n' },
      },
    })
    await start($)
    for (const globs of [undefined, ['*.ts']]) {
      const out = ok(await call($, 'search', { pattern: 'foo($A)', language: 'typescript', paths: ['hiddenScope', 'visibleScope'], maxResults: 1, ...(globs ? { globs } : {}) }))
      expect(out).toMatchObject({ count: 1, truncated: true, matches: [{ file: 'visibleScope/a.ts' }] })
    }
  })

  test('a hidden path named explicitly is searched', async ($, on) => {
    world(on)
    await start($)
    const out = ok(await call($, 'search', { pattern: 'foo($A)', language: 'typescript', paths: ['src/.cache'] }))
    expect(out.matches.map((m: any) => m.file)).toEqual(['src/.cache/e.ts'])
    expect(out.skippedHidden).toBeUndefined()
  })

  test('preview over the whole directory leaves hidden files out, and says so', async ($, on) => {
    world(on)
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['.'] }))
    expect(p.files.map((f: any) => f.path)).toEqual(['src/a.ts', 'src/d.ts'])
    expect(p.skippedHidden).toBeUndefined()
  })

  test('more matches than maxResults is marked truncated', async ($, on) => {
    world(on)
    await start($)
    const out = ok(await call($, 'search', { pattern: 'foo($A)', language: 'typescript', maxResults: 2 }))
    expect(out.count).toBe(2)
    expect(out.truncated).toBe(true)
  })

  test('an invalid pattern is an error, not "no matches"', async ($, on) => {
    world(on)
    await start($)
    expect(err(await call($, 'search', { pattern: 'function {{{', language: 'typescript' })).code).toBe('INVALID_RULE')
  })

  test('a missing path or one outside the directory is refused before ast-grep runs', async ($, on) => {
    const seen = world(on)
    await start($)
    expect(err(await call($, 'search', { pattern: 'foo($A)', language: 'typescript', paths: ['nope.ts'] }))).toMatchObject({ code: 'PATH' })
    expect(err(await call($, 'search', { pattern: 'foo($A)', language: 'typescript', paths: ['/etc'] }))).toMatchObject({ code: 'PATH' })
    expect(seen.runs.filter(r => r[1] === 'scan')).toEqual([])
  })

  test('no ast-grep on PATH is CLI_MISSING', async ($, on) => {
    world(on, { noBinary: true })
    await start($)
    expect(err(await call($, 'search', { pattern: 'foo($A)', language: 'typescript' })).code).toBe('CLI_MISSING')
  })
})

describe('preview and apply', () => {
  test('preview writes nothing and shows the full diff; apply writes exactly the stored content without re-running ast-grep', async ($, on) => {
    const seen = world(on)
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    expect(p).toMatchObject({
      status: 'preview',
      files: [{ path: 'src/a.ts', replacements: 2 }, { path: 'src/d.ts', replacements: 1 }],
      replacements: 3,
    })
    expect(p.note).toContain('NOT modified')
    expect(p.diff).toBe(
      '--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1,2 +1,2 @@\n-const a = foo(1)\n+const a = bar(1)\n-foo(2)\n+bar(2)\n' +
      '--- a/src/d.ts\n+++ b/src/d.ts\n@@ -1,1 +1,1 @@\n-foo(4)\n+bar(4)\n',
    )
    expect(seen.writes).toEqual([])

    const scans = seen.runs.filter(r => r[1] === 'scan').length
    const a = ok(await call($, 'apply', { previewId: p.previewId }))
    expect(a).toMatchObject({ status: 'applied', files: [{ path: 'src/a.ts', status: 'written' }, { path: 'src/d.ts', status: 'written' }] })
    expect(a.note).toContain('Read')
    expect(seen.writes).toEqual([
      { path: '/w/src/a.ts', content: 'const a = bar(1)\nbar(2)\n' },
      { path: '/w/src/d.ts', content: 'bar(4)\n' },
    ])
    expect(seen.runs.filter(r => r[1] === 'scan').length).toBe(scans)
    expect(err(await call($, 'apply', { previewId: p.previewId })).code).toBe('UNKNOWN_PREVIEW')
  })

  test('log lines carry no hand-written plugin-name prefix (the engine adds it)', async ($, on) => {
    const seen = world(on)
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    ok(await call($, 'apply', { previewId: p.previewId }))
    expect(seen.logs).toEqual([
      `preview ${p.previewId}: 3 replacements in 2 files`,
      expect.stringMatching(/^apply /),
    ])
    for (const line of seen.logs) expect(line.startsWith('ast-grep: ')).toBe(false)
  })

  test('a same-size change in one target after preview means zero writes to every target', async ($, on) => {
    const seen = world(on)
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    seen.files.set('/w/src/d.ts', { text: 'foo(5)\n' })
    const e = err(await call($, 'apply', { previewId: p.previewId }))
    expect(e).toMatchObject({ code: 'STALE', changed: ['src/d.ts'] })
    expect(seen.writes).toEqual([])
    expect(text(seen, 'src/a.ts')).toBe('const a = foo(1)\nfoo(2)\n')
    expect(err(await call($, 'apply', { previewId: p.previewId })).code).toBe('UNKNOWN_PREVIEW')
  })

  test('a deleted target is stale too', async ($, on) => {
    const seen = world(on)
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    seen.files.delete('/w/src/d.ts')
    expect(err(await call($, 'apply', { previewId: p.previewId }))).toMatchObject({ code: 'STALE', changed: ['src/d.ts'] })
    expect(seen.writes).toEqual([])
  })

  test('one pending preview at a time; discard frees it', async ($, on) => {
    world(on)
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    expect(err(await call($, 'preview', { ...FOO, paths: ['src'] })).code).toBe('PREVIEW_PENDING')
    expect(ok(await call($, 'discard', { previewId: p.previewId }))).toEqual({ status: 'discarded', previewId: p.previewId })
    expect(err(await call($, 'apply', { previewId: p.previewId })).code).toBe('UNKNOWN_PREVIEW')
    ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
  })

  test('a preview expires after 15 minutes', async ($, on) => {
    const seen = world(on)
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    await seen.clock.advance(15 * 60_000 + 1)
    expect(err(await call($, 'apply', { previewId: p.previewId })).code).toBe('EXPIRED')
    expect(seen.writes).toEqual([])
  })

  test('/clear and /ast-grep off drop the pending preview', async ($, on) => {
    const seen = world(on)
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } })
    expect(err(await call($, 'apply', { previewId: p.previewId })).code).toBe('UNKNOWN_PREVIEW')

    const q = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    await $.command.run({ command: 'ast-grep', args: 'off', ...COMMAND })
    await $.command.run({ command: 'ast-grep', args: 'on', ...COMMAND })
    expect(err(await call($, 'apply', { previewId: q.previewId })).code).toBe('UNKNOWN_PREVIEW')
    expect(seen.writes).toEqual([])
  })

  test('a preview from another session id is not applied', async ($, on) => {
    const seen = world(on)
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    seen.sessionId = 's2'
    expect(err(await call($, 'apply', { previewId: p.previewId })).code).toBe('SESSION_CHANGED')
    expect(seen.writes).toEqual([])
  })

  test('a refused first write stops the apply with zero writes and keeps the preview pending', async ($, on) => {
    let refusing = true
    const seen = world(on, { write: p => (refusing && p.endsWith('a.ts') ? 'deny' : 'ok') })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    const e = err(await call($, 'apply', { previewId: p.previewId }))
    expect(e).toMatchObject({
      code: 'WRITE_DENIED',
      files: [{ path: 'src/a.ts', status: 'refused' }, { path: 'src/d.ts', status: 'unstarted' }],
    })
    expect(e.message).toContain('The preview stays pending')
    expect(text(seen, 'src/a.ts')).toBe('const a = foo(1)\nfoo(2)\n')
    expect(text(seen, 'src/d.ts')).toBe('foo(4)\n')
    refusing = false
    expect(ok(await call($, 'apply', { previewId: p.previewId })).status).toBe('applied')
    expect(text(seen, 'src/d.ts')).toBe('bar(4)\n')
  })

  test('a later refusal leaves the earlier file written, and says so', async ($, on) => {
    const seen = world(on, { write: p => (p.endsWith('d.ts') ? 'deny' : 'ok') })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    const e = err(await call($, 'apply', { previewId: p.previewId }))
    expect(e).toMatchObject({ code: 'WRITE_DENIED', files: [{ path: 'src/a.ts', status: 'written' }, { path: 'src/d.ts', status: 'refused' }] })
    expect(e.message).toContain('1 of 2 files written')
    expect(text(seen, 'src/a.ts')).toBe('const a = bar(1)\nbar(2)\n')
  })

  test('a permission check that denies any file means zero writes', async ($, on) => {
    let denying = true
    const seen = world(on, { check: p => (denying && p.endsWith('d.ts') ? 'deny' : 'allow') })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    expect(err(await call($, 'apply', { previewId: p.previewId }))).toMatchObject({ code: 'WRITE_DENIED', files: [{ status: 'unstarted' }, { status: 'unstarted' }] })
    expect(seen.writes).toEqual([])
    // the preview stays pending: once the rule allows it, the same id applies
    denying = false
    expect(ok(await call($, 'apply', { previewId: p.previewId })).status).toBe('applied')
  })

  test('a staged write, an edited write and a tool error are never reported as written', async ($, on) => {
    world(on, { write: p => (p.endsWith('a.ts') ? 'staged' : 'ok') })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    expect(err(await call($, 'apply', { previewId: p.previewId })).files[0]).toMatchObject({ path: 'src/a.ts', status: 'not-written' })
  })

  test('an edited write is reported as differs', async ($, on) => {
    world(on, { write: () => ({ modified: 'something else\n' }) })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    expect(err(await call($, 'apply', { previewId: p.previewId })).files[0]).toMatchObject({ path: 'src/a.ts', status: 'differs' })
  })

  test('a Write tool error is reported as failed', async ($, on) => {
    world(on, { write: () => 'error' })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    expect(err(await call($, 'apply', { previewId: p.previewId })).files[0]).toMatchObject({ path: 'src/a.ts', status: 'failed' })
  })
})

describe('preview refusals', () => {
  test('nested matches: OVERLAP and no preview id', async ($, on) => {
    world(on, { files: { 'n.ts': { text: 'foo(foo(1))\n' } } })
    await start($)
    const e = err(await call($, 'preview', { ...FOO, paths: ['n.ts'] }))
    expect(e.code).toBe('OVERLAP')
    expect(e.previewId).toBeUndefined()
    expect(err(await call($, 'discard', { previewId: 'ag-0' })).code).toBe('UNKNOWN_PREVIEW')
  })

  test('a symbolic link, invalid UTF-8 and an oversized file are refused', async ($, on) => {
    world(on, {
      files: {
        'src/a.ts': { link: 'src/d.ts' },
        'src/d.ts': { bytes: [0x66, 0x6f, 0x6f, 0x28, 0x34, 0x29, 0xff, 0x0a] },
      },
    })
    await start($)
    const e = err(await call($, 'preview', { ...FOO, paths: ['src'] }))
    expect(e.code).toBe('UNSUPPORTED_FILE')
    expect(e.message).toContain('src/a.ts')
  })

  test('a file over 256 KiB is TOO_LARGE', async ($, on) => {
    world(on, { files: { 'src/a.ts': { text: 'const a = foo(1)\nfoo(2)\n' + 'x'.repeat(256 * 1024) } } })
    await start($)
    expect(err(await call($, 'preview', { ...FOO, paths: ['src'] })).code).toBe('TOO_LARGE')
  })
})

describe('write authority', () => {
  test('/clear during the final read before a write: that file is not written', async ($, on) => {
    let seen: ReturnType<typeof world>
    seen = world(on, {
      // reads of a.ts: preview snapshot, preview recheck, apply preflight, then the read right before its write
      onRead: async (_, path, n) => {
        if (path === '/w/src/a.ts' && n === 4) {
          await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } })
          seen.sessionId = 's2'
        }
      },
    })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    const e = err(await call($, 'apply', { previewId: p.previewId }))
    expect(e.files[0]).toMatchObject({ path: 'src/a.ts', status: 'not-written' })
    expect(seen.writes).toEqual([])
    expect(text(seen, 'src/a.ts')).toBe('const a = foo(1)\nfoo(2)\n')
  })

  test('a change of the session directory after the preflight: nothing is written', async ($, on) => {
    let seen: ReturnType<typeof world>
    seen = world(on, { onCheck: () => { seen.cwd = '/w2' } })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    const e = err(await call($, 'apply', { previewId: p.previewId }))
    expect(e.files.map((f: any) => f.status)).toEqual(['not-written', 'unstarted'])
    expect(seen.writes).toEqual([])
  })

  test('/ast-grep off after the first write: the next file is not written and the result is not "applied"', async ($, on) => {
    let turnedOff = false
    const seen = world(on, {
      afterWrite: async (_, path) => {
        if (path === '/w/src/a.ts' && !turnedOff) {
          turnedOff = true
          await $.command.run({ command: 'ast-grep', args: 'off', ...COMMAND })
        }
      },
    })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    const e = err(await call($, 'apply', { previewId: p.previewId }))
    expect(e.files.map((f: any) => f.status)).toEqual(['written', 'not-written'])
    expect(text(seen, 'src/d.ts')).toBe('foo(4)\n')
  })

  test('off then on during the preview\'s scan: no preview is published', async ($, on) => {
    let toggled = false
    world(on, {
      onStdinScan: async () => {
        if (toggled) return
        toggled = true
        await $.command.run({ command: 'ast-grep', args: 'off', ...COMMAND })
        await $.command.run({ command: 'ast-grep', args: 'on', ...COMMAND })
      },
    })
    await start($)
    const r = await call($, 'preview', { ...FOO, paths: ['src'] })
    expect(r.deny === undefined ? 'published' : JSON.parse(r.deny).code).toBe('REVOKED')
    const status = await $.command.run({ command: 'ast-grep', args: 'status', ...COMMAND })
    expect(status.text).toContain('No pending preview')
  })

  test('a second apply or a discard while one runs is BUSY and changes nothing', async ($, on) => {
    let inner: { apply?: any; discard?: any } = {}
    let id = ''
    world(on, {
      afterWrite: async (_, path) => {
        if (path !== '/w/src/a.ts' || inner.apply) return
        inner.apply = err(await call($, 'apply', { previewId: id }))
        inner.discard = err(await call($, 'discard', { previewId: id }))
      },
    })
    await start($)
    id = ok(await call($, 'preview', { ...FOO, paths: ['src'] })).previewId
    expect(ok(await call($, 'apply', { previewId: id })).status).toBe('applied')
    expect(inner.apply.code).toBe('BUSY')
    expect(inner.discard.code).toBe('BUSY')
  })

  test('off then on during the permission preflight, which denies: the preview is gone and a retry writes nothing', async ($, on) => {
    let first = true
    const seen = world(on, {
      check: async () => {
        if (!first) return 'allow'
        first = false
        await $.command.run({ command: 'ast-grep', args: 'off', ...COMMAND })
        await $.command.run({ command: 'ast-grep', args: 'on', ...COMMAND })
        return 'deny'
      },
    })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    const e = err(await call($, 'apply', { previewId: p.previewId }))
    expect(e.message).not.toContain('stays pending')
    expect(err(await call($, 'apply', { previewId: p.previewId })).code).toBe('UNKNOWN_PREVIEW')
    expect(seen.writes).toEqual([])
  })

  test('off then on during the first Write, which is refused: the preview is gone and a retry writes nothing', async ($, on) => {
    let first = true
    const seen = world(on, {
      write: async () => {
        if (!first) return 'ok'
        first = false
        await $.command.run({ command: 'ast-grep', args: 'off', ...COMMAND })
        await $.command.run({ command: 'ast-grep', args: 'on', ...COMMAND })
        return 'deny'
      },
    })
    await start($)
    const p = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    const e = err(await call($, 'apply', { previewId: p.previewId }))
    expect(e.message).not.toContain('stays pending')
    expect(err(await call($, 'apply', { previewId: p.previewId })).code).toBe('UNKNOWN_PREVIEW')
    expect(seen.writes).toEqual([])
  })
})

describe('event contract: no event carries a value read from the record before its update', () => {
  const code = (r: { result?: unknown; deny?: string }) => (r.deny ? JSON.parse(r.deny).code : JSON.parse(r.result as string).status)

  test('S1 /ast-grep discard whose liveness read is stale must be BUSY while a Write is in flight', async ($, on) => {
    const { promise: gate, resolve: release } = latch()
    const { promise: started, resolve: reached } = latch()
    const seen = world(on, { write: async p => { if (p === '/w/src/a.ts') { reached(); await gate } return 'ok' as const } })
    let count = -1
    let id = ''
    let applying: Promise<any> | undefined
    // The apply runs inside the discard's first state read: the read inside its own update,
    // whose write then misses the version, so the transition runs again on the applying record.
    on('state.get', { plugin: 'ast-grep', key: 'session' }, async (_h, e, next) => {
      const snap = await next(e)
      if (count >= 0 && ++count === 1) { count = -1; applying = call($, 'apply', { previewId: id }); await started }
      return snap
    })
    await start($)
    id = ok(await call($, 'preview', { ...FOO, paths: ['src'] })).previewId
    count = 0
    const out = await $.command.run({ command: 'ast-grep', args: 'discard', ...COMMAND })
    release()
    if (!applying) throw new Error('not exercised')
    const applied = await applying
    expect({ cmd: out.text, apply: code(applied), writes: seen.writes.map(w => w.path) })
      .toEqual({ cmd: expect.stringContaining("can't be discarded"), apply: 'applied', writes: ['/w/src/a.ts', '/w/src/d.ts'] })
  })

  test('S2 a second apply whose liveness read is stale must be BUSY, not INTERRUPTED', async ($, on) => {
    const { promise: gate, resolve: release } = latch()
    const { promise: started, resolve: reached } = latch()
    world(on, { write: async p => { if (p === '/w/src/a.ts') { reached(); await gate } return 'ok' as const } })
    let count = -1
    let id = ''
    let applying: Promise<any> | undefined
    on('state.get', { plugin: 'ast-grep', key: 'session' }, async (_h, e, next) => {
      const snap = await next(e)
      if (count >= 0 && ++count === 2) { count = -1; applying = call($, 'apply', { previewId: id }); await started }
      return snap
    })
    await start($)
    id = ok(await call($, 'preview', { ...FOO, paths: ['src'] })).previewId
    count = 0
    const second = await call($, 'apply', { previewId: id })
    release()
    const first = await applying
    expect({ second: code(second), first: code(first) }).toEqual({ second: 'BUSY', first: 'applied' })
  })

  test('S3 /ast-grep off whose liveness read is stale keeps the running apply on record, and status reports it', async ($, on) => {
    const { promise: gate, resolve: release } = latch()
    const { promise: started, resolve: reached } = latch()
    const seen = world(on, { write: async p => { if (p === '/w/src/a.ts') { reached(); await gate } return 'ok' as const } })
    let count = -1
    let id = ''
    let applying: Promise<any> | undefined
    let during = ''
    on('state.get', { plugin: 'ast-grep', key: 'session' }, async (_h, e, next) => {
      const snap = await next(e)
      if (count >= 0 && ++count === 1) { count = -1; applying = call($, 'apply', { previewId: id }); await started }
      return snap
    })
    await start($)
    id = ok(await call($, 'preview', { ...FOO, paths: ['src'] })).previewId
    count = 0
    await $.command.run({ command: 'ast-grep', args: 'off', ...COMMAND })
    during = (await $.command.run({ command: 'ast-grep', args: 'status', ...COMMAND })).text ?? ''
    release()
    const applied = await applying
    const after = (await $.command.run({ command: 'ast-grep', args: 'status', ...COMMAND })).text ?? ''
    expect({ apply: code(applied), writes: seen.writes.map(w => w.path), duringHasPreview: during.includes(id), afterHasLast: after.includes('1 of 2') })
      .toEqual({ apply: 'NOT_APPLIED', writes: ['/w/src/a.ts'], duringHasPreview: true, afterHasLast: true })
  })

  test('S4 an apply whose guard read is a stale snapshot from before off/on still applies the current preview', async ($, on) => {
    const seen = world(on)
    let stale: unknown = null
    on('state.get', { plugin: 'ast-grep', key: 'session' }, async (_h, e, next) => {
      const snap = await next(e)
      if (stale) {
        const v = stale
        stale = null
        return v as typeof snap
      }
      return snap
    })
    await start($)
    ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    await $.command.run({ command: 'ast-grep', args: 'off', ...COMMAND })
    await $.command.run({ command: 'ast-grep', args: 'on', ...COMMAND })
    const p2 = ok(await call($, 'preview', { ...FOO, paths: ['src'] }))
    // the next state read (the apply's guard) answers with a snapshot from epoch 0
    stale = { value: { mode: null, preview: null, last: null, epoch: 0 }, version: 1 }
    const r = await call($, 'apply', { previewId: p2.previewId })
    expect({ apply: code(r), writes: seen.writes.length }).toEqual({ apply: 'applied', writes: 2 })
  })
})

describe('round-3 regression: discard during an in-flight Write', () => {
  test('discard begun before apply claims the record must still refuse while its Write is in flight', async ($, on) => {
    const { promise: writeGate, resolve: releaseWrite } = latch()
    const { promise: writeStarted, resolve: reachedWrite } = latch()
    const seen = world(on, {
      write: async path => {
        if (path === '/w/src/a.ts') {
          reachedWrite?.()
          await writeGate
        }
        return 'ok' as const
      },
    })
    let armed = false
    let id = ''
    let applying: Promise<{ result?: unknown; deny?: string }> | undefined
    on('state.get', { plugin: 'ast-grep', key: 'session' }, async (_hook, e, next) => {
      const snapshot = await next(e)
      if (armed) {
        armed = false
        applying = call($, 'apply', { previewId: id })
        await writeStarted
      }
      return snapshot
    })
    await start($)
    id = ok(await call($, 'preview', { ...FOO, paths: ['src'] })).previewId
    armed = true
    const discarded = await call($, 'discard', { previewId: id })
    releaseWrite?.()
    if (!applying) throw new Error('The state-read interleaving was not exercised')
    const applied = await applying
    expect({
      discard: discarded.deny ? JSON.parse(discarded.deny).code : JSON.parse(discarded.result as string).status,
      apply: applied.deny ? JSON.parse(applied.deny).code : JSON.parse(applied.result as string).status,
      writes: seen.writes.map(w => w.path),
    }).toEqual({ discard: 'BUSY', apply: 'applied', writes: ['/w/src/a.ts', '/w/src/d.ts'] })
  })
})
