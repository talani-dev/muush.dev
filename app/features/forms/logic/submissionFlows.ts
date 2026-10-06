import {
  type ApplicationFieldId,
  type ApplicationFormValues,
  CV_ACCEPTED_TYPE,
} from '@/features/forms/data/applicationFields'
import type {
  ContactFieldId,
  ContactFormValues,
} from '@/features/forms/data/contactFields'
import type {
  ApiResult,
  SiteLocale,
  SubmissionOutcome,
} from '@/features/forms/data/submissionContract'
import type { FormsApiClient } from './formsApiClient'
import { sendWithFreshToken } from './sendWithFreshToken'
import {
  APPLICATION_SERVER_ERROR_KEYS,
  CONTACT_SERVER_ERROR_KEYS,
  resolveServerFields,
} from './serverFieldErrors'
import { buildCareersPayload, buildContactPayload } from './submissionPayloads'

/**
 * The two submissions end to end, as pure async functions with every
 * dependency injected (contracts/forms-api-client.md § Flows).
 *
 * The "no fake success" guarantee lives here now (spec FR-012): `success` is
 * produced in exactly one place, `toOutcome`, and only from an `ok` result —
 * which `classifyApiResponse` gives only for a 200 with `ok: true`.
 *
 * Neither flow ever throws; every failure resolves to an outcome the form can
 * show.
 */

export interface FlowDeps {
  client: FormsApiClient
  getToken: () => Promise<string>
  locale: SiteLocale
}

function toOutcome<F extends string>(
  result: ApiResult<unknown>,
  visibleFields: (serverFields: string[]) => F[] | undefined,
  cvAttached: boolean
): SubmissionOutcome<F> {
  if (result.kind === 'ok') return { kind: 'success', cvAttached }
  if (result.kind === 'validation') {
    const fields = visibleFields(result.fields)
    if (fields) return { kind: 'field-errors', fields }
  }
  return { kind: 'failure' }
}

export async function submitContactFlow(
  values: ContactFormValues,
  { client, getToken, locale }: FlowDeps
): Promise<SubmissionOutcome<ContactFieldId>> {
  try {
    const result = await sendWithFreshToken(getToken, token =>
      client.postContact(buildContactPayload(values, locale, token))
    )
    return toOutcome<ContactFieldId>(
      result,
      fields => resolveServerFields(fields, CONTACT_SERVER_ERROR_KEYS, values),
      true
    )
  } catch {
    return { kind: 'failure' }
  }
}

/**
 * Upload authorization → S3 PUT → `cvId`, or `undefined` if any step fails.
 * Every failure here — including a `validation` on the upload request — is
 * swallowed: losing the attachment is acceptable, losing the candidate is not
 * (contract § 7.5).
 */
async function uploadCv(
  file: File,
  { client, getToken }: FlowDeps
): Promise<string | undefined> {
  const grant = await sendWithFreshToken(getToken, token =>
    client.requestCvUpload({
      contentType: CV_ACCEPTED_TYPE,
      contentLength: file.size,
      turnstileToken: token,
    })
  )
  if (grant.kind !== 'ok') return undefined
  const upload = await client.putCv(grant.body, file)
  return upload === 'uploaded' ? grant.body.cvId : undefined
}

export async function submitApplicationFlow(
  values: ApplicationFormValues,
  deps: FlowDeps
): Promise<SubmissionOutcome<ApplicationFieldId>> {
  try {
    const cvId = values.cv ? await uploadCv(values.cv, deps) : undefined
    /* The application's token is requested only now, after the PUT settled:
       never in parallel with a slow upload (spec Edge Cases). */
    const result = await sendWithFreshToken(deps.getToken, token =>
      deps.client.postCareers(
        buildCareersPayload(values, deps.locale, token, cvId)
      )
    )
    return toOutcome<ApplicationFieldId>(
      result,
      fields =>
        resolveServerFields(fields, APPLICATION_SERVER_ERROR_KEYS, values),
      values.cv === null || cvId !== undefined
    )
  } catch {
    return { kind: 'failure' }
  }
}
