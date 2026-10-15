# Implementation Plan: Dial-code selector before the WhatsApp number

**Branch**: `032-whatsapp-dial-code-selector` (git: `feat/whatsapp-country-code`) | **Date**: 2026-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/032-whatsapp-dial-code-selector/spec.md`

## Summary

Add a country/dial-code selector in front of the WhatsApp number in both
forms, and move both forms to the backend contract agreed on 2026-10-14:
`whatsappDialCode` (`^\+[1-9]\d{0,3}$`) sent next to `whatsapp`, which
becomes 6–14 digits without the dial code. The form stores a **country
code** (`whatsappCountry`, default `MX`) and derives the dial code only
when building the request. **Amendment A1 (2026-10-14)**: the default is
Mexico, replaced by the country CloudFront computes from the visitor's IP,
read from the same-origin `GET /__geo` answered by muush-foundation's
existing `request-router` viewer-request function
([contracts/edge-geo-endpoint.md](./contracts/edge-geo-endpoint.md)). The
site asks once per page load, on the first form interaction or the switch to
WhatsApp, aborts after 3 s, accepts only a two-letter code in the list, and
never overwrites the visitor's pick. `navigator.languages` detection is
removed. Country data is a static 245-row
module; names come from `Intl.DisplayNames` in the page language; flags are
regional-indicator emoji. Baseline control is a native `<select>` with a
custom closed face (gate OA-6 may switch to a custom combobox; delta tasks
are listed). A server `validation_failed` naming `whatsappDialCode` marks
the selector through a one-entry alias. All code stays in
`app/features/forms/`, plus locale JSON, repo-level copy tests and fixtures
the type change forces. No dependency, no server, no third-party request;
the only request added is the same-origin `/__geo` (A1).

## Technical Context

**Language/Version**: TypeScript strict, Vue 3.5 `<script setup>`, Nuxt 4 (`nitro.preset: 'static'`)
**Primary Dependencies**: existing only (`@nuxtjs/i18n`, Tailwind v4); browser `Intl.DisplayNames`, `Intl.Collator`, `fetch`, `AbortController`; no new package (research R4, R14)
**Storage**: N/A (no persistence of the chosen country; the `/__geo` report lives in page memory only, no cookie, no Web Storage)
**Testing**: Vitest 4 + `@nuxt/test-utils` + happy-dom (global env), Vue Test Utils, Storybook 10
**Target Platform**: static files on S3 + CloudFront, evergreen browsers
**Project Type**: static web site (Nuxt SSG)
**Performance Goals**: ≈ 4 KB of data in the form chunks; names computed once per locale change; A1: zero requests before form interaction, then at most one ≤ 3 s same-origin `/__geo` per page load
**Constraints**: Art. IV (no server, no third-party request), Art. V (≤ 200 lines; `ApplicationForm.vue` is at 199), Art. VI (parity), Art. VII (no literal, no token invented without `.pen` values), contract § 6 (unknown keys rejected → deploy order, OA-2); A1: no third-party origin, no IP sent, no Geolocation API, no time zone, no browser language, site fully functional without the edge piece
**Scale/Scope**: 2 forms, 1 new data module, 1 new logic module, 1 new component, ~12 source files modified, ~15 test/story/fixture files updated

No `NEEDS CLARIFICATION` remains: OA-1..OA-10 in the spec carry proposals
the plan is built on. Each maps to a constant, a copy key, a class list or
(OA-6) one swappable component.

## Constitution Check

*GATE: evaluated before Phase 0 and re-evaluated after Phase 1 design. All
pass. No exception needs Complexity Tracking.*

### Phase -1: Pre-Implementation Gates

#### I · Feature-Based + Capas Architecture
- [x] All behavioural code in `app/features/forms/{data,logic,ui}`? → **Planned yes.** New `data/countries.ts`, `logic/countryOptions.ts`, `ui/DialCodeSelect.vue`. Outside: `i18n/locales/*.json`, `tests/forms-*.test.ts`, fixture literals in `landing/ui/ContactSection.{test,stories}.ts` and `about/ui/WorkWithMuushSection.{test,stories}.ts` forced by the content-type change.
- [x] Pages stay thin? → **Yes**, no page edit.
- [x] Nothing added to `app/shared/`? → **Yes.** Country data is used only by the forms module (Art. III: no premature shared abstraction).

#### II · Dependency Direction (NON-NEGOTIABLE)
- [x] `data/` imports nothing from `logic/`/`ui/`? → `countries.ts` imports nothing. `contactFields.ts`/`applicationFields.ts` import the `CountryCode` and `CountryOption` types from `data/countries.ts` (same layer). `CountryOption` is declared in `data/` because the content shapes in `data/` reference it; it is built in `logic/countryOptions.ts`.
- [x] `logic/` imports only `data/` and same-dir logic? → **Yes.**
- [x] `ui/` imports `logic/`/`data/`/`@/shared/ui`/assets only? → **Yes.** `DialCodeSelect.vue` imports types and the existing `chevron-down.svg?raw`.

#### III · Feature Isolation (NON-NEGOTIABLE)
- [x] `landing`/`about` touch forms only through the barrel? → **Yes**, fixture files already import content types from `@/features/forms`.

#### IV · Static-Site Purity (NON-NEGOTIABLE)
- [x] No server route, no request-time compute, no third-party request? → **Yes** for the original scope: names from the browser's `Intl`; flags are text. Quickstart greps `.output/public` for new origins. *(Original wording "detection reads `navigator.languages`" superseded by A1.)*
- [x] **A1** `nitro.preset: 'static'` unchanged; no `server/`; no new runtime dependency; generated output holds no country? → **Yes** (implementer, T067) (FR-A10; `tests/static-output.test.ts` asserts).
- [x] **A1** No feature that **requires** compute at request time? → **Yes, approved by Roberto 2026-10-14 (spec IP-2): complies without amendment.** Without the edge piece every visitor gets Mexico, the specified default; the request-time evaluation lives in muush-foundation's CDN function, the "different service" Art. IV sends such needs to (research R12). Precedent: the site already requires that function for its deep links (`rules.md` § R21).
- [x] **A1** No third-party request? → **Yes** (implementer, T067). Relative `/__geo` only, `credentials: 'omit'`, no body, no header; no `navigator.geolocation`, no `navigator.languages` in emitted JS (asserted over `.output/public`). *Implementation note: `navigator.languages` is asserted absent from the chunk(s) holding `/__geo`, not from every emitted script: the `@nuxtjs/i18n` entry chunk ships its own browser-language helper, which predates A1 and is outside this feature.*

#### V · Component Discipline
- [x] `ui/` never calls `fetch` or a Nuxt composable? → **Yes.** Options arrive in `content` from the content composables; `tests/forms-config.test.ts` keeps enforcing no `fetch`.
- [x] **A1** The `/__geo` `fetch` lives in `logic/edgeCountry.ts`, reached through the page-built submitter port (`lookupCountry?`); no `.vue` file changes? → **Yes** (implementer, T067) (research R14).
- [x] Every component ≤ 200 lines? → **Planned.** `ApplicationForm.vue` 199: `WhatsappField` receives `content` + `errors` as two props (research R9), fallback trims listed. `DialCodeSelect.vue` ≈ 80, `WhatsappField.vue` ≈ 100, `TextField.vue` ≈ 75. Reviewer runs `wc -l`.
- [x] Logic out of `<script setup>`? → Detection, options, flags, dial-code lookup in `logic/countryOptions.ts`; "picked" flag and handler in the composables.

#### VI · i18n Parity (NON-NEGOTIABLE)
- [x] **A1** No copy added or changed; the site **language** never depends on the IP country (IP-5)? → **Yes** (implementer, T067).
- [x] New keys in both locales? → 3 keys × 2 forms per locale, 2 changed values per locale (data-model § 7). `tests/i18n-parity.test.ts` enforces; copy tests assert exact strings.
- [x] No hardcoded user-facing string? → **Yes.** Country names from `Intl.DisplayNames`, never literals; the "+" and parentheses in the option text are formatting in `logic/`, not copy.
- [x] Routes? → none added.

#### VII · Design Tokens Discipline
- [x] **A1** No visual change, no new literal? → **Yes** (implementer, T067) (OA-10 still open for the original visuals).
- [x] No hex/oklch/arbitrary value, no invented token? → **Yes.** Only tokens already used by `TextField`/`SelectField` (research R7). Layout **UNVERIFIED against the `.pen`** (OA-10); a leader-supplied value with no token becomes a token in `global.css`.

#### VIII · Clean Code Discipline
- [x] No magic numbers? → `WHATSAPP_MIN_DIGITS`, `WHATSAPP_MAX_DIGITS`, `DEFAULT_COUNTRY`, `DIAL_CODE_PATTERN`, regional-indicator base as a named constant.
- [x] DRY? → One `WhatsappField` + one `DialCodeSelect` for both forms; one `countryOptions.ts`; one alias map; digit rule constants shared (application re-exports).
- [x] No dead code? → `WHATSAPP_MX_DIGIT_COUNT` and its comments deleted; feature-16 A-03 comment in `contactFields.ts` rewritten.
- [x] No speculative abstraction? → No per-country length rules, no phone parsing, no persistence.
- [x] **A1** No dead code: `detectDefaultCountry`, `readBrowserLanguages`, `regionOf`, the `readLanguages` option and their tests deleted? → **Yes** (implementer, T067).
- [x] **A1** DRY: `countryPicked` + `onWhatsappCountryChange`, duplicated in both composables, move into one `logic/useDefaultCountry.ts`? → **Yes** (implementer, T067).
- [x] **A1** No magic numbers: `EDGE_COUNTRY_PATH = '/__geo'`, `EDGE_COUNTRY_TIMEOUT_MS = 3000`? → **Yes** (implementer, T067).

#### IX · TypeScript Strict + Biome
- [x] No `any`/`@ts-ignore`? → **Yes.** *(The `navigator.languages` guard and `Intl.Locale` parse go away with A1.)*
- [x] **A1** The `/__geo` JSON body is typed `unknown` and narrowed? → **Yes** (implementer, T067).

#### X · Testing Discipline
- [x] Unit tests (`should … when …`)? → data set, detection (region, no region, numeric region, unlisted, malformed, empty), flags, options sort/names in ES and EN, dial-code lookup, validation 0/5/6/14/15 digits, payloads with/without WhatsApp for both endpoints, alias marks, composable default/keep/fallback.
- [x] Component tests? → `DialCodeSelect`, `WhatsappField`, `TextField` (slot), both forms.
- [x] Stories? → `DialCodeSelect` stories; `WhatsappField` story; form stories updated.
- [x] No E2E, no real network? → **Yes.**
- [x] **A1** `fetchImpl` and the `lookupCountry` port are injected; no test reaches the network; component tests' stub submitters omit `lookupCountry` (= Mexico, no request); tests cover valid/invalid/unlisted/HTML/404/timeout answers, the no-overwrite rule, at-most-once, language ignored, zero third-party requests in the generated output, and dev/Storybook without the edge? → **Yes** (implementer, T067).

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)
- [x] No `process.env`, no credential? → **Yes**, nothing configurable changes.
- [x] **A1** `/__geo` is a contract constant, not configuration (same value everywhere, same origin by construction)? → **Yes** (implementer, T067).

#### Cross-repo constraint (muush-foundation, informative, A1)
- [ ] Keeps muush-foundation G-VII.6 (one edge function)? → **By contract** (contract § 4). Not verifiable here; muush-foundation's reviewer owns it. No deploy order between the two repos (IP-6).

#### XII · Absolute Imports via Alias
- [x] Cross-directory via `@/features/forms/...`; same-dir relative only? → **Yes.**

*(Ticked at design time; the reviewer re-verifies each against the code. Unticked **A1** rows are the amendment's gates; the implementer ticks them in T067.)*

## Design decisions

| ID | Decision | Detail | Gate row |
|---|---|---|---|
| D-1 | Form stores a country code `whatsappCountry`; dial code derived at payload time | research R5, data-model § 2 | — |
| ~~D-2~~ | ~~Detection: first listed region of `navigator.languages`, else `MX`~~ — superseded by D-12..D-17 (A1) | research R1 | ~~OA-3~~ |
| D-3 | 245-row static data module; no package | research R4, data-model § 1 | OA-4, OA-7 |
| D-4 | Names from `Intl.DisplayNames(es-MX / en)`, sorted with `Intl.Collator`, computed in content composables | research R2 | OA-7 |
| D-5 | Flags = regional-indicator emoji | research R3 | OA-5 |
| D-6 | Native `<select>` with transparent overlay on a custom face | research R6, contracts/whatsapp-field-ui.md | OA-6 |
| D-7 | `TextField` gets an additive `leading` slot | contracts/whatsapp-field-ui.md | OA-10 |
| D-8 | 6–14 digit rule replaces 10; copy per OA-8 | data-model §§ 4, 7 | OA-8 |
| D-9 | Server alias `whatsappDialCode` → `whatsappCountry`; WhatsApp-only guard covers both | research R8, data-model § 6 | — |
| D-10 | Country kept across Correo↔WhatsApp; number discarded | data-model § 2 | OA-9 |
| D-11 | Visuals from existing tokens, UNVERIFIED | research R7 | OA-10 |
| D-12 | A1: `GET /__geo` answered by `request-router`; contract in `contracts/edge-geo-endpoint.md` | research R11 | IP-1 |
| D-13 | A1: Art. IV complies; no amendment | research R12 | IP-2 |
| D-14 | A1: lookup on first form `focusin` (`onEngage`) and on switch to WhatsApp, once per port; 3000 ms abort | research R13 | IP-3 |
| D-15 | A1: valid answer applied only while not picked; typing is not picking | data-model § 8.5 | IP-4, FR-A07 |
| D-16 | A1: optional port member `lookupCountry?` on the existing submitter, not a new prop | research R14 | FR-A11 |
| D-17 | A1: site validates shape **and** list membership; edge validates shape only; no dev fixture/proxy, dev and preview get 404 → Mexico | contract § 3, research R14 | FR-A02/A03, FR-A11 |

## Accessibility

- Native `<select>`: role, keyboard, value and change announcement from the
  platform; accessible name via `aria-label` = OA-8 label; `aria-invalid`
  and `aria-describedby="whatsappCountry-error"` when marked.
- Face is `aria-hidden`; focus ring drawn on the face from the select's
  `:focus-visible` (red-400, `ui-map.md` § 10).
- Disabled while sending/uploading (same as `SelectField`).
- Tab order: preference radios → selector → number.
- Option C (if chosen) must implement the APG combobox pattern (research R6)
  and needs a manual VoiceOver/NVDA pass.

## Project Structure

### Documentation (this feature)

```text
specs/032-whatsapp-dial-code-selector/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── forms-api-whatsapp.md
│   ├── whatsapp-field-ui.md
│   └── edge-geo-endpoint.md                       # A1, deliverable for muush-foundation
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
i18n/locales/{es,en}.json                          # data-model § 7

app/features/forms/
├── data/
│   ├── countries.ts (+ .test.ts)                  # NEW — 245 rows, DEFAULT_COUNTRY, DIAL_CODE_PATTERN, CountryOption type
│   ├── contactFields.ts                           # whatsappCountry id/value/order/content; 6–14 constants
│   ├── applicationFields.ts                       # same, re-exports constants
│   └── submissionContract.ts                      # whatsappDialCode?: string on both payloads; A1: lookupCountry? on both ports
├── logic/
│   ├── countryOptions.ts (+ .test.ts)             # NEW — flag, dialCodeOf, buildCountryOptions; A1: language detection removed, toReportedCountry added
│   ├── edgeCountry.ts (+ .test.ts)                # A1 NEW — fetchEdgeCountry, createEdgeCountryLookup, EDGE_COUNTRY_PATH, EDGE_COUNTRY_TIMEOUT_MS
│   ├── useDefaultCountry.ts (+ .test.ts)          # A1 NEW — lookup once, apply unless picked; shared by both forms
│   ├── useFormSubmission.ts                       # A1 — ports get lookupCountry: createEdgeCountryLookup()
│   ├── submissionPayloads.ts (+ .test.ts)         # whatsappDialCode
│   ├── serverFieldErrors.ts (+ .test.ts)          # alias + keys
│   ├── useContactForm.ts (+ .test.ts)             # rule, onWhatsappCountryChange; A1: compose useDefaultCountry, onEngage triggers lookup
│   ├── useApplicationForm.ts (+ .test.ts)         # same
│   ├── useContactFormContent.ts                   # whatsappCountry content + options
│   ├── useApplicationFormContent.ts               # same
│   └── submissionFlows.test.ts, fieldErrorMessage.test.ts   # fixtures
└── ui/
    ├── DialCodeSelect.vue (+ .test.ts, .stories.ts)   # NEW
    ├── TextField.vue (+ .test.ts)                 # leading slot
    ├── WhatsappField.vue (+ .test.ts, .stories.ts NEW)
    ├── ContactForm.vue (+ .test.ts, .stories.ts)
    └── ApplicationForm.vue (+ .test.ts, .stories.ts)

app/features/landing/ui/ContactSection.{test,stories}.ts      # fixture shape
app/features/about/ui/WorkWithMuushSection.{test,stories}.ts  # fixture shape

tests/forms-copy.test.ts, tests/forms-application-copy.test.ts  # exact copy
tests/static-output.test.ts                        # A1 — '/__geo' in client chunk; no geolocation / navigator.languages; no country in HTML; no public/__geo
```

**Structure Decision**: everything in the `forms` module that owns both
forms (Art. I). Outside it only locale JSON, repo tests and forced fixtures.

## Risks

| Risk | Mitigation |
|---|---|
| Front deployed before backend → every WhatsApp submission rejected (unknown key) | OA-2: deploy gated on backend; quickstart "Not before"; leader confirms with Roberto before release |
| Backend requires `whatsappDialCode` → current production breaks on backend deploy | OA-2: coordinate both deploys |
| ~~Detected country wrong (`en-US` browser in Mexico)~~ | Removed by A1 (browser language no longer used) |
| A1: header not visible to the function (AWS doc gap, research R11.1 F4) | Contract § 4 preferred configuration + § 5 post-apply `curl` check; the site falls back to Mexico meanwhile |
| A1: a bug in the new edge branch breaks the whole site (same function) | Contract § 5 mandatory regression cases; owned by muush-foundation |
| A1: visible flip MX → reported country when the answer is late | Lookup starts on first focus; 3 s cap; never after a pick (IP-4) |
| A1: existing component tests start making real requests | Stubs omit `lookupCountry`; the default port is only built in `useFormSubmission.ts`, which component tests do not use |
| A1: VPN/travel gives the "wrong" country | Accepted; the selector stays changeable |
| Windows shows letters instead of flags | OA-5; option C (self-hosted font) upgrade path |
| `Intl` names differ slightly between browsers | Accepted; sort and names consistent within one browser |
| `ApplicationForm.vue` exceeds 200 lines | Research R9 prop consolidation + listed fallbacks |
| A dial code in the data set is wrong | Rows validated for format/uniqueness/names (CONFIRMED); values INFERRED from E.164 — implementer spot-checks shared codes (research R5), reviewer samples |
| Visitor types the dial code into the number | Accepted (spec Assumptions); revisit if the team sees it |
| `docs/business` contract stays stale | OA-1, human-owned |

## Agent context

`CLAUDE.md` has no `<!-- SPECKIT START -->` / `<!-- SPECKIT END -->`
markers (checked), and this agent may not edit it; the agent-context update
step is skipped.

## Complexity Tracking

No constitution violation to justify. The Art. IV reading for A1 (D-13) is a
gate item approved by Roberto on 2026-10-14 (spec IP-2), not a violation:
the feature works in full without the edge piece.
