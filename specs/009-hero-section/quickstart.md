# Quickstart: Hero section

**Feature**: `specs/009-hero-section` | **Date**: 2026-09-07

How to build this, in the order that keeps every gate green, and how to prove
the three things Vitest cannot.

---

## Read first, in this order

1. `spec.md` § *Clarifications* — the three decisions, and what a visitor sees
   today because of them.
2. `research.md` §§ R1, R3, R4 — the `@theme inline` trap, why the glows carry
   a `translate`, and where the three anchors come from.
3. `app/shared/ui/SectionBackdrop.vue`'s doc comment — the section contract.
   **This feature is the first thing it governs.** Read it in the file, not
   summarised.
4. `data-model.md` §§ 2, 3 — the exact token values and glow anchors.

---

## The one thing most likely to go wrong

**A stacking context, anywhere between a glow and the layout root, moves the
glows above the dot sheet — silently.** No error, no failing test, no console
warning. The page just stops looking like the design.

The forbidden set, on the section and on everything the Hero puts under it:

```
transform  translate  scale  rotate  filter  backdrop-filter
opacity < 1  isolation  will-change  contain: paint
position: fixed  position: sticky (with a z-index)
```

The **one** exception, and it is written into the contract: a `translate` on
an individual `<SectionGlow>` is fine, because the context it creates contains
only that glow's own empty subtree. The three `-translate-x-1/2
-translate-y-1/2` pairs are that exception and the only transforms in the
feature.

Second most likely: a token named `--spacing-glow-…`. That namespace is closed
and `SectionGlow.test.ts` asserts it in both directions, so the red suite
appears in a file you never opened (`rules.md` § R36). Every token here is
`--hero-*` or `--spacing-hero-*`.

---

## Build order

### 1 · Tokens

Add all twelve to `@theme inline` (`data-model.md` § 2). **Nothing goes in the
hand-written `:root` block**: no token here derives from another, so
`rules.md` § R46 does not bind this feature. If you ever find yourself wanting
a token whose value references another `@theme inline` name, stop and read
§ R46 — it resolves to nothing in the site build and the catalogue will not
tell you.

Comment each with the two frame values it interpolates, the way every
neighbouring token in that file already is. For the six glow anchors, say in
the comment that **only the two endpoints are design-sourced** and the
interpolation between them is a smoothing choice — otherwise the next reader
will take a value at 900px for something Clau drew.

### 2 · Copy

Five keys under `landing.hero.*` in both locale files
(`data-model.md` § 1.1). The eyebrow is **identical** in both — that is
deliberate, verified in all four frames, and a test will hold it that way.

### 3 · The module

`data/` → `logic/` → `ui/` → `index.ts`, in that order; each layer compiles
before the next one needs it. Signatures in `contracts/components.md`.

### 4 · The page

`app/pages/index.vue` becomes a thin wrapper. Its placeholder `<h1>` goes —
the Hero's headline is the page's `<h1>` and a page has one.

### 5 · Tests and the story

`vitest.config.ts` already collects both locations this feature writes to
(`app/features/**/*.test.ts` and `tests/**/*.test.ts`), so **no `include`
change is needed**. Still see each new file fail on purpose once before
writing its real assertions — a test file that has never been seen red has not
been shown to run (`rules.md` § R39).

Any test that asserts on the **content** of a locale file reads it from disk
with `readFileSync` + `JSON.parse`. Importing it yields a compiled message AST
and the assertion passes on any input at all (`rules.md` § R27). Build the
path with `node:path` and `process.cwd()`, never `new URL` — the global
environment is `happy-dom` and its `URL` is not one `node:fs` accepts.

---

## Verifying what tests cannot

Three claims are properties of a rendered document. Measure them against
`.output/public` after `pnpm generate`, with the DevTools-protocol method
`rules.md` § R44 records — **never** a headless `--window-size`, which § R34
proved does not fix the layout viewport and produces images that look exactly
like an overflow bug.

### A · Paint order, on the page (FR-028, SC-006)

Fix the viewport with `Emulation.setDeviceMetricsOverride`, load `/es/`, and
read the computed `z-index` of four elements:

| Expected | Element |
|---|---|
| `-3` | the Hero's `SectionBackdrop` |
| `-2` | the page-wide dot sheet |
| `-1` | the cursor spotlight (after one mouse event) |
| `auto` | the Hero's content |

This is what closes feature 8's first declared limit — its `-3` was measured
in the built catalogue, because no page rendered a section. Record the four
numbers; "it looks right" is not the deliverable.

Also confirm on the same load that the Hero section's computed style shows
none of the forbidden properties and no background colour of its own.

### B · The page scrolls with nothing injected (SC-009)

At 1440×900 and at 390×844, `document.documentElement.scrollHeight` must
exceed the viewport height **with no spacer added**. Then park the pointer,
scroll, and confirm the spotlight stays under it and its lit dots stay
registered with the grid. That closes feature 8's second declared limit, whose
scroll case needed a 3000px spacer because no page was taller than a viewport.

Expected, and worth checking your numbers against: **1176px at 1440**
(nav 103 + hero 673 + footer 400) and **1127px at 390**
(nav 76 + hero 474 + footer 577).

### C · No horizontal scrollbar, 320 → 2560 (SC-008)

`documentElement.scrollWidth` against `clientWidth` at each width. Two of the
three glows extend past the page edge by design; the layout root's
`overflow-x: clip` is what absorbs them, and this confirms it still does with
real glows in place rather than none.

### D · The tokens survived the build (research.md § R1)

```
grep -o 'left:[^;]*80\.381vw' .output/public/_nuxt/*.css
grep -o 'top:[^;]*-6\.5696rem' .output/public/_nuxt/*.css
grep -o 'padding-top:[^;]*12\.6667vw' .output/public/_nuxt/*.css
```

On the **site** build. The catalogue's content scan reaches `specs/` and
`docs/`, so it emits theme variables the site never does and cannot detect
this class of mistake (`rules.md` § R18).

---

## Before declaring done

- [ ] `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`,
      `pnpm storybook:build` — all five green.
- [ ] `git diff --stat` shows **zero** lines changed in `SectionGlow.vue`,
      `SectionBackdrop.vue`, `DotGrid.vue`, `Pill.vue`, `BotonPrimario.vue`,
      `LinkArrow.vue`, `app/layouts/default.vue` and anything under
      `app/features/shell/`.
- [ ] `SectionGlow.test.ts` passes **unmodified** — proof no token landed in
      its namespace.
- [ ] The generated HTML contains no `<a>` without an `href` (the existing
      suite asserts it) and no fragment emitted by the Hero.
- [ ] The nav height was **measured on the built page** and agrees with the
      frame (103 desktop / 76 mobile). This is now a check, not the source of
      the number — record what you measured either way.
- [ ] The three glow **centres** were measured at 390 and 1440 and land on the
      design's page coordinates: 410,50 / 40,140 / 440,520 at 390 and
      1310,290 / 130,310 / 1430,870 at 1440. This is the assertion that would
      have caught the derivation this spec had to correct (D-06).
- [ ] Anything discovered along the way is appended to
      `docs/business/rules.md`, citing feature 9 — appended, never
      overwriting.

---

## The nav CTA reveal (added 2026-09-07)

**The single most likely defect is a fade on every Nosotros page load.** It
cannot happen if the button's server-rendered state and its first client state
are the same visible one — a CSS transition needs a change to run. If you find
yourself reaching for a duration of zero or a "no animation on mount" flag, the
initial state is wrong; fix that instead.

**The second is a flash on the landing.** The button must ship **hidden in the
HTML**, which is why the route predicate is evaluated in `logic/` (identical on
server and client) rather than in `onMounted`. The no-scripting path is the
`<noscript>` override, not a reversal of the initial state.

Verify, at 1440 on the generated artefact and with the § R44 method:

- [ ] Landing at scroll 0: the CTA is absent from the rendered nav **and** the
      generated HTML carries it hidden.
- [ ] Scroll past the Hero: it fades in. Scroll back: it fades out.
- [ ] Nosotros: present on first paint, and no transition ran.
- [ ] Scripting disabled (`Emulation.setScriptExecutionDisabled`): visible on
      all four documents.
- [ ] `prefers-reduced-motion: reduce`: still appears and disappears, no fade.
- [ ] Hidden state is not reachable by Tab.
- [ ] 390px: nothing to see — the nav has no CTA there.
- [ ] The nav's own height, background and opacity are identical before and
      after scrolling.
