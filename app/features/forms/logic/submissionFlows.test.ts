import { describe, expect, it, vi } from 'vitest'
import {
  type ApplicationFormValues,
  initialApplicationFormValues,
} from '@/features/forms/data/applicationFields'
import {
  type ContactFormValues,
  initialContactFormValues,
} from '@/features/forms/data/contactFields'
import type {
  ApiResult,
  CareersPayload,
  CvUploadGrant,
} from '@/features/forms/data/submissionContract'
import {
  type CvUploadOutcome,
  createFormsApiClient,
  type FetchLike,
  type FormsApiClient,
} from './formsApiClient'
import { submitApplicationFlow, submitContactFlow } from './submissionFlows'

/** A client double recording the order of every call. No network. */
function fakeClient(script: {
  contact?: ApiResult<unknown>[]
  upload?: ApiResult<CvUploadGrant>[]
  put?: (CvUploadOutcome | Promise<CvUploadOutcome>)[]
  careers?: ApiResult<unknown>[]
}) {
  const log: string[] = []
  const careersPayloads: CareersPayload[] = []
  const next = <T>(queue: T[] | undefined, fallback: T): T =>
    queue?.shift() ?? fallback
  const OK = { kind: 'ok', body: { ok: true } } as const

  const client: FormsApiClient = {
    postContact: vi.fn(async payload => {
      log.push(`contact:${payload.turnstileToken}`)
      return next(script.contact, OK)
    }),
    requestCvUpload: vi.fn(async request => {
      log.push(`upload:${request.turnstileToken}`)
      return next(script.upload, { kind: 'ok', body: GRANT })
    }),
    putCv: vi.fn(async () => {
      log.push('put')
      return next(script.put, 'uploaded' as CvUploadOutcome)
    }),
    postCareers: vi.fn(async payload => {
      log.push(`careers:${payload.turnstileToken}`)
      careersPayloads.push(payload)
      return next(script.careers, OK)
    }),
  }
  return { client, log, careersPayloads }
}

function countingTokens(log?: string[]) {
  let issued = 0
  return vi.fn(async () => {
    const token = `token-${++issued}`
    log?.push(`token:${token}`)
    return token
  })
}

const GRANT: CvUploadGrant = {
  cvId: 'cv-uuid',
  uploadUrl: 'https://bucket.test.invalid/signed',
  method: 'PUT',
  headers: { 'content-type': 'application/pdf' },
}

const CHALLENGE = { kind: 'challenge' } as const
const FAILURE = { kind: 'failure' } as const

const contact: ContactFormValues = {
  ...initialContactFormValues(),
  name: 'Ana',
  email: 'ana@muush.dev',
  identity: 'company',
  need: 'Necesitamos un sitio nuevo.',
}

const cv = new File(['%PDF-1.7'], 'cv.pdf', { type: 'application/pdf' })

function application(
  overrides: Partial<ApplicationFormValues> = {}
): ApplicationFormValues {
  return {
    ...initialApplicationFormValues(),
    name: 'Ana',
    email: 'ana@muush.dev',
    areaRole: 'it:backend',
    ...overrides,
  }
}

describe('submitContactFlow', () => {
  it('should succeed with one token when the API answers ok', async () => {
    const { client, log } = fakeClient({})
    const getToken = countingTokens()

    expect(
      await submitContactFlow(contact, { client, getToken, locale: 'es' })
    ).toEqual({ kind: 'success', cvAttached: true })
    expect(log).toEqual(['contact:token-1'])
  })

  it('should return field errors when every rejected field is visible', async () => {
    const { client } = fakeClient({
      contact: [{ kind: 'validation', fields: ['email', 'need'] }],
    })

    expect(
      await submitContactFlow(contact, {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual({ kind: 'field-errors', fields: ['email', 'need'] })
  })

  it('should fail when a rejected field is not visible to the visitor', async () => {
    const { client } = fakeClient({
      contact: [{ kind: 'validation', fields: ['email', 'locale'] }],
    })

    expect(
      await submitContactFlow(contact, {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })

  it('should retry once with a fresh token and succeed when the first token was rejected', async () => {
    const { client, log } = fakeClient({ contact: [CHALLENGE] })

    expect(
      (
        await submitContactFlow(contact, {
          client,
          getToken: countingTokens(),
          locale: 'es',
        })
      ).kind
    ).toBe('success')
    expect(log).toEqual(['contact:token-1', 'contact:token-2'])
  })

  it('should fail after exactly two sends when both tokens are rejected', async () => {
    const { client, log } = fakeClient({ contact: [CHALLENGE, CHALLENGE] })

    expect(
      await submitContactFlow(contact, {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
    expect(log).toHaveLength(2)
  })

  it('should fail with zero API calls when no token can be obtained', async () => {
    const { client, log } = fakeClient({})
    const getToken = vi.fn(async () => {
      throw new Error('script blocked')
    })

    expect(
      await submitContactFlow(contact, { client, getToken, locale: 'es' })
    ).toEqual(FAILURE)
    expect(log).toEqual([])
  })

  it('should resolve to failure rather than throw when the payload cannot be built', async () => {
    const { client } = fakeClient({})

    expect(
      await submitContactFlow(
        { ...contact, identity: '' },
        { client, getToken: countingTokens(), locale: 'es' }
      )
    ).toEqual(FAILURE)
  })
})

describe('submitContactFlow · real client classification over a mocked fetch', () => {
  function clientAnswering(status: number, body: unknown) {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: async () =>
        typeof body === 'string' ? body : JSON.stringify(body),
    })
    return createFormsApiClient({
      baseUrl: 'https://api.test.invalid',
      fetchImpl,
    })
  }

  it.each([
    ['400 invalid_json', 400, { ok: false, error: 'invalid_json' }],
    ['200 with ok:false', 200, { ok: false }],
    ['500 internal_error', 500, { ok: false, error: 'internal_error' }],
    ['404 while the routes do not exist', 404, { message: 'Not Found' }],
  ])('should fail when the API answers %s', async (_label, status, body) => {
    expect(
      await submitContactFlow(contact, {
        client: clientAnswering(status, body),
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })
})

describe('submitApplicationFlow', () => {
  it('should send one application with one token and no upload when there is no CV', async () => {
    const { client, log, careersPayloads } = fakeClient({})

    expect(
      await submitApplicationFlow(application(), {
        client,
        getToken: countingTokens(),
        locale: 'en',
      })
    ).toEqual({ kind: 'success', cvAttached: true })
    expect(log).toEqual(['careers:token-1'])
    expect(careersPayloads[0]).not.toHaveProperty('cvId')
  })

  it('should upload, PUT, then apply with the grant cvId and two distinct tokens when a CV is chosen', async () => {
    const { client, log, careersPayloads } = fakeClient({})

    expect(
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual({ kind: 'success', cvAttached: true })
    expect(log).toEqual(['upload:token-1', 'put', 'careers:token-2'])
    expect(careersPayloads[0]?.cvId).toBe(GRANT.cvId)
    expect(client.requestCvUpload).toHaveBeenCalledWith({
      contentType: 'application/pdf',
      contentLength: cv.size,
      turnstileToken: 'token-1',
    })
    expect(client.putCv).toHaveBeenCalledWith(GRANT, cv)
  })

  it('should request the second token only after the PUT resolved', async () => {
    let finishPut: (outcome: CvUploadOutcome) => void = () => undefined
    const slowPut = new Promise<CvUploadOutcome>(resolve => {
      finishPut = resolve
    })
    const log: string[] = []
    const { client } = fakeClient({ put: [slowPut] })
    const getToken = countingTokens(log)

    const flow = submitApplicationFlow(application({ cv }), {
      client,
      getToken,
      locale: 'es',
    })
    await vi.waitFor(() => expect(client.putCv).toHaveBeenCalled())
    expect(getToken).toHaveBeenCalledTimes(1)

    finishPut('uploaded')
    await flow
    expect(getToken).toHaveBeenCalledTimes(2)
  })

  const cvFailures: [string, Parameters<typeof fakeClient>[0]][] = [
    ['the upload request fails', { upload: [FAILURE] }],
    [
      'the upload request is rejected as invalid',
      { upload: [{ kind: 'validation', fields: ['contentLength'] }] },
    ],
    ['both upload tokens are rejected', { upload: [CHALLENGE, CHALLENGE] }],
    ['the PUT fails or times out', { put: ['failed'] }],
  ]

  it.each(cvFailures)(
    'should still apply without cvId and flag the CV when %s',
    async (_label, script) => {
      const { client, careersPayloads } = fakeClient(script)

      expect(
        await submitApplicationFlow(application({ cv }), {
          client,
          getToken: countingTokens(),
          locale: 'es',
        })
      ).toEqual({ kind: 'success', cvAttached: false })
      expect(careersPayloads).toHaveLength(1)
      expect(careersPayloads[0]).not.toHaveProperty('cvId')
    }
  )

  it('should not PUT when the upload request failed', async () => {
    const { client } = fakeClient({ upload: [FAILURE] })

    await submitApplicationFlow(application({ cv }), {
      client,
      getToken: countingTokens(),
      locale: 'es',
    })

    expect(client.putCv).not.toHaveBeenCalled()
  })

  it('should fail with no CV note when the CV uploaded but the application failed', async () => {
    const { client } = fakeClient({ careers: [FAILURE] })

    expect(
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })

  it('should return field errors for the role when the server rejects areaRole', async () => {
    const { client } = fakeClient({
      careers: [{ kind: 'validation', fields: ['areaRole'] }],
    })

    expect(
      await submitApplicationFlow(application(), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual({ kind: 'field-errors', fields: ['areaRole'] })
  })

  it('should fail when the server rejects cvId, which the visitor cannot fix', async () => {
    const { client } = fakeClient({
      careers: [{ kind: 'validation', fields: ['cvId'] }],
    })

    expect(
      await submitApplicationFlow(application({ cv }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })

  it('should resolve to failure rather than throw when the role is not a select option', async () => {
    const { client } = fakeClient({})

    expect(
      await submitApplicationFlow(application({ areaRole: 'it' }), {
        client,
        getToken: countingTokens(),
        locale: 'es',
      })
    ).toEqual(FAILURE)
  })
})
