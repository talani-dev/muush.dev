/**
 * The section ids the shell links to (feature 43, spec FR-025, data-model
 * § 1), declared once so the shell and the pages that own the sections
 * cannot disagree. Ids are bare; a hash is built where one is needed.
 *
 * Owners of the sections that carry them:
 *
 * - `servicios`, `como-trabajamos`: home, feature 44 (until then the v1
 *   Services section carries `servicios`; `como-trabajamos` has no section).
 * - `diagnostico`: home, feature 45 (until then the v1 Contact section).
 * - `trabaja-con-muush`: Nosotros, feature 46 (until then the v1 Work with
 *   muush section).
 *
 * It lives in `app/shared/` because three features read it (shell, landing,
 * about) and Constitution Article III allows no other common place.
 */
export const SECTION_ANCHORS = {
  services: 'servicios',
  howWeWork: 'como-trabajamos',
  assessment: 'diagnostico',
  workWithUs: 'trabaja-con-muush',
} as const

export type SectionAnchor =
  (typeof SECTION_ANCHORS)[keyof typeof SECTION_ANCHORS]
