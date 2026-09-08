# Implementation Plan: Hero section

**Branch**: `feat/hero-section` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-hero-section/spec.md`

## Summary

Build the landing's first section as one responsive Vue component in a new
`landing` feature module, composing five primitives that already exist and
adding nothing but geometry tokens. Four children in a vertical stack — `Pill`
eyebrow, `<h1>`, subhead, CTA row — sized entirely through the existing fluid
`clamp()` scale, with a single `lg:` breakpoint that flips the CTA row from a
column to a row. Three `SectionGlow` instances go inside a `SectionBackdrop`
in the section's own markup, positioned by **section-relative** anchors
derived from the design's page-absolute coordinates. Both of the Hero's
destinations are absent, and each renders its absence the way the repository
already renders one: no anchor without an `href`, no fragment pointing at a
section that does not exist.

The technical weight is not in the markup. It is in three constraints this
feature is the first to be bound by: the R28/R37 paint order (silent failure
mode), the closed `--*-glow-*` token namespace (fails a test in a file this
feature never opens), and the `@theme inline` substitution rule (a token that
references another theme token emits a `var()` to a custom property the site
build does not declare). All three were investigated in `research.md` against
verified evidence rather than assumed — and the third turned out not to bind
this feature at all once the glow anchors became six independent
measurements, which is why all twelve tokens sit in `@theme inline` and
nothing is added to `:root`.

**One correction is baked into this plan.** Its first draft derived the mobile
glow positions from the desktop frame. The leader read the mobile frames on
2026-09-07 and the derivation was wrong by up to 35px: the glows are
hand-placed per viewport. Both endpoints are now measured (spec A-04, D-06),
and the wrong inference is recorded in `rules.md` § R48 so the five sections
still to come do not repeat it.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Vue 3.5 SFCs with
`<script setup lang="ts">`, Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: `@nuxtjs/i18n` 10 (strategy `prefix`, locales `es`
default + `en`), Tailwind CSS 4.3.3 via `@tailwindcss/vite` and
`@theme inline` in `app/assets/css/global.css`, `@nuxt/fonts`
**Storage**: none — no data layer, no persistence, no network call
**Testing**: Vitest 4 + `@nuxt/test-utils` + Vue Test Utils, `happy-dom`
globally (`rules.md` § R16); Storybook 10 (`vue3-vite`) as the visual review
surface (Constitution Article X)
**Target Platform**: static files in `.output/public`, served from S3 +
CloudFront. Two locales × two routes = four documents
**Project Type**: static marketing site — feature-based Vue front end, no
back end of any kind (Article IV)
**Performance Goals**: zero client-side JavaScript introduced by this feature;
the Hero must be complete in the prerendered HTML and CSS and identical with
scripting disabled
**Constraints**: zero hex/px literals in components (Article VII); zero copy
literals (Article VI); zero edits to `SectionGlow.vue`, `DotGrid.vue`,
`SectionBackdrop.vue`, `Pill.vue`, `BotonPrimario.vue` or the `--layer-*`
tokens; zero edits to any layout file; no token named `--color-glow-*` or
`--spacing-glow-*` (`rules.md` § R36)
**Scale/Scope**: one new feature module (4 files + 2 test/story files), one
new shared composable, one page rewritten from 9 lines to a thin wrapper, 14
tokens added to `global.css`, 5 keys added per locale, 1 new test file, 1
existing test file extended — plus four files of feature 3's shell modified
for the nav CTA reveal, enumerated in `spec.md` § *Files this feature
modifies*

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Phase -1: Pre-Implementation Gates

Derived from `.specify/memory/constitution.md` v2.0.0, plus the two
repository-specific contracts this feature is the first real consumer of.

#### I · Feature-Based + Capas Architecture

- [x] Does the Hero live under `app/features/<feature>/` rather than in
      `app/shared/`, `app/components/` or a page? → **Yes**: a new `landing`
      module, which Article I names by name and lists `hero` as its first
      member.
- [x] Does the module have exactly the three layers plus a barrel
      (`ui/`, `logic/`, `data/`, `index.ts`)? → **Yes**; nothing else is
      created inside it.
- [x] Is `app/pages/index.vue` a thin wrapper that composes and holds no
      feature logic? → **Yes**: it resolves content through the module's
      composable and renders the component.
- [x] Is anything placed in `app/shared/` only if it is genuinely
      cross-cutting? → **Nothing is added to `app/shared/` at all.**

#### II · Dependency Direction (NON-NEGOTIABLE)

- [x] Does `ui/` import only from `logic/` and `data/`? → It imports types
      from `data/` and shared primitives; it imports nothing from `logic/`
      because it receives resolved props.
- [x] Does `logic/` import only from `data/`? → **Yes.**
- [x] Does `data/` import from neither `logic/` nor `ui/`? → **Yes**; it holds
      i18n keys, two optional destination values and one interface.

#### III · Feature Isolation (NON-NEGOTIABLE)

- [x] Does `landing` avoid importing any internal file of `shell`
      (`ui/`, `logic/`, `data/`)? → **Yes.** The `#contacto` hash and the
      locale-path resolution are re-expressed inside `landing` rather than
      reaching for `SHELL_ANCHORS` or `ShellDestination`.
- [x] Is any duplication justified as smaller than the abstraction it avoids?
      → **Yes** — see `research.md` § R6. Two optional strings do not justify
      lifting a destination model into `app/shared/`; Article III explicitly
      prefers the duplication.

#### IV · Static-Site Purity (NON-NEGOTIABLE)

- [x] Does the feature add no `server/api/` route, no runtime server
      dependency and no request-time compute? → **Yes**; it is markup, CSS and
      two JSON keys per locale.
- [x] Is the entire feature present in `.output/public` after
      `pnpm generate`? → **Yes**, and SC-006/SC-009 are asserted against that
      artefact rather than against `pnpm dev`.

#### V · Component Discipline

- [x] `<script setup lang="ts">`, no Options API? → **Yes.**
- [x] Is the `ui/` component presentational — props in, no endpoint calls, no
      complex logic inline? → **Yes**; it also calls **zero Nuxt composables**,
      which is what lets Storybook catch a component that cheats
      (`rules.md` § R23).
- [x] Under 200 lines? → The Hero is ~70 lines of template plus its doc
      comment.
- [x] Is interactivity opt-in and local? → The Hero carries **no client-side
      state at all**.

#### VI · i18n Parity (NON-NEGOTIABLE)

- [x] Do both locale files gain the same five keys? → **Yes**, and
      `tests/i18n-parity.test.ts` enforces it.
- [x] Zero user-facing strings hardcoded in a component? → **Yes.**
- [x] Does every route still resolve in both locales? → Unchanged; this
      feature adds no route.
- [x] Is the deliberately untranslated eyebrow **asserted** rather than merely
      commented? → **Yes** — a test compares the two files' values for that
      key, so a future i18n pass that "fixes" it goes red (FR-009, FR-037).

#### VII · Design Tokens Discipline

- [x] Zero hex, `oklch` or arbitrary Tailwind values in components? → **Yes.**
- [x] Does every desktop↔mobile size difference resolve through an existing
      `clamp()` rather than a breakpoint? → **Yes.** Six existing roles cover
      every type and padding step; the only `lg:` in the feature changes
      **flex direction and cross-axis alignment**, never a size.
- [x] Are new tokens added only for geometry the scale does not carry, each
      commented with the two frame values it interpolates? → **Yes**, 12 of
      them, all `--*hero*`.
- [x] Is Poppins still confined to the wordmark? → **Yes**; every string in
      the Hero is Instrument Sans.

#### VIII · Clean Code Discipline

- [x] No generic names, no magic numbers, no dead code, no speculative
      abstraction? → **Yes**; in particular no `variant` prop, no `size` prop
      and no destination-kind union are invented for a two-entry need.
- [x] Are the two "absent" states real states rather than missing values? →
      **Yes**, modelled as absent keys on one typed record.

#### IX · TypeScript Strict + Biome

- [x] No `any`, no `@ts-ignore`? → **Yes.**
- [x] `pnpm check` and `pnpm typecheck` pass? → Gate, enforced by Husky.
- [x] Does the new component name survive Biome's
      `useVueMultiWordComponentNames`? → `HeroSection` is two words; no
      override is needed and none is added (`rules.md` §§ R17, R20).

#### X · Testing Discipline

- [x] Component test for the `ui/` component, with `should <expected> when
      <condition>` names? → **Yes**, covering copy mapping, token classes,
      both destination branches and the R28 constraint.
- [x] Storybook story covering both viewports, both locales and both
      destination states? → **Yes.**
- [x] Are tests independent of each other's state? → **Yes**; the component is
      stateless and registers no global listener, so `rules.md` § R43 does not
      bite.
- [x] Does every new test file actually run? → `vitest.config.ts` already
      includes `app/features/**/*.test.ts` and `tests/**/*.test.ts`, so **no
      `include` change is needed** — but the implementer must still see each
      new file fail on purpose once before writing its real assertions
      (`rules.md` § R39).
- [x] No E2E added? → **None.**

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] No `process.env`, no `runtimeConfig` change, no credential of any kind?
      → **Yes.** The one URL this feature is waiting for (a Google Calendar
      booking link) is a **public** link, not a credential — and it is not in
      this diff either way.

#### XII · Absolute Imports via Alias

- [x] Do all intra-project imports use `@/features/`, `@/shared/`, `@/assets/`
      etc., with relative paths only between files in the same directory? →
      **Yes.**
- [x] Is any new alias added? → **No**, so nothing needs mirroring in
      `.storybook/main.ts`.

#### R28 / R37 · Paint-order contract (repository-specific, NON-NEGOTIABLE)

This feature is the first thing the contract actually governs.

- [x] Is the section `position: relative`? → **Yes**, so `SectionBackdrop`'s
      `inset-0` resolves against the section box.
- [x] Are the glows rendered **inside** `SectionBackdrop`, in the section's own
      markup? → **Yes.**
- [x] Does the section — or anything the Hero puts between it and the layout
      root — create a stacking context (`transform`, `translate`, `scale`,
      `rotate`, `filter`, `backdrop-filter`, `opacity` < 1, `isolation`,
      `will-change`, `contain: paint`, `position: fixed`, `position: sticky`
      with `z-index`)? → **No.** Verified for the one wrapper that already
      exists: `<main class="mx-auto max-w-shell-max px-page">` sets none of
      them.
- [x] Does the section paint an opaque background? → **No.**
- [x] Is the `translate` on each individual glow permitted? → **Yes** —
      `SectionBackdrop.vue`'s own contract says a transform on an individual
      `SectionGlow` is fine, because it creates a stacking context only for
      that glow's own empty subtree.
- [x] Is the order verified **on the page** rather than in the catalogue? →
      **Yes**, FR-028; this is what closes feature 8's declared limit.

#### Cross-feature reach (added 2026-09-07 with the nav CTA reveal)

The new scope's trigger is the Hero's and its controlled element is the
shell's, so this gate exists to keep the crossing explicit.

- [x] Is the shared state in `app/shared/logic/` rather than in either
      feature? → **Yes**, `useNavCtaReveal.ts`. Article III's own remedy: *"If
      two features need the same piece of logic, lift it to `app/shared/`
      rather than reaching into another feature's internals."*
- [x] Does `landing` import anything from `shell`, or `shell` from `landing`?
      → **No.** Both import the shared composable; neither knows the other
      exists.
- [x] Does `app/shared/` import from a feature? → **No.** The composable takes
      the "this route suppresses the CTA" predicate as an argument rather than
      importing the shell's route type.
- [x] Is `SiteNav`'s existing prop surface preserved? → **Yes** — one prop
      added, none renamed, retyped or removed, so nothing composing it breaks.
- [x] Does `ui/` still avoid Nuxt composables? → **Yes.** `SiteNav` receives
      `showCta` already resolved. `HeroSection` gains one call to a **plain
      Vue** composable (`IntersectionObserver` + lifecycle hooks) — no Nuxt
      runtime, so it still renders in Storybook and in a bare mount, which is
      the property `rules.md` § R23 protects.
- [x] Does the module-scoped ref survive prerendering? → **Yes.** It is written
      only from `IntersectionObserver`, which never runs on the server, so
      every generated document carries its initial value — the identical
      argument `useMobileMenu` already documents for its own flag.
- [x] Does the pinned nav disturb the paint order? → **No.** `rules.md`
      §§ R28/R37 constrain a **section** and its ancestors; the nav is neither.
      `--layer-nav` is a new positive level and the three negative ones are
      untouched (A-13).

#### R36 · Closed glow token namespace (repository-specific)

- [x] Does any new token match `--(color|spacing)-glow-…`? → **No.** All
      twelve are `--hero-*` or `--spacing-hero-*`; `--spacing-hero-glow-foco-x`
      does not match the prefix `--spacing-glow-`.
- [x] Does `app/shared/ui/SectionGlow.test.ts` still pass unmodified? → It
      must, and a task asserts it explicitly.

**Result: PASS.** No violation, so the Complexity Tracking table stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/009-hero-section/
├── plan.md              # This file
├── spec.md              # The "what"
├── research.md          # Phase 0 — the seven questions and their evidence
├── data-model.md        # Phase 1 — content model, token table, glow table
├── quickstart.md        # Phase 1 — how to build it and how to verify it
├── contracts/
│   └── components.md    # Phase 1 — the module's public surface
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 — /speckit-tasks output
```

### Source Code (repository root)

```text
app/
├── features/
│   ├── landing/                    # NEW module (Constitution Article I)
│   │   ├── data/
│   │   │   └── heroContent.ts      # i18n keys, the two optional destinations, types
│   │   ├── logic/
│   │   │   └── useHeroContent.ts   # the module's only Nuxt seam
│   │   ├── ui/
│   │   │   ├── HeroSection.vue     # presentational: props in, nothing else
│   │   │   ├── HeroSection.test.ts
│   │   │   └── HeroSection.stories.ts
│   │   └── index.ts                # barrel — the module's only public API
│   └── shell/                      # UNTOUCHED
├── pages/
│   └── index.vue                   # rewritten as a thin wrapper
├── layouts/
│   └── default.vue                 # UNTOUCHED
├── shared/ui/                      # UNTOUCHED (Pill, BotonPrimario, LinkArrow,
│                                   #  SectionGlow, SectionBackdrop, DotGrid)
└── assets/css/
    └── global.css                  # + 12 @theme inline tokens, nothing in :root

i18n/locales/
├── es.json                         # + landing.hero.* (5 keys)
└── en.json                         # + landing.hero.* (5 keys)

tests/
├── landing-copy.test.ts            # NEW — copy read from disk, eyebrow identity
└── static-output.test.ts           # extended — the Hero in the artefact
```

**Structure Decision**: a new **`landing` feature module** with the three
mandated layers and a barrel. Article I names the four modules the site will
have — `shell`, `landing`, `about`, `forms` — and puts `hero` inside
`landing`, so this is not a judgement call: it is the module the constitution
already declared, created by its first member. Nothing goes into
`app/shared/`, because the Hero has exactly one consumer and the About page's
hero is a different composition at a different type size that will belong to
the `about` module (Article III's "prefer duplication over a premature shared
abstraction").

## Implementation Approach

### 1 · Content and the two dead ends

`data/heroContent.ts` holds the five i18n keys and one record of optional
destinations:

- `HERO_DESTINATIONS.callUrl` — absent; `decisions-open.md` #2, owner Clau.
- `HERO_DESTINATIONS.contactHash` — absent; section 05 does not exist.

`logic/useHeroContent.ts` is the module's only file that touches the Nuxt
runtime. It translates the five keys and turns `contactHash` — when it exists
— into a locale-correct path with `useLocalePath()`, the same way the shell
resolves its anchors, without importing anything from the shell. It returns
inert data.

`ui/HeroSection.vue` receives that data as props and renders. Because it calls
no composable, it renders in Storybook and in a bare Vue Test Utils mount with
no Nuxt runtime present — the property `rules.md` § R23 identifies as the
reason the catalogue can catch a cheating component at all.

Rendering the two absent destinations:

| Control | Absent (today) | Present (one data value later) |
|---|---|---|
| Primary CTA | `<BotonPrimario variant="hero">` with **no `href`** → a real `<button type="button">`; no fragment reaches the HTML | `<BotonPrimario variant="hero" :href>` → a link |
| Secondary CTA | `<span class="text-link text-ink-300">` — no anchor, no pointer, no hover, no arrow | `<LinkArrow external :href>` → `bone-100`, component-owned arrow that shifts on hover, new tab, opener severed |

Both branches are written now. Neither `BotonPrimario` nor `LinkArrow` is
modified; `LinkArrow` gains its first consumer in the code even though the
`v-else` branch is what renders today, and the story exercises the live branch
so it is reviewable before it ships.

### 2 · Geometry through the existing scale

Every type and control size the Hero needs is already a `clamp()` spanning the
two frames — `--text-display` (46→98), `--text-body-lg` (17→21),
`--text-pill` (12→13), `--text-button` (15→16) with the `hero` padding
variant, and `--text-link` (fixed 16). The page gutter is `<main>`'s
`px-page`, inherited and never re-declared.

Twelve tokens are added for what the scale does not carry: the stack's gap,
the CTA row's gap and its extra top padding, the body width, the subhead
measure, the section's top padding, and the six glow anchors. Their values and
derivations are in `data-model.md` § 2.

One `lg:` breakpoint exists in the whole feature, on the CTA row:
`flex-col items-start` → `lg:flex-row lg:items-center`. It changes direction
and alignment, never a size — the same distinction `SiteNav.vue` already draws
for its own `lg:` rules, and the reason `items-start` is on the mobile axis is
`ui-map.md` § 3's requirement that the primary button be as wide as its label.

### 3 · The glows

Three `SectionGlow` instances inside one `SectionBackdrop`, all three
colour+opacity+size triples already in the component's union and already
tokenised. Each is anchored **by its centre** to a real edge of the section:

| Glow | Offset from the section's corner, 390 → 1440 |
|---|---|
| `foco` | x 386 → 1230 · y **−26** → 187 |
| `wine` | x 16 → 50 · y 64 → 207 |
| `cierre` | x 416 → 1350 · y 444 → 767 |

Centring uses `-translate-x-1/2 -translate-y-1/2` on the glow itself, which
the section contract explicitly permits. The arithmetic is in
`research.md` § R4 and `data-model.md` § 3; offsets are measured from the
section's own corner rather than from the page because a page offset drifts
the moment anything above the section changes height (`rules.md` § R29).

**Both viewports are measured, and neither derives from the other.** The
design hand-places every glow per frame, so each of the six offsets carries
two design-sourced endpoints and interpolates between them. The interpolation
is a smoothing choice and is labelled as one — it exists so the section keeps
the property that its single breakpoint changes flex direction and never a
position (spec A-04, D-06).

### 4 · Verification

Three of this feature's claims cannot be asserted by Vitest and are measured
on the generated artefact with the DevTools-protocol method `rules.md` § R44
records — never a headless `--window-size`, which § R34 showed does not fix
the layout viewport:

1. The four stacking levels, measured **on the page** (closes feature 8's
   first declared limit).
2. The document scrolling with **nothing injected** at 1440×900 and 390×844,
   and the spotlight staying under a stationary pointer across that scroll
   (closes the second).
3. No horizontal scrollbar from 320px to 2560px.

Everything else is a normal test: a component test beside the SFC, a copy test
in `tests/`, and additions to the existing generated-output suite.

## Complexity Tracking

> No Constitution Check violation. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
