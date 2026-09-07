# Review: radar_pulse (feature 4)

**APPROVED**

`sdd: false` — reviewed against the `acceptance` array in `feature_list.json`,
`docs/business/landing/ui-map.md` § *Receta del ping del radar*,
`design-extract.md` § 2 and `docs/harness/CHECKPOINTS.md` C1–C6, per the
path documented in `AGENTS.md` § 4. Status was `reviewing` at review time.

Every claim below was verified independently against source and against the
freshly emitted build produced by this review's own `./init.sh` run, not
taken from the implementer's summary.

## Verified

| # | Item | Result |
|---|---|---|
| 1 | Status `reviewing` in `feature_list.json` | CONFIRMED |
| 2 | Recipe values match `ui-map.md` | CONFIRMED — `scale(1)`→`scale(3)`, opacity `.6`→`0`, `2.4s ease-out infinite`, solid `var(--red-400)`, ghost sized to the DOT via `inset:0` on `.ping::before` |
| 3 | Two static halos gone from rendered output | CONFIRMED — zero `radar-halo` in `app/`, zero `halo` and zero `CF31471F`/`CF31474D` in both builds; explanatory comments correctly retained |
| 4 | Footprint 20/30/22 preserved, dot 7/12/10 centred | CONFIRMED — footprint and dot tokens both intact, `grid place-items-center`; `Pill.test.ts` still asserts `size-radar-sm` unmodified |
| 5 | CSS only, zero JavaScript | CONFIRMED — compiled `Radar-*.js` has no `requestAnimationFrame`/`setInterval`/`setTimeout`/`Animation(` |
| 6 | `prefers-reduced-motion: reduce` withdraws the ping | CONFIRMED — `content:none` (withdrawn, not paused, so no frozen ring); dot untouched |
| 7 | Duration is a token | CONFIRMED — `--duration-radar-ping: 2.4s` in `:root`, emitted in the site build; no literal in markup (Article VII) |
| 8 | No dead code | CONFIRMED — five halo tokens removed, zero `radar-halo` matches in source (Article VIII) |
| 9 | Story shows the ping; tests pass; no test asserts three circles | CONFIRMED — `Ping`/`ReducedMotion`/`Footprint` stories; 66 tests green; node-count assertions now guard *against* extra circles |
| 10 | All three sizes | CONFIRMED — one size-agnostic rule, asserted per size |
| 11 | `./init.sh` | CONFIRMED — exit 0, 8/8 checks, all `[OK]`, no `[WARN]`/`[FAIL]` |

Constitution: no hex/px literal in `Radar.vue`, no relative import crossing a
directory, no `server/api/` route, `nitro.preset` still `'static'`,
`<script setup lang="ts">`, 105 lines, no debug prints or TODOs. No new page,
so locale parity is not engaged.

Compiled scoped CSS is 295 bytes total and contains nothing beyond the ping
rule and its reduced-motion override. `--red-400` is confirmed present as a
runtime custom property (`#cf3147`), so the ghost actually paints — the R18
hazard cited by the implementer was avoided correctly.

## Known-open, correctly still flagged (NOT defects)

- **Never watched moving in a browser.** Verified from emitted CSS only.
  Still disclosed in `impl_radar_pulse.md` § *Not done, deliberately* and in
  `history.md`. Not silently resolved.
- **2.4s pending Clau's approval.** The 🟡 marker in `ui-map.md` § *Receta*
  is still in place, and `history.md` restates it. Not silently resolved.

Judgement call 2 (peak 60% red vs. a `color-mix`) remains an open visual
question, correctly flagged rather than decided. Both open items are
visual/approval matters that a code review cannot close.

## Follow-up for the leader (documentation, non-blocking)

Feature 4's `acceptance` item 1 in `feature_list.json` still reads
`scale(1)→scale(2.2)` and *"in the outer halo colour"*. That is the
**superseded** pre-correction recipe: `ui-map.md` and `design-extract.md`
were both corrected on 2026-09-06 to `scale(3)` and solid `red-400` with the
halos explicitly not replicated, and the code matches the corrected sources.
Read literally, the stale array now describes the bug the rework removed.
The implementation is right; the contract text is out of date. Recommend
updating that array before closing the feature so the record does not
contradict the shipped behaviour. This does not block approval — the live
design docs govern, and the leader directed the review to them.

Reviewer made no code changes and did not set `done`.
