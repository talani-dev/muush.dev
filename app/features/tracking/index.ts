/**
 * The tracking module's only public API (Constitution Article III), feature
 * 49: consent-gated Google Analytics 4 and Meta Pixel. It renders nothing;
 * `app/plugins/tracking.client.ts` starts it once in the browser.
 *
 * Other features never import this module: they emit facts on the shared
 * bus (`@/shared/logic/trackingBus`) and mark CTAs with `trackAttrs()`
 * (`@/shared/data/trackingEvents`).
 */
export type { StartTrackingOptions } from './logic/startTracking'
export { startTracking } from './logic/startTracking'
