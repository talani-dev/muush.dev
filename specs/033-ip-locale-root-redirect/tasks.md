---
description: "Tasks for feature 33 · ip_locale_root_redirect"
---

# Tasks: Root `/` redirects to a locale by the visitor's country

**Input**: `specs/033-ip-locale-root-redirect/` (spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md)
**Prerequisites**: Roberto has answered gate questions G1–G8 (spec § Gate questions). **If any answer differs from the recommendation, T002 applies it before any code.**

**Tests**: required. The feature's acceptance asks for passing tests, and Constitution Article X requires unit tests for `logic/` and component tests for `ui/`. Tests are written first and must fail before the code they cover exists.

**Scope reminder**: this repository only adds the preference cookie written by the toggle. The redirect itself is muush-foundation's (`contracts/edge-root-locale-redirect.md`). Do **not** edit `public/index.html`, `nuxt.config.ts`, `i18n/locales/*`, `app/pages/*`, `app/layouts/*`, `app/plugins/*`, `tests/static-output.test.ts`, `tests/seo-output.test.ts`, `package.json` or `pnpm-lock.yaml` (G3, FR-023).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5 from spec.md

---

## Phase 1: Setup

- [x] T001 Run `./init.sh` on `feat/ip-locale-root-redirect` before any change and record the result in `docs/harness/progress/current.md`. Note any pre-existing failure, then the test count. Run `grep -rn "document.cookie\|localStorage" app/` and record that it prints nothing (spec C4).
- [x] T002 Apply the gate answers. If Roberto changed G2 (default locale), G4 (cookie name/attributes/lifetime) or G5 (list: `GQ`, `US`, others), update the matching values in `specs/033-ip-locale-root-redirect/contracts/edge-root-locale-redirect.md` §§ 3–4 and § 7, `contracts/locale-preference-cookie.md` § 1 and `data-model.md` §§ 1–2. Then add a dated "Gate answers" section to `specs/033-ip-locale-root-redirect/spec.md` quoting each answer. If all answers match the recommendations, only add that section.

---

## Phase 2: Foundational (blocks US2)

- [x] T003 Create `app/features/shell/data/localePreference.ts`, importing only `ShellLocale` from `@/features/shell/data/types`. Export `LOCALE_PREFERENCE_COOKIE = 'muush_locale'` and `LOCALE_PREFERENCE_MAX_AGE_SECONDS = 31_536_000` (or the G4 values). Add a header comment: written only by the language toggle; never read by the site; read only by the edge at `/`; contract `specs/033-ip-locale-root-redirect/contracts/locale-preference-cookie.md`; holds only `es`/`en`.
- [x] T004 [P] Write failing unit tests in `app/features/shell/logic/localePreference.test.ts` (names `should … when …`). Cover:
  - `serializeLocalePreference('en')` === `'muush_locale=en; Path=/; Max-Age=31536000; SameSite=Lax; Secure'`, and the same for `'es'`.
  - The string contains no `Domain` and no `HttpOnly`.
  - `rememberLocalePreference('es', target)` with `target = { cookie: '' }` assigns exactly the serialised string once (use a setter spy on a plain object to count assignments).
  - A second call with `'en'` assigns the `en` string.
- [x] T005 Implement `app/features/shell/logic/localePreference.ts`. `serializeLocalePreference(locale: ShellLocale): string` builds the exact form of `data-model.md` § 1 from the T003 constants. `rememberLocalePreference(locale: ShellLocale, target: Pick<Document, 'cookie'> = document): void` assigns it. No `typeof document` guard (plan § Design notes); no read of the cookie; each function under 30 lines. T004 must pass.

**Checkpoint**: `pnpm vitest run app/features/shell/logic/localePreference.test.ts` green; `pnpm typecheck` green.

---

## Phase 3: User Story 2 — A visitor who chose a language keeps it (P1)

**Goal**: the toggle records the destination locale on every click.
**Independent test**: mount `LanguageToggle`, click it, and see `muush_locale=<destination>`. In a browser (quickstart § 1), the cookie appears with the contract's attributes.

- [x] T006 [US2] Add failing component tests to `app/features/shell/ui/LanguageToggle.test.ts`, keeping every existing test unmodified. Stub the writer with `vi.mock('@/features/shell/logic/localePreference', …)` or a spy. Cover:
  1. Plain click with `locale: 'es'` → called once with `'en'`.
  2. Plain click with `locale: 'en'` → called once with `'es'`.
  3. ⌘/Ctrl-click → still called once with the destination.
  4. Click with a hash present → called once, and `window.location.assign` still receives `${href}#${fragment}`.
  5. Mounting without clicking → never called.
  6. Optionally, one un-stubbed test asserting `document.cookie` contains `muush_locale=en` after a click. happy-dom returns name=value only. Clear the cookie in `afterEach`.
- [x] T007 [US2] Edit `app/features/shell/ui/LanguageToggle.vue`:
  - Import `rememberLocalePreference` from `@/features/shell/logic/localePreference`.
  - In the click handler, call `rememberLocalePreference(otherLocale.value)` as the **first** statement, before the `defaultPrevented`/modifier/button early return.
  - Keep the anchor logic as is: rename the handler only if `preserveAnchor` would no longer describe it, and keep the anchor step as its own function.
  - Add a comment explaining why the write precedes the early returns (contract `locale-preference-cookie.md` § 2).
  - No change to props, template markup, classes or `aria-*`. The file stays under 200 lines.
  - T006 and all pre-existing toggle tests must pass.
- [x] T008 [P] [US2] Create `tests/locale-preference-output.test.ts`, reading `.output/public` with `node:fs`/`node:path` (§ R16/R27 pattern from `tests/static-output.test.ts`). Assert:
  - `should ship the preference cookie name in the client bundle when generated`: at least one `_nuxt/*.js` contains `muush_locale`.
  - `should never write the preference into a generated document when generated`: no `.html` under `.output/public` contains `muush_locale`.

**Checkpoint**: US2 complete; `pnpm test` green.

---

## Phase 4: User Story 1 — `/` lands in the visitor's language (P1, edge deliverable)

**Goal**: muush-foundation receives a complete, gate-consistent contract.
**Independent test**: contract § 7 cases R-1..R-13 run in the CloudFront `TestFunction` console (Roberto / muush-foundation).

- [x] T009 [US1] Re-read `specs/033-ip-locale-root-redirect/contracts/edge-root-locale-redirect.md` against the T002 gate answers and `data-model.md`'s decision table. The list in § 3, the reference code's `SPANISH_SPEAKING`/`DEFAULT_LOCALE`, and the expectations of cases R-2..R-5 must all agree. Change the status line from "PROPOSAL" to "agreed at the feature 33 gate (date)". Contract only; no code in this repository.

---

## Phase 5: User Story 3 — every other address unchanged (P1)

**Independent test**: existing output suites and the contract's regression cases N-1..N-7.

- [x] T010 [US3] Confirm `git diff master -- app/pages app/layouts app/plugins i18n nuxt.config.ts public/index.html` is empty. Confirm the only files changed under `app/` are the three of plan § Source Code plus the toggle test. Record both in `docs/harness/progress/current.md`.

---

## Phase 6: User Story 4 — search engines see both languages (P2)

- [x] T011 [US4] Verify that contract § 4 (`302`, `private, no-store`, no `vary`, no `set-cookie`) and § 7 R-13/V-3 match the G8 answer. Confirm `tests/seo-output.test.ts` is unmodified and green, including the `x-default` → `/es` assertion at `tests/seo-output.test.ts:368` that feature 37 will change.

---

## Phase 7: User Story 5 — without the edge piece nothing breaks (P2)

- [x] T012 [US5] Confirm `tests/static-output.test.ts` (the `/` → `/es` refresh assertion at line 97) is unmodified and green. Run quickstart § 1 step 6 under `pnpm preview` and confirm `/` still reaches `/es`.

---

## Phase 8: Polish & cross-cutting

- [x] T013 Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate` and `pnpm storybook:build` (or `./init.sh`) and record the results and test count in `docs/harness/progress/current.md`.
- [x] T014 Browser check, quickstart § 1 steps 1–5, under `pnpm generate && pnpm preview` in a clean profile. Record the cookie attributes DevTools shows: name, value, path, expiry roughly one year out, `Secure`, `SameSite=Lax`, host-only. Confirm the anchor case `/es/nosotros#work` → `/en/about#work`.
- [x] T015 [P] Confirm no new dependency and no third-party request: `git diff master -- package.json pnpm-lock.yaml` empty; `grep -rn "http" app/features/shell/logic/localePreference.ts app/features/shell/data/localePreference.ts` prints nothing.
- [x] T016 Write `specs/033-ip-locale-root-redirect/implementation-report.md`: what changed, measurements from T013–T014, and deviations. Include the hand-off line for Roberto: "apply `contracts/edge-root-locale-redirect.md` §§ 6–7 in muush-foundation, starting with step 0 (record today's 301)". Leave the feature status `in_progress` for the leader.

---

## Dependencies & execution order

- T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008. T008's assertions read `.output/public`, so they only pass once a `pnpm generate` includes T007 (the test `globalSetup` rebuilds).
- T009 depends only on T002 and can run in parallel with Phases 2–3.
- T010–T012 after T007. T013–T016 last.
- No story depends on the edge being deployed. US1/US4 are verified by muush-foundation, outside this repository.

## Parallel examples

```text
After T003:  T004 (unit tests)  ∥  T009 (contract review)
After T007:  T008 (output test) ∥  T015 (dependency check)
```

## Implementation strategy

MVP = Phases 1–3 (the cookie). It is useful on its own: once the edge rule ships, preferences recorded since the deploy already apply. Phases 4–7 are verification and the contract hand-off. The edge and the site can ship in either order (contract § 6).
