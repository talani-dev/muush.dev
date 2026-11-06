# Feature 45 `m1_forms` · implementation report

- **Date:** 2026-11-02 · **Branch:** `feat/v2-forms` · **Agent:** implementer
- **Status:** `in_progress` → `reviewing` in `feature_list.json`. No commit,
  no push, no version change.
- **`./init.sh`:** exit 0 (typecheck, Biome, 193 test files / 2580 tests,
  `pnpm generate`, `pnpm storybook:build`), run twice; the second run is
  after the last code change.
- **Tasks:** T001–T051 all checked in `specs/045-forms/tasks.md`, with
  implementation notes appended there.

## Human decisions recorded

The spec's Clarifications now record Roberto's gate answers of 2026-11-02 as
approved, replacing "provisional". Changes in `specs/045-forms/spec.md`:

- the status line;
- Q1 (CV 5 MiB; copy "PDF · máximo 5 MB" / "PDF · max 5 MB");
- Q2 (failed CV upload: notice plus "Enviar sin CV", the submit retries);
- Q3 (error wording);
- new copy (identity placeholder, the screen-reader hint, "Lo que recibes" /
  "What you get");
- the LinkedIn placeholder "https://linkedin.com/in/…";
- the contract's WhatsApp drift, left as it is;
- pen extract § 8 superseding the "assumed" values (FR-013 and FR-014 now
  carry the § 8 numbers);
- the Assumptions list, updated to match.

An "Implementation notes" block lists the deviations below. Nothing under
`docs/business/` was edited.

**One interpretation to confirm.** The EN CV placeholder reads "Attach your
CV as a PDF · max 5 MB". This follows the approved fragment "PDF · max 5 MB".
The approved v1.0 copy said "up to 10 MB". The error line keeps the shape of
the approved copy: "Attach your CV as a PDF up to 5 MB."

## What changed

### Logic (additive only)

**New:**
- `forms/logic/cvFileCheck.ts` (`classifyCvFile`). The quarantined
  `FileField` now calls it too.
- `formSteps.ts`: pure step rules.
- `useFormSteps.ts`:
  - `isStepped` is false until mount, then follows `(max-width: 47.9375rem)`
    live;
  - `goNext(errors)` and `goBack`;
  - `revealField`;
  - smooth scroll, or `auto` under reduced motion.
- `useConsentGate.ts`: blocks click, Enter and `requestSubmit`; focuses
  `#privacy`; consent is never a form value.
- `useFormView.ts`: shown state, step and consent; busy; the submit-label
  key; the notice kind; visible errors.
- `formChromeContent.ts`: shared chrome copy resolver.
- `forms/data/formSteps.ts`, `formChrome.ts`, and
  `data/legacy/legacyFormContent.ts` (the v1 content types, renamed
  `Legacy*`).

**Edited:**
- `useFormSubmitState` gains an optional `revealField`, called just before
  focus in both invalid paths.
- `useContactForm` and `useApplicationForm` pass it through.
- `useContactFormContent` and `useApplicationFormContent` resolve the v2
  shape:
  - the success destination is `CALL_BOOKING_URL` for the diagnóstico form;
  - for the application form it is `useLocalePath()('/')`.

**Untouched**, as the diff confirms:
- `submissionPayloads.ts`, `submissionFlows.ts`, `formsApiClient.ts`,
  `sendWithFreshToken.ts`, `useTurnstile.ts`, `useSpamGuard.ts`,
  `serverFieldErrors.ts`, `edgeCountry.ts` and `useDefaultCountry.ts`;
- their tests.

The only test edits in `forms/logic` are two new `describe` blocks appended
to `useContactForm.test.ts` and `useApplicationForm.test.ts`. Request bodies
are produced by the same unchanged builders.

### UI

**New v2 parts in `forms/ui/`**, each with a test and a story:
- `FormPanel`, `FieldBlock`, `TextField`, `TextareaField`, `SelectField`;
- `SegmentedControl`, `DialCodeSelect`, `WhatsappField`,
  `ContactChannelField`;
- `NameEmailRow`, `CvField`, `ConsentCheckbox`;
- `FormProgress`, `FormNotice`, `SendNotice`, `FormSuccess`;
- `SteppedForm`, `ContactForm`, `ApplicationForm`.

Supporting files:
- `fieldAnatomy.ts` holds the shared class strings.
- `formsFixtures.testing.ts` holds the story and test fixtures.

Sizes and barrel:
- Largest components: `ApplicationForm` 186 lines, `ContactForm` 173,
  `SteppedForm` 168.
- The barrel exports the v2 `ContactForm` and `ApplicationForm`; nothing
  from `ui/legacy/`.

**Quarantine.** Twelve v1 components and their tests and stories were moved
with `git mv` to `forms/ui/legacy/`:
- the stories keep their `Legacy v1/Forms/…` titles;
- imports were fixed;
- two tests that read their own source file got the new path.

**Landing:**
- new: `AssessmentSection.vue` and `ReceivesList.vue` (tests and stories in
  390/1440 × ES/EN), `data/assessmentContent.ts` (+ test) and
  `logic/useAssessmentContent.ts`;
- `index.ts` and `pages/index.vue` render the new section at `#diagnostico`;
- deleted: v1 `ContactSection` (+ test and story), `contactContent.ts`,
  `useContactContent.ts`, and the `landing.contact.*` keys.

**Nosotros:**
- `WorkWithMuushSection` test and story fixtures use the v2 content;
- the comments in it and in `about.vue` were updated;
- the markup is unchanged.

**Shared:**
- `PrimaryButton` gains `unavailable` (`aria-disabled`, opacity 70, the
  not-allowed cursor, still focusable and clickable) and `describedBy`;
- it has tests and three "Unavailable" stories.

**Icon:**
- `app/assets/icons/check.svg` is normalized like the feature 44 glyphs:
  license comment, `class`, `width`, `height` and whitespace stripped;
  `<title>lucide · check</title>` added; stroke 2;
- its README entry is added;
- only the path data was copied from the leader's file.

### Tokens and CSS (`app/assets/css/global.css`)

Added, in a "Forms (feature 45)" group (`:root` plus `@theme inline`):
- the colours `--rojo-12` and `--rojo-40`;
- `--panel-form-ancho`, `--whatsapp-alto` and `--diagnostico-izq-min`;
- the form anatomy pairs (mobile, and `-escritorio` swapped at `md`);
- the fluid section values;
- the `borde-aviso` utility.

The cursor rules gain rule 5: `[aria-disabled="true"]` gets
`cursor: not-allowed`. The brand-cursor rules are unlayered, so a utility
alone could not override them.

Retired, with no reader left: `--contact-cols`, `--contact-col-gap`,
`--contact-left-gap`, `--spacing-contact-top`, `--spacing-contact-text-gap`
and the six `--spacing-contact-glow-*`.

The v1 contact tokens still read by quarantined v1 files stay:
- `--duration-contact-whatsapp-toggle`;
- `--spacing-contact-whatsapp-h`;
- `--spacing-contact-textarea-h`;
- `--color-glass-dark-contact`.

`tests/design-tokens.test.ts` pins every new token at 390 and 1440 and
checks that each is declared once.

### Copy (`i18n/locales/{es,en}.json`)

- `forms.contact.*` and `forms.application.*` are rewritten per data-model
  § 4 and the gate decisions:
  - errors end in a period (Q3);
  - `@` is escaped as `{'@'}`;
  - the v1 keys `success.channel`, `error.title`, `error.fallback` and
    `cvUploadError.retry` are removed;
  - the identity options, areas, roles and WhatsApp keys are kept.
- `landing.contact` is replaced by `landing.assessment`.
- The parity test is green.

### Tests changed on purpose

- `forms-copy` and `forms-application-copy`: rewritten for the v2 copy. They
  now check that the shared wording is equal in both forms and that no bare
  `@` remains.
- `landing-copy`: covers `landing.assessment` and the sentence-case label.
- `static-output`: the "landing contact section" block is now "Diagnóstico y
  contacto". It checks:
  - the anchor;
  - the listón canvas and poster, with no v1 glow;
  - single view with every field;
  - no website field;
  - the box unticked;
  - the submit `aria-disabled` with its hint;
  - an `h2`.
- `tablet-layout-tokens`: the Contacto case is removed; the retired names
  are asserted absent.
- `token-literals`: every new file is added to the scan list.
- `forms-config`: no import of `forms/ui/legacy` outside it; `Legacy v1/`
  titles inside and none outside; the barrel exports the v2 forms.

## Deviations from the spec package

1. **Not resizable textarea.** The handoff allows a vertical resize; the
   `.pen` draws a fixed 96 box, and the `.pen` wins.
2. **1024–~1100 px layout.** The 360–1920 sweep found "diagnóstico" running
   under the fixed 600 panel at 1024. Changes:
   - the left column keeps at least 352 px (`--diagnostico-izq-min`) and the
     panel narrows instead;
   - this follows the feature 38 precedent: side by side from 1024, as
     Roberto set for the v1 forms;
   - the two-field rows switch on a container query (32rem of form width)
     instead of `md`, so they stack while the panel is narrow rather than
     clip placeholders.

   Measured: 390 and 1440 are unchanged (1440: left 608, panel 600, fields
   257 wide).
3. **`goNext(errors)`** takes the errors as an argument instead of an option
   (data-model § 2). This avoids a circular setup between `useFormSteps` and
   the form composable.
4. **Three extra shared pieces:** `useFormView`, `NameEmailRow` and
   `SendNotice`. They remove duplication between the two forms and keep both
   under 200 lines.
5. **`autocomplete` hints added:** `name`, `email`, `organization`,
   `tel-national`. This helps input purpose (WCAG 1.3.5) and changes no
   value or payload.
6. **Enter on step 1 continues** instead of submitting. This keeps implicit
   submission from bypassing the step.

## Values I still had to assume

None changes a 390 or 1440 measurement in the extract. Please confirm or
correct against the `.pen`:

- **Line heights not in the extract:**
  - labels, segmented options, progress, help line and call row use 1.2,
    from the feature 43/44 finding that the `.pen` sizes auto-height
    Instrument Sans at 1.2 × its size;
  - the "Lo que recibes" rows use 1.5, since they wrap on mobile;
  - the success title uses `--interlineado-titulo` (1.15).
- **Taken from the handoff** (the extract gives none):
  - mobile textarea padding 12 / 14;
  - progress label weight 600;
  - "← Atrás" padding 6 / 10;
  - success stack padding 40 / 8.
- **Success stack gap:** the panel gap (14 / 18). The handoff says 18.
- **Mobile unselected segmented option:** 13 / 600 Gris 400. § 8 gives only
  the selected option.
- **Checkbox ticked look:** Red muush fill with the 12 px `check` in Blanco.
  The `.pen` draws only the unticked box.
- **CV box text:** sits top-left, like the textarea.
- **"Enviar sin CV" style:** a semibold, underlined text action.
- **The select's end padding:** 40, derived from 16 inset + 16 chevron + 8.
- **The WhatsApp row:**
  - dial-code and number gap 7 / 8, the field gap (spec assumption);
  - dial-code face width is its content.
- **`--whatsapp-alto` (120):** a derived maximum for the open transition.

## Visual check

Method:
- the generated site and `storybook-static` were served on 127.0.0.1 only;
- headless Chrome was driven over the DevTools protocol with a small script
  outside the repo (`/tmp/impl45-scripts/`), using true 390 / 1440 device
  metrics;
- the servers and Chrome were stopped afterwards;
- screenshots are in `/tmp/impl45/` (outside the repo, not committed).

**Home `#diagnostico`, 390 (ES and EN).** Measured:
- panel 342, padding 20, radius 22;
- Nombre 302 × 46, no stroke; labels 12 / 400;
- progress "Paso 1 de 2 · Tus datos" / "Step 1 of 2 · Your details" with
  the first segment red;
- heading 34 / 39.1; body 16 / 24;
- order: pill → heading → body → list → form → call row;
- segmented control without a dot; "Continuar" full width;
- no horizontal overflow.

**Home `#diagnostico`, 1440 (ES and EN).** Measured:
- panel 600, padding 36, radius 28;
- controls 50 tall with a Blanco 10 % stroke; labels 12 / 600;
- textarea 96; checkbox 18; submit ≈ 287 × 55, dimmed until ticked;
- heading 64 / 69.12; body 18 / 27.9; column gap 72;
- left column centred against the panel.

The section is 826 tall against the 920 frame. That matches one missing
field row (the website field, not built).

**Nosotros, 390 and 1440.** The v2 panel sits in the v1 section (342 / 600),
with no overflow. The page looks mixed, as accepted.

**States (Storybook iframes).** Checked:
- Error al enviar at 1440: notice with dot and `support@muush.dev` link;
  "Intentar de nuevo"; values kept;
- Faltan datos at 390: red strokes and help lines;
- CV upload failed at 390, EN: "Step 2 of 2 · Your profile", notice with
  "Submit without CV", "Try again", "← Back";
- Enviado at 390, EN: tile with the dot, title, text, glass button.

**Width sweep (360, 768, 1024, 1180, 1280, 1920).** Both form pages have no
horizontal overflow and no form node outside the viewport. After the fix in
deviation 2, there is no overlap at 1024.

**Console.** No warnings or errors on `/es`, `/en`, `/es/nosotros` and
`/en/about` at 390 and 1440. This is a production build, so Vue's detailed
hydration messages are off.

**Not done:**
- the shader canvas was not judged; headless rendered it dark;
- no pixel comparison against the `.pen` frames;
- no screen-reader (VoiceOver) pass;
- no manual keyboard pass in a real browser.

The keyboard and assistive-technology behaviour is covered by component
tests: labels, `aria-describedby`, the radiogroup, `aria-live` progress,
`role="alert"` / `role="status"`, focus moves.

## For the reviewer

- The leader may want to compare the 390 / 1440 renders above with `mMSV2`,
  `ASEvR`, `uUEnn`, `Bw4IB`, `VtxDP` and `u1CDBO`, especially the assumed
  values listed above.
- Leftover scratch files are outside the repo: `/tmp/impl45/` and
  `/tmp/impl45-scripts/`. A cleanup removal was blocked by a safety check,
  so they are left for a human to delete if wanted.

## Fix round 1 (2026-11-02, after review-45)

- **Status:** back to `reviewing` in `feature_list.json`. No commit, push or
  version change.
- **`./init.sh`:** exit 0 (193 test files, 2584 tests).

### Blocking item: "Enviar sin CV" bypassed the consent gate

**Fix.** "Enviar sin CV" now goes through the same consent gate as the
submit:
- `ApplicationForm.vue` wires the notice action to
  `onGuardedSubmitWithoutCv = guard(() => form.onSubmitWithoutCv())`;
- with the box unticked, nothing is sent and focus moves to `#privacy`;
- `useConsentGate.guard` is now generic over the handler's arguments, so it
  wraps send paths that carry no event as well as the submit event; it still
  calls `preventDefault` when given an `Event`.

**Other send paths, checked:**
- "Intentar de nuevo" on both forms is the guarded submit;
- the diagnóstico form has no other send path;
- `useApplicationForm`, payload builders, flows, Turnstile, spam guard, the
  server-error map and the dial-code logic are not touched in this round.

**Tests (component, the exact sequence):**
- `ApplicationForm.test.ts`: tick → send → CV upload fails → untick →
  "Enviar sin CV". The submitter is still called once, focus is on
  `#privacy`, and the notice stays.
- `ApplicationForm.test.ts`: the same sequence ending with "Intentar de
  nuevo".
- `ContactForm.test.ts`: tick → send fails → untick → click submit, and
  submit again. Still one call; focus on `#privacy`; the submit is
  `aria-disabled` again.
- `useConsentGate.test.ts`: an eventless handler is blocked and focus moves
  to the box.

**Negative control:** with the old wiring restored temporarily, the new
"Enviar sin CV" test fails. With the fix it passes.

### Nits

- **Fixed:**
  - the icons README lists `ConsentCheckbox.vue` as a second user of
    `check.svg`;
  - the row behaviour across widths is now documented in `NameEmailRow.vue`
    and in the spec's implementation notes: side by side at 768–1023,
    stacked at 1024–~1100, side by side above. It follows the panel's width,
    so it must not be "fixed" to `md`.
  - the consent fix is noted in the spec's implementation notes.
- **Not done, outside this feature or leader-owned:**
  - `shell/ui/legacy/SiteNav.vue:516` still mentions `ContactSection.vue`.
    It is a quarantined file of another feature; feature 47 deletes it.
  - The acceptance text in `feature_list.json` for feature 45 still says
    "máximo 10 MB". It is leader-owned; Roberto's 2026-11-02 decision is
    5 MiB.
  - The desktop reading order of the call row was judged acceptable by the
    reviewer; there was no change.

## Reopen 1 (2026-11-02, Roberto's four changes)

- **Status:** `in_progress` → `reviewing`. No commit, push or version
  change.
- **`./init.sh`:** exit 0 (195 test files / 2608 tests), run after the last
  source change.
- **Spec:**
  - `specs/045-forms/spec.md` gains FR-036…FR-040 ("Reopen 1, Roberto
    2026-11-02"), and its status line says Reopen 1;
  - `tasks.md` gains T052–T057, all `[x]`;
  - amendment notes point at the new FRs: `specs/043-site-shell/spec.md`
    (header) and `specs/044-home-page/spec.md` (timeline, above FR-042).
- **Untouched:** payload builders, flows, Turnstile, spam guard, server-error
  map and dial-code logic (zero diff). No new dependency.

### 1 · Desktop header (FR-036, FR-037)

**New:** `shell/logic/useHeaderIdleHide.ts`, with `HEADER_IDLE_HIDE_MS` =
2500. It is desktop only (from `lg`, via `useDesktopLayout`):
- with no scrolling for 2.5 s, the header hides; any scroll shows it and
  restarts the wait;
- no wait starts within the 80 px reveal zone (now exported from
  `useNavScrollReveal` as `REVEAL_ZONE_PX`);
- `isHeld` keeps the header shown while the pointer is over it or focus is
  inside it (focus moving between its own controls keeps the hold);
- the scroll listener is passive and coalesced with rAF;
- everything is cleaned up on unmount;
- nothing runs before mount, so the prerendered and no-JS header is visible.

**`SiteHeader.vue`** (189 lines):
- shown = held, or (scroll-visible and not idle-hidden);
- it binds `pointerenter`/`pointerleave`/`focusout` and keeps the FR-013
  focus reveal;
- the hidden state on desktop is a translate only (`lg:opacity-100`), with
  no fade;
- the existing `motion-reduce:transition-none` and `--medio` (0 ms under
  reduced motion) make it instant there;
- mobile is unchanged (still translate plus fade, no idle hide).

**Tests:**
- `useHeaderIdleHide.test.ts`, on fake timers: the 2.5 s hide, scroll
  restarts, the top zone, below `lg`, the pointer hold, the focus hold
  across inner controls, the narrowing reset, clean-up;
- two `SiteHeader` composition tests.

**Browser check:**
- 1440: header bottom 88 after a scroll up, still 88 at 1.5 s, 0 at 3 s;
  visible again on scroll; held for 3.5 s under the pointer; hidden 3 s
  after the pointer left; visible at the top after 3.5 s;
- 390: always 76 (unchanged).

### 2 · "Cómo trabajamos" run (FR-038)

**Durations:**
- `RUN_DELAY_MS` = 150;
- `RUN_MS_PER_LINE` = 700, a constant speed, so the run from the start to
  the last dot, at about 83 % of the line, takes ≈ 580 ms;
- the easing is linear, so each dot lights exactly when the fill reaches
  it.

**Pure functions** in `landing/logic/timelineProgress.ts`:
- `litAt`;
- `runSchedule(from, to, shares, before)`, which returns the delay, the
  duration and per-column change times;
- `runPosition`, where a run in flight is.

**`useTimelineRun.ts`:**
- starts each new run from where the fill visually is;
- schedules one timer per column that changes;
- cancels them on a new target or on unmount;
- is instant under reduced motion.

**Wiring:**
- `useTimelineHover` now also exposes `dotShare`.
- `ProcessTimeline.vue` feeds the fill's `--relleno-duracion` /
  `--relleno-retraso` (scaleX, `ease-linear`) and lights the columns from
  the run. The "raised" step is still immediate, and the final lit steps
  are as in FR-042 (spec 044).

**Tests:**
- unit tests for `litAt`, `runSchedule` and `runPosition`;
- composable tests on fake timers;
- `ProcessTimeline.test.ts`: the existing final-state tests now let the run
  finish; two new tests cover the run out (columns light in turn) and the
  run back (later columns go out in turn).

**Browser check at 1440**, hovering step 5:

| Time | Fill scale | Columns lit |
|---|---|---|
| 100 ms | 0 | 00000 |
| 250 ms | 0.12 | 10000 |
| 400 ms | 0.31 | 11000 |
| 550 ms | 0.55 | 11100 |
| 900 ms | 0.82 | 11111 |

### 3 · Shader during the form's height change (FR-039)

**Root cause** (`shared/logic/useShaderCanvas.ts`, `resize`):
- assigning `canvas.width`/`height` clears the WebGL drawing buffer;
- ResizeObserver callbacks run after the frame's rAF draw;
- the old code repainted there only when the loop was paused;
- so while the section's height animated (the WhatsApp row's 320 ms
  transition), every frame was painted with a cleared canvas, and the poster
  showed through. That reads as the listón freezing or restarting.

Nothing was remounted, and neither the clock nor the GL program was reset.

**Fix:**
- when the backing store's size actually changed, repaint in the same
  frame, whether the loop is running or paused;
- a resize still only updates the backing store and `u_res`;
- `startedAt`, the program and the context are never touched.

**Test** (`useShaderCanvas.test.ts`): a height change mid-animation repaints
once at the running clock, with the time advancing and no rebuild, and a
no-op resize does not repaint. The negative control fails without the fix.

**Browser proof.** A second ResizeObserver on the same canvas, which runs
right after the engine's, copied the WebGL canvas to a 2D canvas during a
WhatsApp → Correo round trip (SwiftShader WebGL, 127.0.0.1):

| Build | 1440 blank frames | 390 blank frames |
|---|---|---|
| Unfixed | 5 of 6 | 11 of 13 |
| Fixed | 0 of 6 | 0 of 13 |

**Other shader sections:** the hero, Cómo trabajamos and Diagnóstico
canvases are all ready (WebGL, not the fallback) at 390 and 1440, and they
stay ready after a window resize.

### 4 · Call row (FR-040)

- "¿Prefieres hablar?" / "Prefer to talk?" is `text-blanco`.
- "Agenda una llamada" / "Book a call" is `text-blanco` with
  `underline decoration-1 underline-offset-4` on the text span only.
- The arrow stays `text-red-muush-500`.
- A test and the story note are updated.

**Browser check (390 and 1440):**
- question and link computed `rgb(244, 244, 242)`;
- underline 1 px at a 4 px offset;
- arrow `rgb(229, 53, 47)`.

This departs from pen extract § 1 (Gris 400 question, no underline) at
Roberto's request, as recorded in FR-040.

### Notes

- **Scan list:** `tests/token-literals.test.ts` now also covers
  `useTimelineRun.ts` and `useHeaderIdleHide.ts`.
- **Headless screenshots can't show the shader bug:** a CDP screenshot
  forces its own frame, so it misses the cleared canvas. The in-page probe
  above is the evidence.
- **Not done:** a real-device or VoiceOver pass, and a pixel comparison with
  the `.pen`.
- **Helpers:** the local server and Chrome are stopped. Scratch files are in
  `/tmp/impl45/` and `/tmp/impl45-scripts/`, outside the repo.

## Reopen 1 · fix round 1 (2026-11-02, after review-45 re-review 2)

- **Status:** back to `reviewing`. No commit, push or version change.
- **`./init.sh`:** exit 0 (195 test files / 2611 tests).
- **Untouched:** form logic, payloads, flows, Turnstile, spam guard,
  server-error map and dial-code logic.

### Blocking item: a slow downward start showed the hidden desktop header

**Cause.** `useHeaderIdleHide.onScrollFrame` cleared `isIdleHidden` on
every scroll. `useNavScrollReveal` only hides after 10 continuous downward
px, so in between the header slid partly back in.

**Fix** (`shell/logic/useHeaderIdleHide.ts`):
- the scroll frame now compares `scrollY` with the last one;
- only an upward move, or reaching the 80 px top zone, clears the idle
  hide;
- a downward scroll keeps it hidden and only restarts the wait;
- `lastScrollY` is read at mount.

**Spec:**
- FR-036 now reads: any scroll restarts the wait, but only an upward scroll
  (or the top zone) shows the header again; a downward scroll keeps it
  hidden.
- Task T058 is added and checked.

**Tests:**
- `useHeaderIdleHide.test.ts`:
  - after the idle hide, 2 px downward steps (402…408) keep it hidden;
  - reaching the top zone shows it;
  - the restart test now names the upward reveal.
- `SiteHeader.test.ts`: after the idle hide, 2 px downward steps keep
  `-translate-y-full`.
- Negative control: with the old "clear on every scroll" line restored,
  both new sequence tests fail. Restored afterwards.

**Browser check** (local static server and headless Chrome on 127.0.0.1,
both stopped afterwards). The header bottom was sampled each frame while
scrolling down 2 px per frame, after the idle hide:

| Width | Before the idle hide | After the idle hide | Slow downward start, per frame | After a scroll up |
|---|---|---|---|---|
| 1440 | 88 | 0 | 0 for all 17 samples (reviewer measured up to 58 before the fix) | 88 |
| 390 | 76 | 76 (no idle hide) | the feature 43 scroll-down hide after 10 px, unchanged | 76 |

### Nits
- The only other point, the spec wording of FR-036, is fixed above.
- There were no other nits in re-review 2.

## Reopen 2 (2026-11-02, Roberto: "sube todos los pills de las sections, un poquito")

- **Status:** `in_progress` → `reviewing`. No commit, push or version
  change.
- **`./init.sh`:** exit 0 (196 test files / 2618 tests).
- **Untouched:** form logic, payloads and every other protected file.
- **Spec:**
  - `specs/045-forms/spec.md` gains FR-041 (Reopen 2, Roberto 2026-11-02),
    and its status line says Reopen 2;
  - `tasks.md` gains T059–T060, both `[x]`;
  - `specs/044-home-page/spec.md` gets an amendment note pointing at
    FR-041.

### How

One shared token and utility in `app/assets/css/global.css`:
- `--pill-aire` is 0.375rem (6 px) and becomes 0.5rem (8 px) from
  `width >= 64rem`, in the existing `:root` media block;
- `@utility pill-aire { margin-block-end: var(--pill-aire); }`.

It sits on each pill's call site, as `class="pill-aire"`, so it adds space
below the pill on top of each section's own gap. Changing the one token
retunes every pill. The design departure is noted in each section's doc
comment.

Not changed:
- `Pill.vue` and `RotatingPill.vue` themselves;
- the heading sizes;
- the section gap tokens, which also space the other children.

### Pills touched

Pill bottom to heading top, measured in headless Chrome on 127.0.0.1 at the
two anchors. Old = the section's gap token; new = measured.

| Section | 390 old → new | 1440 old → new | Gap token |
|---|---|---|---|
| Hero (rotating pill, where "Automatización, datos e IA" shows) | 22 → 28 | 28 → 36 | `portada-gap` |
| Qué es muush / Who we are | 24 → 30 | 28 → 36 | `mapa-gap` |
| Servicios | 24 → 30 | 22 → 30 | `cabeza-gap` |
| Cómo trabajamos | 24 → 30 | 22 → 30 | `cabeza-gap` |
| Diagnóstico y contacto | 24 → 30 | 26 → 34 | `diagnostico-izq` |

The computed `margin-bottom` on every pill is 6 px at 390 and 8 px at 1440.
A 1440 capture of Servicios shows the pill clearly separated from "Lo que
hacemos / por tu negocio.".

**Not touched:**
- no service card has a pill above its title;
- the v2 application panel has no pill;
- Nosotros' "Work with muush" pill is the v1 `shared/ui/legacy/Pill`, which
  stays v1 until feature 46.

### Tests

`tests/pill-air.test.ts` pins:
- the token (6 px, 8 px from `lg`, declared exactly twice);
- the utility;
- `pill-aire` on each of the five pills;
- its absence from `Pill.vue` and from the v1 `WorkWithMuushSection`.

No existing test or snapshot pinned these gaps, because the gap tokens
themselves are unchanged.

### Housekeeping

- The local server and Chrome are stopped.
- `git status` shows no stray files in the repo. Scratch files are only in
  `/tmp/impl45/` and `/tmp/impl45-scripts/`.
