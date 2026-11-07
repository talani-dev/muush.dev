import {
  GA_COOKIE_LIFETIME_SECONDS,
  GA_SCRIPT_URL,
  gaCookieNames,
} from '@/features/tracking/data/trackingConfig'
import type {
  Gtag,
  TrackingTool,
  TrackingWindow,
  VendorEnvironment,
} from '@/features/tracking/data/vendorTypes'
import type { TrackingEvent } from '@/shared/data/trackingEvents'
import { injectScript } from './injectScript'
import { expireCookies } from './thirdPartyCookies'

/**
 * Google Analytics 4 behind the "Analítica" category (feature 49, research
 * R3, contract §§ 3–4). Loaded lazily by `startTracking` on the first grant,
 * so a visitor who never accepts downloads none of this.
 *
 * - Page views are sent by the site (`send_page_view: false`), once per
 *   path change, never on an anchor jump (FR-022). Roberto turned GA4's
 *   "Page changes based on browser history events" OFF on 2026-11-07, which
 *   the Google docs require for manual page views not to count twice.
 * - `_ga` lives 420 days (≤ 14 months); Google Signals and ad
 *   personalization signals are off; no User-ID, no user-provided data
 *   (FR-014). API checked against the Google tag docs on 2026-11-07
 *   (docs/harness/findings.md § R80).
 * - Revoking sets Google's opt-out flag `ga-disable-<id>` and expires `_ga`
 *   and `_ga_<id>`; re-granting clears the flag and records the page.
 * - The sink forwards an event's `params` and nothing else: `userData`
 *   (Meta advanced matching) is never read here (FR-026).
 */

function gaDisableFlag(id: string): `ga-disable-${string}` {
  return `ga-disable-${id}`
}

/** Google's snippet: gtag.js reads the `arguments` object, not an array. */
function installGtag(win: TrackingWindow): Gtag {
  win.dataLayer = win.dataLayer ?? []
  const layer = win.dataLayer
  const gtag: Gtag = function gtag() {
    // biome-ignore lint/complexity/noArguments: gtag.js only accepts the Arguments object of this call.
    layer.push(arguments)
  }
  win.gtag = gtag
  return gtag
}

function eventParams(event: TrackingEvent): Record<string, unknown> {
  if (event.name === 'section_view' && event.beacon) {
    return { ...event.params, transport_type: 'beacon' }
  }
  return { ...event.params }
}

export function createGoogleAnalytics(
  measurementId: string,
  env: VendorEnvironment
): TrackingTool {
  let gtag: Gtag | undefined
  let granted = false

  function load(): Gtag {
    if (gtag) return gtag
    gtag = installGtag(env.window)
    // FR-014 / FR-022, fix round 1 (measured in headless Chrome against the
    // built site, 2026-11-07, every hit intercepted and failed):
    // - with only the `config` fields, the first hit was an automatic
    //   `page_view` (gtm `…za208…`) sent as gtag.js processed `js`, BEFORE
    //   our commands: `npa=0`, no consent state, `send_page_view: false`
    //   ignored. Every page-wide field must therefore be `set` BEFORE `js`.
    // - the page-wide `set` is how Google's privacy guide adds `npa=1` to all
    //   beacons; consent mode is its recommended control. All of it runs
    //   here, inside `load()`, so only after the Analytics grant (basic
    //   consent mode: no `consent default`, no ping, before the visitor
    //   accepts).
    gtag('set', 'send_page_view', false)
    gtag('set', 'allow_ad_personalization_signals', false)
    gtag('set', 'allow_google_signals', false)
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    })
    gtag('js', new Date())
    gtag('config', measurementId, {
      send_page_view: false,
      cookie_expires: GA_COOKIE_LIFETIME_SECONDS,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
    injectScript(env.document, `${GA_SCRIPT_URL}?id=${measurementId}`)
    return gtag
  }

  function sendPageView() {
    if (!granted) return
    gtag?.('event', 'page_view', {
      page_location: env.location.href.split('#')[0],
      page_title: env.document.title,
    })
  }

  return {
    grant() {
      if (!measurementId || granted) return
      load()
      env.window[gaDisableFlag(measurementId)] = false
      granted = true
      sendPageView()
    },
    revoke() {
      if (!granted) return
      granted = false
      env.window[gaDisableFlag(measurementId)] = true
      expireCookies(
        gaCookieNames(measurementId),
        env.location.hostname,
        env.document
      )
    },
    sendPageView,
    sink(event) {
      if (!granted) return
      gtag?.('event', event.name, eventParams(event))
    },
  }
}
