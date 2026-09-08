# Review · Feature 008 · `cursor_spotlight`

- **Branch**: `feat/cursor-spotlight`
- **Agent**: `reviewer`
- **Date**: 2026-09-07
- **Status at review time**: `reviewing` (confirmed in `feature_list.json`)

# REJECTED

**One required change, and it is a comment — not code.** Everything else is
green: all five gates, `./init.sh` exit 0, 24 files / 276 tests, every task
`[x]`, every acceptance criterion covered, no Constitution violation, and the
frozen contracts untouched. Deviations 1 and 3 are accepted on their merits.
Deviation 2 changed the right thing for a reason that is demonstrably false and
is now written into source as if it had been measured.

---

## What must change

1. **Correct the recorded justification for deviation 2** in
   `app/shared/ui/CursorSpotlight.vue` (the `.cursor-spotlight__beam` comment,
   lines ~94–100) and in `docs/harness/progress/impl_cursor_spotlight.md`
   (*Deviations* § 2).

   Both currently state that a `50%` fallback inside the `mod()` would
   *"silently invalidate the whole declaration"* / *"an invalid `mod()`
   invalidates the whole `transform`"*. **Measured in Chrome, that is false.**
   `mod()` accepts a percentage and the transform resolves normally.

   **The fallback change itself is correct and must stay** — but for the other
   reason the implementer also gives, which *is* verified: a percentage resolves
   against **each element's own box**, so the two halves disagree. Rewrite the
   comment to say that, and drop the invalidation claim.

No other change is required. Re-review should be cheap.

---

## Evidence for the required change

Forcing the contract's `50%` fallback in situ on the real component (inline, so
it beats the scoped selector's specificity), with `--spotlight-x/y` removed:

| Fallback | beam `transform` | lit `transform` |
|---|---|---|
| `var(--spotlight-outer-size)` (shipped) | `matrix(1,0,0,1,660,660)` | `matrix(1,0,0,1,-18,-18)` |
| `50%` (the contract's) | `matrix(1,0,0,1,330,330)` | `matrix(1,0,0,1,0,0)` |

Both are **valid matrices; neither is `none`.** And directly:

```
CSS.supports('transform','translate3d(calc(-1 * mod(calc(50% - 330px), 24px)), 0px, 0)')  →  true
```

So `mod()` with a percentage parses and resolves. What the `50%` fallback
actually breaks is agreement: the beam resolves `50%` against its own 660px box
(330) while the lit sheet resolves it against its own 756px box (378), so the
light and the lit dots part company and the second dot pattern misregisters.
The length fallback makes both halves resolve 660 and keeps them locked
(`(660−330) mod 24 = 18` ✓). The path is unreachable in production — `v-if`
requires a published position, and the Pinned story sets one — so this is a
latent-only concern, which is why the fix is a comment and not code.

---

## The three deviations, judged

### 1 · Caching the scroll offset instead of reading it in the rAF — **ACCEPTED, and the claim is sound**

`research.md` § R2 and T009 asked for `scrollX`/`scrollY` to be read inside the
frame, first, then written. The implementer says the ordering is irrelevant and
costs ~600 forced style updates over 5s, and cached the offset instead
(`rules.md` § R41).

**Independently reproduced.** My first attempt found nothing because I counted
the wrong trace event; the counter Chrome actually emits is
`Blink.ForcedStyleAndLayout.UpdateTime`. Counting it, over 5s of continuous
pointer movement on a scrollable page, normalised per dispatched event:

| Variant | forced / event | excess over baseline, per 5s |
|---|---|---|
| control, effect off | 1.0116 | — |
| rAF writes only (**what shipped**) | 1.0108 | **≈ 0** |
| rAF **read-then-write** (what § R2 asked for) | 1.0169 | **≈ 609** |
| rAF write-then-read | 1.0175 | ≈ 666 |

Read-then-write costs 609 and write-then-read 666 — **the ordering does not
rescue it**, exactly as claimed, and the magnitude matches the implementer's
"≈600" to within 2%. The baseline being ~1 per pointer event with the effect
*off* also confirms their reading that it is Chrome's own per-`mousemove` hit
test. This is a genuine, correctly reasoned, correctly recorded spec
correction. § R41 stands.

### 2 · Length fallback instead of `50%` — **change accepted, justification rejected**

See *What must change* above. Right fix, wrong recorded reason.

### 3 · Two-stop lit-sheet mask — **ACCEPTED, it satisfies FR-008**

FR-008: *"The lit dots MUST fade out over the same radius as the light, so the
two halves of the effect end together and no hard circular edge appears."*

Measured on the site:

- light, outer field: `circle closest-side` on a 660px box → **330px radius**
- mask: `radial-gradient(330px, rgb(0,0,0) 0px, rgba(0,0,0,0) 100%)` → **330px**

Same radius; both reach zero at the same place; no hard edge. FR-008 constrains
the **radius** and the **ending together**, not the curve — the implementer's
reading is correct. Matching the falloff would indeed have required a fourth
derived percentage with no source, which § R38 forbids inventing. The stated
consequence (lit dots fade slightly slower than the light between the mid stop
and the edge — normalised, mask 0.58 vs light 0.405 at 42%) is real, disclosed,
and correctly routed to Clau alongside A-03. Correct call.

---

## Claims re-verified rather than trusted

All of the following were re-measured by this reviewer, against
`.output/public` from a fresh `pnpm generate`, served over HTTP and driven with
my own CDP client written to a scratch directory outside the repository.

### The frozen files — **CONFIRMED**

`git diff master` is **empty** for `DotGrid.vue`, `SectionBackdrop.vue`,
`SectionGlow.vue`, `SectionGlow.test.ts`, `SectionGlow.stories.ts` and `i18n/`.
R37 kept both existing token names, so no consumer needed an edit. SC-007 ✓.

### R39, the false-green trap — **CONFIRMED, including falsifiability**

`vitest.config.ts` now includes `'app/shared/logic/**/*.test.ts'`. Running the
file alone reports **15 tests, all named and executed** — had the path not been
collected, Vitest would report no test files.

Passing is not enough, so I mutation-tested it: I broke the `pointerType`
guard and the rAF coalescing in `useCursorSpotlight.ts` and re-ran. **Two tests
failed** — *"should ignore a pointer event that did not come from a mouse"* and
*"should write exactly once when many pointer events arrive before a frame"*.
The file was restored byte-identical (md5 `0f6c24af322abae2901222d47feb628b`
before and after). These tests can fail, so their green means something.

### R36 — **CONFIRMED**

No added line in `global.css` matches `--(color|spacing)-glow-`. The spotlight
uses `--spotlight-*`. `SectionGlow.test.ts` is unmodified and passes.
SC-009 ✓.

### R37 — **CONFIRMED where it renders**

`--layer-glow: -3`, `--layer-dots: -2`, `--layer-spotlight: -1` in `global.css`,
and measured on the live site: spotlight root computes `z-index: -1`, the dot
sheet `-2`, content `auto`, host `position: relative` + `isolation: isolate`.
The relation holds. (Backdrop `-3` — see *Limits*.)

### R38 — **CONFIRMED**

`--dot-paper-lit-color: var(--dot-paper-color)` and
`--duration-spotlight-fade: 0.2s` are both named tokens, both carry a
`⚠️ UNVERIFIED — dueño: Clau` block, both record the derivation
(`1 − (1 − 0.12)² = 22.6%`) and neither is presented as design-sourced.

### The measurements

| Claim | Re-measured |
|---|---|
| Beam centred on the pointer | `matrix(1,0,0,1,700,400)` with the pointer at (700,400) ✓ |
| Three-stop outer field + core | `42% at 0 → 17% at 42% → transparent`, plus the 37% core ✓ |
| `mod()` resolves, never `none` | lit `matrix(1,0,0,1,-10,-22)`; `(700−330) mod 24 = 10`, `(400−330) mod 24 = 22` ✓ |
| **SC-002 · brighter *and* more distinct** | core: dot luma **91.9** on paper **62.6**, gap **29.3**; far outside: **60** on **38**, gap **22** ✓ |
| **SC-002 · no doubled dots** | 21 consecutive cells across the radius boundary: peak-to-peak spacing **exactly 24px every time**, phase offset **constant** ✓ |
| **SC-005 · zero layout, zero paint** | every shipped trace: `Layout: 0`, `Paint: 0`, style recalc ≈ one per frame ✓ |
| Listeners passive | all five attached `{ passive: true }` in source; scroll never blocked ✓ |
| **SC-006 · page does not grow** | `1440 × 3900` identical at the centre and all four extremes ✓ |
| **SC-001 · scroll** | pointer held still, `scrollY` 0/600/1500 → beam centre stays at viewport (700,400); page-y 400/1000/1900; lit registration correct at each ✓ |

Note on SC-002: my absolute luma differs from the report's (91.9/62.6 vs
84.1/55.1) because I sampled at a different page position over a different
local background, and I therefore did **not** reproduce the specific
`rgb(133, 43, 56)` pixel. The load-bearing numbers do match: the **gap** is
29.3 vs their 29.0, and the unlit baseline is identical at 60 on 38, gap 22.
The criterion — brighter **and** more distinct — is confirmed either way.

### The three off-states — **CONFIRMED**

| State | Spotlight els | Host `style` attr | Dot sheet | Base | Nav/footer |
|---|---|---|---|---|---|
| `prefers-reduced-motion: reduce` | **0** | **null** | present, `z-index: -2` | `rgb(38,38,38)` | present |
| touch (390×844, touch emulation) | **0** | **null** | present, `z-index: -2` | `rgb(38,38,38)` | present |
| scripting disabled | **0** | **null** | present, `z-index: -2` | `rgb(38,38,38)` | present |

Feature 6's background renders exactly as it does today in all three. The host
carries **no `style` attribute at all** — nothing of this feature is written
anywhere. SC-003, SC-004 ✓. `tests/static-output.test.ts` additionally asserts
zero spotlight markup in the `<body>` of all four prerendered routes.

### The CDP client left no trace — **CONFIRMED**

`git diff master -- package.json pnpm-lock.yaml` is empty: **no dependency
added**. `git status --untracked-files=all` shows no script, no profile
directory and no trace artifact anywhere in the repository. My own client was
likewise written only to the session scratchpad.

---

## Checkpoints

| | |
|---|---|
| **C1** harness complete, `./init.sh` exit 0 | ✅ |
| **C2** one feature in `reviewing`, none skipped a status | ✅ (only id 8) |
| **C3** architecture, barrels, import direction | ✅ (see observation 1) |
| **C4** no hex/px literal, no relative cross-dir import, no `server/api/`, `nitro.preset: 'static'`, `<script setup lang="ts">` | ✅ |
| **C5** logic tested, story per `ui/` component, tests green, generate + storybook build | ✅ |
| **C6** history + status | ✅ |
| **C7** spec/plan/tasks present, Phase −1 gates `[x]`, all tasks `[x]`, no `NEEDS CLARIFICATION` | ✅ |
| **C8** i18n parity, 50 keys both locales, zero added | ✅ |

Gates, run by me and not taken from the report:

```
Checked 102 files in 28ms. No fixes applied.   → pnpm check   exit 0
                                                → pnpm typecheck exit 0
Test Files  24 passed (24) · Tests 276 passed (276)
Prerendered 12 routes → .output/public
Storybook build completed successfully
./init.sh                                       → EXIT 0
```

Both stories are in the built catalogue: `shared-ui-cursorspotlight--pinned`
and `--live`. Pinned imports nothing from Nuxt and sets
`--spotlight-x: 900px; --spotlight-y: 180px` — frame `gViAx` `Estado 2`'s
centre exactly, per the spec's concentricity table. SC-011 ✓.

---

## The declared limits — judged, none blocking

- **`z-index: -3` measured in the catalogue, not the site.** Correct, and
  honestly stated: no page renders a `SectionBackdrop` yet. The site's own
  stack (`-2` dots / `-1` spotlight / `auto` content) is what I measured and it
  is right. The backdrop's level is exercised by `SectionBackdrop.test.ts` and
  by the catalogue. **Not blocking** — the first section feature will measure it
  in situ.
- **Scrolling needed an injected spacer.** Unavoidable; both stub pages are one
  viewport tall. The mechanism is what matters and it is what was measured — I
  reproduced it the same way and got the same answer. **Not blocking.**
- **One browser.** Acceptable to ship. `mod()`, `mask-image` and `overflow: clip`
  are all baseline in current Safari and Firefox (`research.md` § R3 cites
  Safari 15.4 / Firefox 118), the repository has no cross-browser harness, and
  the failure mode where `mod()` is unsupported is a **cosmetic** degradation of
  a decorative, desktop-only effect — doubled dots, no content lost, no
  interaction broken. The limitation is recorded in the impl report under
  *Limits of what was verified* and the fallback is written and costed in
  `research.md` § R3. **Not blocking**, but see observation 3.

---

## Observations — not blocking, for the leader

1. **`CursorSpotlight.vue` is 243 raw lines** against the Constitution's
   *"Components MUST stay under 200 lines; extract sub-components if they grow
   past that."* Effective (non-comment, non-blank) lines are **110**, and the
   excess is entirely documentation. The remedy clause shows the intent is
   structural complexity, and extracting sub-components here would be actively
   wrong — the four nested elements are one indivisible geometric mechanism
   whose custom-property inheritance chain would break if split. I do not treat
   this as a violation. Worth noting that `plan.md` line 111 answers
   *"Under 200 lines?"* with *"Yes — the component is ~90 lines"*, which the
   built file does not bear out.
2. **Scope respected.** Feature 7's `SectionGlow.vue` comment and dead `'920'`
   variant are untouched, as instructed. `ui-map.md` was correctly not edited;
   D-01 is routed to Clau in the impl report.
3. **Suggestion, not a requirement**: the `mod()` cross-browser risk lives only
   in the impl report and the spec package. If the leader wants it where the
   next agent will trip over it, `rules.md` is the durable home — the R40–R44
   block is already the right place.

---

## Outstanding for Clau (unchanged from the implementer's list, verified accurate)

| Item | Status |
|---|---|
| `--dot-paper-lit-color` (A-03, § R38) | UNVERIFIED, derived `22.6%`, token in front |
| `--duration-spotlight-fade` (A-08) | UNVERIFIED, `0.2s`, token in front |
| D-01 — `ui-map.md:270` omits the outer field's mid stop | Clau's; correctly not edited by this cycle |
| Mask falloff curve (deviation 3) | Travels with A-03 |

---

**Verdict: REJECTED** — one comment correction (item 1 above). The
implementation itself is sound, thoroughly measured, and the strongest evidence
discipline in the repository so far; two of its three unapproved deviations
survived independent verification, and the third is the right change carrying a
wrong reason. The status stays `reviewing`; moving it is the leader's call.
