# Quickstart — verifying feature 49

Automated: `pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm storybook:build`.

Manual checks below cover what only a real browser shows (acceptance items 1–3,
9). Serve the build with `pnpm generate && npx serve .output/public` (or
`pnpm preview`), use a **fresh incognito window per scenario**, DevTools →
Network with "Preserve log" on, filter
`google|facebook|fbevents|doubleclick`. To avoid polluting production
properties, build with `NUXT_PUBLIC_GA_MEASUREMENT_ID` and
`NUXT_PUBLIC_META_PIXEL_ID` pointing at test properties if Roberto provides
them; otherwise use GA4 DebugView and Meta Test Events and tell Roberto first.

| # | Scenario | Expected |
|---|---|---|
| M1 | Open `/es`, scroll, click links, do not answer the banner; repeat on `/en/about`, `/es/privacidad`, a 404 | 0 matching requests; page source has no gtag/fbevents/noscript |
| M2 | Personalizar → only Analítica → Guardar | gtag.js + `collect` requests to Google; 0 Meta |
| M3 | Personalizar → only Publicidad → Guardar | fbevents.js + `tr` PageView; 0 Google |
| M4 | Aceptar todo / Rechazar todo | both / none |
| M5 | M4 accept all, navigate `/es` → `/es/nosotros` → back | exactly one GA `page_view` and one Meta `PageView` per navigation |
| M6 | On `/es` click "Diagnóstico gratis" in the hero (jump to `#diagnostico`) | `assessment_cta_click` with `cta_location=hero`; **no** page view |
| M7 | Accept all, then privacy page → Cambiar mis preferencias → turn both off → Guardar; navigate | no further Google/Meta request; `_ga`, `_ga_*`, `_fbp` gone (Application → Cookies); reload: no script |
| M8 | In Application → Local Storage, edit `muush.cookie-consent` `decidedAt` to 12 months + 1 day ago; reload | banner shows; nothing loads |
| M9 | Accept all; send the assessment form (WhatsApp chosen) against the real API only with Roberto's OK, else a stubbed `formsApiBaseUrl` returning `{ok:true}` | GA `generate_lead` with only `form`, `contact_preference`; Meta `Lead` with `ud[em]`, `ud[ph]` as 64-hex hashes; no name/company/need anywhere |
| M10 | Accept only Analítica and send the form | no Meta request; GA payloads carry no form value |
| M11 | Accept all; send the application form | GA `application_submit`; 0 Meta events beyond PageView |
| M12 | Scroll Home slowly to the end and back up; switch tabs | `section_view` per section left, seconds plausible, none < 1 s; one flushed on tab hide |
| M13 | Toggle ES → EN | `language_change` `from_locale=es`, `to_locale=en`, plus one page view |
| M14 | Open the dialog at 390 and 1440, ES and EN | rows Necesarias → Analítica → Publicidad; Analítica row identical to Publicidad apart from text |
| M15 | `cat .output/public/robots.txt` and `.output/public/llms.txt` | match contracts/build-output.md §§ 3–4 |
| M16 | Website field position: open the assessment form at 1440 and at 390 (step 2), ES and EN | 1440: full-width "Tu sitio web o redes (opcional)" / "Your website or social media (optional)" row between the Empresa + ¿Cómo te identificas? row and ¿Qué necesitas?; 390: step 2 order Empresa → ¿Cómo te identificas? → website → ¿Qué necesitas?; placeholder `https://`; same look as the other text inputs |
| M17 | Accept all; send the assessment form against a stubbed `formsApiBaseUrl` three times: website `  casaolivo.mx  `, website spaces only, website empty; then send the application form | request bodies: `"website":"casaolivo.mx"`; no `website` key; no `website` key; application body has no `website`; no GA4/Meta payload contains `casaolivo` |

Record results (pass/fail, date, browser) in `docs/harness/progress/current.md`
before handing to the reviewer.

GA4 admin prerequisite (Roberto, plan Q1): "Page changes based on browser
history events" OFF before M5 is judged.

Deploy precondition (R43, spec FR-067): Roberto confirms the Form Submission
API release that accepts `website` is live in production before this feature
is deployed. M17 runs against a stub, never against production, unless Roberto
says otherwise.
