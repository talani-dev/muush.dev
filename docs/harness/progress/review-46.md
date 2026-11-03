# Review · feature 46 `m1_secondary_pages` (Nosotros, Preguntas, 404 in Muush 1.0)

- **Reviewer run:** 2026-11-02, branch `feat/v2-pages`, uncommitted working tree (111 changed/untracked paths).
- **Status at start:** `reviewing` (CONFIRMED in `feature_list.json`). Left at `reviewing`; not marked `done`.

## Verdict: APPROVED

No blocking findings. Two should-fix items and a few nits are below. None of them breaks an acceptance criterion or one of Roberto's 2026-11-02 rulings.

## Blocking

None.

## Should-fix (non-blocking)

1. **Card title runs close to the stroke between 1024 and 1439.** `lg:-me-tarjeta-equipo` lets the title box use the whole end padding from 1024. At 1440 this matches the `.pen`: ES "Cuando el proyecto lo pide" ends 13.5 px from the card's outer edge, as drawn. The cards get narrower below 1440, and there the text can end almost on the border. Measured gaps between the title glyphs and the card's outer edge:
   - 1200 EN "Always on your project": 4.3 px.
   - 1200 ES "Cuando el proyecto lo pide": 12.5 px.
   - 1100 ES: 10.7 px.

   Nothing overflows or gets clipped (`scrollWidth` is never larger than `clientWidth`, and no element sits outside the viewport), so this meets the brief. It looks cramped, though. Suggested fix: apply the negative margin only where the cards reach their full 400 px width (around 1440), or use a smaller value. 390 and 1440 stay the same either way.
2. **The `replaceWebPageNode` tag hardcodes `'data-nuxt-schema-org': true`.** The module's `useSchemaOrg` spreads `config.scriptAttributes` instead. The output is identical today (every page ships `data-nuxt-schema-org="true"`). A later change to the module config would not reach Preguntas, though. Low priority: either read the same config or add a comment that points at it.

## Nits

- Section heights against the drawn frames, all coming from Roberto's approved v2 heading scale or the auto line boxes, not from errors:
  - Cómo se arma at 1440: 623 measured, 640 drawn.
  - Dónde estamos at 1440: 1015 measured, 1004 drawn.
  - Dónde estamos at 390: 824.6 (ES) and 792.4 (EN) measured, 811 drawn.
  - Nosotros at 390: Cómo se arma 944, Trabaja 953 (drawn 941 and 949).
- The primary button's `textContent` includes the SVG `<title>` ("lucide · arrow-right"). The icon is `aria-hidden`, so the accessible name is unaffected. This comes from the shared feature 42 button.
- `docs/harness/progress/history.md` has no feature 46 entry yet. It is due at close-out (C6).
- The forms legacy quarantine (`forms/ui/legacy/*`) has no consumer. That was already true before this feature (feature 45 pattern, feature 47 deletes it), so it is not a 46 issue.

## What I verified

### Harness, process, build
- CONFIRMED: `./init.sh` exits 0 (my own run). Typecheck, Biome, 205 test files / 2754 tests green, `pnpm generate` (20 routes), `pnpm storybook:build`.
- CONFIRMED: exactly one feature is active (46 `reviewing`). Features 18 and 19 are `superseded`; 36, 39, 44 and 45 are `done`.
- CONFIRMED: tasks T001–T042 are all `[x]`. T041 notes that the reduced-motion and no-WebGL passes ran as unit tests only. Plan Phase −1 gates are all `[x]`. No `[NEEDS CLARIFICATION]` remains. The Clarifications record Roberto's 2026-11-02 rulings.
- CONFIRMED: no new dependency (`package.json` and `pnpm-lock.yaml` have zero diff). No `.storybook` change. No new alias. No `server/` directory. `nitro.preset` is still `'static'`.

### Roberto's decisions
- CONFIRMED · Preguntas title at weight 500: computed `font-weight: 500` and 88 px at 1440 (34 px at 390). Token `--text-estado--font-weight: 500`.
- CONFIRMED · Preguntas is linked only from the footer and the sitemap:
  - `/es/preguntas` and `/en/faq` appear twice in each footer (the desktop MUUSH column and the mobile link line), on the home, Nosotros and the 404.
  - Zero matches inside `<nav>` and the header on any page.
  - On Preguntas the footer link carries `aria-current="page"`, and no header item is lit (FR-031, FR-032).
  - `navigation.test.ts` keeps the no-Preguntas assertion as a permanent rule.
- CONFIRMED · compact (mobile) shader uniforms: `compactUniforms` match pen-extract-46 §§ 2–4 and § 6 value by value. The 4 new presets and `homeHero`, `howWeWork` and `assessment` have them; the mobile menu does not. Desktop `uniforms` are unchanged in the diff. `ShaderBackground` switches below 1024 through `useDesktopLayout`, and `useShaderCanvas` redraws when the preset changes. INFERRED (from unit tests, not a browser canvas check): the compact set is what actually draws below 1024.
- CONFIRMED · radar ping on the three card dots: `pulso` in `bg-red-muush-500`, `bg-blanco` and `bg-acero-200`, with `aria-hidden`. INFERRED: the shared `pulso` utility turns the ping off under reduced motion (unit tested; no browser pass).
- CONFIRMED · the v2 heading scale where the `.pen` sets none. Computed values:
  - Nosotros hero: 64 / 69.12 / −2.24 at 1440, 32 / 36.8 at 390.
  - Cómo se arma: 56 / 61.6 / −1.96.
  - 404: 64 / 69.12 / −2.24, and 34 / 39.1 at 390.
  - Preguntas: 88 / 93.28 / −3.08, the 1.06 display ratio the implementer reported.
- CONFIRMED · the 404 drops the pill, subtitle and shortcuts.
- CONFIRMED · approved Preguntas title and description copy in both locales. `pages.about.description` is unchanged (zero diff on those lines).
- CONFIRMED · footer flush after the last section: a 0 px gap on all 8 documents at 360, 390, 768, 1440 and 1920.
- CONFIRMED · Preguntas and 404 blocks are min-heights with centred content: `min-h-preguntas-alto` and `min-h-error-alto`, flex-centred. Measured 1100 / 720 (Preguntas) and 760 / 720 (404).

### Preguntas route, indexing and structured data
- CONFIRMED: `i18n.pages.faq` maps `/es/preguntas` ↔ `/en/faq`, and `ShellRouteName` includes `'faq'`.
- CONFIRMED: both documents have their own `<title>`, a canonical to themselves, and hreflang `es`, `es-MX`, `en`, `en-US` and `x-default` (→ `/en/faq`). Robots is `index, follow, …`. The only "noindex" string in either file is the module's runtime-config `robotsDisabledValue`, not a meta tag.
- CONFIRMED: `sitemap.xml` lists exactly 6 URLs (home, Nosotros, Preguntas × 2) with 18 alternates.
- CONFIRMED, language toggle: the static `href` goes `/es/preguntas` → `/en/faq` and back. In the browser, clicking it on `/es/preguntas` navigated to `/en/faq` with `lang` en-US and title "FAQ · muush".
- CONFIRMED, structured data is a plain WebPage, and the override is sound:
  - Both Preguntas graphs hold WebSite, `WebPage` (single type, with ReadAction targeting the page itself), Organization and ImageObject. The two graphs are structurally identical.
  - How the override works: the module's graph resolver (`nuxt-schema-org` 6.4.3, `dist/schema.mjs`) copies each tag's `tagDuplicateStrategy` onto its nodes as `_dedupeStrategy`. When it dedupes nodes by `@id`, a node marked `"replace"` takes the place of the earlier one instead of being merged into it. So only the WebPage node is replaced; the site-level nodes stay.
  - The `@ts-expect-error` mirrors the module's own `useSchemaOrg`, which carries `// @ts-expect-error untyped` on `nodes`.
  - The code path runs only when `pageType === 'WebPage'`, and only `faq.vue` passes that (grep). Home and About still take their previous paths: home is `WebPage`; About is `["WebPage","AboutPage"]` with its ReadAction, as before.
  - Caveat: this relies on an internal (`_dedupeStrategy`) of the pinned module version. `seo-output.test.ts` would catch a regression on upgrade.

### 404 behaviour (features 36 and 39)
- CONFIRMED: zero diff on `notFoundLocale.ts`, `useNotFoundDocument.ts`, `switchLocaleInPlace.ts`, `resolveLocaleDestination.ts`, `app/plugins/`, `LanguageToggle*`, their tests and `tests/locale-preference-output.test.ts`. The `NOT_FOUND_ROUTES` hook in `nuxt.config.ts` is untouched; the only config diff is the `faq` page and two comments.
- CONFIRMED: in `tests/not-found-output.test.ts`, every behavioural case is still present unchanged:
  - one document per locale;
  - lang;
  - nav and footer once;
  - header CTA;
  - language-button `href`;
  - payload and no client-switch attributes;
  - title and noindex;
  - no canonical, hreflang, description or OG;
  - no `200.html` or `404.html`;
  - not in the sitemap.

  The "no other-locale copy" case keeps its intent with the new copy keys. Only the v1-look cases (pill, subtitle, LED, shortcuts, separators, rings, glow) were replaced with v2-look cases.
- CONFIRMED, generated output: `/es/404/` and `/en/404/` both exist with `<meta name="robots" content="noindex">` and no canonical. There is no root `200.html` or `404.html`.
- CONFIRMED, browser in-place switch:
  - On `/es/404/` at 1440, ES → EN kept the URL. `lang` became en-US and the title "Page not found · muush". The heading and both buttons switched (`/en`, `/en#diagnostico`). The cookie became `muush_locale=en`, the toggle `href` became `/es`, and the footer FAQ links became `/en/faq`.
  - The reverse switch on `/en/404/` at 390 behaved the same way.

### Feature 45 form
- CONFIRMED: zero diff under `app/features/forms/`. `WorkWithMuushSection` imports `ApplicationForm` from the forms barrel and passes `content` and `submitter` through unchanged. `about.vue` still resolves both seams.

### v1 retirement and quarantine
- CONFIRMED: the v1 About hero and the v1 Work section were rewritten in place; no v1 import is left in `app/features/about/`. `ui/legacy/NotFoundContent.*` and `NotFoundRings.*` are deleted.
- CONFIRMED: the v1 `about.*` eyebrow/headline keys and the v1 `shell.notFound.*` keys are removed, as are the `--work-*`, `--spacing-about-hero-top`, the glow anchors and every `--not-found-*` token.
- CONFIRMED: a grep finds no dangling reference to the deleted keys, components, `fullBleed`, `NOT_FOUND_SHORTCUTS` or the removed tokens. The remaining hits are absence assertions in tests.
- CONFIRMED: kept only what quarantined code still reads: `HeroStack`'s about-hero tokens and `--spacing-nav-cta-h` for `legacy/SiteNav`. This follows the 44/45 pattern.
- CONFIRMED: the v1 page frame (`isFullBleed`, `max-w-shell-max px-page`) and the footer's `mt-section-gap` are gone from `default.vue`, and `definePageMeta({ fullBleed })` is gone from `index.vue`.

### Shared reuse
- CONFIRMED: `ReceivesList` moved by `git mv` to `app/shared/ui/`, with its story under `Shared/UI/ReceivesList` and fixtures in shared. `AssessmentSection` and `WorkWithMuushSection` both import it.
- CONFIRMED: the map copy has one source (`shared/data/mapCopy.ts` and `shared/utils/mapCopy.ts`, keys under top-level `map.*`, values verbatim). The home and Nosotros both spread `resolveMapCopy`. `WhereWeAreSection` reuses `WorldMap` and `MapLegend` unchanged.
- CONFIRMED: Preguntas and the 404 share one `StatusSection`.
- CONFIRMED: no file imports another feature's internals; `about` reaches forms only through `@/features/forms`. `app/shared` imports no feature, and no relative import crosses a directory.

### Home
- CONFIRMED, browser at 1440 (ES and EN): no horizontal scroll, five sections, `pill-aire` 8 px on all five pills, footer gap 0. At 390 the pills get 6 px.
- INFERRED: the home renders unchanged at 1440 apart from the footer gap. The diff touches only the `fullBleed` meta (now the default), the `ReceivesList` import path, the map-copy keys (values unchanged, `landing-copy` test green), the compact uniforms (which apply only below 1024) and the footer margin. I tried a pixel baseline build of HEAD in a scratch dir, but the build failed in that setup (symlinked `node_modules`), so it was abandoned and deleted.

### `pill-aire`
- CONFIRMED: every non-legacy `<Pill>` and `RotatingPill` carries `pill-aire`: the 4 Nosotros pills, the 4 home section pills and the hero rotating pill. Computed `margin-bottom` is 6 px at 390 and 8 px at 1440. Preguntas and the 404 render no pill.

### Card title (leader answer)
- CONFIRMED, 1440 and 1439 (ES and EN): all three cards are 400 × 196.2 (drawn 197), each title on one line, nothing overflows.
- CONFIRMED, 1024 / 1100 / 1200 / 1280: titles wrap inside the card's outer edge, no clipping, no horizontal scroll. Some titles end very close to the edge (should-fix 1).
- CONFIRMED, 1920: same as 1440.

### Responsive sweep
- CONFIRMED, browser at 360, 390, 768, 1024, 1100, 1200, 1280, 1439, 1440 and 1920 (ES and EN): Nosotros, Preguntas, the 404 and the home all have `scrollWidth` equal to the viewport width.
  - The only elements outside the viewport are the intentionally clipped zoomed map and the home services carousel.
  - The Spanish Preguntas buttons stay on one row at 390 and 360 (x 21.9 → 368.1 at 390).
- CONFIRMED, Nosotros at 390: Cómo se arma and its cards start at x 24 (left aligned), the cards are 342 wide, and the h1 is 32 / 500 / 36.8.
- CONFIRMED, 404 buttons: 152 × 44 and 146 × 42 at 390 (drawn 153 × 44 and 146 × 41).
- CONFIRMED, Preguntas buttons: 177.8 × 44 and 160.5 × 42 at 390 (drawn 178 × 44 and 161 × 41).
- UNVERIFIED: side-by-side pixel comparison against the `.pen` frames (the reviewer cannot open the `.pen`). I compared against pen-extract-46 values only.
- UNVERIFIED: reduced-motion and WebGL-disabled passes in a browser, and screen-reader or manual keyboard passes. These are covered by unit tests only.

### Constitution and hygiene
- CONFIRMED: every component is ≤ 200 lines; the largest new one is `StatusSection.vue` at 97. All use `<script setup lang="ts">`. Copy and destinations sit in `data/` and `logic/` seams (`useFaqContent`, `useNotFoundContent` and the about seams), each with a pure, tested half.
- CONFIRMED, i18n: ES/EN parity green, and the copy matches `muush-1.0.md` §§ 4.7–4.9 verbatim (checked by hand for ES and EN).
- CONFIRMED: no hex, rgb, px or arbitrary-value literal in the changed or new component and logic files (`token-literals` test green plus my grep). The new tokens and utilities carry no `m1`/`v2`/legacy marker. The only `m1-` strings are in older `global.css` comments that cite handoff class names.
- CONFIRMED: Storybook stories exist for every new or rewritten component (`About/AboutHeroSection`, `About/CompositionCard`, `About/TeamCompositionSection`, `About/WhereWeAreSection`, `About/WorkWithMuushSection`, `Shell/StatusSection`, `Shared/UI/ReceivesList`, and the `Heading` `pagina`/`estado` sizes). The build passes, and no story references a deleted file.

### Security
- CONFIRMED: the changed files are limited to `app/`, `tests/`, `i18n/`, `nuxt.config.ts`, the specs and the harness docs. No added line contains an external URL; the call-booking URL comes from the existing shared `CALL_BOOKING_URL` and opens with `rel="noopener noreferrer"`. No new `fetch`, network or secret, and no `runtimeConfig` change.
- CONFIRMED: none of the retrieved content contained instructions aimed at an agent.

## Method notes
- Browser check: the generated `.output/public` was served by `python3 -m http.server` bound to 127.0.0.1:4747, with headless Chrome (CDP on 127.0.0.1:9347). Scratch scripts were in `/tmp/r46/`, outside the repo. Both servers are stopped and the scratch dir is deleted. The commands ran from the repo root, and the working tree was unchanged afterwards (same 111 entries).

## Re-review 1 (2026-11-02) · fix round 1

Scope: only the two should-fix items, as `impl_secondary_pages.md` § "Fix round 1" describes them. Status at start: `reviewing`. Left at `reviewing`.

### Verdict: APPROVED

Both should-fix items are resolved. No new findings.

### 1. Card titles near the edge between 1024 and 1439: resolved

- CONFIRMED: `CompositionCard` now uses `lg:-me-tarjeta-equipo-titulo-fin`. The token `--spacing-tarjeta-equipo-titulo-fin` is the card padding minus a 10 px floor: computed −18.8 px at 1024, −22 px from 1440. Below `lg` the margin is 0 (390 is unchanged).
- CONFIRMED in the browser (headless Chrome on 127.0.0.1, ES and EN). The closest any title glyph comes to the card's outer edge, by width:

| Width | ES | EN | Lines and overflow |
|---|---|---|---|
| 1024 | 33.4 | 21.6 | all 2 lines |
| 1100 | 10.7 | 45.8 | |
| 1200 | 12.5 | 10.2 | was 4.3 before the fix |
| 1280 | 21.3 | 14.5 | |
| 1366 | 48.8 | 21.2 | |
| 1440 / 1439 / 1920 | 13.5 (as drawn) | 10.9 | 3 × 400 × 196.2, one line each, Cómo se arma 623.4 |

  No title overflows its box (`scrollWidth` never exceeds `clientWidth`), and `scrollWidth` equals the viewport at every width.
- INFERRED / for the leader: the 10 px floor puts the EN long title 10.9 px from the edge at 1440. The EN frame value for that title was not extracted. A 13 px floor would wrap the EN title (357.1 px of text), so 10 is a reasonable choice. It is the implementer's choice, flagged for the leader in the implementer report and not a review blocker.

### 2. Preguntas schema script attributes: resolved

- CONFIRMED: `replaceWebPageNode` spreads `useRuntimeConfig()['nuxt-schema-org'].scriptAttributes`, falling back to `{}`, after `type`. On the server this is the same source the module's `useSchemaOrgConfig()` reads: `runtimeConfig['nuxt-schema-org']`, defu'd with `scriptAttributes: {}`. I checked this in `nuxt-schema-org` 6.4.3 `dist/runtime/app/utils/config.js`.
- CONFIRMED, output: every generated page that carries JSON-LD (5 of the 6 HTML files I sampled; the root `index.html` redirect has no JSON-LD) opens with the same `<script type="application/ld+json" data-nuxt-schema-org="true" data-hid="schema-org-graph">`. Both Preguntas graphs are still WebSite / `WebPage` / Organization / ImageObject.
- CONFIRMED: `seo-output.test.ts` pins this with "should open the JSON-LD script with the module attributes on every page when generated": every page's opening tag must equal the home's and contain `data-nuxt-schema-org="true"`.

### Build
- CONFIRMED: `./init.sh` exits 0 (205 files / 2756 tests, generate, Storybook).
  - My first run failed in the test step's global setup with "Another Nuxt build is already running (PID 87330)". That was a lock held by a concurrent build, not a code failure.
  - The process had exited when I checked, and the re-run passed cleanly.

### Method
- Generated `.output/public` was served on 127.0.0.1:4748, with Chrome CDP on 127.0.0.1:9348. The scratch files were in `/tmp/r46b/`, outside the repo. Both servers are stopped and the scratch files are deleted.
