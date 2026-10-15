import type { SocialProfile } from '@/features/shell/data/types'

/**
 * The profile URLs, in record order, for the Organization's `sameAs`. A
 * one-line map on purpose: it exists so `sameAs` is provably derived from
 * `SOCIAL_PROFILES` rather than retyped (spec FR-009).
 */
export function profileUrls(profiles: readonly SocialProfile[]): string[] {
  return profiles.map(profile => profile.href)
}
