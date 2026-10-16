# Research: Not-found page (feature 36)

Every finding carries a label:

- **CONFIRMED** — observed directly: a `pnpm generate` run, a file in `node_modules`, or a headless-Chrome probe.
- **INFERRED** — derived from confirmed facts or from documentation, not run.
- **UNVERIFIED** — nobody in this session could check it; it has an owner.

## How the experiments were run

No file under `app/`, `tests/` or the repository's config was edited. On 2026-10-15 the repository (`app`, `i18n`, `public`, `types`, `utils`, `nuxt.config.ts`, `package.json`, lockfile, `node_modules`) was cloned with `cp -cR` into the session scratchpad, and the variations below were applied there only.

- **Build**: `npx nuxt generate` (Nuxt 4.5.2, nitropack 2.13.4, @nuxtjs/i18n 10.6.0, @nuxtjs/sitemap 8.6.2, @nuxtjs/robots 6.2.4, nuxt-schema-org 6.4.3 — the versions in the lockfile).
- **Edge simulation**: a 20-line Node static server that reproduces what the contract asks of CloudFront: serve an existing object (with the `request-router` directory-index rewrite, `/es` → `es/index.html`), otherwise answer **404** with `en/404/index.html` for `/en` and `/en/*` and `es/404/index.html` for everything else.
- **Browser**: Google Chrome headless (`--headless=new`) driven over the DevTools Protocol from Node 24's built-in `WebSocket`. After load + 3.5 s the probe read `location.href`, `<html lang>`, `document.title`, the `<h1>`, the language button's `href`, the presence of the nav CTA, the number of `.led` controls, canonical/hreflang links and the robots meta, and recorded every console message, exception and non-200 network response.

The probe scripts are reproduced in `quickstart.md` § 3 so the implementer and the reviewer can repeat the browser check on the real implementation.

---

## R1 · How to produce one prerendered 404 document per locale

### Facts

| # | Fact | Label |
|---|---|---|
| F1 | Nitro's prerenderer **never writes a route whose status is not 200 or a redirect**: it sets `_route.error`, adds it to `failedRoutes`, and returns before `writeFile` (`nitropack/dist/core/index.mjs` ~2115–2145). | CONFIRMED (source) |
| F2 | Nuxt sets `prerender.failOnError: true`, so a prerendered route that renders the error page (status 404) **fails the build**: `ERROR Exiting due to prerender errors` with `/es/404.html` and `/en/404.html` listed. | CONFIRMED (run, experiment A) |
| F3 | The `prerender:generate` Nitro hook runs **after** the status check and **before** the error is acted on, and receives the mutable route object. Deleting `route.error` there for exactly the two not-found routes makes Nitro write the file, keep crawling it, and exit 0. | CONFIRMED (source + run, experiments B–D) |
| F4 | Rendering `/es/404` and `/en/404` (no `.html` suffix) with an `app/error.vue` that wraps `<NuxtLayout>` writes `es/404/index.html` and `en/404/index.html` (+ their `_payload.json`), with `<html lang="es-MX">` / `lang="en-US"` and the content in the right language. The i18n locale is taken from the path prefix even though no route matches. | CONFIRMED (run, experiment C) |
| F5 | Using `/es/404.html` as the route instead writes `es/404.html`, but the payload extraction then tries to write `es/404.html/_payload.json`, fails with `EEXIST: file already exists, mkdir`, and the document's `data-src` points at a payload that does not exist, costing every visitor one failed request. | CONFIRMED (run, experiment B) |
| F6 | The layout renders inside `error.vue` exactly once: one `<nav>`, one `<footer>`, the dotted paper, `<main class="mx-auto max-w-shell-max px-page">`. | CONFIRMED (run) |

### Decision

**`app/error.vue` + `nitro.prerender.routes: ['/es/404', '/en/404']` + a `prerender:generate` hook in `nuxt.config.ts` that clears the 404 error on exactly those two routes.** Output: `.output/public/es/404/index.html` and `.output/public/en/404/index.html`.

### Alternatives

| Option | Why not |
|---|---|
| **Dedicated page** `app/pages/404.vue` (→ `/es/404`, `/en/404` with status 200) | Prerenders without a hook, but the route **matches** — so it gets canonical, hreflang, `og:url` from `useLocaleHead` and enters the sitemap through the `nuxt:prerender` source, all of which must then be removed by hand. Worse: served at a missing URL, the client router finds no match there and calls `showError(404)`, swapping the page component for the error component after hydration (INFERRED from `nuxt/dist/pages/runtime/plugins/router.js`, `afterEach` → `showError`). It also breaks `tests/static-output.test.ts`, which asserts `app/pages/` holds only `index.vue` and `nosotros.vue` (CONFIRMED, line 114). |
| **Catch-all** `app/pages/[...slug].vue` | Same head/sitemap problems as above, plus every unknown client-side navigation becomes a 200 page instead of an error, and the route set of the whole site changes. INFERRED; not run, because it fails on the same axes as the dedicated page and more. |
| **`error.vue` alone** (rely on Nuxt's `/404.html`) | Nuxt renders `/200.html` and `/404.html` with SSR disabled (they are in its no-SSR prerender set): an empty `<div id="__nuxt">` that renders only after scripting, in whatever language the client guesses (CONFIRMED, baseline build: `<body><div id="__nuxt"></div>`). That is exactly the client-side language switch D1 rules out, and nothing renders without scripting. |
| `/es/404.html` file names | F5. |

### Client behaviour after hydration (the part that needed a browser)

| # | Fact | Label |
|---|---|---|
| F7 | Nuxt serialises `payload.path` (the URL the page was rendered at, `/en/404`). On the client, when the address bar differs from it, the router **initialises at `payload.path` and replaces the address bar with it** (`createCurrentLocation(…, nuxtApp.payload.path)` + `router.replace` in `app:created`). Probe: requesting `/en/no-existe` ended with `location.href` = `…/en/404`. | CONFIRMED (source + probe) |
| F8 | Deleting `payload.path` on the server while rendering the not-found document makes the client initialise at the real address: `/en/no-existe`, `/es/nada`, `/xyz`, `/fr/abc`, `/en/about/zzz` and `/en/zz?x=1#frag` all **kept their URL**, kept the served language (`en-US` / `es-MX`), showed the same `<h1>`, and logged **no console message, no exception, and no non-200 request** other than the document itself (the payload fetch hits `/<locale>/404/_payload.json`, which exists). | CONFIRMED (probe, desktop 1440 and mobile 390) |
| F9 | The error state is restored from the payload before the router's `afterEach` runs, and `afterEach` only calls `showError` when no error is present, so the client renders the same error component the server rendered: no swap, no flash. | CONFIRMED (source; probe shows no change) |
| F10 | *(Superseded by gate G6, 2026-10-15: these paths now render English — `notFoundLocale.ts`.)* Unprefixed and unknown-language paths (`/xyz`, `/fr/abc`) stay Spanish on the client: i18n resolves no locale from the path and falls back to the default; no redirect to `/es/xyz` occurred. | CONFIRMED (probe) |
| F11 | Leaving the page works: clicking a `NuxtLink` to `/en` or the language button cleared the error (the router's `afterEach` calls `clearError` once hydration is over) and rendered the home normally with its own title and `<h1>`. | CONFIRMED (probe) |
| F12 | After client navigation away from the 404, the home had no robots meta in the live DOM (the 404's tag was removed; the home's is only in its prerendered HTML). Crawlers read the prerendered HTML, so this has no SEO effect. | CONFIRMED (probe); effect INFERRED |

**Decision**: `useNotFoundDocument()` (shell `logic/`) deletes `payload.path` under `import.meta.server`, with a comment citing F7/F8. It is the only line in the feature that touches Nuxt internals, and the browser check in `quickstart.md` is the guard that it keeps working after a Nuxt upgrade.

---

## R2 · What happens to `200.html` and the root `404.html`

### Facts

| # | Fact | Label |
|---|---|---|
| F13 | Nuxt adds `/200.html` and `/404.html` to every static build through its own `prerender:routes` hook (`@nuxt/nitro-server/dist/index.mjs` ~1021). Both are SSR-disabled shells. | CONFIRMED |
| F14 | Since feature 35, `200.html` carries `<meta name="robots" content="index, follow, max-image-preview:large, …">`; `404.html` carries `noindex, nofollow`. | CONFIRMED (baseline build) |
| F15 | Setting `route.skip = true` for `/200.html` and `/404.html` in the same `prerender:generate` hook stops both files from being written; the build logs `(skipped)` and exits 0; nothing else in the output changes. | CONFIRMED (run, experiment D) |
| F16 | No test asserts that either file exists. Feature 35's contract only asserts they are **absent from the sitemap**, which stays true. | CONFIRMED (grep of `tests/`, `specs/035-…/contracts/build-output.md` § 2) |
| F17 | `nuxt.config.ts` keeps `i18n.rootRedirect` partly "for the client router when the host serves `200.html` as an SPA fallback". | CONFIRMED (comment) |
| F18 | How the CloudFront distribution answers errors today is unknown (Roberto, 2026-10-15). | UNVERIFIED — owner Roberto |

### Decision — drop both

- **`200.html`**: an SPA fallback only does something if the host serves it for unknown paths with status 200 — the opposite of D3. Under the new contract nothing serves it; a direct request to `/200.html` would return an empty shell that client-renders a not-found page **with status 200 and `index, follow`** — a soft 404 with an explicit index directive. Keeping it has only downside.
- **Root `404.html`**: superseded by the two localized documents; it renders nothing without scripting and picks its language on the client (D1 forbids that). Keeping it would leave a third, wrong 404 that the infrastructure could be pointed at by mistake.
- `i18n.rootRedirect` stays (it governs `nuxt dev`); its comment loses the `200.html` clause.

### Deployment ordering risk (for the contract)

If the distribution's custom error response currently points at `/200.html` or `/404.html` **and** the deploy deletes objects missing from the build (`aws s3 sync --delete`, A-06, UNVERIFIED), there is a window between this deploy and the contract being applied in which errors would fetch a deleted object. The contract (§ 6) asks muush-foundation to check the current configuration first and gives the safe order.

---

## R3 · SEO

| # | Fact | Label |
|---|---|---|
| F19 | On an unmatched route, `useLocaleHead()` emits **no canonical, no hreflang, no `og:url`, no `og:locale`** — there is no route to resolve alternates for. Only `lang`/`dir` on `<html>`. | CONFIRMED (run, head of both documents) |
| F20 | `@nuxtjs/robots` adds **no** robots meta of its own to these documents; with `useSeoMeta({ robots })` set by the page, the head carries exactly one robots tag. | CONFIRMED (run) |
| F21 | `sitemap.xml` with the two documents prerendered still lists exactly `/es`, `/en`, `/es/nosotros`, `/en/about`. Error routes do not enter the `nuxt:prerender` source. | CONFIRMED (run) |
| F22 | The layout's `useSiteSeo()` still emits `og:type`, `og:site_name` and one JSON-LD graph with the `Organization` and its logo (no `WebPage` node). | CONFIRMED (run) |
| F23 | A request for a document's own address (`/es/404`) is served the object with 200 by CloudFront's directory-index rewrite. It is `noindex` and unlinked. | INFERRED |

**Decisions**: robots directive `noindex` (the reference's exact value); title from `pages.notFound.title`; no meta description (nothing to describe; the page is not indexed). The Organization graph and the two site-wide OG tags are kept — they are true on every page of the site, harmless on a noindex document, and removing them would mean branching the layout, which FR-004 asks not to touch. Feature 35's tests need **no change** (they enumerate the four pages explicitly).

---

## R4 · Nav: the LED call to action and the language button

| # | Fact | Label |
|---|---|---|
| F24 | **The nav has a LED CTA today** ("Cuéntanos tu proyecto", `BotonPrimario variant="nav"`, desktop only). On the not-found document it ships **visible** (`class="visible opacity-100 site-nav__cta hidden lg:block"`), because `showNavCta` only suppresses it on the `index` route. With the page's own button that is **two** LEDs at ≥ 1024 px. | CONFIRMED (run) |
| F25 | The nav also ships a `<noscript>` style that forces `.site-nav__cta` visible when scripting is off. Hiding the CTA with classes would therefore bring it back without scripting. | CONFIRMED (source, `SiteNav.vue`) |
| F26 | The language button on the not-found document already points at the other locale's home (`/en` from Spanish, `/es` from English): `switchLocalePath()` returns `''` on an unmatched route and `resolveLocaleDestination` falls back to the other home (rules § R22). | CONFIRMED (run + probe) |

**Decision**: `useShellNavigation()` reads `useError()` and returns `navCta` as `undefined` while an error is shown; `SiteNav` takes `cta?: ResolvedShellItem` and renders the CTA wrapper **and** its `<noscript>` override only when `cta` is present. The layout passes `navCta` as today, so `app/layouts/default.vue` does not change. The reactive `useError()` also restores the CTA as soon as the visitor navigates away (F11). The language button needs no change (F26); a test locks the behaviour.

---

## R5 · Where the code lives

**Decision**: inside the `shell` feature (`ui/NotFoundContent.vue`, `ui/NotFoundRings.vue`, `logic/useNotFoundContent.ts`, `logic/useNotFoundDocument.ts`, `data/notFound.ts`), with `app/error.vue` as a thin Nuxt-native wrapper.

**Rationale**: the not-found page is site chrome, not a product section: it is reachable from every path, it is built only from the shell's own vocabulary (route names, `SHELL_ANCHORS`, the destination resolver, the language toggle rule) and it changes shell behaviour (nav CTA). Constitution Article I lists the four modules (`shell`, `landing`, `about`, `forms`); a fifth module would need an amendment for six small files. Article III: nothing outside `shell` is imported; the landing's anchors are already mirrored in `SHELL_ANCHORS`.

**DRY**: `useShellNavigation`'s private `resolveHref`/`resolveItem` are lifted into `logic/useShellItemResolver.ts` and used by both composables; the not-found destinations are `ShellItem`s like every other shell link.

---

## R6 · Visual mapping (reference `<main>` → tokens)

Reference values are read from `reference/404.html` (desktop rules, and the `@media (max-width: 760px)` block as the 390 extreme, `rules.md` § R5). Fluid tokens interpolate 390 ↔ 1440 like every other token (A-05). Arithmetic is shown so it can be checked.

### Reused, no change

| Reference | Value | Site token / component | Delta | Label |
|---|---|---|---|---|
| Pill shell | glass-dark fill, 1px glass-line border, r999 | `Pill.vue` (`bg-glass-dark border-glass-line rounded-full`) | none | CONFIRMED |
| Pill padding / gap | 9 20 9 12, gap 10 | `py-pill-y` 9 · `pe-pill-end` 20 · `ps-pill-start` 10 · `gap-pill-gap` 11 | start −2, gap +1 | CONFIRMED (tokens) |
| Pill text | 13 / 500 / 0.054em, bone-200 | `text-pill` 12→13, 0.054em, 500, `text-bone-200` | −1 px at 390 | CONFIRMED |
| Pill dot | 8 px red-400, static, `box-shadow 0 0 10px` red @80 % | `Radar size="sm"`: 7 px red-400 dot in a 20 px footprint, **pinging** (2.4 s, off with reduced motion) | −1 px, glow → ping | CONFIRMED |
| Heading | `clamp(44px, 6.2vw, 88px)`, lh 0.98, ls −0.036em, 600, bone-100, `text-wrap: balance` | `text-display` 46→98, lh 0.98, ls −0.036em, 600 | +2 px at 390, **+10 px at 1440** | CONFIRMED — **gate question** |
| Subtitle | 18 (16 mobile), lh 1.55, ink-100 | `text-body-sm` 16→18, lh 1.6 | lh +0.05 | CONFIRMED |
| Button | pill, glass-dark, 15/600, padding 14×28, min-h 48, LED 1.5 px red→bone→red, 2.6 s on hover, none with reduced motion | `BotonPrimario variant="hero"` (same ring, same timing; `py-btn-y` 16→18, `px-btn-hero-x` 26→32, `text-button` 15→16) | ~55 px tall at 1440 vs 48 | CONFIRMED — **gate question** (alt: `variant="nav"`, 48 px tall, 15 px text, 22 px side padding) |
| Shortcut links | 14 px, ink-100, hover bone-100, `·` separators ink-300 | `text-footer-item` 14→15, `text-ink-100`, `hover:text-bone-100`, `text-ink-300` | +1 px at 1440 | CONFIRMED |
| Focus ring | 2 px red-400 | `focus-visible:outline-red-400` (site pattern) | offset per platform | CONFIRMED |
| Horizontal padding | 24 (16 mobile) | the layout's `px-page` 24→80 | +8 at 390 | CONFIRMED |

### New tokens (all in `app/assets/css/global.css`)

| Token | Value | From | Why new | Label |
|---|---|---|---|---|
| `--not-found-rings` (`:root`) | `clamp(26.25rem, 19.75rem + 26.6667vw, 43.75rem)` | outer ring 420 → 700: slope 280/1050 = 26.6667vw; 420 − 0.266667×390 = 316 px = 19.75rem | no existing diameter | DERIVED |
| `--not-found-ring-mid-inset` (`:root`) | `14.2857%` | (700 − 500)/2/700 = (420 − 300)/2/420 = 0.142857 | ratio identical in both frames | DERIVED |
| `--not-found-ring-inner-inset` (`:root`) | `28.5714%` | (700 − 300)/2/700 = (420 − 180)/2/420 = 0.285714 | same | DERIVED |
| `--not-found-ring-w` (`:root`) | `0.0625rem` | 1 px border | same role as `--purpose-arc-w`, separate name to avoid coupling | CONFIRMED |
| `--not-found-ring-outer-color` (`:root`) | `color-mix(in srgb, var(--bone-100) 8%, transparent)` | README | equals `--color-divider-menu` by value; a menu divider must not govern a ring | CONFIRMED |
| `--not-found-ring-mid-color` (`:root`) | `… var(--bone-100) 12% …` | README | equals `--color-hairline-footer` by value; same reason | CONFIRMED |
| `--not-found-ring-inner-color` (`:root`) | `… var(--red-400) 24% …` | README | no red @24 % exists | CONFIRMED |
| `--spacing-not-found-top` | `clamp(4.5rem, 3.9429rem + 2.2857vw, 6rem)` | 72 → 96 | | DERIVED |
| `--spacing-not-found-bottom` | `clamp(2.5rem, 4.5571rem - 2.2857vw, 4rem)` | reference bottom 96/120 **minus** the layout's `mt-section-gap` before the footer (32/80) → 64 → 40 | the layout already adds the gap | DERIVED |
| `--spacing-not-found-min-h` | `clamp(35.5rem, 35.1286rem + 1.5238vw, 36.5rem)` | reference min-height 600/664 minus the same gap → 568 → 584 | keeps the footer down on tall screens | DERIVED |
| `--spacing-not-found-content` | `45rem` | content max-width 720 | | CONFIRMED |
| `--spacing-not-found-measure` | `30rem` | subtitle max-width 480 | `--spacing-hero-measure` is 600 | CONFIRMED |
| `--spacing-not-found-pill-gap` | `1.75rem` | pill → heading 28 | | CONFIRMED |
| `--spacing-not-found-title-gap` | `1.25rem` | heading → subtitle 20 | | CONFIRMED |
| `--spacing-not-found-body-gap` | `2.25rem` | subtitle → button 36 | | CONFIRMED |
| `--spacing-not-found-cta-gap` | `1.75rem` | button → shortcuts 28 | | CONFIRMED |
| `--spacing-not-found-shortcut-gap-x` / `-y` | `0.875rem` / `0.625rem` | row gap 10, column gap 14 | | CONFIRMED |
| `--spacing-not-found-shortcut-x` / `-y` | `0.125rem` / `0.375rem` | link padding 6 × 2 (touch target) | | CONFIRMED |

The four colour/geometry tokens of the rings live in `:root`, not in `@theme inline`, because only hand-written CSS reads them (`rules.md` § R18, `findings.md` § R46). None uses the closed `--color-glow-*` / `--spacing-glow-*` namespace (`rules.md` § R36). The `--spacing-not-found-*` tokens go in `@theme inline` and are consumed as utilities (`pt-not-found-top`, `max-w-not-found-measure`, …), which `findings.md` § R47 confirms Tailwind resolves by name.

### Layering

The rings are an absolutely positioned, `aria-hidden`, `pointer-events-none` element centred with `left/top: 50%` + `translate(-50%, -50%)` — a transform on the decorative element only, which creates a stacking context for its own empty subtree and nothing else (allowed by `SectionBackdrop.vue`'s section contract). It sits first in the section; the content block follows with `position: relative`, so text paints over the rings. The section is `position: relative`, adds no glow, no opaque background and no stacking context (§ R28). A 700 px ring wider than a 390 px viewport is clipped by the layout root's `overflow-clip`, so no horizontal scroll (INFERRED; checked in the quickstart).

### Reference values NOT carried over

| Reference | Why |
|---|---|
| Wine @40 % and deep @30 % background blobs | Outside `<main>`; gate G4 asked for the red one only. The red blob **is** carried over — see R6b. |
| Header, footer, menu panel, Google Fonts, `data-en` script | Ignored by instruction; the layout supplies them; D1 forbids the script. |
| Vertical-centre layout via `display:flex; align-items:center` with min-height | Kept, through `--spacing-not-found-min-h`. |
| Nav top offset (reference header 24 + 72) | The site's own nav is used; the exact in-flow nav height is measured, not assumed (`rules.md` § R49), in the quickstart. UNVERIFIED until measured. |

---

## R6b · The red background glow (gate G4, Roberto 2026-10-15)

### Reference

`reference/404.html`, `.bg__blob--red`: `position: absolute; top: -480px; right: -560px; width: 1440px; height: 1440px; border-radius: 50%; background: radial-gradient(circle closest-side, rgba(207, 49, 71, 0.55), transparent)`, inside a page-wide `.bg` (`position: absolute; inset: 0` on `<body>`). The `@media (max-width: 760px)` block does not touch it, so it is 1440 px at every width. CONFIRMED (file).

Centre in page coordinates: left edge = viewport + 560 − 1440 = viewport − 880, centre = viewport − 880 + 720 = **viewport − 160** (160 px left of the right edge); y = −480 + 720 = **240 px below the page top**. DERIVED.

### Mapping to the existing mechanism

| Property | Reference | Site | Delta | Label |
|---|---|---|---|---|
| Recipe | radial-gradient `circle closest-side`, colour → transparent | `SectionGlow` (`bg-radial-[circle_closest-side] … to-transparent`, rounded) | identical recipe | CONFIRMED |
| Colour | red-400 | `color="red-400"` | none | CONFIRMED |
| Opacity | 55 % | `opacity={60}` — nearest of the three red pairs `SectionGlow` admits (12/60/65); it is the Nosotros hero `foco` pair | **+5 pt** | CONFIRMED (union in `SectionGlow.vue`) |
| Diameter | 1440 at every width | `size="1400-700"` (`--spacing-glow-1400-700`: 1400 → 700) — the existing size nearest 1440 at desktop; it also belongs to the same Nosotros `foco` pair | −40 px at 1440; **700 vs 1440 at 390** | CONFIRMED (token) |
| Layer | `.bg` behind everything, z 0 | `<SectionBackdrop>` → `--layer-glow` (−3), beneath the dots (−2) and the spotlight (−1) | dots now paint over the bloom, as on every page of the site | CONFIRMED (§ R37) |
| Accessibility | `aria-hidden` on `.bg` | `SectionBackdrop` and `SectionGlow` are both `aria-hidden`, `pointer-events-none` | none | CONFIRMED |

**No new glow token.** The pair red-400/60/`1400-700` already exists and is reachable through `SectionGlow`'s props; `SectionGlow.test.ts`'s closed-namespace check (§ R36) is untouched. Making the mobile bloom 1440 px or the opacity 55 % would need a new `--color-glow-*`/`--spacing-glow-*` token **and** a change to the `done` `SectionGlow` contract — rejected per § R36; recorded as a delta instead.

### Position — two new tokens, and why they are unavoidable

Every section that places a glow owns its offsets (`rules.md` §§ R29, R48: `--spacing-hero-glow-*`, `--spacing-about-hero-glow-*`, …); no existing token encodes this position. Following § R48, the glow is anchored by its **centre** (`-translate-x-1/2 -translate-y-1/2`) at offsets relative to the **section box**, interpolated between the two extremes.

Section box origin: x = the page margin (`--spacing-page`: 24 at 390, 80 at 1440); y = the bottom of the nav. The reference's header is in flow and measures 24 + 72 = **96** at 1440 and 16 + 60 = **76** at 390.

| | 1440 | 390 | Derivation |
|---|---|---|---|
| centre x, page | 1440 − 160 = 1280 | 390 − 160 = 230 | above |
| **centre x, section** | 1280 − 80 = **1200** | 230 − 24 = **206** | minus page margin |
| **centre y, section** | 240 − 96 = **144** | 240 − 76 = **164** | minus reference header |

New tokens (`@theme inline`, consumed as `left-not-found-glow-x` / `top-not-found-glow-y` like the Hero's, `findings.md` § R47):

| Token | Value | Check |
|---|---|---|
| `--spacing-not-found-glow-x` | `clamp(12.875rem, -10.2rem + 94.6667vw, 75rem)` | slope (1200 − 206)/1050 = 0.946667; 206 − 0.946667×390 = −163.2 px = −10.2rem; at 1440: −163.2 + 1363.2 = 1200 ✓ |
| `--spacing-not-found-glow-y` | `clamp(9rem, 10.7143rem - 1.9048vw, 10.25rem)` | slope −20/1050; 164 + 7.4286 = 171.4286 px = 10.7143rem; at 1440: 171.43 − 27.43 = 144 ✓ |

Neither name starts with `--spacing-glow-`, so the § R36 regex `--(?:color|spacing)-glow-…` does not match them (same as `--spacing-hero-glow-*`). DERIVED.

**UNVERIFIED until measured**: the site's own nav is not the reference's header; its in-flow height at 1440/390 decides where "section top" really is. The y token is derived from the reference's header and is checked in the quickstart § 4; if the built page's bloom centre is off by more than a few px from page-y 240, the token is corrected from the measurement, not guessed (§ R49).

### Layer contract and overflow

- The section is already `position: relative` with no stacking context and no opaque background (R6 Layering), so `<SectionBackdrop>` resolves against it and its glow lands on `--layer-glow`, beneath the page-wide dot sheet — the § R28/R37 contract, unchanged.
- The glow's own translate is allowed (context of its own empty subtree, `SectionBackdrop.vue`).
- It extends past the viewport's right edge and above the section (behind the nav, as in the reference). Horizontal: clipped by the layout root's `overflow-clip`, as for the Hero's glows at negative/overflowing x — no horizontal scroll (INFERRED; verified in quickstart § 4). Vertical: the root clips both axes, so the glow cannot lengthen the document (`findings.md` § R54; INFERRED, verified in quickstart). Below the section it runs under the footer, which is opaque ink.
- Order inside the section: `<SectionBackdrop>` (glow) → `<NotFoundRings>` → content. The rings and text paint above the glow.

---

## R7 · Copy

Copy table in `spec.md` § Copy. Keys (`data-model.md` § 2). `Error 404` contains no `@` (§ R26 does not apply). The EN column is the reference's `data-en` (leader's proposal) and needs Roberto's confirmation at the gate.

---

## R8 · CloudFront: what this repository can and cannot promise

| # | Fact | Label |
|---|---|---|
| F27 | A CloudFront custom error response maps **one error code to one `ResponsePagePath`** for the whole distribution; it cannot vary by the request path. | INFERRED (CloudFront `CustomErrorResponse` API shape: `ErrorCode`, `ResponsePagePath`, `ResponseCode`, `ErrorCachingMinTTL`); not re-checked against current AWS docs in this session |
| F28 | A CloudFront Function cannot fetch from the origin, so a viewer-request function cannot know whether an object exists. | INFERRED (CloudFront Functions model) |
| F29 | muush-foundation already runs one viewer-request function, `request-router`, in module `static-site` (www → apex 301, directory-index rewrite, `/__geo`), and has a gate "still one edge function" (G-VII.6). | CONFIRMED (`specs/032-…/contracts/edge-geo-endpoint.md`) |

**Consequence**: custom error responses alone deliver D3 (status 404) with one document for every missing path, but not the per-prefix choice. **Gate G5 (Roberto, 2026-10-15)**: Stage 1 is that configuration, with the **English** document (`en/404/index.html`) as the single fallback — deliberately not the default locale `es` / `x-default`. Stage 2 (per-prefix) is deferred to muush-foundation. The per-prefix choice needs code that runs **after** the origin answers (e.g. Lambda@Edge on origin-response) or a route manifest at the edge. The contract states the required behaviour, offers a staged path and leaves the mechanism to muush-foundation and Roberto (`contracts/edge-not-found.md` §§ 3–4).

---

## R9 · Smaller confirmations

| # | Fact | Label |
|---|---|---|
| F30 | `#proposito` and `#servicios` exist on both homes: `PurposeSection.vue:148` `<section id="proposito">`, `ServicesSection.vue:67` `<section id="servicios">`, one component per section for both locales. | CONFIRMED |
| F31 | `vitest.config.ts` already collects `app/features/**/*.test.ts`. | CONFIRMED |
| F32 | `error.vue` receives an `error` prop from Nuxt; if undeclared it falls through as an attribute onto the root component. Declaring it with `defineProps` keeps it off the DOM. | INFERRED (Vue attribute fallthrough) |
