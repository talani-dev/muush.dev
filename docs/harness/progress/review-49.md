# Review · feature 49 `consented_tracking`

Reviewer, 2026-11-07. Branch `feat/v2-consented-tracking`, uncommitted working tree.
Status was `reviewing` at the start (CONFIRMED in `feature_list.json`).

## Verdict: APPROVED

No blocking findings. The non-blocking items below go to the leader and to
Roberto's manual walk. They do not hold the merge.

## Verification (re-run by the reviewer)

| Command | Result |
|---|---|
| `pnpm check` | PASS (676 files) |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS, 237 files / 3247 tests. The first run failed only on the Nuxt build lock: "Another Nuxt build is already running", from a concurrent process (PID 77724) outside this review. A clean re-run passed. |
| `pnpm generate` | PASS on the re-run. The first run hit the same lock. |
| `pnpm storybook:build` | PASS |
| `./init.sh` | exit 0, "Environment ready." |

What I checked in `.output/public`, after the last generate:

- `robots.txt`: `User-agent: *` plus two groups: search/answer (6 agents) and training (5 agents). Each group has only `Disallow:` (empty). `Disallow: /` appears 0 times. `Sitemap: https://muush.dev/sitemap.xml` appears once. There is no robots file under `public/`. CONFIRMED.
- `llms.txt`: byte-identical to `public/llms.txt` and to the fenced block of copy-drafts § C. Its 10 links equal the 10 `<loc>` entries of `sitemap.xml`. CONFIRMED.
- 0 `.map` files and 0 `sourceMappingURL`. CONFIRMED.
- I grepped all 13 HTML documents for `googletagmanager`, `fbevents`, `connect.facebook`, `gtag(`, `fbq(` and `<noscript`. 0 matches. The two IDs appear only inside the serialized public runtime config. The vendor URLs appear only in one JS chunk. CONFIRMED.

## Focus risks

1. **Load or send before consent, or after revoke.** Nothing to report.
   - `startTracking` follows `consent` with a sync, immediate watch (`app/features/tracking/logic/startTracking.ts:84-97`).
   - `toolSwitch` subscribes a sink only on grant. The vendor modules are dynamic imports, and `injectScript` runs only inside `grant()`.
   - On revoke, the switch unsubscribes the sink and drops the queue (`toolSwitch.ts:54-60`). GA sets `ga-disable-<id>` and expires `_ga` and `_ga_<id>` (`googleAnalytics.ts:93-101`). Meta calls `fbq('consent','revoke')` and expires `_fbp` (`metaPixel.ts:104-109`).
   - Revoking Analítica also stops section timing. Its flush runs after GA is unsubscribed (`startTracking.ts:75-78`), so nothing reaches GA.
   - Expired, future-dated and feature-48 records parse to `null` (`consentRecord.ts:69-97`).
2. **Personal data in GA4/Meta.** Every emit site passes typed closed-list ids, booleans or numbers. I checked each `emitTrackingEvent` call under `app/`. The click listener re-validates `data-track*` against the closed lists.
   - The GA sink reads only `event.params` and never `userData` (`googleAnalytics.ts:51-56`).
   - The `website` value never enters an event. Only the field id `website` can appear, as `form_error.field`, and the field has no validation, so in practice it does not.
   - Advanced matching sends only the trimmed, lowercased email and, with WhatsApp only, dial code + digits (`submissionFlows.ts:83-89`, `metaPixel.ts:56-66`). It runs only from the Meta sink, which is subscribed only with Publicidad.
   - `tests/tracking-privacy.test.ts` feeds a full PII set, `website` included, through both forms.
3. **Page views.** The first navigation is not counted by the router hook, because the grant records it (`pageViews.ts:23-29`). A path change ignores the trailing slash. A hash-only change keeps the same `path`, so it gives no page view. GA uses `send_page_view: false`. The GA4 history toggle is OFF (current.md, Q1). Meta has `disablePushState`; see N2.
4. **i18n and copy.** I compared every A2–A11, B1–B4 and D string programmatically against `i18n/locales/{es,en}.json`. All match literally. A1 is left at 5 Nov, which is accepted. The ES/EN key sets are identical. The ES diff contains no change outside §§ A, B and D. The privacy model orders analytics before advertising and google right after meta.
5. **`website` payload (FR-060–FR-067).**
   - `websiteEntry` trims, omits the key when empty, and is never null or `""` (`submissionPayloads.ts:65-72`).
   - The limit counts 300 code points with `Array.from`. Over the limit, it throws, and the flow returns a generic failure before any request (`submissionFlows.test.ts:118`).
   - The input has `maxlength="300"` and `type="text"` and is not required. Its id is `website`, not the honeypot's `muush_website`, which the static output test asserts.
   - The careers payload never carries `website` (`submissionPayloads.test.ts:279`).
   - `website` is not in `CONTACT_SERVER_ERROR_KEYS`, so a server mark ends in the generic error.
   - The field sits in step 2 between identity and need, and in the same position on desktop.
6. **Older tests changed.**
   - `tests/forms-config.test.ts`: the SDK guard now ignores relative and `@/` specifiers. That is justified: the site's own `./googleAnalytics` and `@/features/tracking` matched `/analytics/`. Any npm SDK package (`gtag`, `posthog`, `@sentry/`, `*analytics*`) is still caught.
   - `tests/static-output.test.ts`: the "no website field" assertion is inverted to match the amended spec. It is stronger, not weaker: it now checks type, maxlength, placeholder, not required, not the honeypot name, position, both labels, and still no `social` field.
   - `tests/forms-copy.test.ts`: the same inversion, with exact values.
7. **Deviations in impl-49.md.** None contradicts the spec.
   - Dropping `mobile_menu` from `CTA_LOCATIONS` is consistent with FR-021 ("places the CTA exists"). The header CTA is `lg:` only, and the mobile menu has only nav links.
   - Adding `assessment` and `send_notice` comes from the audit. FR-021 allows it.
   - The 21 observer thresholds implement § 5's "half the viewport" rule more faithfully than R8.
   - `support@muush.dev` in llms.txt is approved text (§ C).

## Checkpoints

- C1, C2 PASS: only feature 49 is `reviewing`.
- C3, C4 PASS:
  - The barrels and `app/shared/` seam hold. No `../` imports. No hex or rgb literals in the diff. No debug prints or TODOs.
  - `nitro.preset: 'static'`, no `server/`. `ContactForm.vue` has 190 lines, under the 200 limit.
  - `tracking` has no `ui/`, as accepted in plan Phase -1.
- C5 PASS.
- C6: the history entry is the leader's close-out step.
- C7: plan gates are all `[x]`, and there are no `NEEDS CLARIFICATION` markers. Three tasks remain unchecked: T044, T068 (partial) and T051 (partial). They are exactly the accepted manual checks M9–M11, M17, the visual part of M14 and the full M12.
- C8 PASS.

## Non-blocking findings

- **N1. Meta user data probably persists after the Lead.**
  - Where: `app/features/tracking/logic/metaPixel.ts:91`.
  - Cause: `fbq('init', pixelId, {em, ph})` re-initializes the pixel. fbevents normally attaches init user data to every later event of that pixel in the document (INFERRED, not verified).
  - Effect: after a confirmed assessment, a later `PageView`, `Schedule` (form success "Agenda una llamada") or `Contact` in the same visit would also carry hashed `ud[em]`/`ud[ph]`.
  - Why it is not blocking: notice A4 and A6 cover sending the hashed email and phone to Meta when an assessment is requested, and approved research R4 chose this mechanism. A strict reading of FR-026/FR-030 limits the data to the Lead only.
  - Action: during M9, also inspect the next Meta request after the Lead. If it carries `ud[]`, Roberto decides: accept, or reload or re-init without user data.
- **N2. Two vendor APIs are still UNVERIFIED** (findings § R80):
  - `fbq.disablePushState` (`metaPixel.ts:76`): if it is ignored, Meta double-counts PageView on in-app navigation.
  - The second `init` call itself: M9 must confirm the Lead carries the 64-hex `ud[em]`/`ud[ph]`.
  - Both are covered by the accepted manual walk (M12 and M9).
- **N3. An observer can leak on fast page changes.**
  - Where: `app/features/tracking/logic/useSectionTiming.ts:119-123, 165-168`.
  - Cause: when two page changes happen before the deferred `observePage` runs, each pending call creates an observer. The deferral waits for router ready and scroll settle, up to 2 s. Only the last observer is kept and later disconnected.
  - Effect: the leaked observer can report its removed `hero` element as "left" and cut short the new page's `hero` visit. `hero` exists on both pages.
  - Impact: analytics accuracy only, with no privacy effect.
  - Fix: guard with a page token, or disconnect the existing observer at the start of `observePage`.
- **N4. GA receives `transport_type: 'beacon'`** (`googleAnalytics.ts:53`), which R80 marks UNVERIFIED. In the worst case it arrives as a fixed-value parameter, which is harmless.
- **N5. Pre-deploy items, already listed in impl-49.md "For the leader":**
  - A1 date at merge.
  - R43/FR-067 confirmation.
  - `docs/business/` lines superseded: `muush-1.0.md` § 1 and the note under § 4.6; `landing/form-api-contract.md` § 3.
  - GA4 custom dimensions and key events.
  - R32 hand-off to Clau.

APPROVED

---

## Fix round 1 (npa) — re-review 2026-11-07

Scope: `googleAnalytics.ts`, `metaPixel.ts`, `form_response` (`trackingEvents.ts`, `submissionFlows.ts`), their tests, `tests/tracking-privacy.test.ts`, spec FR-020/FR-027, data-model, tasks T069. Status confirmed `reviewing`. No request was sent to Google or Meta.

### Checks

- **Nothing before the grant: PASS (CONFIRMED in code and tests).** The three `set` calls, `consent default`, `js` and `config` all run inside `load()`, which only `grant()` calls. The "before the grant" test still asserts no script, no `gtag` and no `dataLayer`. Built HTML in `.output/public` has no `googletagmanager`/`fbevents`/`connect.facebook` reference (vendor URLs exist only in lazy JS).
- **Revoke and re-grant: PASS.** GA: `load()` is memoised, so a re-grant clears `ga-disable-<id>`, sends one `page_view`, and repeats neither the script nor `consent`/`set` (the test asserts 1 `consent` and 3 `set`). Meta: re-grant does `consent grant` then one `trackSingle PageView`. After a revoke, the sinks and `sendPageView` are no-ops in both vendors (tested).
- **One page view per load and per route change: PASS.** GA: `set send_page_view false` before `js` removes gtag's automatic hit (measured in impl-49 § Fix round 1, INFERRED from the captures that I did not re-run). The page view on load comes from `grant()`. Route changes come from `router.afterEach`, where `isNewPage` is false for the initial navigation and for hash-only changes. Meta: `trackSingle` on every call. The test checks 3 sends for 3 calls.
- **No personal data: PASS.** `form_response` params are `form`, `result` and `error_type` from closed lists. `trackSingle` carries only the pixel id and `PageView`. The privacy test adds `form_response` to the GA closed-list check. The flow test checks that name, email, website and company do not appear.
- **Advanced matching: PASS, unchanged.** `init` with `{em, ph}` happens only for `generate_lead` with `userData`, and only while Advertising is granted. The privacy test asserts exactly one matching `init` and `track` = `[Lead]`. `META_EVENT_BY_NAME` has no `form_response`, and the Meta test asserts it never reaches Meta.
- **FR-027: PASS.** The event fires once per attempt that reached the API, after the token retry (tested with a single CHALLENGE then ok). A 400 maps to `validation` whatever its fields. A failed upload grant reports its type. A failed PUT reports `server`, and `/careers` is not called. With no token, nothing is sent. `generate_lead`, `application_submit` and `form_error` are unchanged. `putCv` catches its own errors, so the PUT path always reports.
- **Tests not weakened: PASS.** The only edit to an existing assertion is the `application_submit` test, which now filters out `form_response`. That is a scoped accommodation, and the event has its own tests. The GA order test is stricter: it checks the exact first 6 calls.
- **Docs: PASS.** FR-020 lists `form_response`. FR-027, data-model row, tracking-plan § 4 row and T069 `[x]` agree. findings.md § R80 records the correction.

### Commands
`pnpm check`, `pnpm typecheck`, `pnpm test` (237 files, 3262 tests), `pnpm generate`, `pnpm storybook:build` and `./init.sh` all exit 0.

### Non-blocking
- F1. Historical text still shows the old calls: tasks.md T016 says "`track PageView`", and research.md R3 (~l.80) has `js` before the privacy fields. Code and findings § R80 are correct. Optionally add a pointer to § R80.
- F2. N1 still applies, and now `trackSingle PageView` is also affected: after a confirmed Lead, a later in-app PageView may carry `ud[em]`/`ud[ph]` (INFERRED). Check this in M9.
- F3. Why the custom events were missing in GA4 is UNVERIFIED (impl-49 § Fix round 1 item 3). After deploy, Roberto should check DebugView and Admin → Data filters.
- F4. Treating a failed CV PUT as `server` is already written into FR-027. Roberto confirmed it implicitly through the spec text. Confirm it explicitly if desired.

**Fix round 1 verdict: APPROVED**
