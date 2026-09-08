# Research: Hero section

**Feature**: `specs/009-hero-section` | **Date**: 2026-09-07

Seven questions had to be answered before the plan could commit to an
approach. Five were resolved by running something and reading the result; two
by reading this repository. Each entry records the decision, why, and what was
rejected.

Nothing here was verified against the `.pen` — the Pencil bridge does not
exist in a subagent session (`rules.md` § R32). Design values come from the
leader's frame reading, quoted in `spec.md` § *Measurement provenance*.

---

## R1 · A theme token that references another theme token breaks in the site build

**Question**: the Hero needs a glow anchor expressed as "20px above the
content stack's top edge", i.e. one token derived from another. Can a
`@theme inline` token reference another `@theme inline` token?

**Answer: no, and the failure is silent.** `rules.md` § R18 established that
`@theme inline` substitutes a token's **value text** into each utility instead
of emitting a custom property, so a `--color-*` / `--spacing-*` theme name
resolves to nothing in the site's emitted CSS. A theme token whose value is
`var(--spacing-hero-top)` therefore emits `top: calc(var(--spacing-hero-top) -
1.25rem)` against a property that `:root` never declares — and the whole
`calc()` becomes invalid, moving the glow to `top: auto`. Nothing errors.

§ R18 also warns that **the catalogue cannot detect this**: Storybook's content
scan reaches `specs/` and `docs/`, so it emits theme variables the site never
does, and a broken token can look fine there.

**Decision**: raw derivable geometry is declared in the hand-written `:root`
block; `@theme inline` references it. That is exactly the pattern the colour
ramps already use (`--red-400` in `:root`, `--color-red-400: var(--red-400)`
in the theme block).

```css
:root  { --hero-top: clamp(4.625rem, 1.5375rem + 12.6667vw, 12.9375rem); }
@theme inline {
  --spacing-hero-top:          var(--hero-top);
  --spacing-hero-glow-foco-y:  calc(var(--hero-top) - 1.25rem);
}
```

**Verified** by compiling that exact shape with the repository's own Tailwind
(4.3.3) through its Node API: the utility emits
`top: calc(var(--hero-top) - 1.25rem)`, and the `:root` declaration of
`--hero-top` **is** emitted alongside it. The reference resolves.

**Verification is on the site build, not the catalogue** — a grep of
`.output/public/_nuxt/*.css` for `--hero-top`, per §§ R18, R25 and R31, which
all say the same thing: ask what file was written.

**Rejected**: repeating the clamp verbatim in each dependent token (three
copies of one measurement, guaranteed to drift — Article VIII); and computing
the offsets in the component with arbitrary values (Article VII).

> **Postscript, 2026-09-07 — this feature no longer triggers the trap, and the
> rule still stands.** The corrected glow anchors (§ R4) are six independent
> `clamp()`s measured from the section's own corner; not one of them derives
> from another token, so all twelve of this feature's tokens live in
> `@theme inline` and **nothing is added to `:root`**. The finding was
> verified before it stopped being needed, it is real, and the next section to
> want a derived value will hit it — which is why it is recorded in
> `rules.md` § R46 rather than only here. Tying `wine`'s vertical anchor to
> the section's top padding, as the first draft did, would have been wrong on
> its own terms anyway: the two coincide at 1440 (both 207) and differ at 390
> (64 against 74).

---

## R2 · Tailwind v4 resolves named `--spacing-*` keys in `top-*`, `left-*` and `max-w-*`

**Question**: `size-glow-1500-700` proves the spacing namespace drives
`size-*`, but the Hero needs to position with `top-*` / `left-*` and cap with
`max-w-*`. Do those read named keys, or only numeric multiples of the base
spacing unit?

**Answer: they read named keys, and they pass percentages, `calc()`, `var()`
and `clamp()` through unchanged.** Compiled with `tailwindcss@4.3.3`'s Node
API against a theme block shaped like the one this feature adds:

| Candidate | Token value | Emitted |
|---|---|---|
| `top-a-plain` | `12.95rem` | `top: 12.95rem` |
| `top-b-pct` | `96.094%` | `top: 96.094%` |
| `top-c-calc` | `calc(100% + 5.875rem)` | `top: calc(100% + 5.875rem)` |
| `top-d-var` | `calc(var(--hero-top) - 1.25rem)` | `top: calc(var(--hero-top) - 1.25rem)` |
| `top-e-clamp` | a `clamp()` | passed through |
| `left-c-calc`, `left-d-var` | as above | `left: …` |
| `pt-e-clamp`, `gap-e-clamp` | a `clamp()` | `padding-top: …`, `gap: …` |
| `max-w-a-plain`, `size-a-plain` | `12.95rem` | `max-width: …`, `width`+`height` |
| `top-hero-glow-foco-y` | `clamp(-1.625rem, -6.5696rem + 20.2857vw, 11.6875rem)` | passed through — **a `clamp()` with a negative lower bound is fine**, which `foco`'s mobile anchor needs |

**Decision**: position and cap with plain utilities. No arbitrary values, no
inline `style` binding, no scoped stylesheet in the component.

**Fallback, recorded and not needed**: had a named key not resolved, the glows
would have carried a class each and a `<style scoped>` block reading the
`:root` names — the `DotGrid.vue` / `CursorSpotlight.vue` pattern. It is worse
only because it moves three positions out of the template.

**Also confirmed in the same run**: `-translate-x-1/2` emits the `translate`
property (`translate: var(--tw-translate-x) var(--tw-translate-y)`), not a
`transform` shorthand. Both create a stacking context, and both are permitted
on an individual glow — see R3.

---

## R3 · Centring a glow with `translate` is allowed; anything above it is not

**Question**: FR-025 forbids `transform` and `translate` in the Hero's
subtree, because either would trap the glows above the page-wide dot sheet.
Centring a glow on its anchor needs exactly one of them.

**Answer**: `SectionBackdrop.vue`'s own doc comment settles it — *"A transform
on an individual `<SectionGlow>` is fine — it creates a stacking context only
for its own, empty, subtree."* A glow has no children, so the context it
creates contains nothing; the backdrop that holds it still paints at
`--layer-glow` relative to the section.

**Decision**: `-translate-x-1/2 -translate-y-1/2` on each of the three glows,
and on nothing else in the feature.

**Why centre-anchoring rather than the design's top-left**: the glow's
diameter is itself a `clamp()` that interpolates between the frames. Anchored
by its top-left corner, a glow's centre would drift as the diameter changed,
so the composition would only be right at exactly 1440px. Anchored by its
centre, the glow grows around its anchor and the composition holds at every
width.

**Rejected**: negative margins sized from the diameter token (would need an
arbitrary `calc()` per glow and reintroduces the literal Article VII bans);
and shipping the design's top-left offsets unconverted (drifts with the size
token, and violates § R29 besides).

---

## R4 · Converting the design's glow coordinates — two measured sets, not one

> **Rewritten 2026-09-07.** The first version of this section had only the
> desktop frame and derived the mobile positions from it. The leader then read
> the mobile frames and the derivation was **wrong** (spec D-06). Both the
> corrected method and the disproved one are kept below, because the disproved
> one is the inference the next five sections are most likely to repeat.

**Question**: the design places each glow at an absolute offset inside a
1440x5060 page frame. `rules.md` § R29 and feature 6's A-13 require
section-relative anchors. What is the conversion?

### Step 1 — the centres, and the retired inference

The leader supplied measured **centres** for both viewports:

| Glow | Desktop centre | Mobile centre |
|---|---|---|
| `foco` | 1310, 290 | 410, 50 |
| `wine` | 130, 310 | 40, 140 |
| `cierre` | 1430, 870 | 440, 520 |

This spec had earlier derived the desktop centres from the page coordinates
(560,-460 / -420,-240 / 980,420) plus each radius, on the assumption that a
frame coordinate names a **top-left corner**. The measured centres match that
derivation exactly for all three glows, so the convention is now **confirmed**
rather than assumed — and, more usefully, no longer load-bearing: the centres
are read directly.

### Step 2 — the section's own box

The Hero renders inside `<main class="mx-auto max-w-shell-max px-page">`, and
the nav sits in normal flow above it. So the section's origin is the page
gutter horizontally and the nav's bottom edge vertically:

| | Desktop | Mobile |
|---|---|---|
| Section origin (page) | x 80, y 103 | x 24, y 76 |
| Section box | 1280 wide, 673 tall | 342 wide, 474 tall |

Subtracting the origin from each centre gives the six offsets this feature
ships:

| Glow | Desktop offset | Mobile offset |
|---|---|---|
| `foco` | 1230, 187 | 386, **-26** |
| `wine` | 50, 207 | 16, 64 |
| `cierre` | 1350, 767 | 416, 444 |

(`foco`'s mobile offset is negative because its centre sits 26px above the
section's top edge, behind the nav. That is the design.)

### Step 3 — interpolate between the two endpoints

Each of the six is a `clamp()` across the same 390 → 1440 range the whole
fluid scale uses. Values in `data-model.md` § 2, each verified to land on its
two endpoints exactly.

**Only the endpoints are design-sourced.** Every width in between is a
smoothing choice, taken so the section keeps the property that its single
breakpoint changes flex direction and never a position. Six position media
queries would jump the composition at 1024px instead of gliding it, in a
section that otherwise has one layout breakpoint.

### What was wrong, and why it looked right

The first version held each glow's horizontal centre at a **fixed fraction of
the section's width** — `foco` 96.094%, `wine` 3.906%, `cierre` 105.469% —
and anchored the vertical axis to section edges (`foco` 20px above the stack's
top, `wine` level with it, `cierre` `calc(100% + 94px)`).

It reproduced the desktop frame perfectly, because it was built from it. At
390px it predicts x at 374.8 / 15.2 / 411.3 where the design draws
**410 / 40 / 440** — out by 35, 25 and 29px. `cierre`'s vertical anchor fails
worse: `100% + 94px` puts it 94px *below* the section on both, but the mobile
frame draws it **30px above** the section's bottom edge.

Two things made the derivation look safe, and neither survived:

- **The mirror pair.** On desktop `foco` and `wine` sit at 0.90972 and 0.09028
  of the page width, summing to exactly 1. On mobile they sit at 1.0513 and
  0.1026. The symmetry is a desktop fact, not a system.
- **The proportional vertical.** `foco`'s centre is at 30.9% of the desktop
  section's height and **7.8%** of the mobile one.

**The glows are hand-placed per viewport.** That is consistent with what
`design-extract.md` § 10 already said about them — *"22 glows afinados a
mano"*, *"el posicionamiento es absoluto y distinto en las 22"* — which, read
carefully, was the warning. It is now `rules.md` § R48.

---

## R5 · The section's top padding

**Question**: the design places the Hero's first child at page y310 (desktop)
and y150 (mobile). The nav sits in normal flow above the Hero and the layout
gives `<main>` no top padding, so the Hero's own top padding is
`design y - nav height`. What is the nav's height?

**Answered twice, by two unrelated methods that agree.**

| | Desktop (1440) | Mobile (390) |
|---|---|---|
| **Frame-resolved** (leader, 2026-09-07) | **103** | **76** |
| Derived from this repository's tokens | 102.8 | 76.2 |
| — `py-nav-y` x 2 | 30 + 30 = 60 | 22 + 22 = 44 |
| — tallest row child | `BotonPrimario` `nav`: 13 + 13 + (14 x 1.2) = 42.8 | hamburger: 12 + 12 + (1.6 + 1.6 + 5) = 32.2 |
| **Hero top padding** | 310 - 103 = **207px** | 150 - 76 = **74px** |

```css
--spacing-hero-top: clamp(4.625rem, 1.5375rem + 12.6667vw, 12.9375rem);
```

Checked: 24.6 + 0.126667 x 1440 = 207.0 and 24.6 + 0.126667 x 390 = 74.0.

**The measurement task stays**, demoted from *source of the number* to *check
that the built page agrees with the frame*. Two of the four derivation inputs
are line-height products of a real font face, and this repository has been
wrong about a font before — feature 6 existed because every component up to it
had been reviewed in a fallback typeface. The check uses the DevTools-protocol
device-metrics override of `rules.md` § R44, never a headless `--window-size`,
which § R34 proved does not fix the layout viewport.

**Corroboration that the token mapping is right**: with the mapping this plan
chooses, the desktop stack computes to Pill 38 + gap 34 + headline 2 x 96.04 +
gap 34 + subhead 2 x 31.5 + gap 34 + CTA row (14 + 55.2) = **464.3px** against
the frame's **466**. A 1.7px agreement across seven independently derived
values is not a coincidence; it also tells the implementer that the headline
and the subhead are each expected to take **two lines** at 1440px.

**The section's extent is now known too**, and it is not the same as its
content: the design's Hero spans page y 0->940 (desktop) and 0->640 (mobile),
while the content stack ends at 776 / 550. The Hero declares **no bottom
padding** (FR-021), so the **164px / 90px** remainder belongs to `02
Propósito`'s own top offset — the convention `app/layouts/default.vue` already
states for the footer. Recorded because Propósito's feature needs it.

**Rejected**: hard-coding the design's page offsets as the section's
`margin-top` (breaks the moment the nav's height changes, e.g. if
`decisions-open.md` #5 makes it sticky or compressed); and asking the layout
for a top padding (edits a file this feature must not touch, and would apply
to the About page too).

---

## R6 · Modelling two absent destinations without importing the shell

**Question**: `shell` already has a `ShellDestination` discriminated union
with a `kind: 'none'` member and a resolver that turns a route name plus a
hash into a locale-correct href. The Hero needs the same two ideas. Article
III forbids importing another feature's internals — so: export it through the
shell's barrel, lift it to `app/shared/`, or re-express it?

**Answer: re-express it, minimally.** Article III's own words: *"Prefer
duplicating a small utility inside a feature over creating a premature shared
abstraction for a one-off need."* The Hero has **two** destinations, not
twelve, and neither exists yet.

```ts
interface HeroDestinations {
  /** Google Calendar booking link — decisions-open.md #2, owner Clau. */
  callUrl?: string
  /** The contact section's fragment — section 05 does not exist yet. */
  contactHash?: string
}

export const HERO_DESTINATIONS: HeroDestinations = {}
```

An **empty object** rather than two `undefined` constants: adding a key is the
whole change, the type states which two keys exist and nothing else, and there
is no control-flow narrowing puzzle for a `const` initialised to `undefined`.

`logic/useHeroContent.ts` resolves `contactHash` into a locale-correct path
with `useLocalePath()` when it is present, mirroring how the shell resolves
its own anchors — same idea, ten lines, no cross-feature import. Should a
third feature ever need the same model, *that* is when it moves to
`app/shared/`, with three consumers to shape it.

**Rejected**: widening `app/features/shell/index.ts` to export `SHELL_ANCHORS`
and `ShellDestination` (couples the landing to the shell's content model to
borrow one string, and grows a `done` module's public surface); and creating
`app/shared/data/destinations.ts` now (a shared abstraction designed from one
consumer, which Article VIII names as over-engineering).

---

## R7 · Why the secondary CTA is not a `LinkArrow` today, and why the arrow leaves the copy

**Question**: the `.pen` writes the label as `Agenda una llamada →`. Should
the i18n string carry the glyph?

**Answer: no.** `design-extract.md` § 7 and `ui-map.md` § 3 make the hover
"subrayado o desplazamiento de la flecha", and `LinkArrow.vue` already owns
the glyph for exactly that reason — its doc comment says so. A glyph inside
the string cannot be animated, and the day the control goes live it would
render **twice**. The baked-in arrow is a drawing convention of a static
mockup, the same class of thing as `rules.md` § R38: a mockup cannot draw a
behaviour, so what it draws instead is not a copy decision.

**But `LinkArrow` requires an `href`,** and there is none
(`decisions-open.md` #2). So today the `v-else` branch renders: a `<span>` in
`ink-300`, no anchor element, no pointer, no hover — the identical treatment
`FooterColumn.vue` gives the identical phrase in the footer's Contacto column,
and the rendering `ui-map.md` § 3's "deshabilitado" asks for.

**And no arrow in that state.** Two reasons, and the second is the stronger:
an arrow is an affordance for going somewhere, and this goes nowhere; and the
same phrase already renders arrow-less, in the same grey, in the footer of
every page — so the site says one thing about that control rather than two.

**Consequence, stated plainly (spec D-01)**: the frames draw this control live,
in `bone-100`, and the site will show it grey. That is a visible deviation
from the design, taken because `ui-map.md` explicitly forbids the alternative,
and it costs one data value to reverse.

**Rejected**: hiding the control entirely (also permitted by `ui-map.md` — "u
oculto" — but it deletes a child the frames draw, changes the CTA row's whole
shape, and makes the section's height wrong in both viewports); duplicating
`LinkArrow`'s arrow markup into the dead branch (two copies of one glyph, and
a dead affordance); and adding a "no destination" state to `LinkArrow`
(reopens a `done` contract to serve one caller).

---

## Cross-cutting: what could still go wrong, and where it would show

| Risk | How it fails | Caught by |
|---|---|---|
| A `--spacing-hero-glow-*` token mistaken for `--spacing-glow-*` | `SectionGlow.test.ts` goes red in a file this feature never opened (`rules.md` § R36) | Running that suite unmodified — a task |
| A theme token referencing a theme token | Glow lands at `top: auto`; **catalogue looks fine** (§ R18) | Grep of `.output/public/_nuxt/*.css` — a task |
| A stacking context slipping into the subtree | Glows paint **above** the dots; no error, no failing test (§ R28) | Measuring the four levels on the generated page — a task |
| Mobile glow offsets wrong | Nothing fails; the mobile page simply is not the design | **This already happened once** — the first draft inferred them from desktop and was out by up to 35px. Caught only by the leader reading the frames (§ R4, spec D-06). Both endpoints are now measured; a task checks the rendered centres against them at 390 and 1440 |
| Nav height mis-derived | The whole Hero sits a few px off | Frame-confirmed at 103 / 76 (§ R5); the browser measurement is now a check, not the source |
| A new test file in an uncollected directory | Reports green **by never running** (§ R39) | `vitest.config.ts` already covers both locations; still, see each file red once |

---

## R8 · The nav CTA reveal — two mechanism choices (added 2026-09-07)

### Pin the nav with `sticky`, not `fixed`

Both satisfy `ui-map.md` § 2, and the decision it replaces literally asked
"si el nav es fijo **al hacer scroll**".

`sticky` keeps the nav **in normal flow**, which matters twice and neither is
cosmetic: `<main>` needs no compensating top padding, and `rules.md` § R49 —
*every section's top padding is `design y − nav height`* — stays true. `fixed`
removes the nav from flow, so the Hero's confirmed 207 / 74 would silently
become wrong by a nav height, and correcting it would mean a duplicated
nav-height token free to drift from the nav it claims to measure. That is a
new source of truth for a number the design already fixes.

**Both** need an explicit level. The nav is a positioned element either way,
and the Hero section is `position: relative` **later in the document**, so
without one the Hero paints over the nav. Hence `--layer-nav`, a **new**
positive token; the three negative levels the background depends on are not
touched, and the nav is neither a section nor an ancestor of one, so
`rules.md` §§ R28/R37 are unaffected.

Verified in the repository: `MobileMenu` is rendered *inside* `<nav>`, and its
full-screen panel is `fixed`. A `sticky` ancestor does not become a containing
block for a fixed descendant (unlike `transform`), so the panel still covers
the viewport.

### `IntersectionObserver`, not a scroll threshold

The observer states the requirement directly — "while the Hero is in view" —
fires only on change, and reads **no geometry on a per-frame path**, which is
what `findings.md` § R41 measured the cost of. A scroll threshold would need
the Hero's height on load and on every resize plus a comparison per scroll
event, to compute an answer the platform already has.

It also degrades by construction rather than by a branch: a route with no Hero
never registers a sentinel, so the shared flag keeps its initial `true` and
the CTA is visible. Absence of a Hero is the default, not a case to handle.

The threshold is the plain default — the button appears once the Hero has left
the viewport entirely. If that reads late in review, a `rootMargin` equal to
the nav's height is the one-line adjustment, and it is the only knob.
