import type {
  ApplicationFieldId,
  ApplicationFormValues,
  RoleId,
} from '@/features/forms/data/applicationFields'
import type {
  ContactFieldId,
  ContactFormValues,
  ContactPreference,
  IdentityOption,
} from '@/features/forms/data/contactFields'

/**
 * The browser's view of the Form Submission API. Source of truth:
 * `docs/business/landing/form-api-contract.md`; if this file and that
 * document ever disagree, the document wins and this file is wrong.
 *
 * Types and named constants only (Constitution Article II). No base URL and
 * no sitekey: both are `runtimeConfig.public` (spec FR-001), read only by
 * `logic/useFormSubmission.ts`.
 */

export type SiteLocale = 'es' | 'en'

/** `POST /contact` body — contract § 3. `whatsapp` exists only when the
 * preference is WhatsApp; the server rejects any other key (§ 6). */
export interface ContactPayload {
  name: string
  email: string
  company: string
  identity: IdentityOption
  need: string
  contactPreference: ContactPreference
  whatsapp?: string
  locale: SiteLocale
  turnstileToken: string
}

/** `POST /careers/upload` body — contract § 4. */
export interface CvUploadRequest {
  contentType: 'application/pdf'
  contentLength: number
  turnstileToken: string
}

/** `POST /careers/upload` success body — contract § 4. `headers` is signed
 * and is passed to the PUT as the very same object (spec FR-015). */
export interface CvUploadGrant {
  cvId: string
  uploadUrl: string
  method: string
  headers: Record<string, string>
}

/** `POST /careers` body — contract § 5. Optional keys are absent, not
 * empty, when they do not apply (spec Assumptions). */
export interface CareersPayload {
  name: string
  email: string
  areaRole: RoleId
  portfolio?: string
  linkedin?: string
  contactPreference: ContactPreference
  whatsapp?: string
  locale: SiteLocale
  cvId?: string
  turnstileToken: string
}

/** One API call, classified (research R5). */
export type ApiResult<T> =
  | { kind: 'ok'; body: T }
  | { kind: 'validation'; fields: string[] }
  | { kind: 'challenge' }
  | { kind: 'failure' }

/** What a form receives from its submitter (data-model § 3). */
export type SubmissionOutcome<F extends string = string> =
  /** `cvAttached` is `false` only when a CV was chosen and a CV step failed. */
  | { kind: 'success'; cvAttached: boolean }
  /** Every name maps to a visible input; otherwise the outcome is `failure`. */
  | { kind: 'field-errors'; fields: F[] }
  | { kind: 'failure' }

/**
 * The seam between pages and forms (contracts/form-submitter.md). `engage`
 * is idempotent and lazy-loads Turnstile into `host`; `submit` never throws.
 */
export interface ContactSubmitter {
  engage(host: HTMLElement): void
  submit(values: ContactFormValues): Promise<SubmissionOutcome<ContactFieldId>>
}

export interface ApplicationSubmitter {
  engage(host: HTMLElement): void
  submit(
    values: ApplicationFormValues
  ): Promise<SubmissionOutcome<ApplicationFieldId>>
}

/** Contract § 1. Appended to `runtimeConfig.public.formsApiBaseUrl`. */
export const API_PATHS = {
  contact: '/contact',
  careersUpload: '/careers/upload',
  careers: '/careers',
} as const

/** Contract § 2, explicit rendering (Cloudflare client-side rendering docs). */
export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/** Bounds an API call that never answers (research R6). */
export const API_REQUEST_TIMEOUT_MS = 15_000

/** Bounds the S3 PUT: 5 MiB at ~1 Mbit/s is ≈ 42 s (research R6). */
export const CV_PUT_TIMEOUT_MS = 60_000

/** Bounds a Turnstile token that never arrives (research R6). */
export const TURNSTILE_TOKEN_TIMEOUT_MS = 20_000

/**
 * Minimum time between the form becoming interactive and a submit. Approved
 * at the human gate on 2026-10-05 (spec OA-1): 3 s. Client-only; never sent.
 */
export const MIN_FILL_TIME_MS = 3_000

/** The honeypot input's `name` — innocuous, not an autofill token
 * (research R8). Never part of any payload. */
export const HONEYPOT_FIELD_NAME = 'muush_website'
