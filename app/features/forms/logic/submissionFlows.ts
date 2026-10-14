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
  SubmissionProgress,
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
  visibleFields: (serverFields: string[]) => F[] | undefined
): SubmissionOutcome<F> {
  if (result.kind === 'ok') return { kind: 'success' }
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
    return toOutcome<ContactFieldId>(result, fields =>
      resolveServerFields(fields, CONTACT_SERVER_ERROR_KEYS, values)
    )
  } catch {
    return { kind: 'failure' }
  }
}

/**
 * Upload authorization → S3 PUT → `cvId`, or `undefined` if any step fails
 * (a grant that is not `ok` after its single 403 retry, a malformed grant, a
 * PUT that did not answer 200). The caller turns `undefined` into
 * `cv-upload-failed` and sends nothing else: a chosen CV is never dropped in
 * silence (feature 031 FR-001/FR-002, Roberto's decision of 2026-10-13,
 * which supersedes contract § 7.5 / § 9).
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

function sendApplication(
  values: ApplicationFormValues,
  deps: FlowDeps,
  cvId: string | undefined
): Promise<SubmissionOutcome<ApplicationFieldId>> {
  return sendWithFreshToken(deps.getToken, token =>
    deps.client.postCareers(
      buildCareersPayload(values, deps.locale, token, cvId)
    )
  ).then(result =>
    toOutcome<ApplicationFieldId>(result, fields =>
      resolveServerFields(fields, APPLICATION_SERVER_ERROR_KEYS, values)
    )
  )
}

/**
 * One self-contained attempt. Nothing (grant, `uploadUrl`, `cvId`, token)
 * survives the call, so every retry necessarily gets a new grant and new
 * tokens (feature 031 FR-007/FR-008, research R5).
 */
export async function submitApplicationFlow(
  values: ApplicationFormValues,
  deps: FlowDeps,
  progress?: SubmissionProgress
): Promise<SubmissionOutcome<ApplicationFieldId>> {
  try {
    if (values.cv === null)
      return await sendApplication(values, deps, undefined)
    /* Even a throwing client step ends as a CV failure, never as a send. */
    const cvId = await uploadCv(values.cv, deps).catch(() => undefined)
    if (cvId === undefined) return { kind: 'cv-upload-failed' }
    progress?.cvUploaded()
    /* The application's token is requested only now, after the PUT settled:
       never in parallel with a slow upload (feature 029 spec Edge Cases). */
    return await sendApplication(values, deps, cvId)
  } catch {
    return { kind: 'failure' }
  }
}
