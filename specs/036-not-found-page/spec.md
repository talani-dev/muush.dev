# Feature Specification: Not-found page (404) in Spanish and English

**Feature Branch**: `036-not-found-page` (spec directory; no branch created by spec_author)
**Feature**: `feature_list.json` id 36 · `not_found_page` (depends on 35)
**Created**: 2026-10-15
**Status**: Draft — awaiting human gate (Roberto)
**Input**: Roberto's request of 2026-10-15 as recorded in feature 36's `description` and `acceptance`. Those decisions are **settled** and are not re-opened here.

## Context

Today a visitor who follows a broken or mistyped link to muush.dev gets whatever the host does with a missing object. The build ships two empty application shells at the root (`200.html`, `404.html`) that render nothing without scripting, and `200.html` even carries an `index, follow` robots directive since feature 35 (CONFIRMED by a scratch build on 2026-10-15, `research.md` R2). Nobody knows today how the CloudFront distribution is configured for errors (Roberto, 2026-10-15).

This feature adds a real not-found page in both languages, built from Roberto's reference design, and hands the infrastructure repository a contract describing how those pages must be served.

### Source of truth for this page

Roberto declared the reference HTML and its README authoritative for this page; there is no `.pen` frame for it. Both are copied verbatim into this package so the spec does not depend on a path outside the repository:

- `reference/404.html` (sha256 `38e76e60…c15809c`)
- `reference/README.md` (sha256 `35225486…7df89f`)

Only the reference's `<main>` is in scope. Its header, footer, page background (dotted paper and the three radial blobs) and its Astro remarks are ignored: the site already provides nav, footer, dotted paper and cursor spotlight through its shared layout, and the site is not built with Astro.

### Settled decisions (Roberto, 2026-10-15 — cited, not re-decided)

| # | Decision |
|---|---|
| D1 | **Two documents, one per locale**, each prerendered in its own language. No script that switches the language on the client. |
| D2 | **Which document is served is decided at the edge, by path prefix**, in the infrastructure repository (muush-foundation), which this repository never edits. This feature delivers the contract (`contracts/edge-not-found.md`), including the fallback for unprefixed paths (→ English, gate G6 — superseding the original "→ Spanish") and custom error responses for 403 and 404 (S3 with origin access control answers 403 for a missing key). |
| D3 | **The page reaches visitors with HTTP status 404**, never 200. |
| D4 | **SEO (feature 35)**: not-found documents carry `noindex`, never appear in `sitemap.xml`, carry no canonical and no hreflang that would index them, and feature 35's output tests keep passing. |
| D5 | **Reuse** the existing Pill (with its radar dot) and primary LED button; existing tokens; the only new visual element is the three-ring "empty radar", mapped to tokens. (Gate G4 adds one red background glow, built from the existing glow component and tokens.) |
| D6 | **One LED button per screen**: the nav does not show its own LED call to action on the not-found page. The **language button goes to the other language's home**, because a not-found page has no equivalent page. |
| D7 | No change to the other pages' output, no new dependencies, no infrastructure change, no deploy. |

## Gate — human answers (Roberto, 2026-10-15)

| # | Question | Answer |
|---|---|---|
| G1 | EN copy (reference `data-en`) | **Approved** as in the table below. |
| G2 | Heading size | **Reuse** `text-display`. No new type token. |
| G3 | Button size | **Reuse** `BotonPrimario variant="hero"`. No new button token. |
| G4 | Reference background blobs | **Changed**: add the **red** background glow from the reference (top-right red bloom behind the content), through the existing `SectionBackdrop`/`SectionGlow` mechanism and existing glow tokens; position/size/colour from the reference's background CSS mapped to tokens; respects `--layer-glow`, no horizontal scroll, `aria-hidden`. The wine and deep blobs stay out. |
| G5 | Edge rollout | **Stage 1 now**, configuration only: every missing path — `/en/*`, `/es/*` and unprefixed alike — gets the **English** 404 document (`en/404/index.html`) with status 404 (Roberto's correction, same day). ⚠️ This deliberately differs from the site's `defaultLocale` (`es`) and its `x-default` (`/es`); it is Roberto's decision for the interim, not an inference. Stage 2 (per-prefix choice: `/es/*` → Spanish, everything else → English, per G6) is deferred to muush-foundation. This repository still generates both locale documents. |
| G6 | Language of a not-found page Nuxt renders at runtime (`pnpm dev`, and the client) — added after implementation | **Roberto, 2026-10-15**: by path prefix, `/es…` → es, `/en…` → en, **any other path** (unprefixed or unknown prefix, e.g. `/fr/es`, `/xyz`) → **en**. Found because `pnpm dev` rendered `/fr/es` in Spanish (i18n falls back to `defaultLocale`). The site's `defaultLocale` stays `es` for every real page and `/`; the prerendered `/es/404` and `/en/404` are unchanged; a served document keeps its own language while hydrating (D1). Implementation: `app/features/shell/logic/notFoundLocale.ts`. The edge contract's Stage 2 was aligned with this rule by the leader (unprefixed → English). |

## Copy — approved at the gate (G1)

The English column is the reference's `data-en` values, proposed by the leader and approved by Roberto on 2026-10-15. Spanish is the reference text. Nothing here was invented by the spec author; the document title and the shortcuts' accessible name come from the reference's `<title>` and `aria-label`/`data-aria-en`.

| Element | ES | EN | Destination ES | Destination EN |
|---|---|---|---|---|
| Document title | Página no encontrada · muush | Page not found · muush | — | — |
| Pill | Error 404 | Error 404 | — | — |
| Heading | No encontramos esta página. | We couldn't find this page. | — | — |
| Subtitle | Puede que el link venga mal escrito o que la página haya cambiado de lugar. | The link may be mistyped, or the page may have moved. | — | — |
| LED button | Volver al inicio | Back to home | `/es` | `/en` |
| Shortcut 1 | Propósito | Purpose | `/es#proposito` | `/en#proposito` |
| Shortcut 2 | Servicios | Services | `/es#servicios` | `/en#servicios` |
| Shortcut 3 | Nosotros | About us | `/es/nosotros` | `/en/about` |
| Shortcuts group name (assistive tech only) | Atajos | Shortcuts | — | — |

Checked against `docs/business/messaging.md`: Mexican Spanish ("link" is used colloquially in MX), no em dashes, first letter capitalised, `muush` lowercase. `#proposito` and `#servicios` exist in both locales — the landing renders both sections from one component with literal ids (CONFIRMED, `research.md` R9).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor on a broken Spanish link finds their way back (Priority: P1)

A visitor follows a mistyped or outdated link such as `muush.dev/es/servicioz`. Instead of a blank page or a host error, they see the site's own nav and footer around a clear message in Spanish, a "Volver al inicio" button and three shortcuts into the site.

**Why this priority**: Spanish is one of the two site locales; at Stage 2 of the edge contract it is served for `/es` and `/es/*` (unprefixed URLs get English, G6). (During Stage 1 production serves the English document for every missing path — gate G5; the Spanish document is still built and verified here.)

**Independent Test**: Request a non-existent Spanish path from the generated site served under the edge contract; read the document and click each destination.

**Acceptance Scenarios**:

1. **Given** the generated site, **When** the Spanish not-found document is read, **Then** it is entirely in Spanish (document language `es-MX`, title, pill, heading, subtitle, button, shortcuts, nav and footer) and contains no script that changes the language.
2. **Given** that document, **When** the visitor activates "Volver al inicio", **Then** they reach `/es`; **When** they activate Propósito, Servicios or Nosotros, **Then** they reach `/es#proposito`, `/es#servicios` or `/es/nosotros`.
3. **Given** that document, **When** it is rendered without scripting, **Then** every element above is present and every destination works.
4. **Given** the page is served at an arbitrary missing URL, **When** the page becomes interactive, **Then** the address bar still shows the URL the visitor requested and the language does not change.

---

### User Story 2 - The same, in English (Priority: P1)

A visitor on `muush.dev/en/whatever` sees the same page entirely in English, with every destination in the English site.

**Why this priority**: Constitution Article VI requires parity; an English visitor dropped into Spanish reads as a broken site.

**Independent Test**: Same as Story 1 with an `/en/…` path.

**Acceptance Scenarios**:

1. **Given** the generated site, **When** the English not-found document is read, **Then** it is entirely in English (document language `en-US`) with the copy in the table above.
2. **Given** that document, **When** the visitor activates the button or a shortcut, **Then** they reach `/en`, `/en#proposito`, `/en#servicios` or `/en/about`.

---

### User Story 3 - Search engines never index a not-found page (Priority: P1)

A crawler that requests a missing URL receives status 404 and a document that tells it not to index the page; the sitemap never lists a not-found document.

**Why this priority**: A not-found page answered with 200, or indexable, becomes a "soft 404" in search results — the failure the reference README warns about.

**Independent Test**: Inspect the two generated documents and `sitemap.xml`; verify the edge contract's status requirements with the simulation described in `quickstart.md`.

**Acceptance Scenarios**:

1. **Given** the generated output, **When** each not-found document's head is read, **Then** it has exactly one robots directive and it contains `noindex`; it has no canonical link and no hreflang alternate.
2. **Given** the generated output, **When** `sitemap.xml` is read, **Then** it still lists exactly the four pages of feature 35 and no not-found document.
3. **Given** the edge contract is applied, **When** any missing URL is requested, **Then** the response status is 404.

---

### User Story 4 - One primary action, and a language button that still works (Priority: P2)

On the not-found page the only LED button is "Volver al inicio". The nav keeps its links and its language button, and that button takes the visitor to the other language's home.

**Why this priority**: Brand rule (one LED per screen) and a working language switch; secondary to the page existing at all.

**Independent Test**: Count LED buttons in each document at desktop and mobile widths, with and without scripting; follow the language button.

**Acceptance Scenarios**:

1. **Given** either not-found document at any viewport, with or without scripting, **When** LED-bordered controls are counted, **Then** there is exactly one, and it is "Volver al inicio" / "Back to home".
2. **Given** the Spanish document, **When** the visitor activates the language button, **Then** they reach `/en`; from the English document, `/es`.
3. **Given** any other page of the site, **When** it is generated, **Then** its nav call to action behaves exactly as before this feature.

---

### User Story 5 - The empty radar (Priority: P3)

Behind the message sits a quiet decoration: three concentric rings with no dot, the inner one faintly red, the outer two faint bone.

**Why this priority**: Visual identity of the page; the page is complete and usable without it.

**Independent Test**: Measure the three rings at 1440 and 390 px wide in the built page.

**Acceptance Scenarios**:

1. **Given** a 1440 px wide viewport, **When** the rings are measured, **Then** their diameters are 700, 500 and 300 px; at 390 px wide they are 420, 300 and 180 px.
2. **Given** either width, **When** the rings' strokes are inspected, **Then** the inner ring is Red 400 at 24 %, the middle Bone 100 at 12 %, the outer Bone 100 at 8 %, all through design tokens.
3. **Given** assistive technology, **When** the page is read, **Then** the rings are not announced and never intercept a pointer.
4. **Given** either width (gate G4), **When** the page is viewed, **Then** a red bloom sits at the top-right behind the content and the rings, beneath the dotted paper like every other section glow, without causing horizontal scrolling and without being announced.

### Edge Cases

- **Unprefixed or unknown-language path** (`/xyz`, `/fr/abc`): at Stage 2, served the English document (G6 fallback); during Stage 1 (gate G5), served the English document like every other missing path. Verified in a browser simulation for both documents at arbitrary URLs: each stays in its own language after it becomes interactive (`research.md` R1 F8, F10).
- **Stage 1, Spanish path served the English document** (`/es/nada`): the page is English, its language button leads to `/es`, its shortcuts lead into the English site. Accepted interim behaviour by Roberto's decision (G5).
- **Missing path under an existing page** (`/en/about/zzz`): served the English document by prefix.
- **Query string and fragment** (`/en/zz?x=1#frag`): kept in the address bar; the page is unaffected. The language button's existing behaviour carries the fragment to the other home (`/es#frag`); harmless, and identical to what it does on every other page.
- **Direct request to a not-found document's own address**: the documents necessarily exist as objects, so requesting their own path returns them with status 200. They are `noindex` and nothing links to them; accepted (`research.md` R3).
- **Navigation away from the not-found page** (button, shortcut, nav link, language button): the destination page renders normally (verified, `research.md` R4).
- **Mobile**: the nav's LED call to action does not exist below the desktop breakpoint anyway; the mobile menu is the site's own and unchanged.
- **Reduced motion**: the Pill's radar ping and the button's LED spin stop, exactly as elsewhere on the site; the rings never animate.
- **Errors other than "not found"**: a static site has no server errors; the only error a visitor can reach is a missing route. Any other client-side error (e.g. a failed chunk load) shows the same page. Assumption A-03.

## Requirements *(mandatory)*

### Functional Requirements

**Output**

- **FR-001**: The build MUST produce exactly two not-found documents, one per locale, each prerendered with its full content in its own language and the correct document language (`es-MX`, `en-US`).
- **FR-002**: Neither document may contain logic that changes the displayed language on the client. Once interactive, a document served at any missing URL MUST stay in its own language and MUST keep the visitor's URL in the address bar.
- **FR-003**: The build MUST stop producing the root `200.html` and `404.html` application shells (decision and justification: `research.md` R2).
- **FR-004**: The output for the four existing pages (`/es`, `/en`, `/es/nosotros`, `/en/about`), `index.html`, `robots.txt` and `sitemap.xml` MUST be unchanged except for build-hash noise.

**Content and layout**

- **FR-005**: Each document MUST show the site's nav and footer through the shared layout, once each, and the content of the reference `<main>` in this order: Pill, heading (the page's only level-1 heading), subtitle, LED button, shortcuts row.
- **FR-006**: All copy MUST come from the locale files, with the values approved at the gate (table above). The Pill reads "Error 404" in both locales.
- **FR-007**: The Pill MUST be the site's existing Pill component (with its radar dot) and the button the site's existing primary LED button; no copy of either.
- **FR-008**: The LED button MUST lead to the same-locale home; the shortcuts MUST lead to the same-locale home's `#proposito` and `#servicios` sections and to the same-locale About page resolved through the site's route map (never a hand-written path). Separators between shortcuts are decorative and hidden from assistive technology; the row is a named navigation landmark ("Atajos" / "Shortcuts").
- **FR-009**: The three-ring decoration MUST measure 700/500/300 px at 1440 px wide and 420/300/180 px at 390 px wide, with the colours of User Story 5, every value through design tokens, hidden from assistive technology, non-interactive, behind the text, and never causing horizontal scrolling.

- **FR-009a** (gate G4): The page MUST carry one red background glow through the site's existing section-glow mechanism, using an existing colour/opacity/size pair (no new glow colour, opacity or size), positioned top-right as in the reference's background CSS, painted on the glow layer (beneath the dotted paper), hidden from assistive technology, non-interactive, and never causing horizontal scrolling or lengthening the document.

**Navigation rules**

- **FR-010**: On a not-found document the nav MUST NOT render its LED call to action at all — not hidden visually, absent — so that it cannot reappear with scripting disabled. Every other page keeps the current behaviour.
- **FR-011**: On a not-found document the language button MUST lead to the other locale's home (`/en` from Spanish, `/es` from English).

**Search engines**

- **FR-012**: Each document MUST carry exactly one robots directive containing `noindex`, no canonical link, no hreflang alternate, and no `og:url`/`og:locale`.
- **FR-013**: `sitemap.xml` MUST NOT list either document, and feature 35's output contract (`specs/035-technical-seo-indexing/contracts/build-output.md`) MUST keep holding; its tests are updated only where that contract itself names the dropped `200.html`/`404.html`.

**Infrastructure contract**

- **FR-014**: The package MUST include `contracts/edge-not-found.md` for muush-foundation, stating: **Stage 1 (agreed rollout, G5)** — origin 403 and 404 answered with the English document (`en/404/index.html`) and HTTP status 404 for every path; **Stage 2 (deferred)** — the document chosen by path prefix (`/es` and `/es/*` → Spanish, `/en` and `/en/*` → English, every other path → English, G6); and how to verify each. It is Roberto's to apply; this repository does not edit, deploy or test the distribution.

**Quality gates**

- **FR-015**: No new dependency. `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate` and `pnpm storybook:build` MUST pass, with tests covering FR-001, FR-003, FR-005–FR-012 against the generated output.

### Key Entities

- **Not-found document**: one per locale; language, title, robots directive, content block; served by the edge for missing paths.
- **Not-found content**: pill label, heading, subtitle, button label and destination, three shortcuts (label + destination), shortcuts group name — all resolved per locale.
- **Edge routing rule**: path prefix → document; error status from origin (403/404) → response status 404.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 2 of 2 not-found documents exist, each 100 % in its own language, with 0 language-switching scripts.
- **SC-002**: 0 robots directives other than `noindex` on the not-found documents; 0 canonical or hreflang links on them; `sitemap.xml` lists exactly 4 URLs.
- **SC-003**: Exactly 1 LED button per not-found document, at every tested width, with and without scripting.
- **SC-004**: 5 of 5 destinations per locale (button, three shortcuts, language button) lead to the documented address.
- **SC-005**: The three rings measure within 1 px of 700/500/300 at 1440 px and 420/300/180 at 390 px.
- **SC-006**: Once Stage 1 is applied, 100 % of sampled missing URLs (prefixed `es`, prefixed `en`, unprefixed, unknown language) answer with status 404 and the English document; once Stage 2 is applied, with the language of the prefix rule.
- **SC-007**: The four existing pages' generated output is unchanged (modulo build hashes) and all feature 35 output tests pass.

## Assumptions

- **A-01**: The reference's `<main>` defines this page's content and proportions; where it disagrees with an existing site token by a few pixels (heading size, button padding, Pill padding, shortcut size), the existing token wins, as the feature description asks to reuse tokens. The deviations are listed in `plan.md` § Visual mapping for the gate.
- **A-02** (revised by gate G4): Of the reference's three background blobs, only the **red** one is reproduced, as a section glow; the wine and deep blobs are not. Where no existing glow pair matches the reference exactly (55 % opacity, 1440 px at every width), the nearest existing pair is used and the delta is recorded in `research.md` R6b.
- **A-03**: Every client-side error renders the same not-found content (see Edge Cases). A dedicated page for other error types is out of scope.
- **A-04**: Until muush-foundation applies the contract, production behaviour for missing URLs is whatever the distribution does today; this feature cannot change it.
- **A-05**: Intermediate widths between 390 and 1440 are interpolated (the reference steps at 760 px); only the two extremes are design values.
- **A-06**: Whether the deploy deletes objects that disappear from the build (`200.html`, `404.html`) is UNVERIFIED; the contract covers both cases.

## Out of scope

- Editing muush-foundation, the CloudFront distribution, S3 or DNS; deploying.
- Any change to `docs/business/`.
- Restoring the reference's wine and deep background blobs, its header/footer variants, its Google Fonts loading or its client-side language script.
- Stage 2 of the edge contract (per-prefix English document in production) — deferred to muush-foundation (gate G5).

## Gate — approval (Roberto, 2026-10-15)

- **Approved** for implementation, including the recorded glow deltas (existing glow at 60 % / 700 px on mobile instead of
  the reference's 55 % / 1440 px) and the two new placement tokens `--spacing-not-found-glow-x` / `-y`.
- Stage 1 fallback is the English 404 for every missing path (Roberto's decision, differs from defaultLocale `es`).
- **G6 (2026-10-15, after implementation):** runtime-rendered not-found page picks its language by prefix, English for every other path (see the G6 row above).
