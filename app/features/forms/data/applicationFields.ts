import type { ContactPreference } from '@/features/forms/data/contactFields'

/**
 * The application form's field model — the "Work with muush" section's eight
 * fields. Source of truth: `docs/business/landing/ui-map.md` § 9, plus this
 * feature's own resolved assumptions for the two gaps ui-map.md § 9 itself
 * flags (§ 2, § 3 below).
 *
 * Plain types and named constants only — no Vue, no Nuxt, no validation
 * logic. `logic/useApplicationForm.ts` imports this; this file imports
 * nothing but `contactFields.ts`'s `ContactPreference`, re-exported rather
 * than redeclared so the two forms' radio share one type
 * (Constitution Article II — `data/` never imports from `logic/`/`ui/`, and
 * `contactFields.ts` is itself a `data/` file, so this stays within the same
 * layer).
 */

export type ApplicationFieldId =
  | 'name'
  | 'email'
  | 'areaRole'
  | 'portfolio'
  | 'linkedin'
  | 'cv'
  | 'contactPreference'
  | 'whatsapp'

export type { ContactPreference } from '@/features/forms/data/contactFields'

/**
 * Field order also fixes the "focus first invalid field" order
 * (`data-model.md` § 1): `Object.keys(errors)` walks a plain object in
 * insertion order, so building the values (and the errors they can produce)
 * in this exact order is what makes that rule free rather than a second sort
 * step — the same mechanism `contactFields.ts`'s `ContactFormValues` uses.
 */
export interface ApplicationFormValues {
  name: string
  email: string
  /** `''` unless a role (never an area header) is picked. */
  areaRole: string
  /** `''` is valid — optional field (FR-009). */
  portfolio: string
  /** `''` is valid — optional field (FR-009). */
  linkedin: string
  /** Never serialized, never sent (FR-011). */
  cv: File | null
  contactPreference: ContactPreference
  /** `''` unless `contactPreference === 'whatsapp'` (FR-013). */
  whatsapp: string
}

export type ApplicationFormErrors = Partial<Record<ApplicationFieldId, string>>

export function initialApplicationFormValues(): ApplicationFormValues {
  return {
    name: '',
    email: '',
    areaRole: '',
    portfolio: '',
    linkedin: '',
    cv: null,
    contactPreference: 'email',
    whatsapp: '',
  }
}

/** Same rule as `contactFields.ts`'s `NAME_MIN_LENGTH` (`ui-map.md` § 9). */
export const NAME_MIN_LENGTH = 2

/** Same pattern as `contactFields.ts`'s `EMAIL_PATTERN` — not RFC-complete,
 * and not meant to be. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * `ui-map.md` § 9 says "mismo campo condicional" for the WhatsApp number,
 * without restating a digit count for this form specifically — reused by
 * symmetry from `contactFields.ts`'s `WHATSAPP_MX_DIGIT_COUNT` (spec
 * Assumptions), not redeclared as a second, coincidentally-equal constant.
 */
export { WHATSAPP_MX_DIGIT_COUNT } from '@/features/forms/data/contactFields'

/**
 * ⚠️ Open business decision — `docs/business/landing/decisions-open.md` #7,
 * owned by Roberto/Clau. Ships `false` (matching that document's own recorded
 * recommendation: "opcional, con portafolio/LinkedIn como respaldo").
 * Consumed in exactly one place inside `validateApplicationForm` — flipping
 * it later is a one-line change, not a validation rewrite (plan.md D-5).
 */
export const CV_REQUIRED = false

/** `ui-map.md` § 9: "máximo 5MB propuesto" — a proposal, not a confirmed
 * value (spec Assumptions). */
export const CV_MAX_BYTES = 5 * 1024 * 1024

export const CV_ACCEPTED_TYPE = 'application/pdf'

/**
 * The six confirmed "Área y rol" area headers (`ui-map.md` § 9). Areas are
 * group labels, never a selectable value themselves.
 */
export type AreaId =
  | 'it'
  | 'product'
  | 'projectManagement'
  | 'sales'
  | 'marketing'
  | 'creative'

export interface RoleCatalogEntry {
  area: AreaId
  roleIds: string[]
}

/**
 * The real per-area role catalogue, given verbatim by Roberto (feature 24,
 * 2026-09-08) — closes the `⚠️ UNVERIFIED placeholder — owner Clau` this
 * array used to carry, which no file this project can read (`content.md`,
 * `design-extract.md`, the Notion source `ui-map.md` itself defers to)
 * documented.
 *
 * `'infrastructureCloud'` and `'performanceMedia'` are each ONE combined
 * role ("Infrastructure y Cloud", "Performance y pauta") — confirmed
 * explicitly with Roberto, never split into two roles.
 */
export const ROLE_CATALOG: RoleCatalogEntry[] = [
  {
    area: 'it',
    roleIds: [
      'backend',
      'frontend',
      'fullStack',
      'mobile',
      'devOps',
      'infrastructureCloud',
    ],
  },
  {
    area: 'product',
    roleIds: [
      'productManager',
      'productOwner',
      'uxResearch',
      'uxUiDesign',
      'productDesign',
      'designSystems',
    ],
  },
  { area: 'projectManagement', roleIds: ['projectManager'] },
  { area: 'sales', roleIds: ['sales', 'accountManagement', 'partnerships'] },
  {
    area: 'marketing',
    roleIds: [
      'growth',
      'performanceMedia',
      'content',
      'seo',
      'communityManagement',
    ],
  },
  {
    area: 'creative',
    roleIds: ['design3d', 'graphicDesign', 'blogStorytelling'],
  },
]

/**
 * What `logic/`/`ui/` receive: already-translated field content, resolved by
 * whichever module composes `ApplicationForm` (`about` for this feature) —
 * same shape `ContactFormContent` establishes for the sibling form.
 */
export interface ApplicationFormFieldContent {
  label: string
  placeholder?: string
  errorRequired?: string
  errorFormat?: string
  errorSize?: string
  errorDigits?: string
}

export interface ApplicationFormContent {
  fields: {
    name: ApplicationFormFieldContent
    email: ApplicationFormFieldContent
    /** `placeholder` is required here (unlike the base shape): `SelectField`'s
     * placeholder prop is required, not optional. */
    areaRole: ApplicationFormFieldContent & {
      placeholder: string
      areas: Record<AreaId, string>
      /** Keyed by area then role id — mirrors `ROLE_CATALOG`'s shape. */
      roles: Record<AreaId, Record<string, string>>
    }
    portfolio: ApplicationFormFieldContent
    linkedin: ApplicationFormFieldContent
    /** `placeholder` is required here for the same reason as `areaRole`:
     * `FileField`'s placeholder prop is required. */
    cv: ApplicationFormFieldContent & { placeholder: string }
    contactPreference: ApplicationFormFieldContent & {
      options: Record<ContactPreference, string>
    }
    whatsapp: ApplicationFormFieldContent
  }
  submit: string
  /** Story-only copy — the shipped page never reaches this state (FR-004). */
  sending: string
  success: { title: string }
  error: { title: string; fallback: string }
}
