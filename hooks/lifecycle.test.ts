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
  applyStart: { type: 'applyStart', id: 'p1', runId: 'r1', epoch: 1, where: W, now: 0, live: true },
  writeAuthorized: { type: 'writeAuthorized', id: 'p1', runId: 'r1', index: 0, where: W },
  writeResult: { type: 'writeResult', id: 'p1', runId: 'r1', index: 0, status: 'written' },
  applyEndRetain: { type: 'applyEnd', id: 'p1', runId: 'r1', retain: true, summary: 's' },
  applyEndDrop: { type: 'applyEnd', id: 'p1', runId: 'r1', retain: false, summary: 's' },
  off: { type: 'off', live: true },
  on: { type: 'on' },
  clear: { type: 'clear' },
  discard: { type: 'discard', id: 'p1', live: true },
  expire: { type: 'expire', now: 0 },
  reload: { type: 'reload' },
}

/** What a transition did, in one word each: the preview after it (`id:state`), and the action or denial. */
function outcome(s: Session, e: LifeEvent): string {
  const { record, actions } = transition(s, e, CONFIG)
  const p = record.preview ? `${record.preview.id}:${record.preview.state}` : 'none'
  const a = actions.map(x => (x.kind === 'denied' ? x.code : x.kind)).join('+') || '-'
  return `${p} ${a}`
}

// Every state × event pair: the preview after the event, and what the transition answered.
const TABLE: Record<string, Record<string, string>> = {
  none: {
    publish: 'p2:pending published', applyStart: 'none UNKNOWN_PREVIEW', writeAuthorized: 'none SESSION_CHANGED',
    writeResult: 'none -', applyEndRetain: 'none -', applyEndDrop: 'none -', off: 'none -', on: 'none -',
    clear: 'none -', discard: 'none UNKNOWN_PREVIEW', expire: 'none -', reload: 'none -',
  },
  pending: {
    publish: 'p1:pending PREVIEW_PENDING', applyStart: 'p1:applying applying', writeAuthorized: 'p1:pending SESSION_CHANGED',
    writeResult: 'p1:pending -', applyEndRetain: 'p1:pending -', applyEndDrop: 'p1:pending -', off: 'none dropped',
    on: 'p1:pending -', clear: 'none -', discard: 'none discarded', expire: 'p1:pending -', reload: 'p1:pending -',
  },
  expired: {
    publish: 'p2:pending dropped+published', applyStart: 'none dropped+EXPIRED', writeAuthorized: 'p1:pending SESSION_CHANGED',
    writeResult: 'p1:pending -', applyEndRetain: 'p1:pending -', applyEndDrop: 'p1:pending -', off: 'none dropped',
    on: 'p1:pending -', clear: 'none -', discard: 'none discarded', expire: 'none dropped', reload: 'p1:pending -',
  },
  revoked: {
    publish: 'p2:pending dropped+published', applyStart: 'none dropped+REVOKED', writeAuthorized: 'p1:pending SESSION_CHANGED',
    writeResult: 'p1:pending -', applyEndRetain: 'p1:pending -', applyEndDrop: 'p1:pending -', off: 'none dropped',
    on: 'p1:pending -', clear: 'none -', discard: 'none discarded', expire: 'none dropped', reload: 'p1:pending -',
  },
  applying: {
    publish: 'p1:applying PREVIEW_PENDING', applyStart: 'p1:applying BUSY', writeAuthorized: 'p1:applying authorized',
    writeResult: 'p1:applying recorded', applyEndRetain: 'p1:pending kept', applyEndDrop: 'none dropped',
    off: 'p1:applying -', on: 'p1:applying -', clear: 'none -', discard: 'p1:applying BUSY', expire: 'p1:applying -',
    reload: 'p1:interrupted interrupted',
  },
  interrupted: {
    publish: 'p1:interrupted PREVIEW_PENDING', applyStart: 'p1:interrupted INTERRUPTED', writeAuthorized: 'p1:interrupted SESSION_CHANGED',
    writeResult: 'p1:interrupted -', applyEndRetain: 'p1:interrupted -', applyEndDrop: 'p1:interrupted -', off: 'none dropped',
    on: 'p1:interrupted -', clear: 'none -', discard: 'none discarded', expire: 'p1:interrupted -', reload: 'p1:interrupted -',
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
    expect(transition(STATES.pending!, EVENTS.off!, CONFIG).record).toMatchObject({ mode: 'off', epoch: 2, preview: null })
    expect(transition({ ...STATES.none!, mode: 'off', epoch: 2 }, EVENTS.on!, CONFIG).record).toMatchObject({ mode: 'on', epoch: 2 })
    expect(transition(STATES.applying!, EVENTS.clear!, CONFIG).record).toMatchObject({ epoch: 2, preview: null })
  })

  test('off while an apply runs, then on: the run is never authorized again and its refusal does not restore the preview', async () => {
    let s = transition(STATES.applying!, EVENTS.off!, CONFIG).record
    s = transition(s, EVENTS.on!, CONFIG).record
    expect(outcome(s, EVENTS.writeAuthorized!)).toBe('p1:applying REVOKED')
    expect(outcome(s, EVENTS.applyEndRetain!)).toBe('none dropped')
    const after = transition(s, EVENTS.applyEndRetain!, CONFIG).record
    expect(outcome(after, { ...(EVENTS.applyStart as Extract<LifeEvent, { type: 'applyStart' }>), epoch: 2 })).toBe('none UNKNOWN_PREVIEW')
  })

  test('an operation that started in an older epoch cannot publish or start an apply', async () => {
    expect(outcome(STATES.none!, { ...(EVENTS.publish as Extract<LifeEvent, { type: 'publish' }>), epoch: 0 })).toBe('none REVOKED')
    expect(outcome(STATES.pending!, { ...(EVENTS.applyStart as Extract<LifeEvent, { type: 'applyStart' }>), epoch: 0 })).toBe('none dropped+REVOKED')
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

  test('an apply interrupted by a dead run reads as interrupted, not busy', async () => {
    expect(outcome(STATES.applying!, { ...(EVENTS.applyStart as Extract<LifeEvent, { type: 'applyStart' }>), live: false })).toBe('p1:applying INTERRUPTED')
    expect(outcome(STATES.applying!, { type: 'discard', id: 'p1', live: false })).toBe('none discarded')
    expect(outcome(STATES.applying!, { type: 'off', live: false })).toBe('none dropped')
  })

  test('writeAuthorized marks the file writing; writeResult records the outcome', async () => {
    const a = transition(STATES.applying!, EVENTS.writeAuthorized!, CONFIG).record
    expect(a.preview!.files[0]!.status).toBe('writing')
    const b = transition(a, { type: 'writeResult', id: 'p1', runId: 'r1', index: 0, status: 'refused', note: 'no' }, CONFIG).record
    expect(b.preview!.files[0]).toMatchObject({ status: 'refused', note: 'no' })
    const kept = transition(b, EVENTS.applyEndRetain!, CONFIG).record
    expect(kept.preview).toMatchObject({ state: 'pending', runId: null })
    expect(kept.preview!.files[0]!.status).toBe('unstarted')
  })
})
