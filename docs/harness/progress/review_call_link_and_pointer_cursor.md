# Feature 11 · `call_link_and_pointer_cursor` — review

**APPROVED.**

Status was `reviewing` when this began. `sdd: false`, so reviewed against the
nine `acceptance` entries, `decisions-open.md` § Decisión 2, `ui-map.md` §§ 3
and 6, `CHECKPOINTS.md`, `verification.md` and the Constitution. Nothing was
changed and the status was not touched.

## Gates — all green, run here

`./init.sh` **exit 0**: typecheck, check, test (**29 files, 349 tests, 0
failures**), generate (12 routes prerendered), storybook:build. No build lock;
the only live Nuxt processes belong to a different repository.

## The nine acceptance entries

| # | Verdict | Evidence |
|---|---|---|
| 1 | CONFIRMED | Hero anchor in `es/index.html` and `en/index.html`: `href="https://cal.com/muush/intro-call" target="_blank" rel="noopener noreferrer" class="… text-bone-100 …"` with the `→` span. Read off the generated artefact, not a mount |
| 2 | CONFIRMED | Footer `Agenda una llamada` / `Book a call` is a real anchor with `_blank` + `noopener noreferrer` on **all four** documents. `destination` moved `none` → `external` in `footerColumns.ts`; no `<span class="text-ink-300">` remains for it |
| 3 | CONFIRMED | One literal repo-wide under `app/` (`app/shared/data/callBooking.ts`); zero in either locale file. Whole-repo grep: source, its test of record, and prose in `decisions-open.md` / `feature_list.json` |
| 4 | CONFIRMED with one deliberate exclusion | See *the judgement call* |
| 5 | CONFIRMED | Fixed in `BotonPrimario.vue`, `SocialIcon.vue`, `SiteNav.vue`, `MobileMenu.vue` — never at a call site. `isClickable` gates the class |
| 6 | CONFIRMED | `HeroSection.test.ts:155` still asserts the inert `<span.text-ink-300>`, no arrow, no anchor. Updated in place with a comment saying why it outlives its blocker |
| 7 | CONFIRMED | Locale diff is feature 9's five hero keys only, present in both files; parity test green; no URL in i18n |
| 8 | CONFIRMED | Four independent guards: `heroContent.test.ts` (`HERO_DESTINATIONS.callUrl`), `footerColumns.test.ts` (`toEqual({kind:'external',href})`), `SiteFooter.test.ts`, and two artefact assertions in `static-output.test.ts` |
| 9 | CONFIRMED | init.sh |

## The three-symptoms-one-cause claim — CONFIRMED

No colour class and no arrow was added by hand anywhere. The hero's `v-if`
branch is `<LinkArrow v-if="callHref" :href="callHref" external>` with no class
of its own; `text-bone-100` and the `→` come from the untouched `LinkArrow.vue`.
`FooterColumn.vue`'s diff is comment-only. `HeroSection.vue` is untracked (born
in feature 9) so it cannot be git-diffed, but inspection confirms the property
structurally: the only colour literal in the CTA row is the `ink-300` of the
inert branch, which is the original treatment.

**Frozen files untouched:** `git status` empty for `SectionGlow.vue`,
`DotGrid.vue`, `SectionBackdrop.vue`, `Pill.vue`, `LinkArrow.vue`,
`SectionGlow.test.ts`.

## The single-literal test can actually fail — CONFIRMED by mutation

Added a second file under `app/` containing the URL and ran the suite:

```
- Expected
+ Received
  [
+   "shared/data/__mutation_check.ts",
    "shared/data/callBooking.ts",
  ]
```

`tests/call-booking.test.ts:54` fails. Mutation removed; tree restored.

## The cursor, on the artefact

Emitted stylesheet contains **exactly one** cursor declaration:
`_nuxt/entry.CUD6KlZT.css → .cursor-pointer{cursor:pointer}`. The
`cursor-spotlight` matches are class names, not declarations.

Nav CTA carries `cursor-pointer` on all four generated documents. The hamburger,
the close control and the three `SocialIcon`s are behind `isScriptingAvailable`
/ the open flag and **never reach a prerendered document** — a feature-3 design,
not a gap here. They are covered by component tests (`SiteNav`, `MobileMenu`,
`SocialIcon`), the class is in the source, and the utility exists in the shipped
bundle. Correctly stated as a limit in `static-output.test.ts` rather than
faked.

## The judgement call — I agree with the outcome, and narrow the reasoning

**Agreed: no pointer on the hero's primary CTA today.** Acceptance #5 is direct
and controlling — *"a disabled or destination-less control must not claim to be
clickable"* — and the control is a `<button type="button">` with no href and no
handler, so acceptance #4's premise (*"every **interactive** control"*) does not
yet hold for it. It is asserted both ways (`HeroSection.test.ts:211` and `:221`,
plus four `BotonPrimario` cases), so the pointer arrives by construction the day
`contactHash` lands, with no edit.

**The § 6 transfer is INFERRED and slightly over-claimed.** § 6's remedy for the
Proyectos slots is the whole affordance — *"sin cursor de link **ni hover**"* —
and its premise is an element that should not look clickable. R50 requires the
hero CTA to **keep** its box and LED ring, and `.led:hover::before` still spins
on hover regardless of destination. So only half of § 6's remedy is applied, and
the control still reads as clickable by its box. That does not change the
verdict: hover is outside this feature's acceptance and belongs to a frozen
feature-2 primitive. Recorded as an observation for Roberto, not a defect.

**The stated limit is acceptable.** A caller attaching a click listener to a
`type="button"` instance gets an action with no pointer. No caller does today,
the limit is written into the component's own contract, and the named fix (give
that action a name in the contract) is the right one.

## The two scope calls

1. **`SocialIcon`** — **justified, not padding.** Acceptance #4 names "the
   social buttons" explicitly and says *"whether it renders as `<a>` or
   `<button>`"*. One utility class on a component whose `href` is required, with
   a test. It makes the mobile menu's five glass controls stop depending on
   element type, which is what #4 asks for.
2. **`BotonPrimario.test.ts` guard — intact and the right call.** Line 126 still
   reads `expect(buttonSource).not.toMatch(/@(click|mouseenter|mouseleave)/)`,
   unmodified. The guard is a whole-file substring check by design: deliberately
   over-strict, never under-strict, and its value is that it is dumb and
   unbypassable. Teaching it to skip comments would have added parsing to the
   one thing that must not be negotiable. The cost of the alternative was one
   reworded sentence. Same answer as last time, and correct again.

## Checkpoints

C1 ✅ · C2 ✅ (one active feature; `reviewing`, not skipped) · C3 ✅
(`app/shared/data/` is exactly where Article I § `app/shared/{ui,logic,data,utils}`
puts a cross-cutting constant; `landing` imports nothing from `shell`; no
`data/` → `logic/`/`ui/` import) · C4 ✅ (no colour/spacing literal added — 
`cursor-pointer` is a utility; all imports via `@/`; no new alias; no
`server/`, `nitro.preset: 'static'`; `<script setup lang="ts">` throughout;
no debug prints) · C5 ✅ (all 29 files collected — verified with `vitest list`,
so no silently-uncollected suite) · C6 ✅ · C7 n/a (`sdd: false`) · C8 ✅.

**`docs/business/` not written to — CONFIRMED.** `rules.md` still ends at R50
under *Feature 009 · especificación*; no feature-011 section, no `cal.com`.
The `docs/business/` diffs in the tree are the human's rule migration and the
§ 2 / Decisión 2 additions. R56 went to `docs/harness/findings.md`, which is
agent-writable.

## Non-blocking, for the leader

1. `app/shared/data/callBooking.ts` cites `tests/callBooking.test.ts`; the file
   is `tests/call-booking.test.ts`. Dangling reference, one word.
2. `docs/harness/progress/current.md` says *"Feature in progress: none"* while
   feature 11 is `reviewing`, and `history.md` still lists *"El link real de
   Google Calendar"* as pending for Clau. Both are the leader's files and both
   are now stale.
3. `vitest.config.ts` does not collect `app/shared/data/**/*.test.ts`. Nothing
   lives there today (this feature's test is in `tests/`), but the next one to
   put a test beside a shared data file would get a suite that reports green by
   never running — the exact § R39 failure the include list already documents.
