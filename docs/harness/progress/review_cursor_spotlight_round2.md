# Review · Feature 008 · `cursor_spotlight` · round 2 (delta re-review)

- **Branch**: `feat/cursor-spotlight`
- **Agent**: `reviewer`
- **Date**: 2026-09-07
- **Status at review time**: `reviewing` (confirmed; feature 8 is the only
  feature in `in_progress`/`reviewing`)
- **Round 1 verdict**: `docs/harness/progress/review_cursor_spotlight.md` —
  REJECTED, one required change

# APPROVED

The single required change is done, and done better than I asked. The
implementer did not take my corrected reason on trust — it built a test that
can falsify it, found that **my own evidence could not**, and produced a
measurement that can. Both non-blocking items are addressed. No code changed.
Gates green and unchanged.

One non-blocking correction is noted at the end. It does not gate anything.

---

## 1 · The required change — verified, and the wrinkle is real

### The coincidence claim is correct. My round-1 evidence was unfalsifiable.

At `50%` both competing hypotheses predict a lit translate of `0`:

- resolves against the **lit sheet's own** box: `mod(0.50 × 756 − 330, 24)`
  = `mod(48, 24)` = `0`
- resolves against the **declaring beam's** box: `mod(0.50 × 660 − 330, 24)`
  = `mod(0, 24)` = `0`

The bleed is exactly two dot steps (`756 − 660 = 96 = 4 × 24`, and
`378 − 330 = 48 = 2 × 24`), so the `mod()` cancels the disagreement. My round-1
measurement of `matrix(1,0,0,1,0,0)` at `50%` was therefore consistent with
**both** explanations and discriminated neither. **The implementer is right and
I was under-evidenced.** Stated plainly because the point of this gate is not
to be right, it is to be checked.

### The 55% measurement — reproduced, and extended

Re-measured on the live artifact with `--spotlight-x`/`--spotlight-y` removed
so the fallback is what actually runs. Measured boxes: **beam 660px, window
708px, lit 756px** — exactly as reported.

| Fallback | Beam translate | Lit translate (measured) | own-box (756) predicts | declaring-box (660) predicts |
|---|---|---|---|---|
| `50%` | 330 | **0** | 0 | 0 | ← indistinguishable |
| `55%` | 363 | **−13.8** | **−13.8** ✓ | −9.0 ✗ |
| `70%` | 462 | **−7.2** | **−7.2** ✓ | −12.0 ✗ |
| `var(--spotlight-outer-size)` | 660 | **−18** | — | — |

The `55%` row reproduces exactly: **−13.8 measured, −13.8 predicted by the
own-box hypothesis, −9 by the competing one — wrong by 4.8px**, as reported.

I added `70%` as an independent second discriminator that is not in the
implementer's report: measured **−7.2**, own-box predicts −7.2, declaring-box
predicts −12.0. **Two independent values, both landing on the own-box
hypothesis.** The arithmetic and the measurement both hold.

`CSS.supports('transform', 'translate3d(calc(-1 * mod(calc(50% - 330px), 24px)), 0px, 0)')`
returns **`true`**, reconfirming that the original invalidation claim was false.
The report now says so in its own words — *"the reason first recorded here was
wrong and the reviewer was correct to reject it… I had inferred it from
`research.md` § R3's warning instead of measuring it."* That is the correct
disposition of a wrong claim.

**The comment in `CursorSpotlight.vue` now states the verified reason**, keeps
the falsified one visible as falsified, and warns explicitly that `50%` "only
looks correct because 378 − 330 = 48 is exactly two dot steps". A future agent
reading it cannot conclude that `50%` is safe. Required change: **satisfied.**

### Consistency check — R45 does not contradict the correction

R45's `mod()` row states that where the engine does not support `mod()` the
whole `transform` declaration invalidates. That is **true** (an unknown
function is invalid at parse time) and is a different proposition from the one
I rejected (that a *percentage argument* to a *supported* `mod()` invalidates
it, which is false). The two records are consistent. Checked deliberately,
because a half-corrected claim reappearing one rule later is exactly the
failure mode here.

### No code changed — confirmed four ways

1. **Comment-stripped content of `CursorSpotlight.vue` is byte-identical** to
   what I read in round 1 — same template, same 12 declarations, same three
   media guards. Effective lines: **110 before, 110 after.**
2. `git diff master --stat` is **identical** for every tracked code file:
   `global.css` 103, `default.vue` 59, `DotGrid.stories.ts` 7,
   `SectionBackdrop.stories.ts` 9, `static-output.test.ts` 49,
   `vitest.config.ts` 10. Only `rules.md` (244 → 273, the +29 of R45) and
   `current.md` grew.
3. `useCursorSpotlight.ts` md5 is **`0f6c24af322abae2901222d47feb628b`** — the
   same value I recorded in round 1.
4. **Computed styles in the browser are identical**: driven beam
   `matrix(1,0,0,1,700,400)`, lit `matrix(1,0,0,1,-10,-22)`; shipped fallback
   beam 660, lit −18. Same numbers as round 1.

---

## 2 · Non-blocking item 1 — Article V exception

**Accepted.** Recording rather than restructuring is the right call, and
recording it in `plan.md`'s Complexity Tracking is the right place: the
Constitution's *Compliance Review* is where a justified violation must live.

**Amending an approved `plan.md` this way is acceptable to me.** It is
*additive* — a fourth row in a table that exists for exactly this purpose,
dated and attributed. Critically, it does **not** rewrite the Phase −1 gate at
line 111: that gate still reads `[x] Under 200 lines? Yes — ~90 lines`, and the
new row quotes it and corrects it in place of erasing it. That is the correct
SDD move. Editing line 111 directly would have destroyed the evidence that the
estimate was wrong, and unchecking it would have broken checkpoint C7. The
duplicate note at the top of the component is well-placed — a future agent
reading Article V against this file hits the exception where the violation is,
not only in a spec folder.

The substance is sound: the excess is documentation, the code is 110 lines,
and there is genuinely nothing structural to extract without breaking the
`--spotlight-beam-*` inheritance chain.

**But the recorded raw count does not match the file.** See the note below.

---

## 3 · Non-blocking item 2 — the single-browser limit

**Accepted, and better than I asked for.** `rules.md` § R45 does all three
things I suggested: it names each of the three declarations (`mod()`,
`mask-image`/`mask-repeat`, `overflow: clip`), states the failure mode where
each is unsupported (doubled dots / hard edge or tiling / the page grows), and
points at the costed fallback in `research.md` § R3. It also states the reason
shipping on that basis is acceptable — the worst failure is cosmetic on a
decorative desktop-only effect, no content lost, no interaction broken — which
is the judgement I made and it is now recorded rather than resting in a review
file. `rules.md` is at 45 rules.

---

## 4 · Gates — run by me, not taken from the report

```
Checked 102 files in 23ms. No fixes applied.   → pnpm check       exit 0
                                                → pnpm typecheck   exit 0
Test Files  24 passed (24) · Tests 276 passed (276)
Prerendered 12 routes in 0.646 seconds
Storybook build completed successfully
./init.sh                                       → EXIT 0
```

**24 files / 276 tests — unchanged from round 1**, as expected for a
documentation-only delta.

Spot-checked as unaffected by the delta: frozen-file diff still **empty** for
`DotGrid.vue`, `SectionBackdrop.vue`, `SectionGlow.vue`, `SectionGlow.test.ts`,
`SectionGlow.stories.ts` and `i18n/`; feature 8 still the only feature in
`reviewing`.

Per the coordinator's scoping, everything else verified in round 1 — R36, R37,
R38, R39 (including the mutation test), SC-002, SC-005, SC-006, scroll
registration, the three off-states, no dependency added, no CDP artifact —
stands unretested, because the delta touched none of it and the four
no-code-changed checks above establish that.

---

## Non-blocking note, for the record

**The Complexity Tracking row's raw line count is stale.** It states *"the
built file is **~265 raw lines**, of which ~110 are code."* The file is
**287 lines** (`wc -l` 286; 277 non-blank). The code figure — **110** — is
exactly right, and so is the top-of-file note's "~110".

The ~22-line gap is very close to the size of the Article V exception note
itself, so the likely sequence is: measure, write the row, then add the
top-of-file note and not re-measure. It is hedged with a tilde.

**I am not gating on it, and the distinction matters.** Round 1's defect was a
false statement about *how CSS behaves*, written as the reason a future agent
must not do something — it would have taught wrong semantics and left the real
hazard undocumented. This is a stale approximation of a number that changes
every time anyone edits a comment, in a row whose every load-bearing claim
(over the limit; the excess is documentation; code is ~110; do not extract) is
true and actionable. Nothing a reader does with this row changes at 265 versus
287.

Worth correcting to `~287` opportunistically — in feature 7's cleanup pass, or
whenever the file is next touched. Not now, and not a re-review.

---

**Verdict: APPROVED.** The required change is satisfied with stronger evidence
than either of us had at the end of round 1, both non-blocking items are
properly recorded in durable places, and no code changed. Status stays
`reviewing`; moving it is the leader's call.
