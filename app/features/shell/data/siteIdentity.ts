/**
 * The site identity every page's head reads (feature 35, data-model § 2).
 *
 * Deliberately NOT here:
 * - `name` (`muush`) and `url` (`https://muush.dev`) — declared once in
 *   `nuxt.config.ts` under `site` and read at render time through
 *   `useSiteConfig()`, so neither is typed twice.
 * - `sameAs` — derived from `SOCIAL_PROFILES` in `./socialProfiles.ts`, the
 *   single source of the four profile URLs.
 */

export const SITE_ALTERNATE_NAME = 'muush.dev'

/** The ink-500 logo PNG, 1710×1020 (spec D5; URL revised by Roberto 2026-10-15). */
export const SITE_LOGO_URL = 'https://assets.muush.dev/brand/logo/ink500.png'

export type ShareImageType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'image/avif'

export interface ShareImage {
  /** Absolute URL of the link-preview image, or `null` while there is none. */
  url: string | null
  width: number
  height: number
  /** MIME type, emitted as `og:image:type` — the set unhead's `useSeoMeta` accepts. */
  type: ShareImageType
  /** Alternative text, emitted as `og:image:alt`. The same on both locales. */
  alt: string
}

/**
 * The 1200×630 share image (spec D6, approved by the designer), every
 * page's `og:image`. The file lives in the public assets bucket
 * (`assets.muush.dev`, like `SITE_LOGO_URL`), not in `public/`: the site
 * ships no copy of its own. Open Graph needs an absolute URL.
 *
 * A changed image needs a NEW file name, never an overwrite: WhatsApp and
 * LinkedIn cache share images by URL, so an overwritten file keeps showing
 * the old picture. If the new file has another size or format, update
 * `width`/`height`/`type` with it. Setting `url` to `null` drops every
 * image tag and returns `twitter:card` to `summary` (`resolveShareMeta`).
 */
export const SHARE_IMAGE: ShareImage = {
  url: 'https://assets.muush.dev/brand/cover/og-image.png',
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: 'muush',
}
