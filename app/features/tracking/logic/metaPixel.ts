import {
  META_COOKIE_NAMES,
  META_EVENT_BY_NAME,
  META_SCRIPT_URL,
} from '@/features/tracking/data/trackingConfig'
import type {
  Fbq,
  TrackingTool,
  TrackingWindow,
  VendorEnvironment,
} from '@/features/tracking/data/vendorTypes'
import type { LeadUserData, TrackingEvent } from '@/shared/data/trackingEvents'
import { injectScript } from './injectScript'
import { expireCookies } from './thirdPartyCookies'

/**
 * Meta Pixel behind the "Publicidad" category (feature 49, research R3–R4,
 * contract §§ 3–4). Loaded lazily by `startTracking` on the first grant.
 *
 * Meta's standard install is deliberately not followed literally (tracking
 * plan § 8.1): no base code in `<head>` (it would fire before consent) and
 * no `<noscript>` image pixel (it tracks without scripting, so without any
 * possible consent).
 *
 * - Automatic configuration is off (`autoConfig` false, set before `init`)
 *   and fbevents' own history PageViews are off (`disablePushState`): the
 *   site sends one `PageView` per path change itself (FR-015, FR-022),
 *   with `trackSingle` (see `sendPageView`).
 * - Only `Schedule`, `Contact` and `Lead` are sent, with no parameters
 *   (FR-025). The talent application never reaches Meta.
 * - Advanced matching (FR-030): the assessment `Lead` re-runs `init` with the
 *   email and, with WhatsApp, the phone; the pixel hashes both with SHA-256
 *   in the browser. Only with Publicidad granted, since this sink is only
 *   subscribed then.
 * - Revoking calls `fbq('consent', 'revoke')` and expires `_fbp`;
 *   re-granting calls `fbq('consent', 'grant')` and records the page.
 * API checked against Meta's docs on 2026-11-07 (findings.md § R80).
 */

/** Meta's base-code stub: queues calls until fbevents.js takes over. */
function installFbq(win: TrackingWindow): Fbq {
  const stub = ((...args: unknown[]) => {
    if (stub.callMethod) stub.callMethod.apply(stub, args)
    else stub.queue.push(args)
  }) as Fbq
  stub.push = stub
  stub.loaded = true
  stub.version = '2.0'
  stub.queue = []
  win.fbq = stub
  win._fbq = win._fbq ?? stub
  return stub
}

/** Meta's normalisation: lowercase email; phone as country code + digits. */
export function advancedMatching(userData: LeadUserData): {
  em: string
  ph?: string
} {
  const phone = userData.phone?.replace(/\D/g, '')
  return {
    em: userData.email.trim().toLowerCase(),
    ...(phone && { ph: phone }),
  }
}

export function createMetaPixel(
  pixelId: string,
  env: VendorEnvironment
): TrackingTool {
  let fbq: Fbq | undefined
  let granted = false

  function load(): Fbq {
    const pixel = installFbq(env.window)
    pixel('set', 'autoConfig', false, pixelId)
    pixel.disablePushState = true
    pixel('init', pixelId)
    injectScript(env.document, META_SCRIPT_URL)
    fbq = pixel
    return pixel
  }

  /* `trackSingle`, not `track`: fbevents 2.9.438 sends the first
     `track PageView` of a document and silently drops every later one
     (disablePushState is on), so in-app navigations never reached Meta.
     `trackSingle` with the pixel id is sent each time, with `dl` = the
     current route (measured in Chrome against the built site, 2026-11-07;
     Meta "Track multiple events" guide). */
  function sendPageView() {
    if (granted) fbq?.('trackSingle', pixelId, 'PageView')
  }

  function sink(event: TrackingEvent) {
    const metaEvent = granted ? META_EVENT_BY_NAME[event.name] : undefined
    if (!fbq || !metaEvent) return
    if (event.name === 'generate_lead' && event.userData) {
      fbq('init', pixelId, advancedMatching(event.userData))
    }
    fbq('track', metaEvent)
  }

  return {
    grant() {
      if (!pixelId || granted) return
      if (fbq) fbq('consent', 'grant')
      else load()
      granted = true
      sendPageView()
    },
    revoke() {
      if (!granted) return
      granted = false
      fbq?.('consent', 'revoke')
      expireCookies(META_COOKIE_NAMES, env.location.hostname, env.document)
    },
    sendPageView,
    sink,
  }
}
