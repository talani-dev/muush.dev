# Implementation Plan: Floating nav redesign

**Branch**: `feat/floating-nav-redesign` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/021-floating-nav-redesign/spec.md`

## Summary

Restyle the desktop row of the existing `SiteNav.vue` from a full-bleed,
backgroundless bar into a floating dark-glass pill, swap its two links from
`Proyectos · Nosotros` to `Servicios · Nosotros`, grow the CTA to 221×48 with
a leading arrow, and replace the `ES / EN` text toggle with a single 44×44
circular control showing only the active locale. No new component, no new
Nuxt composable, no route/anchor change. Every behavioural contract this
touches — the CTA's scroll reveal (feature 9), the locale-switch route
resolution (feature 3/Article VI), the pill shape (feature 22) — is reused,
not re-implemented.

## Technical Context

**Language/Version**: TypeScript (strict), Vue 3 `<script setup lang="ts">`
**Primary Dependencies**: Nuxt 4 (static preset), `@nuxtjs/i18n` v10 (strategy
`prefix`, translated route segments via `i18n.pages`), Tailwind v4
(`@theme inline`), Biome
**Storage**: N/A — no data layer, this is presentational + i18n copy
**Testing**: Vitest + Vue Test Utils (`happy-dom`), Storybook 10
(`vue3-vite`) for visual review; no E2E (Constitution Article X)
**Target Platform**: Static site, S3 + CloudFront (`pnpm generate` output)
**Project Type**: Web application — single Nuxt app, feature-based structure
**Performance Goals**: None specific to this feature; no new client-side
computation is introduced (no new composable, no per-frame work)
**Constraints**: Zero new Nuxt composable calls in `ui/` (Article V/R23);
zero new glass-surface tokens (spec FR-002); zero prop changes to
`BotonPrimario.vue` (spec FR-013); mobile nav must show zero structural
diff unless the built comparison proves otherwise (spec FR-020)
**Scale/Scope**: Two components edited (`SiteNav.vue`, `LanguageToggle.vue`),
one data file edited (`navigation.ts`), a handful of tokens added/updated in
`global.css`, a handful of i18n keys added/renamed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see § Post-Design Re-check.*

### Phase -1: Pre-Implementation Gates

#### I · Feature-Based + Capas Architecture

- [x] Every file touched lives inside `app/features/shell/` (`ui/`, `data/`)
      or in `app/assets/css/global.css` / `i18n/locales/`, which are the
      cross-cutting token and copy stores every feature already writes to.
      No new top-level folder, no new feature module.

#### II · Dependency Direction (NON-NEGOTIABLE)

- [x] `data/navigation.ts`'s edit (removing the `Proyectos` entry, adding
      `Servicios`) touches only `data/` and imports nothing from `logic/` or
      `ui/`. `ui/SiteNav.vue` and `ui/LanguageToggle.vue` continue to import
      only from `logic/` and `data/`, never the reverse.

#### III · Feature Isolation (NON-NEGOTIABLE)

- [x] No import crosses into `app/features/landing/`, `app/features/about/`
      or `app/features/forms/`, and nothing in those modules reaches into
      `shell/`'s internals — the barrel (`app/features/shell/index.ts`) is
      untouched and still the only public surface.

#### IV · Static-Site Purity (NON-NEGOTIABLE)

- [x] No `server/api/` route, no runtime server dependency. This is a pure
      presentational/CSS change; `nitro.preset: 'static'` is untouched.

#### V · Component Discipline

- [x] `SiteNav.vue` and `LanguageToggle.vue` stay Vue SFCs with
      `<script setup lang="ts">`; neither calls an external endpoint.
- [x] **`BotonPrimario.vue` gets zero new lines of code.** Only its
      `sizeByVariant.nav` *value* changes (padding/font-size strings), which
      is a data edit inside an existing object literal, not new logic. The
      file's existing, already-recorded Article V exception (feature 022 —
      "no code added, prose-only growth") is re-verified, not re-opened: this
      feature is expected to add zero non-comment lines to that file. If the
      `nav` variant's new padding needs a genuinely new CSS custom property
      beyond a token-map string, it is declared in `global.css`, never
      inlined in the component.
- [x] `SiteNav.vue` (242 raw lines today, largely comments — see its own
      header) gains a handful of lines for the arrow span and the pill
      classes; if it crosses 200 non-comment lines, that is recorded here as
      a new, explicit Article V exception rather than silently ignored — see
      § Post-Design Re-check.
- [x] `LanguageToggle.vue` (70 lines today) is rewritten but stays a small,
      single-purpose component; no sub-200-line risk expected.
- [x] Interactivity stays opt-in and local: the language toggle still emits
      no client state of its own beyond what `preserveAnchor`'s click handler
      already does today.

#### VI · i18n Parity (NON-NEGOTIABLE)

- [x] The redesigned nav ships in both `/es/` and `/en/`, on both routes —
      it is one shared component, not a per-locale variant.
- [x] Every new/changed string (`shell.nav.services`, the toggle's new
      accessible-name key(s)) is added to **both** `i18n/locales/es.json`
      and `en.json` in the same change; `tests/i18n-parity.test.ts` gates
      this mechanically.
- [x] The locale switch continues to resolve through `useSwitchLocalePath`
      / `resolveLocaleDestination.ts` — **zero string manipulation of the
      current path** is introduced. Route segments and anchors are
      untouched (feature 12 stays cancelled; Article VI's own route-map
      requirement is what this feature must keep satisfying, not add).
- [x] No user-facing string is hardcoded in either component.

#### VII · Design Tokens Discipline

- [x] Zero hex/px literals in markup. The pill's fill/border/radius resolve
      to the *existing* `--dark-glass` (`bg-glass-dark`), `--color-glass-
      line` and `rounded-full` — no second glass surface is declared (spec
      FR-002).
- [x] The pill's inset and size, and the CTA's updated `nav`-variant padding
      and font size, are new tokens — but every one interpolates between the
      two measured frame endpoints with `clamp()`, the same convention
      `rules.md` § R48 and feature 9's A-04 established, rather than a new
      breakpoint. See § Implementation Approach, 1.
- [x] Poppins stays scoped to the wordmark; nothing here touches typography
      assignment outside the nav link/CTA/toggle roles, which already use
      Instrument Sans.

#### VIII · Clean Code Discipline

- [x] No generic names introduced. The divergence from the `.pen` (dropping
      `Proyectos`) is a named, commented decision in `navigation.ts`, not a
      silent omission.
- [x] No magic numbers: every new geometry value is a token with a comment
      naming its two frame endpoints, matching the convention every prior
      feature in this repository already follows.

#### IX · TypeScript Strict + Biome

- [x] No `any`, no `@ts-ignore`. `pnpm check` and `pnpm typecheck` gate this
      as usual; no new type surface is introduced beyond whatever
      `LanguageToggle.vue`'s rewritten props require (none — its prop
      contract, `{ locale, href }`, does not need to change).

#### X · Testing Discipline

- [x] `SiteNav.test.ts` and `LanguageToggle.test.ts` are updated (not
      relaxed) for the new link set, the CTA's arrow-as-element rule, and
      the single-circle toggle markup.
- [x] `SiteNav.stories.ts` and `LanguageToggle.stories.ts` cover both
      viewports and both locales (Article X requires a story per
      `app/shared/ui/` component; these two live in `app/features/shell/`
      but already carry stories by precedent from feature 3, which this
      feature updates rather than removes).
- [x] No E2E test is added or implied.

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] Not applicable — no environment variable, credential or endpoint is
      touched by this feature.

#### XII · Absolute Imports via Alias

- [x] Every import continues to use the `@/features/`, `@/shared/` aliases
      already in place; no relative import crosses a directory boundary.

#### R28 / R37 · Paint-order contract (repository-specific, NON-NEGOTIABLE)

- [x] The nav is not a section and contributes no glow; the pill's opaque-
      looking glass fill is the nav's **own** surface, not a section
      backdrop, so R28/R37's "a section must not paint an opaque background"
      rule does not apply to it (it never did — feature 9 A-13 already
      established the nav sits outside that contract, bound only by its own
      `--layer-nav`). This feature introduces no new stacking-context
      property on the nav beyond what `position: sticky` + `--layer-nav`
      already require.

#### R32 · The `.pen` outranks `docs/business/`, except where a human overrides both (repository-specific)

- [x] Applied twice in the spec, in opposite directions, both with an
      explicit owner: `Servicios` is added because the redesigned frame
      outranks `content.md` (R32 as written); `Proyectos` is *not* added
      despite the frame drawing it, because Roberto's direct instruction
      outranks the frame itself — a third, higher-ranked source R32 does not
      itself contemplate but does not forbid either. Both divergences are
      commented in code, not silently reconciled.

**Result: PASS.** No violation requires a Complexity Tracking entry beyond
the confirmation, not re-opening, of `BotonPrimario.vue`'s existing Article V
exception (recorded above and in that file's own header).

## Project Structure

### Documentation (this feature)

```text
specs/021-floating-nav-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── components.md    # Phase 1 output — the two touched components' prop/slot contracts
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by this command)
```

### Source Code (repository root)

```text
app/
├── features/
│   └── shell/
│       ├── ui/
│       │   ├── SiteNav.vue              # EDIT — pill container, CTA slot content, comments
│       │   ├── SiteNav.test.ts          # EDIT — new link set, CTA arrow, pill classes
│       │   ├── SiteNav.stories.ts       # EDIT — both viewports/locales against new markup
│       │   ├── LanguageToggle.vue       # EDIT — single 44×44 circular control
│       │   ├── LanguageToggle.test.ts   # EDIT — single-circle markup, aria-label
│       │   ├── LanguageToggle.stories.ts# EDIT
│       │   ├── MobileMenu.vue            # untouched, unless FR-020 finds a real diff
│       │   └── SiteFooter.vue            # untouched
│       ├── logic/                        # untouched — useShellNavigation.ts,
│       │                                 #   useMobileMenu.ts, resolveLocaleDestination.ts
│       └── data/
│           ├── navigation.ts             # EDIT — NAV_ITEMS: Proyectos → Servicios
│           └── footerColumns.ts          # untouched
├── shared/
│   ├── ui/
│   │   └── BotonPrimario.vue             # EDIT — sizeByVariant.nav values only, zero new props
│   └── logic/
│       └── useNavCtaReveal.ts            # untouched — reused as-is
└── assets/css/
    └── global.css                        # EDIT — pill inset/size tokens, updated nav-variant
                                           #   tokens, toggle circle tokens if not already covered

i18n/locales/
├── es.json                               # EDIT — shell.nav.services, toggle a11y key(s)
└── en.json                               # EDIT — same keys

tests/
└── static-output.test.ts                 # EDIT — new nav markup assertions
```

**Structure Decision**: No new directory. This is an edit-in-place across the
`shell` feature's existing `ui/`/`data/` layers plus the two cross-cutting
stores (`global.css`, `i18n/locales/`) every prior feature already writes to.
`logic/` is listed to make explicit that it is *not* touched — the reveal and
route-resolution composables are consumed exactly as they are today.

## Implementation Approach

### 1 · Pill geometry — two measured endpoints, not one frame

The leader's reading gives the pill as 1280×72 at `x80 y24` on the 1440
frame. Per `rules.md` § R48 and feature 9's A-04, a single-frame measurement
must not be extrapolated to the other viewport by assumption — but this
geometry is not a per-viewport concern the way the Hero's glows were: the
pill only exists at `lg` and above (mobile keeps its own unchanged row per
FR-020), so there is no second endpoint to interpolate against for the pill
itself. What *does* need confirming against the repository rather than
invented fresh is whether `x80`/`y24` already coincide with an existing
token:

- `--spacing-page` already resolves to 80 at the desktop end of its own
  `clamp()` (feature 3/9) — if the pill's horizontal inset matches it
  exactly, the plan reuses `--spacing-page` rather than declaring a second
  80-value token under a new name.
- `y24` (the pill's distance from the viewport top) has no existing token;
  it becomes a new one (e.g. `--spacing-nav-pill-top`), a single desktop
  value since the pill is a `lg`-only treatment and mobile does not have it.
- The pill's own size (1280×72) is expressed as `max-width` + full-bleed
  `<nav>` padding, matching the same technique `<main>`'s `max-w-shell-max`
  already uses, rather than a hardcoded width — this keeps the pill correct
  above 1440px exactly as the content column already is (feature 3 A-02).

### 2 · The CTA's new box, and the arrow's placement

221×48 at `lg` is a *net* box that already includes the leading arrow glyph
and its gap from the label. The `nav` size variant's `sizeByVariant` entry
(`py-btn-nav-y px-btn-nav-x text-button-sm`) gets updated padding/font-size
tokens sized so the label + arrow + gap fits 221×48 — derived by the
implementer measuring the built result against the target box (the same
"derive, then verify on the generated page" discipline `rules.md` § R44
established), not asserted from arithmetic alone, since a conic LED ring's
rendered geometry (feature 22 § R59) is sensitive to the exact box.

The arrow itself is a second child inside `BotonPrimario`'s existing default
slot, composed in `SiteNav.vue`:

```html
<BotonPrimario variant="nav" :href="cta.href">
  <span aria-hidden="true" class="<arrow-shift-utility>">→</span>
  {{ cta.label }}
</BotonPrimario>
```

It reuses the same transition utility `LinkArrow.vue` already declares
(`transition-transform duration-200 group-hover:translate-x-0.5
motion-reduce:transition-none`) so the two arrows on the site move
identically on hover — but it is plain markup inside `SiteNav.vue`, not an
import of the `LinkArrow` *component*, because `LinkArrow` is a self-
contained `<a>` with its own href/external props and rendering it *inside*
another interactive element would nest two links. `BotonPrimario.vue`
itself gains no prop: the slot already accepts arbitrary content, which is
exactly why this composes without touching that file's contract.

### 3 · The language toggle's markup

`LanguageToggle.vue` is rewritten from the two-code-plus-divider row to a
single control:

```html
<NuxtLink
  :to="href"
  :aria-label="switchLabel"
  class="inline-grid size-lang-circle place-items-center rounded-full
         border border-glass-line bg-glass-dark font-instrument
         text-lang font-semibold text-bone-100 ..."
  @click="preserveAnchor"
>
  {{ locale.toUpperCase() }}
</NuxtLink>
```

It stays a link (not a `<button>`), because it navigates and the existing
`preserveAnchor` click handler only intercepts the *default* action to
append a fragment — it does not replace navigation, so `<button>` would
require reimplementing what `NuxtLink`'s `:to` already provides.

**Accessible name — decided, not deferred.** Two flat keys,
`shell.nav.switchToEs` / `shell.nav.switchToEn` ("Cambiar a español" / "Switch
to English", and their mirrors), rather than one key with a locale name
interpolated. A single parameterised key would need the *other* locale's
own display name as an interpolation value, which is itself copy that would
have to be resolved per-locale and passed in — two flat keys are simpler,
require no interpolation logic, and cost nothing extra since there are only
ever two locales (Article VI's own key-parity test already treats keys as a
flat set, not a templated one). The component picks
`otherLocale === 'en' ? t('shell.nav.switchToEn') : t('shell.nav.switchToEs')`
— read from the same `otherLocale` `useShellNavigation.ts` already computes
today for the `href`, so no new derivation is added to `logic/`.

`44×44` becomes a new `--spacing-lang-circle` (or reuses `--radius-icon`'s
control-sizing sibling if one already fits) token; `text-lang` (the existing
role) is reused for the two-letter label's size/weight, since the visible
glyph itself does not change size, only its container.

### 4 · Verification that `logic/` needs zero edits

Before implementation, and re-confirmed after: `useNavCtaReveal.ts` is
consumed today via the `showCta` prop and the `.site-nav__cta` fade classes
in `SiteNav.vue`'s template — nothing about *how* those classes are applied
changes, only the element they sit on (the CTA stays the same
`<div class="site-nav__cta ...">` wrapper around the same `BotonPrimario`
instance). `useShellNavigation.ts`'s `navItems`/`navCta`/`localeSwitchHref`
computeds are consumed identically; only `NAV_ITEMS`' underlying data
changes, which `useShellNavigation.ts` already maps generically via
`resolveItem`. Both files are expected to show **zero lines changed** in the
diff — a check the implementer runs with `git diff --stat` before reporting
completion, the same discipline feature 20's review used to confirm
`ContactForm.vue` stayed byte-identical.

### 5 · Test inventory

| File | Kind | What changes |
|---|---|---|
| `SiteNav.test.ts` | update | link row assertions (Servicios/Nosotros, not Proyectos/Nosotros); pill container classes; CTA box class + arrow span presence; `aria-current` still only on the active route |
| `SiteNav.stories.ts` | update | both viewports × both locales against the new markup; CTA shown in both reveal states if feasible without live scroll |
| `LanguageToggle.test.ts` | update | single circular element, no divider, correct `aria-label` per locale, `preserveAnchor` behaviour unchanged |
| `LanguageToggle.stories.ts` | update | both locales |
| `tests/static-output.test.ts` | update | generated-document assertions: no "Proyectos"/"Projects" inside `<nav>`; CTA box radius/size; toggle is one circular element per document |
| `tests/i18n-parity.test.ts` | none (mechanical) | passes automatically once both locale files carry the same new key set |

No net-new test *file* is required — every touched behaviour already has a
home in an existing suite.

## Post-Design Re-check

Re-run against the Constitution after the design above: no gate changes
status. The one item flagged conditionally in Phase -1 (`SiteNav.vue`
possibly crossing 200 non-comment lines) is resolved in the negative by
design: the added markup is two elements (an `aria-hidden` `<span>` and one
extra class list), not new logic, so the file's non-comment line count is
expected to grow by roughly one line — the implementer confirms this
numerically before reporting completion, per the same measurement
discipline `BotonPrimario.vue`'s own exception note established (raw lines
vs. non-comment lines are both quoted, not just one).

## Complexity Tracking

> No new violation. One existing exception is re-verified, not re-opened.

| Item | Why it appears here | Status after this feature |
|---|---|---|
| `BotonPrimario.vue` over Article V's 200-line limit | Recorded by feature 22 as prose-only growth, with the non-comment line count (74) as the stable metric | Re-verified: this feature edits only `sizeByVariant.nav`'s two string values — zero non-comment lines added. If the implementer's measurement disagrees, that is reported as a new finding, not silently absorbed into the existing note. |
