# Implementation Plan: Root `/` redirects to a locale by the visitor's country

**Branch**: `feat/ip-locale-root-redirect` (spec directory `033-ip-locale-root-redirect`; no branch created by spec_author) | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/033-ip-locale-root-redirect/spec.md`

## Summary

The redirect is an **edge** behaviour. muush-foundation's existing viewer-request function `request-router` answers exactly `/` with a 302 to `/es` or `/en`, chosen by an explicit preference cookie, then by `cloudfront-viewer-country` against a 20-code Spanish-speaking list, then by a default (G2, recommended `en`). The response is `private, no-store`, generated before the cache, and replaces today's 301. That is delivered as `contracts/edge-root-locale-redirect.md` with test cases. This repository writes no server code.

What **this repository** changes is small. The language toggle records the visitor's explicit choice as a first-party cookie, `muush_locale=<es|en>; Path=/; Max-Age=31536000; SameSite=Lax; Secure`, through a pure function in `shell/logic/`, with the name and lifetime in `shell/data/`. Unit, component and output tests cover it. Nothing else in the site changes: not `public/index.html`, `nuxt.config.ts`, the locales, the pages or the sitemap. Moving the static fallback and `x-default` to English is feature 37 (G3).

## Technical Context

**Language/Version**: TypeScript (strict) · Vue 3.5 `<script setup>` · Nuxt 4.5.2
**Primary Dependencies**: @nuxtjs/i18n 10.6.0 (`strategy: 'prefix'`, `detectBrowserLanguage: false`) — **no new dependency**
**Storage**: one first-party cookie in the visitor's browser (`data-model.md` § 1); nothing server-side
**Testing**: Vitest 4 (happy-dom global, `globalSetup` runs `pnpm generate`), Vue Test Utils; Storybook 10 build must keep passing (no new story: no visual change)
**Target Platform**: static files on S3 + CloudFront (`nitro.preset: 'static'`); the edge rule runs in muush-foundation (CloudFront Functions `cloudfront-js-2.0`)
**Project Type**: static website + cross-repository edge contract
**Performance Goals**: zero added requests; one redirect from `/` (none today beyond the existing 301); about 16 bytes of cookie per same-host request
**Constraints**: no server runtime, no third party, no location permission, IP never read by the rule, one edge function, no new copy, no change to any page's output
**Scale/Scope**: 2 new source files + 1 test file in `shell`, 1 edit to `LanguageToggle.vue` and its test, 1 new output test; 2 contracts

No `NEEDS CLARIFICATION` remains. Open items are **gate questions** for Roberto (spec § Gate questions, G1–G8) and **UNVERIFIED infrastructure facts** owned by muush-foundation (research R1 F4, R3 F6). Neither blocks this repository.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — still passing.*

### Phase -1: Pre-Implementation Gates

#### I · Feature-Based + Capas Architecture
- [x] All new code lives in `app/features/shell/{data,logic,ui}`: `data/localePreference.ts`, `logic/localePreference.ts`, an edit to `ui/LanguageToggle.vue`. No new feature module, no page/layout/plugin change.
- [x] The edge behaviour is not emulated anywhere in `app/` (no client redirect at `/`).

#### II · Dependency Direction (NON-NEGOTIABLE)
- [x] `data/localePreference.ts` imports only `data/types.ts` (`ShellLocale`). `logic/localePreference.ts` imports only `data/`. `ui/LanguageToggle.vue` imports the logic function, which `ui → logic` allows.

#### III · Feature Isolation (NON-NEGOTIABLE)
- [x] Nothing outside `shell` imports the new files. The barrel `index.ts` gains no export (no consumer outside the feature).

#### IV · Static-Site Purity (NON-NEGOTIABLE)
- [x] `nitro.preset` stays `'static'`. No `server/`, no route, no runtime handler. `nuxt.config.ts` untouched.
- [x] Without the edge rule, `/` works as plain files through the unchanged `public/index.html` (spec FR-020). The edge rule is an enhancement owned by another repository, delivered as a contract (same pattern Roberto approved for feature 32 `/__geo` and feature 36). See Complexity Tracking.

#### V · Component Discipline
- [x] `LanguageToggle.vue` stays `<script setup lang="ts">`, presentational, under 200 lines, still a `NuxtLink`. It calls a pure logic function in its existing click handler and calls no Nuxt composable (§ R23). Its props, markup and classes are unchanged.
- [x] No new client state: the cookie is written, never read, so nothing renders differently.

#### VI · i18n Parity (NON-NEGOTIABLE)
- [x] No route, page or copy added or removed. No key in `es.json`/`en.json` changes. The toggle still resolves its destination through the route map. The cookie stores the destination **locale code**, never a path.
- [x] `hreflang`/`x-default` unchanged by this feature (feature 37 owns the default switch).

#### VII · Design Tokens Discipline
- [x] No visual change, no new token, no literal colour or spacing. Not applicable beyond confirming zero CSS diff.

#### VIII · Clean Code Discipline
- [x] Cookie name, allowed values and max-age are named constants declared once (`data/`). The serialiser is one function and the writer another, each under 30 lines, early returns.
- [x] No dead code: no client-side copy of the country list (research R7), no unused reader of the cookie.

#### IX · TypeScript Strict + Biome
- [x] No `any`, no `@ts-ignore`. The writer takes an injectable `{ cookie: string }` target typed narrowly (testable without casting `document`). `pnpm check` and `pnpm typecheck` pass.

#### X · Testing Discipline
- [x] Unit: serialised string exact for `es`/`en`, writer writes exactly once to the target, guard rejects non-locale input at the type level. Component: a click writes the destination locale, a modified click writes too, the existing `LanguageToggle.test.ts` cases (anchor, modifier, button, accessible name) pass unmodified. Output: cookie name in the client bundle, absent from every generated HTML document. Names follow `should … when …`.
- [x] The existing output assertions that `/` → `/es` and `x-default` → `/es` (`tests/static-output.test.ts:97`, `tests/seo-output.test.ts:368`) stay green and **unchanged** (G3).

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)
- [x] No environment variable, no credential, no `process.env`. Contracts contain no account IDs, ARNs or keys.

#### XII · Absolute Imports via Alias
- [x] `LanguageToggle.vue` imports `@/features/shell/logic/localePreference` (it already imports types via `@/features/shell/data/types`). The logic file imports `@/features/shell/data/...`. Relative only within the same directory.

#### Privacy & least data (feature constraints)
- [x] The cookie holds only `es`/`en`. It is host-only and `Secure`/`SameSite=Lax`, never read by the site, never sent to another host.
- [x] No third-party request, no geolocation API, no new script. The edge contract forbids reading, logging or forwarding the IP (contract § 4, § 8, case V-8).

**Result**: PASS, with one recorded dependency on an edge behaviour outside this repository (Complexity Tracking). Boxes are ticked by the implementer/reviewer against the delivered code, as in features 35–36.

## Gate questions (copied from spec; answered by Roberto at the single gate)

| # | Question | Recommendation |
|---|---|---|
| G1 | Edge 302 in `request-router` from `cloudfront-viewer-country`? | Yes |
| G2 | Country absent/malformed → `/es` or `/en`? | `/en` |
| G3 | Static fallback: who moves `public/index.html`/`x-default`/`rootRedirect` to English? Rewrite the "sin la pieza de borde → /es" acceptance item? | Feature 37, not 33; reword the item |
| G4 | Toggle choice beats country via cookie `muush_locale` (`es`/`en`, host-only, Secure, Lax, 365 d)? | Yes |
| G5 | List = 20 codes; `GQ`? `US`? | Include `GQ`, exclude `US` |
| G6 | List lives only in the edge contract (no copy in the site)? | Yes |
| G7 | Replace the 301 in the same change and accept browsers' cached 301 → `/en`? | Yes |
| G8 | 302 + `private, no-store`, no UA rules, `x-default` per feature 37? | Yes |

If Roberto changes G2, G4 or G5, only contract values and the data constants change. The code structure in this plan does not.

## Project Structure

### Documentation (this feature)

```text
specs/033-ip-locale-root-redirect/
├── spec.md
├── plan.md                                  # this file
├── research.md                              # R1–R10
├── data-model.md                            # cookie, list, country, decision table
├── quickstart.md
├── contracts/
│   ├── edge-root-locale-redirect.md         # deliverable for muush-foundation (+ test cases)
│   └── locale-preference-cookie.md          # cookie contract shared by both repos
├── checklists/requirements.md
└── tasks.md                                 # /speckit-tasks
```

### Source Code (repository root)

```text
app/features/shell/
├── data/
│   └── localePreference.ts          # NEW · LOCALE_PREFERENCE_COOKIE, LOCALE_PREFERENCE_MAX_AGE_SECONDS
├── logic/
│   ├── localePreference.ts          # NEW · serializeLocalePreference(locale), rememberLocalePreference(locale, target)
│   └── localePreference.test.ts     # NEW · unit
└── ui/
    ├── LanguageToggle.vue           # EDIT · click handler records the destination locale first
    └── LanguageToggle.test.ts       # EDIT · + cookie cases; existing cases untouched

tests/
└── locale-preference-output.test.ts # NEW · bundle contains the name; no HTML document does
```

**Untouched on purpose**: `public/index.html`, `nuxt.config.ts`, `i18n/locales/*`, `app/pages/*`, `app/layouts/*`, `app/plugins/*`, `tests/static-output.test.ts`, `tests/seo-output.test.ts`, `package.json`, `pnpm-lock.yaml`, `app/features/forms/**` (`/__geo` is unrelated to `/`).

**Structure Decision**: the preference is a shell concern (the toggle belongs to the shell), so it lives in `shell`'s three layers. `data/` holds the cross-repository constants. `logic/` holds the side-effecting writer behind an injectable target, so the component and the unit tests never touch the real `document.cookie` unless they choose to. The toggle calls it directly rather than emitting an event up through `SiteNav`/`MobileMenu`/the layout: that would thread a new event through three components for a write that has no other consumer.

### Design notes for the implementer

- **Write first, then the existing logic.** In `LanguageToggle.vue`'s click handler, call `rememberLocalePreference(otherLocale.value)` as the first statement, before the `defaultPrevented`/modifier/button early return, so plain and modified clicks both record the choice (contract `locale-preference-cookie.md` § 2). Rename the handler (e.g. `onToggleClick`) only if the name `preserveAnchor` would lie; keep `preserveAnchor` as the extracted second step.
- **Default target**: `rememberLocalePreference(locale, target = document)`. The `target` type is `Pick<Document, 'cookie'>`. Tests pass a `{ cookie: '' }` object and assert the assigned string. One component test may assert against happy-dom's real `document.cookie`, which strips attributes when read back, so that test asserts `muush_locale=en` only.
- **SSR safety**: the function is only reached from a click handler, which never runs on the server. Do not add a `typeof document` guard: dead code for a path that cannot occur.
- **Serialised string** is the exact form in `data-model.md` § 1. Attribute order is fixed so the unit test can assert equality.
- Comment the new `data/` file with a pointer to `contracts/locale-preference-cookie.md` and the rule "the site never reads it". Comment the toggle's click handler with why the write precedes the early returns.

## Phase 0 / Phase 1 outputs

- `research.md`: R1 edge mechanism, R2 rule order, R3 301 → 302 migration, R4 response headers (why no `Vary`), R5 crawlers, R6 cookie attributes and privacy, R7 the list with flags, R8 feature 37 interaction, R9 feature 36, R10 what this repo can verify.
- `data-model.md`, `contracts/edge-root-locale-redirect.md`, `contracts/locale-preference-cookie.md`, `quickstart.md`.
- Agent context: `CLAUDE.md` has no `<!-- SPECKIT START/END -->` markers, and spec_author may not edit it. Step skipped, reported to the leader.

## Verification

| Layer | What | Who |
|---|---|---|
| Unit/component/output | tasks T003–T008, T013; `./init.sh` green | implementer → reviewer |
| Output invariants | `/` → `/es` and `x-default` → `/es` assertions unchanged and green; `git diff master -- public/index.html nuxt.config.ts i18n/ package.json pnpm-lock.yaml` empty | reviewer |
| Browser | quickstart § 1 manual steps 1–6 (`pnpm preview`) | implementer |
| Edge | contract § 6 rollout + § 7 R-1..R-13, N-1..N-7, V-1..V-8 | Roberto / muush-foundation |

## Business-document findings to report (not written by spec_author)

- `ui-map.md` § 1 "no se detecta idioma por IP" — Roberto revokes it for `/` only; his rewrite.
- `ui-map.md` § 1 "se recuerda en `localStorage`" — never implemented; this feature proposes the cookie instead.
- `ui-map.md` § 1 table and `decisions-open.md` § Estrategia de rutas i18n: "Raíz → `/es/`" is already contradicted by the reported production 301 → `/en`.
- `messaging.md` rule 4 cites the no-IP rule; still valid for every page except `/`.
- The Spanish-speaking list (G5) is a business rule once Roberto approves it. Its home is the contract, by G6. If he wants it in `docs/business/`, he writes it there.

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| Behaviour that depends on compute at the edge (Article IV: "no feature that requires compute at request time") | The country and the cookie are only knowable per request. The site degrades to the static `public/index.html` when the edge piece is absent, so the site itself does not *require* it. That is the same reading Roberto approved for feature 32 (`/__geo`). | A client script at `/` adds a flash, a second request and a scripting dependency, and it still needs `/__geo` from the edge (research R1). |
| `ui/` component performs a side effect (writes a cookie) | The toggle is the only place the explicit choice happens. The write is delegated to a `logic/` function, so `ui/` holds no logic of its own (Article V). | Emitting an event through `SiteNav` → `MobileMenu` → layout adds plumbing in three components for a single consumer (Article VIII, no over-engineering). |
