import type { TrackingTool } from '@/features/tracking/data/vendorTypes'
import type { TrackingEvent } from '@/shared/data/trackingEvents'
import { onTrackingEvent } from '@/shared/logic/trackingBus'

/**
 * One vendor's on/off switch (feature 49, contract § 3). The vendor module
 * is imported on the first grant only, so a visitor who never accepts its
 * category downloads none of it, and a category that was never granted is
 * never "revoked" (nothing to undo, nothing to load).
 *
 * The sink subscribes the moment the category is granted, before the
 * module has arrived; events emitted meanwhile (the `cookie_preferences` of
 * the very save that granted it, a form event) wait and follow the grant's
 * page view in order. Revoking unsubscribes and drops anything waiting.
 */
export interface ToolSwitch {
  grant(): void
  revoke(): void
  sendPageView(): void
}

export function createToolSwitch(
  load: () => Promise<TrackingTool>
): ToolSwitch {
  let tool: TrackingTool | undefined
  let requested = false
  let granted = false
  let unsubscribe: (() => void) | undefined
  const waiting: TrackingEvent[] = []

  function deliver(event: TrackingEvent) {
    if (tool) tool.sink(event)
    else waiting.push(event)
  }

  function onLoaded(loaded: TrackingTool) {
    tool = loaded
    if (!granted) return
    loaded.grant()
    for (const event of waiting.splice(0)) loaded.sink(event)
  }

  return {
    grant() {
      if (granted) return
      granted = true
      unsubscribe = onTrackingEvent(deliver)
      if (tool) {
        tool.grant()
        return
      }
      if (requested) return
      requested = true
      /* A blocked chunk ends here, silently: nothing is retried. */
      void load().then(onLoaded, () => {
        waiting.length = 0
      })
    },
    revoke() {
      if (!granted) return
      granted = false
      unsubscribe?.()
      waiting.length = 0
      tool?.revoke()
    },
    sendPageView() {
      if (granted) tool?.sendPageView()
    },
  }
}
