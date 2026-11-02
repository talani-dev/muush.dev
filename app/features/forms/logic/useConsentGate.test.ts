import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONSENT_FIELD_ID, useConsentGate } from './useConsentGate'

afterEach(() => {
  document.body.replaceChildren()
})

function checkbox(): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.id = CONSENT_FIELD_ID
  document.body.append(input)
  return input
}

describe('useConsentGate', () => {
  it('should start unaccepted when created', () => {
    expect(useConsentGate().accepted.value).toBe(false)
  })

  it('should not call the handler, stop the native submit and focus the checkbox when unaccepted', async () => {
    const box = checkbox()
    const handler = vi.fn(async (_event: Event) => undefined)
    const { guard } = useConsentGate()
    const event = new Event('submit', { cancelable: true })

    await guard(handler)(event)

    expect(handler).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(box)
  })

  it('should call the handler once with the event when accepted', async () => {
    const handler = vi.fn(async (_event: Event) => undefined)
    const { accepted, guard } = useConsentGate()
    accepted.value = true
    const event = new Event('submit')

    await guard(handler)(event)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should block again when the box is unticked after being ticked', async () => {
    const handler = vi.fn(async (_event: Event) => undefined)
    const { accepted, guard } = useConsentGate()
    const guarded = guard(handler)
    accepted.value = true
    accepted.value = false

    await guarded(new Event('submit', { cancelable: true }))

    expect(handler).not.toHaveBeenCalled()
  })
})

describe('useConsentGate · a send path with no event (review-45)', () => {
  it('should not call an eventless handler and focus the checkbox when unaccepted', async () => {
    const box = checkbox()
    const handler = vi.fn(async () => undefined)
    const { guard } = useConsentGate()

    await guard(handler)()

    expect(handler).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(box)
  })
})
