# Review — feature 17 `about_hero_section`

**Verdict: APPROVED**

- Status was `reviewing` in `feature_list.json` before this review; confirmed.
- `./init.sh` exits 0: typecheck, biome check, `pnpm test` (605/605, 52 files),
  `pnpm generate` (prerenders `/es/nosotros` and `/en/about` with real
  headline/intro text, not a stub — verified in `.output/public`),
  `pnpm storybook:build` all green.
- HeroStack extraction is a safe, structural-only refactor: `HeroSection.vue`
  diff is a pure move (3 children -> `<HeroStack>` call), CSS class strings
  byte-identical to before; `HeroSection.test.ts` untouched; generated
  `/es/index.html` markup for the landing Hero unchanged (Pill/h1/p/CTA row
  intact). `variant="about"` correctly omits the CTA row (verified in
  generated `/es/nosotros/index.html`: `<!--[--><!--]-->` empty slot, no
  `<a>`/`<button>`).
- Frame measurements match: `--spacing-about-hero-body` 60rem (960px),
  `--spacing-about-hero-measure` 43.75rem (700px), gap clamp 22->32px. Three
  children only, confirmed by test and generated HTML.
- Copy matches acceptance #3 exactly in both locales (`es.json`/`en.json`),
  pinned verbatim by `tests/about-copy.test.ts`; dead `pages.about.heading`
  removed.
- Mobile glow opacities are 60/37/28 in the generated CSS classes for both
  viewports (no responsive variant, no 65/40/30 anywhere in source or
  `.output/public`) — matches Roberto's correction, not the `.pen`.
- R36 confirmed: `grep -c` on the three reused color tokens = 3 (single
  definition each); no duplicate red-400/wine-300/wine-400 pairs at those
  sizes.
- R39 reproduced: flipped `:opacity="60"` to `65"` in `AboutHeroSection.vue`,
  `AboutHeroSection.test.ts` failed on the glow-opacity assertion as claimed;
  reverted.
- Constitution: both components `<script setup lang="ts">`, no hardcoded
  hex/px, no relative import crossing a directory (uses `@/features`/`@/shared`
  aliases, already mirrored in `.storybook/main.ts`), no `server/api/` route,
  `nitro.preset: 'static'`, both files well under 200 lines. Storybook covers
  both viewports and both locales for `AboutHeroSection` plus `HeroStack`
  variants.
- `--spacing-about-hero-top`: flagged UNVERIFIED with owner (leader/Clau) in
  the code comment, derived from the existing same-first-section-after-nav
  convention rather than fabricated as a page-absolute measurement. Consistent
  with the repo's R38 pattern for undecidable design values. Does not block.

No defects found. No code changed by this review.
