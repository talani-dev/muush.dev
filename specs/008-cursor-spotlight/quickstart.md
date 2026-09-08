# Quickstart: Cursor spotlight

**Feature**: `specs/008-cursor-spotlight` | **Date**: 2026-09-07

How to verify this feature is real, in the order that fails fastest. The
effect is invisible to the test suite — `happy-dom` neither styles nor paints
— so §§ 3-6 are not optional extras, they **are** the verification
(`research.md` § R8).

---

## 1 · The test config actually runs the new test (do this first)

`vitest.config.ts`'s `include` covers `tests/**`, `app/shared/ui/**` and
`app/features/**`. It does **not** cover `app/shared/logic/**`, so
`useCursorSpotlight.test.ts` would silently never run and would report as
green by not existing (`rules.md` § R16).

Prove the extension before trusting it:

```sh
# 1. add app/shared/logic/**/*.test.ts to `include`
# 2. write ONE deliberately failing assertion in the new test file
pnpm test 2>&1 | grep -c "useCursorSpotlight"   # must be > 0, and the run must FAIL
# 3. only then write the real assertions
```

A test file that has never been seen failing has not been shown to run.

---

## 2 · The five gates

```sh
pnpm check          # Biome, --error-on-warnings
pnpm typecheck
pnpm test           # rebuilds the site in globalSetup, then asserts the artefact
pnpm generate
pnpm storybook:build
```

All five must pass, and **no existing test may be modified to make them pass**
(SC-012). The one edit to an existing test file is additive assertions in
`tests/static-output.test.ts`.

Two suites are worth watching by name:

| Suite | Why |
|---|---|
| `SectionGlow.test.ts` | fails the moment a new token begins `--color-glow-` or `--spacing-glow-` (`research.md` § R5). It must pass **unmodified** |
| `DotGrid.test.ts` / `SectionBackdrop.test.ts` | assert the token *names* of the layer levels, not their values, so renumbering must not touch them |

---

## 3 · The artifact — the no-JS fallback, mechanically

After `pnpm generate`:

```sh
grep -rc "cursor-spotlight" .output/public/es/index.html \
                            .output/public/en/index.html \
                            .output/public/es/nosotros/index.html \
                            .output/public/en/about/index.html
```

| Check | Expected |
|---|---|
| the class name in any prerendered document | **zero** occurrences, all four routes (FR-012, SC-003) |
| the emitted CSS | contains the spotlight rules — the styles ship, only the element does not |
| the page with scripting disabled | base + glows + dots, identical to feature 6, nothing missing |

The element is absent because `isActive` is `false` on the server and until
the first mouse event — the fallback is a consequence of the design, not a
promise (`research.md` § R7).

---

## 4 · The browser — what only eyes and the inspector can settle

`pnpm dev`, open `/es/`, and with a real mouse:

| Check | Expected | Why it matters |
|---|---|---|
| The light follows the pointer | centred on the cursor, across sections, the footer and the gutters | FR-005 |
| **The dots inside the radius** | brighter and more distinct than outside, **on the same grid** | FR-006 — the whole hard half of the feature |
| The boundary of the radius | no doubled dot, no half-step dot, no hard circular edge in the paper | a registration bug shows here first |
| Hold the pointer still and scroll | light stays under the cursor, lit dots stay registered | FR-005, spec A-05 |
| Move the pointer to the very bottom of the page | the page does **not** grow | FR-019 — check `document.documentElement.scrollHeight` before and after |
| Move the pointer off the window | the light fades out rather than freezing | spec A-07 |
| Reload without moving the mouse | **no** red blob in the top-left corner | spec A-07 |
| Select text, click a link, open the mobile menu | unchanged in every way | FR-015 |

Then confirm `mod()` resolved, because an unsupported function invalidates the
whole declaration silently (`research.md` § R3):

```js
getComputedStyle(document.querySelector('.cursor-spotlight__lit')).transform
// a matrix, never "none"
```

And confirm the paint order, measured rather than eyeballed — through a
same-width iframe, never a headless screenshot (`rules.md` § R34):

```text
section backdrops  z-index -3
dot sheet          z-index -2
spotlight root     z-index -1
content            auto
```

## 5 · The frame budget (spec A-11 — a measurement, not an assumption)

With DevTools' performance panel recording, move the pointer continuously for
five seconds over a full-length page, then read the trace:

| Check | Expected |
|---|---|
| Updates per frame | **at most one**, no matter the mouse's polling rate (FR-020) |
| `Layout` / `Recalculate Layout` attributable to the spotlight | **zero** |
| `Paint` of the spotlight's own layers | **zero** — style and composite only |
| Scroll | never blocked; the listeners are passive |

If paint appears every frame, the likely cause is a mask or a
`background-position` that took a custom property — see `research.md` § R2 for
why that structure was avoided.

## 6 · The catalogue

```sh
pnpm storybook:build && open storybook-static/index.html
```

| Story | Expected |
|---|---|
| **Pinned** | the complete recipe at a fixed position over the real dot sheet on the real ink base, with **no** pointer involved and **no** Nuxt runtime (FR-022, SC-011) |
| **Live** | follows the pointer over the composed background, exactly as on the site |
| Both | render in Poppins / Instrument Sans, not a system fallback (feature 6, § R30) |

Compare the pinned story against frame `gViAx`'s `Estado 2`: same falloff, same
core, same edge.

---

## 7 · The three off-states

| State | How to reach it | Expected |
|---|---|---|
| Touch pointer | DevTools device emulation, or a real phone | no element, no listener (SC-004) |
| Reduced motion | DevTools → Rendering → *Emulate CSS `prefers-reduced-motion`* | no element, no listener — and the background exactly as feature 6 renders it (FR-011) |
| No JavaScript | disable scripting and reload | § 3 above |

Then the live half of FR-013: with the page open, toggle the reduced-motion
emulation. The effect must stop and start **without a reload**.
