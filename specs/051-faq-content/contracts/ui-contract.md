# UI contract · Feature 51

Components under `app/features/faq/ui/` (Constitution 2.1.5, OQ-3 = A). Each is
presentational (props in, events out), under 200 lines, with a component
test and a story in ES and EN at 390 and 1440 (Article X).

| Component | Props | Emits | Notes |
|---|---|---|---|
| `FaqSection` | `topics: ResolvedFaqTopic[]`, `card: ResolvedFaqCard`, `heading`, `pill`, `subtitle`, `tabsLabel` | — | Page block with the site-wide first-block framing (`relative isolate flex min-h-portada-alto flex-col pt-seccion-arriba pb-seccion-aire`, spec FR-019) holding the band and a `relative z-10 flex flex-1 flex-col justify-center` content layer: two columns (≥1024) / stacked (<1024). Wires `useFaqTopics` and `useFaqAccordion` (the latter emits `faq_question_open` on a user open only). The page's only `h1`. |
| `FaqBand` | — | — | Absolutely positioned box measured from the block's top edge (= page top; top 68 → 84, height 300 → 600, full width), a sibling of the content layer so centring never moves it; hosts `ShaderBackground preset="faq"`. `aria-hidden`. |
| `FaqTopicTabs` | `topics`, `selected: number`, `label`, `panelId`, `idPrefix` | `select(index)` | `role="tablist"` (aria-label), `role="tab"` buttons with `aria-selected`, `aria-controls`, roving `tabindex`. Number, title, `chevron-right` (desktop). `<1024`: horizontal chips, scroll snap, selected chip `scrollIntoView({ inline: 'nearest', block: 'nearest' })` (instant under reduced motion). Keydown handled by the parent's composable. |
| `FaqQuestion` | `question`, `answerKey`, `answerParams`, `links`, `email?`, `open: boolean`, `id` | `toggle` (the parent's composable decides whether it is an open and emits the event; the component never emits tracking) | `<h3>` wrapping a `<button aria-expanded aria-controls>`; answer region `role="region"` `aria-labelledby`, `hidden` when closed but always rendered. Icon `plus` closed / `x` open in the round button. Answer through `<i18n-t>` with slots for `{privacy}`, `{about}` (NuxtLink) and `{email}` (`<a href="mailto:…">` with the `contact_click` track attrs). |
| `FaqCard` | `card` | — | Icon box (`message-circle`), title (`h2`), text with `{email}` mail link, one `PrimaryButton` with `href` = booking URL, `target="_blank" rel="noopener noreferrer"`, track attrs `book_call_click / faq`. Full width below 1024. |

Heading levels: `h1` the page title, `h2` the card title, `h3` each
question. No extra heading per panel: its tab names it.

Panels: one `role="tabpanel"` per topic, `id` = `<idPrefix>-panel-<anchor>`,
`aria-labelledby` its tab, inactive ones `hidden`, `tabindex="0"` is not set
(panels start with focusable buttons).

Tokens: every size in the spec's Design values becomes a `global.css`
token (fluid between 390 and 1440 where both anchors exist); no hex, px or
arbitrary Tailwind values in components (`tests/token-literals.test.ts`
covers the new files).

## Shell changes (OQ-2 = A)

- `NAV_ITEMS` / `MENU_ITEMS`: four items, `Inicio · Servicios · Nosotros ·
  Preguntas` (EN `Home · Services · About · FAQ`), the last a route item
  (`name: 'faq'`). `NavLinkBar` and `MobileMenu` render it like Nosotros;
  `aria-current="page"` on `/es/preguntas` and `/en/faq` whatever the hash.
  No new component.
- `LanguageToggle` / `resolveLocaleDestination`: on the FAQ route, the
  destination carries the counterpart topic anchor (`#precios` ↔
  `#pricing`); every other route unchanged.
