# Implementation · feature 29 `form_submission_integration`

- **Agent:** implementer
- **Date:** 2026-10-05
- **Spec package:** `specs/029-form-submission-integration/` (approved at the
  human gate 2026-10-05; OA-1..OA-6 as listed in the approval note of
  `spec.md`)
- **Status left as:** `in_progress` (the leader moves it to `reviewing`)
- **tasks.md:** 58/58 checked; annotations on T018, T027, T029, T037, T052,
  T053, T055, T056, T057 record where execution differed.

## What was built

| Area | Files |
|---|---|
| Config | `nuxt.config.ts` (`runtimeConfig.public.formsApiBaseUrl`, `.turnstileSiteKey`, default `1x00000000000000000000BB`), `.env.example` (placeholders only) |
| Types / constants | `forms/data/submissionContract.ts`, `forms/data/turnstile.ts`, `ROLE_IDS`/`RoleId` + field-order constants in `contactFields.ts` / `applicationFields.ts` |
| Pure logic | `submissionPayloads.ts`, `formsApiClient.ts`, `sendWithFreshToken.ts`, `serverFieldErrors.ts`, `submissionFlows.ts`, `fieldErrorMessage.ts`, `focusField.ts`, `selectOptions.ts`, `useSpamGuard.ts` |
| Turnstile | `useTurnstile.ts` (lazy, module-level script promise, one widget, `reset` + `execute` per token) |
| State machine | `useFormSubmitState.ts` (shared), `useContactForm.ts` / `useApplicationForm.ts` rebuilt on it |
| Nuxt seam | `useFormSubmission.ts` (`useContactSubmitter`, `useApplicationSubmitter`), exported from the barrel |
| UI | `ContactForm.vue`, `ApplicationForm.vue` (submitter prop, host div, focusin engage, aria-busy, real states), `WhatsappField.vue` (renamed, now shared), `FormOutcome.vue`, `HoneypotField.vue` |
| Wiring | `pages/index.vue`, `pages/nosotros.vue`, `landing/ContactSection.vue`, `about/WorkWithMuushSection.vue` (pass-through `formSubmitter`) |
| Copy | `forms.contact.success.title` now `{channel}`; `forms.contact.success.channel.{email,whatsapp}`; `forms.application.success.cvNote` (OA-2 verbatim, `@` as `{'@'}`) in both locales |
| Tests | 10 new test files + rewritten composable/component/copy/static-output tests. Every network call is a mocked `fetchImpl`; Turnstile is always faked. Nothing reaches the real API or S3 |

## Measurements

`wc -l app/features/forms/ui/*.vue` (Article V, limit 200; plan target ≤ 185):

| File | Lines |
|---|---|
| ApplicationForm.vue | 182 (was 205) |
| ContactForm.vue | 172 (was 221) |
| FileField.vue | 154 |
| SelectField.vue | 129 |
| WhatsappField.vue | 83 |
| RadioPillGroup.vue | 76 |
| TextField.vue | 66 |
| FormOutcome.vue | 64 |
| TextareaField.vue | 55 |
| HoneypotField.vue | 34 |

`ContactSection.vue` 184, `WorkWithMuushSection.vue` 148.

Generated artefact (`.output/public`), checked by hand and by `tests/static-output.test.ts`:
no `challenges.cloudflare.com` in any page's `<script>` tags (the URL lives
only in a JS chunk and is inserted on first engagement); the runtime config in
the HTML carries the API base URL and the test sitekey `…BB`; the honeypot
renders as `<div aria-hidden="true" class="sr-only"><input type="text"
name="muush_website" … tabindex="-1" autocomplete="off">` on all four form
pages.

Test suite: 72 files, 905 tests, all green.

## Deviations from the spec package

1. **Shared state machine.** Plan/tasks extend each form composable with its
   own five-state machine. That would duplicate ~60 lines, so it lives once in
   `logic/useFormSubmitState.ts` and both composables compose it (Art. VIII).
   Tested through both composables' suites rather than a file of its own.
2. **Extra extraction** `logic/selectOptions.ts` (option lists + area/role
   groups) to bring `ApplicationForm.vue` to ≤ 185 (it was 193 after the
   planned extractions).
3. **`markInteractive` is called by the component** (`onMounted`) rather than
   inside the composable, so the composables stay callable without a
   component instance in unit tests.
4. **Superseded static-output assertions rewritten.** Features 016/020
   asserted no `fetch(` in the compiled form chunks; that guarantee is exactly
   what this feature removes. They now assert no XMLHttpRequest / FormData /
   createObjectURL; the FR-025 "no fetch in `ui/`" check is on sources in
   `tests/forms-config.test.ts`.
5. **Turnstile verification without Context7** (not exposed to this
   subagent): read Cloudflare's public docs directly. All option names
   confirmed; `execute` is called with the container element as the docs
   show. Recorded in `docs/harness/findings.md` § R65, which also notes that
   `appearance` has no effect on Invisible widgets — "no visible captcha"
   depends on the real sitekey being of type Invisible.
6. **Stale comment fixed outside the plan:** `FileField.vue`'s header claimed a
   "structurally-enforced dead end"; it now says the file is uploaded by
   `submissionFlows.ts`.

## Not done / open

- **Manual smoke of `quickstart.md` not run**: no browser in this session.
  In particular, that `reset` + `execute` on one widget yields a fresh token
  against real Cloudflare is UNVERIFIED (only a fake Turnstile is exercised).
- **The CV note has no design frame.** It reuses the body-copy role
  (`text-body-sm text-ink-100`) under the confirmation. If Clau wants a
  different treatment, it is one class list in `FormOutcome.vue`.
- **Possible business question for a human (not written anywhere):** OA-3
  shows the generic error when the 3 s timer trips. A fast real visitor sees
  "No pudimos enviarlo…" once and succeeds on the next press. Approved as is;
  flagged only so the leader knows it is visible behaviour.
- **Release prerequisites (Roberto):** real Invisible sitekey and, if it
  changes, the API base URL must be present in the production `pnpm generate`
  environment; the API routes must exist. `.github/workflows/` was not
  touched.

## Verification

`./init.sh` run at the end of this cycle: **exit 0**. typecheck, Biome,
`pnpm test` (72 files / 905 tests), `pnpm generate` and
`pnpm storybook:build` all `[OK]`.

## Rework after review (2026-10-05): restored network guard

The only blocking item in `review_form_submission_integration.md` was fix 1. No product code changed.

- `tests/forms-config.test.ts`, new describe "one network call site in all of app/":
  - (a) Across every non-test, non-story source under `app/`, the set of files containing `fetch(` is exactly `[app/features/forms/logic/formsApiClient.ts]`.
  - (b) No file under any `ui/` folder (any feature or `shared/`) contains `$fetch`, `useFetch` or `XMLHttpRequest`.
  - The existing forms/ui-only check stays.
- `tests/static-output.test.ts`, new test in "form submission (feature 029)": the form chunk(s) together contain exactly one `fetch(` and do not contain the API host.
  - The host is read from `formsApiBaseUrl` in `nuxt.config.ts`.
  - The host check is scoped to the form chunk(s) on purpose, and the test comment says why. The default lives in runtimeConfig, so it legitimately appears in the serialized config in the HTML. CONFIRMED: the host is present in `.output/public/es/index.html`.
- Fixed the outdated describe comments for the contact and about-work sections. They now state the 029 supersession and point to the new guards.
- Each guard was checked against a temporary violation, which was then removed. The files were restored and verified byte-identical by md5.
  - `fetch("/probe")` added to `useContactForm.ts`: the source test (a) failed.
  - `$fetch` added to `landing/ui/ContactSection.vue`: test (b) failed.
  - An extra `globalThis.fetch(` added in `formsApiClient.ts`: the chunk test failed with "expected 2 to be 1".
  - A host literal fallback added in `formsApiClient.ts`: the chunk test failed on the host assertion.
- `./init.sh`: exit 0 (72 files / 908 tests).

## Round 3: fix for review round 2 (2026-10-05)

Only tests changed. No product code changed, and the status was left alone.

- `fetch` guards now allow whitespace, including newlines, between `fetch` and `(`. The regex `/\bfetch\(/` became `/\bfetch\s*\(/` at three sites:
  - `tests/forms-config.test.ts` L92, the forms/ui guard. The reviewer did not flag this one, but it had the same gap.
  - `tests/forms-config.test.ts` L116, the single call site in all of `app/`. This one uses `.test()` with no `g` flag on purpose, because `g` makes `.test()` stateful through `lastIndex`.
  - `tests/static-output.test.ts` L1524, the chunk counter. It counts with `matchAll`, so it keeps the `g` flag.
- I checked the other guard regexes this feature added: `new\s+XMLHttpRequest`, `\$fetch|useFetch|...`, `formsApiBaseUrl:\s*'...'`, `<form[^>]*novalidate`, `preview-?state`, and the chunk selector. None of them depends on what sits between a callee and `(`, so they do not have this gap.
- Probes. Each file was backed up, restored by copy, and its md5 checked against the value taken before the probe.
  - `fetch ('/probe')` appended to `forms/logic/submissionFlows.ts`: the call-site test failed (1 failed / 8 passed).
  - `fetch\n('/probe')` split across lines in `landing/ui/ContactSection.vue`: the call-site test failed (1 failed / 8 passed).
  - `fetch\n('/probe')` split across lines in `forms/ui/FileField.vue`: both the forms/ui test and the call-site test failed (2 failed / 7 passed).
  - After restoring, all three md5 values matched and the working tree had no probe residue.
- `./init.sh`: exit 0 (72 files / 908 tests).
