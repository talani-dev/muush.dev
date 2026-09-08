# Implementation Plan: Propósito — the Golden Circle section

**Branch**: none created (`master`; see `spec.md` § *Process notes*) | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-purpose-section/spec.md`

## Summary

Four Vue components in the existing `landing` module, one new content file, one
plain-Vue composable for the mobile carousel, and ~35 tokens. Desktop is a
constellation whose reveal is **pure CSS** — `:hover` / `:focus-visible` on each
node's trigger driving its two later siblings — and whose entire horizontal
geometry is generated from one index (`--i` = 0/1/2) plus three percentages.
Mobile is a native centre-snapping scroll track; the composable only adds the
active-card tracking, the indicator and keyboard wrap-around, so the no-JS
fallback is the track itself rather than something arranged for.

Nothing outside the section changes: `SectionGlow`, `SectionBackdrop`, `DotGrid`,
`Radar`, `GlassPanel` and `Pill` are consumed unmodified, and `Glow origen`
finally consumes `SectionGlow`'s `'920'` size — the variant feature 7 nearly
deleted as dead code.

**Two findings shape this plan more than the markup does.** First, the frame draws
the *revealed* state, so the design's brighter Why card is a hover value and not
hierarchy (Roberto, 2026-09-08). Second, the constellation's "magic numbers" are
not magic: the three line lengths are one formula, the three arc diameters are
`2 × distance(origin, radar)` verified to under 1px, and the mobile neighbour is
the active card at `0.88` on both axes. Writing any of them as literals would
throw away the relation that generates them.

## Technical Context

**Language/Version**: TypeScript 5 strict, Vue 3.5 SFCs (`<script setup lang="ts">`), Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: `@nuxtjs/i18n` 10 (`prefix` strategy, `es` default + `en`), Tailwind CSS 4.3.3 via `@tailwindcss/vite`, `@nuxt/fonts`. **No new dependency.**
**Storage**: none — no data layer, no persistence, no network call
**Testing**: Vitest 4 + `@nuxt/test-utils` + Vue Test Utils, `happy-dom` global (`rules.md` § R16); Storybook 10 as the visual review surface (Article X)
**Target Platform**: static files in `.output/public`, S3 + CloudFront. Two locales × two routes
**Project Type**: static marketing site, feature-based Vue front end, no back end (Article IV)
**Performance Goals**: the desktop reveal introduces **zero** client JavaScript; the mobile carousel adds one `IntersectionObserver` and two listeners, and degrades to a native scroll track without them
**Constraints**: zero hex/`px`/arbitrary Tailwind values in components (Article VII); zero copy literals (Article VI); zero edits to the six shared primitives or the `--layer-*` tokens; no token named `--color-glow-*` / `--spacing-glow-*` (§ R36); no stacking context on the section or above it (§§ R28, R37)
**Scale/Scope**: 4 new components + 2 logic files + 1 data file in `app/features/landing/`, 1 line added to `app/pages/index.vue`, ~35 tokens in `global.css`, 9 keys per locale, 3 new test files, 2 existing test files extended

## Constitution Check

*GATE: passed before Phase 0. Re-checked after the design below.*

### Phase -1: Pre-Implementation Gates

Derived from `.specify/memory/constitution.md` v2.0.0 plus the four
repository-specific contracts this feature is bound by.

#### I · Feature-Based + Capas Architecture

- [x] Does the section live under `app/features/<feature>/`? → **Yes**, in the
      existing `landing` module, which Article I names and whose members it lists
      as `hero, purpose, services, projects, contact CTA`. No new module.
- [x] Are the three layers respected (`ui/`, `logic/`, `data/`, barrel)? → **Yes**;
      nothing else is created inside the module.
- [x] Is `app/pages/index.vue` still a thin wrapper? → **Yes**: one more composable
      call and one more component in the template.
- [x] Is anything added to `app/shared/`? → **No.** The carousel composable is
      Propósito's alone; Servicios' lyrics effect is scroll-driven over five items
      and is a different problem (Article III prefers duplication over a premature
      shared abstraction).

#### II · Dependency Direction (NON-NEGOTIABLE)

- [x] `ui/` imports only from `logic/`, `data/` and `@/shared/ui`? → **Yes**.
- [x] `logic/` imports only from `data/`? → **Yes**.
- [x] `data/` imports from neither? → **Yes**; it holds keys and one node list.

#### III · Feature Isolation (NON-NEGOTIABLE)

- [x] Does `landing` avoid `shell`'s internals? → **Yes.** The `#proposito`
      identifier is declared **only** as this section's own `id`; the shell keeps
      owning the link that points at it, and neither imports the other. The literal
      appears in both features — that is one word duplicated, which Article III
      prefers to a shared anchor registry.
- [x] Does `shell` change? → **No file under `app/features/shell/` is touched.**

#### IV · Static-Site Purity (NON-NEGOTIABLE)

- [x] No `server/api/`, no runtime server dependency, no request-time compute? → **Yes.**
- [x] Is the whole section present in `.output/public` after `pnpm generate`? →
      **Yes**, including the full reveal behaviour, which is CSS.

#### V · Component Discipline

- [x] `<script setup lang="ts">`, no Options API? → **Yes.**
- [x] Are `ui/` components presentational, props in, no endpoint calls? → **Yes**;
      and none calls a **Nuxt** composable, which is what keeps them renderable in
      Storybook and in a bare mount (`rules.md` § R23).
- [x] Under 200 lines each? → **Yes** — the reason the section is four components
      (`PurposeSection`, `PurposeConstellation`, `PurposeCarousel`, `PurposeCard`)
      rather than one.
- [x] Is interactivity opt-in and local? → **Yes.** The desktop composition holds
      no state at all; the mobile one holds an active index and nothing else.

#### VI · i18n Parity (NON-NEGOTIABLE)

- [x] Do both locale files gain the same nine keys? → **Yes**, enforced by
      `tests/i18n-parity.test.ts`.
- [x] Zero user-facing strings in components? → **Yes.**
- [x] Any new route? → **No.**
- [x] Is the `what.copy` / `hero.subhead` duplication handled honestly? → **Yes**:
      two keys with the same approved value, reported rather than collapsed, and a
      test asserts the value against `content.md` per key so neither drifts.

#### VII · Design Tokens Discipline

- [x] Zero hex, `oklch` or arbitrary Tailwind values in components? → **Yes.**
- [x] Does every desktop↔mobile size difference resolve through the fluid scale
      rather than a breakpoint? → **Every size does.** The `lg:` rules in this
      feature change **which composition renders**, one font weight (`rules.md`
      § R4's named exception) and the card label's visibility — never a size.
- [x] Are new tokens only for what the scale does not carry, each commented with
      its derivation? → **Yes** (`data-model.md` § 4).
- [x] Are the two token homes correct? → **Yes**, and this is the gate that bites:
      a token read by hand-written CSS goes in `:root`, a token consumed as a
      utility goes in `@theme inline`. A theme token named in a `<style scoped>`
      resolves to nothing, **silently** (`rules.md` § R18, `findings.md` §§ R46, R52).
- [x] Is Poppins still confined to the wordmark? → **Yes.**

#### VIII · Clean Code Discipline

- [x] No magic numbers? → **This is the feature's main design pressure.** The three
      line lengths, the three arc diameters and the mobile neighbour size are all
      generated (`data-model.md` § 2). FR-014, FR-015, FR-017 and FR-021 forbid
      writing them as literals.
- [x] No speculative abstraction? → **Yes**: no `variant`, no `size`, no `mode` prop
      anywhere, and no shared "carousel" abstraction for one consumer.
- [x] No dead code? → The `'920'` glow variant stops being unconsumed.

#### IX · TypeScript Strict + Biome

- [x] No `any`, no `@ts-ignore`? → **Yes.**
- [x] Do the four component names survive `useVueMultiWordComponentNames`? →
      **Yes**, all four are multi-word; no `biome.json` override is added
      (`rules.md` §§ R17, R20).

#### X · Testing Discipline

- [x] Component tests with `should <expected> when <condition>` names? → **Yes**,
      one file per composition plus one for the card.
- [x] Storybook stories at both viewports and both locales? → **Yes**, including
      the rest state, a revealed node and the coarse-pointer state.
- [x] Do the new test files actually run? → `vitest.config.ts` already collects
      `app/features/**/*.test.ts` and `tests/**`, so no `include` change is needed
      — but each new file must be **seen red on purpose once** before its real
      assertions are written (`findings.md` § R39).
- [x] Are tests independent? → The carousel composable registers global listeners,
      so its test file must unmount everything in `afterEach`: `happy-dom` gives
      one `window` per file and the leak reads as a failure of the subject
      (`findings.md` § R43).
- [x] No E2E added? → **None.**

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] No `process.env`, no `runtimeConfig` change, no credential? → **Yes.** This
      feature has no destination at all — the cards are not links.

#### XII · Absolute Imports via Alias

- [x] All intra-project imports via `@/features/`, `@/shared/`? → **Yes**, with
      relative paths only between files in the same directory.
- [x] Any new alias? → **No**, so nothing to mirror in `.storybook/main.ts`.

#### R28 / R37 · Paint-order contract (repository-specific, NON-NEGOTIABLE)

- [x] Is the section `position: relative`? → **Yes**, so `SectionBackdrop`'s
      `inset-0` resolves against the section box.
- [x] Are all three glows inside one `SectionBackdrop` in the section's own markup?
      → **Yes**, including `Glow origen`.
- [x] Does the section, or any wrapper between it and the layout root, create a
      stacking context or paint an opaque background? → **No.** `<main>` sets none
      and this section adds no wrapper above itself.
- [x] Are the descendant stacking contexts acceptable? → **Yes, and they are
      deliberate.** The trigger's `translate`, the card's `opacity`, the carousel
      cards' `scale` and every glass surface's `backdrop-filter` each create a
      context for **its own subtree only**. The contract constrains the section and
      its **ancestors**; a leaf in the content layer cannot lift the backdrop,
      which is a *sibling*. `SectionBackdrop.vue`'s comment already grants this for
      an individual glow, and the same reasoning applies unchanged.
- [x] Is the arcs' clip kept off the section element? → **Yes** — `overflow: clip`
      on the section would cut the section's own 1000px glows. It goes on an
      `absolute inset-0` wrapper instead, which clips to the same box and creates
      no stacking context.
- [x] Verified **on the page**, not in Storybook? → **Yes**, tasks in Phase 5.

#### R36 · Closed glow token namespace (repository-specific)

- [x] Does any new token match `--(color|spacing)-glow-…`? → **No.** All are
      `--purpose-*`, `--spacing-purpose-*`, `--text-purpose-*` or
      `--duration-purpose-*`; `--spacing-purpose-glow-a-x` does not match the
      prefix `--spacing-glow-`.
- [x] Does `app/shared/ui/SectionGlow.test.ts` still pass unmodified? → It must,
      and a task asserts it before anything else is built.

#### R49 · Section rhythm (repository-specific)

- [x] Does the section take its top padding from the Hero's leftover rather than
      from a page-absolute y? → **Yes**: 164 desktop / 90 mobile, measured.
- [x] Does it declare **no** bottom padding? → **Yes**; the gap to Servicios is
      Servicios'. This plan records the leftover it passes on: **101px** desktop
      (`spec.md` § *Notes for feature 14*).

**Result: PASS.** No violation, so Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/013-purpose-section/
├── spec.md                      # The "what", plus provenance and the six open values
├── plan.md                      # This file
├── data-model.md                # Content, the generating geometry, the token tables
├── tasks.md                     # /speckit-tasks output
└── checklists/requirements.md   # Spec quality checklist
```

> **No `research.md` and no `quickstart.md`.** The spec carries zero
> `[NEEDS CLARIFICATION]`, so Phase 0 has nothing to resolve, and the three real
> technical questions are decided in § *Decisions* below with their evidence.
> Roberto's standing correction on this cycle is that it produces too much prose;
> two more documents restating the same decisions would be exactly that.

### Source Code (repository root)

```text
app/
├── features/landing/
│   ├── data/
│   │   ├── purposeContent.ts          # NEW — keys, the three nodes, types
│   │   └── heroContent.ts             # UNTOUCHED
│   ├── logic/
│   │   ├── usePurposeContent.ts       # NEW — the module's second Nuxt seam (useI18n)
│   │   └── usePurposeCarousel.ts      # NEW — plain Vue: active index, no Nuxt call
│   ├── ui/
│   │   ├── PurposeSection.vue         # NEW — backdrop, eyebrow, both compositions
│   │   ├── PurposeConstellation.vue   # NEW — desktop, pure-CSS reveal
│   │   ├── PurposeCarousel.vue        # NEW — mobile, snap track + indicator
│   │   ├── PurposeCard.vue            # NEW — label + copy, two placements
│   │   ├── *.test.ts · *.stories.ts   # NEW
│   │   └── HeroSection.vue            # UNTOUCHED
│   └── index.ts                       # extended barrel
├── pages/index.vue                    # + one composable call, + one component
├── shared/ui/                         # UNTOUCHED (six primitives consumed as-is)
├── layouts/default.vue                # UNTOUCHED
└── assets/css/global.css              # + ~19 :root tokens, + ~16 @theme tokens

i18n/locales/{es,en}.json              # + landing.purpose.* (9 keys each)

tests/
├── landing-copy.test.ts               # extended — purpose copy read from disk
└── static-output.test.ts              # extended — the section in the artefact
```

**Structure Decision**: the existing `landing` module, beside the Hero. Article I
lists `purpose` as a member of `landing` by name, so this is not a judgement call.
Four components rather than one because Article V caps a component at 200 lines
and the two compositions share only the card.

## Decisions

### D-1 · The reveal is a sibling selector, not a composable

Each node renders **trigger → line → card** in that DOM order inside a
`position: relative` row. The trigger is a real focusable control; the line and
the card are its **later siblings**, so `.trigger:hover ~ .line` and
`.trigger:focus-visible ~ .card` reach them with no `:has()`, no JavaScript and no
state. Reading order for a screen reader comes out as label-then-copy, which is
the Golden Circle's own order.

Three properties, three homes, each declared **once** (`findings.md` § R53 — a
`<style scoped>` selector outranks a utility and can silently kill a
`motion-reduce:` class):

| What | Where | Why there |
|---|---|---|
| Line width, card opacity, radar opacity | `<style scoped>` | the line's width is a `calc()` over `--i`; no utility can express it |
| The card's revealed surface (`red-strong` fill and stroke) | Tailwind `peer-hover:` / `peer-focus-visible:` utilities on the card | the glass colours live in `@theme inline` and **cannot** be named from hand-written CSS (§ R18) |
| Transition property, duration, delay and `prefers-reduced-motion` | `<style scoped>`, one block | Tailwind v4 has no `transition-duration` theme namespace (`findings.md` § R52) |

The trigger therefore carries `class="peer"` *and* is the scoped selector's
subject. Sequencing is two delays: on reveal the card waits one duration for the
line; on hide the line waits one duration for the card. Reduced motion sets
`transition: none` on both, so the reveal survives and only the movement goes.

`@media (hover: none)` sets the revealed line width and card opacity
unconditionally (FR-011) — the same `@media (hover: hover)` discipline
`rules.md` § R7 already applied to the LED ring.

**Alternatives rejected.** `<details>`/`<summary>` gives real disclosure semantics
for free but removes the closed content from the accessibility tree and fights an
opacity transition (`content-visibility: hidden` would have to be overridden,
after which the widget announces "collapsed" over content that is exposed).
Wrapping the whole row as the hover target makes a 1280×228 band the trigger, so
crossing the section reveals cards. A composable with `mouseenter`/`mouseleave`
buys nothing CSS does not already do and costs the no-JS behaviour.

### D-2 · The mobile carousel is a native snap track plus a small composable

The track does the work: `scroll-snap-type: x mandatory`, `scroll-snap-align:
center` and a symmetric inline padding that centres each card. That is the whole
of swiping, snapping and centring, and it is also the no-JS fallback verbatim
(`ui-map.md` § 10) — nothing is arranged for the fallback, it is what remains when
the script does not run.

`usePurposeCarousel` adds only what CSS cannot: which card is centred (one
`IntersectionObserver` on the track), the three indicator buttons calling
`scrollTo`, keyboard arrows, and `aria-current` on the active dot. It is a **plain
Vue** composable — no Nuxt call — so every `ui/` component still mounts bare.

The loop is wrap-around for the indicator and the keyboard only (assumption A-07).
A seamless swipe loop needs cloned nodes or scroll teleporting, either of which
would break the plain snap track that the no-JS path depends on.

### D-3 · The arcs are clipped by a wrapper, and paint in the content layer

`overflow: clip` goes on an `absolute inset-0` desktop-only wrapper, not on the
section: the section carries two ~1000px glows whose soft edges must stay soft,
and clipping the section would cut them hard. `overflow: clip` creates no
stacking context (unlike `contain: paint`), and `clip` rather than `hidden`
because `hidden` would make the element a scroll container — the same distinction
`app/layouts/default.vue` already documents.

The wrapper sits at `z-index: auto`, so the arcs paint above the dotted paper and
below the cards. They are composition, not background: the design nests them in
the section frame beside the cards, not in the page background group (A-09).

## Implementation Approach

1. **Tokens first** (`data-model.md` § 4), in the two correct homes, each commented
   with its derivation. Then run `SectionGlow.test.ts` unmodified as the § R36
   guard before any component exists.
2. **Copy** — nine keys per locale, with the three labels marked `⚠️ O-03` in the
   data file so filling them is one string each.
3. **Bottom-up per Article II**: `data/` → `logic/` → `PurposeCard` →
   `PurposeConstellation` → `PurposeCarousel` → `PurposeSection` → barrel → page.
4. **Verification that Vitest cannot do** is measured on the generated artefact
   with `Emulation.setDeviceMetricsOverride` over the DevTools protocol
   (`findings.md` § R44) — never a headless `--window-size`, which §§ R34 and R60
   showed produces images that look exactly like an overflow bug: the four paint
   levels, the six glow centres, the three arc tangencies, the reveal at rest and
   under hover, `hover: none`, reduced motion, and no horizontal overflow from 320
   to 2560.

## Complexity Tracking

> No Constitution Check violation. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
