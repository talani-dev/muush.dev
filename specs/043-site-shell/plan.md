# Implementation Plan: Muush 1.0 site shell

**Branch**: `feat/v2-site-shell` (from `muush-v2`, merges back into `muush-v2`) | **Date**: 2026-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/043-site-shell/spec.md`

## Summary

Build the v2 header (desktop floating nav, mobile bar), full-screen mobile
menu and footer in `app/features/shell/ui/`, with v2 brand marks
(`Isotipo`, `Wordmark`, `Lockup`, `SocialIcon`) in `app/shared/ui/`. Move
the v1 shell UI into `app/features/shell/ui/legacy/`. Rewrite the shell data
for the v2 navigation and footer, define the section anchors once in
`app/shared/data/sectionAnchors.ts`, and add the scroll-spy (confirmed by
Roberto 2026-11-01). Reuse
the v1 logic that already encodes the behaviour (hide-on-scroll, scroll lock,
language toggle and route-map resolution) and extend it where the spec asks
(focus trap, focus reveal, close reason, active section). Retire the dotted
paper, spotlight and glows from the layout, recolour the favicon (dot and stroke), and
close the five review-42b follow-ups. Details: [research.md](./research.md),
[data-model.md](./data-model.md),
[contracts/components.md](./contracts/components.md),
[quickstart.md](./quickstart.md).

## Technical Context

**Language/Version**: TypeScript (strict) · Vue 3.5 `<script setup lang="ts">` · Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: Tailwind CSS 4 (v2 tokens from feature 42), `@nuxtjs/i18n` 10, `@nuxt/fonts`. **No new dependency.**
**Storage**: N/A (one existing first-party cookie, feature 33, unchanged)
**Testing**: Vitest + Vue Test Utils + happy-dom; Storybook 10 for visual review; build-output tests in `tests/`
**Target Platform**: Static site (`nitro.preset: 'static'`) on S3 + CloudFront; evergreen browsers
**Project Type**: Static web site (single Nuxt project)
**Performance Goals**: Header scroll handling rAF-coalesced and passive; one IntersectionObserver for scroll-spy, home only; menu shader mounted only while open; no layout shift from the header (fixed)
**Constraints**: Articles IV, VI, VII; components < 200 lines; 390/1440 anchors; features 33/37/39 behaviour untouched
**Scale/Scope**: ~12 new components (8 shell, 4 shared), 2 new composables, ~4 edited composables, 3 data modules rewritten + 1 shared new, ~45 i18n keys per locale, ~15 test files new or edited, ~8 story files

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Phase -1: Pre-Implementation Gates

#### I. Feature-Based + Capas architecture
- [x] Shell UI, logic and data stay in `app/features/shell/{ui,logic,data}`; brand marks and section anchors are cross-cutting and go to `app/shared/{ui,data}`; the layout only composes.
- [x] v1 shell UI is quarantined in `app/features/shell/ui/legacy/` (research R1), mirroring `app/shared/ui/legacy/`.

#### II. Dependency direction (NON-NEGOTIABLE)
- [x] `ui/` → `logic/`, `data/`; `logic/` → `data/`; `data/` imports only types, shared data and assets. `data/types.ts` re-exports `SocialNetwork` from a shared UI module as a type-only import (existing precedent, now pointing at the v2 file).

#### III. Feature isolation (NON-NEGOTIABLE)
- [x] Landing and about read `SECTION_ANCHORS` from `@/shared/data/sectionAnchors`, never from the shell. The layout uses only the shell barrel.

#### IV. Static-site purity (NON-NEGOTIABLE)
- [x] No server route, no runtime dependency. Scroll-spy, focus trap and hide-on-scroll run in the browser after mount; the prerendered HTML is the no-JS state.

#### V. Component discipline
- [x] `<script setup lang="ts">` only; every component planned < 200 lines (largest: `SiteHeader` ≈ 150, `MobileMenu` ≈ 140, `SiteFooter` split into `FooterColumns` and `MobileFooter`).
- [x] Scroll, focus and observer logic live in composables; components only bind.
- [x] Interactivity is opt-in: the menu button renders only with scripting; the footer is static.

#### VI. i18n parity (NON-NEGOTIABLE)
- [x] Every string in both locale files; parity test stays green; removed v1 keys removed in both.
- [x] Language toggle keeps route-map resolution (`switchLocalePath` + home fallback), never a string prefix swap; its behaviour tests are kept.
- [x] Links resolve by route name; the anchor destination type only accepts declared section ids.

#### VII. Design tokens discipline
- [x] All values through v2 tokens consumed as utilities; new named tokens for shell metrics (research R15); zero hex/rgb/px in new or rewritten files (extend `tests/token-literals.test.ts` to scan them).
- [x] No v1 token in new code; no version marker in any new name.
- [x] Breakpoint `lg` only for the two layout swaps the design draws (mobile bar ↔ desktop nav; mobile ↔ desktop footer); size differences inside one layout use `clamp()`.
- [x] **Poppins weights.** The wordmark uses Poppins 600 ("muush", ".") and 400 ("dev"), and Poppins 400 joins the fonts: confirmed by Roberto 2026-11-01 (Clarifications Q3), and Constitution 2.1.2 Article VII now states these weights. Resolved; no Complexity Tracking entry.

#### VIII. Clean code
- [x] Named constants for 80 px reveal zone (existing), observer margins and the close reasons; no speculative abstraction (Preguntas is added by 46, not pre-wired).
- [x] Dead code: v1 shell UI is quarantined for 47 to delete (research R1); `useNavCtaReveal` loses its shell reader and is flagged for deletion when 44 removes its last caller.

#### IX. TypeScript strict + Biome
- [x] No `any`; discriminated unions for destinations and close reasons.

#### X. Testing discipline
- [x] Unit tests: `sectionAnchors`, navigation/footer data, `useActiveSection`, `useFocusTrap`, resolver `current`, `useMobileMenu` close reason and instant restore, `useNavScrollReveal.reveal`, `useShaderCanvas` rejected import. Component tests and stories for every new component (shell and shared). Names follow `should … when …`.
- [x] Spotlight/dot-grid layout tests rewritten to assert absence, citing the supersession of feature 42's acceptance.

#### XI. Configuration & credential hygiene (NON-NEGOTIABLE)
- [x] No environment variable or secret. Public URLs (WhatsApp, booking, social) are reused from existing data.

#### XII. Absolute imports via alias
- [x] `@/features/…`, `@/shared/…`, `@/assets/…`; relative imports only within the same directory. Files moved into `legacy/` have their relative imports rewritten to aliases.

**Result: PASS** (the Article VII wording deviation is resolved by Constitution 2.1.2, amended 2026-11-01).

## Project Structure

### Documentation (this feature)

```text
specs/043-site-shell/
├── spec.md
├── plan.md                  # this file
├── research.md              # R1–R15
├── data-model.md
├── quickstart.md
├── contracts/components.md
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source code (repository root)

```text
app/
├── assets/css/global.css            # EDIT: shell tokens (R15), header offset, scroll-padding,
│                                    #   smooth scroll under no-preference, layer table comments (adv. 3)
├── layouts/default.vue              # EDIT: SiteHeader + MobileMenu + SiteFooter; drop DotGrid/spotlight
├── shared/
│   ├── data/sectionAnchors.ts       # NEW (+ .test.ts)
│   ├── data/backgroundPresets.ts    # EDIT: optional poster, `mobileMenu` preset (+ test)
│   ├── logic/useShaderCanvas.ts     # EDIT: try/catch import (+ test)
│   └── ui/
│       ├── Isotipo.vue, Wordmark.vue, Lockup.vue, SocialIcon.vue   # NEW (+ stories, tests)
│       ├── ShaderBackground.vue     # EDIT: poster optional (+ test)
│       ├── GlassButton.vue          # EDIT: drop `size`
│       └── legacy/SectionBackdrop.vue  # EDIT: `hidden` root (glows retired)
├── features/shell/
│   ├── index.ts                     # EDIT: v2 exports; NotFoundContent from legacy path
│   ├── data/
│   │   ├── types.ts                 # EDIT: anchor typed by SectionAnchor; legacyHash; current kind; ContactChannel
│   │   ├── navigation.ts            # REWRITE (+ test)
│   │   ├── footerColumns.ts         # REWRITE (+ test)
│   │   ├── contactChannels.ts       # NEW (mobile contact rows, mobile links, legal) (+ test)
│   │   └── notFound.ts              # EDIT: local `#proposito` via legacyHash
│   ├── logic/
│   │   ├── useShellNavigation.ts    # EDIT: new models, no CTA reveal, active section
│   │   ├── useShellItemResolver.ts  # EDIT: activeAnchor, current kind, legacyHash (+ test)
│   │   ├── useMobileMenu.ts         # EDIT: close reason, instant restore (+ test)
│   │   ├── useNavScrollReveal.ts    # EDIT: reveal() (+ test)
│   │   ├── useFocusTrap.ts          # NEW (+ test)
│   │   └── useActiveSection.ts      # NEW (+ test)
│   └── ui/
│       ├── SiteHeader.vue, NavLinkBar.vue, MenuButton.vue, MobileMenu.vue,
│       │   SiteFooter.vue, FooterColumns.vue, MobileFooter.vue, SocialLinks.vue   # NEW (+ stories, tests)
│       ├── LanguageToggle.vue       # EDIT: v2 styling, `variant` (+ story → Shell/, test)
│       └── legacy/                  # MOVED: SiteNav, MobileMenu, SiteFooter, FooterColumn,
│                                    #   NotFoundContent, NotFoundRings (+ stories, tests)
├── features/landing/ (ContactSection.vue, ServicesSection.vue, data/heroContent.ts + tests)  # EDIT: shared anchor ids
└── features/about/ (WorkWithMuushSection.vue + test)   # EDIT: shared anchor id
i18n/locales/{es,en}.json            # EDIT
nuxt.config.ts                       # EDIT: Poppins [400, 500, 600]
public/favicon.svg                   # EDIT: dot #E5352F, stroke #050505 / #F4F4F2 (Q4)
tests/
├── token-literals.test.ts           # EDIT: scan new shell + shared files
├── static-output.test.ts            # EDIT: no dot grid/spotlight; Poppins 400; header present
├── spotlight-red-dots-tokens.test.ts# EDIT or narrowed: spotlight no longer mounted (supersession note)
└── favicon.test.ts                  # NEW (or added to static-output)
```

**Structure decision.** Shell feature for the chrome; shared for marks,
anchors and the shader preset; legacy quarantine for v1 shell UI (R1).

## Implementation notes per area

1. **Tokens first** (R15): add the shell tokens and header offset; then
   `scroll-padding-top` and the smooth-scroll media query (R5).
2. **Shared** (R2, R3, R7, R14): anchors → brand marks → preset/`ShaderBackground`
   → `useShaderCanvas` → `GlassButton`.
3. **Quarantine** (R1): `git mv` the six v1 shell components with stories and
   tests into `ui/legacy/`; rewrite their relative imports to aliases; keep
   them green.
4. **Data and logic**: types → anchors in navigation/footer/contact data →
   resolver → `useActiveSection`, `useFocusTrap`, `useMobileMenu`,
   `useNavScrollReveal` → `useShellNavigation`.
5. **UI**: marks → `LanguageToggle` restyle → `MenuButton`, `NavLinkBar`,
   `SocialLinks` → `SiteHeader`, `MobileMenu` → `FooterColumns`,
   `MobileFooter`, `SiteFooter`.
6. **Layout and retirements** (R10): compose, drop dots and spotlight, hide
   glows, update tests with the supersession note.
7. **v1 section ids** (R3), **fonts** (R11), **favicon** (R12), **copy** (R13).
8. **Review** (R14.5): widths and forced colours, recorded.

## Risks

| Risk | Mitigation |
|---|---|
| Regressing features 33/37/39 while restyling the toggle | Behaviour code untouched; all behavioural tests kept; quickstart § 4 checks each case on the generated site |
| Fixed header covers the first line of v1 sections on phones | Stated in the spec ("What changes visually"); 44/46 replace those sections |
| Smooth `html` scrolling animates the scroll-lock restore | `behavior: 'instant'` in `releaseScroll` (R5), unit-tested |
| Scroll-spy flicker at section boundaries | Reading-band `rootMargin`; null at top; rule (confirmed by Roberto 2026-11-01) isolated in one composable |
| Hidden duplicate footer markup (desktop + mobile) | `display: none` on the inactive copy; tests assert one visible landmark per breakpoint class |
| Focus trap and `inert` interplay | Trap only inside the dialog; outside content `inert`; tested with happy-dom key events |
| Isotipo stroke or wordmark weights later changed by Roberto | Values are in one component each (Q2, Q3, both confirmed by Roberto 2026-11-01) |

## Post-design Constitution re-check

Re-evaluated after research, data model and contracts: **PASS**. The one
Complexity Tracking entry is resolved (below).

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected because |
|---|---|---|
| ~~Article VII says Poppins **500** for logo and wordmark; the wordmark ships Poppins 600 ("muush", ".") and 400 ("dev"), and Poppins 400 is added to the font set~~ **RESOLVED** | Confirmed by Roberto 2026-11-01 (Clarifications Q3); Constitution 2.1.2 (PATCH, amended 2026-11-01) now says "the wordmark as drawn in the design ("muush." 600, "dev" 400)" | No longer a violation |

## Agent context

`CLAUDE.md` has no `<!-- SPECKIT START -->` block and the spec author may not
edit it, so it was not touched.

## Amendment 2026-11-01 — Home link added by Roberto 2026-11-01

Reopened scope (spec "Amendment 2026-11-01", FR-052…FR-056):

- **Data**: a new destination kind `{ kind: 'top'; name }` (the top of a
  route's page). `NAV_HOME` (`shell.nav.homeLink`) leads `NAV_ITEMS`, and so
  `MENU_ITEMS`; `FOOTER_DESTINATIONS.home` + `shell.footer.nav.home` lead
  NAVEGACIÓN and `MOBILE_FOOTER_LINKS`.
- **Logic**: `useActiveSection` adds `atTop`, from a second
  IntersectionObserver whose root runs from the band top far downwards (a
  jump from the bottom of the page to the top never crosses the band).
  `createShellItemResolver` takes `atTop` and marks a `top` item `page` on
  its route only while `atTop`; `useShellNavigation` gates it with `isHome`
  so the 404 never lights it. The resolver flags `top` items
  `scrollsToTop`; `logic/scrollToTopIfCurrent.ts` scrolls to the top when
  such a link is clicked on the page it points at.
- **UI**: no new component. `NavLinkBar`, `MobileMenu` and `ShellItemLink`
  call `scrollToTopIfCurrent` for `scrollsToTop` items; styles unchanged.
- **Shaders**: `app/shared/utils/shaderUniformDefaults.ts`
  (`readShaderDefaults`, the port of `MuushGradient.defaults()`);
  `withShaderDefaults(uniforms, shaderDefaults)` merges shader defaults →
  engine base → preset; `useShaderCanvas` reads the defaults once from the
  loaded source.
- **Constitution**: unchanged result (PASS). No server code, no new
  dependency, no token, both locales, components under 200 lines.

## Amendment 2026-11-01 — Reopen 2: static grain + isotipo-only header logo, Roberto 2026-11-01

Reopened scope (spec "Amendment 2026-11-01 — Static grain" FR-057…FR-058,
and "Amendment 2026-11-01 — Header logo isotipo-only" FR-059):

- **Shaders (FR-057, FR-058)**: in `app/assets/shaders/liston.glsl` and
  `acanalado.glsl`, the grain hash in `finish()` is `hash(gl_FragCoord.xy)`,
  no longer seeded by `u_time`, so the grain is static. A `//` comment above
  `finish()` records the deliberate divergence from the handoff shaders;
  every other line matches them. `u_grain` keeps its engine base of 0.07 (0.03 since reopen 3).
  `backgroundPresets.test.ts` pins that the grain hash does not reference
  `u_time`.
- **UI (FR-059)**: `SiteHeader` renders `<Lockup form="isotipo" />` at every
  width, with the link's accessible name from the existing `shell.nav.home`.
  The desktop and mobile footers keep the full lockup. No new component, no
  new i18n key.
- **Constitution**: unchanged result (PASS). No server code, no new
  dependency, no token, both locales, components under 200 lines.

## Amendment 2026-11-01 — Reopen 3: Grain 0.03, Roberto 2026-11-01

Reopened scope (spec "Amendment 2026-11-01 — Grain 0.03" FR-060): the engine
base `SHADER_DEFAULTS.u_grain` in `app/shared/utils/shaderFrame.ts` goes from
0.07 to 0.03; the grain stays static. The `.glsl` files are untouched (their
`@default` stays 0.07, overridden by the engine base). Tests pinning the
engine value (`shaderFrame.test.ts`, `useShaderCanvas.test.ts`, the
engine-base case in `shaderUniformDefaults.test.ts`) follow; tests pinning the
`.glsl` `@default` do not change.

- **Constitution**: unchanged result (PASS). No server code, no new
  dependency, no token.
