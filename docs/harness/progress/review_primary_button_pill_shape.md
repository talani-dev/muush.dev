# Feature 022 · primary_button_pill_shape — review (2026-09-08)

**APPROVED.** Status was `reviewing` before this run. Nothing modified, status untouched.

## Gates
`./init.sh` exit **0**. `pnpm test` → **30 files / 372 tests** passed (baseline 30/369, +3). Biome clean on the three touched files. C1–C8 walked; C2 coherent (exactly one feature in `reviewing`, none `in_progress`). `sdd:false`, so C7 N/A. No i18n/page/route change, `nitro.preset` still `'static'`, no `server/api`, `<script setup lang="ts">`, no relative import crossing a directory, no hex literal and no `rounded-[` in the component.

## The LED ring — CONFIRMED by my own measurement, not by reading the CSS
Chrome via CDP against `.output/public` (geometry by `getBoundingClientRect`, never from a capture — § R60), own PNG decoder, 720 outline samples per case, band width by redness-coverage integral along the inward normal.

Geometry reproduces exactly: hero **236.19×55.19** @1440, mobile hero **213.55×50** @390, nav CTA **198.78×42.80**. Fill reads `srgb(0.1098,0.0784,0.0863)/0.65` = `#1c1416a6` — unchanged.

**Zero gaps at 720/720 points on every case, at DPR 1 and DPR 4.** Band 1.49 CSS px mean on the hero @DPR4. The decisive control: same pipeline with `border-radius:12px` forced inline gives **1.50** mean, corner mean **1.50 vs the pill's 1.48**, min **0.75 vs 0.73**. Pill and r12 are indistinguishable within 0.02px — the residual sub-1px minima are my sampling registration error, present equally in the known-good r12, not a cap defect. Cap↔straight-edge junctions specifically: 0.95–2.01px, no thinning. `prefers-reduced-motion: reduce` gives the flat uniform red ring.

Conic sweep at 0/45/90/135/180/270°: **0 gaps**, min luma-over-background 35.8–46.9, peak ring luma 248 (bone-100 ✓, no wine). Setting `--led-angle` on the element does **not** reach `::before` (`@property … inherits:false`); it must be injected as `.led::before`.

**Aspect-ratio claim CONFIRMED.** Brightest outline point tracks the expected conic position within 1.4°, and pill vs r12 agree within **0.5° at every one of the 6 angles**. The radius does not move the bone-100 arc. The shape change is visually smaller than it sounds.

## Other claims
- **Tests updated, not loosened — CONFIRMED falsifiable.** Replayed each new assertion in memory against `rounded-full → rounded-control` mutated source, all 4 documents and the emitted CSS: 4 of 5 assertion families flip to FAIL (the `rounded-[` guard correctly does not, being a separate arbitrary-value check). ≥5 tests red on revert, as reported. Artifact test finds **6 `.led` controls across the 4 documents** (2/2/1/1), all `rounded-full` + `bg-glass-dark`, and is explicitly guarded against vacuity by `toBeGreaterThan(0)` and `toBeDefined()`.
- **Event guard intact.** `/@(click|mouseenter|mouseleave)/` at `BotonPrimario.test.ts:141` untouched; no new prose trips it (§ R56).
- **`rounded-full` over a `--radius-pill` token — correct, no Article VII issue.** A named Tailwind utility is not an arbitrary literal, and it resolves through the identical mechanism already used by `Pill.vue:29`, `Radar.vue:61` and `SectionGlow.vue:144`. No second convention. R59's `border-radius:2147483647px` verified verbatim in the emitted sheet (the live *computed* value clamps to 3.35544e7px — same thing, worth knowing if someone re-measures).
- **Keeping `--radius-control` — correct.** Zero consumers remain in `app/`, and Tailwind v4 tree-shakes it: **it is not emitted into the artifact at all**, so the cost of keeping it is zero bytes. Feature 7's `acceptance` is scoped to `SectionGlow`/`Wordmark`/`rules.md` and explicitly *preserves* `'920'`; `--radius-control` is not on its list. Frozen files untouched.
- **Criterion 7 satisfied.** The half-propagated `.pen` and both stale design docs are logged in `pending-decisions.md` § "tres documentos contradicen el radio nuevo", owner Clau, with the `FormField` nuance. No agent edited the `.pen` or `docs/business/` for this feature — the modified `ui-map.md` in the tree is pre-existing nav work (features 10/21) and self-discloses its authorship.

## Non-blocking notes for the leader
1. **`BotonPrimario.vue` crossed the raw 200-line limit: 177 → 214.** Substantively fine — **code lines are unchanged at 78**; all 37 added lines are comments, and "extract sub-components" is no remedy for prose. This is materially the registered Article V exception for `CursorSpotlight.vue` (`history.md`, which establishes code lines as the only stable metric). But no exception was registered here, and `sdd:false` means there is no `plan.md` Complexity Tracking table to hold one. Worth a line in `findings.md` before the next reviewer reads Article V against this file.
2. **No test guards `--radius-control`'s survival.** The only thing protecting an unconsumed token from the next cleanup pass is a comment in `global.css`. Feature 7 does not threaten it today; a one-line assertion would make that durable.
3. **The nav CTA's ring is not observable on the live artifact.** `showCta` is false at every reachable scroll position (document is 1161px, max scrollY 261), so `::before` computes `visibility: hidden`. I could only measure it with `Emulation.setScriptExecutionDisabled`, which lets `SiteNav`'s `<noscript>` rule reveal it. The measurement stands and the geometry matches, but the impl report should have said which lever made that case visible — a later agent following the note literally will measure a blank nav and think the ring broke.
