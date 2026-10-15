/**
 * The site identity every page's head reads (feature 35, data-model § 2).
 *
 * Deliberately NOT here:
 * - `name` (`muush`) and `url` (`https://muush.dev`) — declared once in
 *   `nuxt.config.ts` under `site` and read at render time through
 *   `useSiteConfig()`, so neither is typed twice.
 * - `sameAs` — derived from `SOCIAL_PROFILES` in `./socialProfiles.ts`, the
 *   single source of the three profile URLs.
 */

export const SITE_ALTERNATE_NAME = 'muush.dev'

/** The ink-500 logo PNG, 1710×1020 (spec D5; URL revised by Roberto 2026-10-15). */
export const SITE_LOGO_URL = 'https://assets.muush.dev/brand/logo/ink500.png'

export interface ShareImage {
  /** Absolute URL of the link-preview image, or `null` while there is none. */
  url: string | null
  width: number
  height: number
}

/**
 * TODO(D6): Roberto uploads a 1200×630 share image. Paste its absolute URL
 * in `url` — that is the whole change: every page then emits `og:image`
 * with this size and `twitter:card` switches from `summary` to
 * `summary_large_image` on its own (`resolveShareMeta`). If the image ships
 * at another size, update `width`/`height` here with it. The cover banner
 * `brand/cover/muush.png` was rejected for this (4:1, 2.8 MB).
 */
export const SHARE_IMAGE: ShareImage = {
  url: null,
  width: 1200,
  height: 630,
}
