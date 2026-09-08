# Feature 013 · `purpose_section` — review

**APPROVED.** Status was `reviewing` when this run started. Nothing modified.

## Gates
`./init.sh` **exit 0** — 35 files / **455 tests** (baseline 30/373); typecheck,
check, generate, storybook:build all green. My first run failed at step 6 on a
stale Nuxt build lock held by a **dead PID** (95582); no lock file remained and a
clean re-run was green. Environmental, not code.

## The arc drift — CONFIRMED, and it is a design constraint, not a defect
Measured on `.output/public` via CDP at 1440. Drift ES **13.27 / 29.60 / 29.64**,
EN **27.70 / 60.20 / 60.88** — matches the report exactly. Diagnosis verified:
`Why` renders **3** lines / 187.5px in ES and **2** / 147px in EN where Pencil drew
4 / 228; `How` 187.5 vs 187 and `What` 147 vs 146 both match, so the type mapping is
sound. Forcing `Why` to 228 and removing `Pill`'s 2px collapses drift to
**−0.07 / −0.30 / −0.64px** — all inside 1px. So the radii and origin (−180, 44) are
correct and derived; the radars moved. The EN-worse-than-ES spread follows directly
from EN being one further line short. FR-015 (intrinsic heights) and FR-017 (fixed
radii) are structurally incompatible once copy wraps unlike the mockup — which spec
A-02 already declared. Arcs are `aria-hidden` 1px hairlines at 12–36%. Retuning
would bake one locale's wrap into the geometry and destroy FR-017's derivation.
**Escalate to Roberto/Clau; not a rejection reason.** (T044/T045 are `[x]` because
the checks *ran*; T045's failure was reported, not absorbed.)

## Verified by measurement
Lines **394/244/94** from the one `calc()` (`--purpose-link-revealed`, no literals;
hardcoding it turns a test red). Arc midline radii **519.51/808.52/1067.02** vs frame
519.5/808.5/1067.0. Rest: lines 0, cards `opacity 0` with `visibility/content-visibility:
visible`, `display: flex`, copy present. Revealed: fill .12→.17, border .35→.47, radar
.73→1, other nodes untouched; in → line then card, out → card then line. Hovering the
**word** behaves identically to the dot; hovering the **card** reveals nothing; focus
identical. `(hover: none)` @1440 reveals all three. Reduced motion keeps the reveal,
`transition-property: none`. @390: pad-top 90.0005, track 390 @x0, pad-inline 58, active
**58→332**, neighbour **342→583.12** at .88/.45, dots **175/193/209** at 8/6/6, neighbour
= 274 × .88. Glow centres (60,704)/(1410,854)/(−180,44); origen `display:none` @390.
R28/R37: backdrop **−3**, dot sheet **−2**, arcs/content **auto**; section declares none
of the 11 stacking properties, no background, no bottom/horizontal padding; every
ancestor to the layout root is static/auto. `.arcs` is a **sibling** of
`.section-backdrop`, so its `overflow-clip` cannot cut the 1000px glows; feature 10's
root clip absorbs the rest — overflow **0** at all 12 widths 320→2560. No-JS: zero
`data-dimmed`, zero `aria-current`, zero indicator buttons in either prerendered
section. `id="proposito"` present; `href="/es#proposito"` asserted.

## R36 / R39 / deviations
R36 ✅ — no token in `--color-glow-*`/`--spacing-glow-*`; six primitives and
`SectionGlow.test.ts` show **zero** changed lines; renaming one purpose token into the
namespace turns `SectionGlow.test.ts` red, so the guard is live. R39 ✅ — 8 mutations
(anchor, clip-on-section, row order, literal widths, label `lg:hidden`, always-dim,
en.json key, glow namespace) each caught; all files md5-restored. Both deviations are
sound: the arcs need `inset-0` on the **section** for FR-018 and their origin is 270px
above the constellation; `PurposeSection.test.ts` is T032's real subject. 57/57 tasks
`[x]`, 16/16 checklist, plan gates `[x]`, no `[NEEDS CLARIFICATION]`, 22/22 acceptance
covered, both locales at 5 keys, stories in both viewports and locales, no server route,
no cross-directory relative import, no new alias, all `<script setup lang="ts">`,
largest component 118 code lines (`SiteNav` precedent: 130).

## Notes for the leader — none blocking
1. **O-01 (0.73) and O-06 (0.2s)** are correctly marked ⚠️ UNVERIFIED with owners and
   full derivations, incl. "No presentarlo como valor de diseño". Not design values.
2. `docs/harness/progress/current.md` still describes **cancelled feature 12** /
   `spec_author`. C2 and C6 want the active session — leader housekeeping before `done`.
3. The report calls the `.specify/feature.json` fix "one space pair"; it is a 3-line→1-line
   reformat **plus** the path change to `013-purpose-section`. Both correct, and the
   original genuinely failed `biome check` — I reproduced it.
4. Honest declared gaps: no left neighbour at rest @390 (A-07); `(hover:none)` keeps the
   rest fill; `Pill` 40 vs 38 puts everything 2px low (§ R55 class).
