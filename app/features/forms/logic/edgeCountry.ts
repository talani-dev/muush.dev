/**
 * The visitor's country as the site's own edge reports it (feature 32,
 * Amendment A1). One same-origin `GET /__geo`, answered by the CloudFront
 * function in muush-foundation; the contract is
 * `specs/032-whatsapp-dial-code-selector/contracts/edge-geo-endpoint.md`.
 *
 * Without that edge piece (dev, static preview, Storybook, tests) the path is
 * a 404 page, and every outcome other than a well-formed JSON answer is
 * `undefined` — the form then stays on Mexico. Nothing here throws, logs or
 * validates against the country list (that is `toReportedCountry`).
 */

/** Contract § 2: relative path, so the request can only go to this origin. */
export const EDGE_COUNTRY_PATH = '/__geo'
/** Contract § 2: the site aborts after this long. */
export const EDGE_COUNTRY_TIMEOUT_MS = 3000

export type EdgeCountryFetch = (
  input: string,
  init: RequestInit
) => Promise<Pick<Response, 'ok' | 'json'>>

export interface FetchEdgeCountryOptions {
  fetchImpl?: EdgeCountryFetch
  timeoutMs?: number
}

function countryOfBody(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null || !('country' in body)) {
    return undefined
  }
  return typeof body.country === 'string' ? body.country : undefined
}

export async function fetchEdgeCountry({
  fetchImpl = (input, init) => globalThis.fetch(input, init),
  timeoutMs = EDGE_COUNTRY_TIMEOUT_MS,
}: FetchEdgeCountryOptions = {}): Promise<string | undefined> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(EDGE_COUNTRY_PATH, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) {
      return undefined
    }
    return countryOfBody(await response.json())
  } catch {
    /* Network error, abort or a non-JSON body (the 404/200 HTML page): all
       mean "unknown" (contract § 3), never an error the visitor sees. */
    return undefined
  } finally {
    clearTimeout(timer)
  }
}

/**
 * At most one request per instance (spec FR-A08): the first call starts it,
 * later calls share the same promise. One instance per page submitter.
 */
export function createEdgeCountryLookup(
  fetchOnce: () => Promise<string | undefined> = () => fetchEdgeCountry()
): () => Promise<string | undefined> {
  let pending: Promise<string | undefined> | undefined
  return () => {
    pending ??= fetchOnce()
    return pending
  }
}
