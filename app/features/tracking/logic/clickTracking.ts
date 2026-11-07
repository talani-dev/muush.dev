import {
  CLICK_EVENT_NAMES,
  type ClickTrackingEvent,
  CONTACT_CHANNELS,
  CTA_LOCATIONS,
} from '@/shared/data/trackingEvents'
import { emitTrackingEvent } from '@/shared/logic/trackingBus'

/**
 * The one delegated click listener behind every tracked CTA (feature 49,
 * contract § 6). A CTA carries `data-track*` attributes from `trackAttrs()`;
 * this reads them back and drops anything outside the closed lists, so a
 * hand-edited attribute can never put free text into an event (FR-021).
 */

function oneOf<T extends string>(
  list: readonly T[],
  value: string | null
): T | undefined {
  return list.find(item => item === value)
}

/** The event a `[data-track]` element stands for, or null if invalid. */
export function parseClickTrack(element: Element): ClickTrackingEvent | null {
  const name = oneOf(CLICK_EVENT_NAMES, element.getAttribute('data-track'))
  const location = oneOf(
    CTA_LOCATIONS,
    element.getAttribute('data-track-location')
  )
  if (!name || !location) return null
  if (name !== 'contact_click')
    return { name, params: { cta_location: location } }
  const channel = oneOf(
    CONTACT_CHANNELS,
    element.getAttribute('data-track-channel')
  )
  if (!channel) return null
  return { name, params: { channel, cta_location: location } }
}

/**
 * Listens on `root` in the capture phase, passively, so it sees the click
 * before any handler that navigates and never delays it. Returns the
 * function that removes the listener.
 */
export function startClickTracking(
  root: Pick<Document, 'addEventListener' | 'removeEventListener'>,
  emit: typeof emitTrackingEvent = emitTrackingEvent
): () => void {
  function onClick(event: Event) {
    const target = event.target
    if (!(target instanceof Element)) return
    const tracked = target.closest('[data-track]')
    const parsed = tracked ? parseClickTrack(tracked) : null
    if (parsed) emit(parsed)
  }
  const options = { capture: true, passive: true }
  root.addEventListener('click', onClick, options)
  return () => root.removeEventListener('click', onClick, options)
}
