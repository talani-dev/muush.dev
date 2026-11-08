# Feature 47 · `v2_cleanup_and_release` — implementation report

- **Branch:** `chore/v2-legacy-cleanup` (from master at 2.2.0). Nothing committed, staged, pushed or deployed.
- **Scope:** cleanup only, per "ALCANCE AJUSTADO (Roberto, 2026-11-07)". No merge of `muush-v2` and no version bump.
- **Status:** `in_progress` → `reviewing` (feature_list.json). Not `done`.
- **Feature type:** `sdd: false`. The reviewer reviews against the `acceptance` array in feature_list.json.

## Commands (final run, after all changes)

| Command | Result |
|---|---|
| `pnpm check` | PASS (549 files, no warnings) |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS: 191 files, 2699 tests |
| `pnpm generate` | PASS: 13 HTML pages, 8 font files in `_fonts/` |
| `pnpm storybook:build` | PASS: 397 stories, 75 titles; groups `About, Forms, Foundations, Landing, Legal, Shared, Shell`; no `Legacy v1` |
| `./init.sh` | PASS (exit 0; it reruns typecheck, check, test, generate and storybook:build) |

## Acceptance, item by item

1. **grep in `app/` and `.storybook/`.** `--bone-`: 0, `--ink-`: 0, `--wine-`: 0, `legacy-`: 0, `legacy` (any case): 0, `Legacy v1`: 0. `app/shared/ui/legacy/` is absent, and no `legacy/` folder remains anywhere under `app/`. **Note:** a literal `--red-` grep still finds 8 lines. All of them are the approved v2 family `--red-muush-*` (Constitution VII). `--red-[^m]` finds 0. So the acceptance wording `--red-` is ambiguous; it means the v1 ramp `--red-100…500`, which is gone. `tests/v1-retired.test.ts` now enforces all of this mechanically.
2. **Storybook.** The `Legacy v1/` group is gone (it lived only in the deleted folders), and so is its `storySort` entry. `storybook:build` passes.
3. **The site looks the same.** See "Before/after evidence" below.
4. **The five commands and `./init.sh` pass.** See the table above.

## What was deleted

130 files: 121 in the eight `legacy/` folders, plus 9 elsewhere.

### The eight `legacy/` folders (121 files; full list in the appendix)

| Folder | Files |
|---|---|
| `app/shared/ui/legacy/` | 40 (CursorSpotlight, DotGrid, GlassPanel, HeroStack, LinkArrow, Lockup, Pill, PrimaryButton, Radar, SectionBackdrop, SectionGlow, SocialIcon, Wordmark, `tokens.stories.ts`, with their tests and stories) |
| `app/shared/logic/legacy/` | 2 (`useCursorSpotlight` + test) |
| `app/features/forms/ui/legacy/` | 34 (v1 ContactForm, ApplicationForm, CvField, CvUploadError, DialCodeSelect, FileField, FormOutcome, RadioPillGroup, SelectField, TextareaField, TextField, WhatsappField) |
| `app/features/forms/data/legacy/` | 1 (`legacyFormContent.ts`) |
| `app/features/landing/ui/legacy/` | 24 (v1 Hero, Purpose and Services sections) |
| `app/features/landing/logic/legacy/` | 6 (`usePurposeArcRadii`, `usePurposeCarousel`, `useServicesLyrics` + tests) |
| `app/features/landing/data/legacy/` | 3 (`purposeContent`, `servicesContent` + test) |
| `app/features/shell/ui/legacy/` | 11 (v1 FooterColumn, MobileMenu, SiteFooter, SiteNav) |

**`forms/ui/legacy/ContactForm.vue` (touched by feature 49).** Before deleting it I checked who imports it. Its only importers were its own story and test, plus `ApplicationForm`'s siblings inside the same folder. Nothing outside `legacy/` imported it. The v2 pages mount `app/features/forms/ui/ContactForm.vue` through the `forms` barrel, and `tests/forms-config.test.ts` already asserted that no file imported the quarantine. No `components:` auto-scan is configured in `nuxt.config.ts`, so explicit imports are the only way a component gets mounted.

### Outside the `legacy/` folders

| Path | Why it was v1-only (grep evidence) |
|---|---|
| `app/shared/logic/useNavCtaReveal.ts` + `.test.ts` | Inherited 43 item. Its only importers were `landing/ui/legacy/HeroSection.vue` (`useHeroSentinel`) and `shell/ui/legacy/SiteNav.vue`. `useHeroSentinel` lived in this file. |
| `app/assets/icons/paperclip.svg` | Its only importer was `forms/ui/legacy/FileField.vue`. |
| `app/assets/logo/logomark-on-{bone,ink,red}.svg` + `app/assets/logo/README.md` | Their only importer was `shared/ui/legacy/Lockup.vue`. The README documented only these three files, and the folder is now gone. |
| `tests/spotlight-red-dots-tokens.test.ts` | It pinned the v1 red ramp, `--spotlight-lit-radius` and `--dot-paper-lit-color`. Its "layout mounts no spotlight" half is moot now that the components are gone. |
| `tests/services-float-tokens.test.ts` | It pinned the v1 Services float tokens, `@property --services-float-phase` and `@keyframes services-float`. |

### `app/assets/css/global.css` (3560 → 1832 lines)

- **The whole v1 `:root` block**, except `--cursor-brand` / `--cursor-brand-pointer`. That covers: the bone/ink/red/wine ramps, `--dark-glass`, `--stroke-led`, `--duration-radar-ping`, the dotted paper (`--dot-paper-*`), the spotlight (`--spotlight-lit-radius`, `--duration-spotlight-fade`), `--layer-glow` / `--layer-dots` / `--layer-spotlight` / `--layer-nav` (inherited 43 item), `--duration-nav-cta-fade` / `--duration-nav-reveal`, every `--purpose-*` and `--services-*` track, and `--duration-contact-whatsapp-toggle`. The token analyzer found no consumer outside `legacy/` for any of them (method below).
- **The whole first `@theme inline` block (the v1 theme, ~310 keys):** the `--color-{bone,ink,red,wine}-*`, glass, glow, radio and hairline colours; `--font-poppins` / `--font-instrument`; every v1 `--text-*` type step (including `--text-legacy-pill`); every v1 `--spacing-*` (including `--spacing-legacy-pill-y/-gap`, glow, radar, hero, purpose, services, nav, footer, menu and field tracks); `--radius-legacy-panel` / `--radius-legacy-control` / `--radius-panel-sm` / `--radius-icon` / `--radius-burger-bar`; and the `--blur-*` keys. Eight keys showed apparent consumers. I checked each by hand and all eight were false positives:
  - `text-copy`, `text-body`: regex hits on `-copy` / `-body` in unrelated identifiers.
  - `spacing-page`, `spacing-section-gap`: appear only inside comments (`px-page`, `mt-section-gap` in `default.vue`).
  - `spacing-nav-y`, `spacing-footer-gap`, `spacing-menu-gap`: matched the v2 keys `boton-nav-y`, `red-footer-gap`, `red-menu-gap`.
  - `radius-icon`: no `rounded-icon` anywhere.
- **The `--services-float-amplitude: 0` override** in the reduced-motion `:root`, together with its comment.
- **The `@custom-variant constellation`, `@property --led-angle` + `@keyframes led-spin`, `@keyframes radar-ping`, and `@property --services-float-phase` + `@keyframes services-float`.** No consumer outside `legacy/`.
- **Comments that described the quarantine** (the "renamed `legacy-*`" notes, "feature 47 deletes…"). I rewrote them in the past tense.

### Storybook

- `.storybook/preview.ts`: removed the `'Legacy v1'` sort entry and the v1 backgrounds (`ink`, `bone`, `red`), and made `negro` the default. The file said "feature 47 flips it". All 75 remaining story files already select `negro` in their meta, so no story changes appearance.
- `.storybook/preview-head.html`: comment only. Poppins 600 stays, because the v2 wordmark's "muush." uses it.

### Tests edited (v1 assertions removed, v2 assertions kept)

- `tests/tablet-layout-tokens.test.ts`: removed the `legacy/servicesContent` import and the "Services constellation" and "Propósito" describes. Kept the v2 form-columns describe.
- `tests/not-found-tokens.test.ts`: removed the `--spacing-nav-cta-h` assertion (read only by `legacy/SiteNav.vue`) and the now-positional v1 `themeBlock` helper.
- `tests/design-tokens.test.ts`: `#CF3147` was held by `--red-400`; the test now expects it in no token. The v2 assertions are unchanged.
- `tests/pill-air.test.ts`: dropped the `legacy/Pill.vue` line.
- `tests/forms-config.test.ts`: the quarantine describe became "the v2 forms are the only forms". It keeps the barrel assertions.
- **New:** `tests/v1-retired.test.ts`, 7 tests. It checks:
  - no `legacy/` folder under `app/`;
  - no `Legacy v1` anywhere in `app/` or `.storybook/`;
  - no v1 palette or `legacy-*` name;
  - no dot-paper, spotlight, layer-glow/dots/spotlight, glow, radar, `led-spin`, `services-float` or `constellation` declaration;
  - the "You" cursor token is still declared;
  - `useNavCtaReveal.ts` is absent;
  - `shell/data/types.ts` imports `SocialNetwork` from `shared/data`, never from `shared/ui`.

### Inherited 43 items

- **`SocialNetwork`** now lives in `app/shared/data/socialNetworks.ts` (new). `app/shared/ui/SocialIcon.vue`, its test and `app/features/shell/data/types.ts` import it from there. The shell's `data/` layer no longer imports `ui/` (Article II).
- **`useNavCtaReveal` / `useHeroSentinel`:** deleted (see above).
- **`--layer-glow` / `--layer-dots` / `--layer-spotlight`:** deleted. The stale `--layer-spotlight` note in `ShaderBackground.vue` was removed.
- **review-43e A3** (`useLocaleSwitchScroll` must await `nuxtApp['~transitionPromise']` *if* a page transition is ever configured): this is conditional and nothing configures a transition, so no action was taken.

### Comment-only edits (references to deleted files)

`forms/index.ts`, `landing/index.ts`, `forms/data/contactFields.ts`, `forms/data/applicationFields.ts`, `shell/logic/useNavScrollReveal.ts` + test, `shell/logic/useShellNavigation.ts`, `shared/logic/useReducedMotion.ts` + test, `shared/ui/ShaderBackground.vue`, `layouts/default.vue`, `assets/icons/README.md` (paperclip section removed; `x.svg` consumer corrected) and `assets/social/README.md` (stale Astro/logo paths). None of these touch code.

## Deviation: `nuxt.config.ts` (fonts) — needed to keep the site unchanged

The first after build had **no `@font-face` at all and no `_fonts/` directory**. Every page would have rendered in system fonts. Root cause (CONFIRMED by building):

- `@nuxt/fonts` 0.14 emits faces only for families it sees in a literal `font-family` declaration, and it does not resolve custom properties.
- The v2 utilities read `var(--fuente-titulo)` / `var(--fuente-texto)`, so they never triggered it.
- The faces were coming from the v1 utilities `.font-poppins` / `.font-instrument`. Tailwind emitted those only because it found the class names in `specs/` markdown. No element used them.

Fix: `global: true` on both entries of `fonts.families` in `nuxt.config.ts`, with an explanatory comment. After the fix, the `_fonts/` file list is identical to the baseline (same 8 hashed files), and every real `@font-face` is back.

One difference remains: the two metric-fallback faces (`Poppins Fallback: sans-serif`, `Instrument Sans Fallback: sans-serif`) are no longer generated. Only the stacks of the unused v1 utilities referenced them. `tests/static-output.test.ts` (fonts section) already guards the faces. I recorded the trap in `docs/harness/findings.md` § R83, because it bites whoever edits `global.css`, while the fix lives in `nuxt.config.ts`.

## What was kept on purpose

- **The "You" cursor:** `--cursor-brand` / `--cursor-brand-pointer`, the `@media (forced-colors: none)` cursor rules and `public/cursor/you.svg` (Roberto, 2026-11-01). They now sit in their own small `:root` block at the top of `global.css`.
- **Non-legacy modules that v1 code also imported:** `useMobileMenu`, `useNavScrollReveal`, `useContactForm`, `useApplicationForm`, `useFormSubmitState`, `countryOptions`, `cvFileCheck`, `fieldErrorMessage`, `selectOptions`, `callBooking`, `sectionAnchors`, `shell/data/types` (`ResolvedShellItem`, `ResolvedFooterColumn`), and the `forms/data` types. For every imported symbol I counted consumers outside `legacy/`, excluding tests and stories. Each has at least one v2 consumer.
- **The v2 `:root` and v2 `@theme inline` blocks, untouched.** A few v2 keys have no consumer today: `--vidrio-blur`; the `--color-` keys for `crimson-600`, `oxblood-800`, `coral-300`, `arena-300`, `acero-800`, `btn-borde`, `rojo-25` and `rojo-40`; and `--spacing-seccion-y` / `--spacing-seccion-y-desktop`. They are v2 handoff palette and layout entries pinned by `tests/design-tokens.test.ts`, not v1, so they are out of this feature's scope. They are listed here in case the leader wants a separate v2 tidy-up.
- **`--spacing-isotipo-ancho`:** a v2 key whose `-ancho` suffix existed only to avoid colliding with the v1 `--spacing-isotipo`. Renaming it would touch v2 code for no visible gain, so it stays. Its comment now says why.
- **"Radar ping" wording in v2 comments:** it names the v2 `pulso` effect, not the deleted v1 Radar.
- **i18n keys:** not touched. I did not audit whether some `es.json` / `en.json` keys were read only by v1 components. Removing keys changes the shipped payloads and the copy tests, and the task did not list them. This is the main "maybe still v1" area left: a candidate follow-up.
- **`tests/token-literals.test.ts`:** unchanged. Its comments mention the old quarantine, and its `legacy-` ban stays useful as a guard.

## Before/after evidence

The baseline was built from the untouched tree, before any edit. Its artefacts are under `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/`, a session scratchpad, so they may not outlive this session:
- `before/`: baseline `.output/public`
- `after/`: first after build
- `after3/`: the `./init.sh` build
- `shots/`: screenshots
- `tools/`: comparison scripts

### 1. Generated HTML (all 13 pages)

**Normalisation.** Before comparing, I masked these values:
- hashed `/_nuxt/*` names;
- build UUIDs;
- `prerenderedAt` timestamps;
- Vue scoped-style ids (`data-v-xxxxxxxx`). `SocialIcon.vue`'s id changes because the file changed (the type moved out).

**Results:**
- baseline vs `init.sh` build: **0 changed lines on all 13 pages**.
- baseline vs first after build: 2 lines each on `/en/` and `/es/`, inside `__NUXT_DATA__`: the `$si18n:cached-locale-configs` payload is `{}` in one build and filled in the other.
- first after build vs `init.sh` build (identical source): the same 4 lines differ.

So this is prerender-order nondeterminism, not a change.

### 2. Stylesheet, declaration by declaration

I expanded the CSS of both builds into (at-rule context, single selector, property, value) tuples: every `_nuxt/*.css` plus every inline `<style>`.

| | before | after |
|---|---|---|
| Tuples | 2676 | 1891 |
| Added | | **0** |
| Removed | | 785 |

Of the 785 removed tuples, 292 sit on selectors that could match shipped markup. All of them are accounted for:
- `:root` / `:host` custom properties. None is read by any remaining `var()`, with one exception: `--tw-ease`. It used to be set only by `.ease-out`, and no element has that class, so it is unset in both builds.
- `*` / `::before` / `::after` / `::backdrop` initial values, plus `@property` registrations, for `--tw-gradient-*`, `--tw-contain-*`, `--led-angle` and `--services-float-phase`. Nothing reads them any more.
- `@keyframes led-spin`, `radar-ping` and `services-float`.
- `.ease-out` and `.filter`. Neither class appears in any shipped HTML `class` attribute or JS string; the `filter` hits are `Array.prototype.filter`.
- The two metric-fallback `@font-face` rules (see the deviation above).

The remaining 493 removed tuples sit on v1 class selectors that no shipped HTML or JS references.

### 3. Screenshots (headless Chrome 1×, CDP full-page capture)

Each page was scrolled top to bottom (to fire reveals), returned to the top, and captured after `document.fonts.ready`. Pages: `/en/`, `/es/`, `/en/about/`, `/es/nosotros/`, `/en/faq/`, `/es/preguntas/`, `/en/privacy/`, `/es/privacidad/`, `/en/terms/`, `/es/terminos/`, `/en/404/`, `/es/404/`.

| Set | Shots | Result |
|---|---|---|
| Reduced motion, 390 + 1440, 12 pages | 24 | **24/24 pixel-identical** |
| Reduced motion, 360 / 768 / 1024 / 1280 / 1920, home + about ES/EN | 20 | **20/20 pixel-identical** |
| No WebGL (`--disable-webgl --disable-3d-apis`) + reduced motion, 360–1920, home ES/EN | 10 | **10/10 pixel-identical** |
| No WebGL + reduced motion, 390 + 1440, 12 pages | 24 | 22 identical. 2 differ by ≤ 0.081 % in a 240 × 54 px box behind the FAQ hero buttons. **Baseline vs baseline shows the same 0.0811 % in the same box**, so this is noise. |
| Motion on (live shaders), 390 + 1440, 12 pages | 24 | 8 identical, 16 differ by up to 16.5 %. Baseline vs baseline differs by up to 16.5 % too (es@390: 16.53 %), because the shaders animate. One outlier, `en_about@1440` at 20.7 %, was capture timing: that run caught the Work-with-muush section still on its poster (red band visible) instead of the live shader. A re-shoot gives baseline vs after 0.12 % for that page, the same as baseline noise. |

Not covered:
- motion-on at 360 / 768 / 1024 / 1280 / 1920;
- the legal pages at those widths.

Both are reduced-motion-only at 390 and 1440. The CSS and HTML results above cover every width.

## Not done / for the leader

- `docs/harness/progress/current.md` was not edited. It still says "none active".
- Patch bump: only via `/commit-flow` when Roberto asks, per the feature description.

## Appendix · the 121 files deleted from `legacy/` folders

- `app/features/forms/data/legacy/legacyFormContent.ts`
- `app/features/forms/ui/legacy/ApplicationForm.stories.ts`
- `app/features/forms/ui/legacy/ApplicationForm.test.ts`
- `app/features/forms/ui/legacy/ApplicationForm.vue`
- `app/features/forms/ui/legacy/ContactForm.stories.ts`
- `app/features/forms/ui/legacy/ContactForm.test.ts`
- `app/features/forms/ui/legacy/ContactForm.vue`
- `app/features/forms/ui/legacy/CvField.vue`
- `app/features/forms/ui/legacy/CvUploadError.stories.ts`
- `app/features/forms/ui/legacy/CvUploadError.test.ts`
- `app/features/forms/ui/legacy/CvUploadError.vue`
- `app/features/forms/ui/legacy/DialCodeSelect.stories.ts`
- `app/features/forms/ui/legacy/DialCodeSelect.test.ts`
- `app/features/forms/ui/legacy/DialCodeSelect.vue`
- `app/features/forms/ui/legacy/FileField.stories.ts`
- `app/features/forms/ui/legacy/FileField.test.ts`
- `app/features/forms/ui/legacy/FileField.vue`
- `app/features/forms/ui/legacy/FormOutcome.stories.ts`
- `app/features/forms/ui/legacy/FormOutcome.test.ts`
- `app/features/forms/ui/legacy/FormOutcome.vue`
- `app/features/forms/ui/legacy/RadioPillGroup.stories.ts`
- `app/features/forms/ui/legacy/RadioPillGroup.test.ts`
- `app/features/forms/ui/legacy/RadioPillGroup.vue`
- `app/features/forms/ui/legacy/SelectField.stories.ts`
- `app/features/forms/ui/legacy/SelectField.test.ts`
- `app/features/forms/ui/legacy/SelectField.vue`
- `app/features/forms/ui/legacy/TextField.stories.ts`
- `app/features/forms/ui/legacy/TextField.test.ts`
- `app/features/forms/ui/legacy/TextField.vue`
- `app/features/forms/ui/legacy/TextareaField.stories.ts`
- `app/features/forms/ui/legacy/TextareaField.test.ts`
- `app/features/forms/ui/legacy/TextareaField.vue`
- `app/features/forms/ui/legacy/WhatsappField.stories.ts`
- `app/features/forms/ui/legacy/WhatsappField.test.ts`
- `app/features/forms/ui/legacy/WhatsappField.vue`
- `app/features/landing/data/legacy/purposeContent.ts`
- `app/features/landing/data/legacy/servicesContent.test.ts`
- `app/features/landing/data/legacy/servicesContent.ts`
- `app/features/landing/logic/legacy/usePurposeArcRadii.test.ts`
- `app/features/landing/logic/legacy/usePurposeArcRadii.ts`
- `app/features/landing/logic/legacy/usePurposeCarousel.test.ts`
- `app/features/landing/logic/legacy/usePurposeCarousel.ts`
- `app/features/landing/logic/legacy/useServicesLyrics.test.ts`
- `app/features/landing/logic/legacy/useServicesLyrics.ts`
- `app/features/landing/ui/legacy/HeroSection.stories.ts`
- `app/features/landing/ui/legacy/HeroSection.test.ts`
- `app/features/landing/ui/legacy/HeroSection.vue`
- `app/features/landing/ui/legacy/PurposeCard.test.ts`
- `app/features/landing/ui/legacy/PurposeCard.vue`
- `app/features/landing/ui/legacy/PurposeCarousel.test.ts`
- `app/features/landing/ui/legacy/PurposeCarousel.vue`
- `app/features/landing/ui/legacy/PurposeConstellation.test.ts`
- `app/features/landing/ui/legacy/PurposeConstellation.vue`
- `app/features/landing/ui/legacy/PurposeSection.stories.ts`
- `app/features/landing/ui/legacy/PurposeSection.test.ts`
- `app/features/landing/ui/legacy/PurposeSection.vue`
- `app/features/landing/ui/legacy/ServiceItem.test.ts`
- `app/features/landing/ui/legacy/ServiceItem.vue`
- `app/features/landing/ui/legacy/ServicesConnectors.test.ts`
- `app/features/landing/ui/legacy/ServicesConnectors.vue`
- `app/features/landing/ui/legacy/ServicesConstellation.test.ts`
- `app/features/landing/ui/legacy/ServicesConstellation.vue`
- `app/features/landing/ui/legacy/ServicesSection.stories.ts`
- `app/features/landing/ui/legacy/ServicesSection.test.ts`
- `app/features/landing/ui/legacy/ServicesSection.vue`
- `app/features/landing/ui/legacy/ServicesTimeline.float.test.ts`
- `app/features/landing/ui/legacy/ServicesTimeline.test.ts`
- `app/features/landing/ui/legacy/ServicesTimeline.vue`
- `app/features/shell/ui/legacy/FooterColumn.test.ts`
- `app/features/shell/ui/legacy/FooterColumn.vue`
- `app/features/shell/ui/legacy/MobileMenu.stories.ts`
- `app/features/shell/ui/legacy/MobileMenu.test.ts`
- `app/features/shell/ui/legacy/MobileMenu.vue`
- `app/features/shell/ui/legacy/SiteFooter.stories.ts`
- `app/features/shell/ui/legacy/SiteFooter.test.ts`
- `app/features/shell/ui/legacy/SiteFooter.vue`
- `app/features/shell/ui/legacy/SiteNav.stories.ts`
- `app/features/shell/ui/legacy/SiteNav.test.ts`
- `app/features/shell/ui/legacy/SiteNav.vue`
- `app/shared/logic/legacy/useCursorSpotlight.test.ts`
- `app/shared/logic/legacy/useCursorSpotlight.ts`
- `app/shared/ui/legacy/CursorSpotlight.stories.ts`
- `app/shared/ui/legacy/CursorSpotlight.test.ts`
- `app/shared/ui/legacy/CursorSpotlight.vue`
- `app/shared/ui/legacy/DotGrid.stories.ts`
- `app/shared/ui/legacy/DotGrid.test.ts`
- `app/shared/ui/legacy/DotGrid.vue`
- `app/shared/ui/legacy/GlassPanel.stories.ts`
- `app/shared/ui/legacy/GlassPanel.test.ts`
- `app/shared/ui/legacy/GlassPanel.vue`
- `app/shared/ui/legacy/HeroStack.stories.ts`
- `app/shared/ui/legacy/HeroStack.test.ts`
- `app/shared/ui/legacy/HeroStack.vue`
- `app/shared/ui/legacy/LinkArrow.stories.ts`
- `app/shared/ui/legacy/LinkArrow.test.ts`
- `app/shared/ui/legacy/LinkArrow.vue`
- `app/shared/ui/legacy/Lockup.stories.ts`
- `app/shared/ui/legacy/Lockup.test.ts`
- `app/shared/ui/legacy/Lockup.vue`
- `app/shared/ui/legacy/Pill.stories.ts`
- `app/shared/ui/legacy/Pill.test.ts`
- `app/shared/ui/legacy/Pill.vue`
- `app/shared/ui/legacy/PrimaryButton.stories.ts`
- `app/shared/ui/legacy/PrimaryButton.test.ts`
- `app/shared/ui/legacy/PrimaryButton.vue`
- `app/shared/ui/legacy/Radar.stories.ts`
- `app/shared/ui/legacy/Radar.test.ts`
- `app/shared/ui/legacy/Radar.vue`
- `app/shared/ui/legacy/SectionBackdrop.stories.ts`
- `app/shared/ui/legacy/SectionBackdrop.test.ts`
- `app/shared/ui/legacy/SectionBackdrop.vue`
- `app/shared/ui/legacy/SectionGlow.stories.ts`
- `app/shared/ui/legacy/SectionGlow.test.ts`
- `app/shared/ui/legacy/SectionGlow.vue`
- `app/shared/ui/legacy/SocialIcon.stories.ts`
- `app/shared/ui/legacy/SocialIcon.test.ts`
- `app/shared/ui/legacy/SocialIcon.vue`
- `app/shared/ui/legacy/Wordmark.stories.ts`
- `app/shared/ui/legacy/Wordmark.test.ts`
- `app/shared/ui/legacy/Wordmark.vue`
- `app/shared/ui/legacy/tokens.stories.ts`
