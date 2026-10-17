# Current session

- **Feature in progress:** 37 · `english_default_locale` (`sdd: false`)
- **Start:** 2026-10-16
- **Agent:** leader

## Plan

1. ⏸ Gate: Roberto approved starting feature 37 ("vamos con la tarea 37").
2. `implementer` phase A (read-only): inventory of everything that assumes `es` as default → report.
3. ⏸ Roberto approves the scope (acceptance item 1).
4. `implementer` phase B → `reviewer` (against `acceptance`, no spec.md) → done on Roberto's OK.

## Log

- 2026-10-16 · `./init.sh` exit 0 on master (feature 30 merged). Status → in_progress; branch feat/english-default-locale.
  Context change since registration: feature 33 is done (not pending). Its edge contract sends `/` by cookie/country with
  default `en` (G2); G3 left public/index.html, rootRedirect and x-default to this feature. The live 301 `/` → /en is
  still in muush-foundation's `request-router` until that side ships.
- 2026-10-16 · implementer phase A (read-only): inventory of `es`-as-default assumptions → `docs/harness/progress/audit_english_default_locale.md` (39 items, decisions D1–D9). Scratch build outside the repo: config change alone fails 4 tests (x-default), + `public/index.html` fails 6; nothing in app/tests/public/config edited.
- 2026-10-16 · Phase A audit delivered (39 items, docs/harness/progress/audit_english_default_locale.md). ⏸ Waiting for Roberto on D1–D9.
- 2026-10-16 · ⏸ Gate passed (acceptance item 1): Roberto approved D1–D9 as recommended ("si"): scope as audited; D2 root lang en-US; D3 site.defaultLocale derived; D4 x-default per page (/en/about on About) accepted; D5 JSON-LD inLanguage shift accepted; D6 amend constitution Art. VI (ratified, version bump); D7 human-only docs → line list for Roberto; D8 update README i18n; D9 closed specs untouched. Implementer phase B launched.
- 2026-10-16 · implementer phase B: defaultLocale 'en' + rootRedirect '/en', public/index.html → /en (lang en-US), 2 test files updated + sitemap x-default and site-config en-US assertions, constitution 2.0.1 (Art. VI), README i18n rewritten. Built output vs scratch baseline: body markup identical on all 6 docs; only x-default, sitemap x-default, default-locale scripts and the JSON-LD translation direction (D5) differ. ./init.sh exit 0 (1347 tests). Uncommitted, status unchanged → docs/harness/progress/impl_english_default_locale.md
- 2026-10-16 · Implementer phase B PASS (init.sh exit 0, 1347 tests). Leader added a dated note to feature 37 description (33 is done). Status → reviewing; reviewer launched.
- 2026-10-16 · Reviewer (37): APPROVED round 1 (master build compared in scratchpad; init.sh exit 0, 1347 tests; 2 non-blocking style notes). Awaiting Roberto OK for done.
- 2026-10-16 · Feature 37 → done, explicitly authorized by Roberto ("si"); history entry written.
