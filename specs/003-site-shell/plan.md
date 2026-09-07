# Implementation Plan: Site shell — Nav, Footer and mobile menu

**Branch**: `003-site-shell` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-site-shell/spec.md`

## Summary

Build the chrome that wraps every page — a responsive Nav, a full-screen mobile
menu, a four-column Footer and an ES/EN toggle — as the repository's **first
feature module**, `app/features/shell/`, in the `ui` · `logic` · `data` shape
Article I mandates. Wire it into a Nuxt layout so no page composes it, and add
the About route so the nav links resolve instead of 404ing.

The technical approach, established in `research.md`:

- **Locale switching wraps `@nuxtjs/i18n`**, never a prefix string-swap. The
  translated segment is declared once in `nuxt.config.ts` under `i18n.pages`.
  The repository's own logic — guaranteeing a non-empty destination, and
  appending the fragment — is extracted into a pure function so the unit tests
  test us rather than the library.
- **The anchor is a click-time enhancement.** A fragment does not exist at
  generate time, so the rendered `href` is anchorless and degrades correctly.
- **`ui/` never calls a Nuxt composable.** Copy and hrefs arrive resolved from
  `logic/`. Storybook, running outside Nuxt, is what detects a violation.
- **No new dependency.** The menu's state, scroll lock, Escape handling and
  `inert` containment are a plain composable; VueUse is not in the tree and is
  not added for this.
- **35 token additions, zero token edits.** Feature 2's vocabulary is extended.

Two findings are carried forward as **UNVERIFIED**: the CloudFront
index-document rewrite (outside this repository) and the `/` root redirect
(needs one command the spec author could not run). Both have owners and written
verification steps.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict), Vue 3.5 SFCs, Node ≥ 22.12
**Primary Dependencies**: Nuxt 4.5 (`srcDir: app/`), `@nuxtjs/i18n` 10.6,
Tailwind v4.3 via `@tailwindcss/vite`, `vue-router` 5.3. **No dependency is
added by this feature.**
**Storage**: none. No persistence, no server state, no network call.
**Testing**: Vitest 4 via `defineVitestConfig` (`@nuxt/test-utils` 4.2), one
global `happy-dom` environment (`rules.md` § R16); Vue Test Utils 2.5;
Storybook 10 (`@storybook/vue3-vite`) as the visual review layer
**Target Platform**: static files on S3 + CloudFront. `ssr: true`,
`nitro.preset: 'static'`, artefact is `.output/public`
**Project Type**: static marketing site — feature-based Nuxt app
**Performance Goals**: no runtime JavaScript added to a page beyond the mobile
menu's composable and the toggle's click handler. Every nav and footer
destination works with scripting unavailable (FR-032)
**Constraints**: no server runtime of any kind (Article IV); two design frames
only, 390px and 1440px (`rules.md` § R5); every measurement traceable to
`design-extract.md` or flagged UNVERIFIED
**Scale/Scope**: 5 components, 3 composables (one pure), 1 layout, 2 pages,
~24 destinations, 4 routes, 2 locales, 35 token additions, 1 new asset

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

Gates derived from `.specify/memory/constitution.md` v2.0.0. This is the first
feature to build an actual feature module, so Articles I–III bind hardest and
have never been exercised in this repository before.

### Phase -1 Gates

| # | Gate | Article | Pre-Phase 0 | Post-Phase 1 |
|---|---|---|---|---|
| G1 | Module is `app/features/shell/{ui,logic,data}` with an `index.ts` barrel | I | PASS (planned) | **PASS** — `quickstart.md` tree; barrel in `contracts/components.md` |
| G2 | `data/` imports nothing from `logic/` or `ui/`; `logic/` never imports `ui/` | II · NON-NEGOTIABLE | PASS (planned) | **PASS** — `data/` holds i18n *keys* and destination descriptors, never copy or resolved paths (`data-model.md` § 1) |
| G3 | No file outside the module imports past the barrel; the module reaches no other feature's internals | III · NON-NEGOTIABLE | PASS | **PASS** — layout imports the barrel only; `MobileMenu`, `FooterColumn`, `LanguageToggle` are unexported |
| G4 | No `server/api/`, no runtime server dependency, no request-time compute | IV · NON-NEGOTIABLE | PASS | **PASS** — verified: `pnpm generate` emits static files only (`research.md` § R1a) |
| G5 | Vue SFCs with `<script setup lang="ts">`; `ui/` presentational; complex logic in `logic/`; components < 200 lines | V | PASS (planned) | **PASS** — FR-008/FR-009; menu state, lock and Escape are `useMobileMenu`, not inline |
| G6 | Every route resolves in both locales; every key in both files; switch via the route map, not string manipulation; no hardcoded user-facing strings | VI · NON-NEGOTIABLE | PASS (planned) | **PASS** — `i18n.pages` + `useSwitchLocalePath` (`research.md` § R2); FR-048/FR-050/FR-051 |
| G7 | No colour or size literal; no breakpoint for *sizing*; fluid tokens carry desktop↔mobile | VII | PASS (planned) | **PASS with a stated distinction** — see below |
| G8 | No generic names; small functions; no dead code; no over-engineering; no speculative dependency | VIII | PASS | **PASS** — VueUse rejected with reasoning (`research.md` § R5); one dead class deleted (§ R7) |
| G9 | TypeScript strict, no `any`, no `@ts-ignore`, Biome only | IX | PASS | **PASS** — `ResolvedShellItem.href?` makes the broken-link state unrepresentable rather than guarded at runtime |
| G10 | Unit tests for route mapping and the composable; component tests for `ui/`; a story per component; names read `should <expected> when <condition>` | X | PASS (planned) | **PASS** — FR-054, FR-052; the pure `resolveLocaleDestination` is what makes the unit tests test *us* |
| G11 | No credential, token or key introduced | XI · NON-NEGOTIABLE | PASS | **PASS** — only public profile URLs, a public WhatsApp number already in `overview.md`, and a public mailbox |
| G12 | Aliases used for all cross-directory imports and mirrored in `.storybook/main.ts` | XII | PASS | **PASS** — `@/features` and `@/layouts` already exist in both places; **no new alias**, verified by inspection |

**G7 — the distinction review must apply.** Article VII forbids reaching for a
breakpoint to change a font size, padding, radius or blur. It does **not**
forbid a breakpoint that changes *structure*, and the shell needs two:
the nav swapping between links and a hamburger, and the footer's four columns
reflowing to two rows of two. No `clamp()` can express "these children change
order and count". Spec FR-047 states this and FR-058 fixes the breakpoint at
`lg` (1024px). **Every `lg:` in this feature must change layout only.** A `lg:`
carrying a font size or a padding is a real violation and should be caught in
review.

### Post-design re-check

All twelve gates pass. **No entry in Complexity Tracking** — the design
introduces no violation requiring justification.

Two design decisions were *considered* and rejected specifically because they
would have created one:

- **A second route map inside `data/`** would have satisfied FR-018's letter
  while duplicating the router's table — precisely the drift Article VI names.
  Rejected in `research.md` § R2.
- **Adding VueUse** for `useScrollLock` and `onKeyStroke` would have been a new
  supply-chain surface for roughly forty lines of code. Rejected against
  Article VIII in `research.md` § R5, with the note that three or four
  consumers would change the arithmetic and justify reopening it.

One risk is recorded rather than resolved: `<dialog>` + `showModal()` would
give focus containment and Escape for free, but top-layer promotion makes
`backdrop-filter` unreliable, and FR-023 makes the blur a hard requirement.
Reopening that is only legitimate by rendering both and comparing the blur —
not by reasoning about it.

## Project Structure

### Documentation (this feature)

```text
specs/003-site-shell/
├── plan.md                  # This file
├── spec.md                  # Requirements, 3 clarifications, 16 assumptions
├── research.md              # Phase 0 — 7 unknowns resolved, 2 flagged UNVERIFIED
├── data-model.md            # Phase 1 — content model + 35 token additions
├── quickstart.md            # Phase 1 — orientation for the implementer
├── contracts/
│   └── components.md        # Phase 1 — the barrel and every prop surface
├── checklists/
│   └── requirements.md      # Spec quality validation
└── tasks.md                 # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
app/
├── features/
│   └── shell/                        # NEW — the repository's first feature module
│       ├── data/                     # types + constants; imports nothing sideways
│       │   ├── types.ts
│       │   ├── navigation.ts
│       │   ├── footerColumns.ts
│       │   └── socialProfiles.ts
│       ├── logic/
│       │   ├── resolveLocaleDestination.ts       # pure — the unit-test target
│       │   ├── resolveLocaleDestination.test.ts
│       │   ├── useShellNavigation.ts             # the only Nuxt-runtime seam
│       │   ├── useMobileMenu.ts
│       │   └── useMobileMenu.test.ts
│       ├── ui/
│       │   ├── SiteNav.vue           + .test.ts + .stories.ts
│       │   ├── MobileMenu.vue        + .test.ts + .stories.ts
│       │   ├── LanguageToggle.vue    + .test.ts
│       │   ├── SiteFooter.vue        + .test.ts + .stories.ts
│       │   └── FooterColumn.vue      + .test.ts
│       └── index.ts                  # the module's only public API
├── layouts/
│   └── default.vue                   # NEW — SiteNav + <slot /> + SiteFooter
├── pages/
│   ├── index.vue                     # MODIFIED — reduced to page content (FR-007)
│   └── nosotros.vue                  # NEW — /es/nosotros and /en/about
├── assets/
│   ├── css/global.css                # MODIFIED — 35 token additions, 0 edits
│   └── icons/
│       ├── x.svg                     # NEW — lucide close glyph
│       └── README.md                 # NEW — provenance, per feature 1's pattern
└── shared/ui/                        # UNTOUCHED — signatures frozen by feature 2

i18n/locales/{es,en}.json             # MODIFIED — all shell copy
nuxt.config.ts                        # MODIFIED — i18n.pages, rootRedirect, prerender
vitest.config.ts                      # MODIFIED — include app/features/**/*.test.ts
.storybook/preview.ts                 # MODIFIED — global NuxtLink stub
.storybook/main.ts                    # VERIFY ONLY — no new alias expected
```

**Structure Decision**: feature-based with the three internal layers, exactly as
Article I prescribes. This feature *establishes* the pattern the `landing`,
`about` and `forms` modules will follow, which is why the layering is applied
strictly rather than pragmatically for a module this size.

`app/layouts/` and `app/pages/` stay structural: the layout composes the
barrel, the pages are thin. Neither holds feature logic.

`app/shared/` gains nothing. The shell's data and logic serve one feature, and
Article III prefers a small duplication later over a premature shared
abstraction now.

## Phase 2 sequencing (for `/speckit.tasks`)

Two hard prerequisites:

1. **Tokens before components.** All 35 additions land first, or the first
   component reaches for a literal.
2. **The About route before the Nav**, or every nav link 404s during
   development.

Then the natural direction `data/ → logic/ → ui/ → layout → stories`. Tests are
written with their subject, not batched at the end — the pure resolver and the
menu composable especially, since both encode a failure mode (an empty
destination; a lock outliving its panel) that is easier to assert than to spot.

The root-redirect experiment (`research.md` § R1d) is its own task with its
command written out, because it is the one item that can be closed by mistake
through reading rather than running.

## Complexity Tracking

*No Constitution Check violations. This table is intentionally empty.*
