import {
  TURNSTILE_SCRIPT_URL,
  TURNSTILE_TOKEN_TIMEOUT_MS,
} from '@/features/forms/data/submissionContract'
import type { TurnstileApi } from '@/features/forms/data/turnstile'

/**
 * Cloudflare Turnstile, Invisible mode, one fresh token per request
 * (form-api-contract.md § 2, § 9; spec FR-013, FR-020, FR-021).
 *
 * ## The scoped third-party exception
 *
 * The site otherwise makes no request to a third party at runtime (fonts are
 * self-hosted, nuxt.config.ts). This script is the one deliberate exception,
 * and it is scoped three ways (plan Complexity Tracking):
 *
 * - only in the browser — nothing here runs at import or at creation, so it
 *   never runs during prerender and never lands in the generated HTML;
 * - only on a page with a form — the pages create the token source;
 * - only after the visitor engages that form — `engage()` is called from the
 *   form's first `focusin` or from submit, never from setup or mount.
 *
 * ## How a token is produced
 *
 * One widget per page, rendered once into the form's host element with
 * `execution: 'execute'` (render now, challenge later) and
 * `appearance: 'interaction-only'` (an Invisible key is never shown anyway).
 * Each `getToken()` runs `reset` then `execute`, so every request gets a token
 * minted at that moment — never an aged one from page load, never a reused
 * one. Option names confirmed against Cloudflare's docs on 2026-10-05.
 */

export interface TurnstileTokenSource {
  engage(host: HTMLElement): void
  getToken(): Promise<string>
}

export interface TurnstileTokenSourceOptions {
  siteKey: string
  loadApi?: () => Promise<TurnstileApi>
  tokenTimeoutMs?: number
}

interface RenderedWidget {
  api: TurnstileApi
  widgetId: string
  host: HTMLElement
}

interface PendingToken {
  resolve: (token: string) => void
  reject: (reason: Error) => void
}

/* One script per page lifetime, shared by every token source. Cleared on
   failure so a later engagement can try again (e.g. after going online). */
let scriptPromise: Promise<TurnstileApi> | undefined

/** Inserts Cloudflare's script once and resolves with `window.turnstile`. */
export function loadTurnstileApi(): Promise<TurnstileApi> {
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.addEventListener('load', () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error('Turnstile loaded without its API'))
    })
    script.addEventListener('error', () =>
      reject(new Error('Turnstile script failed to load'))
    )
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    scriptPromise = undefined
    throw error
  })
  return scriptPromise
}

export function createTurnstileTokenSource({
  siteKey,
  loadApi = loadTurnstileApi,
  tokenTimeoutMs = TURNSTILE_TOKEN_TIMEOUT_MS,
}: TurnstileTokenSourceOptions): TurnstileTokenSource {
  let widget: Promise<RenderedWidget> | undefined
  let pending: PendingToken | undefined

  function settle(outcome: { token: string } | { error: Error }): void {
    const current = pending
    pending = undefined
    if (!current) return
    if ('token' in outcome) current.resolve(outcome.token)
    else current.reject(outcome.error)
  }

  function render(api: TurnstileApi, host: HTMLElement): RenderedWidget {
    const widgetId = api.render(host, {
      sitekey: siteKey,
      execution: 'execute',
      appearance: 'interaction-only',
      'response-field': false,
      callback: token => settle({ token }),
      'error-callback': code =>
        settle({ error: new Error(`Turnstile error ${code}`) }),
      /* A token is consumed right away, so expiry only matters if a request
         is still waiting; the token timeout below covers that case. */
      'expired-callback': () => undefined,
    })
    return { api, widgetId, host }
  }

  function engage(host: HTMLElement): void {
    if (widget) return
    const rendering = loadApi().then(api => render(api, host))
    widget = rendering
    rendering.catch(() => {
      if (widget === rendering) widget = undefined
    })
  }

  async function getToken(): Promise<string> {
    if (!widget) throw new Error('Turnstile was never engaged')
    const { api, widgetId, host } = await widget

    settle({ error: new Error('Superseded by a newer token request') })
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(
        () => settle({ error: new Error('Turnstile token timed out') }),
        tokenTimeoutMs
      )
      pending = {
        resolve: token => {
          clearTimeout(timer)
          resolve(token)
        },
        reject: reason => {
          clearTimeout(timer)
          reject(reason)
        },
      }
      try {
        api.reset(widgetId)
        api.execute(host)
      } catch (error) {
        settle({
          error: error instanceof Error ? error : new Error(String(error)),
        })
      }
    })
  }

  return { engage, getToken }
}
