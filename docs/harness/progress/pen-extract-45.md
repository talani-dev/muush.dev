# Feature 45 · Values extracted from `muush.pen` by the leader

> Extracted 2026-11-02. Subagents cannot open the `.pen`. If a value is
> missing here, ask the leader.
>
> Map every hex to a v2 token from features 42–44. Add a new token only when
> none fits.
>
> ES/EN copy for the forms and their states is in
> `docs/business/muush-1.0.md` § 4.6 and § 4.8.
>
> The "Tu sitio web o redes (opcional)" field is NOT built (Roberto,
> 2026-10-31). Skip it everywhere it appears below.

## Frames

| What | Desktop ES / EN | Mobile ES / EN |
|---|---|---|
| Diagnóstico y contacto section | `mMSV2` (in `Tng1t`) / in `ZL2Vo` | `ASEvR` (in `V2s7T`) / in `mJxKt` |
| Diagnóstico form states | `uUEnn` / `Vh9NI` | `Bw4IB` / `qUy14` |
| Trabaja con muush section (Nosotros) | `O1FdO9` (in `gQ0NG`) / in `D1CqYA` | in `trkk7` / `XoSI5` |
| Aplicación form states | `w9Owd` / `gNda1` | `u1CDBO` / `H3cNSD` |

## 1 · Diagnóstico y contacto section (desktop `mMSV2`)

**Section**
- Horizontal layout with gap 72 and padding 120 / 80 / 140 / 80. Items are
  vertically centred.
- Background: the listón shader, `assessment` preset, frame `k3Anb`,
  1440 × 920.
- It carries the `#diagnostico` anchor, taken from `sectionAnchors`.

**Left column `Izq`** (fills the width; vertical, gap 26)
1. Pill: "Primer paso".
2. Two-tone heading: 64 / 1.08 / −2.24 px. This is the existing
   `diagnostico` heading size from feature 42.
3. Body: Instrument Sans 18 / 1.55, blanco at 70 %, width 500.
4. "Recibes" list (vertical, gap 14, padding-top 8):
   - Label: 11 / 600, tracking 1, Gris 400.
   - Three rows, each with gap 12 and items centred:
     - a 24 × 24 bubble filled red at 15 %, radius 999, holding a lucide
       `check` icon at 14 px in `#E98A77`;
     - text at 16 / 400, Blanco.
5. "Llamada" row (gap 14, padding-top 18):
   - "¿Prefieres hablar?" at 15 / 400, Gris 400;
   - then a link with gap 8: "Agenda una llamada" at 15 / 600 Blanco, plus a
     lucide `arrow-right` at 16 px in Red muush 500;
   - the link goes to the existing call-booking URL.

**Right column: the form panel**
- 600 wide, using the glass `panel` preset from feature 42:
  - fill `#0B0B0BB3`;
  - radius 28;
  - top-lit stroke;
  - blur 30;
  - shadow.
- The form itself is in § 2.

## 2 · Desktop form (`yCKxV`): one view with every field

**Panel and rows**
- Panel padding 36, gap 18.
- Two-field rows have gap 14, and each field fills its share of the row.

**Field block** (vertical, gap 8)
- Label: Instrument Sans 12 / 600, tracking 0.3, Gris 400.
- Control:
  - height 50, fill carbón 800 `#1A1A1A`;
  - radius 14, stroke 1 px blanco at 10 %;
  - padding 0 / 16;
  - text 15 / 400. The placeholder colour is Gris 400; typed text is
    Blanco.
- Select: same control, with a lucide `chevron-down` at 16 px in Gris 400
  on the right.
- Textarea "¿Qué necesitas?": height 96, padding 14 / 16.

**Field order (diagnóstico)**
1. Row: Nombre | Correo.
2. Row: Empresa o proyecto | ¿Cómo te identificas? (select).
3. *(the website field: skipped)*
4. ¿Qué necesitas? (textarea).
5. "¿Cómo prefieres que te contactemos?" with a segmented control.
6. Privacidad.
7. Submit.

**Segmented control**
- Container: fill carbón 800, radius 999, stroke blanco at 10 %, padding 5,
  gap 6.
- Each option: radius 999, padding 9 / 20, gap 8, text at 14 px.

| | Fill | Text | Extra |
|---|---|---|---|
| Selected | carbón 700 `#2C2C2C` | 600 Blanco | a 6 px Red muush dot |
| Not selected | transparent | 500 Gris 400 | — |

When WhatsApp is selected, the existing WhatsApp field (dial code plus
number) appears. Restyle it with the same control style. The `.pen` has no
v2 frame for this, so reuse the field anatomy above.

**Privacidad**
- Gap 12.
- Checkbox: 18 × 18, radius 5, stroke blanco at 25 %.
- Text: 13 / 1.45, Gris 400.
- Submit stays disabled until the box is checked. The checkbox is not sent
  in the payload.

**Submit**
- The primary button, hero size, centred: "Quiero mi diagnóstico" plus a
  20 px arrow, 287 × 55.

## 3 · Desktop states (`uUEnn`, ES)

All states are drawn over the assessment listón.

| State | What changes |
|---|---|
| Enviando | The submit is at opacity 0.7 with the label "Enviando…" and its arrow. Every field keeps its value. |
| Faltan datos | Invalid controls take a 1 px Red muush 500 stroke. Below each one sits a help line at 13 / 400 in Red muush 500, for example "Escribe tu nombre." or "Escribe un correo como nombre@empresa.com". |
| Error al enviar | A banner ("Aviso") sits above the submit, and the button label becomes "Intentar de nuevo". Fields keep their values. |
| Enviado | The panel content is replaced by a centred stack. |

**Error banner ("Aviso")**
- Full width, fill red at 12 %, radius 10.
- Stroke red at 40 %.
- Padding 14 / 16, gap 12.
- Text at 14 / 1.45 Blanco, e.g. "El envío se interrumpió…".

**Enviado stack**
- Icon tile: 64 × 64, fill blanco at 8 %, radius 20, stroke blanco at 20 %,
  holding a 14 px solid Red muush dot.
- Title: "Recibimos tu solicitud." in Poppins 32 / 500 Blanco.
- Text: 16 / 1.5, blanco at 70 %, 420 wide, centred.
- Glass button: "Agenda una llamada".

## 4 · Mobile (`ASEvR` + `Bw4IB`)

**Section**
- Vertical, padding 72 / 24, gap 24.
- Order:
  1. Pill.
  2. Heading at 34 / 1.15.
  3. Body at 16-ish, blanco at 70 %.
  4. "Recibes" list. The same structure as desktop, but rows fill the width
     and long lines wrap.
  5. Form panel.
  6. "Llamada" row.
- Over the assessment listón, at mobile size.

**Mobile form panel**
- 342 wide, fill `#0B0B0BB3`, radius 22, stroke blanco at 12 %.
- Blur 30, padding 20, vertical, gap 14.

**Two steps.** The data entered is kept when the visitor goes back.

| | Step 1 · "Paso 1 de 2 · Tus datos" | Step 2 · "Paso 2 de 2 · Tu negocio" |
|---|---|---|
| Fields | Nombre, Correo, the contact segmented control (plus WhatsApp when chosen) | Empresa o proyecto, ¿Cómo te identificas?, ¿Qué necesitas?, Privacidad |
| Button | Primary, full width: "Continuar" + arrow | "Quiero mi diagnóstico" |
| Below the button | — | Footer "← Atrás" at 14 / 400, Gris 400 |

**Progress row** (gap 10)
- Label at 12, Blanco, filling the width.
- Bar: two segments, each 28 × 4, radius 2, gap 4.
  - The current step and the steps before it are Red muush.
  - Later steps are blanco at 20 %.

**Mobile field block** (gap 7)
- Label at 12 / 400, Gris 400. Mobile labels are weight 400, not 600.
- Control:
  - height 46, carbón 800, radius 12;
  - **no stroke**;
  - padding 0 / 14;
  - text 14, placeholder blanco at 40 %.

**Mobile segmented control**
- Container: carbón 800, radius 12, padding 4, gap 4.
- Selected option: fill blanco at 10 %, radius 9, padding 8 / 14.
- Unselected option: transparent.

**Mobile states:** Faltan datos, Enviando, Error and Enviado. They use the
desktop treatments at mobile size.

## 5 · Aplicación form (desktop `VtxDP`, mobile `u1CDBO`)

**Shared code:** the same panel, field anatomy, states and two-step pattern
as the diagnóstico form.

**Field order (desktop)**
1. Row: Nombre | Correo.
2. Row: Portafolio (`https://`) | Área y rol (select, "Selecciona tu área y
   rol").
3. LinkedIn (`linkedin.com/in/…`).
4. CV: a 96-tall box (padding 14 / 16) with the placeholder "Adjunta tu CV
   en PDF · máximo 10 MB" at 15 / 400, Gris 400. The `.pen` has no icon
   here. Use the existing CV upload behaviour: PDF only, maximum 10 MB.
5. Contacto (segmented control).
6. Privacidad: "…sobre mi aplicación.".
7. Submit: "Enviar aplicación" + arrow, 241 × 55.

**Mobile steps**

| Step | Label | Fields |
|---|---|---|
| 1 | "Paso 1 de 2 · Tus datos" | Nombre, Correo, Contacto |
| 2 | "Paso 2 de 2 · Tu perfil" | Portafolio, Área y rol, LinkedIn, CV, Privacidad |

Step 2 has the "← Atrás" footer.

**Copy** for the field errors and states is in `muush-1.0.md` § 4.8:
- "Elige tu área y rol."
- "Adjunta tu CV en PDF de hasta 10 MB."
- the error copy that mentions the CV;
- "Recibimos tu aplicación." with its body text and "Volver al inicio".

**The Trabaja con muush section** (`O1FdO9`) mirrors § 1:
- Pill: "Trabaja con muush".
- Heading: 64 / 1.08.
- Body: 18 / 1.55, 500 wide.
- "ÁREAS QUE SUMAMOS" list with three check rows.
- Background: the listón shader (`workWithUs` preset).
- **Feature 46 owns the Nosotros page.** See OPEN QUESTION Q1.

## 6 · Open questions for Roberto (the leader asks; do not decide)

- **Q1 · Where does the v2 application form go before feature 46?**
  Nosotros is still v1 until 46.
- **Q2 · "Enviado" icon dot.** The success tile draws a solid red dot with
  no halo. Should it get the radar ping too?
- **Q3 · The lucide `check` icon** (the "Recibes" / "Áreas" bubbles) is not
  in the repo. It needs a download from `lucide-static@0.469.0`, the same
  source as feature 44.

## 7 · Roberto's answers (2026-11-02)

- **Q1: mount the v2 application form NOW inside the v1 Nosotros "Trabaja
  con muush" section.** That section stays v1 (copy, layout, background) and
  only its form is swapped for the v2 application form. The page looks
  mixed until feature 46, which Roberto accepts.
- **Q2: yes.** The "Enviado" tile dot gets the radar ping, using the same
  recipe and token as the Pill dot, in Red muush. Under reduced motion
  there is no ping.
- **Q3: yes.** The leader downloaded the lucide `check` icon
  (`lucide-static@0.469.0`, ISC) to `/private/tmp/claude-501/lucide45/check.svg`,
  outside the repo so Biome does not lint the raw file. It was checked: no
  scripts and no links. Normalize it into `app/assets/icons/check.svg`
  following that folder's README contract.

## 8 · Values the spec author asked for (leader re-check, 2026-11-02)

- **EN mobile copy:**
  - Diagnóstico frame (`qUy14`): "Step 1 of 2 · Your details", "Step 2 of 2
    · Your business", "Continue", "← Back".
  - Aplicación frame (`H3cNSD`): "Step 2 of 2 · Your profile".
- **Mobile segmented control, selected option:** text only, 13 / 600 Blanco.
  It has **no red dot**; the dot appears on desktop only.
- **Mobile Privacidad row:** gap 10. Checkbox 18 × 18, radius 5, stroke
  blanco at 40 %. Text 12 / 1.4.
- **Notice ("Aviso"):** both desktop and mobile have an **8 px Red muush
  dot** before the text.
  - Desktop: padding 14 / 16, gap 12, text 14.
  - Mobile: padding 12 / 14, gap 10, text 13.
- **Mobile success stack:** icon tile 56 × 56, radius 18. Title 26. Text 16.
- **Mobile body text:** 16 / 1.5. The mobile "Llamada" row is the same as
  desktop.
- **Disabled submit (box not ticked):** the `.pen` draws no frame for this
  state. Use the "Enviando" treatment, opacity 0.7, plus a not-allowed
  cursor.
