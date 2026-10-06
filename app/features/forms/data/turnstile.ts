/**
 * The four functions of Cloudflare Turnstile's explicit-rendering API this
 * site uses, typed by hand. No `@types/…` package and no Nuxt Turnstile
 * module: one script, four functions (research R2, Article VIII).
 *
 * Confirmed on 2026-10-05 against Cloudflare's current docs
 * (developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 * and …/widget-configurations/): `?render=explicit`, `render(container,
 * options) → widgetId`, `reset(widgetId)`, `execute(container)`,
 * `remove(widgetId)`, and the option names below. Recorded in
 * docs/harness/findings.md.
 */
export interface TurnstileRenderOptions {
  sitekey: string
  /** `'execute'`: render now, run the challenge only on `execute()`. */
  execution: 'render' | 'execute'
  /** Only affects visible widget types; an Invisible key is never shown. */
  appearance: 'always' | 'execute' | 'interaction-only'
  /** `false`: inject no hidden `cf-turnstile-response` input into the form. */
  'response-field': boolean
  callback: (token: string) => void
  'error-callback': (errorCode: string) => void
  'expired-callback': () => void
}

export interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string
  reset(widgetId: string): void
  execute(container: HTMLElement): void
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}
