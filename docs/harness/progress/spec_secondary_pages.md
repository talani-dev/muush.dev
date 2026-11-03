# Feature 46 `m1_secondary_pages` · spec package summary

- **Package:** `specs/046-secondary-pages/` (spec, plan, research R1–R15,
  data-model, contracts/components.md, quickstart, checklists/requirements.md,
  tasks T001–T042).
- **Status:** feature 46 set to `spec_ready`. Branch `feat/v2-pages`. No
  commit made. `./init.sh` exits 0.
- **Sources:** pen-extract-46 (plus 44/45), `muush-1.0.md` § 1, § 3,
  § 4.7–4.9, the handoff README, specs 036/039/043/044/045 and the current
  code. The spec author did not open the `.pen`.

## Key decisions

1. **Nosotros = four v2 sections in `about/`.** `AboutHeroSection` (listón
   `aboutHero`), `TeamCompositionSection` + `CompositionCard` ("Cómo se
   arma"), `WhereWeAreSection` (shared `WorldMap` + `MapLegend`, same classes
   as the home section) and `WorkWithMuushSection` (listón `workWithUs`, the
   home diagnóstico grid without the call row, the feature 45
   `ApplicationForm` from the forms barrel, anchor `trabaja-con-muush`).
2. **Two lifts to `app/shared/`** so `about` never reaches into `landing`
   (Article III): `ReceivesList` moves to `shared/ui/`; the map labels
   (legend, tabs, cities) move from `landing.whoWeAre.*` to a top-level
   `map.*` namespace, read through a pure `resolveMapCopy(t)`. Home copy does
   not change.
3. **Preguntas and the 404 share one shell component, `StatusSection`**
   (heading + primary + glass button over the acanalado). Preguntas lives in
   the shell like the 404 (spec 036 R5 reasoning: built only from shell
   vocabulary). New route `faq` (`/es/preguntas` ↔ `/en/faq`) declared once in
   `i18n.pages`; plain web page schema, not FAQPage.
4. **404 behaviour untouched.** Every feature 36/39 module, the Nitro hook
   and LanguageToggle stay as they are. Only the body, its copy keys and the
   v1-look tests change.
5. **Deleted, not quarantined:** the v1 About hero and Work with muush
   section, the v1 404 body and rings, their copy and the v1 tokens only they
   use (feature 45 precedent). Shared `legacy/` primitives stay for 47.
6. **The v1 page frame is retired** from the layout (`fullBleed` meta goes
   away): after this feature no page is v1.
7. **Compact shader uniforms** (provisional, Q3): presets gain an optional
   below-1024 set, used by the four presets of this feature.

## Provisional answers / questions for Roberto

1. **Preguntas title weight.** The desktop frame draws 88 / 600; mobile and
   the constitution say 500. **Recommendation: 500 everywhere** (the
   leader's too). 600 would need a constitution amendment.
2. **How Preguntas is reached.** Today it is linked from nowhere: feature 43
   held its footer entries back until the route existed. **Recommendation:
   footer only**, as the approved copy draws it: desktop MUUSH column
   "Trabaja con muush · Preguntas · Blog", mobile link line after "Nosotros".
   Not in the link bar or the mobile menu. Plus the sitemap.
3. **Mobile shader uniforms.** The `.pen` mobile frames of the four sections
   draw their own uniforms (the acanalado at 18 ribs); the home reuses its
   desktop ones at all widths. **Recommendation: follow the `.pen` below 1024**
   (390 is an anchor).
4. **Radar ping on the three "Cómo se arma" card dots** (red, Blanco, Acero
   200). **Recommendation: yes**, consistent with the pill, pins, chips and
   success-tile rulings.
5. **"The existing 404 tests stay green."** Several assert the v1 look the
   design removes (pill "Error 404", subtitle, shortcuts, rings, glow).
   **Recommendation:** behavioural tests (36/39) stay green; v1-look tests
   are rewritten for the v2 look. LanguageToggle tests untouched.
6. **New copy to approve:** Preguntas page title "Preguntas · muush" / "FAQ ·
   muush"; description "Respuestas a las preguntas frecuentes sobre muush.
   Mientras tanto, pide tu diagnóstico gratis o agenda una llamada." /
   "Answers to frequently asked questions about muush. In the meantime,
   request a free assessment or book a call."
7. **What the 404 loses** (per the design): the "Error 404" pill, the
   subtitle and the Servicios · Nosotros shortcuts. The `h1` no longer says
   "not found"; the document title still does. Accept?
8. **Nosotros SEO description** (`pages.about.description`) is v1 copy that
   still fits; kept unchanged unless Roberto wants a new one.
9. **Future FAQ module.** When Preguntas gets real content it should become
   its own feature module, which needs an Article I amendment (the module list
   is closed). Not done now.

## Values missing for the leader

- **Heading line heights.** Nosotros hero 64 drawn 90 tall per line and Cómo
  se arma 56 drawn 78 (≈ 1.4, the auto value), while every other v2 heading
  is 1.06–1.1. Intended, or should they be 1.08 / 1.1? Also the line heights
  of the Preguntas (88) and 404 (64) headings at 1440.
- **Desktop tracking** of the Nosotros hero, Cómo se arma, Dónde estamos,
  Preguntas and 404 headings (only Trabaja's −2.24 is extracted). Provisional:
  the feature 42 fluid ≈ −0.035 em at 1440.
- **Cómo se arma card:** background blur? shadow? Is the Blanco 12 % stroke
  flat or top-lit? Line heights of the label (14/600) and title (26/500); is
  the label drawn in sentence case as given?
- **Footer gap.** On the v2 frames, is the footer flush after the last
  section, or is there a gap? The layout still adds the v1 `mt-section-gap`
  above the footer on every page, the home included.
- **Trabaja background offset.** `BD9CZ` sits 26 px above the section top.
  The plan fills the section exactly (the offset is inside the 30 % top fade).
  Confirm.
- **Preguntas / 404 heights.** Are the 1100 / 760 (desktop) and 720 (mobile)
  blocks minimum heights with content centred, or should the block fill the
  viewport?
- **Glass buttons on Preguntas and the 404:** confirm no icon.
- **Home mobile uniforms:** do the home's mobile frames also draw their own
  uniforms? Outside this feature, but Q3 makes the two pages differ in method.
- The "Estonia · pronto" EN chip reuses the home copy "Estonia · soon"
  (pen-extract-46 § 5.3), as instructed.

## What changes visually on the integration build after 46

- **Nosotros (`/es/nosotros`, `/en/about`):** fully v2. Hero over the listón
  with the 64 px two-tone heading; "Cómo se arma" with three glass cards
  (pinging dots); "Dónde estamos" with the same world map, legend and mobile
  America / Europa tabs as the home; "Trabaja con muush" over the listón with
  the "Áreas que sumamos" checklist and the application form (unchanged
  behaviour). The v1 glows, headline and layout are gone.
- **Preguntas (`/es/preguntas`, `/en/faq`):** new page, "En construcción 🚧"
  with "Diagnóstico gratis" and "Agenda una llamada" over the acanalado;
  in the sitemap; linked from both footers.
- **404:** "Volvamos a un / lugar conocido." with "Volver al inicio" and
  "Diagnóstico gratis" over the acanalado; no pill, subtitle, shortcuts, rings
  or red glow. Status, noindex and the in-place language switch as before.
- **Footer (every page):** gains "Preguntas" / "FAQ".
- **Home:** no visible change (shared list and map copy moved, the page-frame
  meta removed).
- **Phones:** the four new shader backgrounds use their mobile uniforms
  (if Q3 is approved).

## Notes

- `.specify/feature.json` points at `specs/046-secondary-pages`; spec-kit
  scripts were run with `SPECIFY_FEATURE=046-secondary-pages`.
- `CLAUDE.md` has no SPECKIT block, so no agent-context update was made.
- No business rule was written; nothing in `docs/business/` was touched.
- Stray build artefacts exist under `app/features/shell/logic/.nuxt/` and
  `app/features/shell/logic/node_modules/` (gitignored; probably a test run
  with the wrong cwd). Harmless, worth deleting.
