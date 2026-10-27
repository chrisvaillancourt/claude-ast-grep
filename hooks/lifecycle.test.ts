import { describe, expect, test } from 'claude-code/testing'

import { INITIAL, configFrom, transition } from './policy'
import type { LifeEvent } from './policy'
import type { Preview, Session } from '../types'

const CONFIG = configFrom({})
const W = { sessionId: 's1', root: '/w' }

const preview = (o: Partial<Preview> = {}): Preview => ({
  id: 'p1', sessionId: 's1', root: '/w', epoch: 1, createdAt: 0, expiresAt: 1000, pattern: 'foo($A)', rewrite: 'bar($A)',
  language: 'ts', replacements: 1,
  files: [{ path: 'a.ts', abs: '/w/a.ts', before: 'foo(1)', beforeHash: 'b', after: 'bar(1)', afterHash: 'a', replacements: 1, status: 'unstarted' }],
  state: 'pending', runId: null, ...o,
})

const STATES: Record<string, Session> = {
  none: { ...INITIAL, epoch: 1 },
  pending: { ...INITIAL, epoch: 1, preview: preview() },
  expired: { ...INITIAL, epoch: 1, preview: preview({ expiresAt: -1 }) },
  revoked: { ...INITIAL, epoch: 1, preview: preview({ epoch: 0 }) },
  applying: { ...INITIAL, epoch: 1, preview: preview({ state: 'applying', runId: 'r1' }) },
  interrupted: { ...INITIAL, epoch: 1, preview: preview({ state: 'interrupted', runId: 'r0' }) },
}

const EVENTS: Record<string, LifeEvent> = {
  publish: { type: 'publish', preview: preview({ id: 'p2', epoch: 1 }), epoch: 1, where: W, now: 0 },
  applyStart: { type: 'applyStart', id: 'p1', runId: 'r2', where: W, now: 0 },
  writeAuthorized: { type: 'writeAuthorized', id: 'p1', runId: 'r1', index: 0, where: W },
  writeResult: { type: 'writeResult', id: 'p1', runId: 'r1', index: 0, status: 'written' },
  applyEndRetain: { type: 'applyEnd', id: 'p1', runId: 'r1', retain: true, summary: 's' },
  applyEndDrop: { type: 'applyEnd', id: 'p1', runId: 'r1', retain: false, summary: 's' },
  off: { type: 'off' },
  on: { type: 'on' },
  clear: { type: 'clear' },
  discard: { type: 'discard', id: 'p1' },
  expire: { type: 'expire', now: 0 },
  reload: { type: 'reload' },
  restore: { type: 'restore', mode: 'off', interrupted: preview({ id: 'p9', state: 'interrupted', runId: null, epoch: 7 }) },
}

/** What a transition did, in one word each: the preview after it (`id:state`), and the action or denial. */
/** Liveness as `liveRuns` would answer it: run r1 (the `applying` state's) is alive; r0 (`interrupted`) is not. */
const LIVE = (runId: string) => runId === 'r1'
const DEAD = () => false

function outcome(s: Session, e: LifeEvent, isLive: (runId: string) => boolean = LIVE): string {
  const { record, actions } = transition(s, e, CONFIG, isLive)
  const p = record.preview ? `${record.preview.id}:${record.preview.state}` : 'none'
  const a = actions.map(x => (x.kind === 'denied' ? x.code : x.kind)).join('+') || '-'
  return `${p} ${a}`
}

// Every state × event pair: the preview after the event, and what the transition answered.
// `restore` changes only a record no event has touched yet (a new process); every state here has epoch 1.
const TABLE: Record<string, Record<string, string>> = {
  none: {
    publish: 'p2:pending published', applyStart: 'none UNKNOWN_PREVIEW', writeAuthorized: 'none SESSION_CHANGED',
    writeResult: 'none -', applyEndRetain: 'none -', applyEndDrop: 'none -', off: 'none -', on: 'none -',
    clear: 'none -', discard: 'none UNKNOWN_PREVIEW', expire: 'none -', reload: 'none -', restore: 'none -',
  },
  pending: {
    publish: 'p1:pending PREVIEW_PENDING', applyStart: 'p1:applying applying', writeAuthorized: 'p1:pending SESSION_CHANGED',
    writeResult: 'p1:pending -', applyEndRetain: 'p1:pending -', applyEndDrop: 'p1:pending -', off: 'none dropped',
    on: 'p1:pending -', clear: 'none -', discard: 'none discarded', expire: 'p1:pending -', reload: 'p1:pending -', restore: 'p1:pending -',
  },
  expired: {
    publish: 'p2:pending dropped+published', applyStart: 'none dropped+EXPIRED', writeAuthorized: 'p1:pending SESSION_CHANGED',
    writeResult: 'p1:pending -', applyEndRetain: 'p1:pending -', applyEndDrop: 'p1:pending -', off: 'none dropped',
    on: 'p1:pending -', clear: 'none -', discard: 'none discarded', expire: 'none dropped', reload: 'p1:pending -', restore: 'p1:pending -',
  },
  revoked: {
    publish: 'p2:pending dropped+published', applyStart: 'none dropped+REVOKED', writeAuthorized: 'p1:pending SESSION_CHANGED',
    writeResult: 'p1:pending -', applyEndRetain: 'p1:pending -', applyEndDrop: 'p1:pending -', off: 'none dropped',
    on: 'p1:pending -', clear: 'none -', discard: 'none discarded', expire: 'none dropped', reload: 'p1:pending -', restore: 'p1:pending -',
  },
  applying: {
    publish: 'p1:applying PREVIEW_PENDING', applyStart: 'p1:applying BUSY', writeAuthorized: 'p1:applying authorized',
    writeResult: 'p1:applying recorded', applyEndRetain: 'p1:pending kept', applyEndDrop: 'none dropped',
    off: 'p1:applying -', on: 'p1:applying -', clear: 'none -', discard: 'p1:applying BUSY', expire: 'p1:applying -',
    reload: 'p1:interrupted interrupted', restore: 'p1:applying -',
  },
  interrupted: {
    publish: 'p1:interrupted PREVIEW_PENDING', applyStart: 'p1:interrupted INTERRUPTED', writeAuthorized: 'p1:interrupted SESSION_CHANGED',
    writeResult: 'p1:interrupted -', applyEndRetain: 'p1:interrupted -', applyEndDrop: 'p1:interrupted -', off: 'none dropped',
    on: 'p1:interrupted -', clear: 'none -', discard: 'none discarded', expire: 'p1:interrupted -', reload: 'p1:interrupted -', restore: 'p1:interrupted -',
  },
}

describe('transition: every state × event', () => {
  for (const [state, row] of Object.entries(TABLE)) {
    test(`from ${state}`, async () => {
      const got = Object.fromEntries(Object.keys(EVENTS).map(ev => [ev, outcome(STATES[state]!, EVENTS[ev]!)]))
      expect(got).toEqual(row)
    })
  }
})

describe('transition: epochs and authority', () => {
  test('off bumps the epoch; on keeps it; clear starts a new epoch with no preview', async () => {
    expect(transition(STATES.pending!, EVENTS.off!, CONFIG, LIVE).record).toMatchObject({ mode: 'off', epoch: 2, preview: null })
    expect(transition({ ...STATES.none!, mode: 'off', epoch: 2 }, EVENTS.on!, CONFIG, LIVE).record).toMatchObject({ mode: 'on', epoch: 2 })
    expect(transition(STATES.applying!, EVENTS.clear!, CONFIG, LIVE).record).toMatchObject({ epoch: 2, preview: null })
  })

  test('off while an apply runs, then on: the run is never authorized again and its refusal does not restore the preview', async () => {
    let s = transition(STATES.applying!, EVENTS.off!, CONFIG, LIVE).record
    s = transition(s, EVENTS.on!, CONFIG, LIVE).record
    expect(outcome(s, EVENTS.writeAuthorized!)).toBe('p1:applying REVOKED')
    expect(outcome(s, EVENTS.applyEndRetain!)).toBe('none dropped')
    const after = transition(s, EVENTS.applyEndRetain!, CONFIG, LIVE).record
    expect(outcome(after, EVENTS.applyStart!)).toBe('none UNKNOWN_PREVIEW')
  })

  test('a publish begun in an older epoch is refused; applyStart takes no caller epoch, the preview\'s own decides', async () => {
    expect(outcome(STATES.none!, { ...(EVENTS.publish as Extract<LifeEvent, { type: 'publish' }>), epoch: 0 })).toBe('none REVOKED')
    // a caller that read a stale epoch can't revoke a current preview: applyStart carries none
    expect(outcome(STATES.pending!, EVENTS.applyStart!)).toBe('p1:applying applying')
    expect(outcome(STATES.revoked!, EVENTS.applyStart!)).toBe('none dropped+REVOKED')
  })

  test('off as the session state refuses publish and writes', async () => {
    const off = { ...STATES.applying!, mode: 'off' as const }
    expect(outcome(off, EVENTS.writeAuthorized!)).toBe('p1:applying OFF')
    expect(outcome({ ...STATES.none!, mode: 'off' }, EVENTS.publish!)).toBe('none OFF')
  })

  test('a different session or root refuses and the preview is not adopted', async () => {
    const other = { sessionId: 's2', root: '/w' }
    expect(outcome(STATES.applying!, { ...(EVENTS.writeAuthorized as Extract<LifeEvent, { type: 'writeAuthorized' }>), where: other })).toBe('p1:applying SESSION_CHANGED')
    expect(outcome(STATES.pending!, { ...(EVENTS.applyStart as Extract<LifeEvent, { type: 'applyStart' }>), where: { sessionId: 's1', root: '/x' } })).toBe('none dropped+SESSION_CHANGED')
  })

  test('liveness is judged inside the transition from the record\'s own run id', async () => {
    // applying, its run alive: busy for applyStart and discard, off keeps the record
    expect(outcome(STATES.applying!, EVENTS.applyStart!, LIVE)).toBe('p1:applying BUSY')
    expect(outcome(STATES.applying!, EVENTS.discard!, LIVE)).toBe('p1:applying BUSY')
    expect(outcome(STATES.applying!, EVENTS.off!, LIVE)).toBe('p1:applying -')
    // applying, its run dead (this copy of the module never started it): interrupted, discard allowed, off drops it
    expect(outcome(STATES.applying!, EVENTS.applyStart!, DEAD)).toBe('p1:applying INTERRUPTED')
    expect(outcome(STATES.applying!, EVENTS.discard!, DEAD)).toBe('none discarded')
    expect(outcome(STATES.applying!, EVENTS.off!, DEAD)).toBe('none dropped')
    // the predicate is asked about the record's run id, not anything the caller passed
    const asked: string[] = []
    transition(STATES.applying!, EVENTS.discard!, CONFIG, r => (asked.push(r), true))
    expect(asked).toEqual(['r1'])
  })

  test('the discard action carries the preview it removed, so reports come from the record the update decided on', async () => {
    const { actions } = transition(STATES.interrupted!, EVENTS.discard!, CONFIG, DEAD)
    expect(actions).toEqual([{ kind: 'discarded', preview: STATES.interrupted!.preview }])
  })

  test('restore fills a new process\'s initial record: the interrupted apply and the override, nothing else', async () => {
    const e = EVENTS.restore as Extract<LifeEvent, { type: 'restore' }>
    const { record, actions } = transition(INITIAL, e, CONFIG, DEAD)
    expect(actions).toEqual([{ kind: 'restored' }])
    expect(record).toEqual({ ...INITIAL, mode: 'off', preview: { ...e.interrupted!, state: 'interrupted', runId: null, epoch: 0 } })
    // nothing to restore, or a record this process already wrote (a hot reload): unchanged
    expect(transition(INITIAL, { type: 'restore', mode: null, interrupted: null }, CONFIG, DEAD)).toEqual({ record: INITIAL, actions: [] })
    expect(transition({ ...INITIAL, last: 'x' }, e, CONFIG, DEAD).actions).toEqual([])
    expect(transition({ ...INITIAL, mode: 'on' }, e, CONFIG, DEAD).actions).toEqual([])
    // the restored apply is never resumed
    expect(outcome(record, { ...(EVENTS.applyStart as Extract<LifeEvent, { type: 'applyStart' }>), id: 'p9' }, DEAD)).toBe('p9:interrupted INTERRUPTED')
  })

  test('writeAuthorized marks the file writing; writeResult records the outcome', async () => {
    const a = transition(STATES.applying!, EVENTS.writeAuthorized!, CONFIG, LIVE).record
    expect(a.preview!.files[0]!.status).toBe('writing')
    const b = transition(a, { type: 'writeResult', id: 'p1', runId: 'r1', index: 0, status: 'refused', note: 'no' }, CONFIG, LIVE).record
    expect(b.preview!.files[0]).toMatchObject({ status: 'refused', note: 'no' })
    const kept = transition(b, EVENTS.applyEndRetain!, CONFIG, LIVE).record
    expect(kept.preview).toMatchObject({ state: 'pending', runId: null })
    expect(kept.preview!.files[0]!.status).toBe('unstarted')
  })
})
