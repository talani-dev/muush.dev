# Feature 46 · Values extracted from `muush.pen` by the leader

> Extracted 2026-11-02. Subagents cannot open the `.pen`. If a value is
> missing here, ask the leader.
>
> Map every hex to a v2 token from features 42–45 (`#F4F4F2` Blanco,
> `#8C8C8A` Gris 400, `#E5352F` Red muush 500, `#A6B6B2` Acero 200,
> `#4A676B` Acero 600, `#0B0B0BB3` glass panel, `#F4F4F21F` Blanco 12 %,
> `#F4F4F2B3` Blanco 70 %, `#E5352F26` Rojo 15 %, `#E98A77` check icon,
> `#1A1A1A` field fill, `#050505` page). Add a new token only when none fits.
>
> Text heights are reported as drawn. The `.pen` auto-sizes text, so a
> missing line height means "auto"; reuse the line-height findings from
> features 43–45 (pen-extract-44/45) rather than inventing new ones.
>
> Header and footer are the feature 43 shell. The `.pen` nav on these frames
> still shows a "Preguntas" link; **ignore it** — Roberto fixed the link bar
> as Inicio · Servicios · Nosotros (feature 43).
>
> Roberto 2026-11-02 (feature 45 reopen 2): every v2 pill above a heading
> carries the shared `pill-aire` utility. Preguntas and 404 have **no pill**.

## Frames

| Page | Desktop ES / EN | Mobile ES / EN |
|---|---|---|
| Nosotros | `gQ0NG` / `D1CqYA` | `trkk7` / `XoSI5` |
| Preguntas | `FXvwz` / `Gc1U5` | `pDsNQ` / `qSDZU` |
| 404 | `X9EQIz` / `zV0qI` | `Y2fsOQ` / `son4B` |

## 1 · Nosotros, desktop (`gQ0NG`, 1440 wide)

Sections stack vertically: Hero 820 → Cómo se arma 640 → Dónde estamos 1004
→ Trabaja con muush 920 → Footer.

### 1.1 Hero `b0rao` (1440 × 820)
- Vertical, gap 28, padding 120 / 80 / 60 / 80, items centred both ways.
- Background `FkVmK`: listón, 1440 × 820, uniforms
  `{u_flip:1, u_tx:0.5, u_ty:0.55, u_trx:0.4, u_try:0.32, u_tdark:1, u_fadeB:0.08}`
  (all other uniforms take the `.glsl` @default).
- Pill "Nosotros" / "About".
- Two-tone heading, centred, Poppins 64 / 500, line 1 Blanco
  "El equipo se arma" / "The team takes shape", line 2 Gris 400
  "alrededor del proyecto." / "around the project." (each line drawn 90 tall).
- Intro: Instrument Sans 20 / 1.5, Blanco 70 %, centred, width 720:
  - ES: "Reunimos al talento indicado para cada proyecto y le damos libertad de elegir en qué proyectos entra y desde dónde trabaja. Esa flexibilidad sostiene nuestro talent pool y nos permite entregar con una estructura ligera."
  - EN: "We bring together the right talent for each project and give them the freedom to choose which projects they join and where they work from. That flexibility sustains our talent pool and lets us deliver with a lean structure."

### 1.2 Cómo se arma `Wy3iH` (1440 × 640)
- Vertical, gap 40, padding 100 / 80 / 80 / 80, items centred. Transparent
  (page black).
- Pill "Cómo se arma" / "How it comes together".
- Heading centred, Poppins 56 / 500: "Quién entra" / "Who joins" (Blanco),
  "a tu proyecto." / "your project." (Gris 400); lines drawn 78 tall.
- Cards row `Ho3sv`: horizontal, gap 24, three cards 400 wide (1248 total),
  equal height 197.
- Card: vertical, gap 14, padding 32, radius 24, fill `#0B0B0BB3`, stroke
  Blanco 12 % (1 px).
  1. Label row, gap 10: 8 px dot + text Instrument Sans 14 / 600 Gris 400.
  2. Title Poppins 26 / 500 Blanco.
  3. Text Instrument Sans 17 / 1.5 Blanco 70 %.

| Card | Dot | Label ES / EN | Title ES / EN | Text ES / EN |
|---|---|---|---|---|
| Equipo base | Red muush 500 | Equipo base / Core team | Siempre en tu proyecto / Always on your project | Estrategia, diseño e ingeniería, de principio a fin. / Strategy, design and engineering, from start to finish. |
| Talent pool | Blanco | Talent pool / Talent pool | Cuando el proyecto lo pide / When the project calls for it | Especialistas que entran con el mismo estándar de entrega. / Specialists who join with the same delivery standard. |
| Aliados | Acero 200 | Aliados / Partners | Creativo y marketing / Creative and marketing | Estudios de confianza, coordinados por nosotros. / Trusted studios, coordinated by us. |

### 1.3 Dónde estamos `sBV2H` (1440 × 1004)
- Vertical, gap 28, padding 110 / 0, items centred, transparent.
- Pill "Dónde estamos" / "Where we are".
- Heading centred, Poppins 56 / 500 / **1.1**: "Un talent pool que crece" /
  "A talent pool that grows" (Blanco), "por sector y por proyecto." /
  "by industry and by project." (Gris 400).
- Map block `y2ecwq`: 1408 × 470, opacity 0.8, clipped — **the same dotted
  map and the same nine pins as the home map** (feature 44,
  `assets-44/map-pins.json`; positions here are those minus the 14 px pin
  centre offset; same kinds: team red, Ámsterdam partner Acero 200, Estonia
  hollow "soon" ring Gris 400). Reuse the shared `WorldMap` as is.
- Text: Instrument Sans 17 / 1.55, Gris 400, centred, width 640:
  "Todos trabajamos con las mismas reglas y el mismo estándar de entrega." /
  "We all work under the same rules and the same delivery standard."
- Legend `tFvfw`: horizontal, gap 22, centred: "Equipo" (red 8 px dot) ·
  "Aliados" (Acero 200 dot) · text "Trabajamos con clientes en cualquier
  país." / "We work with clients in any country." All 13 / Gris 400, dot gap 8.
  Compare with the home map legend (pen-extract-44) and reuse it if equal.

### 1.4 Trabaja con muush `O1FdO9` (1440 × 920)
- Horizontal, gap 72, padding 120 / 80 / 140 / 80, items centred — **the
  same layout as the home Diagnóstico section** (pen-extract-45 § 1).
- Background `BD9CZ`: listón, 1440 × 920, at y 2490 (overlaps the section's
  top by 26), uniforms
  `{u_flip:1, u_y0:1, u_y1:0.35, u_th:0.11, u_amp:0.06, u_twist:0.5, u_tx:0.27, u_ty:0.45, u_trx:0.25, u_try:0.35, u_tdark:0.75, u_fadeT:0.3, u_fadeB:0.05}`.
- Left column (608 wide, vertical gap 26):
  1. Pill "Trabaja con muush" / "Work with muush".
  2. Heading Poppins 64 / 500 / 1.08 / −2.24 (left): "Tú eliges en qué" /
     "You choose which" (Blanco), "proyectos entras." / "projects you join."
     (Gris 400).
  3. Body Instrument Sans 18 / 1.55, Blanco 70 %, width 500:
     "Con quién y desde dónde, también. Si trabajas en tecnología, diseño o producción, cuéntanos qué haces y te buscamos cuando haya un proyecto para ti." /
     "Who you work with and where from, too. If you work in technology, design or production, tell us what you do and we'll reach out when there's a project for you."
  4. List (vertical gap 14, padding-top 8), **same anatomy as the home
     "Lo que recibes" list** (feature 45 `ReceivesList`): label 11 / 600,
     tracking 1, Gris 400 "ÁREAS QUE SUMAMOS" / "AREAS WE BRING IN"; three rows
     (gap 12, 24 px round check tile Rojo 15 % with 14 px `#E98A77` check, text
     16 Blanco): "Ingeniería y desarrollo" / "Engineering and development",
     "Diseño de producto y UX" / "Product design and UX", "Creativo, contenido
     y marketing" / "Creative, content and marketing".
- Right: the feature 45 v2 application form panel (600 wide, glass). Already
  built; move it out of the v1 section into this v2 one.

## 2 · Nosotros, mobile (`trkk7`, 390 wide)

Hero 700 → Cómo se arma 941 → Dónde estamos 811 → Trabaja 949 → Footer.

- **Hero `Docxh`:** vertical, gap 24, padding 110 / 24 / 60 / 24, centred.
  Heading 32 / 500 / 1.15 centred (342 wide; line 2 wraps to two lines at
  390). Intro 16 / 1.5 Blanco 70 % centred. Background `eU4li` listón 390 ×
  700: `{u_flip:1, u_y0:0.95, u_y1:0.68, u_th:0.07, u_amp:0.04, u_tx:0.5, u_ty:0.5, u_trx:0.5, u_try:0.34, u_tdark:1, u_fadeB:0.06}`.
- **Cómo se arma `jRvnu`:** vertical, gap 24, padding 72 / 24, **left
  aligned** (pill at x 24, heading left). Heading 30 / 500 / 1.15. Cards
  stack vertically, gap 14, full width 342; card padding 24, radius 24, same
  fill/stroke; inner gap 14; title 26 / 500 (wraps), text 17 / 1.5.
- **Dónde estamos `ab0j5`:** vertical, gap 24, padding 72 / 24, centred.
  Heading 28 / 500 / 1.15 centred. Then the America / Europa ("Americas" /
  "Europe") selector and the 342 × 240 zoomed map, **identical to the home
  mobile map** (pen-extract-44). Text 16 / 1.5 Blanco 70 % centred. Legend
  (vertical, gap 8, centred): row (gap 16) "Equipo" red 7 px dot · "Aliados"
  Acero 200 7 px dot · chip "Estonia · pronto" (glass fill, Blanco 12 %
  stroke, 6 px Acero 600 dot, text 13 Blanco); then "Trabajamos con clientes
  en cualquier país." 13 Gris 400. Same as the home mobile legend.
- **Trabaja con muush `fhqDx`:** vertical, gap 24, padding 72 / 24, left
  aligned. Heading 34 / 500 / 1.15. Body 16 / 1.5 Blanco 70 %. List as
  desktop. Then the feature 45 stepped form panel (342 wide). Background
  `JIhrf` listón 390 × 949:
  `{u_flip:1, u_y0:1, u_y1:0.5, u_th:0.05, u_amp:0.03, u_twist:0.5, u_tx:0.5, u_ty:0.2, u_trx:0.6, u_try:0.2, u_tdark:0.8, u_fadeT:0.15, u_fadeB:0.02}`.

## 3 · Preguntas (no pill, no body copy)

**Desktop `FXvwz`:** background `xKOcV` acanalado 1440 × 1100
`{u_flip:1, u_y0:0.84, u_y1:0.76, u_th:0.13, u_right:0.6, u_tx:0.5, u_ty:0.5, u_trx:0.45, u_try:0.26, u_tdark:1, u_fadeT:0.1, u_fadeB:0.15}`.
Content 1440 × 1100, vertical, gap 40, padding 120 / 80 / 80 / 80, centred
both ways:
- Title Poppins **88 / 600**, centred, Blanco: "En construcción 🚧" /
  "Under construction 🚧". ⚠ Weight 600 contradicts the constitution's
  "headings 500" rule and the mobile frame (500). Leader recommendation: 500.
- Buttons row, gap 14: primary (feature 42 `PrimaryButton`, with arrow)
  "Diagnóstico gratis" / "Free assessment"; secondary (ghost) "Agenda una
  llamada" / "Book a call". Same destinations as the home hero CTAs.

**Mobile `pDsNQ`:** acanalado 390 × 720
`{u_flip:1, u_ribs:18, u_y0:0.86, u_y1:0.8, u_th:0.08, u_right:0.6, u_tx:0.5, u_ty:0.48, u_trx:0.6, u_try:0.26, u_tdark:1, u_fadeB:0.1}`.
Content 390 × 720, gap 32, padding 100 / 24 / 60 / 24, centred. Title 34 /
500 centred. Buttons row gap 8, centred, both buttons padding 12 / 14
(primary 178 × 44, secondary 161 × 41 at 390).

## 4 · 404 (no pill, no body copy)

**Desktop `X9EQIz`:** acanalado 1440 × 760
`{u_flip:1, u_y0:0.98, u_y1:0.92, u_th:0.11, u_right:0.6, u_tx:0.5, u_ty:0.5, u_trx:0.42, u_try:0.4, u_tdark:1, u_fadeB:0.02, u_fadeT:0.1}`.
Content 1440 × 760, gap 40, padding 100 / 80 / 60 / 80, centred:
- Two-tone heading Poppins 64 / 500, centred: "Volvamos a un" / "Let's get
  you back" (Blanco), "lugar conocido." / "somewhere familiar." (Gris 400).
- Buttons row gap 14, padding-top 8: primary with arrow "Volver al inicio" /
  "Back to home"; secondary "Diagnóstico gratis" / "Free assessment".

**Mobile `Y2fsOQ`:** acanalado 390 × 720
`{u_flip:1, u_ribs:18, u_y0:0.9, u_y1:0.84, u_th:0.08, u_right:0.6, u_tx:0.5, u_ty:0.48, u_trx:0.6, u_try:0.28, u_tdark:1, u_fadeB:0.08}`.
Content gap 32, padding 100 / 24 / 60 / 24, centred. Heading 34 / 500. Buttons
gap 8, padding 12 / 14 (153 × 44 and 146 × 41).

The 404 keeps the behaviour of features 36 and 39 (status, noindex,
language handling); only the look changes. Check the v1 404 copy against
this and keep the routes/tests from 36/39 green.

## 5 · Open points for the spec author

1. Preguntas title weight (600 desktop vs 500 mobile/constitution) — leader
   recommends 500; confirm with Roberto at the spec gate.
2. Preguntas has no link in the v2 header (Roberto's link bar). Check how it
   is reached today (footer, sitemap) and report; do not add it to the bar.
3. The mobile "Estonia · pronto" EN chip text was not readable in the frame
   (nested); reuse the home map's EN legend copy.

## 6 · Answers to the spec author's missing values (leader, 2026-11-02)

- **Heading line heights / tracking as stored in the `.pen`:**
  - Nosotros hero (64), Cómo se arma (56), Preguntas (88), 404 (64): **no
    line height and no tracking set** (auto, drawn ≈ 1.4; tracking 0).
  - Dónde estamos (56): 1.1 / −1.96 (= −0.035 em). Trabaja (64): 1.08 / −2.24.
  - Mobile headings: 1.15, no tracking (Preguntas/404 mobile: none set).
  - Leader reading: the unset ones are design omissions, not intent (every
    other v2 heading is 1.06–1.1 with −0.035 em). Proposed to Roberto: use the
    v2 heading scale (1.08 at 64, 1.1 at 56, −0.035 em) everywhere.
- **Cómo se arma card:** no effect (no blur, no shadow); stroke Blanco 12 %,
  1 px, flat (solid). Label and title line heights unset (auto); label is
  sentence case as given ("Equipo base").
- **Footer gap:** none. In the `.pen` the footer is the next child of the
  same vertical stack with no gap — flush after the last section.
- **Trabaja background offset:** accept filling the section exactly.
- **Preguntas / 404 blocks:** fixed-size frames (1100 / 760 desktop, 720
  mobile) with content centred. Leader default: treat them as minimum
  heights, content centred.
- **Secondary (glass) buttons on Preguntas / 404:** no icon (label only).
- **Home mobile uniforms:** yes, the home mobile frame `V2s7T` also draws its
  own uniforms, which the code does not use today:
  - Hero listón `{u_flip:1, u_y0:0.95, u_y1:0.68, u_th:0.07, u_amp:0.04, u_tx:0.5, u_ty:0.5, u_trx:0.5, u_try:0.32, u_tdark:1, u_fadeB:0.06}`
  - Cómo trabajamos acanalado `{u_flip:1, u_ribs:16, u_y0:0.045, u_y1:0.035, u_th:0.035, u_right:0.5, u_tdark:0, u_fadeB:0}`
  - Diagnóstico listón `{u_flip:1, u_y0:1, u_y1:0.5, u_th:0.05, u_amp:0.03, u_twist:0.5, u_tx:0.5, u_ty:0.2, u_trx:0.6, u_try:0.2, u_tdark:0.8, u_fadeT:0.15, u_fadeB:0.02}`
