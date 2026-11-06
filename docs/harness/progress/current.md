# Current session

- **Feature:** 48 `m1_legal_pages` — **reviewing**
- **Start:** 2026-11-05
- **Agent:** leader → implementer
- **Branch:** `feat/v2-legal` (from `muush-v2` at 2f6d1e2)

## Plan

1. Leader extracts privacy, terms, cookie banner and preferences (ES/EN, 1440/390) → `pen-extract-48.md`, `pen-48/`, `legal-copy-48.md`. ✅
2. implementer builds (sdd: false — no spec phase) → report `impl_legal_pages.md`.
3. reviewer → `review-48.md`.
4. ⏸ Commit and merge `feat/v2-legal` into `muush-v2` when Roberto asks.

## Log

- 2026-11-05 · Roberto: designs are in the `.pen`; the `.pen` text is the final legal text; routes /privacidad·/privacy, /terminos·/terms; 48 includes the cookie banner + preferences (choice stored, no tracking); Meta Pixel + GA → new feature 49.
- 2026-11-05 · Placeholders resolved by Roberto: date 5 Nov 2026; Amazon SES; "hasta 14 meses" (leader recommendation accepted — GA4 retention + _ga cookie at 14 months, recorded in feature 49); GA named next to Meta Pixel in Cookies y píxeles.
- 2026-11-05 · The `.pen` changed during extraction (banner redesigned to a bottom bar + new preferences modal; the "[y otras herramientas…]" marker removed). Extract taken from the final state. Clau to add an "Analítica" category to the preferences modal; if not in time, it ships with 49.
- 2026-11-05 · Feature 49 `consented_tracking` added (pending, depends on 48). 48 → in_progress.
- 2026-11-05 · implementer: copy generated from the `pen-48` exports (§ 2 substitutions asserted, one hit each per page). Found the leader's `legal-copy-48.md` dropped 4 terms nodes that duplicate nav/footer strings ("Diagnóstico gratis" / "Free assessment", "Trabaja con muush" / "Work with muush" — section titles + index links); taken from the export. New feature module `app/features/legal/` (pages + cookie consent), routes `privacy`/`terms` in `i18n.pages`, footer + consent-checkbox links, `CookieConsent` in the layout (ClientOnly). `biome.json` now excludes `docs/harness/progress/pen-*` (the leader's HTML export failed `pnpm check`).
- 2026-11-05 · implementer: renamed the cookie tokens to `cookies-*` / `cookie-categoria-*` after finding `--spacing-aviso-gap` and `--text-aviso`/`--text-categoria` already belonged to features 45/43 (a silent override of the form notice). `useFocusTrap` lifted from shell to `app/shared/logic/` (the dialog needs it: Chrome let Tab escape a modal `<dialog>`). Browser-checked in Chrome via CDP at 360/390/768/1024/1280/1440/1920, ES+EN: no overflow, banner/dialog/consent persistence/scroll-spy/disclosure work, zero third-party requests. `./init.sh` exit 0 (221 files, 3008 tests). 48 → reviewing. Report: `impl_legal_pages.md`.
- 2026-11-05 · Roberto asked for a dedicated feature for Meta Pixel, GA and the remaining cookie work: feature 49 rewritten as `consented_tracking` (sdd: true) — tracking behind consent, Analítica category, banner/modal copy naming GA, consent expiry, GA4 14-month retention. Re-consent period moved out of 48.
- 2026-11-05 · Roberto + leader: tracking plan for feature 49 drafted → `tracking-plan-49.md` (GA4 + Meta Pixel events, no PII, time per section on Home and Nosotros sent per section visit so User explorer reads the journey in order). Input for 49's spec.
- 2026-11-05 · Roberto configured GA4 (stream `muush.dev`, Measurement ID G-RHZC650SQS, enhanced measurement, internal traffic, retention). Key events get starred after the first production events (tracking-plan-49 § 9).
- 2026-11-05 · Meta Pixel ID received (1488638740001981) from Meta's install email; base code loads only after consent, no <noscript> pixel, advanced matching off (tracking-plan-49 § 8).
- 2026-11-05 · implementer: 48 fix round after review — S1 `role="list"` on legal lists, S2 `CookieConsent.test.ts` (9 tests), S3 sr-only new-tab notice on the consent link (Roberto-approved copy, `privacy.newTab` in both forms namespaces), S4 safety-net `@close`, nits (no `aria-modal`, no section landmarks, fixtures moved to `legal/data/`). Working tree is on `muush-v2` (feat/v2-legal already merged), uncommitted. `./init.sh` exit 0 (222 files, 3023 tests). 48 → reviewing. Report: `impl_legal_pages.md` § 7.
- 2026-11-06 · implementer: reviewer re-review of the fix round APPROVED (`review-48.md` § Re-review). 48 reviewing → done. Uncommitted on `muush-v2`.
