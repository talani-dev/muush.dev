# Feature 43 · Values extracted from `muush.pen` by the leader

> Extracted on 2026-11-01. Subagents cannot open the `.pen`; if a value is
> missing here, ask the leader. Hex values below are the `.pen`'s. Map each
> one to the v2 tokens from feature 42 (e.g. `#F4F4F2` → `--blanco`,
> `#F4F4F2B3` → blanco at 70 %), and add a token only when none fits.
>
> Frames:
>
> | Element | Desktop ES | Desktop EN | Mobile ES | Mobile EN |
> |---|---|---|---|---|
> | Nav | `FJIoc` (in `Tng1t`) | in `ZL2Vo` | `DIS32` (in `V2s7T`) | in `mJxKt` |
> | Open menu | — | — | `chQ4f` | `QpUCy` |
> | Footer | `K3vvqL` | in `ZL2Vo` | `kJfw5` | in `mJxKt` |
>
> The other v2 pages (Nosotros `gQ0NG`, Preguntas `FXvwz`, 404 `X9EQIz`) use
> the same nav and footer.

## 1 · Lockup (isotipo + wordmark) — the logo does not change

**Isotipo**
- 40×22.
- Same two paths as the reusable `M1 · Isotipo` (`uUENh`), with viewBox
  `[14.5, 38.5, 70.5, 39.5]`:
  - "Trazo": stroke Blanco, width **3.4** at this size, round cap, no fill;
  - "Punto": fill Red muush 500.
- Take the geometry from `app/assets/logo/` and the v1 `legacy/Lockup.vue`;
  that is the same logo. Only the colours change: the stroke is now Blanco
  on dark and the dot is Red muush 500.

**Wordmark**
- Poppins 22, aligned to the baseline, made of three runs:

  | Run | Weight | Colour |
  |---|---|---|
  | "muush" | 600 | Blanco |
  | "." | 600 | Red muush 500 |
  | "dev" | 400 | Gris 400 |

**Lockup layout**
- Desktop: gap 10, items centred, isotipo then wordmark, 176×31.
- Mobile nav: isotipo only, 40×22.

## 2 · Desktop nav (1280×64, at x 80 / y 24 inside 1440 → container 1280, top offset 24)

- Three slots with `space-between`: lockup | link bar | right group.
- The link bar is centred on the nav: it sits at x 431–778, centre 604.5.
  That is the centre of the free space, not of the nav, so lay it out as
  the middle slot of `space-between`.

**Link bar**
- fill `#0B0B0B73` (negro-900 at 45 %, = `--nav-fondo` from the handoff).
- radius 999.
- 1 px top-lit gradient stroke, `#F4F4F233` → `#F4F4F20A`.
- background blur 24.
- padding 6, gap 6, items centred.
- 347×50.

**Link item**
- padding 10 / 18, gap 8, radius 999.
- Text: Instrument Sans 15 / 500.
- Inactive: transparent fill, text `#F4F4F2B3` (blanco at 70 %).
- Active: fill `#F4F4F214` (blanco at 8 %), text Blanco, and a leading
  6×6 Red muush 500 dot.
- Order: Servicios · Nosotros · Preguntas. EN: Services · About · FAQ.

**Which item is active, per frame**

| Page | Active item |
|---|---|
| Home (ES and EN) | Servicios / Services |
| Nosotros | Nosotros |
| Preguntas | Preguntas |
| 404 | none |

This is OPEN QUESTION Q1 (§ 7).

**Right group:** gap 12, items centred.

- **Language button**
  - 40×40, radius 999, fill `#0B0B0B73`.
  - stroke 1 px `#F4F4F226` (blanco at 15 %), background blur 20.
  - Text Instrument Sans 12 / 600 Blanco.
  - Shows the **current** locale: "ES" on Spanish pages, "EN" on English
    pages.
- **CTA**
  - Primary button, nav size, from feature 42: "Diagnóstico gratis" /
    "Free assessment", 15 / 600, 16 px arrow, 195×40.
  - Goes to the diagnostic section of the home page in the current locale.

## 3 · Mobile nav (342×60, at x 24 / y 16 inside 390)

**Bar**
- fill `#0B0B0B73`, radius 18.
- stroke 1 px `#F4F4F21F` (blanco at 12 %), background blur 20.
- padding 0 10 0 16, `space-between`.

**Contents**
- Left: isotipo only, 40×22.
- Right group: gap 8.
  - Language button: 36×36, radius 12, stroke 1 px `#F4F4F233` (blanco at
    20 %), no fill, text 12 / 600 Blanco.
  - Menu button: 36×36, radius 12, same stroke, holding three lines, each
    16×1.5, radius 1, Blanco, gap 4, centred.
- The handoff states the controls are 36×36 with radius 12, and that
  language, menu, close and social buttons all share that same shape.

## 4 · Open mobile menu (390×844, full screen)

**Layers**
1. Base `#050505`.
2. Listón shader background with uniforms
   `{u_flip:1, u_y0:1.02, u_y1:0.8, u_th:0.06, u_amp:0.03, u_tdark:0}`.
   This preset is NOT in the handoff README table; add it as a new preset.
   The handoff has no poster for it.
3. Glass panel: full screen, fill `#050505B3` (negro-950 at 70 %), background
   blur 24.

**Top bar:** the same bar as § 3, but the menu button becomes **Cerrar**.
Cerrar is 36×36, radius 12, same stroke, holding an X path 14×14 with
stroke Blanco 1.6 and round caps.

**Items**
- A column at x 24, y 150, width 342, gap 6.
- Each row: padding 16 / 0, `space-between`, holding the label in Poppins
  32 / 500 Blanco.
- Rows: Servicios · Nosotros · Preguntas. There are no arrows; the handoff
  says "sin flechas".

**Divider:** 342×1 at y 440, `#F4F4F21F` (blanco at 12 %).

**Social row**
- At y 480, centred, gap 12.
- Three buttons, each 48×48, radius 12, fill `#0B0B0B73`, stroke 1 px
  `#F4F4F233`.
- Each shows a text glyph — "in", "ig", "tt" — in Instrument Sans 14 / 600
  Blanco. This is OPEN QUESTION Q2.

**Behaviour, from the handoff README**
- Closes on X, Esc or a link tap.
- Locks background scroll.
- No arrows.

## 5 · Header behaviour (desktop and mobile)

- Visible at the top of the page.
- Hides after the user scrolls down 80 px, and reappears on scroll up.
- Never hides while the menu is open.
- Under `prefers-reduced-motion`, no animation.

Reference: `smartHeader` in `docs/handoff/muush-1.0/muush-gradient.js`, and
the header and menu logic in `componentes/componentes.js`. Port the logic to
composables. The v1 shell already has hide-on-scroll from features 26 and
27, so reuse that logic where it applies.

## 6 · Footer

### Desktop (`K3vvqL`)

**Container**
- Full width, transparent.
- Top border 1 px `#F4F4F214` (blanco at 8 %).
- Vertical layout, gap 56, padding 72 80 40 80.

**Top row, `space-between`**
- **Brand** (340 wide, vertical, gap 18):
  - Lockup 176×31.
  - Tagline "Hablamos negocio y código." / "We speak business and code."
    in Poppins 20 / 500, Blanco, tracking −0.4.
  - "Technology Solution Studio." in Instrument Sans 14 / 1.5, Gris 400.
- **Columns** (gap 72). Each column is vertical with gap 14. The heading is
  Instrument Sans 11 / 600, tracking 1, Gris 400, uppercase. Links are
  Instrument Sans 15 / 400 in `#F4F4F2D9` (blanco at 85 %).

  | Column ES / EN | Links ES | Links EN |
  |---|---|---|
  | NAVEGACIÓN / NAVIGATION | Servicios · Cómo trabajamos · Nosotros | Services · How we work · About |
  | CONTACTO / CONTACT | Diagnóstico gratis · Agenda una llamada · support@muush.dev · WhatsApp | Free assessment · Book a call · support@muush.dev · WhatsApp |
  | MUUSH | Trabaja con muush · Preguntas · Blog · próximamente | Work with muush · FAQ · Blog · coming soon |
  | REDES / SOCIAL | LinkedIn · Instagram · TikTok | LinkedIn · Instagram · TikTok |

  - "Blog · próximamente" is not a link.

**Bottom row**
- Top border 1 px `#F4F4F214`, padding-top 24, `space-between`.
- Left: "© 2026 muush · Todos los derechos reservados" / "© 2026 muush · All
  rights reserved", 13 / 400 Gris 400.
- Right: "Aviso de privacidad" and "Términos y condiciones" / "Privacy
  notice" and "Terms and conditions", gap 24, 13 / 400 Gris 400.
- These two are plain text until feature 48 creates the pages.

### Mobile (`kJfw5`)

**Container:** 390 wide, top border 1 px `#F4F4F214`, vertical, gap 24,
padding 48 24 32 24.

1. **Brand** (vertical, gap 10):
   - Lockup 176×31.
   - Tagline in Poppins 17 / 500 Blanco.
   - "Technology Solution Studio." in 12 / 400 Gris 400.
2. **Contact first, as buttons** (vertical, gap 8). Each row:
   - full width, fill `#0B0B0BB3` (negro-900 at 70 %), radius 14;
   - stroke 1 px `#F4F4F21F`, padding 14 / 16, `space-between`;
   - label 15 / 600 Blanco on the left, hint 13 / 400 Gris 400 on the right.

   | Row | Label | Hint ES | Hint EN |
   |---|---|---|---|
   | 1 | WhatsApp | "Escríbenos  →" | "Message us  →" |
   | 2 | Agenda una llamada / Book a call | "30 minutos  →" | "30 minutes  →" |
   | 3 | support@muush.dev | "Correo  →" | "Email  →" |

3. **Links on one line**: "Servicios · Cómo trabajamos · Nosotros · Preguntas
   · Trabaja con muush · Blog (próximamente)" / EN "Services · How we work · About · FAQ · Work with muush · Blog (coming soon)" in 15 / 400 `#F4F4F2B3`,
   fixed width, wraps.
4. **Social**: gap 10. Three buttons, each 44×44, radius 12, stroke 1 px
   `#F4F4F233`, no fill, holding the glyphs "in", "ig", "tt" in 13 / 600
   Blanco (Q2).
5. **Legal** (vertical, gap 6, top border 1 px `#2C2C2C` = carbón 700,
   padding-top 16):
   - "Aviso de privacidad · Términos y condiciones" in 12 / 400 Gris 400;
   - "© 2026 muush · Todos los derechos reservados" in 12 / 400 Gris 400.

**Breakpoint:** switch between the mobile and desktop nav and footer at
1024 px (`lg`), as the handoff does. The 390 and 1440 anchors must match.
In between, layout may adapt.

## 7 · Open questions for Roberto (leader asks; do not decide)

- **Q1 · Active nav item on the home page.** The home frames mark
  "Servicios" active. Is that static (Servicios is always active on the
  home page), or scroll-spy (it lights while the Servicios section is in
  view, and nothing is lit at the top)?
- **Q2 · Social glyphs.** The `.pen` uses text glyphs "in", "ig", "tt" in
  the menu and the mobile footer. The repo has real brand SVGs in
  `app/assets/social/`. Which do we ship?

## 8 · Other inputs

- **Favicon:** Red muush 500 `#E5352F`, per `muush-1.0.md`. The current
  `public/favicon.svg` is adaptive. Keep the same shape and change only the
  colour.
- **Link targets** (current locale):

  | Link | Target |
  |---|---|
  | Servicios | home `#servicios` |
  | Cómo trabajamos | home `#como-trabajamos` |
  | Diagnóstico gratis | home `#diagnostico` |
  | Nosotros | `/es/nosotros` ↔ `/en/about` |
  | Trabaja con muush | Nosotros `#trabaja-con-muush` |
  | Preguntas | `/es/preguntas` ↔ `/en/faq` (the route arrives in feature 46) |
  | Agenda una llamada | the existing call-booking URL |
  | WhatsApp | the existing WhatsApp link |
  | support@muush.dev | `mailto:` |
  | LinkedIn / Instagram / TikTok | the existing handles |

  Use the i18n route map; never swap the locale prefix by string. Reuse the
  existing data in `app/features/shell/data/` and `app/shared/data/`.
- **Anchors:** the anchor ids are new (v1 used `#proposito` and others).
  Define them once, in data, so features 44 and 46 put the same ids on their
  sections.

## 9 · Roberto's answers (2026-11-01)

- **Q2: real SVGs.** The menu and the mobile footer keep the designed
  buttons (48×48 and 44×44, radius 12, stroke). Inside each button goes the
  real brand SVG from `app/assets/social/`, in Blanco, instead of the
  "in"/"ig"/"tt" text.
- **Q1: the links scroll to their section; no Home item.**
  - "Servicios" scrolls to the Servicios section on the home page.
  - The **logo is the home link**, so there is no separate "Home" item. The
    designed three items stay as they are.
  - **Provisional, until Roberto confirms at the spec gate:** the active
    state is **scroll-spy**.
    - On the home page, no item is lit at the top. "Servicios" lights while
      the Servicios section is in view.
    - On Nosotros and Preguntas, their own item is lit.
    - On the 404, nothing is lit.

## 10 · Social glyph size (leader, 2026-11-01)

The `.pen` has no value to extract here. It draws text glyphs ("in", "ig",
"tt" at 14 / 13 px), and Roberto chose real SVGs instead (§ 9). The leader
accepts the implementer's 20 px glyph (`--spacing-red-glifo: 1.25rem`) for
both the 48×48 menu buttons and the 44×44 mobile-footer buttons. It is no
longer UNVERIFIED; it is a leader decision that Roberto may change.
