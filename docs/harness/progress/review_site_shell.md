# Review verdict: site_shell (feature 003)

**Reviewer**: reviewer agent · **Date**: 2026-09-07
**Status in `feature_list.json` at review time**: `reviewing` ✅ (confirmed before starting)

> **This file records two rounds and is append-only.** Round 1 (below) returned
> **REJECTED** on one substantive gap, after two further findings were
> withdrawn on a provenance correction from the leader. Round 2 (at the end of
> this file, 2026-09-07) re-reviewed the delta and returns the **current
> verdict**. Nothing above has been rewritten.

---

## Round 1 — REJECTED

**One reason.** Everything else is green and verified by reproduction, not by
reading the implementer's summary.

> **Provenance correction, 2026-09-07.** An earlier revision of this file
> carried two further rejection items: an undisclosed widening of `biome.json`
> and an overwritten, backdated `rules.md` § R20. **Both were withdrawn.** The
> leader reported — after this review was first written — that both edits are
> **theirs**, made on 2026-09-06 before this feature began, and left
> uncommitted at Roberto's instruction so they would ride along with feature 3.
> They were already in the working tree when `feat/site-shell` was created and
> the implementer was launched. I could not have distinguished them from the
> implementer's work: `git` cannot attribute or date an uncommitted change, and
> the mtimes were overwritten by my own restore during this review. The
> attribution therefore rests on the leader's account, not on evidence I
> gathered. Its consequences:
>
> - The implementer's "Nothing existing was overwritten" **was accurate about
>   its own work.** It shipped no undisclosed lint suppression and did not
>   touch § R20.
> - § R20's "**Resuelto 2026-09-06.**" is **not backdated** — it was written on
>   the 6th, which is when the change was made. It only reads as backdated if
>   one assumes the implementer wrote it today, which I did.
> - The substance of the `biome.json` widening is sound and was already
>   recorded as such in § R20: the rule guards single-word components against
>   colliding with HTML elements **when registered globally**, Nuxt auto-imports
>   only from `app/components/`, and everything in `app/shared/ui/` is
>   explicitly imported — so no global registry exists and the rule's premise
>   does not hold there. It stays active everywhere else. My own reproduction
>   stands and is consistent with this: reverting `biome.json` leaves
>   `pnpm check` at exit 0 with four `info` diagnostics, which is exactly the
>   noise the override was made to remove.
>
> The rejection rests **solely** on the missing-test gap below, which is
> unaffected and is not softened.

### C7 — acceptance criterion 6 and SC-001/SC-003 are covered by no test

`feature_list.json` criterion 6 ("A Nuxt layout in `app/layouts/` renders Nav
and Footer so every page gets the shell; `app/pages/nosotros.vue` resolves at
`/es/nosotros` and `/en/about` via i18n custom route paths"), spec SC-001
("4 routes resolve … and `/` reaches the Spanish home") and SC-003 ("8 locale
transitions") have **no test file**.

- There is no test that mounts `app/layouts/default.vue`.
- There is no test that asserts `i18n.pages` maps `nosotros` to `/nosotros`
  and `/about`, nor that the four route files are emitted, nor that
  `public/index.html` points at `/es`.
- `resolveLocaleDestination.test.ts` names ("should translate the segment back
  when switching to Spanish", "should round trip …") assert over **fixture
  strings**; they never touch the real route map. That scoping is deliberate
  and correct per the contract, but it means nothing in the suite covers the
  mapping itself.
- `pnpm generate` is not coverage here: deleting `nosotros.vue` would still
  produce an exit-0 build with fewer routes.

The implementer verified all three by hand against `.output/public` — that
work is real and it reproduces, but it is not repeatable by the suite, which
is what C7 asks for.

**To close**: one component test mounting the layout (Nav + Footer present),
and one test asserting the route/root-document contract — either against
`i18n.pages` in the config or against the generated file set.

---

## Ruling on the four items the leader flagged

**1 · `tests/i18n-parity.test.ts` was false-green — CONFIRMED, and the fix is
real.** Negative control run: set `shell.footer.tagline` to `""` in
`en.json`, ran the suite, got `Tests 1 failed | 1 passed` with
`+ ["shell.footer.tagline"]` at line 45; restored, green again. The test can
now fail. The AST diagnosis in § R27 is consistent with what the current
disk-read implementation avoids, and reading with `node:path` +
`process.cwd()` rather than `new URL` is correct under the `happy-dom`
environment.

**2 · A literal `@` in a locale file breaks the build — CONFIRMED.** Replaced
`support{'@'}muush.dev` with `support@muush.dev` in `en.json` and ran
`pnpm generate`: four `[500] Server Error` prerender failures and
`ERROR Exiting due to prerender errors`. Restored and regenerated: exit 0, and
`.output/public/es/index.html` renders `support@muush.dev` literally, so the
`{'@'}` escape both compiles and renders correctly. § R26's scope note is
right — the `mailto:` and the TikTok `@` live in TypeScript and are
unaffected. This constrains every future locale string carrying an email or a
handle and is correctly recorded.

**3 · `i18n.rootRedirect` emits no file — CONFIRMED; the fallback is
legitimate.** Reproduced independently: moved `public/index.html` aside, added
`nitro.prerender.routes: ['/']` alongside `rootRedirect: '/es'`, deleted
`.output`, ran `pnpm generate` → exit 0, 12 routes prerendered,
`.output/public/index.html` **does not exist**. The negative result is exactly
as reported. A committed `public/index.html` is the correct answer for static
S3 + CloudFront: the option is runtime-only by Nitro's design, so this is not
papering over a misconfiguration. Keeping `rootRedirect` (it governs
`nuxt dev` and the client router behind a `200.html` SPA fallback) while
deleting the no-op prerender entry is the right call. The file itself is sound
— meta refresh, canonical, the full `hreflang` set with `x-default` on `/es`,
`noindex`, and a real `<a href="/es">` so it works with neither scripting nor
refresh.

**4 · The undeclared props — both justified; one had a marginally cleaner
in-contract shape.**

- **`SiteNav.navLabel/menuLabel/menuOpenLabel/menuCloseLabel` and
  `MobileMenu.label/closeLabel` — necessary, no in-contract option existed.**
  The hamburger and the close control are icon-only buttons and the panel is
  `role="dialog" aria-modal="true"`; all three require accessible names
  (FR-014, FR-031). Article VI forbids the strings in the component and the
  module's own convention forbids `ui/` calling `useI18n`, so a prop is the
  only remaining route. They are wired from `t()` in the layout. The
  contract's explicit rejection list (`variant`, `theme`, `size`, `sticky`,
  `compact`, `transparent`, `showCta`) does not reach them. `navLabel` is the
  weakest of the four — a sole `<nav>` landmark needs no name — but it is
  harmless and consistent.
- **`ShellItem.messageKey` — justified, though an in-contract option did
  exist.** FR-040 needs a locale-specific pre-filled WhatsApp message and the
  four-variant `ShellDestination` union has nowhere to put it; refusing to add
  a fifth variant is right, since FR-039 rests on that union being exactly
  four. The alternative the summary does not mention is carrying it *inside*
  the `external` variant (`{ kind: 'external'; href: string;
  messageKey?: string }`), which keeps `ShellItem` exactly as narrated and
  scopes the field to the only kind that can use it. Functionally identical;
  the shipped shape is reasoned in a JSDoc block and is acceptable. Verified
  in the output: `https://wa.me/525639060739?text=Hola%20muush%2C%20me%20interesa%20platicar%20sobre%20un%20proyecto.`

---

## Known-open items — confirmed still flagged, not silently resolved

- **A-01 (1024px breakpoint)** — marked `⚠️ UNVERIFIED` in
  `logic/useMobileMenu.ts` beside `DESKTOP_MEDIA_QUERY`, and raised to Clau in
  `decisions-open.md` ("Breakpoint y tope de contenido sin definir", detected
  2026-09-07).
- **A-02 (1440px content cap)** — marked `⚠️ UNVERIFIED — ningún documento lo
  respalda` on `--spacing-shell-max` in `global.css`, and in the same
  `decisions-open.md` row.
- **Decision #2 (Google Calendar)** and **#3 (FAQ)** — both still listed as
  open in `decisions-open.md` rows 2 and 3. In the generated Spanish page they
  render as `<span class="text-ink-300">Agenda una llamada</span>` and
  `<span class="text-ink-300">FAQ</span>`, identical to
  `<span class="text-ink-300">Blog · próximamente</span>`. Zero anchors carry
  an invented URL; zero anchors ship without an `href`.
- **Pill and LinkArrow are composed nowhere in the shell** —
  `grep 'Pill\|LinkArrow\|GlassPanel\|Radar\|SectionGlow'` over
  `app/features/shell/`, `app/layouts/`, `app/pages/` returns nothing. Only
  `Lockup`, `BotonPrimario` and `SocialIcon` are consumed, matching the
  corrected criterion 7.

---

## Checkpoints C1–C8

| | Result |
|---|---|
| **C1** Harness complete | ✅ all base and harness files present; `./init.sh` exits **0** |
| **C2** State coherent | ✅ one feature active (`site_shell`, `reviewing`); ⚠️ `current.md` still describes the *spec* session ("Agent: spec_author", "`pending` → `spec_ready`") rather than implementation — leader-side hygiene, not counted as a defect |
| **C3** Architecture (I–III) | ✅ see below |
| **C4** Constitution | ✅ see below |
| **C5** Verification real | ✅ 195 tests / 19 files green; 3 new stories; `pnpm generate` and `pnpm storybook:build` pass |
| **C6** Session closed | ⚠️ `history.md`'s last entry is feature 5; feature 3 has none yet — leader-side, expected after this verdict |
| **C7** SDD | ❌ **the sole rejection reason — see above**. All 45 tasks `[x]`; `spec.md` has no `[NEEDS CLARIFICATION]`; `plan.md` gates checked |
| **C8** i18n parity | ✅ see below |

### C3 — Articles I–III, verified by grepping every import

- `app/features/shell/` has `ui/`, `logic/`, `data/` and `index.ts`. ✅
- **`data/` → `logic/` or `ui/`: zero.** `navigation.ts`, `footerColumns.ts`
  and `socialProfiles.ts` import only from `./types` and each other.
  `data/types.ts` has one outside import — `import type { SocialNetwork } from
  '@/shared/ui/SocialIcon.vue'` — which is `app/shared/`, explicitly permitted
  by Articles I and III, type-only and erased at build. It is **not** the
  feature's own `ui/`. Correctly self-flagged by the implementer.
- **`logic/` → `ui/`: zero.** `useShellNavigation.ts` imports `data/*` and the
  sibling pure function; `useMobileMenu.ts` imports only `vue`.
- **Outside the module reaching past the barrel: zero.** The single external
  importer is `app/layouts/default.vue`, `from '@/features/shell'`.
- **Shell importing another feature's internals: zero** — no other feature
  module exists yet, and nothing imports outside `@/shared/` and `@/assets/`.
- No component over 200 lines (largest: `MobileMenu.vue` 179, `SiteNav.vue`
  158). No function near 30 lines.

### C4 — Articles IV, V, VII, XII

- **IV**: no `server/` or `app/server/` directory; `nitro.preset: 'static'`. ✅
- **V**: all five SFCs use `<script setup lang="ts">`; no Options API
  anywhere. ✅
- **VII**: `grep -rnE '#[0-9a-fA-F]{3,8}|\[[0-9.]+px\]|[0-9]+px'` over
  `app/features/shell/`, `app/layouts/default.vue`, `app/pages/nosotros.vue`
  returns **two hits, both inside prose comments** ("28px at exactly 1440",
  "the same 14px gap"). Zero in markup. `grep -rn 'var(--color-'` over
  `app/features/` and `app/layouts/` returns **zero** (§ R18 holds). ✅
- **XII**: `grep -rn "from '\.\./"` over `app/features/`, `app/layouts/`,
  `app/pages/` returns **zero** — every cross-directory import is aliased,
  relatives are same-directory only. No new alias was introduced, and all six
  existing ones are mirrored in `.storybook/main.ts`. ✅

### C8 — Article VI

- Both locale files carry an identical key tree; parity suite green and now
  genuinely falsifiable (item 1 above).
- Zero hardcoded user-facing strings in any shell component — every string
  arrives as a prop resolved by `t()` in `useShellNavigation` or the layout.
- The toggle resolves through `useSwitchLocalePath` + the pure
  `resolveLocaleDestination`; no prefix string substitution exists in the
  module.
- Four routes prerender: `es/index.html`, `en/index.html`,
  `es/nosotros/index.html`, `en/about/index.html`, plus the root document.

---

## Verified against `design-extract.md` § 9.bis and § 10

Every token's `clamp()` was evaluated at both frame widths (390 / 1440) and
matched to the recorded value. All correct:

- **Nav** — container padding `[22,24]` → `[30,80]` (`--spacing-nav-y`
  22→30 ✓, `--spacing-page` 24→80 ✓, reused not duplicated); right-group gap
  14→30 ✓; toggle gap 5→6 ✓; nav link 15px/500 bone-300 ✓; toggle 12→13,
  active bone-100/600, divider ink-300, inactive ink-200/500, tracking
  0.8÷13 = 0.062em ✓; hamburger radius 10 (`--radius-icon`), border
  bone-100 @18% = `#FBF8F62E` ✓, padding `[12,11]` ✓, bars 16×1.6 with
  `cornerRadius 1` ✓, gap 5 ✓; **no CTA below `lg`**, commented as a decision ✓.
- **Footer** — padding `[52,24,32,24]` → `[80,80,44,80]` ✓; gap 40→56 ✓;
  brand gap 10→20 and width 340 ✓; columns gap 20→64 ✓; column gap 12→16,
  item gap 9→11, title red-300 11/600 ls 1.1 → 12/600 ls 1.2 = 0.1em exactly ✓,
  items ink-100 14→15 ✓; bottom bar hairline bone-100 @12% unified per FR-042 ✓,
  padding-top 22→26 ✓, `space_between` at `lg` / stacked with gap 6 below ✓,
  texts ink-300 12→13 ✓; four columns flex from a 180 basis with the gap
  yielding, per A-16/R24 ✓.
- **Mobile menu layer stack** — panel `fixed inset-0`, fill
  `--color-glass-dark` (dark-glass @65% = `#1c1416a6` ✓), blur
  `--blur-menu-panel: 1.25rem` = 20 ✓, no border, no radius, no padding ✓; nav
  row absolutely positioned at the top edge with the same `[22,24]` container ✓;
  close control padding 10, glyph 18×18 bone-100 inlined via `?raw` +
  `:deep(svg)` ✓; items at `pt-menu-top` 176 from the panel edge, gap 30,
  bone-100 30px/600 ls −0.9 = −0.03em, line-height 1.1 load-bearing ✓; divider
  at +50 in `--color-divider-menu` = bone-100 @8% (`#FBF8F614` ✓); social row
  at +44, centred, gap 14 ✓. The frame's absolute y-coordinates (176/448/493)
  are correctly reconstructed as flow: 176 + (4 × 30 × 1.1 + 3 × 30) = 398,
  +50 → 448, +1 +44 → 493. Arithmetic checks out exactly.
- **ES/EN copy table** — all 17 rows match byte for byte, including the
  untranslated proper nouns (`Work with muush`, `FAQ`, `Technology solution
  studio`), `Blog · próximamente` / `Blog · coming soon` as one string with its
  separator inside, and both `©`/`·` characters. `tests/shell-copy.test.ts`
  pins the three easy-to-"fix" entries.
- **Destinations** — `mailto:support@muush.dev` in the same browsing context
  (no `target="_blank"`); `wa.me/525639060739` with the encoded locale message;
  the three profiles with `target="_blank" rel="noopener noreferrer"`. ✅

---

## Notes that are not rejection reasons

- **`shell.footer.label` is dead copy.** Present in both locale files, in
  parity, referenced nowhere — `SiteFooter` has no accessible-name prop and
  its `<footer>` needs none. Article VIII ("no dead code"); one line to delete
  from each locale file, or wire it.
- **`useShellNavigation` has no direct test.** `resolveHref` / `resolveItem`
  carry the FR-041 anchor rule, the `mailto:` exception and the `current`
  marking. The spec deliberately scoped unit testing to the pure
  `resolveLocaleDestination` so the suite tests the repository rather than the
  i18n module, and that reasoning is sound, so this is not counted against
  C5 — but the behaviour is currently proven only through the generated HTML.
- The `<a href="mailto:…">` emitted by `NuxtLink` carries
  `rel="noopener noreferrer"` (NuxtLink's own default for protocol links)
  without `target="_blank"`. Matches T037's requirement.

---

## What a re-review needs

One thing: a test covering acceptance criterion 6 / SC-001 (and, ideally,
SC-003). Nothing else.

The module itself is the cleanest work in this repository so far: the layering
is exact, the tokens are arithmetically correct against the design, the copy is
byte-faithful, and the three findings the implementer reported all reproduce.


---
---

# Round 2 — re-review of the delta (2026-09-07)

Scope as directed by the leader: the delta only. Articles I–III (by import
grep), V, VI, VII, XII, the `clamp()` tokens against § 9.bis at both frame
widths, A-01/A-02 still flagged, decisions #2/#3 as inert text, and
Pill/LinkArrow absent were all verified green in round 1 and are not re-derived
here. The delta could not plausibly have disturbed them, and `./init.sh`
re-run confirms the gates still hold.

## APPROVED

The round 1 rejection is **closed**. The three changes do what they claim, and
the one that mattered — the new build-output suite — was proven falsifiable by
three negative controls rather than accepted on report.

### 1 · The C7 gap is genuinely closed — negative controls run, all red

`tests/static-output.test.ts` (20 cases) plus `tests/global-setup.ts`. This is
exactly the shape of test that can pass forever while asserting nothing, so it
was attacked rather than read.

| Control | Result |
|---|---|
| **NC1** — delete `public/index.html` | ❌ **red**: `ENOENT … .output/public/index.html` at line 78. `Tests 1 failed \| 19 passed` |
| **NC2** — point the root at `/en` instead of `/es` | ❌ **red**: `expected … to match /<meta http-equiv="refresh" content…/es"`. `Tests 1 failed \| 19 passed` |
| **NC3** — change `i18n.pages.nosotros.en` from `/about` to `/about-us` | ❌ **red**: `Tests 10 failed \| 10 passed` — the route-document check, the About-resolves-at-both-paths check, the dangling-anchor sweep, four of the eight toggle-equivalence cases, the fragment and empty-destination guards, the `hreflang` cross-check, and the nav/footer presence check on `/en/about` |
| Restored, full suite | ✅ 216 passed |

**NC1 is the strongest single result and it settles a second question at the
same time.** Before that run, a stale `.output/public/index.html` from my own
round 1 experiments was sitting on disk. The test still went red — which is
only possible if `globalSetup` rebuilt the site from scratch first. So the
suite provably reads the **current** artefact, not whatever was last left
behind. The implementer's decision to reject an "only build if the output is
missing" guard is the right one and is what makes this hold; that reasoning is
recorded in `tests/global-setup.ts` and correctly cites § R27 as the same class
of mistake.

**NC3 is what actually closes acceptance criterion 6 and SC-003.** Ten
assertions fail when the translated segment is wrong — the criterion is not
merely touched, it is covered from several independent directions. SC-001 is
covered by NC1/NC2.

Two design details worth recording as correct rather than incidental:

- The suite asserts on `.output/public` — the deployed artefact — rather than
  on source. That is the only place SC-001 and SC-003 are observable, and the
  file's own header says so and explains why a mounted component cannot reach
  them. It also correctly uses `node:path` + `process.cwd()` rather than
  `new URL`, per §§ R16/R27.
- The byte-identical-nav assertion (`should render the same nav markup on the
  landing and on About`) strips exactly two things before comparing — `href`s
  and the active-page marking — and documents why each **must** differ. Not
  stripping the hrefs would have made the test assert that SC-003 is broken.
  That is a subtle trap and it was avoided deliberately.

### 2 · `messageKey` moved into the `external` variant — contract now exact

`ShellItem` is now precisely what `contracts/components.md` narrates:

```ts
export interface ShellItem {
  labelKey: string
  destination: ShellDestination
}
```

No undeclared shape remains on it. `messageKey?: string` now lives inside the
`external` variant, so the union still has **exactly four** members and FR-039
rests on the same ground it always did. The move is a strict improvement over
what I ruled merely acceptable in round 1: a pre-filled message can no longer
be attached to a route, an anchor, or an item with no destination — those
combinations are now unrepresentable rather than just unused, and the JSDoc
says so.

Nothing downstream broke. `useShellNavigation` destructures
`const { href, messageKey } = destination` inside the `external` case with an
early return; `footerColumns.ts` and `footerColumns.test.ts` follow the new
shape. `pnpm typecheck` and all 216 tests pass, and the emitted WhatsApp href
is unchanged.

### 3 · The token count is right, not merely different

Counted independently from the `global.css` diff rather than from the
document: **2** colours + **1** blur + **1** radius + **27** spacing + **8**
type roles (base declarations, excluding their `--line-height` /
`--letter-spacing` / `--font-weight` companions) = **39**. `data-model.md`
§ 2.5 now reads "39 additions: 2 colours, 1 blur, 8 type roles, 27 spacing
values and 1 radius" and § 2.4's heading reads "28 additions (27 spacing +
1 radius)". Both match. The correction carries a dated note explaining the
prior slip instead of silently overwriting it.

### 4 · Gates, and no regression

`./init.sh` re-run: **exit 0**, no `[WARN]`, no `[FAIL]`.
**216 tests in 20 files**, all green — up from 195 in 19.

- **Suite duration**: 1.49s → 6.11s. The ~4.6s is the `pnpm generate` in
  `globalSetup`. Documented in the file ("the price of the assertions being
  real") and acceptable; it does land on the pre-push hook.
- **No test-to-test ordering dependency introduced.** `globalSetup` completes
  before any file loads — `static-output.test.ts` depends on the setup, never
  on another test. The one genuine shared-state risk in this module predates
  the delta and is already handled: `useMobileMenu`'s module-scoped `isOpen` is
  reset in `afterEach` in **both** files that touch it
  (`useMobileMenu.test.ts:23`, `SiteNav.test.ts:66`), and Vitest isolates
  module registries across files. Article X holds.
- **No destabilisation.** Ran `static-output.test.ts` alone four times across
  the controls; results were deterministic each time, and the full suite is
  green before and after.

## One note, not a defect

`pnpm test` now always builds the site, so a broken build fails all 216 tests
rather than only the output suite. That coupling is the deliberate cost of
asserting on the real artefact and is documented at the point of decision. It
is worth remembering the next time a test failure looks unrelated to the test.

## Carried forward from round 1, still open, still not defects

- `shell.footer.label` remains dead copy in both locale files — in parity,
  referenced nowhere. One line to delete or wire (Article VIII).
- `useShellNavigation` still has no direct test; the spec deliberately scoped
  unit testing to the pure resolver, and the new output suite now covers the
  composable's observable behaviour end to end, which improves this materially.
- `current.md` still describes the spec session, and `history.md` has no
  feature 3 entry — both leader-side closure items (C2, C6).

## Checkpoints

C1 ✅ · C2 ✅ (leader-side hygiene noted) · C3 ✅ · C4 ✅ · C5 ✅ ·
C6 ⚠️ leader-side · **C7 ✅ — now green** · C8 ✅

## Verdict

**APPROVED.**

The feature may move to `done`. The working tree was restored to its exact
pre-review state after every control (`git status` matches the 26 entries it
carried on entry); the only file this review wrote is this one.
