# Implementation Plan: Servicios — the landing's third section

**Branch**: none created (`feat/services-section`; see `spec.md` § *Process notes*) | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-services-section/spec.md`

## Summary

Four Vue components in the existing `landing` module, two composables, one content
file, and a token set. Desktop is an absolutely-positioned canvas — five always-visible
`ServiceItem`s (radar + name + brief, no glass surface) joined by four SVG connector
lines, all generated from five confirmed radar centres. Mobile is a vertical timeline
against a spine, with a scroll-driven three-tier opacity effect ("lyrics") built on one
`IntersectionObserver`, never a `scroll` handler reading geometry.

Nothing outside the section changes: `SectionGlow`, `SectionBackdrop`, `DotGrid`,
`Radar` and `Pill` are consumed unmodified. `ServiceItem` is a genuinely new component,
not a `PurposeCard` variant — there is no glass surface and no hover-reveal state here,
so sharing code with a hover-revealed glass card would be exactly the premature
abstraction Article VIII forbids.

**Two findings shape this plan more than the markup does.** First, the four connector
"rectangles" the frame draws are not four independent shapes: each is, within 1px
rounding, the bounding box of two consecutive radar centres — i.e. a straight line
between two known points, not a fifth measured quantity. Second, the mobile items' 65px
"gap" that looks irregular next to three 87px gaps is not a design inconsistency: all
five items start at a constant 185px step, and item 3's block is simply 22px taller
(its brief is longest), eating into an identical slot. Writing either as literals would
throw away the relation that generates it.

## Technical Context

**Language/Version**: TypeScript 5 strict, Vue 3.5 SFCs (`<script setup lang="ts">`), Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: `@nuxtjs/i18n` 10 (`prefix` strategy, `es` default + `en`), Tailwind CSS 4.3.3 via `@tailwindcss/vite`, `@nuxt/fonts`. **No new dependency.**
**Storage**: none — no data layer, no persistence, no network call
**Testing**: Vitest 4 + `@nuxt/test-utils` + Vue Test Utils, `happy-dom` global (`rules.md` § R16); Storybook 10 as the visual review surface (Article X)
**Target Platform**: static files in `.output/public`, S3 + CloudFront. Two locales × two routes
**Project Type**: static marketing site, feature-based Vue front end, no back end (Article IV)
**Performance Goals**: zero client JavaScript for the desktop composition (pure CSS/SVG); mobile adds exactly one `IntersectionObserver` and degrades to a static, fully-visible timeline without it
**Constraints**: zero hex/`px`/arbitrary Tailwind values in components (Article VII); zero copy literals (Article VI); zero edits to the five shared primitives or the `--layer-*` tokens; no token named `--color-glow-*` / `--spacing-glow-*` (§ R36); no stacking context on the section or above it (§§ R28, R37)
**Scale/Scope**: 4 new components + 2 logic files + 1 data file in `app/features/landing/`, 1 line added to `app/pages/index.vue`, ~28 tokens in `global.css`, 8 keys per locale (5 names + 5 briefs share the loop, + eyebrow + delivery copy), 3 new test files, 2 existing test files extended

## Constitution Check

*GATE: passed before Phase 0. Re-checked after the design below.*

### Phase -1: Pre-Implementation Gates

Derived from `.specify/memory/constitution.md` v2.0.0 plus the repository-specific
contracts this feature is bound by, in the same order feature 13's plan used.

#### I · Feature-Based + Capas Architecture

- [x] Does the section live under `app/features/<feature>/`? → **Yes**, the existing
      `landing` module, which Article I lists as `hero, purpose, services, projects,
      contact CTA`. No new module.
- [x] Are the three layers respected? → **Yes**; nothing added outside `landing`.
- [x] Is `app/pages/index.vue` still a thin wrapper? → **Yes**: one composable call, one
      component in the template.
- [x] Is anything added to `app/shared/`? → **No.** `useServicesLyrics` is this section's
      alone; Propósito's carousel composable is a different problem (Article III
      prefers duplication over a premature shared abstraction) and neither shares code
      with this one.

#### II · Dependency Direction (NON-NEGOTIABLE)

- [x] `ui/` imports only from `logic/`, `data/`, `@/shared/ui`? → **Yes**.
- [x] `logic/` imports only from `data/`? → **Yes**.
- [x] `data/` imports from neither? → **Yes**; it holds keys and the five-node list.

#### III · Feature Isolation (NON-NEGOTIABLE)

- [x] Does `landing` avoid `shell`'s internals? → **Yes.** `#servicios` is declared only
      as this section's own `id`, the same pattern feature 13 used for `#proposito`; the
      shell keeps owning the link, neither imports the other.
- [x] Does `shell` change? → **No file under `app/features/shell/` is touched.**

#### IV · Static-Site Purity (NON-NEGOTIABLE)

- [x] No `server/api/`, no runtime dependency, no request-time compute? → **Yes.**
- [x] Is the whole section, including the lyrics effect's rest state, present in
      `.output/public` after `pnpm generate`? → **Yes** — the no-JS state (all five at
      100%) is the CSS default; the `IntersectionObserver` only overrides it once
      hydrated.

#### V · Component Discipline

- [x] `<script setup lang="ts">`, no Options API? → **Yes.**
- [x] Are `ui/` components presentational, props in, no endpoint calls? → **Yes**; none
      calls a Nuxt composable directly (`rules.md` § R23), so each mounts bare in
      Storybook.
- [x] Under 200 lines each? → **Yes** — the reason this is four components
      (`ServicesSection`, `ServicesConstellation`, `ServicesTimeline`, `ServiceItem`)
      rather than one: the two compositions share only the item, exactly like
      Propósito's constellation/carousel split shared only the card.
- [x] Is interactivity opt-in and local? → **Yes.** The desktop composition holds no
      state at all. The mobile composable holds only which item is centred.

#### VI · i18n Parity (NON-NEGOTIABLE)

- [x] Do both locale files gain the same keys? → **Yes**, enforced by
      `tests/i18n-parity.test.ts`.
- [x] Zero user-facing strings in components? → **Yes.**
- [x] Any new route? → **No.**
- [x] Is the O-01 English-placeholder honestly handled? → **Yes**: the ES key's value is
      the English name, marked `⚠️ O-01` in the data file's comment, not silently
      presented as a translation. A component test asserts the ES and EN name arrays are
      currently identical, so the day a Spanish name lands, the test forces the comment
      and this assertion to be updated together rather than drifting.

#### VII · Design Tokens Discipline

- [x] Zero hex, `oklch` or arbitrary Tailwind values in components? → **Yes.**
- [x] Does every desktop↔mobile size difference resolve through the fluid scale rather
      than a breakpoint? → **Every size that scales does.** The `lg:` rule changes which
      composition renders, never a size within one composition.
- [x] Are new tokens only for what the scale does not carry, each commented with its
      derivation? → **Yes** (`data-model.md` § 4).
- [x] Are the two token homes correct? → **Yes, and this is the gate that bites harder
      here than it did for Propósito.** The connector SVG's `x1/y1/x2/y2` and the
      canvas's explicit height are consumed by hand-written markup (bound as inline SVG
      attributes / a `<style scoped>` rule), so they live in `:root`; a token consumed as
      a Tailwind utility (paddings, glow anchors, durations) lives in `@theme inline`
      (`rules.md` § R18, `findings.md` § R46).
- [x] Is Poppins still confined to the wordmark? → **Yes.**

#### VIII · Clean Code Discipline

- [x] No magic numbers? → **This is the feature's main design pressure**, same framing as
      feature 13. The four connector endpoints and the five mobile item offsets are
      generated, not hardcoded (`data-model.md` § 2). FR-007, FR-008 and FR-011 forbid
      writing them as literals.
- [x] No speculative abstraction? → **Yes**: `ServiceItem` shares nothing with
      `PurposeCard` — forcing a shared component between a hover-revealed glass card and
      an always-visible plain block would itself be the speculative abstraction this
      article forbids. No `variant`/`mode` prop anywhere.
- [x] No dead code? → Nothing removed or left unconsumed.

#### IX · TypeScript Strict + Biome

- [x] No `any`, no `@ts-ignore`? → **Yes.**
- [x] Do the four component names survive `useVueMultiWordComponentNames`? → **Yes**, all
      four are multi-word; no `biome.json` override needed (`rules.md` §§ R17, R20).

#### X · Testing Discipline

- [x] Component tests with `should <expected> when <condition>` names? → **Yes**, one
      file per composition plus one for `ServiceItem`.
- [x] Storybook stories at both viewports and both locales? → **Yes**, including the
      lyrics effect's three opacity states and the no-JS/reduced-motion state.
- [x] Do the new test files actually run? → `vitest.config.ts` already collects
      `app/features/**/*.test.ts`; each new file must still be **seen red once on
      purpose** before its real assertions are written (`findings.md` § R39).
- [x] Are tests independent? → `useServicesLyrics` registers an `IntersectionObserver`
      per mount; its test file disconnects every instance in `afterEach` — the same leak
      class `findings.md` § R43 found in Propósito's carousel composable.
- [x] No E2E added? → **None.**

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] No `process.env`, no `runtimeConfig` change, no credential? → **Yes.** The section
      has no destination at all — nothing here is a link.

#### XII · Absolute Imports via Alias

- [x] All intra-project imports via `@/features/`, `@/shared/`? → **Yes.**
- [x] Any new alias? → **No.**

#### R28 / R37 · Paint-order contract (repository-specific, NON-NEGOTIABLE)

- [x] Is the section `position: relative`? → **Yes.**
- [x] Are both glows inside one `SectionBackdrop` in the section's own markup? → **Yes.**
- [x] Does the section, or any wrapper between it and the layout root, create a stacking
      context or paint an opaque background? → **No.** The desktop canvas's own
      `position: relative` is a **descendant** of the section, not an ancestor of it, so
      it does not count against the contract (`SectionBackdrop.vue`'s comment already
      grants this class of exception, same reasoning feature 13 used for its own
      descendant contexts).
- [x] Verified **on the page**, not in Storybook? → **Yes**, tasks in Phase 5.

#### R36 · Closed glow token namespace (repository-specific)

- [x] Does any new token match `--(color|spacing)-glow-…`? → **No.** All are
      `--services-*`, `--spacing-services-*` or `--duration-services-*`.
- [x] Does `SectionGlow.test.ts` still pass unmodified? → It must, and a task runs it
      before any component exists.

#### R49 · Section rhythm (repository-specific)

- [x] Does the section take its top padding from Propósito's leftover rather than a
      page-absolute y? → **Yes**: 101px desktop (feature 13's own computed value),
      mobile an open value (O-03).
- [x] Does it declare **no** bottom padding? → **Yes**; this plan records the leftover it
      hands to feature 15: **110px** desktop (`spec.md` § *Notes for feature 15*).

**Result: PASS.** No violation, so Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/014-services-section/
├── spec.md                      # The "what", plus provenance and the four open values
├── plan.md                      # This file
├── data-model.md                # Content, the generating geometry, the token tables
├── tasks.md                     # /speckit-tasks output
└── checklists/requirements.md   # Spec quality checklist
```

> **No `research.md` and no `quickstart.md`** — same reasoning feature 13 gave: the spec
> carries zero `[NEEDS CLARIFICATION]`, and the three real technical questions (SVG vs.
> rotated div for the connectors, `IntersectionObserver` vs. a scroll handler, whether
> `ServiceItem` reuses `PurposeCard`) are decided in § *Decisions* below with their
> evidence. Roberto's standing correction is that this cycle already produces too much
> prose.

### Source Code (repository root)

```text
app/
├── features/landing/
│   ├── data/
│   │   ├── servicesContent.ts         # NEW — keys, the five nodes, types
│   │   ├── purposeContent.ts          # UNTOUCHED
│   │   └── heroContent.ts             # UNTOUCHED
│   ├── logic/
│   │   ├── useServicesContent.ts      # NEW — the module's Nuxt seam (useI18n)
│   │   ├── useServicesLyrics.ts       # NEW — plain Vue: IntersectionObserver, no Nuxt call
│   │   └── usePurposeCarousel.ts      # UNTOUCHED
│   ├── ui/
│   │   ├── ServicesSection.vue        # NEW — backdrop, eyebrow, both compositions, closer
│   │   ├── ServicesConstellation.vue  # NEW — desktop, absolute canvas + SVG connectors
│   │   ├── ServicesTimeline.vue       # NEW — mobile, spine + items + lyrics
│   │   ├── ServiceItem.vue            # NEW — radar + name + brief, no glass surface
│   │   ├── *.test.ts · *.stories.ts   # NEW
│   │   └── Purpose*.vue               # UNTOUCHED
│   └── index.ts                       # extended barrel
├── pages/index.vue                    # + one composable call, + one component
├── shared/ui/                         # UNTOUCHED (five primitives consumed as-is)
├── layouts/default.vue                # UNTOUCHED
└── assets/css/global.css              # + ~14 :root tokens, + ~14 @theme tokens

i18n/locales/{es,en}.json              # + landing.services.* (8 keys each)

tests/
├── landing-copy.test.ts               # extended — services copy read from disk
└── static-output.test.ts              # extended — the section in the artefact
```

**Structure Decision**: the existing `landing` module, beside the Hero and Propósito.
Article I lists `services` as a member of `landing` by name. Four components rather
than one because Article V caps a component at 200 lines and the two compositions
share only the item.

## Decisions

### D-1 · Desktop is one absolutely-positioned canvas, not a flow layout

`ServicesConstellation` is a single `position: relative` box with an explicit height
(`910px`, derived — the design's own furthest content extent, § *Provenance*), holding
the eyebrow `Pill`, five absolutely-positioned `ServiceItem`s, the four connector lines
and the delivery closer. This is a deliberate departure from Propósito's own D-1/D-2:
Propósito's cards flow in a column and only its decorations (radar, line, arcs) are
overlaid absolutely, because its geometry is columnar. This section's five positions are
non-linear on **both** axes — a genuine hand-placed scatter, not a grid pretending to be
one (`services.md`: "colocados a mano") — so there is no flow arrangement that
reproduces it. Forcing one would misrepresent the design as algorithmic when it is not.

There is also no hover-reveal state to build around, unlike Propósito's D-1 (a sibling
selector driving a later element): every desktop node is always visible, so this
composition carries no interaction and no `:hover`/`:focus-visible` wiring at all.

### D-2 · The four connectors are SVG `<line>`s generated from the five radar centres

One inline `<svg>` inside the canvas holds four `<line>` elements, whose `x1,y1,x2,y2`
are the five confirmed radar centres consumed pairwise by one small pure function
(`connectorEndpoints(centres)`), not four hardcoded rectangles. SVG over a rotated,
sized `<div>`: the four segments have four different angles (the centres are not
collinear), so a div would need `atan2`-computed rotation and length per pair — real
trigonometry for a cosmetic hairline — while an SVG line needs neither; the browser
draws the segment from two points directly. The line is decorative
(`aria-hidden="true"`), stroked with `bone-100` at 24% (§ *Open values* O-02, same
hairline family Propósito's connector lines use).

**Alternative rejected.** A CSS `conic-gradient`/`clip-path` approach was considered and
dropped: it can draw a single diagonal but not four independent ones without four
separate masked elements anyway, at which point it has all of SVG's complexity with
none of its native two-point line primitive.

### D-3 · The lyrics effect is one `IntersectionObserver`, never a scroll-position read

`useServicesLyrics` observes all five item elements with thresholds `[0, 0.5, 1]`
(§ *Open values* O-04). Each callback reads each observed entry's own
`intersectionRatio` — a value the browser computes off the main thread's hot path — and
assigns the highest-ratio item `data-lyrics="active"`, its two DOM neighbours
`data-lyrics="near"`, and the rest `data-lyrics="far"`. CSS `[data-lyrics]` selectors own
the actual opacity and the transition; the composable only ever writes an attribute.

This is the same class of decision `findings.md` § R41 forced on the cursor spotlight:
reading `scrollY` or `getBoundingClientRect()` inside a per-frame update path forces a
synchronous style recalculation regardless of read/write ordering. An
`IntersectionObserver` never runs inside a `requestAnimationFrame` and never triggers
that recalculation — it is the platform's own answer to "which of these five elements is
where, right now," so there is no geometry to read by hand at all.

**No-JS and reduced-motion fallback.** The CSS default — with no `[data-lyrics]`
attribute present — is `opacity: 1` on every item, unconditionally. The composable only
attaches once mounted and only overrides that default from there; under
`prefers-reduced-motion: reduce` it still attaches (this is decoration, not the reveal
Propósito's FR-012 protects) but the transition is dropped, so re-bucketing is instant
rather than eased.

**Alternative rejected.** A `scroll` listener computing each item's distance to
viewport-centre was the first design and is exactly what § R41 measured the cost of; it
was dropped before being built, not after.

### D-4 · `ServiceItem` shares nothing with `PurposeCard`

`ServiceItem` renders a `Radar`, a name and a brief with no wrapping `GlassPanel` and no
opacity/line reveal state — `services.md` is explicit that the section has "sin
tarjetas." It is a new component from the ground up. Sharing a base with `PurposeCard`
(whose entire contract is a glass surface plus a two-stage CSS reveal) would need a
`variant`/`mode` prop distinguishing "has a card" from "doesn't," which is precisely the
speculative branching Article VIII prohibits before a second real consumer asks for it.

## Implementation Approach

1. **Tokens first** (`data-model.md` § 4), in the two correct homes, each commented with
   its derivation. Then run `SectionGlow.test.ts` unmodified as the § R36 guard before
   any component exists.
2. **Copy** — eight keys per locale, with the five names marked `⚠️ O-01` in the data
   file.
3. **Bottom-up per Article II**: `data/` → `logic/` → `ServiceItem` →
   `ServicesConstellation` → `ServicesTimeline` → `ServicesSection` → barrel → page.
4. **Verification that Vitest cannot do** is measured on the generated artefact with
   `Emulation.setDeviceMetricsOverride` over the DevTools protocol (`findings.md` § R44)
   — never a headless `--window-size` (§§ R34, R60): the four paint levels, the two
   glow centres, the four connector endpoints against the five radar centres, the
   lyrics effect's three states while scripted scrolling, the no-JS and reduced-motion
   states, and no horizontal overflow from 320 to 2560.

## Complexity Tracking

> No Constitution Check violation. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| — | — | — |
