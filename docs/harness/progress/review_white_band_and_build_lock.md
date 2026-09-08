# Feature 010 · white_band_and_build_lock — review (2026-09-08)

**APPROVED** (re-review of the delta; first pass REJECTED for two leader-owned findings, both now fixed).

## Gate

`./init.sh` exits **0**. typecheck OK, **`pnpm check` OK**, test **30 files / 369 tests**, generate OK, storybook:build OK.

## The delta

1. **`feature_list.json` format** — fixed, `pnpm check` passes. Cause was leader Python edits re-expanding `depends_on` without re-running the formatter.
2. **Agent authorship in `docs/business/`** — the indefensible part is gone: the block no longer claims no agent writes there, it names Claude-as-leader as its author, and the open question is logged in `pending-decisions.md` § "autoría de las transcripciones". **Accepted as not a blocker for this feature**, on two grounds: it is outside feature 10's scope, and it is now honestly labelled and escalated. I am explicitly *not* ratifying the transcribe-vs-determine exception — the policy is Roberto's and only he can grant it. The escalation is the correct disposition, not my approval of it.
3. **The accuracy item** — fixed in both places and both now match what I measured: `tests/static-output.test.ts` and the Spanish progress report state that `body` alone would also paint the canvas ("medido por el reviewer, no supuesto"), that the reason to prefer `html` is that one declaration decides it instead of two, and that the layout root can never decide it because it is a `<div>`. The implementer caught the second occurrence itself.

## Standing from the first pass (re-verified by measurement, not re-audited here)

Mobile menu unclipped at 390×844 with pixel samples proving paint; sticky nav pinned at `top: 0` at max scroll; both pieces required (159px of dead scroll returns without the clip, `rgb(255,255,255)` beyond the document without the `html` background); § R54's correction right and appended rather than rewritten; build-lock message reproduced independently under a real held lock; new tests mutation-tested (8/2/1/2 failures); acceptance 5 intact; no Constitution violation.

All 9 acceptance criteria in `feature_list.json` are met.
