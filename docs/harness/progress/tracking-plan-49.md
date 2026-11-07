# Tracking plan — feature 49 (`consented_tracking`)

> Drafted by the leader with Roberto, 2026-11-05. Input for the spec of
> feature 49; the spec decides the implementation. Nothing here loads until
> the visitor accepts the matching cookie category.

## 1 · Decisions so far (Roberto, 2026-11-05)

- GA4 + Meta Pixel. No AWS replacement (CloudWatch RUM measures
  performance, not acquisition; Pinpoint is being retired).
- Basic consent: no request to Google or Meta before the visitor accepts
  the category ("Analítica" → GA4, "Publicidad" → Meta Pixel). No Consent
  Mode "advanced" pings.
- Time per section is measured on every section of Home and Nosotros.
- Events are sent so a single visitor's journey reads in order in GA4's
  User explorer (§ 5).

## 2 · Privacy rules (non-negotiable)

- No personal data in any event or parameter: no name, email, phone,
  company, "¿Qué necesitas?" text, CV, URLs typed by the visitor, nor the
  IP. Only event names, fixed ids (section, CTA location, form name) and
  error *types*.
- Meta Advanced Matching ON (Roberto, 2026-11-06, replaces the original
  "off"): only the form's email and phone, hashed by the pixel, and only
  after the visitor accepts Advertising. It is the single exception to the
  rule above and never applies to GA4 events or parameters. It ships only
  once the privacy notice covers it with Roberto's legal text.
- No GA4 User-ID; the visitor stays pseudonymous (the `_ga` client id).
- Google Signals off (not covered by the privacy notice).
- GA4 retention 14 months; `_ga` `cookie_expires` 14 months.
- The talent application is never sent to Meta (it would teach ad
  optimisation to find applicants, not clients).

## 3 · Automatic GA4 data (no code)

`page_view`, `session_start`, `first_visit`, `user_engagement`; with
enhanced measurement: `scroll` (90 %), outbound `click` (Cal.com, wa.me,
social), `file_download`. Every event already carries time, coarse
location (country/region/city from the IP, which GA4 discards), device,
browser, language, traffic source/medium, referrer, landing page and UTMs.

Client-side navigation: page views must count once per route change; the
in-page jump to the assessment anchor is not a new page view.

## 4 · Custom events

| Event | When | Parameters | GA4 | Meta |
|---|---|---|---|---|
| `assessment_cta_click` | Click on "Diagnóstico gratis" | `cta_location` (`nav`, `hero`, `mobile_menu`, `footer`, `faq`, `not_found`, …) | ✅ | — |
| `book_call_click` | Click on "Agenda una llamada" (Cal.com) | `cta_location` (… , `form_success`) | ✅ key event | `Schedule` |
| `contact_click` | WhatsApp or `support@muush.dev` | `channel` (`whatsapp` \| `email`), `cta_location` | ✅ | `Contact` |
| `form_view` | The form section enters the viewport | `form` (`assessment` \| `application`) | ✅ | — |
| `form_start` | First interaction with a field (our own event: GA4's enhanced-measurement "Form interactions" stays OFF, it uses the same names) | `form` | ✅ | — |
| `form_step` | Mobile: step 1 → 2 (and back) | `form`, `step` | ✅ | — |
| `form_submit` | Send pressed with a valid form | `form` | ✅ | — |
| `form_error` | Validation, challenge, network or server error | `form`, `error_type` (`validation`, `challenge_failed`, `network`, `server`), `field` (field id only, for validation) | ✅ | — |
| `generate_lead` | Assessment API answered `ok: true` | `form` = `assessment`, `contact_preference` (`email` \| `whatsapp`) | ✅ key event | `Lead` |
| `form_response` | The form's API call finished, whatever the outcome (Roberto, 2026-11-07) | `form` (`assessment` \| `application`), `result` (`ok` \| `error`), `error_type` (only when `error`: `network`, `server`, `challenge_failed`, `validation`) | ✅ | — |
| `cv_attached` | A valid PDF chosen / rejected | `result` (`ok`, `too_large`, `not_pdf`) | ✅ | — |
| `application_submit` | Application API answered `ok: true` | `form` = `application`, `with_cv` | ✅ | — |
| `language_change` | ES ↔ EN toggle | `from_locale`, `to_locale` | ✅ | — |
| `section_view` | See § 5 | `page_key`, `section`, `section_seconds` | ✅ | — |
| `cookie_preferences` | Choice saved after consent exists (only measurable once Analítica is on) | `analytics`, `ads` (booleans) | optional | — |

Parameter values are fixed ids, never free text. Separate event names (not one `cta_click` with a `cta` parameter) because a
GA4 key event is a whole event name. Custom dimensions to register:
`cta_location`, `channel`, `form`, `step`, `error_type`, `field`,
`contact_preference`, `result`, `with_cv`, `from_locale`, `to_locale`,
`page_key`, `section`. Custom metric: `section_seconds` (unit: seconds).

## 5 · Time per section (`section_view`)

| Page | Sections (`section` id) |
|---|---|
| Home (`page_key` = `home`) | `hero`, `who_we_are`, `services`, `how_we_work`, `assessment` |
| Nosotros (`page_key` = `about`) | `hero`, `how_it_comes_together`, `where_we_are`, `work_with_us` |

- A section is "in view" while ≥ 50 % of it (or of the viewport, for a
  section taller than the viewport) is visible **and** the tab is visible.
- One `section_view` is sent **each time the visitor leaves a section**
  (scrolls away, navigates, hides the tab), with the seconds of that visit;
  on page hide any open visit is flushed with a transport that survives
  unload. Sending on leave (not one aggregate at page exit) keeps the
  visitor's journey in order in User explorer:
  `section_view services 14 s → assessment_cta_click hero → … → generate_lead`.
- Visits under 1 s are not sent (fast scrolling); a visit is capped at
  600 s (a forgotten tab).
- `prefers-reduced-motion` does not affect measurement.
- Known limits: "in view" is not "read"; a killed mobile tab can lose its
  last event; only visitors who accepted Analítica are measured.

## 6 · Reading the journey in GA4

- **User explorer** (Explore → User explorer): one pseudonymous visitor's
  events in time order — the "entered, spent X s here, clicked, filled the
  form, left" story. Subject to GA4 thresholds; anonymous, never a name.
- **Path exploration**: the most common sequences across all visitors.
- **Funnel exploration**: `form_view → form_start → form_step → form_submit
  → generate_lead`, split by device or source.
- **BigQuery export** (free, 1 M events/day): raw events for any analysis
  GA's UI cannot do. Optional, Roberto's call.

## 7 · Out of scope (possible later features)

- Per-lead attribution in the back office (send UTM/source with the form):
  changes the Form Submission API contract.
- Heatmaps / session recordings (Clarity, Hotjar): another vendor and new
  legal text.
- Meta Conversions API (server-side): needs a backend and an access token.
- Confirmed Cal.com bookings: only through Cal.com's own GA4 / Pixel
  integration, if Roberto's plan allows it.

## 8 · Still needed from Roberto

1. ✅ Meta Pixel ID: `1488638740001981` (public). Meta's standard
   install email (2026-11-05) received; no token. Its instructions are NOT
   followed literally: the base code is not pasted in `<head>` (it would
   fire before consent) and the `<noscript>` image pixel is dropped (it
   tracks without JS, so without any possible consent). The base code is
   loaded only after "Publicidad" is accepted. Advanced matching is ON
   since 2026-11-06 (§ 2): manual, in code — only the form's email and
   phone. Events Manager: AUTOMATIC advanced matching stays OFF (it would
   let Meta read other form fields) and automatic (codeless) event setup
   OFF — Roberto's side.
2. ✅ GA4 Measurement ID: `G-RHZC650SQS` (public; web stream "muush.dev",
   Roberto 2026-11-05). Admin setup of § 9 in progress on Roberto's side.
3. Legal text (Roberto, 2026-11-06): the spec_author drafts the missing privacy-notice text (Google Analytics in "Con quién los compartimos", Meta advanced matching, anything this feature makes inaccurate); Roberto approves it at the gate.
4. ✅ Consent expiry: 12 months (Roberto, 2026-11-06).
5. ✅ Design (Roberto, 2026-11-06): no new .pen design; "Analítica" reuses the existing category row pattern; its copy and the banner copy are drafted by the spec_author and approved at the gate.

## 9 · GA4 admin setup (Roberto, in the GA4 UI)

Before the code ships: property time zone Mexico City and currency MXN; web
stream for `https://muush.dev`; enhanced measurement ON for page views
(page loads only: the browser-history option is OFF and saved since 2026-11-07,
because the code sends `page_view` on route changes and both would count
twice), scrolls, outbound clicks, file downloads;
OFF for form interactions, site search and video; data retention 14 months
with "reset on new activity" OFF; Google signals OFF; user-provided data
collection OFF; optional Search Console link. No internal-traffic IP rule
(Roberto, 2026-11-06): he works from changing networks, so the team excludes
itself by rejecting the Analytics category in the consent banner on every
device it uses (incognito + accept only to test). Done in the GA4 UI on
2026-11-06: retention, stream + measurement ID, enhanced measurement,
Signals and user-provided data off, time zone and currency. Key events created ahead of
time: `generate_lead`, `book_call_click`, `contact_click`. (2026-11-05:
this GA4 UI only lists an event once it has been received, so the three are
starred under "Eventos recientes" after the first production events. The
auto-created `qualify_lead` / `close_convert_lead` are not sent by the site.)

After the first events arrive: register the § 4 custom dimensions and the
`section_seconds` metric (plus a calculated metric "average seconds per
section view" = `section_seconds` / event count); build the explorations of
§ 6 (assessment funnel, application funnel, path exploration, section-time
free form).
