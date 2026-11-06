/**
 * The cookie categories of the preferences dialog, in the `.pen`'s order
 * (feature 48, frames `V4sL7G` / `ev0kn`).
 *
 * Categories are data so that adding one is one entry here plus its two
 * locale keys: Clau may add "Analítica" (Google Analytics), which would be
 * `{ id: 'analytics', … }` and a member of `OptionalCookieCategory`.
 * A stored choice that does not cover every optional category counts as no
 * choice (`logic/consentRecord.ts`), so a new category asks again.
 *
 * `necessary` is always on and has no switch ("Siempre activas").
 */
export const OPTIONAL_COOKIE_CATEGORIES = ['advertising'] as const

export type OptionalCookieCategory = (typeof OPTIONAL_COOKIE_CATEGORIES)[number]

export type CookieCategoryId = 'necessary' | OptionalCookieCategory

export interface CookieCategoryModel {
  id: CookieCategoryId
  nameKey: string
  detailKey: string
  /** Always on: shown with the "Siempre activas" pill, never a switch. */
  required: boolean
}

export const COOKIE_CATEGORIES: CookieCategoryModel[] = [
  {
    id: 'necessary',
    nameKey: 'consent.categories.necessary.name',
    detailKey: 'consent.categories.necessary.detail',
    required: true,
  },
  {
    id: 'advertising',
    nameKey: 'consent.categories.advertising.name',
    detailKey: 'consent.categories.advertising.detail',
    required: false,
  },
]

/** The visitor's answer for every optional category. */
export type CookieChoice = Record<OptionalCookieCategory, boolean>

/**
 * What is stored in `localStorage` under `CONSENT_STORAGE_KEY`: a small
 * versioned record (leader default, pen-extract-48 § 4). `version` changes
 * only when this shape does; a new category does not need it.
 */
export interface ConsentRecord {
  version: typeof CONSENT_RECORD_VERSION
  /** ISO 8601, when the visitor decided. */
  decidedAt: string
  categories: CookieChoice
}

export const CONSENT_RECORD_VERSION = 1

export const CONSENT_STORAGE_KEY = 'muush.cookie-consent'

/** Resolved for `ui/`: copy already translated. */
export interface ResolvedCookieCategory {
  id: CookieCategoryId
  name: string
  detail: string
  required: boolean
}

export interface CookieConsentCopy {
  banner: { title: string; body: string; customize: string }
  actions: { rejectAll: string; acceptAll: string; save: string }
  preferences: {
    title: string
    close: string
    intro: { before: string; link: string; after: string; href: string }
  }
  alwaysOn: string
  categories: ResolvedCookieCategory[]
}
