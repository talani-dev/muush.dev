# Implementation Plan: Services float and custom cursor

**Branch**: `feat/services-float-custom-cursor` (spec folder `034-services-float-custom-cursor`) | **Date**: 2026-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/034-services-float-custom-cursor/spec.md`

## Summary

**Part A.** A shared CSS clock drives the float: a registered `<angle>`
property (`--services-float-phase`) animates 0deg → 360deg, linearly, once
per canvas. Every moving value is a pure CSS function of it:
each node (desktop `.node`, mobile `.item`) is offset by
`A · sin(phase + i · step)` design pixels; each desktop connector applies
`translate(0, b) skewY(atan(s))`, the exact vertical shear that moves its two
ends by the two adjacent nodes' offsets (research R1). Nodes and lines read
one value on one thread, so they cannot separate in any frame; there is no
script. The desktop SVG is resized to the 1440×910 frame in rem so its user
space equals the nodes' space at every width (fixes the pre-existing
mismatch, OA-3). The mobile timeline gets the same node offset in one
fenced, self-contained block, its own test file and its own commit, so the
D-3 trial can be reverted in isolation; its spine stays static because the
rows move parallel to it (research R4).

**Part B.** The cleaned asset goes to `public/cursor/you.svg` (only the
white background `<rect>` removed; root `width`/`height` 64 so it renders at
64×64, amendment A1 of 2026-10-14). Two tokens hold the cursor values
(`--cursor-brand`, `--cursor-brand-pointer`, hotspot `1 9`). Unlayered rules
in `global.css`, inside `@media (forced-colors: none)`, apply the brand
cursor to the document, to user-agent-styled controls and to every
pointer-state element (links, buttons, `.cursor-pointer`), and restore
`cursor: text` on text-entry fields (research R9).

**Part C (amendment A2, 2026-10-14).** `CursorSpotlight.vue` keeps its
four-element structure and its registration, but its beam paints nothing:
the two glow gradients and the five tokens only they used are deleted. The
lit dot sheet becomes red: `--dot-paper-lit-color: var(--red-400)`, full
strength at the pointer, faded by the existing linear mask. The size comes
from one new token, `--spotlight-lit-radius: 7.5rem` (≈120 px), replacing
`--spotlight-outer-size`. The form cards keep their glass. Details in
§ *Amendment A2* below. **A2 revision 1 (2026-10-15)**: `SiteFooter.vue`
keeps (restores) `bg-ink-500`, so the footer covers the dots and the lit
dots as before A2; see § *A2 revision 1*. *(Superseded A2 text:
"`SiteFooter.vue` drops `bg-ink-500`, so the page's dots and lit dots show
under it".)*

## Technical Context

**Language/Version**: TypeScript (strict), Vue 3 `<script setup lang="ts">`, CSS (Tailwind v4 + hand-written)
**Primary Dependencies**: Nuxt 4 (static preset), Tailwind v4, Biome, Vitest + Vue Test Utils (happy-dom), Storybook 10. **No new dependency.**
**Storage**: N/A
**Testing**: Vitest (unit, component, static output via `tests/global-setup.ts` rebuild); manual browser matrix in `quickstart.md`
**Target Platform**: static files on S3 + CloudFront; current Chrome, Safari, Firefox (Edge follows Chrome)
**Project Type**: static website
**Performance Goals**: float at display refresh rate with no layout work (SC-004)
**Constraints**: no JS for the float; no server; no third-party request; reduced motion → static; components under 200 lines
**Scale/Scope**: 1 new asset, ~1 new small component (`ServicesConnectors.vue`, extracted to keep `ServicesConstellation.vue` under 200 lines), 2 components edited, 1 data helper, ~6 tokens + 1 `@property` + 1 `@keyframes` + cursor rules in `global.css`, 1 new component test file for the mobile trial, static-output assertions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design: unchanged.*

### Phase -1: Pre-Implementation Gates

#### I · Feature-Based architecture

- [x] Does the work stay in its layers? → **Yes.** Float CSS in
      `app/features/landing/ui/` (Constellation, new `ServicesConnectors`,
      Timeline); the pure helper in `app/features/landing/data/`; document-
      level tokens, `@property`, `@keyframes` and the cursor rules in
      `app/assets/css/global.css`; the asset in `public/`.
- [x] Nothing dumped into `app/shared/`? → **Yes.** The cursor is page-level
      CSS, not a component.

#### II · Dependency Direction (NON-NEGOTIABLE)

- [x] `data/servicesContent.ts` still imports nothing? → **Yes**, the new
      helper is pure.
- [x] `ui/` imports only `data/`, `logic/`, `@/shared/ui`? → **Yes.**

#### III · Feature Isolation (NON-NEGOTIABLE)

- [x] No file outside `landing` imports its internals; `shell` and `forms`
      are not edited? → **Yes.** The cursor reaches their controls through
      global selectors (`:any-link`, `button`, `.cursor-pointer`, inputs), not
      through edits to their components.

#### IV · Static-Site Purity (NON-NEGOTIABLE)

- [x] No `server/api/`, no runtime dependency, no request-time compute?
      → **Yes.**
- [x] Is everything in `.output/public`? → **Yes.** The asset is a static
      file; the float is CSS; the prerendered HTML gains only inline custom
      properties on four `<line>`s and `--i` on five desktop nodes.
- [x] No third-party request? → **Yes**, the cursor is same-origin.

#### V · Component Discipline

- [x] `<script setup lang="ts">` only? → **Yes.**
- [x] No client state added for decoration? → **Yes.** Option (D), the
      `requestAnimationFrame` loop, was rejected partly for this reason
      (research R1).
- [x] Every component under 200 lines? → **Yes, by extraction.**
      `ServicesConstellation.vue` is already **215** lines (CONFIRMED,
      pre-existing). The connectors SVG and its shear CSS move to
      `ServicesConnectors.vue`, bringing both under 200. `ServicesTimeline.vue`
      is 171; the D-3 block must keep it ≤ 200 (terse fence comment; the
      rationale lives in research R4).

#### VI · i18n Parity (NON-NEGOTIABLE)

- [x] Locale files untouched; no route added? → **Yes.**
- [x] Same behaviour in `/es` and `/en`? → **Yes.**
- [x] Is the "You" label a hardcoded user-facing string? → **No, recorded.**
      It is outlined paths inside a decorative cursor image, not text in a
      component; Roberto decided it is "You" in both locales (D-2). No
      `:lang()` rule exists.

#### VII · Design Tokens Discipline

- [x] No literal colours or spacings in components? → **Yes.** Amplitude,
      period, phase step and the design-pixel unit are tokens; line
      geometry comes from `connectorEndpoints`.
- [x] Hand-written CSS uses ramp/`:root` names, not `--color-*` theme
      names (§ R18)? → **Yes.**
- [x] Colour literal in the asset? → **Justified, see Complexity Tracking.**
      A cursor image cannot read CSS variables; a test pins `#CF3147` to
      `--red-400`.

#### VIII · Clean Code Discipline

- [x] No magic numbers? → **Yes**: `1 9` hotspot (A1) is a token; `0.0625rem` is
      the `--services-frame-px` token.
- [x] DRY? → **One justified duplication**, see Complexity Tracking: the node
      offset formula appears in the desktop and the mobile block.
- [x] No speculative code? → **Yes.** No PNG fallback, no JS loop, no
      `will-change`, no `content-visibility` unless measurements ask for them.

#### IX · TypeScript Strict + Biome

- [x] Strict types for the helper? → **Yes.**
- [x] Biome accepts the CSS? → **To verify early (T005)**: `sin()`, `atan()`,
      `skewY()`, `vector-effect`, `transform-box`, `@property` and
      `forced-colors` must pass `pnpm check`. If a rule rejects a valid
      function, the fix is a narrowly scoped override with a comment, never
      a rewrite of the mechanism.

#### X · Testing Discipline

- [x] Test names `should … when …`? → **Yes.**
- [x] Pure helper unit-tested; components structurally tested; deployed
      artefact asserted? → **Yes** (see Testing below).
- [x] Stories: no new `app/shared/ui` component, so no new story is required;
      `ServicesSection.stories.ts` already renders the desktop composition and
      will show the float.
- [x] No E2E? → **Yes**, the rest is the manual matrix.

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] No env vars, no credentials, nothing in `runtimeConfig`? → **Yes.**

#### XII · Absolute Imports via Alias

- [x] All new imports use `@/features/…` / `@/shared/…`, or same-directory
      relatives? → **Yes.**

## Testing

| Layer | File | Asserts |
|---|---|---|
| Unit | `app/features/landing/data/servicesContent.test.ts` | `connectorFloatVars` returns `--x1/--x2` from `connectorEndpoints` output and `--i-a/--i-b` = index, index + 1; never literal coordinates |
| Component | `app/features/landing/ui/ServicesConnectors.test.ts` (new) | four `<line>`s with the inline vars; SVG sized by frame tokens, not `size-full`; style contains `sin(var(--services-float-phase)`, `skewY(atan(`, `non-scaling-stroke`, `transform-box: view-box`, `transform-origin: 0 0` |
| Component | `app/features/landing/ui/ServicesConstellation.test.ts` (updated) | nodes carry `--i`; `.node` style offsets by the shared formula; canvas runs `services-float`; reduced-motion override; it renders `ServicesConnectors` with `connectorEndpoints(SERVICE_NODE_CENTRES)` |
| Component | `app/features/landing/ui/ServicesTimeline.float.test.ts` (new, D-3 only) | fenced block present; `.item` offset formula; canvas animation; reduced-motion override; spine has no transform |
| Tokens | `tests/services-float-tokens.test.ts` (new) | `@property --services-float-phase` `<angle>` inheriting; keyframes 0deg → 360deg; amplitude ∈ [6, 8]; period ∈ [5 s, 7 s]; reduced-motion sets amplitude 0 |
| Static output | `tests/brand-cursor.test.ts` (new) | `.output/public/cursor/you.svg` exists; root 64×64 over `viewBox="0 0 32 32"` (A1); no 32×32 rect; pill rect and two paths kept; red equals `--red-400`; emitted CSS references `/cursor/you.svg` with `1 9`, `auto` and `pointer` fallbacks, a `cursor:text` rule, the `forced-colors` guard; emitted CSS still contains `sin(` and `--services-float-phase` |
| Manual | `quickstart.md` | smoothness, readability, glue at real widths, performance, cursor matrix, Roberto's mobile review |

Existing suites must stay green unchanged except
`ServicesConstellation.test.ts`, whose SVG assertions move to the new
connectors test.

## Project Structure

### Documentation (this feature)

```text
specs/034-services-float-custom-cursor/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

No `contracts/`: the feature exposes no interface to other systems.

### Source Code (repository root)

```text
public/
└── cursor/you.svg                              # new, cleaned asset (64×64 render, A1)
app/assets/css/global.css                       # float tokens, @property, @keyframes, cursor tokens and rules
app/features/landing/
├── data/servicesContent.ts                     # + connectorFloatVars (pure)
├── data/servicesContent.test.ts                # + helper tests
└── ui/
    ├── ServicesConstellation.vue               # node --i + offset, canvas clock, uses ServicesConnectors
    ├── ServicesConstellation.test.ts           # updated
    ├── ServicesConnectors.vue                  # new: SVG lines + shear CSS (extracted)
    ├── ServicesConnectors.test.ts              # new
    ├── ServicesTimeline.vue                    # + fenced D-3 block (own commit)
    └── ServicesTimeline.float.test.ts          # new (own commit)
tests/
├── services-float-tokens.test.ts               # new
└── brand-cursor.test.ts                        # new
```

**Structure Decision**: everything stays in the `landing` feature plus the
document-level stylesheet and `public/`. `ServicesConnectors.vue` is a
sub-component of the constellation (feature-internal, not exported from the
barrel), extracted only to respect the 200-line rule.

## Implementation notes the tasks rely on

- **Node offset** (desktop `.node`, mobile `.item`):
  `--float-dy: calc(var(--services-float-amplitude) * sin(var(--services-float-phase) + var(--i) * var(--services-float-phase-step)));`
  `translate: 0 calc(var(--float-dy) * var(--services-frame-px));`
  Desktop `.radar` already uses Tailwind's `-translate-*` (the `translate`
  property) on a **child**, so putting `translate` on `.node` does not
  collide.
- **Line shear** (each `<line>`): `--dy-a`, `--dy-b` as above with `--i-a`,
  `--i-b`; `--slope: calc((var(--dy-b) - var(--dy-a)) / (var(--x2) - var(--x1)))`;
  `--shift: calc(var(--dy-a) - var(--slope) * var(--x1))`;
  `transform: translate(0, calc(var(--shift) * 1px)) skewY(atan(var(--slope)))`;
  `transform-box: view-box; transform-origin: 0 0; vector-effect: non-scaling-stroke`.
- **SVG frame**: `width: var(--services-canvas-w); height: var(--services-canvas-h); overflow: visible`, replacing `size-full`.
- **Canvas clock**: `animation: services-float var(--duration-services-float) linear infinite;`
  and `@media (prefers-reduced-motion: reduce) { animation: none; }` on each canvas.
- **Cursor rules** (unlayered, `@media (forced-colors: none)`), in this
  order: `html`; `:where(button, select, summary, label, input:not(<text types>))`
  → brand; `:where(:any-link, button:enabled, [role="button"], .cursor-pointer)`
  → brand pointer; `:where(input:not([type]), input:is([type=text], [type=email], [type=url], [type=tel], [type=search], [type=number], [type=password]), textarea, [contenteditable]:not([contenteditable="false"]))`
  → `text`.
- **Storybook**: the root-relative cursor URL will not resolve there
  (`public/` → `/brand`); accepted. `pnpm storybook:build` must still pass.

## Commit grouping (no commit is made by spec or implementation agents unless asked)

1. Part A desktop (tokens, clock, helper, connectors extraction, OA-3 fix).
2. **Part A mobile trial alone** (D-3 block + its test file): revertable.
3. Part B cursor (asset, tokens, rules, static-output tests).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Colour literal `#CF3147` (and `white`) inside `public/cursor/you.svg` (Art. VII) | A cursor image is an isolated document; it cannot read CSS custom properties or `currentColor` | Generating the SVG at build time from tokens adds build infrastructure for one file (Art. VIII). A test pins the literal to `--red-400` instead |
| Node offset formula written twice: desktop `.node` and mobile `.item` (Art. VIII, DRY) | D-3 requires the mobile float to be removable by deleting one self-contained block | A shared global class would make the mobile trial depend on, and its removal touch, a rule the desktop also uses. If Roberto keeps the trial, a follow-up can lift the formula into one shared rule |
| `ServicesConstellation.vue` already over 200 lines (Art. V, pre-existing) | n/a, fixed here | Extracting `ServicesConnectors.vue` brings it under the limit as part of this change |
| `CursorSpotlight.vue` over 200 lines (Art. V, pre-existing exception recorded by feature 008) | A2 removes the glow block and its long comment, so the file gets shorter; the remaining excess is documentation of the registration mechanism | Same reason as feature 008: root → beam → window → lit is one indivisible mechanism; extracting would break the custom-property inheritance chain |

---

## Amendment A2 · red lit dots, no glow, footer on the paper (2026-10-14)

Spec: § *Amendment A2*, US5, FR-022…FR-029, SC-009…SC-012. Research: A2.1–A2.5.
Decisions A2-1…A2-5 are approved by Roberto; A2-S1 (red-400 at full opacity)
and A2-S2 (`--spotlight-lit-radius: 7.5rem`) are this spec's choices inside
them; OA-9 (glows under the footer) is open for the gate and does not block
the code, which is the same either way.

### Technical context (delta)

Same stack. Layers touched: `app/assets/css/global.css` (tokens),
`app/shared/ui/CursorSpotlight.vue` (+ story, + test),
`app/features/shell/ui/SiteFooter.vue` (+ test), comment-only edits in
`app/layouts/default.vue` and `app/shared/ui/SectionBackdrop.vue`, test-only
edits in `app/features/forms/ui/{ContactForm,ApplicationForm}.test.ts` and
`tests/static-output.test.ts`, one new `tests/spotlight-red-dots-tokens.test.ts`.
No new dependency, no script change: `useCursorSpotlight` is untouched.

### Phase -1 gates for A2

- **I · Feature-Based architecture** → [x] The spotlight stays in
  `app/shared/ui/` (shared chrome since feature 008); the footer stays in
  `shell/ui/`. Nothing new is created.
- **II · Dependency direction / III · Feature isolation** → [x] No import is
  added or changed anywhere. The `forms` feature is touched only in its own
  tests, which import only their own component.
- **IV · Static-Site Purity** → [x] CSS-only change; the spotlight remains
  absent from the prerendered HTML (its `v-if` and composable are untouched);
  no server, no runtime dependency, no third-party request.
- **V · Component discipline** → [x] `CursorSpotlight` keeps no props and no
  imports and gets shorter; its recorded 200-line exception stands (table
  above). `SiteFooter` loses one class. No new client state.
- **VI · i18n parity** → [x] No copy, no key; all four routes identical.
- **VII · Design tokens** → [x] No literal: the lit colour is
  `var(--red-400)`, the radius a rem token in `:root` (§ R18), not in the
  closed `--color-glow-*` / `--spacing-glow-*` namespace (§ R36). No new
  colour token, no new hex. Five dead tokens deleted.
- **VIII · Clean code** → [x] Dead tokens and the dead beam background are
  deleted, not commented out; comments that would contradict the code are
  corrected in the same change (FR-028).
- **IX · TypeScript strict + Biome** → [x] No TS change beyond tests;
  `pnpm check`, `pnpm typecheck` must pass.
- **X · Testing discipline** → [x] Red first: the new and changed assertions
  (A2.5) fail before the CSS and markup change; names `should … when …`;
  `CursorSpotlight` keeps its story, updated.
- **XI · Credential hygiene** → [x] Nothing involved.
- **XII · Absolute imports** → [x] No import added.

### Testing (A2)

| Layer | File | Asserts |
|---|---|---|
| Tokens | `tests/spotlight-red-dots-tokens.test.ts` (new) | `--dot-paper-lit-color: var(--red-400)`; declared `--red-NNN:` set is exactly 100…500; no other declaration's value is `#cf3147` (case-insensitive); `--spotlight-lit-radius: 7.5rem` (×16 in [112, 128]); none of `--spotlight-red-400-`, `--spotlight-stop-mid`, `--spotlight-core-size`, `--spotlight-outer-size` declared |
| Component | `app/shared/ui/CursorSpotlight.test.ts` (updated) | token list becomes `--spotlight-lit-radius`, `--dot-paper-lit-color`, `--duration-spotlight-fade`, `--layer-spotlight`; no `background`/`background-image` in the beam or root rules; exactly one colour `radial-gradient(` (the lit sheet, `var(--dot-paper-lit-color)`); the mask is `circle var(--spotlight-lit-radius)`; none of the deleted token names appears; existing structure, registration, `overflow: clip`, no blend mode, no literal, media guards still asserted |
| Component | `app/features/shell/ui/SiteFooter.test.ts` (updated) | ~~the `<footer>` element carries no class starting with `bg-`~~ superseded by A2 revision 1: the `<footer>` carries `bg-ink-500` |
| Component | `app/features/forms/ui/ContactForm.test.ts`, `ApplicationForm.test.ts` (updated) | the form root keeps `bg-glass-dark-contact` and `backdrop-blur-glass-dark` (regression guard: shown to fail by temporarily removing the class, then restored) |
| Static output | `tests/static-output.test.ts` (updated) | emitted CSS contains `--spotlight-lit-radius:` and `--dot-paper-lit-color:`, not `--spotlight-outer-size:` nor `--spotlight-red-400-`; on `/es` and `/en/about` the `<footer` tag has no `bg-ink-500` class (superseded by A2 revision 1: it has `bg-ink-500`); no `cursor-spotlight` markup in any prerendered page (existing) |
| Manual | `quickstart.md` § 5 | SC-009…SC-011, OA-9, ink-300 weak spot, forms covering |

### Implementation notes (A2)

- `global.css` `:root`: delete `--spotlight-red-400-42/-17/-37`,
  `--spotlight-stop-mid`, `--spotlight-core-size` and their comments; replace
  `--spotlight-outer-size: 20.625rem` and its feature-26 comment with
  `--spotlight-lit-radius: 7.5rem` and a comment (A2-3/A2-S2, Roberto
  2026-10-14, rem for grid parity, one number to recalibrate); set
  `--dot-paper-lit-color: var(--red-400)` and replace its UNVERIFIED/22.6%
  comment with A2-2/A2-S1 (full red-400 at the hotspot, faded by the mask;
  the colour-mix fallback). Update the layer table's spotlight row to "puntos
  rojos bajo el puntero" and the radar comment that cites
  `--dot-paper-lit-color` as an unresolved example.
- `CursorSpotlight.vue`: on `.cursor-spotlight` declare a local
  `--spotlight-size: calc(2 * var(--spotlight-lit-radius))` (component-scoped
  custom property, not a token); replace every `var(--spotlight-outer-size)`
  with `var(--spotlight-size)`; delete `background-image`,
  `background-position`, `background-repeat`, `background-size` from the
  beam; mask `circle var(--spotlight-lit-radius) at center`. Rewrite the doc
  comment (no light; red lit dots; A2; drop the feature-26 sizing note and
  the blend-mode argument about the light, keep "no blend mode"); reword the
  `overflow: clip` reason to "near the end of the page, now also under the
  footer". Keep the fallback-is-a-length note, marked as measured at the old
  size.
- `CursorSpotlight.stories.ts`: replace the "What to look for" list (no
  field, no core; red dots, ≈120 px, linear fade, no edge) and the
  UNVERIFIED lit-colour note (now Roberto's decision).
- *(Superseded by A2 revision 1; see that section.)* `SiteFooter.vue`: `<footer>` with no class; doc comment says the footer has
  no surface of its own and sits on the page paper (A2-4, Roberto
  2026-10-14), that this diverges from `design-extract.md` § 9.bis's fill
  pending Roberto's doc edit, and that a background here would hide the
  dots and the spotlight again.
- `SectionBackdrop.vue` and `default.vue`: comment-only corrections (no
  opaque block remains, superseded by A2 revision 1; the spotlight layer is red lit dots, no light).

### Commit grouping (A2)

4. Part C alone (tokens, spotlight, footer, comments, tests), after the
   three commits above. Commit only when the leader or Roberto asks.

---

## A2 revision 1 · the footer keeps its flat surface (2026-10-15)

Spec: § *A2 revision 1*, US5 scenarios 3 and 7, FR-026 (revised), FR-028
(revision note), SC-010 (revised). Roberto, 2026-10-15: "me quitaste el fondo
del footer flat, eso quiero que esté". The footer keeps its own opaque
`bg-ink-500` exactly as before A2; as a consequence (approved as the
leader's reading) the red lit dots do not show over it, because the
spotlight paints on `--layer-spotlight`, below content. A2-1, A2-2, A2-3,
A2-5, A2-S1, A2-S2 and the form cards are unchanged. The original footer
bug (the glow hidden by the footer) is moot: the glow no longer exists.

### Technical context (delta)

Same stack. This revision touches only the footer and the comments that
describe it: `app/features/shell/ui/SiteFooter.vue` (+ test),
`tests/static-output.test.ts`, and comment-only edits in
`app/shared/ui/SectionBackdrop.vue`, `app/layouts/default.vue` and
`app/shared/ui/CursorSpotlight.vue` (point 1 of its doc comment). Tokens,
the spotlight's CSS, the forms and `useCursorSpotlight` are untouched.

### Phase -1 gates for A2 revision 1

- **I · Feature-Based architecture** → [x] Footer stays in `shell/ui/`.
- **II / III · Dependency direction, feature isolation** → [x] No import
  added or changed.
- **IV · Static-Site Purity** → [x] One class restored; prerendered markup
  returns to the pre-A2 `<footer class="bg-ink-500">`.
- **V · Component discipline** → [x] `SiteFooter` regains one class; no new
  prop or state.
- **VI · i18n parity** → [x] No copy, no key.
- **VII · Design tokens** → [x] `bg-ink-500` is the existing token utility;
  no literal.
- **VIII · Clean code** → [x] Comments that state "no opaque block remains"
  or "the footer has no surface" are corrected in the same change, so no
  comment contradicts the code.
- **IX · TypeScript strict + Biome** → [x] Tests only; `pnpm check`,
  `pnpm typecheck` must pass.
- **X · Testing discipline** → [x] Red first: the inverted footer assertions
  fail against today's footer (no class) before the class is restored. The
  class is now pinned by a test (it was not before A2, research A2.4), so a
  future removal fails loudly.
- **XI · Credential hygiene** → [x] Nothing involved.
- **XII · Absolute imports** → [x] No import added.

### Testing (A2 revision 1)

| Layer | File | Asserts |
|---|---|---|
| Component | `app/features/shell/ui/SiteFooter.test.ts` | replaces `should paint no surface of its own when rendered` with `should paint its own flat ink-500 surface when rendered`: the `<footer>` element has the class `bg-ink-500` |
| Static output | `tests/static-output.test.ts` | replaces `should render the footer without its own background when the page is <route>` with `should render the footer on its own ink-500 surface when the page is <route>` for `/es` and `/en/about`: the prerendered `<footer` tag's `class` contains `bg-ink-500` |
| Unchanged | `tests/spotlight-red-dots-tokens.test.ts`, `CursorSpotlight.test.ts`, form tests | still green; nothing in them is about the footer |
| Manual | `quickstart.md` § 5 (revised steps 3, 4, 7, 8) | footer flat ink-500 with no dots or red dots; clean cut at its top edge; page does not grow |

### Implementation notes (A2 revision 1)

- `SiteFooter.vue`: `<footer class="bg-ink-500">`. Doc comment: restore the
  pre-A2 first paragraph ("an ink-500 surface carrying the brand block…")
  and replace the A2 "No surface of its own" paragraph with a short note:
  the footer's flat ink-500 is Roberto's decision (feature 34, A2 revision 1,
  2026-10-15); it covers the dotted paper and the spotlight's red dots by
  design; removing it is a design change, not a fix.
- `SectionBackdrop.vue`: restore "The only opaque block in the design is the
  footer, which contributes no glows (spec A-12)."
- `app/layouts/default.vue`: rewrite the A2 paragraph under the layer table
  to: nothing in normal flow paints an opaque surface over these layers
  except the footer (flat ink-500, Roberto, feature 34 A2 revision 1) and the
  form cards' glass; both cover the dots and the spotlight by design. The
  other A2 comment edits (red lit dots, no light, "recolour") stay.
- `CursorSpotlight.vue` doc comment point 1: drop "which after A2 includes
  the footer, now that the footer has no surface of its own"; the reason
  stands as "a beam near the end of the page (under the footer) extends the
  document's scrollable height". `overflow: clip` stays.
- Sweep: `grep -rn` over `app/`, `tests/`, `.storybook/` for `A2-4`,
  `no surface of its own`, `No opaque block remains`, `sits on the paper`,
  `continue under`; every hit is corrected or removed.

### Commit grouping (A2 revision 1)

Folds into commit 4 (Part C), which is still uncommitted: after the
revision, `git diff HEAD -- app/features/shell/ui/SiteFooter.vue` shows only
the doc-comment note and `SectionBackdrop.vue` shows no diff. Commit only
when the leader or Roberto asks.
