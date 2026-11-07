import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TrackingEvent } from '@/shared/data/trackingEvents'
import {
  emitTrackingEvent,
  onTrackingEvent,
  resetTrackingBus,
} from './trackingBus'

const EVENT: TrackingEvent = {
  name: 'form_start',
  params: { form: 'assessment' },
}

describe('trackingBus', () => {
  afterEach(() => {
    resetTrackingBus()
  })

  it('should do nothing when no sink is subscribed', () => {
    expect(() => emitTrackingEvent(EVENT)).not.toThrow()
  })

  it('should deliver the event to every subscriber when emitted', () => {
    const first = vi.fn()
    const second = vi.fn()
    onTrackingEvent(first)
    onTrackingEvent(second)

    emitTrackingEvent(EVENT)

    expect(first).toHaveBeenCalledWith(EVENT)
    expect(second).toHaveBeenCalledWith(EVENT)
  })

  it('should stop delivering when the subscriber unsubscribes', () => {
    const sink = vi.fn()
    const unsubscribe = onTrackingEvent(sink)

    unsubscribe()
    emitTrackingEvent(EVENT)

    expect(sink).not.toHaveBeenCalled()
  })

  it('should drop every subscriber when reset', () => {
    const sink = vi.fn()
    onTrackingEvent(sink)

    resetTrackingBus()
    emitTrackingEvent(EVENT)

    expect(sink).not.toHaveBeenCalled()
  })

  it('should keep delivering to the others when one sink throws', () => {
    const broken = vi.fn(() => {
      throw new Error('blocked')
    })
    const sink = vi.fn()
    onTrackingEvent(broken)
    onTrackingEvent(sink)

    emitTrackingEvent(EVENT)

    expect(sink).toHaveBeenCalledWith(EVENT)
  })
})
