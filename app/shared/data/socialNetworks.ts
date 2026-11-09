/**
 * The social networks the site links to (feature 43, contract § 1).
 *
 * Owned here, in `app/shared/data/`, and not by `SocialIcon.vue`: the shell's
 * `data/` layer types its profiles with it, and Constitution Article II
 * forbids `data/` from importing `ui/` (review-43, moved in feature 47).
 * `SocialIcon.vue` keys its glyphs by this union, so adding a network here
 * without a glyph there does not compile.
 */
export type SocialNetwork = 'linkedin' | 'instagram' | 'tiktok' | 'facebook'
