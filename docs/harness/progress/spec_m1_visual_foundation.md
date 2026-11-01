# Spec summary · feature 42 `m1_visual_foundation`

**Status:** `spec_ready` (2026-10-31). `./init.sh` passes. Nothing committed.

## Package

`specs/042-m1-visual-foundation/`: `spec.md`, `plan.md` (Phase -1 gates all
pass, no Complexity Tracking entries), `research.md` (R1–R19),
`data-model.md`, `contracts/components.md`, `quickstart.md`, `tasks.md`
(65 tasks across 8 phases, tests first), `checklists/requirements.md`.

The folder number is 042, not 037, to match the feature id as earlier folders
do (002, 006, 008, 034, 036). `.specify/feature.json` points to the folder.
spec-kit's prerequisite scripts reject the branch name
`feat/v2-visual-foundation`, so they were run with
`SPECIFY_FEATURE=042-m1-visual-foundation`.

## Key decisions

- **Tokens.** A new `:root` "Muush 1.0" block holds every handoff variable
  under its handoff name, in `rem`. An `@theme inline` block exposes them with
  an `m1-` prefix (`bg-m1-negro-950`, `text-m1-hero`, `rounded-m1-pill`,
  `backdrop-blur-m1-vidrio`, …). Durations and gradients stay in `:root`.
  v1 tokens are untouched.
- **`.pen` overrides of the handoff.** `--m1-h-hero` goes 34 → 96 (the
  handoff stops at 84). `--m1-p-grande` goes 17 → 20 (the handoff starts at
  16). New sizes: `--m1-h-proceso` (28 → 52) and `--m1-h-diagnostico`
  (34 → 64), and a fixed 24 px service-card title (`--m1-h-servicio`,
  tracking −0.6 px). Line-heights are fluid lengths, so both anchors are exact.
  Heading tracking is also fluid: 0 at 390, and −3.5 / −1.96 / −1.82 /
  −2.24 px at 1440 (about −0.035 em; pen extract § 8). The section heading is
  28 at 390. The 30, 32 and 34 px mobile sizes of individual sections are
  per-use overrides owned by features 44 and 46. The clamp values are in
  research R4.
- **Fonts.** Poppins weights become `[500, 600]` in `@nuxt/fonts`. 600 stays
  for v1 until feature 47. No `@import`.
- **Primitives.** `M1GlassSurface` has presets `panel`, `servicio` and
  `franja`, each field overridable. The others are `M1Pill`, `M1RotatingPill`,
  `M1PrimaryButton` (sizes `hero`, `nav`, `block`; hero switches at `lg`, and
  the icon only shows from `lg`), `M1GlassButton` and `M1Heading`. All live in
  `app/shared/ui/`. The `M1` prefix keeps them apart from the v1
  `Pill`/`PrimaryButton`/`GlassPanel`, which v1 sections still use. The
  top-lit gradient border is one shared `@utility m1-borde-luz`.
- **Backgrounds.** `M1ShaderBackground` takes a `preset` (seven presets from
  the README). Logic lives in `useShaderCanvas`, `shaderRenderer` and the pure
  `shaderFrame` helpers. There is no `<ClientOnly>`: the poster is in the
  prerendered HTML, so it covers the no-JS case, and the canvas stays
  transparent until the first frame draws. Every observer, the animation
  frame and the GL context are released on unmount, which the handoff never
  does. Shaders are copied verbatim to `app/assets/shaders/` and loaded with a
  dynamic `?raw` import. Posters are copied to `app/assets/backgrounds/`.
  Nothing is served from `docs/`.
- **Rotating pill.** The visible label is `aria-hidden`. A visually hidden
  list holds all items, with no `aria-live`. It does not advance while the tab
  is hidden, and stops under reduced motion (followed live).
- **Cursor and spotlight.** Behaviour is unchanged.
  `--dot-paper-lit-color` → `var(--m1-red-muush-500)`, and the cursor SVG is
  recoloured `#CF3147` → `#E5352F`. The two pinning tests are updated, not
  deleted.
- **i18n.** No locale key is added: primitives take copy as props, and
  stories use the approved ES/EN copy from `muush-1.0.md` § 4.

## Clarifications

No `[NEEDS CLARIFICATION]` marker is left in `spec.md`. There were three. A
subagent cannot ask Roberto, so `/speckit-clarify` applied the recommended
answer to each, plus one more question. Q2 has since been resolved by the
leader (pen extract § 8). Q1, Q3 and Q4 stay provisional until Roberto
confirms them at the gate:

1. **Cursor colour.** Recolour the cursor to Red muush 500 `#E5352F`, or keep
   `#CF3147` (which the Kit calls "el rojo anterior")? Provisional: recolour.
2. **Mobile heading values.** RESOLVED by the leader's re-check (pen extract
   § 8, frames `V2s7T`, `mJxKt`, `trkk7`). Tracking is 0 at 390 and about
   −0.035 em at 1440, so it is fluid. It is not an em value scaled from 1440.
   The section heading is 28 at 390, and 30, 32 and 34 are per-use overrides
   for features 44 and 46. Applied in spec FR-006 and FR-007, research R4,
   data-model § 1.3, tasks T005, T006 and T032, and the plan's risk table.
3. **Focus state.** The `.pen` draws no focus state on any M1 component.
   Provisional: a 2 px Blanco outline with a 3 px offset, on `:focus-visible`
   only.
4. **Rotating pill and WCAG 2.2.2 (Pause, Stop, Hide).** Content that updates
   itself indefinitely should be pausable. Provisional: pause while the
   pointer hovers the pill. This is a small addition to the designed
   behaviour.

## Other open questions for Roberto or the leader

- **Service-card radius.** RESOLVED (pen extract § 8): 24 is confirmed. The
  service-card preset uses 24 and the `--m1-radio-tarjeta` token keeps 22.
- **Trabaja con muush poster.** The handoff has no poster for it, so it reuses
  the diagnóstico poster (same uniforms). This is inferred.
- **Spotlight after feature 43.** When 43 removes the dotted paper, the
  spotlight will draw red dots only near the pointer, on plain black. Is that
  the intended v2 look?
- **Spotlight under the shaders.** The spotlight paints below section
  content, so sections with an animated background (44–46) will hide it.
  Intended?
- **Red cursor on the red primary button.** Contrast is low there. Cursor
  behaviour and design are fixed, so this is reported, not changed.
- **Favicon.** `muush-1.0.md` puts the favicon on Red muush 500. No v2
  feature owns that change, and it is out of 42's scope.
- **Mobile glass-button and form-submit icon.** The extract gives no icon for
  the mobile form submit ("—"). The `icon` prop defaults to `true`, and
  feature 45 decides.

No business rules were written. Nothing under `docs/business/` was touched.

## What changes visually on the live site after 42

This is the `muush-v2` integration build. Production (`master`) does not
change until 47.

1. The canvas becomes Negro 950 `#050505` instead of Ink 500 `#262626` on
   every page in both locales, overscroll included. The v1 sections, dotted
   paper and glows still render on top, so the pages look darker.
2. The v1 footer keeps its flat Ink 500 surface (pinned by feature 34 A2
   rev 1). It now shows as a lighter grey band until feature 43 replaces it.
3. The cursor and the spotlight's lit dots shift from `#CF3147` to `#E5352F`.
4. Nothing else changes. The primitives and backgrounds appear only in
   Storybook until features 43–46 place them.
