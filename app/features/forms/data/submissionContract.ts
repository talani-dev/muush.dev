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

/**
 * `POST /careers/upload` success body — contract § 4 — narrowed to what the
 * S3 PUT uses (feature 031, data-model § 1). `contentType` is the body's
 * `headers['content-type']`, sent verbatim; the signed `content-length` is
 * deliberately not kept, because the browser derives it from the untouched
 * `File` (feature 031 research R2). `uploadUrl` is a temporary credential:
 * used for exactly one PUT, never stored past its attempt, never logged.
 */
export interface CvUploadGrant {
  cvId: string
  uploadUrl: string
  contentType: string
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

/**
 * What a form receives from its submitter (data-model § 3). No outcome means
 * "sent without the CV the visitor chose" (feature 031 FR-001, FR-006).
 */
export type SubmissionOutcome<F extends string = string> =
  | { kind: 'success' }
  /** Every name maps to a visible input; otherwise the outcome is `failure`. */
  | { kind: 'field-errors'; fields: F[] }
  /** A chosen CV could not be uploaded; the application was NOT sent. Only
   * the application flow produces it (feature 031 FR-002). */
  | { kind: 'cv-upload-failed' }
  | { kind: 'failure' }

/** Lets the application flow tell the form the CV is uploaded and the
 * application itself is now being sent (feature 031 FR-012). */
export interface SubmissionProgress {
  /** Called once, right after a PUT answered 200 and before `/careers`. */
  cvUploaded(): void
}

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
    values: ApplicationFormValues,
    progress?: SubmissionProgress
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

/** Bounds the S3 PUT: 5 MiB at ~1 Mbit/s is ≈ 42 s. Approved at the
 * feature 031 gate on 2026-10-13 (spec OA-3); exceeding it is a CV upload
 * failure, never a silent send without the CV. */
export const CV_PUT_TIMEOUT_MS = 60_000

/** Contract § 4: the only upload method a grant may carry. */
export const CV_UPLOAD_METHOD = 'PUT'

/** The only S3 answer that confirms the upload (feature 031 description);
 * any other status, 2xx included, is a failure. */
export const S3_PUT_SUCCESS_STATUS = 200

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
