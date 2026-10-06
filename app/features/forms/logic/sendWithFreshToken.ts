import type { ApiResult } from '@/features/forms/data/submissionContract'

/**
 * One logical API request with a Turnstile token minted for it alone
 * (form-api-contract.md § 2: single-use, 300 s).
 *
 * 1. Obtain a token, send.
 * 2. On `challenge` (403 `challenge_failed`: expired, used or invalid token),
 *    obtain a NEW token and send again — exactly once (spec FR-014).
 * 3. Anything else, including a second `challenge`, is returned as-is; the
 *    caller maps it to an outcome. There is never a third send.
 *
 * A token that cannot be obtained (script blocked, offline, timeout) is a
 * `failure` with nothing sent.
 */
export async function sendWithFreshToken<T>(
  getToken: () => Promise<string>,
  send: (token: string) => Promise<ApiResult<T>>
): Promise<ApiResult<T>> {
  const first = await sendOnce(getToken, send)
  if (first.kind !== 'challenge') return first
  return sendOnce(getToken, send)
}

async function sendOnce<T>(
  getToken: () => Promise<string>,
  send: (token: string) => Promise<ApiResult<T>>
): Promise<ApiResult<T>> {
  let token: string
  try {
    token = await getToken()
  } catch {
    return { kind: 'failure' }
  }
  try {
    return await send(token)
  } catch {
    return { kind: 'failure' }
  }
}
