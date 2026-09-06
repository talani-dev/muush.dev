# Review: primitive_ui_layer (feature 002)

## Verdict: APPROVED

Reviewed 2026-09-06. `feature_list.json` id 2 confirmed `reviewing` before
this review started. No file in the repo was modified by this review — all
build/type experiments ran in an isolated copy outside the working tree;
`git status --short` is identical before and after.

## Checkpoints (docs/harness/CHECKPOINTS.md)

- **C1** — base + harness files present; `.specify/memory/constitution.md` is
  real (v1.0.0, 9 articles); `docs/business/` populated; `./init.sh` exit 0.
- **C2** — exactly one feature in `reviewing` (id 2); feature 1 went
  `in_progress → reviewing → done`; existing Vitest suite green.
- **C3** — no constitution violation, see below.
- **C4** — `pnpm test` 1 file / 5 tests, all green; `pnpm build` succeeds.
- **C5** — the last feature worked is in its correct status. **Leader
  follow-up**: `current.md` still reads "Feature 2 — spec_ready" and
  `history.md` has no entry for this session yet. Both are session-close
  duties that follow this review; neither blocks approval.
- **C6** — `spec.md`/`plan.md`/`tasks.md` (+ research, data-model,
  quickstart, contracts, checklist) all present; the Constitution Check
  table is this repo's Phase -1 gate equivalent and every one of the 9
  articles is filled in PASS / N/A with justification, no blanks; all 41
  tasks checked `[x]`; no `[NEEDS CLARIFICATION]` in spec.md.
- **C7** — N/A. No route and no `ui.ts` key added or changed;
  `src/pages/` still holds only `index.astro`, `es/index.astro`,
  `en/index.astro`.

## Constitution

- **Article I** — `output: 'static'` untouched, no `server/` dir, no API
  route, build emits 3 static pages.
- **Article II** — `grep -rInE '<script|client:|islands/' src/components/`
  returns nothing across all 8 files. Built HTML from a full-composition
  page contains no `<script>` tag. All 8 are `.astro`.
- **Article IV** — both literal gates
  (`#[0-9a-fA-F]{3,8}` and `\[[0-9]+(px|rem|%)|[0-9]+px`) return zero hits
  in `src/components/`. Every visual value resolves to a token; verified in
  the compiled stylesheet that all 43 utility classes the components use
  actually emit CSS (none silently unresolved).
- **Article V** — `astro check` 0 errors / 0 warnings / 0 hints; no `any`,
  no `@ts-ignore`, no `@ts-expect-error`.
- **Article VI** — only same-directory relative imports (`./Radar.astro`,
  `./Wordmark.astro`); all cross-boundary imports use the `@/assets/*`
  alias added to `tsconfig.json` (compliance, not an exception).
- **Article VII / IX** — no test framework added; no speculative variants.

## Verified against design-extract.md (independently recomputed)

- **§ 9 fluid scale** — all 57 fluid/fixed tokens evaluated symbolically at
  390px and 1440px: **57/57 land on the documented endpoint within 0.05px**,
  and clamp correctly outside the range (display holds 46.00 at 320px and
  98.00 at 1920px). Fixed roles are single `rem` values, not degenerate
  clamps. `grep "@media" src/styles/global.css` → 0.
- **§ 1 GlassPanel** — 6 variants × fill / border / blur / radius / padding
  = **30/30 correct**, including the 8-digit-hex → percentage conversions
  (`#CF31472B`→17%, `#CF314778`→47%, `#FBF8F60F`→6%, `#1C1416A6`→65%,
  `#FBF8F63B`→23%). `bone`'s second padding is the orthogonal `tight` mode,
  no seventh variant.
- **§ 2 Radar** — sm 20/14/7, md 30/20/12, sm-alt 22/16/10 all exact;
  three rings stacked in one grid cell, genuinely concentric.
- **§ 3 Pill** — radius full, dark glass, bone-100 18% border, gap 11,
  padding 9/20/9/10 via logical properties, label bone-200, 13→12px.
- **§ 4 BotonPrimario** — nav [13,24]/14, hero [18,32]→[16,26]/16→15,
  submit [18,32]→[16,28], radius 12, ring 1.5px. Emitted gradient is
  `conic-gradient(from var(--led-angle), var(--red-400) 0%,
  var(--bone-100) 50%, var(--red-400) 100%)` — 3 stops, **no wine
  anywhere**. Hover-gated 2.6s linear rotation, reduced-motion collapses to
  a flat `var(--red-400)` ring, mask-composite band verified in output.
  *Note for the docs, not a defect*: design-extract § 4/§ 11 writes the
  third stop as `#cf3247` while § 0 and the token both say red-400 is
  `#cf3147`. The doc says in the same sentence that the stop "es Red 400
  otra vez", so `var(--red-400)` is right and the doc has a digit typo.
- **§ 5 Wordmark** — both forms, Poppins 600, 19→24px, −0.03em both frames,
  dot always red-400, runs joined.
- **§ 6 Lockup** — gap 9→12, isotipo width 40→52, **stroke-width formula
  NOT replicated**: the inlined `<svg>` carries only `viewBox` +
  `stroke-width="12"` and the component sets width alone, so the browser
  scales it to 8.851 @52 / 6.809 @40 on its own. No `strokeWidth` prop, no
  `src/utils/` helper. Checkpoint 7 satisfied.
- **§ 7 LinkArrow** — 16px / 20→23px, weight 600, no background or border
  in any state, external gets `target="_blank" rel="noopener noreferrer"`.
- **§ 8 SocialIcon** — 48×48, radius 10, bone-100 18% border, dark glass,
  24×24 glyph, container `text-bone-100` so `currentColor` resolves to
  `#FBF8F6`.

## Social glyphs (decisions-open.md § Íconos de redes)

All four required steps confirmed on all three files: shared square
`viewBox="0 0 24 24"`; every `fill="currentColor"`; zero `<style>`,
`<defs>`, DOCTYPE, prolog, comments, `class=`, `xmlns:serif`, `xml:space`;
nested transforms flattened to one wrapping `<g>`. The glyphs are inlined
as real `<svg>` (not `<img>`), so the token inheritance actually works.
TikTok's optical centring was recomputed from the transformed path extents:
**x ∈ [1.530, 22.454], y ∈ [0, 23.994]** — matches the claimed 1.53 inset.
LinkedIn's `scale(8.53333)` and viewBox offset are gone; Instagram's
`.cls-1` global class is gone.

## Task-checkmark spot checks (not taken on faith)

- T001 alias present in `tsconfig.json`, other six untouched.
- T002–T007: `--dark-glass`, `--stroke-led`, 13 glass/radar colours, 22 type
  roles, 19 spacing + 9 radar, 4 radius, 3 blur, `@property --led-angle`,
  `@keyframes led-spin` all present with the documented values.
- T010: `git diff --numstat src/styles/global.css` → **231 insertions, 0
  deletions**, so every feature-001 ramp, font token and `@font-face` block
  is byte-identical (FR-008 holds).
- T036/T038: nothing under `src/pages/`, `src/layouts/`, `src/islands/`,
  `src/i18n/`, `src/utils/`, `tests/`, `astro.config.mjs`, `package.json`
  or `biome.json`.
- T039–T041: re-run here, all green.

## Accuracy of the implementer's summary

Cross-checked against the tree rather than trusted. Every material claim
holds. One immaterial error: the summary says global.css grew by **215**
insertions; the actual diff is **231**. The append-only claim it was
supporting is correct (0 deletions). The claim that the modified files under
`docs/business/` predate this task is *inferred*, not confirmed — their
content is the leader's 2026-09-06 design-extract corrections, consistent
with the story, and none is code.

## Ruling on the 5 flagged deviations

1. **9 extra radar geometry tokens** — **ACCEPTED.** T005's list of 19 was
   written before Radar's markup existed; without these, the three
   diameters would be px literals in the component, which Article IV and
   FR-030 forbid outright. Values match § 2 exactly and `research.md` § R7
   already anticipated "sized from three tokens per variant". Following the
   task list literally here would have *caused* a violation.
2. **TikTok `fill-rule="nonzero"` instead of T032's `evenodd`** —
   **ACCEPTED.** Verified in the vendor source: 1 `fill-rule:evenodd` on the
   root `style` and 4 `fill-rule:nonzero` on the paths, so the paths
   override the root and `nonzero` is what the art actually renders with.
   T032 was wrong; preserving the source's effective value is correct. Moot
   in practice (each path is a single subpath) and documented in the asset
   README.
3. **GlassPanel's `}: Props = Astro.props` annotation** — **ACCEPTED.**
   Reproduced both halves independently: removing the annotation produces
   exactly 3 `ts(7053)` implicit-any errors, and with it, callers are still
   rejected on a bad prop (`Type '"not-a-variant"' is not assignable to type
   'GlassVariant'`). It is a plain type annotation — no `any`, no
   `@ts-expect-error` — so Article V is satisfied. Minimal correct fix.
4. **Biome `useAnchorContent` suppression in LinkArrow** — **ACCEPTED WITH
   A NOTE.** Reproduced all three states: the rule genuinely fires on a
   slot-labelled anchor, the `{/* biome-ignore */}` form does **not**
   suppress it, and only the HTML-comment form does — so the leaked comment
   is unavoidable in-file, exactly as claimed. Turning the slot into a
   `label` prop would break the published contract in
   `contracts/components.md`, which is the worse trade. The comment is
   inert, ~70 bytes, on 4 instances. *Note*: the cleaner fix is a
   file-scoped `overrides` entry in `biome.json` — out of scope for this
   feature (T038 forbids touching it), so it should be picked up by whatever
   feature is next allowed to edit `biome.json`.
5. **`black` in the mask gradients** — **ACCEPTED.** `linear-gradient(black
   0 0)` under `mask-composite: exclude` is an alpha stencil; only the alpha
   channel is read and the hue is never painted. It is not a design value,
   so Article IV does not apply, and the Article IV grep gate (hex literals)
   is unaffected. Correctly flagged rather than hidden.

## Observations that are not defects

- `--text-display--line-height` is fixed at 0.98, so at 390px it does not
  render the 1.0 that spec US1 scenario 2 states literally. This is the
  explicit `research.md` § R2 decision ("line height fixed per role at the
  desktop value; every documented mobile deviation is ≤ 4%"), the same
  approved bundle the scenario lives in, and the resulting difference is
  0.92px on a 46px heading — inside SC-001's 1px tolerance. Same for h2
  (1.02 vs 1.03) and h3-alt (1.26 midpoint). The implementation is faithful
  to the artifacts; the scenario wording is the stale side.
- No new Vitest test. Correct under Article VII: this feature adds no logic
  to `src/i18n/` or `src/utils/`, and its one logic candidate (the
  stroke-width formula) turned out to be free SVG scaling, so there is no
  function to test. Same precedent as feature 001. Every acceptance
  criterion was instead verified by recomputation, compiled-CSS inspection
  and built-HTML inspection, as recorded above.
- Weights 500/600 have no font binary yet (`public/fonts/` empty, feature
  001's TODO). Pre-existing, documented as spec A-10, out of scope.
- `src/layouts/BaseLayout.astro` imports `'../styles/global.css'`, a
  relative import crossing a directory boundary. **Pre-existing** — that
  file was not touched by this feature — but there is no `@/styles/*` alias
  to fix it with. Worth cleaning up in a later feature.

## Result

All checkpoints green. No Constitution violation. All 41 tasks checked and
truthful. All 5 flagged deviations are justified on their merits. `./init.sh`
exits 0. **APPROVED.**
