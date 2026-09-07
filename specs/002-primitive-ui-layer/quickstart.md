# Quickstart: Primitive UI layer

**Feature**: `specs/002-primitive-ui-layer` | **Date**: 2026-09-06

How to build, review and verify this feature. Read `plan.md` first for the
architecture and the gates; this file is the operational side.

---

## 1 · Where everything goes

```text
app/shared/ui/
├── GlassPanel.vue        GlassPanel.stories.ts        GlassPanel.test.ts
├── Radar.vue             Radar.stories.ts             Radar.test.ts
├── Wordmark.vue          Wordmark.stories.ts          Wordmark.test.ts
├── Lockup.vue            Lockup.stories.ts            Lockup.test.ts
├── Pill.vue              Pill.stories.ts              Pill.test.ts
├── BotonPrimario.vue     BotonPrimario.stories.ts     BotonPrimario.test.ts
├── LinkArrow.vue         LinkArrow.stories.ts         LinkArrow.test.ts
├── SocialIcon.vue        SocialIcon.stories.ts        SocialIcon.test.ts
└── tokens.stories.ts     ← Foundations/Design tokens, not a component

vitest.config.ts          ← the ONE file touched outside app/shared/ui/
```

`app/shared/ui/GlassPanel.stories.ts` exists today as a placeholder titled
`Shared/Tokens smoke test`. **Overwrite it.** Its token-rendering job moves to
`tokens.stories.ts`.

Nothing else is created or modified. `app/features/`, `app/layouts/`,
`app/pages/`, `i18n/`, `nuxt.config.ts`, `.storybook/*`,
`app/assets/**` and `biome.json` are all untouched.

## 2 · Build order

Dependency-first, so nothing is written against a component that does not
exist yet:

```text
1. Radar        (no deps)          6. LinkArrow      (no deps)
2. Wordmark     (no deps)          7. SocialIcon     (asset only)
3. GlassPanel   (no deps)          8. Lockup         (→ Wordmark + asset)
4. BotonPrimario(no deps)          9. Pill           (→ Radar)
5. tokens story (no deps)
```

Write **GlassPanel first in practice** even though it has no dependencies: it
is the one that exercises the variant-map pattern, the `<component :is>`
pattern and the fallthrough-class behaviour all at once, so getting it right
settles the shape of the other seven.

## 3 · The two things to verify before writing seven more components

Both are named in `research.md` as the only unresolved mechanics. Do them on
the **first** component, not at the end.

**(a) Does the exported SFC type survive for a consumer?**

```bash
# after GlassPanel.vue exports `GlassVariant`, in GlassPanel.test.ts:
#   import type { GlassVariant } from '@/shared/ui/GlassPanel.vue'
pnpm typecheck
```

Green → keep exporting unions from `<script setup>`. Red → create
`app/shared/ui/types.ts` with the seven unions and import from there. Do not
discover this on component eight.

**(b) Does the `?raw` + `v-html` + `:deep(svg)` chain actually paint?**

```bash
pnpm storybook          # open Foundations + Shared/UI/Lockup
pnpm generate           # confirm the SVG is inline in .output/public, not an <img>
```

The glyph must be **inline markup** in the generated HTML. If it comes out as
`<img src="/_nuxt/…svg">`, the `?raw` suffix was dropped and `currentColor`
will never resolve — see `research.md` § R2.

## 4 · Verifying the token discipline (FR-050, SC-002, SC-003)

These greps are the mechanical form of Article VII. All three must return
nothing.

```bash
# Colour literals — hex, rgb(), oklch()
grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(|oklch\(' app/shared/ui/*.vue

# Size literals — px / rem / em outside a token reference
grep -nE '[0-9]+(px|rem|em)\b' app/shared/ui/*.vue

# Arbitrary bracketed values and size breakpoints
grep -nE '\[[a-z-]+:[^]]+\]|(sm|md|lg|xl):(text|p|px|py|m|mx|my|gap|rounded|blur)-' app/shared/ui/*.vue
```

Two matches are legitimate and must be justified in the review, not silenced:

- `:deep(svg) { width: 100%; height: auto }` in `Lockup.vue` and
  `SocialIcon.vue` — `100%` and `auto` are layout keywords, not design values.
  There is no token for "fill your parent".
- `animation: led-spin 2.6s linear infinite` in `BotonPrimario.vue` — a
  duration, which Article VII does not govern. The value is
  `design-extract.md` § 4 verbatim.

Run the greps against the **stories** too, with a lighter standard: a story may
use a plain utility for its own scaffolding, but the component instances inside
it must not be styled with literals, or the story stops being a faithful
preview.

## 5 · Component tests (FR-051)

`vitest.config.ts` changes in exactly two ways (`research.md` § R8):

```ts
environment: 'happy-dom',                                  // was 'node'
include: ['tests/**/*.test.ts', 'app/shared/ui/**/*.test.ts'],
```

Do **not** reach for `test.projects` — `defineVitestConfig` throws on it — and
do not reach for `environmentMatchGlobs`, which Vitest 4 removed. The `@/`
aliases and the Vue plugin are inherited from the Nuxt config automatically, so
nothing else needs declaring.

Test names follow Article X: `should <expected> when <condition>`. What each
file is for:

| File | Asserts |
|---|---|
| `GlassPanel.test.ts` | each of the 6 variants emits its documented fill/border/blur/radius class; `padding='tight'`/`'none'` override correctly; `as` changes the tag; a caller `class` is merged, not replaced |
| `Radar.test.ts` | 3 nested rings for each of the 3 sizes; `aria-hidden` present |
| `Wordmark.test.ts` | `full` renders three runs with the dot in red; `short` renders only `muush` |
| `Lockup.test.ts` | an inline `<svg>` is present; **no `stroke-width` appears anywhere in the output**; `form` is forwarded |
| `Pill.test.ts` | renders a Radar and the label |
| `BotonPrimario.test.ts` | `<a>` when `href` is set, `<button>` otherwise; `type` defaults per variant; each variant's padding/label classes |
| `LinkArrow.test.ts` | no background/border class in any state; the arrow is rendered by the component; `external` adds `target` and `rel` |
| `SocialIcon.test.ts` | `aria-label` is the caller's; `target`/`rel` present; the right glyph per network |

The Lockup assertion is the highest-value test in the set: it is the one
guarding against the design documentation actively inviting a bug (FR-023).

## 6 · Reviewing in Storybook

```bash
pnpm storybook          # dev
pnpm storybook:build    # what CI runs
```

The catalogue already provides what the stories need — do not redefine it:
backgrounds `ink` (default) / `bone` / `red`, viewports `Móvil (390)` /
`Escritorio (1440)`, and `global.css` imported. Review each component on
**ink** first, then flip to **bone** — a primitive that only looks right on
dark is a bug the background switch is there to surface.

Sidebar layout when done:

```text
Foundations/
  Design tokens
Shared/UI/
  BotonPrimario · GlassPanel · LinkArrow · Lockup
  Pill · Radar · SocialIcon · Wordmark
```

## 7 · Full gate before handing back

```bash
pnpm check          # Biome lint + format, --error-on-warnings
pnpm typecheck      # vue-tsc, strict
pnpm test           # Vitest: i18n parity + 8 component suites
pnpm generate       # static output to .output/public
pnpm storybook:build
./init.sh           # the harness's own verification
```

All five must pass (SC-010). `pnpm check` and `pnpm typecheck` also run in the
Husky pre-commit hook; `--no-verify` is prohibited.

## 8 · What to flag at the approval gate

Three items in this package are decisions someone else may want to make
differently. They are not defects:

1. **LED on touch devices** (spec A-02, `decisions-open.md` #8, owner Clau) —
   carried forward as a static ring, reversible by deleting one media query.
2. **Component tests** (spec A-12, FR-051) — an addition beyond the originating
   task description, made to satisfy Article X layer 2. It is the only reason
   `vitest.config.ts` is touched.
3. **Focus-indicator geometry** (spec A-07) — no design source exists; the
   platform default outline is recoloured to red-400.
