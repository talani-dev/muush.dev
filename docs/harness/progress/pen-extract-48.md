# Feature 48 · Values extracted from `muush.pen` by the leader

> Extracted 2026-11-05. Subagents cannot open the `.pen`. If a value is
> missing here or in `pen-48/`, ask the leader — never fall back to
> `docs/business/` for a visual value (rules.md § R32).

## 0 · Sources

| File | What it is |
|---|---|
| `pen-48/*.html` | Leader's HTML+CSS export of every frame (`data-pencil-id` / `data-pencil-name` on each node). **Source of every measurement, colour, font size, line height, radius and gap.** Absolute positions are canvas positions, not layout intent — read them as flex/stack structure. `RASTERIZED-SHADER-BACKGROUND` replaces the 404 backdrop shader image (irrelevant here). |
| `pen-48/png/*.png` | 1× renders: `rhgZ2` privacy ES desktop, `XaxDq` privacy ES mobile, `dKb9C` terms ES desktop, `Dq04d` banner ES desktop, `SYQea` banner ES mobile, `V4sL7G` preferences ES desktop, `ev0kn` preferences ES mobile. |
| `legal-copy-48.md` | Every text node of the legal pages, banner and preferences, ES and EN, in document order. **This is the final legal text** (Roberto, 2026-11-05). Copy it verbatim; the only allowed changes are § 2. |

Map every hex to an existing v2 token (features 42–46: `#F4F4F2` Blanco,
`#8C8C8A` Gris 400, `#E5352F` Red muush 500, `#F4F4F2B3` Blanco 70 %,
`#F4F4F21F` Blanco 12 %, `#0B0B0BB3` glass panel, `#1A1A1A` field fill,
`#050505` page, …). New in these frames: `#2C2C2C` (section/table rules),
`#F4F4F2D9`, `#F4F4F233`, `#0B0B0BF2` (banner surface), `#1A1A1A8C`
(preferences button fill), `#0B0B0B73`. Add a token only when none fits.

Header and footer are the feature 43 shell. The `.pen` nav still shows a
"Preguntas" link — **ignore it** (link bar is fixed as Inicio · Servicios ·
Nosotros). The banner/preferences frames are drawn over the 404 page only as
a backdrop; the banner and modal are global, not part of the 404.

## 1 · Frames

| Piece | Desktop ES / EN | Mobile ES / EN | Export |
|---|---|---|---|
| Aviso de privacidad | `rhgZ2` / `XlC2V` | `XaxDq` / `n76gJ3` | `priv-{es,en}-{d,m}.html` |
| Términos y condiciones | `dKb9C` / `K1aJhO` | `VvK17` / `T6ayk` | `terms-{es,en}-{d,m}.html` |
| Banner de cookies | `Dq04d` / `TEElj` | `SYQea` / `qnVrY` | `cookie-{es,en}-{d,m}.html` |
| Preferencias de cookies (modal) | `V4sL7G` / `S4ZU4` | `ev0kn` / `Q3oIYc` | `prefs-{es,en}-{d,m}.html` |

## 2 · Placeholder substitutions (Roberto, 2026-11-05) — the ONLY text edits

| In the `.pen` | ES | EN |
|---|---|---|
| `[fecha de publicación]` / `[publication date]` (both pages) | `5 de noviembre de 2026` | `November 5, 2026` |
| `[servicio de envío de correo]` / `[email delivery service]` (privacy › Con quién los compartimos) | `Amazon SES (envío de correos)` | `Amazon SES (email delivery)` |
| `[plazo de cada herramienta]` / `[period set by each tool]` (privacy › Cuánto tiempo los guardamos) | `hasta 14 meses` | `up to 14 months` |
| Privacy › Cookies y píxeles, first paragraph: "también usa Meta Pixel para medir…" / "it also uses Meta Pixel to measure…" | `también usa Meta Pixel y Google Analytics para medir visitas y anuncios.` | `it also uses Meta Pixel and Google Analytics to measure visits and ads.` |

The fourth row: Clau removed the `[y otras herramientas que se confirmen]`
marker from the `.pen` while it was being read; Roberto ruled that Google
Analytics is named anyway. No other wording changes, in any locale.

## 3 · Layout summary (details in `pen-48/`)

### Legal pages, desktop (1440)
- Article column 680 wide, starting at x 380, top 168. Stack gap 64.
- Header: two-tone heading ("Aviso de" Blanco / "privacidad." Gris 400 —
  same pattern as features 44–46), then "Última actualización: …".
- Each section: 1 px top rule `#2C2C2C`, padding-top 40, gap 18; title
  (Poppins) + body (Instrument Sans 17). Lists: gap 10, red bullet
  (privacy ARCO list is numbered in red).
- Privacy "Qué datos recabamos" is a two-column table: rows with bottom
  rule `#2C2C2C`, padding 14 / 0, gap 24 (label column bold, data column).
- Privacy "Cookies y píxeles" ends with the pill button "Cambiar mis
  preferencias" (fill `#1A1A1A8C`, radius 999, padding 12 / 20).
- **Índice** (table of contents): 220 wide at x 80, label "En esta página",
  one link per section, gap 14. The active entry carries a 6 px red dot and
  Blanco text; the rest Gris 400. It is sticky beside the article and the
  active entry follows the section in view.

### Legal pages, mobile (390)
- Article 342 wide (24 gutters), top 112, stack gap 40; sections padding-top
  28, gap 14.
- Índice becomes a collapsed disclosure "En esta página" with a chevron,
  directly under the header (see `XaxDq.png`); opening it lists the same
  links.
- The data table becomes stacked cards (label + data), see `XaxDq.png`.

### Cookie banner
- Desktop: full-width bar inside the 80 gutters (1280 wide), bottom of the
  viewport, surface `#0B0B0BF2`, radius 22, padding 24, gap 32. Left: title
  "Usamos cookies" + text; right: "Personalizar" (text button) · "Rechazar
  todo" · "Aceptar todo" (gap 12 / 14).
- Mobile: card 342 wide, 24 from the edges, padding 18, gap 12; two buttons
  side by side, "Personalizar" centred below.

### Preferences modal
- Centred dialog on desktop, bottom sheet on mobile (see `V4sL7G.png`,
  `ev0kn.png`). Header: title "Tus preferencias de cookies" + close button
  36×36 radius 12. Intro text with "aviso de privacidad" as a link to the
  privacy page.
- Categories separated by rules: "Necesarias" with the static pill
  "Siempre activas"; "Publicidad" (Meta Pixel) with a switch, off by default.
- Actions: "Rechazar todo" · "Aceptar todo" (secondary) and "Guardar mi
  elección" (primary red, full width on mobile).
- **Pending from Clau:** an "Analítica" (Google Analytics) category with
  its own switch. Build categories as data so it is a one-entry addition;
  if it is not in the `.pen` when 48 is implemented, it ships in feature 49.

## 4 · Behaviour (Roberto 2026-11-05 + leader defaults)

Decided by Roberto:
- Routes `/privacidad` · `/privacy` and `/terminos` · `/terms`; both indexed
  (no noindex, in the sitemap, canonical + hreflang like every page).
- The footer legal links ("Aviso de privacidad", "Términos y condiciones")
  and the "aviso de privacidad" words in the form consent checkbox
  (feature 45) link to the privacy page.
- Feature 48 builds the banner + preferences and stores the visitor's
  choice. **No tracking script is loaded by 48** — Meta Pixel and Google
  Analytics are feature 49, which will read the stored choice.

Leader defaults (report back if any is a problem):
- The choice lives in `localStorage` as a small versioned record
  (categories + timestamp + version). Expose it through one composable
  (e.g. `useCookieConsent`) that feature 49 can consume.
- The banner shows on every page until a choice is stored; it is rendered
  client-only so a returning visitor never sees it flash on prerendered
  HTML. "Personalizar" opens the modal.
- Modal: close (X / Escape / backdrop) dismisses without saving — the
  banner stays if there is still no choice. "Rechazar todo", "Aceptar todo"
  and "Guardar mi elección" save and close both. Focus trap, focus returns
  to the trigger, `role="dialog"` + `aria-modal`, the switch is a real
  `role="switch"` control.
- "Cambiar mis preferencias" on the privacy page opens the same modal with
  the stored choice pre-filled.
- The consent-checkbox link opens the privacy page in a new tab
  (`rel="noopener"`) so a half-filled form is not lost; footer links
  navigate normally.
- Reduced motion: no slide/fade on banner or modal.
