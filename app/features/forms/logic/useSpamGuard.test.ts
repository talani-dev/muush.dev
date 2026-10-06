import { describe, expect, it } from 'vitest'
import { initialApplicationFormValues } from '@/features/forms/data/applicationFields'
import { initialContactFormValues } from '@/features/forms/data/contactFields'
import {
  HONEYPOT_FIELD_NAME,
  MIN_FILL_TIME_MS,
} from '@/features/forms/data/submissionContract'
import { buildCareersPayload, buildContactPayload } from './submissionPayloads'
import { isSubmissionBlocked, useSpamGuard } from './useSpamGuard'

const READY = 1_000

describe('isSubmissionBlocked', () => {
  const base = {
    honeypot: '',
    readyAt: READY,
    now: READY + MIN_FILL_TIME_MS,
    minFillMs: MIN_FILL_TIME_MS,
  }

  it('should allow a submit at exactly the minimum fill time', () => {
    expect(isSubmissionBlocked(base)).toBe(false)
  })

  it('should block when the honeypot holds anything', () => {
    expect(isSubmissionBlocked({ ...base, honeypot: 'x' })).toBe(true)
  })

  it('should block when the form never became interactive', () => {
    expect(isSubmissionBlocked({ ...base, readyAt: null })).toBe(true)
  })

  it('should block when the submit comes before the minimum fill time', () => {
    expect(
      isSubmissionBlocked({ ...base, now: READY + MIN_FILL_TIME_MS - 1 })
    ).toBe(true)
  })

  it('should approve 3 s as the minimum, as decided at the gate (OA-1)', () => {
    expect(MIN_FILL_TIME_MS).toBe(3_000)
  })
})

describe('useSpamGuard', () => {
  function clock(start: number) {
    let current = start
    return {
      now: () => current,
      advance: (ms: number) => {
        current += ms
      },
    }
  }

  it('should block until marked interactive and the minimum has elapsed, then allow', () => {
    const time = clock(READY)
    const guard = useSpamGuard(time.now)

    expect(guard.isBlocked()).toBe(true)
    guard.markInteractive()
    time.advance(MIN_FILL_TIME_MS - 1)
    expect(guard.isBlocked()).toBe(true)
    time.advance(1)
    expect(guard.isBlocked()).toBe(false)
  })

  it('should keep the first interactive moment when marked twice', () => {
    const time = clock(READY)
    const guard = useSpamGuard(time.now)

    guard.markInteractive()
    time.advance(MIN_FILL_TIME_MS)
    guard.markInteractive()

    expect(guard.isBlocked()).toBe(false)
  })

  it('should block when a bot filled the honeypot, however long it waited', () => {
    const time = clock(READY)
    const guard = useSpamGuard(time.now)

    guard.markInteractive()
    time.advance(MIN_FILL_TIME_MS * 10)
    guard.honeypot.value = 'https://spam.example'

    expect(guard.isBlocked()).toBe(true)
  })

  it('should never let the honeypot reach a payload, whatever it holds', () => {
    const contact = buildContactPayload(
      {
        ...initialContactFormValues(),
        name: 'Ana',
        email: 'a@b.co',
        identity: 'other',
        need: 'Algo de diez letras',
      },
      'es',
      't'
    )
    const careers = buildCareersPayload(
      {
        ...initialApplicationFormValues(),
        name: 'Ana',
        email: 'a@b.co',
        areaRole: 'it:backend',
      },
      'es',
      't'
    )

    for (const payload of [contact, careers]) {
      expect(payload).not.toHaveProperty(HONEYPOT_FIELD_NAME)
      expect(JSON.stringify(payload)).not.toContain('spam')
    }
  })
})
