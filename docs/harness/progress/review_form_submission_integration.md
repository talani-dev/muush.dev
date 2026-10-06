# Review — feature 29 `form_submission_integration`

APPROVED (round 3). Round 1 and round 2 rejections resolved; see "Round 3" below. Original round-1 rejection reason: the network guard tests from features 16/20 were weakened more than this feature needs (fix 1 below).

Reviewer run: 2026-10-05. Status confirmed `reviewing` in `feature_list.json` before the review started.

## Verification

- `./init.sh` exit 0 (my own run): typecheck, Biome, `pnpm test` (72 files / 905 tests), `pnpm generate`, `pnpm storybook:build` all OK. My first run failed only at the test step, because another process (PID 78111) held the Nuxt build lock. The rerun was clean. This was not a code defect.
- `tasks.md`: 58/58 checked, none open. `spec.md`: every [NEEDS CLARIFICATION] is resolved by the approval note.
- CHECKPOINTS C1-C8: green, except the guard gap in fix 1 (C5/C7 test-coverage quality).

## Required fixes

1. **Restore an artefact-level network guard instead of only deleting it** (`tests/static-output.test.ts`, `tests/forms-config.test.ts`).
   The old 016/020 tests failed on any `fetch(` in the compiled form chunk. Removing that line was legitimate, because the form chunk now has to contain the client's one call site (`globalThis.fetch(` in `formsApiClient.ts`, emitted once in chunk `2ej-cHdU.js`). But the replacement guards much less than it needs to:
   - The source check only scans `app/features/forms/ui/`. A stray `fetch`/`$fetch` added to another `forms/logic/` file, to `landing/ui/ContactSection.vue` or `about/ui/WorkWithMuushSection.vue` (which now handle the submitter), or to any other `ui/` would pass. Before, it would have failed for the form chunk. Art. V applies to every `ui/`, not just the forms one.
   - Required: (a) one source-level assertion that across `app/` (non-test, non-story) the only `fetch(` is in `app/features/forms/logic/formsApiClient.ts`, with no `$fetch`/`useFetch`/`XMLHttpRequest` anywhere under `app/**/ui/`. (b) Keep an artefact assertion on the form chunk(s): exactly one `fetch(` occurrence, and no API host literal (the host should reach the browser only through the runtimeConfig payload in the HTML).
   - Also fix the describe-block comments that are now false: `tests/static-output.test.ts` ~L1244 ("reaches a network call from the form's submit handler") and ~L1353 ("no code path in the compiled bundle … reaches a network call").

## Verified (checked against the code, not the log)

1. Payloads (`logic/submissionPayloads.ts`): built key by key from the values, never from the DOM.
   - Contact: 8 keys, plus `whatsapp` (digits only) only when the preference is whatsapp. `company` is trimmed and becomes `""` when empty.
   - Careers: `portfolio`/`linkedin` only when non-empty, `cvId` only when provided.
   - No honeypot, timestamp, file or `cv` key. `areaRole` goes through `toRoleId` (map from `area:role` to the bare role id; unknown values throw, and the flow turns that into failure). Tests confirm the 24 ids exactly as in contract § 5, and that no area id comes out.
   - `locale` comes from `useI18n().locale`, read at submit time (`useFormSubmission.ts`).
2. Tokens: `sendWithFreshToken` gets a new token for each send, and on `challenge` retries exactly once (no third send). Turnstile does `reset`+`execute` on every `getToken`.
   - The CV flow uses separate token requests for upload and careers, and the second token is requested only after the PUT settles (tested).
   - Success comes only from `classifyApiResponse` returning `ok` (status 200 AND `ok === true`). `200 ok:false` maps to failure (tested).
3. S3 PUT: `grant.method`, with `grant.headers` passed as the same object returned by the server (`toBe` identity tested). Upload request failure, validation, double challenge, malformed grant, PUT non-2xx, PUT reject and timeout all lead to applying without `cvId`, with `cvAttached:false` and the CV note shown. If the application fails after a good upload, the result is failure with no note.
4. `validation_failed`: `fields[]` are mapped to visible inputs (`serverFieldErrors.ts`) and focus goes to the first in form order (`useFormSubmitState.applyOutcome`). An unmappable field (`locale`, `cvId`, `company`, a hidden `whatsapp`) shows the generic error. 500, network errors, timeouts, non-JSON bodies and `invalid_json` all go to `server-error`, and values are never cleared.
5. Config: `runtimeConfig.public.{formsApiBaseUrl, turnstileSiteKey}` in `nuxt.config.ts`, default sitekey `…BB`, read only in `logic/useFormSubmission.ts`.
   - No host or sitekey literal under `app/`, and no `process.env` (grep plus `tests/forms-config.test.ts`). `.env.example` has placeholders only. No real credential found.
   - Art. IV: no server route, preset unchanged. Art. V: no fetch in any `ui/` file today; all touched components are under 200 lines (largest `ContactSection.vue` 184, `ApplicationForm.vue` 182).
   - Art. VI: ES/EN keys match exactly. New copy matches OA-2 and OA-4. Art. XII: no `../` imports, cross-feature access only through the barrel.
6. Turnstile: the script is inserted by `loadTurnstileApi()` only from `engage()` (form `focusin` or submit), never at setup or mount. The token source is created per form page only. The generated HTML has no `challenges.cloudflare.com` script tag; the URL exists only inside a JS chunk. `appearance: 'interaction-only'`, `response-field: false`. Prerender is unaffected (`pnpm generate` OK, 12 routes).
7. Guard rewrite: see fix 1. The XHR / FormData / createObjectURL assertions were kept, and the new Turnstile-not-in-HTML, honeypot-markup and no-preview-state artefact tests are good additions.
8. `.github/workflows/`: no change. `docs/business/` diff covers only `ui-map.md` (§ 7 anti-spam/destination, § 9 CV storage), `decisions-open.md` (#1, #9 resolved) and the new `form-api-contract.md`, which are the three files the leader authorized. No other business doc changed. Git cannot show who made those three edits; their content matches the authorized resolutions.

## Non-blocking notes

- `logic/useFormSubmission.ts` (runtimeConfig + i18n locale wiring) has no unit test. FR-009 holds by reading the code, but nothing tests that wiring. A small test with mocked `useRuntimeConfig`/`useI18n` would close that.
- UNVERIFIED (also flagged in the implementer's log): that `reset`+`execute` on one widget yields a fresh token from real Cloudflare. Only a fake Turnstile is exercised. Smoke-test in a browser with the `…BB` key before go-live.
- OA-3 visible behaviour: a real visitor who submits in under 3 s sees the generic error once. This was approved as is, and the implementer flagged it too.
- Release prerequisites in the spec (real Invisible sitekey in the production build env, API routes live) remain Roberto's and are outside this feature.
- `ui-map.md` § 7 still shows the success copy with the literal `[correo/WhatsApp]`. i18n now interpolates it per OA-4. Consider aligning the doc (leader-owned).

## Round 2 (2026-10-05)

REJECTED: the new source guard `tests/forms-config.test.ts` L116 uses `/\bfetch\(/`, which misses `fetch (` and `fetch\n(`. This was an explicit acceptance criterion for this round.

- Probe (reviewer): adding `fetch ('/probe')` to `forms/logic/submissionFlows.ts`, and a newline-split `fetch\n('/probe')` to `landing/ui/ContactSection.vue`, left `tests/forms-config.test.ts` 9/9 green. Only Biome's formatter flagged them. Each file was restored and its md5 verified.
- Required fix: use `/\bfetch\s*\(/` at L116. For consistency, also use it in the chunk counter in `tests/static-output.test.ts` (~L1524). Minified output is not at risk today. Then re-run the spaced-fetch probe.
- Everything else passes:
  - Scopes are correct. The source test covers all non-test, non-story `.ts/.vue/.js/.json` under `app/`. The ui/ test covers every `ui` path segment. `window.fetch(` is caught (probe failed test (a) as expected).
  - The chunk test checks for exactly one `fetch(` and no host in the form chunks. The scoping is justified.
  - The stale comments at ~L1246 and ~L1358 are fixed.
- No product code changed since round 1. The three files the implementer used as probes have only mtime changes and contain no residue. `./init.sh` exit 0 (908 tests). Working tree has no probe residue.

## Round 3 (2026-10-05)

APPROVED

- Fix verified in the code: `/\bfetch\s*\(/` at `tests/forms-config.test.ts` L92 (forms ui/) and L116 (single call site across app/). `tests/static-output.test.ts` L1524 uses `/\bfetch\s*\(/g` with `matchAll`, and still expects exactly 1 call in the form chunks.
- Reviewer probes: `fetch ('/probe')` appended to `forms/logic/submissionFlows.ts`, then `fetch\n('/probe')` before `</script>` in `landing/ui/ContactSection.vue`. Each one failed `should find fetch( only in forms/logic/formsApiClient.ts` (1 failed / 8 passed). Both files were restored from backup, md5 matched the pre-probe values, and there is no `__probe` residue under `app/` or `tests/`.
- Product code: since the round-2 verdict, only `tests/forms-config.test.ts` and `tests/static-output.test.ts` changed in content. `forms/ui/FileField.vue` has a newer mtime, but it has no probe residue and its diff from HEAD is only the feature-029 doc comment already reviewed (INFERRED: touched by the implementer's own probe and restored).
- `./init.sh` exit 0 (72 files / 908 tests, generate and storybook OK).
- Non-blocking notes from round 1 still stand.
