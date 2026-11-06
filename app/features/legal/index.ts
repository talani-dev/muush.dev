/**
 * The legal module's only public API (Constitution Article III), feature 48.
 *
 * - The two legal pages: `LegalArticle` with its content seam and the two
 *   page models, plus the index's scroll-spy.
 * - Cookie consent: `CookieConsent` (banner + preferences, rendered once
 *   by the layout) and `useCookieConsent`, the seam feature 49 reads before
 *   loading any tracking script (`isGranted('advertising')`).
 */
export type {
  ConsentRecord,
  CookieChoice,
  OptionalCookieCategory,
} from './data/cookieCategories'
export { OPTIONAL_COOKIE_CATEGORIES } from './data/cookieCategories'
export { PRIVACY_NOTICE } from './data/privacyNotice'
export { TERMS_AND_CONDITIONS } from './data/termsAndConditions'
export type { LegalPageContent, LegalPageModel } from './data/types'
export { useCookieConsent } from './logic/useCookieConsent'
export { useLegalPageContent } from './logic/useLegalPageContent'
export { useLegalScrollSpy } from './logic/useLegalScrollSpy'
export { default as CookieConsent } from './ui/CookieConsent.vue'
export { default as LegalArticle } from './ui/LegalArticle.vue'
