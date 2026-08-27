# Review: design_tokens_and_logos (feature 001)

## Verdict: APPROVED

## Checklist

- feature_list.json status confirmed "reviewing" before this review started.
- spec.md and tasks.md read in full; plan.md, research.md, data-model.md,
  quickstart.md also read.
- CHECKPOINTS.md walked:
  - C1: base files present, `./init.sh` exits 0.
  - C2: only feature 1 is in_progress/reviewing (single entry, status
    "reviewing"); current.md describes the active session.
  - C3: no hardcoded color/spacing literal introduced in any component
    (the only literals are the token definitions themselves in
    `src/styles/global.css`, which is the token source file — expected);
    no relative import crossing directories added (no imports added at
    all); no server route/API/`server/` dir added; the sole pre-existing
    TODO (missing .woff2 files) is explicitly documented as out of scope
    in spec.md's Edge Cases, not an "unexplained" TODO.
  - C4: existing Vitest suite passes (5 tests, 1 file, all green);
    `pnpm build` succeeds.
  - C6: spec.md/plan.md/tasks.md all present; plan.md's Constitution
    Check table (this repo's Phase -1 gate equivalent) has every article
    marked PASS/PASS(N/A)/N/A with justification, no blanks; every task
    in tasks.md is checked `[x]` (T001-T019); no `[NEEDS CLARIFICATION]`
    marker in spec.md; the "no new tests" decision (research.md §5) is
    explicitly and correctly justified under Article VII/IX rather than
    silently skipped — this feature adds zero logic, only CSS values and
    static asset copies, so no acceptance criterion is left unverified by
    test-equivalent means (grep verification, diff verification, build
    spot-check, all documented in tasks.md T007/T014/T018-T019).
  - C7: N/A — no routes or i18n keys touched.

- Acceptance criteria verification:
  - Color hex values in `src/styles/global.css` (`git diff` reviewed)
    exactly match `docs/business/branding.md` and `data-model.md` for all
    4 ramps x 5 steps (20 values), replacing the old 10-step scale.
    `@theme inline` block mirrors the 5-step `:root` properties 1:1.
  - `--font-poppins`/`--font-instrument` tokens and all four `@font-face`
    blocks are byte-unchanged (confirmed via diff — only the color ramp
    block changed, nothing else in the file).
  - `grep -rEn "bone-(50|600|700|800|900)|ink-(...)|red-(...)|wine-(...)"
    src/` outside global.css returns zero matches — no component depended
    on a removed step.
  - The three isotipo SVGs are present at `src/assets/logo/` as
    `isotipo-on-bone.svg`, `isotipo-on-ink.svg`, `isotipo-on-red.svg`, and
    are byte-identical in content to the external source files
    (`muush-dark.svg`, `muush-light.svg`, `muush-triple-white.svg`) except
    for a `<title>` tag added for documentation purposes — geometry
    (`viewBox`, `circle`, `path`, `stroke-width`, `stroke-linecap`) and
    all fill/stroke colors are unaltered.
  - `src/assets/logo/README.md` documents the background-context to file
    mapping, matching `docs/business/branding.md`'s "Sobre qué fondo va
    qué trazo" section exactly.
  - No wrapper component, page, header, footer, favicon, or logo instance
    was added anywhere in `src/pages/` or `src/components/` (verified via
    grep — zero references to `isotipo`/`logo` in any `.astro`/`.ts`
    file). No wordmark or lockup A/B asset was added. Both explicitly out
    of scope per FR-007/FR-008, and both correctly honored.

- `./init.sh` run directly: exit code 0 (typecheck, biome check, vitest,
  and build all green; the only warnings are the pre-existing, out-of-scope
  missing `.woff2` font file warnings during build, unrelated to this
  feature).

- Cross-checked the implementer's own summary
  (`docs/harness/progress/impl_design_tokens_and_logos.md`) against the
  actual `git diff`/file contents rather than trusting it — the summary's
  claims about what changed, what didn't, and the verification results all
  matched what was independently observed. No discrepancy found.

## Result

All checkpoints green. No Constitution violation. No missing task. No
unjustified test gap. APPROVED.
