# Implementation report: floating_nav_redesign (feature 21)

**Baseline**: 58 files / 688 tests → **now**: 58 files / 706 tests (+18).
`./init.sh` exit 0 (typecheck, check, test, generate, storybook:build all green).

## What was built

- `SiteNav.vue`: desktop row restyled to a floating pill (`lg:max-w-nav-pill-w
  lg:rounded-full lg:border lg:border-glass-line lg:bg-glass-dark`, `lg:top-
  nav-pill-y`), reusing `--spacing-page` for the pill's own width cap and one
  new desktop-only token for the top inset. CTA gained a leading `aria-hidden`
  arrow (`→ {{ cta.label }}`) inside `BotonPrimario`'s existing slot.
- `BotonPrimario.vue`: zero new props; added static `group` class for the
  arrow's hover shift; `nav` variant tokens updated (221×48 target).
- `LanguageToggle.vue`: rewritten to one 44×44 circle, active locale only.
- `navigation.ts`: `NAV_ITEMS` → `Servicios`/`Nosotros`, both divergences from
  the `.pen` commented (Proyectos out, Servicios in — per Roberto/§ R32).
- i18n: `shell.nav.services`, `switchToEs`, `switchToEn` added;
  `shell.nav.projects` removed (grep-confirmed no other consumer).

## Spec deviation (reported, not silent) — see findings.md § R62

`LanguageToggle.vue`'s contract could **not** stay `{ locale, href }`: FR-018
needs a translated, locale-describing aria-label, and resolving it via
`useI18n()` inside `ui/` would violate `rules.md` § R23 / this feature's own
"zero new composable in ui/" constraint, while hardcoding the string violates
Article VI. Added one prop, `switchLabel`, resolved in `default.vue` and
threaded through `SiteNav`/`MobileMenu` — same shape as `MobileMenu.vue`'s own
`label`/`closeLabel`. This forces `MobileMenu.vue`/its test/story to change
(+16 lines total) despite `plan.md` listing them as zero-diff.

## Mobile verified genuinely unchanged (FR-020)

`git diff` on `SiteNav.vue` shows every `lg:hidden`-branch line (hamburger,
burger bars) untouched; all new classes are `lg:`-scoped or inside the
`lg:block`-only CTA wrapper. `useMobileMenu.ts`/`MobileMenu.vue`'s markup
(besides the required `LanguageToggle` prop) is unchanged.

## Nav-CTA-reveal (feature 9) confirmed intact

`useNavCtaReveal.ts` shows **zero** lines changed (`git diff --stat`). The
`.site-nav__cta` wrapper/classes are untouched; only the CTA's slot content
changed. Grepped the real `pnpm generate` output: `/en` ships the CTA
`invisible opacity-0`, `/en/about` ships `visible opacity-100`, both
byte-consistent with pre-feature behavior.

## Round 1: no CDP/browser in this environment (superseded — see Round 2)

T016, T021, T022 (§§1–5) required live-browser measurement (pill/CTA pixels,
mobile height, scroll-reveal). Confirmed everything statically verifiable
instead (diffs, grep on `.output/public`, 706 green tests) — flagged for the
reviewer, per `verification.md`'s own guidance. `docs/harness/findings.md`
§§ R62–R63 have full detail.

## Round 2: reviewer rejected on 3 measurement defects, CDP worked, fixed + measured

CDP was available this round (`--remote-debugging-port` + `--remote-allow-
origins=*` against `.output/public` served locally). Measured before and
after each fix on a fresh `pnpm generate` build:

1. **Pill height** 1280×110 → **1280×72**. `--spacing-nav-y` was never
   adjusted for the pill; added `--spacing-nav-pill-py` (`lg`-only). First
   pass measured 74px — missed that the pill's own new `border` (1px) adds
   to auto-height under `border-box`; corrected 12px/side → 11px/side.
2. **Mobile nav height** 88px → **78px**. The 44px toggle circle overtook the
   hamburger as the tallest row content; `--spacing-nav-y`'s mobile end
   (22px/side) never compensated. Lowered to 17px/side.
3. **CTA box (ES)** 232.546875×48 → **220.984375×48** (target 221). Measured
   actual content width (arrow+space+label, 176.546875px) and solved
   `--spacing-btn-nav-x` exactly: 1.3892rem. (EN CTA is wider — 236.34375px —
   because its label is longer; expected, not a defect, box isn't fixed-width.)

Full derivation and the border-height lesson: `findings.md` § R64.
`./init.sh` exit 0, 706/706 tests green, after both rounds.

## Reported, not fixed (docs/business/ is read-only)

`content.md` contradiction (Servicios in nav, per the redesigned `.pen`) and
`ui-map.md` § 2 staleness — both already flagged in-file by a prior session;
this feature's own contradiction is additionally noted in `navigation.ts`'s
comment on `NAV_ITEMS`.
