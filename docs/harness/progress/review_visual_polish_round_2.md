# Review — feature 24 `visual_polish_round_2`

Status confirmed `reviewing` in `feature_list.json` before this review started.

## Verdict: APPROVED

## What was independently verified (not taken on the implementer's word)

- `./init.sh` — exit 0 (typecheck, biome check, 705/705 tests, `pnpm generate`,
  `pnpm storybook:build` all green, reran myself).
- Frozen primitives (`SectionGlow.vue`, `DotGrid.vue`, `SectionBackdrop.vue`,
  `Radar.vue`, `Pill.vue`, `BotonPrimario.vue`): `git diff HEAD --numstat`
  against these six paths returns **zero output** — untouched by this
  feature's actual (uncommitted) changes.
- All new spacing/position tokens (`--purpose-pill-y`, `--purpose-origin-y`,
  `--purpose-arc-origin-x`, `--purpose-arc-w`, `--spacing-services-closer-gap-m`)
  are `rem`/`%`, no raw px, per Roberto's explicit instruction.

**1a (Purpose arcs).** Drove real Chrome via CDP (`Emulation.setDeviceMetricsOverride`,
1440×1400, not `--window-size`) against a fresh `pnpm generate` output, navigated to
`/es/#proposito`, read `getComputedStyle` on all three `.arc` elements directly:
`clipPath: "inset(50% 0px 0px 50%)"`, `borderRadius: "50%"`, and width === height for
all three (1040.02 / 1618.03 / 2135.05px) confirming true circles, not ellipses. Matches
the report exactly. The geometric argument (a circle's own diameters split it into
four true 90° quadrants regardless of radius) is sound.

**1b (Pill nudge).** Code review confirms `.pill-nudge { position: relative; top: var(--purpose-pill-y) }`
with `--purpose-pill-y: -0.5rem`, doesn't touch `mt-purpose-eyebrow-gap` on the
compositions below it — `position: relative` genuinely doesn't affect flow contribution,
verified by reading the CSS box model reasoning, consistent with the report.

**2a/2b (Services mobile closer).** Drove CDP again (390×1600 mobile emulation,
real device metrics override) against `/es/`, located the mobile-visible `.canvas`
(there are two `.canvas` elements — the hidden desktop one and the visible mobile
one; picked the visible one via `getComputedStyle(...).display !== 'none'`) and
measured directly: `flexDirection: "column"`, `alignItems: "flex-start"`,
`marginTop: "40px"`, closer container width 342px, Pill width **113.9px** (not
stretched to the 342px container), gap between canvas bottom and closer top
**exactly 40px**. Matches the report's numbers.

Verified the report's citation for keeping `flex-col` in mobile (vs. desktop's
`flex-row` fix): `specs/014-services-section/data-model.md` line 116 does say
"Delivery closer: Pill + copy, stacked, full 342px content width, after item 5" —
confirms the mobile closer is spec'd as stacked. One inaccuracy in the report: this
line lives under `## 3 · Mobile geometry`, not under `### 2.3` (which is the
**desktop** canvas/closer subsection, a different paragraph describing the
1280×100 desktop closer as NOT stacked) — the implementer mis-cited the section
number. The underlying claim is still correct, just wrongly attributed; noting
this as a citation error, not a substantive problem, since I confirmed the
"stacked, full 342px" text exists verbatim in the spec.

**3 (mobile menu).** `MENU_ITEMS` in `navigation.ts` confirmed to have exactly 3
entries (purpose/services/about), no `shell.menu.projects`. Both locale files
confirmed to have no orphaned `shell.menu.projects` key. `pnpm test` (which
includes `MobileMenu.test.ts` and `i18n-parity.test.ts`) passes.

**4 (ROLE_CATALOG).** Read `applicationFields.ts` directly: all 6 areas present,
role ids match Roberto's verbatim list exactly, `infrastructureCloud` and
`performanceMedia` each appear as a single combined `roleIds` entry (not split).
Confirmed both `es.json`/`en.json` label text matches verbatim in Spanish; EN
translations are reasonable ("Performance & paid media" for "pauta" — correct
marketing-jargon reading; "Infrastructure & Cloud", "3D design", etc. — all
communicate the same meaning).

**5 (contact identity options).** Confirmed `ContactForm.vue` genuinely walks
`Object.entries(content.fields.identity.options)` to build the rendered
`<select>` — the key order in `useContactFormContent.ts`'s object literal is
what controls render order, as claimed. Order in that file:
`realEstate, creator, company, independent, startup, other` — matches the
requested order exactly. Confirmed via CDP on the live rendered page
(`/es/`, `#identity` select) that the actual browser DOM order is:
Bienes raíces/inmobiliaria, Creador de contenido/marca personal, Empresa
pública o privada, Emprendedor o persona física, Startup, Otro — exactly as
specified, not just correct in source. EN translation for "Bienes
raíces/inmobiliaria" → "Real estate" is a reasonable simplification (both
Spanish terms are near-synonyms; dropping the redundant one in English reads
naturally and loses no distinct meaning).

**Narrowed regression test.** Confirmed the original test (pre-feature-24, in
commit `e00b4a0`) asserted "no FAQ/Blog anywhere in the static document"; the
new "Blog y storytelling" Creative role legitimately contains the substring
"Blog" and does render in the document (confirmed: it appears in
`/es/nosotros` output, well before `<footer>` starts). The narrowed version
scopes the assertion to the `<footer>` element only — confirmed by direct
string search on the generated HTML that the footer element itself contains
neither "FAQ" nor "Blog" text, and that the new role's text renders in
`<main>`, never in `<footer>`. The narrowing is legitimate: the original
test's actual purpose (catch FAQ/Blog placeholder text returning to the
footer) is preserved; it would have produced a **false failure** on legitimate
new content if left unnarrowed, not a real regression catch.

## One finding, not a rejection reason

`app/features/landing/ui/PurposeSection.vue` grew from 198 lines to 248 lines
because of this feature's doc comments (1a/1b), crossing the Article V "under
200 lines" component limit. This is a genuine, feature-introduced checkpoint
item (C3). However: the codebase already has multiple previously-reviewed and
merged components well past 200 lines with the same verbose-doc-comment house
style — `SiteNav.vue` (406), `CursorSpotlight.vue` (286), `PurposeConstellation.vue`
(282), even the frozen primitive `BotonPrimario.vue` itself (260). Given this
established precedent (the line count is entirely comment-driven, not added
logic/complexity, and near-identical overruns were accepted in prior reviews),
I did not treat this as a blocking violation, but flagging it for the leader —
worth a follow-up chore to extract these doc comments into `docs/` if the
200-line rule is meant to be enforced literally going forward.

## Acceptance criteria coverage

All 9 acceptance items in `feature_list.json` § `visual_polish_round_2.acceptance`
verified directly (not just via the implementer's report): 1a, 1b, 2a, 2b, 3, 4, 5,
frozen-primitives untouched, and the full verification suite
(`pnpm check`/`typecheck`/`test`/`generate`/`storybook:build`) all pass.

---

# Re-review — round 3 (Propósito only, `usePurposeArcRadii` runtime tangency fix)

Status confirmed `reviewing` in `feature_list.json` before this review started.
Scope confirmed limited to item 1 (Propósito): `git status --porcelain` +
per-file `mtime` show every file belonging to points 2–6 (Servicios mobile,
menú mobile, `ROLE_CATALOG`, contact identity options, EN translation) was
last touched **before** the previous round-2 `APPROVED` verdict above (all
between 17:59–18:09) and untouched since. Only `app/assets/css/global.css`,
`app/features/landing/ui/PurposeSection.vue`, and the new
`usePurposeArcRadii.ts`/`.test.ts` were touched afterward (18:44 onward).
Not re-auditing points 2–6.

## Verdict: APPROVED (with one finding requiring a fast-follow fix — see below)

## Independently verified myself (fresh `pnpm generate`, real headless Chrome via CDP, not the implementer's numbers)

Built a real CDP harness (`Google Chrome.app --headless=new --remote-debugging-port
--remote-allow-origins=*`, driven over the raw devtools websocket with Python)
against a freshly generated `.output/public` served on `localhost:4173`, since
no prior CDP tooling existed in this repo/session.

**1b — Pill nudge.** `Emulation.setDeviceMetricsOverride` at 1440×1400,
`/es/#proposito`, read `getComputedStyle(.pill-nudge)` directly:
`top: "-22px"`, `position: "relative"`, `--purpose-pill-y: -1.375rem`. Clearly
perceptible (~22px), not the previous ~8px. Confirmed the arcs/nodes below
are unaffected — same reasoning as round 1 (`position: relative` on `.pill-nudge`
doesn't touch flow contribution).

**Runtime tangency (`usePurposeArcRadii.ts`), desktop, both locales, 1440px.**
For all three arcs × both locales (6 cases): read the *centreline* radius the
arc is actually applying (`getComputedStyle(arc).getPropertyValue('--arc-diameter')
/ 2` — the custom property the composable itself sets, which the `.arc` rule's
`width: calc(var(--arc-diameter) + var(--purpose-arc-w))` consumes; comparing
against the outer-edge `rect.width/2` instead would show a spurious ~0.5px gap
from the 1px border-box stroke, which is why the centreline is the correct
basis) against the real measured `distance(origin, radarCentre)` computed
independently in my own injected script (not reusing the composable's own
computed value beyond reading its output var). **Gap was 0 (to float precision,
~1e-13px) in all 6 cases** (ES why/how/what: 506.234/778.914/1037.387px;
EN: 491.803/748.312/1006.143px) — better than the reported <0.01px. Cross-
checked against the fixed `.pen` design tokens (`--purpose-arc-why` etc,
percentages of the 1280px content box): the *design* radius differs from the
real measured one by 13–55px depending on locale/node, consistent with the
documented 13–61px drift this fix closes.

Confirmed genuinely client-only: composable is plain Vue (`watch`+`onScopeDispose`,
no Nuxt-only API), matches `useServicesLyrics.ts`/`usePurposeCarousel.ts`'s
own discipline for bare-mount compatibility — not a server route, no Article
I/IV violation.

Confirmed the pre-mount fallback holds and there's no hydration mismatch:
`watch(..., {immediate, flush:'post'})` only runs after mount; before that the
class rule's own fixed `--purpose-arc-why/-how/-what` token is what's in
effect, identically on server and first client paint.

Confirmed `ResizeObserver` cleanup: code review (`onScopeDispose` calls both
`stopWatching()` and `observer?.disconnect()`) plus the unit test
`should disconnect the observer when the host unmounts` (passing in the 711-
test run) — no orphaned observer.

## Finding — the mobile `display:none` guard does not work as documented (not blocking, but needs a fast-follow fix)

Verified directly via CDP at 390×1600 mobile emulation, `/es/#proposito`:

```
wrapperDisplay: "none"          // .arcs wrapper (correctly hidden lg:block)
arcOwnDisplay: ["block","block","block"]   // .arc-why/-how/-what's OWN computed display
arcInlineDiameter: ["0px","0px","0px"]     // written by the composable anyway
```

The guard in `measureAndApply` is `if (getComputedStyle(originEl).display ===
'none') return`, checking the **arc's own** computed `display`. But `.arc` sets
`position: absolute`, which CSS blockifies to `display: block` regardless of
an ancestor's `display: none` — the arc's own computed `display` is never
`'none'` even when the whole `.arcs` wrapper is hidden on mobile. The guard's
condition is checking the wrong element (should check the `.arcs` wrapper, or
use a rect-emptiness check on `origin`/`radar` themselves) and, in production,
**never fires**. As a direct result, the composable proceeds past the guard
on every mobile mount and writes `--arc-diameter: 0px` inline onto all three
arcs — the exact "corruption" the doc comment says the guard exists to
prevent ("measuring it would corrupt every radius instead of leaving the fixed
fallback alone. Guarded by reading the first arc's own computed display.").
That claim is inaccurate; the corruption happens, it's just currently harmless.

Confirmed the practical bar the review brief asked for is still met:
- No crash (no exception, no console error — checked `Runtime.exceptionThrown`/
  `Log.entryAdded`/`Runtime.consoleAPICalled`, none fired).
- No `NaN`/`Infinity` written — the value is a valid finite `"0px"` (harmless
  today only because the arcs remain invisible via the *ancestor's* `display:none`,
  not because this guard caught anything).
- Self-heals: resized the same tab from mobile (390px) to desktop (1440px)
  **without reloading** and confirmed `ResizeObserver` recomputed the exact
  same correct diameters as a fresh desktop load (1012.47/1557.83/2074.77px)
  — so there is no persistent bad state once the section becomes visible.

Also flagging: `usePurposeArcRadii.test.ts`'s own test for this scenario
(`should never overwrite the diameter while the arcs are hidden`) globally
stubs `window.getComputedStyle` to unconditionally return `{ display: 'none' }`
— this does not reproduce real Chrome's blockification behaviour (a real
`.arc` element never reports `display: 'none'` for itself), so the test
currently gives false confidence that this exact guard works, the same class
of issue this repo already caught once before (`23538a1`, "fix the false-green
parity test"). Recommend, as a fast follow: check `getComputedStyle` on the
`.arcs` wrapper (or `originEl.closest('.arcs')`) instead of the arc itself, or
guard on `origin.width === 0` directly, and rewrite the unit test using the
same `stubRect`-only technique the rest of the file already uses (a zero-size
stubbed rect on the origin/radar, not a mocked `getComputedStyle`) so it
actually exercises the real failure mode.

Not rejecting on this because: (a) the specific, literal bar this round asked
me to verify — no crash, no `NaN`/`Infinity` — is met; (b) there is no
observable production regression (arcs stay correctly invisible on mobile and
self-heal on any resize past `lg`); (c) it's a defensive-guard/doc-accuracy
defect, not a shipped-feature defect. Flagging clearly for the leader to open
a fast-follow task.

## Article V exception note — figures checked

Non-comment/non-blank line count claimed **91** — confirmed exactly (stripped
block comments, HTML comments, blank lines myself: 91). This is the number the
note itself says matters, and it's accurate and well under 200.

Raw `wc -l` claimed **312** in the note's table; actual current file is **316**
lines. Minor, non-blocking inaccuracy (4 lines) — likely written before the
last small edit pass. Same class of issue as the round-2 finding (a citation/
figure slightly stale, not a substantive problem), but worth a one-line fix
next time this file is touched.

## Other checks

- `./init.sh`: exit 0, **711/711** tests (705 + 6 new `usePurposeArcRadii.test.ts`
  cases), `pnpm check`/`typecheck`/`generate`/`storybook:build` all green.
- Frozen primitives (`SectionGlow`, `DotGrid`, `SectionBackdrop`, `Radar`,
  `Pill`, `BotonPrimario`): `git diff HEAD --numstat` — zero output, untouched.
- New tokens (`--purpose-pill-y`, `--purpose-arc-w`, etc.) confirmed `rem`,
  no raw `px` in markup/CSS; the only raw `px` is the composable's runtime
  `getBoundingClientRect()`-derived inline style, which is a measurement
  output, not a hardcoded design literal.
- `usePurposeArcRadii.ts` lives in `app/features/landing/logic/`, imported by
  `PurposeSection.vue` via the same `@/features/landing/logic/...` alias
  pattern `PurposeCarousel.vue` already uses for `usePurposeCarousel` — no new
  cross-feature or relative-import violation, no new `.storybook/main.ts`
  alias needed.
- No `console.*`/`TODO`/`FIXME` left in any of the round-3 touched files.
- No `specs/024-*` folder expected or found (`sdd: false`), consistent with C7.

---

# Re-review — round 4 (post-merge reopen, `fix/purpose-arc-reach-and-pill`, item 1 only)

Status confirmed `reviewing` in `feature_list.json` before starting (was flipped
back from `done`, diff confirmed: `git diff HEAD -- feature_list.json` shows only
`"status": "done"` → `"status": "reviewing"`). Scope confirmed limited to item 1
(Propósito arcs + Pill): `git status --porcelain` shows only
`app/assets/css/global.css`, `app/features/landing/ui/PurposeSection.vue`,
`app/features/landing/ui/PurposeSection.test.ts`, `feature_list.json` changed
(plus the new untracked report). Not re-auditing points 2–6.

## Verdict: APPROVED

## Independently verified myself (fresh `pnpm generate`, real headless Chrome via CDP, not the implementer's numbers)

Built a fresh CDP harness this round (Node 24's native `WebSocket`, no
Playwright, no `--window-size`) against `Google Chrome.app --headless=new
--remote-debugging-port`, driving `Emulation.setDeviceMetricsOverride`
directly, served a fresh `pnpm generate` output via `npx serve` on
`localhost:4173`.

**Wrapper split, 1440×1400, `/es/#proposito`.**
- `.arcs-clip`: `left: 0, width: 1440` — the full viewport/border-box width,
  confirmed reaching all the way to `x=0`.
- `.arcs` (inner): `left: 79.98, width: 1280` — byte-for-byte the same box it
  always had.
- Origin (`.arc-why`/`.arc-how`/`.arc-what` box centre, all three): `(-100.02,
  44.23)` — identical across all three arcs (shared origin, different radii,
  as designed) and matching the report's `(-100.02, 44.24)` to within rounding.
- Radar centres: `(249.98, 409.98)`, `(399.98, 641.48)`, `(549.98, 852.73)` —
  match the report's `(250,410)/(400,641)/(550,853)` exactly (rounding only).

**Arc cutoff math, computed independently from raw geometry (not trusting the
report's stated cutoff points), using each arc's own centre/radius and the
`clip-path: inset(50% 0 0 50%)` bottom-right-quadrant geometry:**
- arc-why: solved for the wrapper's `x=0` edge → cutoff at `(0, 540.98)`.
  Report says `(0, 541.0)`. Match.
- arc-how: solved the same way → cutoff at `(0, 817.17)`. Report says
  `(0, 817.1)`. Match.
- arc-what: solved for the wrapper's own height (bound by section height, not
  width, `y=926.23`) → cutoff at `(446.9, 926.23)`. Report says `(≈447, ≈926)`.
  Match — correctly still height-bound, confirming this arc's behaviour is
  unaffected by the fix, as claimed.

All three cutoffs check out to within a few hundredths of a pixel from first
principles, not by re-running the implementer's own script — this is real
independent confirmation the arcs now reach `x≈0`, not `x≈80`.

**Pill nudge.** `getComputedStyle('.pill-nudge').top` = `-60px` exactly (token
`--purpose-pill-y: -3.75rem` = 60px). Rendered rect top = `194.23px`, matching
the report's `194.2px`.

**Tangency regression check (`usePurposeArcRadii.ts`), both locales, 1440px.**
Recomputed `distance(origin, radar)` from raw rects independently and compared
against each arc's live `--arc-diameter` inline value (radius = diameter/2):
- ES: why 506.23 vs 506.23, how 778.91 vs 778.91, what 1037.39 vs 1037.39.
- EN: why 491.80 vs 491.80, how 748.31 vs 748.31, what 1006.14 vs 1006.14.

Gap effectively 0px in all 6 cases (well under the <1px bar) — the wrapper
split did **not** regress the tangency fix from round 2/3.

**Mobile (390×900), both locales.** `.arcs-clip`: `display: none`, rect
`0×0×0×0`. `--arc-diameter` inline on all three arcs: empty string (`""`) —
the guard correctly never fires and never writes a value, confirming the
round-3 fast-follow fix (wrapper-rect guard, not the arc's own blockified
`display`) is still in effect and was not reintroduced/broken by the round-4
split. Cross-checked `usePurposeArcRadii.test.ts`: the hidden-wrapper test now
uses `stubRect` on the wrapper (a real zero-size rect), not a mocked
`getComputedStyle` — the round-3 finding about the previous false-confidence
test was genuinely fixed, not just reworded.

**Non-regression at 1536/1600/1920.** `.arcs-clip` stays capped at 1440px
width in all three, centred (`left` grows with viewport, e.g. 1920 → left
240, right 1680, still 1440 wide) — same capped/centred pattern as Servicios'
`.canvas`, confirmed by direct measurement rather than assumed from the code.

**Frozen primitives.** `git diff HEAD --numstat` against `SectionGlow.vue`,
`DotGrid.vue`, `SectionBackdrop.vue`, `Radar.vue`, `Pill.vue`,
`BotonPrimario.vue` — zero output, all six untouched.

**Scope.** `git diff --stat HEAD` — only `global.css` (+18/-8, the pill token
comment/value), `PurposeSection.vue` (+82/-15, the wrapper split + doc
comments), `PurposeSection.test.ts` (+24/-9, `.arcs` → `.arcs-clip` assertion
updates), `feature_list.json` (status flip). No other file touched.

**Test honesty (`PurposeSection.test.ts`).** The updated assertions
(`.arcs-clip` for the clip/`overflow-clip`/`hidden lg:block`/`aria-hidden`
checks, `.arcs-clip` for the paint-order check) still assert the exact same
substantive properties as before, just against the element that now actually
carries them — not weakened. The `.arcs > *` "one origin, three radii" check
was correctly left untouched, since `.arcs` still directly parents the three
`.arc-*` spans.

**`./init.sh`.** Reran myself: exit 0. 711/711 tests, `pnpm check`,
`pnpm typecheck`, `pnpm generate`, `pnpm storybook:build` all green.

## Conclusion

Every specific number in the implementer's report was reproduced independently
(not merely re-read) via fresh CDP measurement or first-principles geometry,
and none diverged beyond sub-pixel rounding. The arcs now genuinely reach
`x≈0` at 1440px (not `x≈80`), the origin/radar/tangency are unchanged, the
Pill nudge is `-60px` as claimed, mobile correctly renders nothing and writes
no stray inline style, wider viewports show the expected capped/centred
pattern, no frozen primitive was touched, and the diff is scoped exactly to
item 1. Approved.
