/**
 * The cookie categories of the preferences dialog (feature 48, frames
 * `V4sL7G` / `ev0kn`), from least to most invasive: Necesarias → Analítica →
 * Publicidad.
 *
 * Feature 49 adds "Analítica" (Google Analytics), Roberto 2026-11-06: no new
 * `.pen` design, the row is the existing `CookieCategoryRow` with its own two
 * locale keys. Each optional category governs one tool: `analytics` → Google
 * Analytics 4, `advertising` → Meta Pixel.
 *
 * A stored choice that does not cover every optional category counts as no
 * choice (`logic/consentRecord.ts`), so a feature 48 record (Publicidad
 * only) asks again.
 *
 * `necessary` is always on and has no switch ("Siempre activas").
 */
export const OPTIONAL_COOKIE_CATEGORIES = ['analytics', 'advertising'] as const

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
    id: 'analytics',
    nameKey: 'consent.categories.analytics.name',
    detailKey: 'consent.categories.analytics.detail',
    required: false,
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

/**
 * A stored choice, granted or refused, holds for 12 calendar months from
 * `decidedAt`; after that the banner asks again (Roberto, 2026-11-06; spec
 * FR-002). Checked when the page loads.
 */
export const CONSENT_LIFETIME_MONTHS = 12

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
