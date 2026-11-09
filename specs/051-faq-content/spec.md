# Feature Specification: Preguntas frecuentes (FAQ) with the real questions

**Feature Branch**: `feat/v2-faq-content` (already checked out; no new branch)
**Feature**: 51 `faq_content` (`feature_list.json`)
**Created**: 2026-11-08
**Status**: Ready for the approval gate. OQ-1…OQ-8 answered by Roberto on
2026-11-08 (`open-questions.md` § "Respuestas de Roberto (2026-11-08)").
**Input**: User description: "Replace the 'En construcción 🚧' / 'Under construction 🚧' block of /es/preguntas and /en/faq (feature 46) with the approved FAQ page of Muush 1.0 (handoff preguntas-muush-1.0, approved by Roberto and Clau 2026-11-08): pill, two-tone title, subtitle, five topic tabs, an accordion per topic, 20 Q&A per locale with inline links, a '¿Tienes otra pregunta?' card with a single 'Agenda una llamada' button; desktop two columns, mobile chip carousel; acanalado band at the top; all answers in the prerendered HTML; FAQPage JSON-LD; new meta title and description; llms.txt FAQ entries updated. Both locales. Routes and sitemap unchanged (10 URLs)."

## Sources and provenance

| Source | What it gives | Status |
|---|---|---|
| `Landing Page/handoff/preguntas-muush-1.0/README.md` | Behaviour, 1440 and 390 layout values, background, SEO, header | CONFIRMED (approved design data, Roberto and Clau, 2026-11-08) |
| `…/contenido/preguntas-{es,en}.json` | All copy: meta, header, card, 5 topics, 20 Q&A, inline links | CONFIRMED (approved copy) |
| `…/referencias/*.png` | Visual reference 1440 and 390, ES and EN | CONFIRMED as reference; the JSON wins on text |
| `muush.pen` frames `Preguntas ES/EN · Muush 1.0 · A pestañas · fondo acanalado` and the two mobile ones | Source of truth for visual values | **Not read by the spec_author** (no Pencil MCP in a subagent, rules.md § R32). Every visual value below comes from the README and PNGs. The leader exported the band layer of frames `h3JSJ` (1440 × 600) and `xJCj0` (390 × 300) as PNG (OQ-5) |
| `handoff/animaciones-muush-1.0/README.md` | Shader behaviour rules | CONFIRMED |
| Repository (`app/`, `tests/`, `public/llms.txt`, `specs/046-secondary-pages/`, fix 8c9f79e) | Current Preguntas page, nav model, presets, SEO pins, section framing | CONFIRMED (read 2026-11-08) |

Values marked DERIVED below are arithmetic on confirmed values; nothing is
presented as a measurement of the `.pen`.

## Clarifications

### Session 2026-11-08

Questions in [`open-questions.md`](./open-questions.md); Roberto's answers,
recorded there in writing:

- Q: OQ-1 · Vertical framing: handoff fixed paddings or the site-wide
  centring rule? → A: **B**, the site-wide centring rule of fix 8c9f79e. If
  Roberto dislikes the result when he sees it, the fallback is the handoff's
  values (FR-019).
- Q: OQ-2 · "Preguntas" / "FAQ" in the header? → A: **A**, a fourth item
  after Nosotros (bar `Inicio · Servicios · Nosotros · Preguntas`, centred),
  also in the mobile menu, lit on this page. **Revokes** the feature 43/46
  ruling that Preguntas stays out of the bar and menu "permanently" (FR-021).
- Q: OQ-3 · Where the code lives? → A: **A**, new module `app/features/faq/`;
  Constitution Article I amended PATCH 2.1.4 → 2.1.5 to list it, approved by
  Roberto in writing in his answer. Applied on 2026-11-08 (FR-022).
- Q: OQ-4 · llms.txt copy? → A: **A**, the two drafted lines as written; the
  20 questions are not copied into llms.txt (FR-005).
- Q: OQ-5 · Band poster? → A: exported from the `.pen` by the leader:
  desktop `h3JSJ` 1440 × 600 and mobile `xJCj0` 390 × 300 PNGs; the
  implementer converts them to WebP and replaces `preguntas-acanalado.webp`
  (FR-020).
- Q: OQ-6 · Topic in the URL? → A: **A**, selecting a topic updates the hash
  without scrolling or adding history; the language switch keeps the topic by
  number (FR-013).
- Q: OQ-7 · Without JavaScript? → A: **A**, topic 01 with its first answer
  open (Edge Cases).
- Q: OQ-8 · Measurement? → A: **A + B**: `book_call_click` and
  `contact_click` as drafted, **plus** one new event when a question is opened
  (open only, never on close), with the topic and the question as parameters;
  the measurement plan and catalogue are updated and Roberto registers the new
  GA4 dimensions (FR-023, FR-024).

### Decisions taken in this spec

- **D1 · FAQPage structured data: yes.** Both documents carry a `FAQPage`
  JSON-LD node with the 20 questions and answers of their own locale
  (`inLanguage` es-MX / en-US), built from the same copy the page renders.
  The README asks for it, the answers are visible on the page (Google's
  condition for FAQ markup), and it helps AI assistants even though Google
  rarely shows the FAQ rich result for commercial sites. This **supersedes
  feature 46 FR-038** ("a plain `WebPage`, never `FAQPage`"), which existed
  only because the page had no questions. Both locales stay structurally
  identical (same node types, same count of questions).
- **D2 · llms.txt: update the two FAQ entries, do not copy the 20 Q&A.**
  The file is an index in the llmstxt.org shape (every section is a link
  list, enforced by `tests/seo-output.test.ts`). The two entries drop
  "(under construction)" / "(en construcción)" and describe the five topics;
  the questions and answers reach assistants through the page's HTML and its
  FAQPage node. Text approved by Roberto (OQ-4 = A).
- **D3 · Answers are in the HTML, always.** All 5 topic panels and all 20
  answers are in the prerendered document of each locale, collapsed ones
  included; nothing is fetched or created on click.
- **D4 · Meta copy from the approved JSON.** Title "Preguntas frecuentes ·
  muush" / "Frequently asked questions · muush"; description from
  `meta.description`. Both also feed `og:title` / `og:description`. This
  replaces the feature 46 "Mientras tanto…" / "In the meantime…" text.
- **D5 · Inline link destinations resolve through the route map**, not as
  literal strings: "Aviso de privacidad" / "Privacy notice" → the privacy
  route of the page's locale; "Nosotros" / "About" → the about route plus the
  `trabaja-con-muush` section anchor. The JSON URLs (`/es/privacidad`,
  `/en/privacy`, `/es/nosotros#trabaja-con-muush`,
  `/en/about#trabaja-con-muush`) are what they must resolve to.
- **D6 · The question-open event (OQ-8 B).** Name `faq_question_open`, in the
  `<object>_<action>` style of the catalogue (`book_call_click`,
  `language_change`, `section_view`). Parameters, both closed (no free text,
  no PII, nothing the visitor typed):
  - `faq_topic`: a locale-neutral topic id, one of `assessment`, `pricing`,
    `process`, `delivery`, `work_with_muush` (snake_case like the catalogue's
    `section` ids; the same value whether the visitor reads ES or EN, so one
    GA4 row per topic, not two).
  - `faq_question`: the question's number in page order, an integer 1–20,
    identical in both locales (question 19 is "¿Cuándo me van a contactar?" /
    "When will you contact me?").
  GA4 only; Meta does not receive it. Chosen because Meta today receives only
  the three conversions (`Schedule`, `Contact`, `Lead`, tracking plan § 4,
  `META_EVENT_BY_NAME`) and every other UI event (`language_change`,
  `section_view`, `form_*`) is GA4 only; reading a question is not a
  conversion. Not a GA4 key event. INFERRED default; Roberto may change it at
  the gate.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A prospect finds the answer to their question (Priority: P1)

A prospect lands on `/es/preguntas` or `/en/faq` (from the header, the
footer, a search result or a shared link). They see the page title, the five
topics and the first topic's questions with the first one already open. They
pick a topic, open a question, read the answer.

**Why this priority**: it is the page's whole purpose and the acceptance of
feature 51.

**Independent Test**: open both URLs in a browser at 1440 and 390; every
topic shows its own questions; every question opens its answer.

**Acceptance Scenarios**:

1. **Given** a fresh visit with no fragment, **When** the page loads,
   **Then** topic 01 is selected and its first question is open; the other
   questions are closed.
2. **Given** any topic, **When** the visitor selects another topic,
   **Then** only that topic's questions show, with its first question open
   (FR-012).
3. **Given** a topic with one question open, **When** the visitor opens
   another question of the same topic, **Then** the first one closes (one
   open at a time per topic).
4. **Given** an open question, **When** the visitor activates it again,
   **Then** it closes.
5. **Given** the page, **When** read in ES and in EN, **Then** every string
   matches the approved JSON of that locale and "En construcción 🚧" /
   "Under construction 🚧" appears nowhere.
6. **Given** a visitor who accepted Analítica, **When** they open a closed
   question, **Then** one `faq_question_open` event with its topic and
   number is sent; closing it, or the automatic opening of a first question,
   sends nothing (FR-024).

---

### User Story 2 - Someone shares a link to one topic (Priority: P2)

Roberto sends a client `/es/preguntas#precios`. The page opens with "Precios
y pagos" selected.

**Why this priority**: the README asks for topic anchors so a topic can be
sent directly.

**Independent Test**: open each of the 10 topic URLs (5 per locale) and check
the selected tab.

**Acceptance Scenarios**:

1. **Given** `/es/preguntas#precios` (or `/en/faq#pricing`), **When** the
   page loads, **Then** that topic is selected and its first question is
   open.
2. **Given** a fragment that names no topic (`#nada`), **When** the page
   loads, **Then** topic 01 is selected, as with no fragment.
3. **Given** a topic selected by click, **When** the visitor copies the URL,
   **Then** the URL names that topic, the page did not scroll, and the back
   button does not step through topics (FR-013).
4. **Given** `/es/preguntas#precios`, **When** the visitor switches to
   English, **Then** they land on `/en/faq#pricing` with "Pricing and
   payments" selected (FR-013).

---

### User Story 3 - A keyboard or screen-reader user browses the topics (Priority: P2)

**Acceptance Scenarios**:

1. **Given** focus on a topic tab, **When** the user presses Left/Right
   arrow, **Then** focus and selection move to the previous/next topic,
   wrapping at the ends; Home/End go to the first/last.
2. **Given** the tab list, **Then** it is announced as a tab list, each tab
   with its selected state, and the questions area as the tab panel labelled
   by its tab.
3. **Given** a question button, **Then** it announces expanded/collapsed and
   controls its answer region.
4. **Given** the mobile chip carousel, **When** a chip is selected by
   keyboard or touch, **Then** it scrolls into view.

---

### User Story 4 - A visitor with another question gets in touch (Priority: P3)

**Acceptance Scenarios**:

1. **Given** the card "¿Tienes otra pregunta?" / "Have another question?",
   **Then** it holds the text with `support@muush.dev` as a mail link and
   exactly one button, "Agenda una llamada" / "Book a call", opening
   `https://cal.com/muush/intro-call` in a new tab. There is no "Diagnóstico
   gratis" button on the card.
2. **Given** question 19 ("¿Cuándo me van a contactar?" / "When will you
   contact me?"), **Then** `support@muush.dev` in its answer is a mail link.

---

### User Story 5 - Search engines and AI assistants read the page (Priority: P2)

**Acceptance Scenarios**:

1. **Given** the generated `es/preguntas/index.html` and `en/faq/index.html`,
   **Then** each contains the text of all 20 answers of its locale.
2. **Given** each document, **Then** it carries one FAQPage node with 20
   Question/Answer pairs equal to the page's copy, in its own language.
3. **Given** each document, **Then** its title and description are the
   approved meta copy, and canonical, hreflang, no-noindex and the sitemap
   entry are as today.
4. **Given** `llms.txt`, **Then** its FAQ entries are the approved text and it
   still links exactly the 10 sitemap URLs.

---

### User Story 6 - Any visitor finds Preguntas from the header (Priority: P2)

**Acceptance Scenarios**:

1. **Given** any page at ≥ 1024 px, **When** the visitor reads the header,
   **Then** the centred link bar reads `Inicio · Servicios · Nosotros ·
   Preguntas` (EN `Home · Services · About · FAQ`).
2. **Given** the mobile menu open on any page, **Then** it lists the same
   four items in the same order.
3. **Given** `/es/preguntas` or `/en/faq` (with or without a topic hash),
   **Then** "Preguntas" / "FAQ" is the lit (current-page) item and no other
   bar item is lit; on every other page it is not lit.

### Edge Cases

- **No JavaScript**: the prerendered document shows topic 01 with its first
  answer open; the other topics' panels are in the HTML but not reachable
  without scripts (OQ-7 = A).
- **Language switch from a topic**: switching ES ↔ EN keeps the same topic
  by its number (`#precios` → `#pricing`, `#trabaja-con-muush` →
  `#work-with-muush`). With no topic hash (or an unknown one) the switch
  behaves as today. Today the switch drops the fragment.
- **Reduced motion**: the band shows one still frame; opening/closing and
  tab changes have no animated transition beyond what the rest of the site
  allows under reduced motion.
- **No WebGL / shader failure**: the band's poster shows (the image exported
  from the `.pen`, FR-020).
- **Content taller than the viewport** (1440 × 900 and 390 × 844 both):
  centring has no room to act; the content starts at the shared top framing
  (header + air) and the title may sit over the light band (FR-019, accepted
  by Roberto under OQ-1 = B).
- **Long EN title**: "Frequently asked" at the 56 px desktop size is wider
  than the 420 px left column (≈450 px in the reference PNG); it may run into
  the 72 px gap as drawn, never under the right column. DERIVED from the PNG.
- **Topic with fewer questions** (04 has 3): the right column is shorter; the
  layout does not jump horizontally; no fixed height.
- **Widths between the anchors (360, 768, 1024, 1280, 1920)**: no horizontal
  page scroll (the chip carousel scrolls inside itself), no clipped text, no
  overlap. The two-column layout starts at the site's desktop breakpoint
  (1024 px). The four-item link bar, the logo and the header's end group fit
  at 1024 without overlap.
- **`@` in copy**: `support@muush.dev` inside locale strings must not break
  message compilation (rules.md § R26).
- **Repeated opens**: opening, closing and opening the same question again
  sends two `faq_question_open` events (no de-duplication); switching topic
  sends none.

## Requirements *(mandatory)*

### Functional Requirements

#### Route, SEO and indexing

- **FR-001**: Preguntas MUST keep its routes `/es/preguntas` ↔ `/en/faq`,
  its language-toggle mapping, canonical, hreflang alternates, no `noindex`
  and its sitemap entries. The sitemap MUST still list exactly 10 URLs.
- **FR-002**: The document title, meta description, `og:title` and
  `og:description` MUST be the approved `meta.title` / `meta.description`
  of each locale (D4). No "Mientras tanto" / "In the meantime" anywhere.
- **FR-003**: Each document MUST carry structured data typed `FAQPage`
  (D1) whose `mainEntity` lists the 20 questions of its locale in page
  order, each with its answer text, and whose language is es-MX / en-US.
  The two locales MUST be structurally identical. The rest of the site's
  graph (WebSite, Organization, the page's ReadAction) is unchanged.
- **FR-004**: All 20 questions and all 20 answers of a locale MUST be in
  that locale's prerendered HTML, whether their topic is selected or their
  answer is open (D3).
- **FR-005**: `llms.txt` MUST replace the two FAQ entry descriptions with
  the approved text (OQ-4 = A; exact text in `contracts/llms-txt.md`):
  EN `frequently asked questions about the free assessment, pricing and
  payments, process and timeline, delivery and ownership, and working with
  muush.`; ES `preguntas frecuentes sobre el diagnóstico gratis, precios y
  pagos, proceso y tiempos, entrega y propiedad, y cómo trabajar con muush.`
  It MUST keep linking exactly the 10 sitemap URLs in the llmstxt.org shape
  and MUST NOT include the questions or answers (D2).

#### Content

- **FR-006**: Every visible string MUST come from the locale files, with
  ES and EN keys in parity, and MUST match the approved JSON of its locale:
  pill, two-line title (first line Blanco, second Gris 400), subtitle,
  5 topics (number + title), 20 questions and answers, the card title, text
  and button label.
- **FR-007**: Inline links: "Aviso de privacidad" / "Privacy notice" in the
  confidentiality answer and "Nosotros" / "About" in the talent-pool answer
  MUST be links inside the answer text (D5). `support@muush.dev` MUST be a
  `mailto:` link in the card text and in question 19's answer, in both
  locales.
- **FR-008**: The card MUST have exactly one action, "Agenda una llamada" /
  "Book a call", in the primary button style, to
  `https://cal.com/muush/intro-call` in a new tab. The "Diagnóstico gratis"
  button of feature 46 is removed from this page (the header CTA remains).
- **FR-009**: The "En construcción 🚧" / "Under construction 🚧" block and
  its two buttons MUST be gone from this page. The 404 keeps its own block
  unchanged.

#### Topics (tabs)

- **FR-010**: The five topics MUST behave as tabs: one tab list, one tab per
  topic with its selected state, and one panel showing only the selected
  topic's questions. Left/Right arrows move between tabs (wrapping);
  Home/End go to the first/last; only the selected tab is in the tab order.
- **FR-011**: Each topic's `id` from the JSON (ES `diagnostico`, `precios`,
  `proceso`, `entrega`, `trabaja-con-muush`; EN `assessment`, `pricing`,
  `process`, `delivery`, `work-with-muush`) MUST work as a fragment: loading
  the page with it selects that topic. An unknown or empty fragment selects
  topic 01.
- **FR-012**: On entry (no fragment or a valid one) the selected topic's
  first question MUST be open. When the visitor switches topic, the newly
  selected topic shows its first question open, matching the entry state.
  ASSUMPTION; the README only defines the entry state.
- **FR-013**: Selecting a topic MUST replace the URL fragment with that
  topic's id of the current locale, without scrolling and without adding a
  history entry, and without counting as a new page view. The language
  switch MUST carry the selected topic over by its number (same topic, other
  locale's id). (OQ-6 = A.)
- **FR-014**: Below 1024 px the tabs MUST be a horizontal chip carousel
  with scroll snap, the next chip peeking at the right edge (no right
  padding), and the selected chip scrolled into view when selected.

#### Questions (accordion)

- **FR-015**: Each question MUST be a button that toggles its answer,
  exposing its expanded state and the answer region it controls. At most one
  question per topic is open; opening one closes the other; activating the
  open one closes it.
- **FR-016**: The question's round button shows a plus icon when closed and
  an x icon when open (lucide `plus` / `x`).
- **FR-017**: Closed and open questions use the two looks of the README
  (closed: Negro 900 at 60 % with a Blanco 8 % border; open: Carbón 800 at
  60 % with the active-tab gradient border).

#### Layout and look

- **FR-018**: At 1440 and 390 the page MUST match the approved design (the
  values in **Design values** below) in everything but the outer vertical
  framing, which FR-019 governs; at other widths sizes and spacing may adapt
  (Constitution Article VII, responsive anchors).
- **FR-019**: The page block MUST use the site-wide section framing of fix
  8c9f79e, exactly as the other first blocks (home and Nosotros heroes, the
  404) do today: at least one large viewport tall (`portada-alto`), top
  padding = header offset + section air (`seccion-arriba`), bottom padding =
  section air (`seccion-aire`), content centred vertically in the space
  below the header (OQ-1 = B). The handoff's outer paddings (desktop `300`
  top / `200` bottom; mobile `200` above the header block and `64` below the
  card) are **not** used, and no page-specific top/bottom framing token is
  added. The inner spacing between the page's own parts stays as drawn
  (chips `28` above, questions `20` above, card section `32` above, desktop
  right column `68` lower than the left). **Fallback**: if Roberto dislikes
  the result when he reviews it, the framing switches to the handoff values
  (fluid tokens, top 200 → 300 and bottom 64 → 200, no centring); that
  switch is a follow-up change, not built in this feature.
- **FR-020**: The background MUST be the vidrio acanalado band of the
  README: a light band, red to steel, full width, desktop 1440 × 600 and
  mobile 390 × 300, with the README's uniforms (below); the rest of the
  page is Negro 950. The band stays where the design puts it **relative to
  the top of the page** (desktop top edge at y = 84, mobile at y = 68,
  fluid between), independent of where the centred content lands; with
  FR-019 the title may therefore sit over the band instead of below it,
  which Roberto accepted (OQ-1 = B). Its poster (no WebGL, while loading)
  MUST be the `.pen` export of frame `h3JSJ` (1440 × 600) converted to WebP,
  replacing `preguntas-acanalado.webp`. The preset system holds one poster
  per section (CONFIRMED, `backgroundPresets.ts`: "The poster stays one per
  section"), so the mobile export `xJCj0` is not wired; below 1024 the
  desktop poster covers the band with `object-cover`, as every other section
  does. The band keeps every behaviour rule of the animations handoff:
  paused off screen and in a hidden tab, one still frame under reduced
  motion, 1x resolution on phones (max 1.5x desktop), poster without WebGL,
  no pointer events, hidden from assistive technology.
- **FR-021**: The header link bar and the mobile menu MUST list four items,
  `Inicio · Servicios · Nosotros · Preguntas` (EN `Home · Services · About ·
  FAQ`), the new item last and resolved by route name (`/es/preguntas` ↔
  `/en/faq`); the link bar stays centred in the header. On Preguntas (any
  topic hash) the new item MUST be the current page and no other item lit.
  This revokes the "Preguntas permanently out of the bar and menu" ruling of
  features 43 and 46 (OQ-2 = A; supersedes spec 046 FR-029 and FR-032 and
  the corresponding comment in `shell/data/navigation.ts`). The header CTA
  "Diagnóstico gratis" stays. The footer is unchanged and keeps its
  Preguntas links.
- **FR-022**: The FAQ code MUST live in a new feature module
  `app/features/faq/` (ui/logic/data + barrel), as listed in Constitution
  Article I since amendment 2.1.5 (2026-11-08, OQ-3 = A). The feature 46
  placeholder in `shell` (`shell/data/faq.ts`, `useFaqContent`, the
  StatusSection `faq` preset) is removed.

#### Measurement

- **FR-023**: The card button MUST keep the existing `book_call_click`
  event with `cta_location: faq`. The two mail links (card and question 19)
  send `contact_click` with `channel: email` and `cta_location: faq`. The
  removed "Diagnóstico gratis" button no longer sends
  `assessment_cta_click` from `faq`. Tab selection sends no event. (OQ-8 A.)
- **FR-024**: Opening a closed question by activating its button (pointer,
  Enter or Space) MUST send one `faq_question_open` event (D6) with
  `faq_topic` (locale-neutral topic id) and `faq_question` (1–20). It MUST
  NOT be sent on close, nor for the first question opened automatically on
  entry, from a hash, or on a topic switch. The event joins the closed
  catalogue (`app/shared/data/trackingEvents.ts`); GA4 receives it, Meta
  does not. Its parameter values are fixed ids and a number only. (OQ-8 B.)
- **FR-025**: Every event still goes out only with consent (feature 49): no
  sink subscribed, no network.
- **FR-026**: The measurement plan `docs/harness/progress/tracking-plan-49.md`
  MUST list `faq_question_open` in § 4 with its parameters (GA4 ✅, Meta —),
  add `faq_topic` and `faq_question` to the custom dimensions to register,
  and correct the `faq` CTA list. Roberto registers in GA4 (Admin → Custom
  definitions) two **event-scoped custom dimensions**: `faq_topic` (event
  parameter `faq_topic`) and `faq_question` (event parameter
  `faq_question`). No custom metric, no key event.

### Design values (from the handoff README; `.pen` not read)

All colours map to existing tokens (Blanco `#F4F4F2`, Gris 400 `#8C8C8A`,
Negro 900 `#0B0B0B`, Carbón 800 `#1A1A1A`, Red muush 500 `#E5352F`,
Negro 950 `#050505`); new sizes become tokens, never literals.

**Desktop (1440)**
- Two columns, gap 72. Left column 420 wide, gap 36. Right column fills the
  rest, starts 68 px lower than the left column, gap 12.
- Pill "Preguntas" / "FAQ" (the shared Pill, with the shared pill-air rule
  above a heading).
- Title Poppins 500, 56 px, tracking −1.96 px, line height 1.1, lines
  Blanco / Gris 400. Subtitle Instrument Sans 18, line height 1.5, Blanco
  70 %.
- Tabs, gap 8: padding 16 × 18, radius 14, backdrop blur 18. Active:
  Carbón 800 at 60 %, vertical gradient border Red muush 500 at 33 % →
  Blanco 6 %; number Red muush 500; name and chevron Blanco. Inactive:
  Negro 900 at 40 %, border Blanco 6 %; number, name and chevron Gris 400.
  Number Instrument Sans 13/600, name 16/500, lucide `chevron-right` 18.
- Card: Negro 900 at 60 %, radius 22, border Blanco 8 %, blur 24,
  padding 28, gap 14. Icon lucide `message-circle` 20 in a 44 box, radius
  14, Carbón 800, border Blanco 12 %. Title Poppins 500, 24, tracking −0.6.
  Text Instrument Sans 15, line height 1.5, Blanco 70 %. One primary button.
- Question: radius 18, padding 24 × 28, gap 14, blur 18. Text Instrument
  Sans 19/500, line height 1.35, Blanco. Round button 34, border Blanco
  15 %, icon 16. Answer Instrument Sans 16, line height 1.6, Blanco 70 %.
- Horizontal section padding 80 as drawn (the site gutter). The drawn
  vertical `300` / `200` is replaced by the framing of FR-019.

**Mobile (390)**
- Header block: horizontal padding 24 (gutter), gap 16; the drawn `200` top
  is replaced by FR-019. Title Poppins 500, 34 px, tracking −1.02.
  Subtitle 16.
- Chip carousel: padding `28 0 0 24`, gap 8. Chips padding 10 × 14, full
  radius; number 12/600, name 14/500; desktop colours.
- Questions: padding `20 24 0 24`, gap 10. Radius 16, padding 18. Question
  16/500, button 30 with a 14 icon, answer 15 with line height 1.6.
- Card section: padding `32 24` above and at the sides; the drawn `64`
  bottom is replaced by FR-019. Card radius 20, padding 24, gap 12, icon
  box 40, title 22, full-width button.

**Band (`acanalado`)**
- Position: top 84 (1440) / 68 (390) from the top of the page, height
  600 / 300, full width (FR-020).
- Desktop uniforms: `u_flip 1, u_y0 0.2, u_y1 0.5, u_th 0.24, u_right 0.6,
  u_tx 0.5, u_ty 0.5, u_trx 0.62, u_try 0.42, u_tdark 0, u_fadeT 0.06,
  u_fadeB 0.3`.
- Mobile (below 1024, the site's compact-uniform rule): the same plus
  `u_ribs 18` and `u_th 0.26`.
- These replace the feature 46 `faq` preset values.

### Key Entities

- **FAQ page content (per locale)**: meta (title, description); header
  (pill, title in two lines, subtitle); card (title, text with the email,
  button label, booking URL); ordered list of 5 topics.
- **Topic**: fragment id (per locale), locale-neutral tracking id, number
  ("01"…"05"), title, ordered questions.
- **Question**: number 1–20 in page order, question text, answer text,
  optional inline links (link text that appears verbatim in the answer +
  destination route), optional email link.
- **Question-open event**: `faq_question_open { faq_topic, faq_question }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % of the 20 approved questions and answers of each locale
  appear on its page, word for word, and in its generated HTML.
- **SC-002**: Each of the 10 topic links (5 per locale) opens the page with
  that topic selected; switching language from any of them keeps the topic.
- **SC-003**: A keyboard-only user can reach every topic and open every
  answer without a pointer.
- **SC-004**: At 390 and 1440 the page matches the approved references
  except for the vertical framing (FR-019); at 360, 768, 1024, 1280 and 1920
  there is no horizontal page scroll, clipped text or overlap, header
  included.
- **SC-005**: The structured-data validator reads one FAQPage with 20
  questions on each of the two pages, with no errors.
- **SC-006**: The sitemap still lists exactly 10 URLs; `llms.txt` equals
  the approved text and links the same 10.
- **SC-007**: The project quality gates pass (`pnpm check`, `pnpm
  typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`).
- **SC-008**: With Analítica accepted, opening each of the 20 questions once
  by hand produces exactly 20 `faq_question_open` hits with 20 distinct
  `faq_question` values and the right `faq_topic`; closing produces none;
  Meta receives none.

## Assumptions

- The JSON and README are the approved copy and design; where a PNG and the
  JSON disagree on text, the JSON wins (README).
- "Header: solo el isotipo" (README) is today's desktop header; the only
  header change is the fourth nav item (FR-021).
- The `faq` tracking location and the call-booking URL already exist and
  are reused.
- The 404 and its tests are untouched; only the Preguntas use of the shared
  status block goes away.
- No version bump in this feature.
- After deploy, Roberto re-requests indexing of the two URLs in Search
  Console (feature 51 description) and registers the two GA4 dimensions
  (FR-026); neither is part of the build.
- The poster PNGs live in a session scratchpad (temporary). If they are gone
  when the implementer starts, the leader re-exports them; nobody renders a
  substitute.

## Supersedes

- Spec 046 FR-029 (bar and menu keep exactly Inicio · Servicios · Nosotros),
  FR-032 (no bar item lit on Preguntas), FR-038 (plain WebPage, never
  FAQPage), User Story 3 scenario 4 (no Preguntas item in the bar or menu),
  and its Context line "The header link bar stays Inicio · Servicios ·
  Nosotros".
- The "permanently" ruling recorded in `app/features/shell/data/navigation.ts`
  and the tests that pin it (listed in `tasks.md` T036–T037).
- The StatusSection `faq` preset framing of fix 8c9f79e is replaced by the
  FAQ page block, which keeps the same framing rule (FR-019).

## Out of scope

- Changing routes, the sitemap, the footer, the 404, or the legal pages.
- Search inside the FAQ, analytics events for tab selection, a separate
  `llms-full.txt`, a mobile-specific band poster.
- Editing `docs/business/` (human-only).
