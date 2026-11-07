import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackAttrs } from '@/shared/data/trackingEvents'
import { parseClickTrack, startClickTracking } from './clickTracking'

function link(attributes: Record<string, string>): HTMLAnchorElement {
  const anchor = document.createElement('a')
  anchor.href = '#'
  for (const [name, value] of Object.entries(attributes)) {
    anchor.setAttribute(name, value)
  }
  const label = document.createElement('span')
  label.textContent = 'Diagnóstico gratis'
  anchor.append(label)
  document.body.append(anchor)
  return anchor
}

describe('clickTracking', () => {
  let stop: (() => void) | undefined

  afterEach(() => {
    stop?.()
    document.body.innerHTML = ''
  })

  it('should emit the parsed event when a click lands inside a tracked link', () => {
    const emit = vi.fn()
    stop = startClickTracking(document, emit)
    const anchor = link(
      trackAttrs({
        name: 'assessment_cta_click',
        params: { cta_location: 'hero' },
      })
    )

    anchor
      .querySelector('span')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(emit).toHaveBeenCalledWith({
      name: 'assessment_cta_click',
      params: { cta_location: 'hero' },
    })
  })

  it('should emit the channel when a contact link is clicked', () => {
    const emit = vi.fn()
    stop = startClickTracking(document, emit)
    const anchor = link(
      trackAttrs({
        name: 'contact_click',
        params: { channel: 'email', cta_location: 'send_notice' },
      })
    )

    anchor.click()

    expect(emit).toHaveBeenCalledWith({
      name: 'contact_click',
      params: { channel: 'email', cta_location: 'send_notice' },
    })
  })

  it('should emit nothing when the event, location or channel is not in its closed list', () => {
    const emit = vi.fn()
    stop = startClickTracking(document, emit)

    link({ 'data-track': 'cta_click', 'data-track-location': 'hero' }).click()
    link({
      'data-track': 'book_call_click',
      'data-track-location': 'María Fernanda',
    }).click()
    link({
      'data-track': 'contact_click',
      'data-track-location': 'footer',
    }).click()

    expect(emit).not.toHaveBeenCalled()
  })

  it('should emit nothing when the click is outside any tracked element', () => {
    const emit = vi.fn()
    stop = startClickTracking(document, emit)

    link({}).click()
    document.body.click()

    expect(emit).not.toHaveBeenCalled()
  })

  it('should stop listening when stopped', () => {
    const emit = vi.fn()
    startClickTracking(document, emit)()
    const anchor = link(
      trackAttrs({
        name: 'book_call_click',
        params: { cta_location: 'footer' },
      })
    )

    anchor.click()

    expect(emit).not.toHaveBeenCalled()
  })

  it('should parse a book-call link without a channel', () => {
    const anchor = link(
      trackAttrs({
        name: 'book_call_click',
        params: { cta_location: 'assessment' },
      })
    )

    expect(parseClickTrack(anchor)).toEqual({
      name: 'book_call_click',
      params: { cta_location: 'assessment' },
    })
  })
})
