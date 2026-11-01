# Feature 42 · Values extracted from `muush.pen` by the leader

> Extracted 2026-10-31 from the Kit `Cs3AJ`, the reusable components and the
> production frames `Tng1t` (desktop ES) and `V2s7T` (mobile ES). Subagents
> cannot open the `.pen`. If a value is missing here, ask the leader.
> The `.pen` wins over `docs/handoff/muush-1.0/componentes/tokens.css` (R32).
>
> Naming (2026-11-01, approved by Roberto): the `m1-*` names below are the
> `.pen`'s and the handoff's own. The site drops the prefix (`m1-negro-950`
> → `--negro-950`, `bg-negro-950`), and its components carry no `M1`
> (`M1 · Pill` → `Pill.vue`).

## 1 · Palette (`.pen` variables `m1-*`)

These match `tokens.css` exactly: negro-950 `#050505`, negro-900 `#0B0B0B`,
carbon-800 `#1A1A1A`, carbon-700 `#2C2C2C`, gris-400 `#8C8C8A`, blanco
`#F4F4F2`, red-muush-500 `#E5352F`, crimson-600 `#8E2A1E`, oxblood-800
`#4A1715`, coral-300 `#C9604A`, arena-300 `#B38B7B`, acero-200 `#A6B6B2`,
acero-400 `#4A676B`, acero-800 `#1F3236`.

- The `.pen` also has `m1-red-400 #CF3147`. The Kit labels it "el rojo
  anterior": it is reference only, so do not create a token for it.
- The primary button references `$m1-brasa-500`, which is not defined as a
  variable. Its value is `#E5352F` (= red-muush-500), as `tokens.css` says.

## 2 · Components (reusable, exact values)

**M1 · Pill** `XqFl6`
- fill `#1A1A1A99`, radius 999, stroke 1 px `#F4F4F21F`, background blur 16.
- padding 8 / 18 / 8 / 10, gap 10, items centered.
- Dot: a 20×20 box holding three concentric circles:
  - halo2 20 px `#E5352F1F`
  - halo 14 px `#E5352F4D`
  - dot 7 px `#E5352F`
- Text: Instrument Sans 13 / 500, letter-spacing 0.6, Blanco.
- Rendered height 36 at both 390 and 1440.

**M1 · Botón primario** `FcCCF`
- fill: linear gradient, top → bottom: `#EC4A44` 0 %, `#E5352F` 55 %, `#C42A25` 100 %.
- radius 999, stroke 1 px `#FFFFFF33`.
- shadow: outer, `#E5352F55`, y 10, blur 32.
- padding 16 / 30, gap 10.
- Text Instrument Sans 19 / 600 Blanco, then a lucide `arrow-right` icon 20×20 in Blanco.
- Variants used in the frames:

| Use | Padding | Text | Icon | Size |
|---|---|---|---|---|
| Hero desktop | default | 19 | 20 | 253×55 |
| Nav CTA desktop | 11 / 20 | 15 | 16 | 195×40 |
| Hero mobile | 12 / 14 | 14 | — | 178×44 |
| Form submit mobile ("Continuar") | — | — | — | 302×55, full width |

**M1 · Botón vidrio** `p0X8nQ`
- fill `#1A1A1A8C`, radius 999.
- stroke 1 px, linear gradient top → bottom `#F4F4F240` → `#F4F4F20F`.
- background blur 20.
- padding 16 / 28, gap 10.
- Text Instrument Sans 17 / 500 Blanco, no icon.
- Hero desktop 198×53. Mobile: padding 12 / 14, text 14, 145×41.

**M1 · Isotipo** `uUENh`: the logo does not change. Its stroke is now
Blanco on dark and its dot is red-muush-500.

## 3 · Glass surfaces seen in production (for the "vidrio" primitive)

| Surface | Fill | Radius | Stroke | Effects | Padding |
|---|---|---|---|---|---|
| Form glass panel `yCKxV` | `#0B0B0BB3` | 28 | 1 px gradient `#F4F4F240` → `#F4F4F20A` | bg blur 30 + shadow `#000000AA` y30 blur80 | 36 |
| Service card | `#0B0B0B` (opaque) | 24 | 1 px gradient `#F4F4F22E` → `#F4F4F20A` | none, clip | text block 22 / 24 / 28 / 24 |
| "También" strip `i6K0R` | `#1A1A1A66` | 20 | 1 px `#F4F4F21A` | bg blur 20 | 22 / 28 |

All three are one family: a dark translucent fill, a 1 px top-lit border
that fades downward, and optional blur and shadow. `tokens.css` covers the
panel (`--m1-vidrio-*`, `--vidrio-*` in the site). The primitive must parametrise fill opacity, radius,
blur and shadow, not hard-code one surface.

## 4 · Two-tone headings (Poppins 500)

| Heading | Desktop 1440 size / line-height / tracking | Mobile 390 size / line-height |
|---|---|---|
| Hero "Hablamos negocio / y código." | 96 / 1.06 / −3.5 px | 34 / 1.1 |
| Section (Qué es muush, Servicios) | 56 / 1.1 / ≈ −2 px | 28–30 / 1.15 |
| Cómo trabajamos | 52 / 1.1 / −1.82 px | 28 / 1.15 |
| Diagnóstico "Pide tu diagnóstico" | 64 / 1.08 / −2.24 px | 34 / 1.15 |

- Line 1 is Blanco and line 2 is Gris 400.
- Hero subtitle: Instrument Sans 20 / 1.5 on desktop and 17 / 1.5 on mobile,
  in `#F4F4F2B3` (Blanco at 70 %).
- Section body text: 17 / 1.55, Gris 400.

**Discrepancy with the handoff (the `.pen` wins):**
`tokens.css` has `--m1-h-hero: clamp(34px, 6vw + 10px, 84px)`, which caps at
84 px. The `.pen` draws the hero at **96 px** at 1440, so the max must be
96. `--m1-h-seccion` (28 → 56) also does not cover the 64 px diagnostic
heading or the 52 px Cómo trabajamos heading. Model the fluid heading scale
from this table, not from `tokens.css`. Responsive anchor rule: 390 and
1440 must match; in between may adapt.

## 5 · Taken as-is from `tokens.css` (confirmed by the leader, no `.pen` conflict)

- Text with opacity: suave 70 %, tenue 40 %, linea 12 %, linea-fuerte 20 %.
- Radii: control 12, campo 12, tarjeta 22, tile 28, pill 999; control side 36.
- Gutters: 24 mobile, 80 desktop. Section padding-y: 72 mobile, 120 desktop.
- Max container width: 1280.
- Motion: ease `cubic-bezier(.2,.7,.2,1)`; durations 180 / 320 / 700 ms,
  all 0 ms under `prefers-reduced-motion`.
- Nav background: `rgba(11,11,11,.45)`. Desktop nav: 1280×64 at y 24.

Do **not** port the Google Fonts `@import`.

## 6 · Animated backgrounds

Use `docs/handoff/muush-1.0/README.md` (shader table, uniforms, behaviour
rules), `muush-gradient.js`, `shaders/m1-liston.glsl`,
`shaders/m1-acanalado.glsl` and `posters/*.webp`. The `.pen` fills use the
same shaders, with the same uniforms as the README table. For example, the
hero listón has `u_flip:1, u_tx:.5, u_ty:.53, u_trx:.36, u_try:.28,
u_tdark:1, u_fadeB:.06`, and Cómo trabajamos has
`m1-acanalado.glsl` with the README values.

## 7 · Kept from v1

- Custom cursor and spotlight (features 8 and 34) stay. They must read well
  on the dark background.
- The `.pen` has no new cursor design. Adapting colours to the v2 tokens is
  allowed; changing the behaviour is not.

## 8 · Addendum (leader re-check of `V2s7T`, `mJxKt`, `trkk7` after the spec run)

- **Mobile tracking is 0 for every Poppins heading** (390). Desktop tracking
  is a constant ≈ −0.035 em (96 → −3.5, 56 → −1.96, 52 → −1.82, 64 → −2.24;
  "Lo que hacemos" uses −2). So tracking is NOT a fixed em: it goes from 0 at
  390 to −0.035 em at 1440 (fluid), so both anchors match.
- **Mobile section heading size differs per section** in the `.pen`:
  - Home: Qué es muush 28, Servicios 30, Cómo trabajamos 28, Diagnóstico 34.
  - Nosotros: hero 32, Cómo se arma 30, Dónde estamos 28, Trabaja con muush 34.

  Model a section size that is 28 at 390 (Qué es muush and Cómo trabajamos)
  and let the 30/32 cases be per-use overrides decided in features 44/46. Do
  not force one value.
- Service card titles: 24 px, tracking −0.6 px, on both mobile and desktop.
- Service card radius **24 is confirmed** in the `.pen`. Keep the token
  `--radio-tarjeta` (handoff `--m1-radio-tarjeta`) at 22 and use 24 for the service-card preset.

## 9 · Correction (leader, 2026-11-01, frame `V2s7T`)

The "—" in § 2 for the mobile icon meant "not extracted". It did not mean
"no icon". The `.pen` shows that the mobile hero primary button ("Diagnóstico
gratis", padding 12 / 14, text 14) has the lucide arrow **visible**: an
enabled 20×20 icon next to a 120×17 label. The mobile form submit
("Continuar", fill_container) also shows the visible 20×20 arrow with a 19 px
label. The arrow is never hidden on the primary button.
