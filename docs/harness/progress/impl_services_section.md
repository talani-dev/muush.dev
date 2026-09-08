# Feature 014 · `services_section` — implementation report

Status left **`in_progress`**; nothing committed. `./init.sh` exits **0** — 41 files / **519 tests** (baseline 35/455). Zero changed lines in `SectionGlow`/`SectionBackdrop`/`DotGrid`/`Radar`/`Pill`, `Purpose*`/`Hero*`, `features/shell/`, `layouts/` (`git diff --stat` confirms); only `pages/index.vue`, `global.css`, both locale files and two test files touched outside `landing/`.

**Built** `data/servicesContent.ts` (+ `connectorEndpoints` pure fn, unit-tested) · `logic/{useServicesContent,useServicesLyrics}.ts` · `ui/{ServiceItem,ServicesConstellation,ServicesTimeline,ServicesSection}.vue` · 6 test files · 1 story · 38 tokens (28 `:root` + 10 theme) · 13 i18n keys/locale · 3 lines in `pages/index.vue`.

## Measured in Chrome (CDP, `.output/public`, both viewports)

Paint order: backdrop **-3**, dots **-2**, content **auto** — exact R37 match, section `position:relative`, `background: transparent`. Both glow centres exact against the design: `wine-300` **1390,630** (D) / **436,986** (M); `wine-400` **50,970** (D) / **36,1346** (M). Four connector `<line>` attributes match the five confirmed centres to the integer; rendered bboxes (280×130, 260×240, 260×190, 200×230) match the *generated* bbox column exactly. Radar x-centres exact (150/430/690/950/1150); y-centres are frame-y **+101** (the section's own inherited top padding applied before the canvas's frame-relative offsets) — same two-coordinate-system split Propósito already used for its Pill. Canvas measures exactly **1280×910**. No horizontal overflow across 320–2560.

**Lyrics, scripted scroll**: y=0/300 → all 5 at opacity 1, no `data-lyrics` (Servicios not yet in view) · y=600/900 → item0 active/item1 near/rest far · y=1200 → item1 active, re-bucketed. `prefers-reduced-motion: reduce` → all 5 at opacity 1 regardless of scroll.

**Bug found only by measuring, fixed**: the observer's first callback ties every ratio at 0 before any item is visible; without a guard, item 1 won the tie and items 2–5 dimmed on page load before the visitor ever scrolled near the section. `useServicesLyrics` now no-ops while every ratio is 0 (unit-tested).

## Deviations from the spec package (documented in code, not silent)

1. **Connectors are bound SVG attributes, not the CSS custom-property approach `data-model.md` § 4.1 specified.** Biome's `noUnknownProperty` correctly rejects `x1/y1/x2/y2` as CSS declarations. `connectorEndpoints(SERVICE_NODE_CENTRES)` binds them instead — still generated, never four literal shapes (FR-008 holds).
2. `--services-pill-m-w/-h` dropped: `Pill.vue` self-sizes, no consumer existed.
3. `--services-closer-m-w` moved to `@theme inline` (consumed as `w-*`, not hand-written CSS).
4. Both compositions gained `eyebrow` + `deliveryLabel` props beyond `data-model.md` § 5's stated interface: the delivery closer needs its own "Delivery" Pill label (confirmed in `design-extract.md` § 3's Pill catalogue), distinct from the section eyebrow — the data model's `SERVICES_KEYS` hadn't included it.
5. `useServicesLyrics` takes the items' **container** (mirrors `usePurposeCarousel`'s track), not five per-item refs — avoids Vue's array-ref-collection needing a compiled template.

## Contradictions found — reported, not resolved

`content.md` excludes Servicios from the nav; the pending redesign (feature 21) adds it per the leader's `.pen` read. `design-extract.md` § 2 says lyrics opacities 0.18/0.45/1; `ui-map.md` § 5 and `feature_list.json` say 22%/45%/100% — shipped **22%**, matching the two that agree.

## Open values (all seeded, none resolved here)

O-01 five Spanish names (English placeholder, both locales) · O-02 connector stroke (bone-100 24%/1px) · O-03 mobile top padding (55px, still blocked on feature 13's own O-05) · O-04 lyrics duration/thresholds (0.3s, `[0,0.5,1]`). Leftover to feature 15: **110px** desktop; mobile blocked on O-03.

## Not verified

Storybook's static story cannot show the lyrics effect scrolling (needs a live `IntersectionObserver`) — documented in the story's own comment.
