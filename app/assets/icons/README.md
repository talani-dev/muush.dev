# Interface icon assets (normalized)

Icons from [lucide](https://lucide.dev) that the interface inlines. They live
here rather than in `public/` for the same reason the social glyphs do: served as `<img src="/…">` they could never adopt a brand token,
because `currentColor` only resolves for inlined markup
(`docs/business/rules.md` § R8).

They are consumed with `?raw` + `v-html` inside an `aria-hidden` wrapper and
sized through a `:deep(svg)` rule in the component's scoped style — the
`:deep()` is required, since Vue's scoped-style transform does not rewrite
`v-html` content (`docs/business/rules.md` § R14).

## Shared contract

Same contract the social glyphs satisfy:

- Root is `<svg xmlns viewBox="0 0 24 24">` — a square viewBox, no `width` or
  `height` (the component sizes them).
- Every stroke and fill is `currentColor` or `none`. No hardcoded hex.
- No `<style>`, no `<defs>`, no DOCTYPE, no XML prolog, no tool metadata, no
  comments, no `class` attribute.
- A `<title>` naming the source glyph, mirroring `app/assets/social/*.svg`. It names the *asset*, not the control: the
  accessible name of the button belongs to the caller and comes from the
  locale files.

## Per file

### `x.svg`

| | |
|---|---|
| Source | lucide `x` (ISC licence) |
| Original viewBox | `0 0 24 24` — already square, unchanged |
| Transform applied | none |
| Stripped | `width="24"`, `height="24"` |

Used by `CookiePreferences.vue` (`app/features/legal/`) as the dialog's
close glyph. The v1 mobile menu that first used it was deleted in feature 47.
The stroke presentation attributes (`stroke-width`, `stroke-linecap`,
`stroke-linejoin`) are lucide's own and are kept: they are the glyph's
geometry, not a design value this repository owns.

### `chevron-down.svg`

| | |
|---|---|
| Source | lucide `chevron-down` (ISC licence) |
| Original viewBox | `0 0 24 24` — already square, unchanged |
| Transform applied | none |
| Stripped | `width="24"`, `height="24"` |

Used by `SelectField.vue` (feature 016, `app/features/forms/`) as the select
control's affordance glyph. Same stroke-attribute convention as `x.svg`.

### `arrow-right.svg`

| | |
|---|---|
| Source | lucide `arrow-right` (ISC licence) |
| Original viewBox | `0 0 24 24` — already square, unchanged |
| Transform applied | none |
| Stripped | `width="24"`, `height="24"`, `class` |

Used by `PrimaryButton.vue` (feature 42, Muush 1.0) as the trailing arrow
of the primary button, which the Kit draws as the lucide `arrow-right` at
20×20 (hero) and 16×16 (nav) in Blanco
(`docs/harness/progress/pen-extract-42.md` § 2). Decorative: the button's
accessible name is its label. Same stroke-attribute convention as `x.svg`.

### Feature 44 glyphs (Muush 1.0 home)

Nine glyphs downloaded by the leader, with Roberto's approval
(2026-11-01), from the npm package `lucide-static@0.469.0` (ISC licence),
then normalized here. The raw downloads were staged in
`docs/harness/progress/assets-44/lucide/` and not retained (they fail
Biome's `noSvgWithoutTitle`); the reviewer compared them with these files
(review-44). No package was added to the project. The same normalization applies to all
nine:

| | |
|---|---|
| Source | `lucide-static` 0.469.0, `icons/<name>.svg` (ISC licence) |
| Original viewBox | `0 0 24 24` — already square, unchanged |
| Stripped | the `<!-- @license … -->` comment, `class`, `width="24"`, `height="24"`, whitespace |
| Added | `<title>lucide · <name></title>` |

Paint is lucide's own `stroke="currentColor"` / `fill="none"` (one inner
dot of `key-round` is `fill="currentColor"`); no hex anywhere.

**Stroke width.** The `.pen` draws the four service-card glyphs at lucide
"weight 300" (pen extract-44 § 3.1). lucide-static ships weight 400
(`stroke-width="2"`); `1.5` is the accepted equivalent (pen extract-44 § 8),
so those four files carry `stroke-width="1.5"`. The five commitment glyphs
have no weight in the extract and keep lucide's `2`.

| File | Stroke | Used by |
|---|---|---|
| `compass.svg` | 1.5 | `ServiceCard.vue` · Estrategia tecnológica (40 × 40, Blanco) |
| `layout-dashboard.svg` | 1.5 | `ServiceCard.vue` · Software, web y nube |
| `workflow.svg` | 1.5 | `ServiceCard.vue` · Automatización, datos e IA |
| `pen-tool.svg` | 1.5 | `ServiceCard.vue` · Diseño de producto y UX |
| `message-circle-warning.svg` | 2 | `CommitmentChip.vue` · step 01 (12 × 12) |
| `sliders-horizontal.svg` | 2 | `CommitmentChip.vue` · step 02 |
| `user-round.svg` | 2 | `CommitmentChip.vue` · step 03 |
| `file-text.svg` | 2 | `CommitmentChip.vue` · step 04 |
| `key-round.svg` | 2 | `CommitmentChip.vue` · step 05 |

All nine are decorative: the card title and the commitment text are the
accessible content (`app/features/landing/ui/`).

### Feature 45 glyph (Muush 1.0 forms)

`check.svg`: lucide `check` from `lucide-static@0.469.0`
(`icons/check.svg`, ISC licence), downloaded by the leader with Roberto's
approval (2026-11-02, pen extract-45 § 7 Q3) to a scratch folder outside the
repository and checked there (no script, no link). No package was added to
the project. Normalized exactly like the feature 44 glyphs:

| | |
|---|---|
| Original viewBox | `0 0 24 24` — already square, unchanged |
| Stripped | the `<!-- @license … -->` comment, `class`, `width="24"`, `height="24"`, whitespace |
| Added | `<title>lucide · check</title>` |
| Stroke | lucide's own `2` (the extract gives no weight) |

Used by:

- `ReceivesList.vue` (`app/shared/ui/`), the "Lo que recibes" rows
  of the Diagnóstico y contacto section and the "Áreas que sumamos" rows of
  Nosotros (feature 46): 14 × 14 in `--compromiso-icono` inside a 24 × 24
  Red 15 % bubble (pen extract-45 § 1);
- `ConsentCheckbox.vue` (`app/features/forms/ui/`), the ticked privacy box:
  12 × 12 in Blanco over Red muush.

Decorative in both: the row text and the native checkbox carry the meaning.

### Feature 51 glyphs (Preguntas)

`plus.svg`, `chevron-right.svg` and `message-circle.svg`: lucide `plus`,
`chevron-right` and `message-circle` (ISC licence), the glyphs the handoff
`preguntas-muush-1.0` names. Nothing was downloaded and no package was
added: the path data is lucide's published geometry for those three glyphs
(as shipped in `lucide-static` 0.469.0, the version of the feature 44
glyphs), written here in the shared contract above.

| | |
|---|---|
| viewBox | `0 0 24 24`, square |
| Paint | `stroke="currentColor"`, `fill="none"`; no hex |
| Stroke | lucide's own `2` (the handoff gives no weight) |
| Added | `<title>lucide · <name></title>` |

| File | Used by |
|---|---|
| `plus.svg` | `FaqQuestion.vue` · the closed question's round button (14 → 16) |
| `chevron-right.svg` | `FaqTopicTabs.vue` · the desktop topic tab (18) |
| `message-circle.svg` | `FaqCard.vue` · the "¿Tienes otra pregunta?" icon box (20) |

`FaqQuestion.vue` also uses `x.svg` for the open question. All four are
decorative: the question text, the topic name and the card title carry the
meaning (`app/features/faq/ui/`).
