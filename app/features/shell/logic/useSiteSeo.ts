import {
  SHARE_IMAGE,
  SITE_ALTERNATE_NAME,
  SITE_LOGO_URL,
} from '@/features/shell/data/siteIdentity'
import { SOCIAL_PROFILES } from '@/features/shell/data/socialProfiles'
import { profileUrls } from './profileUrls'
import { resolveShareMeta } from './resolveShareMeta'

/**
 * The head tags every page shares (feature 35), called once from the
 * layout: `og:type`, `og:site_name`, `twitter:card` (plus the share image
 * once it exists) and the one JSON-LD `Organization` (spec D5).
 *
 * `name` and `url` come from `site` in `nuxt.config.ts` via
 * `useSiteConfig()`; `sameAs` is derived from `SOCIAL_PROFILES`, so no
 * profile URL is written twice (FR-009).
 *
 * The structured data is server-only — see `usePageSeo` for why the
 * `import.meta.server` guard is load-bearing.
 */
export function useSiteSeo(): void {
  const { name, url } = useSiteConfig()

  useSeoMeta({
    ogType: 'website',
    ogSiteName: name,
    ...resolveShareMeta(SHARE_IMAGE),
  })

  if (!import.meta.server) return

  useSchemaOrg([
    defineOrganization({
      name,
      alternateName: SITE_ALTERNATE_NAME,
      url,
      logo: SITE_LOGO_URL,
      sameAs: profileUrls(SOCIAL_PROFILES),
    }),
  ])
}
