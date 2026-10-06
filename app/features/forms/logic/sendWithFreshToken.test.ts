import { describe, expect, it, vi } from 'vitest'
import type { ApiResult } from '@/features/forms/data/submissionContract'
import { sendWithFreshToken } from './sendWithFreshToken'

function countingTokens() {
  let issued = 0
  return vi.fn(async () => `token-${++issued}`)
}

const OK: ApiResult<unknown> = { kind: 'ok', body: { ok: true } }
const CHALLENGE: ApiResult<unknown> = { kind: 'challenge' }

describe('sendWithFreshToken', () => {
  it('should send once with one token when the first answer is ok', async () => {
    const getToken = countingTokens()
    const send = vi.fn(async () => OK)

    expect(await sendWithFreshToken(getToken, send)).toBe(OK)
    expect(getToken).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith('token-1')
  })

  it('should resend once with a different token when the first answer is a challenge', async () => {
    const getToken = countingTokens()
    const send = vi
      .fn<(token: string) => Promise<ApiResult<unknown>>>()
      .mockResolvedValueOnce(CHALLENGE)
      .mockResolvedValueOnce(OK)

    expect(await sendWithFreshToken(getToken, send)).toBe(OK)
    expect(send.mock.calls.map(([token]) => token)).toEqual([
      'token-1',
      'token-2',
    ])
  })

  it('should return the second challenge as-is and never send a third time', async () => {
    const getToken = countingTokens()
    const send = vi.fn(async () => CHALLENGE)

    expect(await sendWithFreshToken(getToken, send)).toEqual(CHALLENGE)
    expect(send).toHaveBeenCalledTimes(2)
    expect(getToken).toHaveBeenCalledTimes(2)
  })

  it('should not retry when the answer is validation or failure', async () => {
    const send = vi.fn(
      async (): Promise<ApiResult<unknown>> => ({
        kind: 'validation',
        fields: ['email'],
      })
    )

    await sendWithFreshToken(countingTokens(), send)

    expect(send).toHaveBeenCalledTimes(1)
  })

  it('should resolve to failure with zero sends when no token can be obtained', async () => {
    const getToken = vi.fn(async () => {
      throw new Error('script blocked')
    })
    const send = vi.fn(async () => OK)

    expect(await sendWithFreshToken(getToken, send)).toEqual({
      kind: 'failure',
    })
    expect(send).not.toHaveBeenCalled()
  })

  it('should resolve to failure when the retry token cannot be obtained', async () => {
    const getToken = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('token-1')
      .mockRejectedValueOnce(new Error('timeout'))
    const send = vi.fn(async () => CHALLENGE)

    expect(await sendWithFreshToken(getToken, send)).toEqual({
      kind: 'failure',
    })
    expect(send).toHaveBeenCalledTimes(1)
  })
})
