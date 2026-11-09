import type { SocialProfile } from './types'

/**
 * The four profiles, and the **only** place each URL appears: the footer's
 * fourth column and the mobile menu's four buttons both read this record, so
 * correcting one is one line. Facebook was added fourth, after TikTok
 * (Roberto, 2026-11-08).
 *
 * WhatsApp is not here — it is a contact destination, not a social profile,
 * and it lives in the footer's Contacto column with a locale-specific
 * pre-filled message.
 */
export const SOCIAL_PROFILES: SocialProfile[] = [
  {
    network: 'linkedin',
    /*
     * ⚠️ The `/company/` form is ASSUMED, pending Clau. `branding.md` and
     * `overview.md` record the handle `/muush-dev`; `design-extract.md`
     * § 9.bis records the destination only as "linkedin.com". Nobody
     * documents whether it is a company page or a personal profile
     * (`docs/business/rules.md` § R13). A company page is assumed because
     * muush is a company. Instagram and TikTok have full paths, so the gap is
     * specific to LinkedIn.
     */
    href: 'https://www.linkedin.com/company/muush-dev',
    labelKey: 'shell.social.linkedin',
  },
  {
    network: 'instagram',
    href: 'https://www.instagram.com/muush.dev',
    labelKey: 'shell.social.instagram',
  },
  {
    network: 'tiktok',
    href: 'https://www.tiktok.com/@muush.dev',
    labelKey: 'shell.social.tiktok',
  },
  {
    network: 'facebook',
    /*
     * A numeric `profile.php?id=` URL, not a vanity handle: muush's Facebook
     * presence has no username yet (Roberto, 2026-11-08). If one is claimed,
     * this line is the only one to change.
     */
    href: 'https://www.facebook.com/profile.php?id=61595800850873',
    labelKey: 'shell.social.facebook',
  },
]
