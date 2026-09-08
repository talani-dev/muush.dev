# Review · Feature 009 `hero_section` — APPROVED

Status confirmed `reviewing` before review. Branch `feat/hero-section`.
Reviewer changed no code and did not touch the feature's status.

## Gates

`./init.sh` exit **0** — 27 test files / **325 tests**, typecheck, biome,
generate, storybook:build all green.

> ⚠️ Harness fragility, not the feature: the first run failed because
> `tests/global-setup.ts` runs `pnpm generate` and a **stale Nuxt build lock**
> (dead PID) made both step 6 and step 7 fail. Clean re-run passes. Worth a
> `NUXT_IGNORE_LOCK` or lock-reap in `global-setup.ts`.

## C1–C8

All green. C3/C4: `landing` has `{ui,logic,data}` + barrel; no cross-feature
internal import (shell↔landing meet only in `app/shared/logic/`); no `data/`→
`logic/`/`ui/` import; no relative import crossing a directory; no
`server/api/`; `nitro.preset` still `'static'`; no new alias; no debug prints.
C7: 50/50 tasks `[x]`, plan Phase -1 gates all `[x]`, zero
`[NEEDS CLARIFICATION]`, every acceptance entry has ≥1 test. C8: parity green,
both locales, zero hardcoded strings.

## The weakened test — argument SOUND, replacement NET STRONGER

The FR-041 / FR-043 contradiction is **real**: the approved scope addition
mandates the nav CTA differ between landing and About, which is exactly what
the pre-existing assertion forbade. It could not be satisfied both ways.

Mutation-tested the extended `navMarkup()` against the real artefact:

| Injected divergence | Result |
|---|---|
| unrelated extra class on a nav link | **CAUGHT** |
| extra attribute on `<nav>` | **CAUGHT** |
| `<ul>` gains the excluded pair | **CAUGHT** |
| a nav **link** gains exactly `invisible opacity-0 ` | **HIDDEN** |

In the generated HTML there is **exactly one** match per document and it is
the CTA wrapper, so today the global strip is equivalent to a CTA-scoped one.
Net assertions went *up*: 4 new tests pin the CTA's per-route state, the
`<noscript>` override, and that the nav carries no `bg-/h-/opacity-/backdrop-`
class. Nothing is hidden today.

**Advisory (not blocking):** anchor the strip so the residual case cannot open
later — `/(in)?visible opacity-(0|100) (?=site-nav__cta)/`.

## Deviations 1–4 — verified by compiling/running, not by reading

1. **`:root` vs `@theme inline`** — CONFIRMED. Compiled against the repo's own
   Tailwind 4.3.3: `z-nav` and `duration-nav-cta-fade` emit **no utility**;
   `pt-hero-top` emits `padding-top: 4rem`. The literal task text would have
   resolved to nothing, silently. Deviation correct.
2. **Fade in `<style scoped>`** — CONFIRMED. Scoped `.site-nav__cta[data-v-…]`
   is (0,2,0) vs the utility's (0,1,0), so a scoped `transition-property` would
   have beaten `motion-reduce:transition-none`. Measured under emulated
   `prefers-reduced-motion: reduce`: `transition-property` computes **`none`**
   and show/hide still happens with **zero** transitions. Deviation correct.
3. **`<noscript>` via `v-html`** — CONFIRMED by invoking both compilers:
   `@vue/compiler-dom` reports *"Tags with side effect (`<script>` and
   `<style>`) are ignored in client component templates"*; `@vue/compiler-ssr`
   is silent. The SSR/client asymmetry is exactly as described.
4. **Findings to `docs/harness/findings.md` §§ R51–R55** — correct.
   **Confirmed the implementer wrote nothing into `docs/business/`**:
   `rules.md` ends at R50 under a *"Feature 009 · especificación"* heading
   (spec_author's, spec phase); there is **no** feature-009 implementation
   section. The `docs/business/` diffs in the tree are the human's policy
   rewrite and the § 2 scope addition.

## Re-measured independently (CDP `setDeviceMetricsOverride`, § R44; never `--window-size`, § R34)

**All six glow centres reproduce the report exactly.**

| | 1440 measured | design | 390 measured | design |
|---|---|---|---|---|
| foco | 1309.98, 289.8 | 1310, 290 | 410.00, 52.20 | 410, 50 |
| wine | 129.97, 309.8 | 130, 310 | 40.00, 142.19 | 40, 140 |
| cierre | 1429.98, 869.8 | 1430, 870 | 440.00, 522.19 | 440, 520 |

**The +2.2px arithmetic holds and the conclusion follows.** Measured at 390:
row padding 22.0002 + 22.0002 = 44, hamburger `getBoundingClientRect().height`
= **34.19** with `box-sizing: border-box` and 1px top/bottom borders →
44 + 34.19 = **78.19**, matching the measured nav height to the hundredth. The
frame's 76 = 44 + 32 omits the 2px of border that the design itself specifies
(§ 9.bis). Section top = nav height, `--spacing-hero-top` still holds `150−76`,
so the whole mobile stack rides 2.19px low. Correctly **reported, not
absorbed** — absorbing it would have silently contradicted the frame. Human's
call.

**Paint order on the page — R28/R37's first real test PASSES.** backdrop `-3`
→ dots `-2` → spotlight `-1` (`ABSENT` until a mouse event, then `-1`) →
content `auto`; nav `1`. Section computes `transform/filter/backdrop-filter:
none`, `opacity: 1`, `isolation/will-change: auto`, `contain: none`,
`position: relative`, `z-index: auto`, `background-color: rgba(0,0,0,0)` — no
stacking context, no background. Page scrolls unaided (1320 @1440, 1143 @390).

**Reveal states — all three, plus the one that mattered.** On load at 1440:
`/es` and `/en` `hidden/0`; `/es/nosotros` and `/en/about` `visible/1`; and
**zero transitions fired on load on all four** — no flash on the landing and
**Nosotros does not fade on load**. Scripting disabled (read via CDP `CSS`
domain): `visible/1` on **4 of 4**. At 390 the wrapper is `display: none`.
`focus()` on the hidden button leaves `activeElement` on `BODY`. At 1440×420
it fades in at the bottom and out on the way back.

**Frozen files:** `git diff` empty for `SectionGlow.vue`, `DotGrid.vue`,
`SectionBackdrop.vue`, `Pill.vue`, `BotonPrimario.vue`, `LinkArrow.vue` and
`SectionGlow.test.ts`. Working tree matches the spec's *Files this feature
modifies* table exactly, plus the two new test files and the one flagged
modification. **R36:** no `--color-glow-*` / `--spacing-glow-*` token added
(only a comment naming the namespace); `SectionGlow.test.ts` passes unmodified.

**Eyebrow** `"Technology solution studio"` byte-identical in both locales;
present in all four documents.

## The three reported-not-fixed items — none blocks

1. **White band — CONFIRMED and visually severe**, and it is **not this
   feature's**. Measured at 1440: layout root 1161.03, `scrollHeight` 1320
   (159px), `html` and `body` both `rgba(0,0,0,0)`. Screenshot shows a full
   white band under the footer on a dark site. The trigger is the Hero's
   `cierre` glow, but the defect is the **site background contract not
   covering document overflow** — owner is **feature 6** via
   `app/layouts/default.vue`, outside this feature's declared reach. Correctly
   reported rather than worked around. **Must be fixed before any deploy;
   raise as a feature 6 defect.**
2. **Mobile nav 78.19 vs 76.** Correct to report, not absorb. See arithmetic
   above. Human's call, does not block.
3. **Reveal unobservable at 1440×900.** Max scroll is 420 against a Hero
   bottom at y776 — reproduced. The behaviour itself is correct and
   demonstrated at 1440×420; it is unobservable only because the page is one
   section long today, and it resolves the moment section 02 ships. Not a
   defect. Approving.

## Additional finding the reviewer raises (not the implementer's to fix)

**The pinned nav has no background, and at scroll 420 the Hero headline runs
straight under the lockup and the nav links** — both become unreadable
(captured). This is spec **D-07**, faithfully implemented per `ui-map.md` § 2
("el mismo fondo", compressed state dropped). The implementer was right not to
invent a background. **Roberto/Clau must decide**, and it is more urgent than
the report implies: it is visible today at every desktop height, not only the
short ones.

## Advisories (none blocking)

- Anchor the `CTA_STATE` regex (above).
- `SiteNav.vue` is 285 lines vs Article V's 200 — but 137 are documentation
  comments (130 code lines), and `CursorSpotlight.vue` (286) set the precedent
  through this same gate in feature 8. Consistent, not a violation to punish
  here; worth a constitution clarification on whether the limit counts
  comments.
- `docs/harness/progress/current.md` still says feature 9 is `in_progress`
  while `feature_list.json` says `reviewing` — leader's file to refresh.

## Verdict

**APPROVED.**
