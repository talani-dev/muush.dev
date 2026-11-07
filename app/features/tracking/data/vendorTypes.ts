import type { TrackingEvent } from '@/shared/data/trackingEvents'

/**
 * The browser globals the two vendor snippets define, typed narrowly so no
 * `any` is needed (Constitution Article IX). Feature 49.
 */

/** `window.gtag`: pushes its `arguments` object onto `window.dataLayer`. */
export type Gtag = (...args: unknown[]) => void

/** `window.fbq`: Meta's stub queues calls until fbevents.js replaces it. */
export interface Fbq {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  push: Fbq
  loaded: boolean
  version: string
  /** Stops fbevents.js sending its own history-based PageViews (R2). */
  disablePushState?: boolean
}

export interface TrackingWindow {
  dataLayer?: unknown[]
  gtag?: Gtag
  fbq?: Fbq
  _fbq?: Fbq
  /** Google's documented opt-out flag, `ga-disable-<measurement id>`. */
  [gaDisableFlag: `ga-disable-${string}`]: boolean | undefined
}

/** Where a vendor script is added: `document` in the browser. */
export interface ScriptHost {
  createElement(tagName: 'script'): HTMLScriptElement
  head: { append(node: Node): void }
  querySelector(selectors: string): Element | null
}

/** What a vendor needs from the browser; injected so tests use a fake. */
export interface VendorEnvironment {
  window: TrackingWindow
  document: ScriptHost & { cookie: string; title: string }
  location: { hostname: string; href: string }
}

/**
 * One vendor behind its cookie category (contract § 3). `grant` loads the
 * script once per document and records the current page; `revoke` opts out
 * and expires the tool's cookies; `sink` maps a bus event to the vendor.
 * Every method is a no-op while the tool is not granted.
 */
export interface TrackingTool {
  grant(): void
  revoke(): void
  sendPageView(): void
  sink(event: TrackingEvent): void
}
