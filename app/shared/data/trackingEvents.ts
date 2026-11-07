/**
 * The closed catalogue of what the site may tell Google Analytics and Meta
 * (feature 49, tracking plan § 4, data-model § 2).
 *
 * Every parameter value is a fixed id from one of the lists below, a boolean
 * or a number: a free-text value cannot be typed in, so no name, email,
 * phone, company, "¿Qué necesitas?" text, website, CV data or URL a visitor
 * typed can ever reach an event (spec FR-021, FR-026). The single exception
 * is `generate_lead.userData`, which only the Meta sink reads (FR-030).
 *
 * It lives in `app/shared/` because five features emit these events
 * (`forms`, `legal`, `shell`, `landing`, `about`) and none of them may
 * import the `tracking` feature (Constitution Article III, research R1).
 * Types and constants only; `logic/trackingBus.ts` carries them.
 */

/**
 * Where a tracked CTA sits, audited on 2026-11-07 against every
 * `CALL_BOOKING_URL`, `SECTION_ANCHORS.assessment`, `wa.me` and `mailto:` use
 * under `app/` (task T030). The list is every place a CTA exists on the
 * built site, and nothing else:
 *
 * | Location       | CTA                                      | Source                                              |
 * |----------------|------------------------------------------|-----------------------------------------------------|
 * | `nav`          | "Diagnóstico gratis"                     | shell `data/navigation.ts` `NAV_CTA`                |
 * | `hero`         | "Diagnóstico gratis"                     | landing `ui/HeroSection.vue` (`data/heroContent.ts`) |
 * | `footer`       | Diagnóstico, Agenda una llamada, correo, WhatsApp | shell `data/footerColumns.ts`, `data/contactChannels.ts` (both footers) |
 * | `faq`          | Diagnóstico gratis, Agenda una llamada   | shell `data/faq.ts`                                 |
 * | `not_found`    | "Diagnóstico gratis"                     | shell `data/notFound.ts` `NOT_FOUND_ASSESSMENT`     |
 * | `assessment`   | "¿Prefieres hablar? Agenda una llamada"  | landing `ui/AssessmentSection.vue` (`data/assessmentContent.ts`) |
 * | `form_success` | "Agenda una llamada" after a sent assessment | forms `logic/useContactFormContent.ts`          |
 * | `send_notice`  | support@muush.dev in the send-error notice | forms `ui/SendNotice.vue` (both forms)            |
 *
 * `mobile_menu`, in the tracking plan's starting set, is not here: the open
 * mobile menu carries no CTA (shell `data/navigation.ts`, `MENU_ITEMS` is
 * the link bar). `assessment` and `send_notice` were added by the audit.
 * The application form's "Volver al inicio" and the legal pages' plain-text
 * address are not CTAs.
 */
export const CTA_LOCATIONS = [
  'nav',
  'hero',
  'footer',
  'faq',
  'not_found',
  'assessment',
  'form_success',
  'send_notice',
] as const
export type CtaLocation = (typeof CTA_LOCATIONS)[number]

export const CONTACT_CHANNELS = ['whatsapp', 'email'] as const
export type ContactChannelId = (typeof CONTACT_CHANNELS)[number]

export const FORM_IDS = ['assessment', 'application'] as const
export type FormId = (typeof FORM_IDS)[number]

export const FORM_ERROR_TYPES = [
  'validation',
  'challenge_failed',
  'network',
  'server',
] as const
export type FormErrorType = (typeof FORM_ERROR_TYPES)[number]

/** Why a send failed, as `forms` reports it: every type but `validation`. */
export type FormFailureType = Exclude<FormErrorType, 'validation'>

/**
 * Every field id of the two forms, ids only. Declared here rather than
 * derived from `forms` (a shared file may not import a feature); `forms`
 * emits its own `ContactFieldId` / `ApplicationFieldId` into this type, so a
 * field added there without being added here fails to compile.
 */
export const FORM_FIELD_IDS = [
  'name',
  'email',
  'company',
  'identity',
  'website',
  'need',
  'contactPreference',
  'whatsappCountry',
  'whatsapp',
  'areaRole',
  'portfolio',
  'linkedin',
  'cv',
] as const
export type FormFieldId = (typeof FORM_FIELD_IDS)[number]

export const CV_RESULTS = ['ok', 'too_large', 'not_pdf'] as const
export type CvResult = (typeof CV_RESULTS)[number]

/** `form_response.result` (Roberto, 2026-11-07). */
export const FORM_RESPONSE_RESULTS = ['ok', 'error'] as const

export const PAGE_KEYS = ['home', 'about'] as const
export type PageKey = (typeof PAGE_KEYS)[number]

export const HOME_SECTIONS = [
  'hero',
  'who_we_are',
  'services',
  'how_we_work',
  'assessment',
] as const
export type HomeSection = (typeof HOME_SECTIONS)[number]

export const ABOUT_SECTIONS = [
  'hero',
  'how_it_comes_together',
  'where_we_are',
  'work_with_us',
] as const
export type AboutSection = (typeof ABOUT_SECTIONS)[number]

export type TrackedSection = HomeSection | AboutSection

export const SITE_LOCALES = ['es', 'en'] as const
export type TrackedLocale = (typeof SITE_LOCALES)[number]

export type ContactPreferenceId = 'email' | 'whatsapp'

/**
 * Advanced matching for the Meta `Lead` (spec FR-030): the assessment's
 * email and, only with WhatsApp, its phone as dial code + digits. Never read
 * by the Google Analytics sink.
 */
export interface LeadUserData {
  email: string
  phone?: string
}

export type TrackingEvent =
  | { name: 'assessment_cta_click'; params: { cta_location: CtaLocation } }
  | { name: 'book_call_click'; params: { cta_location: CtaLocation } }
  | {
      name: 'contact_click'
      params: { channel: ContactChannelId; cta_location: CtaLocation }
    }
  | { name: 'form_view'; params: { form: FormId } }
  | { name: 'form_start'; params: { form: FormId } }
  | { name: 'form_step'; params: { form: FormId; step: 1 | 2 } }
  | { name: 'form_submit'; params: { form: FormId } }
  | {
      name: 'form_error'
      params:
        | { form: FormId; error_type: 'validation'; field: FormFieldId }
        | { form: FormId; error_type: FormFailureType }
    }
  | {
      name: 'generate_lead'
      params: { form: 'assessment'; contact_preference: ContactPreferenceId }
      userData?: LeadUserData
    }
  | {
      /** GA4 only (Roberto, 2026-11-07): the form's API call finished. */
      name: 'form_response'
      params:
        | { form: FormId; result: (typeof FORM_RESPONSE_RESULTS)[0] }
        | {
            form: FormId
            result: (typeof FORM_RESPONSE_RESULTS)[1]
            error_type: FormErrorType
          }
    }
  | { name: 'cv_attached'; params: { result: CvResult } }
  | {
      name: 'application_submit'
      params: { form: 'application'; with_cv: boolean }
    }
  | {
      name: 'language_change'
      params: { from_locale: TrackedLocale; to_locale: TrackedLocale }
    }
  | {
      name: 'section_view'
      params: {
        page_key: PageKey
        section: TrackedSection
        section_seconds: number
      }
      /** Flushed while the page hides: sent with a transport that survives
       * unload (tracking plan § 5). */
      beacon?: boolean
    }
  | { name: 'cookie_preferences'; params: { analytics: boolean; ads: boolean } }

export type TrackingEventName = TrackingEvent['name']

export const CLICK_EVENT_NAMES = [
  'assessment_cta_click',
  'book_call_click',
  'contact_click',
] as const

/** The three events a click on a link produces. */
export type ClickTrackingEvent = Extract<
  TrackingEvent,
  { name: (typeof CLICK_EVENT_NAMES)[number] }
>

export type TrackAttrs = Record<`data-track${string}`, string>

/**
 * The `data-track*` attributes a CTA carries so the tracking feature's one
 * delegated listener can report its click (research R1, contract § 6). The
 * listener parses them back and drops any value outside its closed list.
 */
export function trackAttrs(event: ClickTrackingEvent): TrackAttrs {
  return {
    'data-track': event.name,
    'data-track-location': event.params.cta_location,
    ...(event.name === 'contact_click' && {
      'data-track-channel': event.params.channel,
    }),
  }
}
