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
import type {
  FormErrorType,
  FormId,
  LeadUserData,
} from '@/shared/data/trackingEvents'
import { emitTrackingEvent } from '@/shared/logic/trackingBus'
import { dialCodeOf } from './countryOptions'
import type { FormsApiClient } from './formsApiClient'
import { sendWithFreshToken } from './sendWithFreshToken'
import {
  APPLICATION_SERVER_ERROR_KEYS,
  CONTACT_SERVER_ERROR_KEYS,
  resolveServerFields,
} from './serverFieldErrors'
import {
  buildCareersPayload,
  buildContactPayload,
  whatsappDigits,
} from './submissionPayloads'

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
 *
 * Feature 49: a confirmed send is reported on the tracking bus, here and
 * only here, because only here is it confirmed: `generate_lead` for the
 * assessment and `application_submit` for the talent application. A
 * failure carries its `reason` for the form's `form_error`. Every attempt
 * whose API call finished also reports `form_response` (GA4 only; Roberto,
 * 2026-11-07), ok or typed error, once, after the token retry. Nothing is sent
 * anywhere unless the visitor accepted a cookie category (the bus is a
 * no-op without a subscribed sink).
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
  if (result.kind === 'challenge') {
    return { kind: 'failure', reason: 'challenge_failed' }
  }
  if (result.kind === 'failure' && result.network) {
    return { kind: 'failure', reason: 'network' }
  }
  return { kind: 'failure', reason: 'server' }
}

/** `form_response.error_type` for an API answer that was not `ok`. A 400
 * is `validation` whatever its fields, unlike `form_error`, which reports a
 * 400 the visitor cannot fix as `server`. */
function responseErrorType(result: ApiResult<unknown>): FormErrorType {
  if (result.kind === 'validation') return 'validation'
  if (result.kind === 'challenge') return 'challenge_failed'
  if (result.kind === 'failure' && result.network) return 'network'
  return 'server'
}

function reportResponse(
  form: FormId,
  result: ApiResult<unknown> | { kind: 'put-failed' }
): void {
  emitTrackingEvent({
    name: 'form_response',
    params:
      result.kind === 'ok'
        ? { form, result: 'ok' }
        : {
            form,
            result: 'error',
            /* A CV PUT that did not answer 200 (S3 refused it, or the
               request never completed: the client cannot tell them apart). */
            error_type:
              result.kind === 'put-failed'
                ? 'server'
                : responseErrorType(result),
          },
  })
}

/** Whether `sendWithFreshToken` reached the API. It answers a plain
 * `failure` without calling `send` when no token could be obtained. */
function trackedSend<T>(
  getToken: () => Promise<string>,
  send: (token: string) => Promise<ApiResult<T>>
): Promise<{ result: ApiResult<T>; called: boolean }> {
  let called = false
  return sendWithFreshToken(getToken, token => {
    called = true
    return send(token)
  }).then(result => ({ result, called }))
}

/** A throw inside a flow: a defect, never the network (FR-064's limit). */
const UNEXPECTED_FAILURE = { kind: 'failure', reason: 'server' } as const

/**
 * Meta advanced matching for the confirmed assessment (feature 49, FR-030):
 * the email and, only with WhatsApp, the phone as dial code + digits. No
 * other value of the form; the Meta sink normalises and the pixel hashes.
 * Never read by Google Analytics.
 */
export function leadUserData(values: ContactFormValues): LeadUserData {
  const email = values.email.trim()
  if (values.contactPreference !== 'whatsapp') return { email }
  const digits = whatsappDigits(values.whatsapp)
  return { email, phone: `${dialCodeOf(values.whatsappCountry)}${digits}` }
}

function reportLead(values: ContactFormValues): void {
  emitTrackingEvent({
    name: 'generate_lead',
    params: {
      form: 'assessment',
      contact_preference: values.contactPreference,
    },
    userData: leadUserData(values),
  })
}

export async function submitContactFlow(
  values: ContactFormValues,
  { client, getToken, locale }: FlowDeps
): Promise<SubmissionOutcome<ContactFieldId>> {
  try {
    const { result, called } = await trackedSend(getToken, token =>
      client.postContact(buildContactPayload(values, locale, token))
    )
    if (called) reportResponse('assessment', result)
    const outcome = toOutcome<ContactFieldId>(result, fields =>
      resolveServerFields(fields, CONTACT_SERVER_ERROR_KEYS, values)
    )
    if (outcome.kind === 'success') reportLead(values)
    return outcome
  } catch {
    return UNEXPECTED_FAILURE
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
  const { result: grant, called } = await trackedSend(getToken, token =>
    client.requestCvUpload({
      contentType: CV_ACCEPTED_TYPE,
      contentLength: file.size,
      turnstileToken: token,
    })
  )
  if (grant.kind !== 'ok') {
    if (called) reportResponse('application', grant)
    return undefined
  }
  const upload = await client.putCv(grant.body, file)
  if (upload === 'uploaded') return grant.body.cvId
  reportResponse('application', { kind: 'put-failed' })
  return undefined
}

function sendApplication(
  values: ApplicationFormValues,
  deps: FlowDeps,
  cvId: string | undefined
): Promise<SubmissionOutcome<ApplicationFieldId>> {
  return trackedSend(deps.getToken, token =>
    deps.client.postCareers(
      buildCareersPayload(values, deps.locale, token, cvId)
    )
  ).then(({ result, called }) => {
    if (called) reportResponse('application', result)
    const outcome = toOutcome<ApplicationFieldId>(result, fields =>
      resolveServerFields(fields, APPLICATION_SERVER_ERROR_KEYS, values)
    )
    if (outcome.kind === 'success') {
      emitTrackingEvent({
        name: 'application_submit',
        params: { form: 'application', with_cv: cvId !== undefined },
      })
    }
    return outcome
  })
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
    return UNEXPECTED_FAILURE
  }
}
