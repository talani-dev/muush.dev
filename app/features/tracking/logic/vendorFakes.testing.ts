import type {
  TrackingWindow,
  VendorEnvironment,
} from '@/features/tracking/data/vendorTypes'

/**
 * A fake browser for the vendor tests (feature 49, tasks T015/T016/T022):
 * scripts are created with the test DOM but never connected, so nothing is
 * fetched, and every cookie write is recorded. Not collected by Vitest
 * (`*.test.ts` only) and imported by no application code.
 */
export interface FakeBrowser {
  env: VendorEnvironment
  window: TrackingWindow
  scripts: HTMLScriptElement[]
  cookieWrites: string[]
}

export function fakeBrowser(
  href = 'https://muush.dev/es/nosotros#trabaja-con-muush'
): FakeBrowser {
  const scripts: HTMLScriptElement[] = []
  const cookieWrites: string[] = []
  const window: TrackingWindow = {}
  const url = new URL(href)
  const env: VendorEnvironment = {
    window,
    document: {
      createElement: () => document.createElement('script'),
      head: { append: node => scripts.push(node as HTMLScriptElement) },
      querySelector: selectors =>
        scripts.find(script => script.matches(selectors)) ?? null,
      get cookie() {
        return ''
      },
      set cookie(value: string) {
        cookieWrites.push(value)
      },
      title: 'Nosotros · muush',
    },
    location: { hostname: url.hostname, href },
  }
  return { env, window, scripts, cookieWrites }
}

/** Every call `window.gtag` pushed, as plain arrays. */
export function gtagCalls(window: TrackingWindow): unknown[][] {
  return (window.dataLayer ?? []).map(entry =>
    Array.from(entry as ArrayLike<unknown>)
  )
}

/** Every call queued on Meta's `fbq` stub, as plain arrays. */
export function fbqCalls(window: TrackingWindow): unknown[][] {
  return (window.fbq?.queue ?? []).map(entry =>
    Array.from(entry as ArrayLike<unknown>)
  )
}
