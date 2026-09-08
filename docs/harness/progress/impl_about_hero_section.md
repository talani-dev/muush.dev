# impl · about_hero_section (feature 17)

Built the Nosotros/About Hero: Pill + headline + intro, no CTA row.

**Reuse:** extracted `app/shared/ui/HeroStack.vue` — the Pill+h1+p pattern —
out of `landing/ui/HeroSection.vue`. `variant: 'landing' | 'about'` selects
type role/width (`text-display`/`hero-*` vs `text-h1`/`about-hero-*`); a
default slot carries the CTA row for Landing and stays empty for About. Both
Heroes now compose this one base instead of duplicating three tags.
`HeroSection.vue`'s DOM/tests are unchanged (verified: 605/605 green).

New: `app/features/about/{data,logic,ui}` + barrel; `AboutHeroSection.vue`
(3 glows via existing `SectionGlow`/`SectionBackdrop`, no new color/size
tokens — reused `--color-glow-{red-400-60,wine-300-37,wine-400-28}` and
`--spacing-glow-{1400-700,1000-520,860-520}`, all pre-existing from feature 9).

**Mobile opacities: 60/37/28, matching desktop — confirmed, not the `.pen`'s
drawn 65/40/30.** Same for both viewports in `AboutHeroSection.vue`.

Copy: implemented as CONFIRMED per leader's relayed approval (Roberto,
2026-09-08) — `i18n/locales/{es,en}.json` under new `about.hero.*`; removed
now-dead `pages.about.heading` placeholder (superseded by the Hero's own h1,
same move `index.vue` made for Landing).

Six new glow-anchor tokens + top/gap/body/measure tokens in `global.css`,
computed from leader-given page-absolute centres and the confirmed nav-height
origin (103/76, R49). **`--spacing-about-hero-top` is UNVERIFIED** — no design
y-position was given for the content stack itself; seeded from Landing Hero's
own top spacing and flagged in a comment for leader/Clau confirmation.

`pnpm check/typecheck/test(605✓)/generate/storybook:build` and `./init.sh` all
green. Verified new tests red-then-green (R39) via a deliberate regression.

Status left at `in_progress` for reviewer.
