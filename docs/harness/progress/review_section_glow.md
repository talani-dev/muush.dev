# Review: section_glow (feature 5)

**APPROVED**

`sdd: false` — reviewed against the `acceptance` array in `feature_list.json`,
`docs/business/landing/design-extract.md` § 10 · SectionGlow,
`docs/business/rules.md` (R5, R18) and `docs/harness/CHECKPOINTS.md` C1–C6,
per the path documented in `AGENTS.md` § 4. Status was `reviewing` at review
time.

Every claim below was verified against source and against the build emitted by
this review's own `./init.sh` run, not taken from
`docs/harness/progress/impl_section_glow.md`.

## Verified

| # | Item | Result |
|---|---|---|
| 1 | Status `reviewing` in `feature_list.json` | CONFIRMED |
| 2 | `app/shared/ui/SectionGlow.vue` is a Vue SFC with `<script setup lang="ts">` (Article V) | CONFIRMED — 149 lines, one `computed`, no Options API |
| 3 | **No named variant system** | CONFIRMED — props are `color`, `opacity`, `size`; the strings `foco`, `cierre`, `Propósito`, `Hero` appear nowhere in the component's API, only as story captions. § 10's warning was honoured |
| 4 | Recipe: circle + radial gradient base colour → transparent | CONFIRMED — `rounded-full` + `bg-radial-[circle_closest-side]` + `from-glow-*` + `to-transparent`. Emitted CSS: `radial-gradient(var(--tw-gradient-stops,circle closest-side))`. `closest-side` is correct and load-bearing: the default `farthest-corner` would end the fade ~41% outside the clip and leave a rim on all 22 |
| 5 | Outer stop `#26262600` rendered as `to-transparent` | CONFIRMED and correct — CSS premultiplies alpha before interpolating, so a zero-alpha ink-500 stop and `transparent` paint identically. Documented in the component, not silently dropped |
| 6 | Colour set = red-400, wine-300, wine-400 only | CONFIRMED — all three are existing `:root` ramp entries |
| 7 | Opacity set matches the design tables exactly | CONFIRMED by independent count of both § 10 tables: red-400 {65,60,12}, wine-300 {40,37,17,14}, wine-400 {30,28,20,14,12} = 12 pairs. A pair the design does not draw has no token and is a type error at the call site |
| 8 | Sizes match the design | CONFIRMED — 13 distinct desktop/mobile pairs in the tables, 13 tokens, no more. Each `clamp()` was evaluated by hand at both anchors and lands on the design's exact px at 390 and at 1440 (e.g. `--spacing-glow-1500-700` = 700px @390, 1500px @1440). `920` (`Glow origen`, desktop-only in the design) is correctly a fixed `57.5rem` rather than an invented mobile value |
| 9 | Positioning delegated to the caller | CONFIRMED — no `position`, offset, `inset` or `z-index` in the component, and a test asserts their absence plus no `style` attribute. All coordinates live in the `HeroStack` story |
| 10 | Zero hardcoded hex or px (Article VII) | CONFIRMED — the only hex in the file is inside a comment explaining `#26262600`. No px, rem, percentage or arbitrary colour/length utility. `bg-radial-[circle_closest-side]` is gradient geometry, not a colour or spacing literal, so it is outside what Article VII governs; stated once and justified in the component |
| 11 | **R18** (`--color-*` theme names emit no runtime property) | CONFIRMED, checked specifically — `SectionGlow.vue` has **no `<style>` block at all**, and no file outside `global.css` references `--color-glow-*` or `--spacing-glow-*`. Emitted site CSS contains **zero** `--color-*` declarations, while the fills resolve to `color-mix(in srgb, var(--wine-300) 37%, transparent)` against ramp names that are present in `:root`. The bug that bit twice before cannot fire here |
| 12 | All 25 new tokens actually emit | CONFIRMED in `.output/public/_nuxt/entry.*.css` — 12 `from-glow-*` and 13 `size-glow-*`, each setting `width` and `height` to the same `clamp()` so the circle can never be measured into an ellipse |
| 13 | Storybook story against the ink-500 background (Article X) | CONFIRMED — 5 stories indexed in `storybook-static/index.json`; `.storybook/preview.ts` defaults `backgrounds` to Ink 500 (`#262626`) and `HeroStack`/`Edge` also set `bg-ink-500` explicitly |
| 14 | Component test covers the pair-to-token mapping (Article X) | CONFIRMED — 31 cases: 12 fill pairs, 13 diameters, gradient shape, transparent stop, positioning absence, inertness, leaf element |
| 15 | No page, layout or feature module created | CONFIRMED — the diff touches only `app/shared/ui/SectionGlow.{vue,test.ts,stories.ts}` and `global.css`; no `server/api/`, no relative import crossing a directory (Article XII), no new alias |
| 16 | `./init.sh` | CONFIRMED — **exit 0**, 8/8 checks, 97 tests in 10 files, 8 routes prerendered, Storybook built. The 4 biome `info` on one-word primitive names are pre-existing (R17/R20); `SectionGlow` adds none |

## Ruling on the sizing judgement call

**Correct.** One `clamp()` token per design pair, selected by a `size` prop, is
the right resolution and the tokens reproduce the design's real numbers.

- The pair, not the desktop diameter, is the identity: 1500→700 and 1500→760,
  1000→560 and 1000→520, 860→480 and 860→520 all collide on desktop. A token
  keyed on the desktop value could not reach the right mobile value. The
  `desktop-mobile` naming is the only scheme that survives that.
- No scale was invented. The mobile ratios run 0.47×–0.60× and are *not*
  normalised; each token carries its own intercept and slope. The only added
  mechanism is the 390→1440 linear interpolation of R5, which every existing
  `--spacing-*` token already uses.
- Caller-supplied sizes were correctly rejected: a raw diameter at 22 call
  sites is a spacing literal, and a caller-side `clamp()` is that literal
  twice plus a breakpoint — the exact signal Article VII names as a missing
  token.
- Refusing to merge 860/880/900 and 480/500/520 is right for a reviewer to
  uphold: § 10 says to check "caso por caso", and collapsing them would be the
  implementer overruling the design. Left visible in the `Sizes` story for a
  human call.

## Non-blocking observations

1. `SectionGlow.test.ts` — `should map each colour to exactly the opacities the
   design draws for it` is tautological: it rebuilds the map from the `fills`
   array declared 80 lines above and asserts it against a literal, never
   mounting the component. What it claims to guard is in fact guarded by the
   TypeScript union. Harmless, but it is not the safety net its comment
   describes, and its name drops the `when <condition>` half of the Article X
   pattern.
2. Doc defect, independently confirmed: § 10's prose says "nueve opacidades
   distintas" while its two tables contain **ten** (65, 60, 40, 37, 30, 28, 20,
   17, 14, 12). The implementer treated the tables as authoritative, which is
   correct. `design-extract.md` should be corrected. UNVERIFIED against the
   `.pen` — the Pencil bridge is unavailable to subagents.
3. The Nosotros hero changes opacity by viewport (60/37/28 desktop vs 65/40/30
   mobile). No token can express that and none was invented, correctly. The
   feature that composes that hero will need a decision; § 10 already flags it
   as possible drift.
4. `920` renders at full size on mobile if a caller mounts it there. That is
   consistent with delegating placement to the caller, and the prop's JSDoc
   says "desktop-only", but the consuming feature must hide it below 1440.
5. Visual confirmation in a browser (no rim on `Edge`, ordered ladders in
   `Fills`, no seam in `HeroStack`) remains open. Everything checkable without
   a rendering engine was checked; the stories exist and build.
