# Feature 009 · Hero section — implementation

All 50 tasks `[x]`. `./init.sh` exits 0 — 27 test files, **325 tests** (was 24 / 276).
Status left at `in_progress`. Nothing committed.

T001–T004 were re-verified, not trusted: `vitest.config.ts` already collects both
locations (and `app/shared/logic/**`, which T044 needed), and `.storybook/main.ts`'s
glob already reaches `app/features/landing/`. No config change anywhere.

## The three numbers this feature existed to measure

Method: `Emulation.setDeviceMetricsOverride` against `.output/public` (findings § R44),
never `--window-size` (§ R34). Re-run after Phase 5b; identical.

**Glow centres, page coordinates — all six land on the design.**

| | 1440 measured | design | Δ | 390 measured | design | Δ |
|---|---|---|---|---|---|---|
| `foco` | 1310.0, 289.8 | 1310, 290 | −0.0, −0.2 | 410.0, 52.2 | 410, 50 | 0.0, **+2.2** |
| `wine` | 130.0, 309.8 | 130, 310 | −0.0, −0.2 | 40.0, 142.2 | 40, 140 | 0.0, **+2.2** |
| `cierre` | 1430.0, 869.8 | 1430, 870 | −0.0, −0.2 | 440.0, 522.2 | 440, 520 | 0.0, **+2.2** |

**Paint order, on the page** (both widths, `/es/`): backdrop `-3` → dots `-2` →
spotlight `-1` (after one mouse event; `ABSENT` before it) → content `auto`. The
section computes `transform/translate/scale/rotate/filter/backdrop-filter: none`,
`opacity: 1`, `isolation: auto`, `will-change: auto`, `contain: none`,
`position: relative`, `background-color: rgba(0,0,0,0)`. Feature 8's two limits are
closed: the page scrolls with nothing injected (1320 at 1440×900, 1143 at 390×844) and
the lit dot sheet stays registered — its origin phase measured **0,0 mod 24px** at four
pointer/scroll combinations.

**Nav height: 102.80 at 1440 (design 103) and 78.19 at 390 (design 76).**

## What surprised me — three things a human should look at

1. **The mobile nav is 2.19px taller than the frame, and the mobile Hero rides on it.**
   44 (`nav-y`×2) + 34.2 (hamburger: 32.2 **plus its 1px border**) = 78.2, exactly what
   the browser measures. R49's derivation omitted the border; the border is in the design
   (§ 9.bis). So the Hero's first child sits at y152.19 instead of y150 and all three
   mobile glow centres are 2.2px low. **Not absorbed** — `--spacing-hero-top` still
   holds `150 − 76`. The frame disagrees with its own hamburger spec; that is a person's
   call. (findings § R55.)
2. **The `cierre` glow makes the document 159px taller than the layout root at 1440, and
   that band is white.** Measured: root 1161.03, `scrollHeight` 1320, glow bottom 1319.8;
   pixels `rgb(38,38,38)` above the seam and `rgb(255,255,255)` below it. `overflow-x: clip`
   handles the horizontal case (0 overflow, 320→2560); the vertical is unclipped and
   `html`/`body` carry no background. It is **transitory** — the design's page is 5060 tall —
   and the cure is in `app/layouts/default.vue`, outside this feature's declared reach, so I
   did not touch it. (findings § R54.)
3. **The landing's nav CTA can never appear today at a realistic desktop height.** Max
   scroll at 1440×900 is 420; the Hero's bottom edge is at y776, so it never fully leaves
   the viewport and the observer never flips. Demonstrated working at 1440×420 (fade in at
   the bottom, fade out on the way back). `research.md` § R8 anticipated this and named the
   knob (`rootMargin`); I left the plain default as specified.

## D-07, as asked: what pinning looks like with no background

Confirmed structurally — the nav computes `background-color: rgba(0,0,0,0)` and
`backdrop-filter: none` on all four routes, at scroll 0 and at max scroll, with height
`102.80` and `opacity: 1` byte-identical in both (SC-017). What passes under it on the
landing today is the Hero's own glows and dots, which read fine. The footer's opaque
block reaches the nav's text at **1440×600 and shorter** (measured: overlap true at 420
and 600, false at 700 and 900) — and will reach it at every height once section 02 ships.
I added no background. Two utilities either way; Roberto's call.

## Nav CTA reveal — measured, all of it

Hidden `visibility: hidden / opacity: 0` in the generated HTML on `/es/` and `/en/`;
`visible / 1` on `/es/nosotros/` and `/en/about/`; **zero transitions ran on load on any
of the four**, and the only computed state seen since document load was the initial one —
so no flash on the landing and no fade on Nosotros, which was the likeliest defect.
At 390 the wrapper is `display: none`. Under `prefers-reduced-motion: reduce`,
`transition-property` computes `none` and the show/hide still happens with zero
transitions. `focus()` on the hidden button leaves `activeElement` on `BODY`. With
`Emulation.setScriptExecutionDisabled` (read through the CDP `CSS` domain, not the page)
the button is `visible / 1` on **4 of 4** documents.

## Deviations from the task text, all deliberate

- **T042 says `@theme inline` for `--layer-nav` and `--duration-nav-cta-fade`. I put both
  in `:root`.** Tailwind v4 has no theme namespace for `z-index` or
  `transition-duration` — verified by compiling `z-*` and `duration-*` against the repo's
  own Tailwind 4.3.3: neither emits a single utility. In `@theme inline` both tokens
  would emit nothing and the `var()` in the scoped CSS would resolve to nothing, silently.
  This is R46 in a second namespace. (findings § R52.)
- **T047 says `transition-opacity` + `motion-reduce:transition-none` utilities. The whole
  transition is in `<style scoped>` instead.** A scoped rule carries the component's data
  attribute, so it outranks a same-name utility — mixing them would have let the duration
  rule beat `motion-reduce:transition-none` and keep animating for someone who asked not
  to be. (findings § R53.)
- **T048's `<noscript><style>` had to become `v-html`.** A literal `<style>` in a template
  compiles fine in SSR and is a hard error in the client compiler, so `pnpm generate`
  passed and `pnpm test` did not. (findings § R51.)
- **T039 says append to `docs/business/rules.md`. I did not** — that tree is read-only to
  me. The five findings went to `docs/harness/findings.md` §§ R51–R55. Three of them
  (R51–R53) are also commented next to the code they govern.
- **One pre-existing assertion changed**, and it is the one real tension in the approved
  spec. `tests/static-output.test.ts` → *"should render the same nav markup on the landing
  and on About"* is now factually wrong: FR-043 makes the two navs differ. I extended its
  existing exclusion list (which already excludes destinations and the active-page marking)
  with the CTA's two utilities, and added three assertions that pin down that this is the
  **only** difference — which is SC-017's mechanical half. FR-041 says no existing test may
  be modified; FR-043 makes that impossible. Flagging rather than hiding it.

## Limits of what was verified

- **One browser.** Chrome on macOS, as feature 008 (findings § R45). Nothing here uses
  recent CSS beyond what feature 008 already recorded; the new declarations are `sticky`,
  `visibility`, a `clamp()` with a negative lower bound (verified in the emitted CSS:
  `top:clamp(-1.625rem,20.2857vw - 6.5696rem,11.6875rem)`) and a `transition`.
- **Type rendering was not judged by eye.** The stack computes 466.25 against the frame's
  466 at 1440 and 400.63 against 400 at 390, with the headline and subhead on two lines
  each, so the token mapping is corroborated to under 1px — but whether it *looks* right
  is a Storybook/browser review, not something I can assert.
- **Colour of the glows was not measured**, only their geometry and their stacking level.
  The fills come from `SectionGlow`'s existing tokens, unchanged.
- **The two live destination branches were exercised, not shipped.** T027 filled
  `HERO_DESTINATIONS` with placeholders, regenerated, and confirmed `<a href="/es#contacto">`
  and a `bone-100` link with `target="_blank" rel="noopener noreferrer"` — with zero
  component markup touched — then reverted. The story `LiveDestinations` keeps that branch
  reviewable.
- **`IntersectionObserver` is assumed present.** Where it is not, the sentinel no-ops per
  the approved contract, which means the landing's nav CTA stays hidden. Baseline since
  Safari 12.1; the Hero's own CTA is unaffected. Residual, not a defect I introduced.
- **What a visitor sees today, for the record (T026):** the primary button looks exactly as
  designed and clicking it does nothing; the secondary CTA is grey text that does not
  respond to the pointer. Both are one data value from being alive.

`SectionGlow.vue`, `SectionBackdrop.vue`, `DotGrid.vue`, `Pill.vue`, `BotonPrimario.vue`
and `LinkArrow.vue` show **zero lines changed**; `SectionGlow.test.ts` passes unmodified
(32 tests) — proof no token landed in the closed `glow` namespace. Feature 7's stale doc
comment and dead `'920'` variant are still there, untouched. The diff matches the spec's
*Files this feature modifies* table, plus the two test files T023 and T025 required.
