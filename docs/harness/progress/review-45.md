# Review · feature 45 `m1_forms`

- **Date:** 2026-11-02 · **Reviewer:** reviewer agent · **Branch:** `feat/v2-forms` (uncommitted working tree)
- **Status at start:** `reviewing` (CONFIRMED, `feature_list.json`)
- **Verdict:** REJECTED: one blocking defect. "Enviar sin CV" sends the application while the privacy box is unticked (FR-009 / SC-002). Everything else checked is green. The fix is small.

## Blocking

1. **"Enviar sin CV" bypasses the consent gate.** CONFIRMED by reading the code path; I did not execute it.
   - `SteppedForm` → `useConsentGate().guard` wraps only the form's `submit` event.
   - `ApplicationForm.vue` wires the notice action straight to the composable: `@submit-without-cv="form.onSubmitWithoutCv"`.
   - `useApplicationForm.onSubmitWithoutCv` checks only `cvUploadFailed`, then calls `submission.attemptSubmit()`.
   - While the state is `cv-upload-error`, the consent checkbox stays enabled (`:disabled="busy"`, and busy is false), and the notice stays visible.
   - Sequence: tick the box → send → the CV upload fails → untick the box → click "Enviar sin CV". Result: `POST /careers` leaves with no consent. This breaks FR-009 ("MUST NOT send anything by any path") and SC-002 ("0 requests leave while the privacy box is unticked").
   - No test covers it. `ApplicationForm.test.ts` "should send without the CV when Enviar sin CV is chosen" only runs with the box ticked.
   - **Fix:**
     - Route the action through the same gate, e.g. `guard(() => form.onSubmitWithoutCv())`, or a guarded wrapper that focuses `#privacy`.
     - Add a component test: the CV upload fails, the box is unticked, "Enviar sin CV" is clicked → `submitter.submit` is still called once, and focus is on `#privacy`.
     - Optionally, the same test for "Intentar de nuevo" after untick. That path already goes through the guarded submit; I only checked it in code.
     - No payload, flow or contract file needs to change.

## Should-fix (non-blocking)

- None that block. See the nits.

## Nits

- `app/assets/icons/README.md` (feature 45 entry) lists only `ReceivesList.vue` as the user of `check.svg`. `ConsentCheckbox.vue` uses it too, for the ticked state.
- `app/features/shell/ui/legacy/SiteNav.vue:516` still mentions `ContactSection.vue` in a comment. The file is quarantined, so no rush.
- Two-field rows across widths:
  - side by side at 768–1023 (panel 600 → form ≥ 32rem);
  - stacked at 1024–~1100 (narrowed panel);
  - side by side again above ~1100.
  This is allowed (see the deviation judgement below). A note in `rules.md` / the spec would stop someone "fixing" it later.
- The feature 45 acceptance text in `feature_list.json` still says "CV solo PDF de máximo 10 MB". Roberto's 2026-11-02 decision (5 MiB) supersedes it. The text is leader-owned and could be updated so it no longer disagrees.
- Desktop reading order of the section: DOM order is left text → form → "¿Prefieres hablar?" row, but the row is drawn under the left column. The sequence is still meaningful, and one DOM has to serve the mobile order (form before the call row, as specified). INFERRED acceptable; mentioned for completeness.

## What I verified

### Harness, scope, build
- CONFIRMED: `./init.sh` exits 0. I ran it myself: typecheck, Biome, 193 test files / 2580 tests, `pnpm generate`, `pnpm storybook:build`.
- CONFIRMED: the specs/045 package is complete:
  - `tasks.md` has 51/51 `[x]`, 0 open;
  - `plan.md` has every Phase -1 gate `[x]`;
  - no `NEEDS CLARIFICATION`;
  - `checklists/requirements.md` has 0 open boxes.
- CONFIRMED: only one feature is in `reviewing`. `.specify/feature.json` points at `specs/045-forms`.
- CONFIRMED: changed files are limited to `app/`, `tests/`, `i18n/`, `specs/045-forms/`, `docs/harness/progress/`, `feature_list.json` and `.specify/feature.json`. `docs/business/` is untouched (`git status`). `package.json` and `pnpm-lock.yaml` are unchanged, so there are no new dependencies.

### Payloads and logic (byte-for-byte)
- CONFIRMED (`git diff HEAD`): zero diff in:
  - `submissionPayloads.ts`, `submissionFlows.ts`, `formsApiClient.ts`, `sendWithFreshToken.ts`;
  - `useTurnstile.ts`, `useSpamGuard.ts`, `serverFieldErrors.ts`, `edgeCountry.ts`, `useDefaultCountry.ts`;
  - `countryOptions.ts`, `useFormSubmission.ts`, `submissionContract.ts`, `data/turnstile.ts`, `data/countries.ts`;
  - all of their tests.
- CONFIRMED: the edits to the other logic files are additive:
  - `useFormSubmitState` gains an optional `revealField` called before focus; behaviour without it is unchanged;
  - `useContactForm` and `useApplicationForm` pass it through;
  - the content resolvers change shape;
  - `contactFields` and `applicationFields` change types only.
  The two existing logic test files only gain appended blocks (`+114/-0`).
- CONFIRMED: consent never enters form values. `accepted` lives only in `useConsentGate`, and the payload/values types have no privacy key. In my browser run, no `/contact` or `/careers` request left on unticked click or `requestSubmit`.
- CONFIRMED: CV limit `CV_MAX_BYTES = 5 * 1024 * 1024`. `classifyCvFile` accepts exactly 5 242 880 (tested) and is shared with the quarantined `FileField`.

### Consent gate
- CONFIRMED (code + browser): the unticked submit has `aria-disabled="true"`, is not `disabled`, has opacity 0.7, the not-allowed cursor, and `aria-describedby` pointing to the sr-only hint "Acepta el aviso de privacidad para enviar." / "Accept the privacy notice to send.".
- CONFIRMED (browser): click and `requestSubmit()` while unticked send nothing and move focus to `#privacy`, at 360 / 390 / 1024 / 1440 on `/es`, `/en`, `/es/nosotros` and `/en/about`.
- Enter in a field takes the same submit path: INFERRED from code and covered by component tests. The exception is the blocking item above.

### Steps and views
- CONFIRMED:
  - `isStepped` is false until mount (prerender/no-JS gives the single view), then follows `(max-width: 47.9375rem)`;
  - `v-show` keeps the DOM of a hidden step;
  - `channel` renders in one place per view, so DOM, visual and focus order agree;
  - Enter on step 1 continues;
  - the "Continuar" button is `type="button"`, so it does not double-fire.
- CONFIRMED (browser, 390 and 360):
  - "Paso 1 de 2 · Tus datos" / "Step 1 of 2 · Your details";
  - only Nombre, Correo and the channel visible;
  - "Continuar" moves to step 2 ("Tu negocio" / "Your profile");
  - focus lands on the first step-2 field;
  - "← Atrás" / "← Back" is shown.
- CONFIRMED (browser, 1024 and 1440): single view with every field. There is no website field.

### Quarantine and deletions
- CONFIRMED:
  - the twelve v1 components with their tests and stories are moved to `forms/ui/legacy/`, all titled `Legacy v1/Forms/…`;
  - the barrel exports nothing from `legacy/` (`forms-config.test.ts` guards this);
  - v1 `ContactSection` (+ test and story), `contactContent.ts`, `useContactContent.ts` and `landing.contact.*` are deleted in both locales;
  - the retired `--contact-*` / `--spacing-contact-*` section tokens are gone, with no dangling reference in `app/`, `tests/`, `i18n/` or `.storybook/`.
- CONFIRMED: the remaining `--spacing-contact-textarea-h`, `--spacing-contact-whatsapp-h`, `--duration-contact-whatsapp-toggle` and `--color-glass-dark-contact` are read only by the quarantined v1 forms, as the implementer declared.

### Constitution
- CONFIRMED:
  - every component is ≤ 200 lines (largest: `ApplicationForm` 186, `ContactForm` 173, `SteppedForm` 169, `PrimaryButton` 149);
  - all are `<script setup lang="ts">`;
  - logic lives in composables and pure functions;
  - no `../` relative import;
  - no hex, `rgb()`, px or bracket literals in new non-test files;
  - no `v2` / `m1` in any new file, token, key or story title.
- CONFIRMED: ES/EN keys match each other, and the copy matches `muush-1.0.md` § 4.6 / § 4.8 plus Roberto's 2026-11-02 decisions:
  - "PDF · máximo 5 MB" / "PDF · max 5 MB" and the "…de hasta 5 MB." error;
  - "Intentar de nuevo" / "Try again" and "Enviar sin CV" / "Submit without CV";
  - "Selecciona una opción" / "Select an option";
  - the SR hint;
  - "Lo que recibes" / "What you get";
  - "https://linkedin.com/in/…";
  - errors end in a period, except the approved email line.
- CONFIRMED: every new or changed UI part has a test and a story. The stories are under non-legacy titles (`Forms/…`, `Landing/AssessmentSection`, `Landing/ReceivesList`, `Shared/UI/PrimaryButton`).
- CONFIRMED: `check.svg` is normalized exactly like the feature 44 glyphs (viewBox 0 0 24 24, stroke 2, `<title>lucide · check</title>`, no class/width/height/licence comment) and documented in the README (see nit).

### Responsive deviation (1024–~1100 px)
- Judgement: **acceptable**. CONFIRMED in the browser:
  - at 1024 the section stays side by side, the panel narrows to 459 and the left column keeps its minimum;
  - "diagnóstico" no longer runs under the panel;
  - no horizontal overflow (`scrollWidth == innerWidth`).
- The two-field rows stack there through a container query. The components, order, copy, colour and behaviour are the same; only widths and row arrangement adapt. That falls under "other widths may adapt sizes and spacing".
- 390 and 1440 are unaffected. Measured: panel 342 / 600, submit 287 × 55 at 1440. The 1440 render matches the expected anatomy.

### Visual check
- Done on 127.0.0.1 only: a static server on the generated site plus headless Chrome over CDP, with every non-local request blocked and logged. Both were stopped afterwards. Screenshots are in `/tmp/rev45/` (outside the repo).
- Results:
  - 390: home step 1 and step 2, and `/en/about` step 2 match the extract values reported by the implementer;
  - 1440: home and `/es/nosotros`;
  - 1024: home;
  - no console messages.
- UNVERIFIED:
  - a pixel comparison against the `.pen` frames (I cannot open the `.pen`);
  - the shader (headless renders it dark);
  - a VoiceOver / real-keyboard pass;
  - 768, 1280 and 1920, which I did not re-measure (the implementer reports them clean).

### Security
- CONFIRMED:
  - no new network call: no `fetch`, `$fetch`, XHR, beacon or WebSocket in changed app files;
  - the only external request the browser attempted was the existing Turnstile `api.js` after focusing a field, which is feature 029 behaviour;
  - no secrets or credentials in changed files;
  - new URLs in the app are only placeholder or test fixtures (`https://linkedin.com/in/…`, example domains), plus the existing `CALL_BOOKING_URL` constant and `mailto:support@muush.dev`;
  - I found no injected instructions in the spec, extract or implementer report.

## Next step

Status set back to `in_progress`. After the blocking fix and its test, re-run `./init.sh` and return to `reviewing`. A re-review only needs to check the fix, its test and the init run.

## Re-review 1 (2026-11-02, after fix round 1)

- **Status at start:** `reviewing` (CONFIRMED).
- **Verdict:** APPROVED.

### Blocking item: fixed
- CONFIRMED in code:
  - `ApplicationForm.vue` wires `@submit-without-cv` to `onGuardedSubmitWithoutCv = guard(() => form.onSubmitWithoutCv())`;
  - `useConsentGate.guard` is now generic over the handler's arguments;
  - while unticked it never calls the handler, calls `preventDefault` only when it receives an `Event`, and focuses `#privacy`.
- CONFIRMED: every send path in both forms now goes through the gate. In non-legacy `forms/ui`, `AssessmentSection` and `WorkWithMuushSection`, the only handlers that can send are:
  - `onGuardedSubmit`, the form `submit` event. It covers the submit button, Enter, `requestSubmit` and "Intentar de nuevo" in both forms;
  - `onGuardedSubmitWithoutCv`, application only.
  No direct `attemptSubmit`, `onRetryCvUpload` or `submitter` call exists in the UI. "Continuar" only changes step. The diagnóstico form has no other send path.
- CONFIRMED: the new tests reproduce the exact sequence.
  - `ApplicationForm.test.ts` "should send nothing and focus the box when Enviar sin CV is chosen after unticking it": tick → send → upload fails → untick → click "Enviar sin CV" → `submitter.submit` still called once, focus on `#privacy`, notice still shown.
  - The same file adds the "Intentar de nuevo" variant.
  - `ContactForm.test.ts` adds the send-fails → untick → retry case.
  - `useConsentGate.test.ts` adds an eventless-handler case.
- INFERRED (strong): the "Enviar sin CV" test would fail with the old wiring. Under the old wiring, `onSubmitWithoutCv` ran `attemptSubmit` unconditionally, and the existing ticked-box test proves that path reaches `submitter.submit` a second time. That breaks the new `toHaveBeenCalledTimes(1)`. The implementer also reports running this negative control. I did not re-run it, because that would mean editing app code.

### Unchanged protected files
- CONFIRMED (`git diff HEAD`): still zero diff in:
  - `submissionPayloads`, `submissionFlows`, `formsApiClient`, `sendWithFreshToken`;
  - `useTurnstile`, `useSpamGuard`, `serverFieldErrors`, `edgeCountry`, `useDefaultCountry`, `countryOptions`, `useFormSubmission`;
  - `data/submissionContract`, `data/turnstile`, `data/countries`.
- `useApplicationForm`, `useContactForm` and `useFormSubmitState` have the same additive diff as in round 0 (+3 / +3 / +14−2).

### Other
- CONFIRMED: `./init.sh` exits 0. I ran it myself: 193 test files / 2584 tests, generate and Storybook build OK.
- CONFIRMED: `ApplicationForm.vue` is 188 lines (≤ 200).
- CONFIRMED: the icons README now lists `ConsentCheckbox.vue`.
- CONFIRMED: the feature 45 acceptance in `feature_list.json` now reads "CV solo PDF de máximo 5 MB (5 MiB, límite del contrato; Roberto 2026-11-02)".
- Carried to feature 47 (accepted nit): the stale `ContactSection.vue` comment in the quarantined `shell/ui/legacy/SiteNav.vue`.
- Still UNVERIFIED, as in round 0: a pixel comparison with the `.pen`, a VoiceOver / real-keyboard pass, and the shader render.

## Re-review 2 (Reopen 1, 2026-11-02)

- **Status at start:** `reviewing` (CONFIRMED).
- **Verdict:** REJECTED: one blocking defect in change 1 (the header). Changes 2, 3 and 4 pass.

### Blocking

1. **After an idle hide, starting to scroll down makes the desktop header slide back in.** CONFIRMED in the browser at 1440.
   - What happens:
     - `useHeaderIdleHide.onScrollFrame` clears `isIdleHidden` on every scroll, whatever the direction.
     - `useNavScrollReveal` hides only after 10 px of continuous downward scroll (`HIDE_ACCUMULATION_PX`).
     - So after an idle hide that followed an upward scroll, the first downward frames under 10 px show the header (`isShown` = scroll-visible and not idle-hidden).
   - Measured with 2 px per frame (a slow trackpad start) after the 2.5 s idle hide. The header bottom per frame went `0,0,16,33,47,58,41,27,17,11,7,5,3,2,1,0`. That is up to 58 of 88 px on screen, for about a quarter of a second.
   - Read, pause, scroll down is the commonest pattern, so this shows up constantly on a Mac trackpad. It contradicts FR-036 ("MUST keep hiding on downward scroll") and Roberto's request ("hides on scroll down").
   - Wheel steps of 10 px or more do not show it: both rAF callbacks run in the same frame.
   - **Fix (small, logic only):**
     - on a downward scroll, keep `isIdleHidden` as it is and only restart the wait; clear it only on upward scroll, or let the scroll-reveal state decide;
     - add a fake-timer test: idle hide → a downward scroll under `HIDE_ACCUMULATION_PX` → still hidden;
     - optionally a `SiteHeader` composition test for the same sequence.
   - The spec line "Any scroll shows it again" should then read "any upward scroll shows it again; a downward scroll keeps it hidden", so spec and code agree.

### What I verified

**1 · Desktop header (FR-036 / FR-037), apart from the blocking item**
- CONFIRMED: scroll down / up still exists on desktop. It is the existing `useNavScrollReveal`, used at every width.
  - Browser at 1440: visible at the top, also after 3 s idle;
  - hidden after scrolling down;
  - visible after scrolling up;
  - still visible at 1.8 s, hidden at 3.3 s idle.
- CONFIRMED in code:
  - `HEADER_IDLE_HIDE_MS = 2500` is a named constant;
  - no wait starts within `REVEAL_ZONE_PX` (80);
  - desktop only, through `useDesktopLayout`;
  - hold while the pointer is over the header or focus is inside it, including focus moving between its own controls;
  - the scroll listener is passive with rAF coalescing;
  - timer, listener and frame are cleaned up;
  - nothing runs before mount, so prerender and no-JS show the header;
  - on desktop the hidden state is translate only (`lg:opacity-100`);
  - reduced motion is instant (`motion-reduce:transition-none`, `--medio` 0 ms).
  - The fake-timer tests cover the 2.5 s hide, the restart, the top zone, below `lg`, the pointer and focus holds, the narrowing reset and the clean-up.
- CONFIRMED in the browser at 390: no idle hide (still 76 after 3.3 s). Mobile scroll hide and show are unchanged.

**2 · Timeline run (FR-038)**
- CONFIRMED in the browser at 1440, hovering step 5:

  | Time | Fill scale | Columns lit |
  |---|---|---|
  | 80 ms | 0 | 00000 |
  | 250 ms | 0.14 | 10000 |
  | 400 ms | 0.36 | 11000 |
  | 550 ms | 0.57 | 11100 |
  | 900 ms | 0.82 | 11111 |

  On leaving: 80 ms 0.82 / 11111, 400 ms 0.47 / 11100, 900 ms 0 / 00000. So the fill waits about 150 ms, travels, lights the steps in turn, and runs back.
- CONFIRMED in code:
  - transform only (`scale-x` with delay and duration from CSS variables, `ease-linear`);
  - a new target starts from where the fill is (`runPosition`);
  - timers are cancelled on a new target and on unmount;
  - reduced motion uses 0 durations and computes the lit steps at once;
  - the mobile rail is unchanged (no hover target);
  - unit, composable and component tests are present.

**3 · Shader resize (FR-039)**
- CONFIRMED in code: `resize` repaints in the same frame whenever the backing-store size changed (running or paused), and otherwise only when paused. It never touches `startedAt`, the program or the context.
  - The root cause the implementer gives is consistent with the event loop: ResizeObserver runs after the rAF draw, and assigning `canvas.width`/`height` clears the buffer.
  - The new test pins one repaint at the running clock, no rebuild and a single frame loop. A no-op resize does not repaint.
- INFERRED from the code and the implementer's in-page probe (I did not re-run it): no blank frames during the WhatsApp ↔ Correo transition.
  - Other shader sections use the same engine. Only the resize repaint changed, and it is a no-op when the size is unchanged, so I see no regression path.
  - Headless screenshots cannot show this bug.

**4 · Call row (FR-040)**
- CONFIRMED in the browser at 1440 ES and 390 EN:
  - question and link both `rgb(244, 244, 242)` (Blanco);
  - link text underlined, 1 px thick, 4 px offset;
  - arrow `rgb(229, 53, 47)` (Red muush).
- The test asserts the classes, and the story note is updated.

**Cross-checks**
- CONFIRMED: `./init.sh` exits 0. I ran it myself: 195 files / 2608 tests, generate and Storybook build OK.
- CONFIRMED: zero diff, still, in the payload builders, flows, `formsApiClient`, `sendWithFreshToken`, Turnstile, spam guard, server-error map, dial-code / country logic and their tests, `useFormSubmission`, and `data/{submissionContract,turnstile,countries}`.
- CONFIRMED: component sizes are `SiteHeader` 189, `AssessmentSection` 130 and `ProcessTimeline` 90 lines, all ≤ 200.
- CONFIRMED: no hex, px or bracket literals in the changed shell, landing and shared files.
- CONFIRMED: `package.json` and the lockfile are unchanged.
- CONFIRMED: spec FR-036…FR-040 exist, T052–T057 are `[x]`, and the 043 / 044 amendment notes are present.

### Housekeeping
- In round 0, my own browser script wrote two stray files into the repo root: `undefined.json` and `undefined-view.png`. A zsh word-splitting slip left the output path empty. I deleted both in this round. Neither was ever tracked or staged.
- The browser checks this round used a local static server and headless Chrome on 127.0.0.1 only, with non-local requests blocked. Both are stopped. Scratch files are in `/tmp/rev45/` and `/tmp/rev45-scripts/`, outside the repo.

### Next step
- Status is set to `in_progress`.
- After the header fix and its test:
  - re-run `./init.sh`;
  - return the feature to `reviewing`.
- A re-review only needs the header sequence above, the new test and the init run.

## Re-review 3 (Reopen 1 · fix round 1, 2026-11-02)

- **Status at start:** `reviewing` (CONFIRMED).
- **Verdict:** APPROVED. The Re-review 2 blocker is fixed. Status stays `reviewing` because, per the reviewer definition, the reviewer does not mark `done`.

### The fix
- CONFIRMED in code, `useHeaderIdleHide.onScrollFrame`:
  - it compares `scrollY` with the last value, read at mount;
  - it clears `isIdleHidden` only on an upward move or inside the 80 px top zone;
  - a downward scroll keeps the idle hide and only restarts the wait.
- An upward reveal needs no threshold. That matches the feature 43 rule in `useNavScrollReveal` (an upward scroll reveals immediately).

### Browser check at 1440 and 390
- CONFIRMED, at 1440, on the fresh build, using a local static server and headless Chrome on 127.0.0.1 only. The value is the header bottom in px:
  - top 88; after 3 s idle at the top, still 88;
  - after scrolling down 0, after scrolling up 88;
  - 1.8 s later 88, 3.3 s later 0 (idle hide);
  - then 2 px per frame downward: **0 for all 21 samples** (it was up to 58 before the fix);
  - 3 s later, still 0;
  - after 6 px up, 88;
  - with the pointer over the nav for 3.5 s, 88 (held);
  - 3 s after the pointer left, 0;
  - `scrollTo(0,0)` gives 88, and 3 s later it is still 88.
- CONFIRMED, at 390: there is no idle hide. The 10 px scroll-down hide and the scroll-up reveal are identical to the Re-review 2 samples, so mobile is unchanged.
- Both servers are stopped. My scratch folders `/tmp/rev45/` and `/tmp/rev45-scripts/` and my init logs are deleted. There are no stray files in the repo.

### Tests and spec
- CONFIRMED: new tests exist:
  - `useHeaderIdleHide.test.ts`:
    - "should stay hidden when a slow downward scroll starts after an idle hide";
    - "should show again when the top zone is reached…";
    - the reworded upward / restart test.
  - `SiteHeader.test.ts`: "should stay out when a slow downward scroll starts after the idle hide".
- INFERRED (strong), on top of the implementer's reported negative control: the old "clear on every scroll" line makes `isIdleHidden` false on the first 2 px step. That fails both "stay hidden" assertions.
- CONFIRMED: FR-036 now says that any scroll restarts the wait, that only an upward scroll or the top zone shows the header, and that a downward scroll keeps it hidden. T058 is `[x]`.

### No regressions
- CONFIRMED: idle hide, hover hold, top zone and below-`lg` behaviour hold in the browser and in their tests. The focus-hold test is unchanged. `SiteHeader.vue` keeps `motion-reduce:transition-none` and the desktop translate-only state; it is not touched by this round.
- CONFIRMED: `./init.sh` exits 0. I ran it myself: 195 files / 2611 tests, generate and Storybook build OK.
- CONFIRMED: forms logic and data diff stat is identical to round 0 (9 files, +190/−61). Payload, flow, Turnstile, spam, server-error and dial-code files still have zero diff. `package.json` and the lockfile are unchanged.

## Re-review 4 (Reopen 2, 2026-11-02)

- **Status at start:** `reviewing` (CONFIRMED).
- **Verdict:** APPROVED. Status stays `reviewing`; the reviewer does not mark `done`.

### One shared token
- CONFIRMED in `global.css`: one token and one utility, no per-section values:
  - `--pill-aire: 0.375rem` in `:root`;
  - `0.5rem` in the existing `@media (width >= 64rem)` `:root` block;
  - `@utility pill-aire { margin-block-end: var(--pill-aire); }`.
- CONFIRMED: `pill-aire` sits on exactly the five v2 call sites, the hero `RotatingPill` plus `WhoWeAreSection`, `ServicesSection`, `HowWeWorkSection` and `AssessmentSection`. In those four section files, the class is the only template change (`git diff`).
- CONFIRMED: no `legacy/` pill uses it (`PurposeSection`, `ServicesTimeline`, `ServicesConstellation`, `NotFoundContent`, `HeroStack`), and neither does the v1 `WorkWithMuushSection`.
- CONFIRMED: `Pill.vue`, `RotatingPill.vue` and `Heading.vue` have no diff, and no heading token changed.

### Browser measurement
Measured on the fresh build with a local static server and headless Chrome on 127.0.0.1. "Gap" is from the pill's bottom to its heading's top. All five pills are in the same flex column as their heading.
- CONFIRMED at the 390 and 1440 anchors: every gap equals the section's own flex gap plus exactly 6 px (390) or 8 px (1440):

  | Section | 390 | 1440 |
  |---|---|---|
  | Hero | 22 → 28 | 28 → 36 |
  | Qué es muush | 24 → 30 | 28 → 36 |
  | Servicios | 24 → 30 | 22 → 30 |
  | Cómo trabajamos | 24 → 30 | 22 → 30 |
  | Diagnóstico | 24 → 30 | 26 → 34 |

  These agree with the implementer's table.
- CONFIRMED: the switch sits exactly at `lg`. At 1023 the margin is 6 px; at 1024 it is 8 px.
- CONFIRMED: at 360, 768, 1023, 1024, 1280 and 1920, every gap is the section gap plus the margin.
- CONFIRMED: pill boxes are unchanged in every section (36 tall; widths 199 / 151 / 118 / 175 / 138). Heading font sizes are the existing tokens (e.g. 96 / 56 / 56 / 52 / 64 at 1440).
- CONFIRMED: `scrollWidth == innerWidth` at every width tested, so there is no horizontal overflow.
- I did not compare the pages visually against the `.pen`. This is a declared departure from the `.pen` (FR-041). UNVERIFIED: how it looks to Roberto.

### Tests, spec, build
- CONFIRMED: `tests/pill-air.test.ts` pins:
  - the token (6 px, 8 px from `lg`, declared exactly twice);
  - the utility;
  - its use on each of the five sections;
  - its absence from `Pill.vue` and from the v1 section.

  The test is reasonable: the gap tokens themselves did not change, so no existing test needed editing.
- CONFIRMED: FR-041 is in `specs/045-forms/spec.md`, T059–T060 are `[x]`, and the 044 amendment note is present.
- CONFIRMED: `./init.sh` exits 0. I ran it myself: 196 files / 2618 tests, generate and Storybook build OK.
- CONFIRMED: forms logic and data diff stat is unchanged (9 files, +190/−61). The protected payload, flow, Turnstile, spam, server-error and dial-code files still have zero diff. `package.json` and the lockfile are unchanged.
- CONFIRMED: no untracked files outside the expected feature paths. My server and Chrome are stopped, and my scratch folders and logs in `/tmp` are deleted.
