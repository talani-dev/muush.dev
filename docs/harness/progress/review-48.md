# Review · feature 48 `m1_legal_pages`

- **Reviewer run:** 2026-11-05, branch `feat/v2-legal` (uncommitted diff against `muush-v2`, plus untracked files).
- **Precondition:** `feature_list.json` entry 48 had status `reviewing` before this review started (CONFIRMED).
- **Scope:** `"sdd": false`, so there is no spec package. I judged against:
  - entry 48, including "DECISIONES DE ROBERTO AL ARRANCAR";
  - entry 49;
  - `pen-extract-48.md`, `pen-48/*.html` and `png/`, `legal-copy-48.md` and its erratum;
  - the constitution, `CHECKPOINTS.md`, `verification.md` and `impl_legal_pages.md`.

## Verdict: APPROVED

No must-fix items. The should-fix items below are small. They can go in a follow-up or in this branch before merge, at the leader's discretion.

---

## 1 · Legal text vs `.pen`: PASS (CONFIRMED, checked mechanically)

### Method
- I parsed every leaf text node of all 16 exports (`priv|terms|cookie|prefs` × `es|en` × `d|m`).
- I applied the four § 2 substitutions.
- I checked each node for a verbatim match in the values of `i18n/locales/{es,en}.json`, with `{'@'}` unescaped.
- In the other direction, I checked each of the 133 `legal.*` and `consent.*` keys per locale for a verbatim match against the substituted `.pen` nodes.
- Scripts are in the scratchpad, not in the repo.

### Results, both locales
- **Every legal, banner and preferences node matches word for word.**
- The only `.pen` nodes with no locale match are:
  - shell chrome (feature 43: nav and footer labels, `dev`, `ES/EN`);
  - the ARCO ordinals `1`–`4`, which are rendered from the list index;
  - the dialog intro, which is split into `before` + `link` + `after`. Joined, it equals `UlkjL` / `q7yDPg` exactly.
- The only locale keys with no `.pen` match are:
  - `consent.preferences.close` ("Cerrar" / "Close"). This is an accessible name, not legal text.
  - The split intro pieces.
  - `legal.translationNote` in `es.json`. This is the routed parity arrangement. Its value is identical to the EN `.pen` node `OLjH3`.
- **Substitution hits** (desktop + mobile frames, both pages):
  - date: 4 per locale;
  - email delivery: 2;
  - retention period: 2;
  - Meta Pixel + Google Analytics sentence: 2.
  - That is exactly the § 2 table and nothing else. No `[…]` placeholder remains, which `tests/legal-copy.test.ts` also pins.
- **Erratum titles:** "Diagnóstico gratis" / "Free assessment" and "Trabaja con muush" / "Work with muush" are present as terms section titles and index links. They come from `terms-*.html`, as the erratum requires.
- **Rendered order:** I took the text of the generated `.output/public/{es/privacidad,en/privacy,es/terminos,en/terms}/index.html` and found every desktop `.pen` body node in document order (59 / 60 / 36 / 37 nodes). Nothing was missing or out of order.
- **Courtesy note:** it is rendered on the EN pages only (1 each) and never on the ES pages (0).

## 2 · No tracking or third-party network: PASS (CONFIRMED in the build)

- `grep` over `.output/public` finds no Meta, Google Analytics, gtag, fbq or googletagmanager references.
- The only `google.com` strings are XML namespaces in `sitemap.xml`.
- The remaining third-party hosts all predate this feature: Cal.com, wa.me, the socials, the forms API, and Turnstile on the forms.
- No new `fetch` and no `useScript` in the diff.
- `useCookieConsent` only reads and writes `localStorage["muush.cookie-consent"]`.
- Feature 49 has not been started.

## 3 · Consent behaviour and accessibility: PASS, with should-fixes

### Behaviour (code read and tests)
- The banner shows until a choice is stored. It is client-only (`app/layouts/default.vue:174`) and absent from the prerendered HTML (CONFIRMED: 0 hits in the built legal pages).
- "Rechazar todo" and "Aceptar todo" carry equal visual weight.
- "Personalizar" opens the dialog. Close (X), Escape and a click on the backdrop dismiss it without saving. Every saving action stores and closes.
- The dialog opens pre-filled with the stored choice. The switch defaults to off.
- "Cambiar mis preferencias" reopens the same dialog through the shared module state.
- A stored record missing a category counts as "no choice". This is the forward path for an "Analítica" category.

### Accessibility
- The dialog is a native modal `<dialog>` (`showModal`), labelled by its `h2`.
- `useFocusTrap` wraps Tab, and focus returns to the trigger.
- The switch is a `role="switch"` button with `aria-checked`, labelled by the category heading and described by its detail text.
- The banner is a labelled region, not a dialog, which is right for a non-blocking notice.
- **Not verified by me:** the in-browser behaviour run (Escape, focus return, reload persistence, the 16-press Tab cycle, reduced motion). It comes from the implementer's CDP evidence; I did not repeat it.

## 4 · Routes, indexing, sitemap, toggle and links: PASS (CONFIRMED in the build)

- **Routes:** `/es/privacidad` ↔ `/en/privacy` and `/es/terminos` ↔ `/en/terms`, defined in `nuxt.config.ts` `i18n.pages`.
- **Indexing:**
  - robots is `index, follow`. The single `noindex` string in each page is nuxt-robots' `robotsDisabledValue` config in the payload, not a meta tag.
  - Canonical, `hreflang` es / es-MX / en / en-US and `x-default` are correct.
  - The sitemap lists all 10 URLs, including the 4 legal ones.
- **Locale toggle:** it resolves through the route map (`/es/privacidad` → `/en/privacy`, `/en/terms` → `/es/terminos`).
- **Footer links:** both legal links appear on every page checked (home, about, faq, 404) and navigate in the same tab.
- **Form consent checkbox:** it links to the privacy page in the matching locale, with `target="_blank" rel="noopener noreferrer"`. The sentence is unchanged when the three parts are joined.

## 5 · Tokens, i18n, Storybook and tests: PASS

- **Tokens:** no hex, px, `rgb()` or arbitrary-value literal in `app/features/legal/**`, the two pages, or the shell, forms and shared diffs. New tokens live in `global.css`. `#B4B4B0` became a named token (`--texto-cookies`) because no palette step matches it, and the leader should flag it to Clau.
- **i18n:** `tests/i18n-parity.test.ts` is green, and no hardcoded strings were found.
- **Architecture:**
  - no cross-feature internal imports (the layout uses the `@/features/legal` barrel);
  - no relative imports across directories;
  - data → logic → ui direction respected;
  - no new Vue component over 200 lines (largest: `CookiePreferences.vue`, 175);
  - `nitro.preset` untouched and no `server/` added.
- **Storybook:** 11 of 12 new components have stories in 390 and 1440, ES and EN. `CookieConsent` (the host) has neither a story nor a test; see S2.
- **Shared changes:** `Heading` (`legal` size) and `PrimaryButton` (`compact` size) updated their stories and tests.

## 6 · `biome.json` exclusion of `docs/harness/progress/pen-*`: acceptable

- It is the same rationale as the existing `!docs/handoff`: generated reference HTML, not project source.
- The glob also matches the `pen-extract-*.md` files. That is harmless because Biome does not lint Markdown.
- Optional: narrow it to the export directories only, if the leader prefers.

## `./init.sh`: exit 0 (CONFIRMED, my own run)

- typecheck, check, test, generate and storybook:build all reported OK.
- My first run collided with another `nuxt generate` running at the same time (PID 16159, not started by me) and failed on the build lock. I re-ran it when the machine was idle and it passed.

---

## Must-fix

None.

## Should-fix

- **S1 · ARCO list order may not reach VoiceOver.** `app/features/legal/ui/LegalList.vue:31`
  - The visible numbers are `aria-hidden`, so the order relies on `<ol>` semantics.
  - Tailwind preflight sets `list-style: none`, and Safari/VoiceOver drops list semantics in that case.
  - Fix: add `role="list"` to the `<component>` at line 20, or stop hiding the number.
- **S2 · `CookieConsent.vue` has no component test.**
  - Its wiring is untested at component level: the banner hidden while the dialog is open (`v-show`), the banner removed once a choice exists, and `currentChoice` falling back to all-off.
  - The pieces are each tested; the composition is not.
- **S3 · New-tab link gives no warning.** `app/features/forms/ui/ConsentCheckbox.vue:65`
  - The link opens a new tab without telling assistive tech.
  - A visually hidden "(se abre en una pestaña nueva)" needs new copy, so it needs Roberto's OK.
  - Advisory only (WCAG G201); I am not blocking on it.
- **S4 · No safety-net close listener.** `app/features/legal/ui/CookiePreferences.vue:101`
  - Only `@cancel` is handled. Today every native close path fires `cancel` first, so state cannot drift.
  - Adding `@close="open && emit('close')"` would guard future paths (for example a `closedby` attribute or a form with `method="dialog"`).

## Nits (optional)

- `CookiePreferences.vue:98`: `aria-modal="true"` is redundant on a `showModal()` dialog.
- `LegalSection.vue:29`: `aria-labelledby` on each `<section>` makes 10–14 region landmarks per page, which is landmark noise. Dropping it keeps the `id` anchor and loses nothing.
- `app/features/legal/logic/resolveLegalPage.test.ts:5`: a logic test imports a `ui/` testing fixture. It is test-only, but it runs against Article II's direction. Moving `legalFixtures.testing.ts` to `data/` would fix it.
- Constitution Article I lists the feature modules as `shell`, `landing`, `about` and `forms`. `legal` is a new module, so a PATCH note there would keep the list honest.

## Routed items: concur, with one remark

- I concur with routing all five to Roberto:
  - the SEO descriptions;
  - the ES slot holding the EN courtesy note;
  - consent with no expiry;
  - the alignment of "Guardar mi elección" on mobile;
  - the heading line height under the feature-46 ruling.
- On consent expiry, I recommend Roberto set a re-consent period before feature 49 ships. The privacy notice says pixel data is kept "hasta 14 meses"; a matching 12- or 13-month re-ask is common practice. It is a one-line check in `parseConsentRecord`.

## Not verified by this reviewer

- Pixel match at 390 and 1440, and the absence of horizontal overflow at 360 / 768 / 1024 / 1280 / 1920. I relied on the implementer's measured table in `impl_legal_pages.md` § 2 and did not re-measure in a browser.
