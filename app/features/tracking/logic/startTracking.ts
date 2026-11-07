import { watch } from 'vue'
import {
  type RouteLocationNormalized,
  type Router,
  START_LOCATION,
} from 'vue-router'
import type { ConsentRecord } from '@/features/legal'
import { useCookieConsent } from '@/features/legal'
import type {
  TrackingTool,
  VendorEnvironment,
} from '@/features/tracking/data/vendorTypes'
import { emitTrackingEvent } from '@/shared/logic/trackingBus'
import { startClickTracking } from './clickTracking'
import { isNewPage, localeChange } from './pageViews'
import { createToolSwitch, type ToolSwitch } from './toolSwitch'
import { type SectionTiming, useSectionTiming } from './useSectionTiming'
import { whenScrollSettles } from './whenScrollSettles'

/**
 * The tracking feature's entry point (feature 49, contract § 2), started
 * once by `app/plugins/tracking.client.ts`. It renders nothing.
 *
 * - Reads the visitor's choice through `useCookieConsent()` (the `legal`
 *   barrel) and follows it with a synchronous `watch`, `immediate` so a
 *   returning visitor's granted tools load at startup. Each category drives
 *   its own tool (contract § 3): no choice, an expired one or a refusal
 *   loads nothing and sends nothing.
 * - Sends one page view per path change to every granted tool, never on an
 *   anchor jump (FR-022), and `language_change` when the locale switches.
 * - Starts the delegated CTA click listener and, while "Analítica" is
 *   granted, the section timing.
 */
export interface StartTrackingOptions {
  /** `''` disables Google Analytics. */
  gaMeasurementId: string
  /** `''` disables the Meta Pixel. */
  metaPixelId: string
  router: Pick<Router, 'afterEach' | 'isReady' | 'currentRoute'>
}

/** What `startTracking` needs from the browser; injected by tests. */
export interface TrackingDeps {
  loadAnalytics: (measurementId: string) => Promise<TrackingTool>
  loadAdvertising: (pixelId: string) => Promise<TrackingTool>
  sectionTiming: (
    currentRouteName: () => string | undefined,
    defer: (task: () => void) => void
  ) => SectionTiming
  clickRoot: Pick<Document, 'addEventListener' | 'removeEventListener'>
  defer: (task: () => void) => void
}

let started = false

function routeNameOf(route: RouteLocationNormalized): string | undefined {
  return typeof route.name === 'string' ? route.name : undefined
}

function followConsent(
  record: ConsentRecord | null,
  tools: { analytics: ToolSwitch; advertising: ToolSwitch },
  timing: SectionTiming
) {
  const analytics = record?.categories.analytics ?? false
  const advertising = record?.categories.advertising ?? false
  if (analytics) tools.analytics.grant()
  else tools.analytics.revoke()
  if (analytics) timing.start()
  else timing.stop()
  if (advertising) tools.advertising.grant()
  else tools.advertising.revoke()
}

export function startTracking(
  options: StartTrackingOptions,
  deps: TrackingDeps = browserTrackingDeps()
): void {
  if (started) return
  started = true
  const { router } = options
  const tools = {
    analytics: createToolSwitch(() =>
      deps.loadAnalytics(options.gaMeasurementId)
    ),
    advertising: createToolSwitch(() =>
      deps.loadAdvertising(options.metaPixelId)
    ),
  }
  /* The first page is observed once the initial navigation has settled,
     when the route name is the page's own. */
  const timing = deps.sectionTiming(
    () => routeNameOf(router.currentRoute.value),
    task => {
      void router.isReady().then(() => deps.defer(task))
    }
  )

  router.afterEach((to, from) => {
    const fromPath = from === START_LOCATION ? undefined : from.path
    const change = localeChange(fromPath, to.path)
    if (change) emitTrackingEvent({ name: 'language_change', params: change })
    if (!isNewPage(fromPath, to.path)) return
    timing.pageChanged()
    deps.defer(() => {
      tools.analytics.sendPageView()
      tools.advertising.sendPageView()
    })
  })
  startClickTracking(deps.clickRoot)

  const { consent } = useCookieConsent()
  watch(consent, record => followConsent(record, tools, timing), {
    immediate: true,
    /* Synchronous, so a save that grants "Analítica" subscribes the GA sink
       before `saveChoice` emits its own `cookie_preferences` (FR-024). */
    flush: 'sync',
  })
}

/** Tests only: lets the next `startTracking` run as on a fresh document. */
export function resetTrackingStart(): void {
  started = false
}

/**
 * The browser's own dependencies. The vendor modules are dynamic imports,
 * so their code is a separate chunk fetched only on a grant.
 */
function browserTrackingDeps(): TrackingDeps {
  const env: VendorEnvironment = {
    window: window as unknown as VendorEnvironment['window'],
    document,
    location: window.location,
  }
  /* After the new page has rendered and set its title. */
  const defer = (task: () => void) =>
    requestAnimationFrame(() => setTimeout(task, 0))
  /* Sections are observed only once the page has stopped scrolling. */
  const afterScroll = (task: () => void) =>
    whenScrollSettles(
      {
        scrollY: () => window.scrollY,
        nextFrame: callback => requestAnimationFrame(callback),
        now: () => performance.now(),
      },
      task
    )
  return {
    loadAnalytics: async id =>
      (await import('./googleAnalytics')).createGoogleAnalytics(id, env),
    loadAdvertising: async id =>
      (await import('./metaPixel')).createMetaPixel(id, env),
    sectionTiming: (currentRouteName, deferAfterReady) =>
      useSectionTiming({
        root: document,
        view: window,
        createObserver: (callback, init) =>
          new IntersectionObserver(callback, init),
        currentRouteName,
        emit: emitTrackingEvent,
        now: () => performance.now(),
        defer: task => deferAfterReady(() => afterScroll(task)),
      }),
    clickRoot: document,
    defer,
  }
}
