# Implementation report · feature 42 · naming reorganization

- **Branch:** `feat/v2-visual-foundation`. Nothing committed, no version bump.
- **Date:** 2026-11-01.
- **Mandate:** naming reorganization approved by Roberto 2026-11-01
  (constitution 2.1.1, Article VII; feature-42 description and its first
  acceptance item).
- **Status:** left at `in_progress`.
- **Gate:** `./init.sh` exited 0 on the first run after the code changes (see
  § 8). Only docs changed after that run.
- **Scope:** names and paths only. No logic, value or behaviour changed, with
  one exception: `tests/token-literals.test.ts` now uses an explicit file list
  (§ 7).

## 1 · How components resolve (checked before moving anything)

- **There is no auto-import.** `app/components/` does not exist, and
  `nuxt.config.ts` has no `components:` entry, so Nuxt registers none of our
  components. `.nuxt/components.d.ts` lists only Nuxt's and i18n's built-ins.
- **Every import is an explicit alias path** (`@/shared/ui/…`). The two
  `Pill.vue` files, `app/shared/ui/Pill.vue` (v2) and
  `app/shared/ui/legacy/Pill.vue` (v1), therefore cannot clash. The same holds
  for the two `PrimaryButton.vue` files.
- **Storybook** uses the same aliases in `.storybook/main.ts`, and its story
  glob `../app/**/*.stories.@(ts|tsx)` already includes `legacy/`.
- **Relative imports inside v1:** `Pill.vue` imports `./Radar.vue` and
  `HeroStack.vue` imports `./Pill.vue`. Both pairs moved together, so the
  relative paths still resolve (to the v1 files).

## 2 · Moves and renames

### 2.1 v1 → `app/shared/ui/legacy/` (`git mv`; each `.vue`, `.test.ts` and `.stories.ts`)

| Component | Files moved |
|---|---|
| `Pill` | vue, test, stories |
| `PrimaryButton` | vue, test, stories |
| `GlassPanel` | vue, test, stories |
| `Radar` | vue, test, stories |
| `SectionGlow` | vue, test, stories |
| `SectionBackdrop` | vue, test, stories |
| `HeroStack` | vue, test, stories |
| `LinkArrow` | vue, test, stories |
| v1 token catalogue | `tokens.stories.ts` → `legacy/tokens.stories.ts` |

- Git shows all 25 as renames (`R`/`RM`). They are staged in the index,
  because `git mv` stages.
- Import paths were rewritten in 41 files, as paths only. That includes the
  file-path strings in tests that read sources from disk
  (`legacy/SectionBackdrop.test.ts`, `legacy/SectionGlow.test.ts`) and two
  comments that name a path (`global.css`, `tests/static-output.test.ts`).

**History note for whoever commits.** v2 now occupies the old paths
`app/shared/ui/Pill.vue` and `PrimaryButton.vue`. If those files are committed
together with the moves, git may record the old path as *modified* and the
legacy copy as *added*, which breaks `git log --follow` for those two files.
To keep history:
1. Commit the staged `legacy/` moves on their own.
2. Then commit the v2 files.

### 2.2 v2: `M1` prefix dropped (plain `mv`)

The v2 files were untracked, so `git mv` cannot apply to them.

| Old | New |
|---|---|
| `M1GlassButton.{vue,test.ts,stories.ts}` | `GlassButton.*` |
| `M1GlassSurface.*` | `GlassSurface.*` |
| `M1Heading.*` | `Heading.*` |
| `M1Pill.*` | `Pill.*` |
| `M1PrimaryButton.*` | `PrimaryButton.*` |
| `M1RotatingPill.*` | `RotatingPill.*` |
| `M1ShaderBackground.*` | `ShaderBackground.*` |
| `m1-tokens.stories.ts` | `tokens.stories.ts` |
| types `M1HeadingSize`, `M1PrimaryButtonSize` | `HeadingSize`, `PrimaryButtonSize` |
| `app/assets/shaders/m1-liston.glsl`, `m1-acanalado.glsl` | `liston.glsl`, `acanalado.glsl` (still `cmp`-identical to the handoff) |
| `tests/m1-tokens.test.ts` | `tests/design-tokens.test.ts` |
| `tests/m1-literals.test.ts` | `tests/token-literals.test.ts` |
| scoped class `m1-icono` (PrimaryButton) | `icono` |
| transition `m1-rotativo` (RotatingPill) | `rotativo` |
| describe names `m1 tokens · …`, `m1 literals · …` | `design tokens · …`, `token literals · …` |

## 3 · v1 / v2 classification

### Moved to `legacy/`

| Component | Why it is v1 |
|---|---|
| `Pill`, `PrimaryButton`, `GlassPanel` | v1 primitives with v2 replacements (`Pill`, `PrimaryButton`, `GlassSurface`). |
| `Radar` | The v1 pill's red ping dot and the Services constellation. The v2 pill draws its own dot. |
| `SectionGlow`, `SectionBackdrop` | The v1 glow background system. v2 uses `ShaderBackground`. |
| `HeroStack` | The v1 hero composition (v1 `Pill` + headline). |
| `LinkArrow` | Doc comment: "the secondary call to action … design-extract.md § 7" (v1 design). It is used only by v1 `HeroSection` and `ContactSection`, and v2's secondary CTA is `GlassButton`. |
| v1 `tokens.stories.ts` | Catalogues the v1 ramps (`bone/ink/red/wine`) and the v1 type scale. |

### Kept in `app/shared/ui/`

| Component | Decision and reason |
|---|---|
| `CursorSpotlight` | Kept (Roberto: cursor and spotlight stay; `muush-1.0.md` § 1). |
| `DotGrid` | **Kept in place, but I am unsure. The leader listed it as a v1 example.** `CursorSpotlight` is defined as recolouring `DotGrid`'s dots on the same 24 px grid (its doc comment, load-bearing item 3), and `app/layouts/default.vue` mounts both. Moving it would quarantine a dependency of a component v2 keeps. **Decision needed from Roberto/leader:** does v2 keep the dotted paper under the spotlight? |
| `Lockup`, `Wordmark` | Kept as design-neutral: "El logo (isotipo + wordmark) no cambia" (`muush-1.0.md` § 1). They still use v1 colour utilities (`text-bone-100`, `text-red-400`); re-tokening them belongs to 43. |
| `SocialIcon` | **Kept in place, but I am unsure.** The glyph map (LinkedIn, Instagram, TikTok) is neutral, and v2 keeps those networks (`muush-1.0.md`, REDES). Its 48 × 48 dark-glass box, however, is v1 styling (`bg-glass-dark`, `rounded-icon`). Feature 43 should decide whether it is restyled or replaced. |

### Feature-section stories → `Legacy v1/`

- **Affected:** all `Landing/*`, `About/*`, `Shell/*` and `Forms/*`. The
  components stay where they are; only the story titles moved.
- **Why v1:** every one is built from the v1 design and v1 tokens, and v2
  features replace each group:
  - 43 replaces the shell (nav, mobile menu, footer and the language toggle inside them);
  - 44 replaces the home (Hero, Propósito and Servicios retired or redone);
  - 45 replaces both forms;
  - 46 replaces Nosotros and the 404 (`NotFoundContent`).

## 4 · Token renames

### 4.1 Rule

- **Root custom properties:** `--m1-X` → `--X` (e.g. `--m1-negro-950` →
  `--negro-950`, `--m1-borde-ancho` → `--borde-ancho`).
- **`@theme inline` keys:** `--<ns>-m1-X` → `--<ns>-X`. Utilities follow,
  e.g. `bg-m1-negro-950` → `bg-negro-950`, `text-m1-hero` → `text-hero`,
  `rounded-m1-pill` → `rounded-pill`, `backdrop-blur-m1-vidrio` →
  `backdrop-blur-vidrio`.
- **Variable shorthands** follow the root names: `duration-(--rapido)`,
  `bg-(image:--btn-fondo)`.
- **Custom utilities:**

| Old | New |
|---|---|
| `m1-borde-luz` | `borde-luz` |
| `m1-borde-panel`, `-tarjeta`, `-boton`, `-plano`, `-linea`, `-btn` | `borde-panel`, `borde-tarjeta`, `borde-boton`, `borde-plano`, `borde-linea`, `borde-btn` |
| `m1-foco` | `foco` |
| internal `--m1-borde` | `--borde` |

### 4.2 Four names that could not simply drop the prefix

Each is documented in a comment in `global.css`.

| Old | New | Why |
|---|---|---|
| `--m1-font-titulo`, `--m1-font-texto` (root) | `--fuente-titulo`, `--fuente-texto` | Unprefixed, they would be `--font-titulo`/`--font-texto`, which are exactly the theme alias keys. The alias would then read `--font-titulo: var(--font-titulo)`, a self-reference. Utilities stay `font-titulo`, `font-texto`. |
| `--ease-m1` (theme) | `--ease-muush` → `ease-muush` | `--ease` alone is not a theme key, and the root `--ease` holds the curve. `muush` is the brand, not a version. |
| `--container-m1-max` (theme) | `--container-contenido` → `max-w-contenido` | `--container-max` would generate `max-w-max`, which Tailwind already defines as `max-content`. |

`tests/design-tokens.test.ts` now keys its embedded handoff table by the site
names. Its header comment states that the prefix is dropped and that the font
stacks are the one renamed pair. The values are untouched.

### 4.3 Collisions with v1, and how they were resolved

I re-checked with a script over every declaration in `global.css` and every
custom property declared in `.vue`/`.ts`, plus cross-namespace utility
overlaps. I found the leader's seven plus one more:

| v1 key (before) | v1 key (now) | v1 utility (now) |
|---|---|---|
| `--radius-control` | `--radius-legacy-control` | `rounded-legacy-control` |
| `--radius-panel` | `--radius-legacy-panel` | `rounded-legacy-panel` |
| `--spacing-pill-gap` | `--spacing-legacy-pill-gap` | `gap-legacy-pill-gap` |
| `--spacing-pill-y` | `--spacing-legacy-pill-y` | `py-legacy-pill-y` |
| `--text-pill` | `--text-legacy-pill` | `text-legacy-pill` |
| `--text-pill--font-weight` | `--text-legacy-pill--font-weight` | (sub-property) |
| `--text-pill--letter-spacing` | `--text-legacy-pill--letter-spacing` | (sub-property) |
| **`--text-pill--line-height`** (not in the leader's list) | `--text-legacy-pill--line-height` | (sub-property) |

- **Why the eighth matters:** v2 `--text-pill` declares no line-height.
  Without the rename, v1's `1.2` would have leaked into the v2 pill's
  `text-pill` utility.
- **v1 consumers updated (names only):**
  - forms: `FileField`, `TextField`, `TextareaField`, `SelectField` and
    `DialCodeSelect` (`rounded-legacy-control`), plus the `TextField` doc
    comment;
  - `legacy/GlassPanel.vue` and its test;
  - `legacy/Pill.vue` and its test;
  - `legacy/PrimaryButton.test.ts` (the `--radius-legacy-control` guard and
    the "old radius never comes back" negative assertion);
  - `legacy/tokens.stories.ts`;
  - `tests/static-output.test.ts:799`;
  - `tests/not-found-output.test.ts:161`.
- **Left as is:** `--radius-panel-sm` (`rounded-panel-sm`) does not collide
  and keeps its name; the comment says so. The v1 colour families
  `--bone/ink/red/wine-*` are unchanged.
- **Checked and clean:**
  - no other key equality between the v1 and v2 theme;
  - no root/theme name pair;
  - no duplicate `@utility` (the custom utilities are the 8 v2 ones only);
  - no text↔colour, shadow↔colour or container↔spacing utility overlap (`font-texto` vs
    `--color-texto` share a stem but no utility);
  - no v2 root name clashes with a Tailwind theme variable;
  - no clash with a Tailwind built-in utility, apart from the avoided
    `max-w-max`.

### 4.4 `tests/token-literals.test.ts` adjustment

The v1-token pattern was `/--(bone|ink|red|wine)-/`, which would now match v2
`--red-muush-500`. It is now `/--(bone|ink|red|wine)-\d/`: the v1 families
are numeric ramps. A comment records why.

## 5 · Storybook

### 5.1 Title map

| Old | New |
|---|---|
| `Shared/UI/M1/Tokens` | `Foundations/Tokens` |
| `Shared/UI/M1/{GlassButton,GlassSurface,Heading,Pill,PrimaryButton,RotatingPill,ShaderBackground}` | `Shared/UI/{same}` |
| `Foundations/Design tokens` (v1) | `Legacy v1/Foundations/Tokens` |
| `Shared/UI/{GlassPanel,HeroStack,LinkArrow,Pill,PrimaryButton,Radar,SectionBackdrop,SectionGlow}` | `Legacy v1/Shared/UI/{same}` |
| `About/*` (2) | `Legacy v1/About/*` |
| `Forms/*` (11) | `Legacy v1/Forms/*` |
| `Landing/*` (4) | `Legacy v1/Landing/*` |
| `Shell/*` (5) | `Legacy v1/Shell/*` |
| `Shared/UI/{CursorSpotlight,DotGrid,Lockup,SocialIcon,Wordmark}` | unchanged |

- **Built `storybook-static/index.json`:** 44 titles, all unique.
- **Sidebar order:** `.storybook/preview.ts` gains `storySort` with order
  `Foundations`, `Shared` (`UI`), `*`, `Legacy v1` (inside it: `Foundations`,
  `Shared`, `*`). Its `negro` background comment was updated.

### 5.2 The "duplicates" (`Contact`/`Contacto`, `Navegación`/`Navigation`, `Redes`/`Social`, `muush` ×2)

- **What they are:** not Storybook titles. They are the `title` fields of
  the footer-column fixtures in
  `app/features/shell/ui/SiteFooter.stories.ts:51-120`, the Spanish set
  (`spanishColumns`) and the English set (`englishColumns`), fed to the
  `Spanish` and `English` stories.
- **Why they stay:** they are correct bilingual copy, and `muush` is the same
  word in both locales. Renaming them would change what the stories render.
- **Left unchanged:** no Storybook title was duplicated before or after.

## 6 · Docs

| File | Change |
|---|---|
| `specs/042-m1-visual-foundation/spec.md` | Dated note "Naming reorganization approved by Roberto 2026-11-01" before Context. FR-001, FR-002 and FR-003 now name the unprefixed tokens; Q3 says "v2 buttons". Token names elsewhere were renamed mechanically. |
| `plan.md` | Dated note; tree lists `liston.glsl`/`acanalado.glsl`; "m1 block" → "v2 block". |
| `data-model.md` | Dated note on the prefix and the `--fuente-*` pair. Token tables renamed (`--container-contenido`, `--ease-muush`). |
| `contracts/components.md` | Title "v2 primitives", dated note; component names without `M1`. |
| `research.md` | Dated note at the top. R1 and R14 record the original prefix decision as superseded and give the collisions and exceptions; R8, R18 and R19 are updated. |
| `quickstart.md` | `var(--negro-950)`; `Foundations/Tokens` and `Shared/UI/`. |
| `tasks.md` | A "historical log" note only: the task texts keep the names used when they were done. |
| `docs/harness/progress/pen-extract-42.md` | A naming note under the header. Three lines that named site tokens now name the site's (`--vidrio-*`, "the v2 tokens", `--radio-tarjeta`). The `.pen`/handoff `m1-*` names stay, because they are the source's own. |

The folder name `specs/042-m1-visual-foundation/` and the feature name
`m1_visual_foundation` were kept, as instructed.

## 7 · Verification

### `./init.sh` (run after all code changes)

| Step | Result |
|---|---|
| `pnpm typecheck` | OK |
| `pnpm check` | OK (327 files). Formatting was applied with `biome format --write` to the 11 files the renames lengthened; formatting only. |
| `pnpm test` | 113 files, 1699 tests, all passed (same counts as before) |
| `pnpm generate` | OK |
| `pnpm storybook:build` | OK |
| exit | **0** |

- **Other processes:** a `pnpm storybook` dev server (pid 89072/89083) was
  already running. I did not touch it, and no lock conflict occurred.
- **Processes I started:** two local `http.server`s and one headless Chrome
  for measurement. I stopped all three afterwards.

### Nothing renders differently

Measured on the rebuilt catalogue and site in headless Chrome over CDP. All
values are identical to `impl_m1_visual_foundation.md` §§ 3, 6 and 7:

| Element | 390 | 1440 | Forced colours |
|---|---|---|---|
| Primary hero | 177.75 × 44, 14 px/600 | 252.52 × 55, 19 px/600 | `solid 1px` system colour, offset −1 px, same size |
| Primary nav | — | 194.3 × 41 | same |
| Glass button | 144.22 × 42 | 197.13 × 52 | same |
| Pill | 206.33 × 36, tracking 0.6 px | 206.33 × 36 | same |
| Hero heading | 34 px / lh 37.4 | 96 px / lh 101.76 / tracking −3.4987 px | — |
| Glass panel | — | fill `rgba(11,11,11,.7)` | outline present |

- **Gradient:** the primary button still paints `#EC4A44 → #E5352F → …`.
- **Shader background** (Home hero, 1440):
  - root `aria-hidden="true"` and `pointer-events: none`;
  - the canvas drew (opacity 1, width 1440 = 1× at DPR 1);
  - the poster loaded, with `loading="eager"`.
  - The WebGL logic files were not edited, and their tests pass unchanged.
- **Site pages** `/es/` and `/en/about/`:
  - `html` and the layout root are rgb(5, 5, 5);
  - the legacy pill and legacy control render with their v1 values.
- **Emitted rules** in `.output/public/_nuxt/*.css`:
  - `.rounded-legacy-control{border-radius:.75rem}`
  - `.text-legacy-pill{…clamp(.75rem,…);line-height:…1.2;letter-spacing:….054em;…500}`
  - `.py-legacy-pill-y{padding-block:.5625rem}`
  - `.gap-legacy-pill-gap{gap:.6875rem}`
  - `.rounded-legacy-panel{…clamp(1.125rem,…)}`, the same values as the v1 tokens.
  - The v2 `.text-pill` carries no line-height.
  - `@media (forced-colors:active){.borde-luz{outline:var(--borde-ancho) solid CanvasText;…}}` is present.
  - `.foco:focus-visible` is present.
- **Every class in the prerendered HTML has a matching rule.** The 3
  exceptions are pre-existing hook classes: `pill` in `ServicesTimeline` and
  the router's two `router-link-*` classes.
- **No `m1` in the site artefact.** The catalogue CSS still contains a few
  `--m1-*` utilities (e.g. `duration-(--m1-medio)`). Tailwind's source
  detection generates them from the text of `specs/…/tasks.md`, `docs/handoff/`
  and `docs/harness/progress/impl_m1_visual_foundation.md`. Nothing uses them.

### `grep -rniE "m1" app tests .storybook`

| Hit | Why it stays |
|---|---|
| `app/assets/css/global.css:782` `` `m1-red-400 #CF3147` of the `.pen` `` | A `.pen` source citation in a comment (the deliberately untokenised "rojo anterior"). |
| `app/assets/css/global.css:784` `` `$m1-brasa-500` `` | A `.pen` source citation in a comment (the button's `.pen` variable reference). |
| `app/shared/logic/shaderRenderer.ts:126,129` and `shaderRenderer.test.ts:63,107,117-119` | `gl.uniform1f`: the WebGL API name, not a version marker. |
| `app/features/forms/logic/countryOptions.test.ts:17` `'M1'` | Pre-existing test input: an invalid country code. Not a version marker. |
| `app/assets/icons/{arrow-right,paperclip,x}.svg`, `app/assets/social/linkedin.svg` | SVG path data (`m12`, `M13.234`, `m16`, `M18`, `M10.954`), not a version marker. |

There are no other hits. No v2 file name, identifier, token, utility, story
title, test name or CSS comment carries the marker.

## 8 · Left in place, and items for the leader

1. **`DotGrid`:** kept in `app/shared/ui/`; I was unsure (§ 3). The leader
   listed it as v1. Decide with Roberto whether v2 keeps the dotted paper
   under the spotlight. If it does not, move `DotGrid` to `legacy/` and
   revisit `CursorSpotlight`'s grid contract.
2. **`SocialIcon`:** kept, unsure (§ 3). It has v1 styling and a neutral
   function.
3. **`Lockup`, `Wordmark`:** kept as design-neutral. They still consume v1
   colour utilities until 43.
4. **`--radius-panel-sm`:** kept its name, because it does not collide. Only
   the colliding keys became `legacy-*`.
5. **Font stacks, curve and container:** the naming exceptions in § 4.2 are
   my choice of names. If Roberto prefers others, only the names in
   `global.css` and three tests/components change.
6. **Commit order to keep history:** see § 2.1.
7. **Unchanged on purpose:** `impl_m1_visual_foundation.md` and
   `review-42.md` still use the old names, because they record those cycles.
8. **Possible business rule:** "v1 stays visible in the catalogue under
   `Legacy v1/` until 47". It reads like one. It is already in the
   constitution, so I wrote nothing to `docs/business/`.
9. **No injected instructions** were found in any file read.

## Follow-up · Shared/UI quarantine (2026-11-01)

- **Mandate:** Roberto's 2026-11-01 extension to feature 42, recorded in the
  feature description and its second acceptance item. The spotlight effect
  (`CursorSpotlight` + `DotGrid`) is retired in v2, and `Shared/UI` holds only
  v2 components. This closes items 1–3 of § 8 above.
- **Scope:** paths, imports and story titles only. No logic, markup, class or
  value changed. The layout still mounts `DotGrid` + `CursorSpotlight`
  through `useCursorSpotlight`. Removing them is feature 43's job.
- **Git:** every move is a `git mv`, so all are staged renames (`R`/`RM`).
  The staging that already existed was left as it was. Nothing committed.

### Moves

| From | To | Files |
|---|---|---|
| `app/shared/ui/CursorSpotlight.*` | `app/shared/ui/legacy/` | vue, test, stories |
| `app/shared/ui/DotGrid.*` | `app/shared/ui/legacy/` | vue, test, stories |
| `app/shared/ui/Lockup.*` | `app/shared/ui/legacy/` | vue, test, stories |
| `app/shared/ui/Wordmark.*` | `app/shared/ui/legacy/` | vue, test, stories |
| `app/shared/ui/SocialIcon.*` | `app/shared/ui/legacy/` | vue, test, stories |
| `app/shared/logic/useCursorSpotlight.{ts,test.ts}` | `app/shared/logic/legacy/` (new folder) | logic + test |

**Logic and data**

- **`useCursorSpotlight`** is the only shared logic used by these components
  alone. Its only consumers are `app/layouts/default.vue` and the
  `CursorSpotlight` story. It was moved to `app/shared/logic/legacy/`, which
  mirrors `ui/legacy/`. The Vitest glob `app/shared/logic/**/*.test.ts`
  already covers the new folder.
- **No `app/shared/data/` or `app/shared/utils/` file** is used only by them.
- **Assets were not moved**, because they are not in `shared/`:
  - `app/assets/logo/logomark-on-ink.svg` (`Lockup`);
  - `app/assets/social/*.svg` (`SocialIcon`);
  - the dot-paper tokens in `global.css`.
- **`Lockup.vue`** keeps its relative `./Wordmark.vue` import. Both moved
  together, so it still resolves.

### Files where import paths changed

Only the path changed in each of these files:

- **Feature code:**
  - `app/layouts/default.vue`
  - `app/features/shell/ui/SiteNav.vue`
  - `app/features/shell/ui/SiteNav.test.ts`
  - `app/features/shell/ui/SiteFooter.vue`
  - `app/features/shell/ui/SiteFooter.test.ts`
  - `app/features/shell/ui/MobileMenu.vue`
  - `app/features/shell/ui/NotFoundContent.stories.ts`
  - `app/features/shell/data/types.ts` (type `SocialNetwork`)
- **Existing legacy file:** `app/shared/ui/legacy/SectionBackdrop.stories.ts`
- **Moved files** (their own `@/` imports, plus the paths that the
  `CursorSpotlight.test.ts` and `DotGrid.test.ts` `readFileSync` calls read
  from disk):
  - `legacy/CursorSpotlight.{test,stories}.ts`
  - `legacy/DotGrid.{test,stories}.ts`
  - `legacy/Lockup.{test,stories}.ts`
  - `legacy/Wordmark.{test,stories}.ts`
  - `legacy/SocialIcon.{test,stories}.ts`
  - `logic/legacy/useCursorSpotlight.test.ts`
- **Formatting:** `biome format --write` re-wrapped the two `SocialIcon`
  import lines, which the longer path had pushed past the line width.
- **Stale paths:** `grep` finds no remaining `shared/ui/{CursorSpotlight,DotGrid,Lockup,Wordmark,SocialIcon}`
  or `shared/logic/useCursorSpotlight` path in `app/`, `tests/` or `.storybook/`.

### Story titles

The `Shared/UI/{CursorSpotlight,DotGrid,Lockup,SocialIcon,Wordmark}` stories
are now `Legacy v1/Shared/UI/{same}`.

### Final listing of `app/shared/ui/` (outside `legacy/`)

- **Components:**
  - `GlassButton`
  - `GlassSurface`
  - `Heading`
  - `Pill`
  - `PrimaryButton`
  - `RotatingPill`
  - `ShaderBackground`

  Each has a `.vue`, `.test.ts` and `.stories.ts`.
- **`tokens.stories.ts`:** this is the v2 token catalogue, titled
  `Foundations/Tokens`, not a component. The previous cycle placed it here
  (§ 5.1). It is v2 and outside `Shared/UI`, so I left it. If the leader
  wants only component files here, it could move to a foundations location.

### Final `Shared/UI` group in `storybook-static/index.json`

- **`Shared/UI`:**
  - `GlassButton`
  - `GlassSurface`
  - `Heading`
  - `Pill`
  - `PrimaryButton`
  - `RotatingPill`
  - `ShaderBackground`
- **`Legacy v1/Shared/UI`:**
  - `CursorSpotlight`
  - `DotGrid`
  - `GlassPanel`
  - `HeroStack`
  - `LinkArrow`
  - `Lockup`
  - `Pill`
  - `PrimaryButton`
  - `Radar`
  - `SectionBackdrop`
  - `SectionGlow`
  - `SocialIcon`
  - `Wordmark`
- **Titles:** 44 in total, all unique (the same count as before).

### Checks

**First `./init.sh` run:** exit 1. `pnpm check` failed only on the
formatting of the two `SocialIcon` import lines. They were formatted, and the
script was rerun.

**Final `./init.sh` run:**

| Step | Result |
|---|---|
| `pnpm typecheck` | OK |
| `pnpm check` | OK (327 files) |
| `pnpm test` | 113 files, 1699 tests, all passed (the same counts as before) |
| `pnpm generate` | OK |
| `pnpm storybook:build` | OK |
| exit | **0** |

- **Behaviour:** only paths changed, so behaviour is unchanged by
  construction. The layout, nav, footer, mobile-menu, spotlight and
  static-output tests all pass unchanged.
- **Not done this cycle:** no new headless-browser measurement.
- **Lock and processes:** no lock conflict occurred, and I killed no
  processes.
- **Injected instructions:** none found in the files read.
