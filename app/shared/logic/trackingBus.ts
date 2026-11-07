import type { TrackingEvent } from '@/shared/data/trackingEvents'

/**
 * The seam between the features that know *what happened* and the one that
 * knows *where to send it* (feature 49, research R1, contract § 1).
 *
 * `forms`, `legal` and the others emit facts ("lead confirmed", "choice
 * saved") without knowing whether anything listens; the `tracking` feature
 * subscribes one sink per vendor, and only after the visitor accepted that
 * vendor's cookie category. With no sink subscribed an emit does nothing:
 * no network, no DOM, no buffer.
 *
 * Module-scoped on purpose, like `useCookieConsent`: a document has one bus.
 */
export type TrackingSink = (event: TrackingEvent) => void

const sinks = new Set<TrackingSink>()

export function emitTrackingEvent(event: TrackingEvent): void {
  for (const sink of sinks) {
    /* A blocked or broken vendor never stops the site or the other sink
       (spec Edge Cases: events are dropped silently). */
    try {
      sink(event)
    } catch {
      /* Dropped on purpose. */
    }
  }
}

/** Subscribes `sink`; the returned function unsubscribes it. */
export function onTrackingEvent(sink: TrackingSink): () => void {
  sinks.add(sink)
  return () => {
    sinks.delete(sink)
  }
}

/** Tests only: each test starts from a bus with no subscriber. */
export function resetTrackingBus(): void {
  sinks.clear()
}
