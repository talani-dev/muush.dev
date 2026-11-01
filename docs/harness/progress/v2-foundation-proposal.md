# Feature 41 · Propuesta para aprobación de Roberto

> Redactada por el leader el 2026-10-31. A y B aprobadas por Roberto el
> 2026-10-31 y aplicadas.

## A · Enmienda a la constitución (2.0.1 → 2.1.0, MINOR)

MINOR porque el Artículo VII se amplía materialmente (nueva familia de tokens,
nueva regla de tipografía, nueva regla responsive) sin quitar ningún principio.

### A1 · Artículo VII — texto nuevo propuesto

> ### VII. Design Tokens Discipline
>
> Components MUST NOT hardcode color or spacing literals (hex, rgb, oklch, or
> arbitrary Tailwind values like `bg-[#123456]`). Every visual value goes
> through the CSS custom properties defined in `app/assets/css/global.css`
> and is consumed as Tailwind utility classes. Since the Muush 1.0 redesign
> the palette is the `--m1-*` family (neutral base, brasa, acero), taken from
> the `m1-*` variables of the `.pen` and `docs/handoff/muush-1.0/`. The v1
> families (`--bone-*`, `--ink-*`, `--red-*`, `--wine-*`) remain only until
> feature 47 removes them; new code MUST NOT use them.
>
> The fluid scale exists so a component states its intent once and the
> desktop↔mobile difference resolves through `clamp()`. Reaching for a
> breakpoint to change a font size or a padding is a signal the token is
> missing, not that the token should be bypassed.
>
> **Responsive anchors.** The design file draws 390 px and 1440 px. At those
> two widths the build MUST match the design. At every other width, sizes and
> spacing MAY differ from a literal interpolation so the layout stays sound;
> color, components, copy and behavior MUST NOT.
>
> Poppins (weight 500) is used for the logo, the wordmark and headings.
> Instrument Sans is everything else.

### A2 · Development Workflow — corregir un párrafo desactualizado

Hoy dice que las medidas salen de `design-extract.md` y que los subagentes
leen ese archivo. Eso contradice `rules.md` § R32 (el `.pen` manda y el leader
pasa los valores). Propuesta:

> Design values come from the `.pen` file, which only the leader session can
> read (Pencil MCP). The leader extracts the values a subagent needs and
> passes them in its task; a subagent missing a value asks the leader instead
> of falling back to `docs/business/`. For Muush 1.0, `docs/handoff/muush-1.0/`
> carries exact tokens and behavior as reference code.

### A3 · Templates

Revisar `.specify/templates/*`; ninguno nombra familias de tokens ni fuentes,
así que se espera "sin cambios".

## B · `docs/business/` — estrategia propuesta

`docs/business/` tiene ~2 900 líneas escritas para el diseño v1 (claro, radar,
glows, Propósito, Proyectos). Reescribirlo todo de golpe es mucho y casi todo
quedará obsoleto con la feature 47. Propuesta:

1. **Nuevo `docs/business/muush-1.0.md`**, autoritativo para v2, con:
   - Paleta Brasa y acero, tipografía, vidrio, botones (del Kit `Cs3AJ`).
   - Estructura de páginas y secciones: Home, Nosotros, Preguntas, 404, menú
     móvil, formularios, con los IDs de frame.
   - Copy aprobada ES/EN tal como está en el `.pen` (el leader la extrae).
   - Fondos animados: qué shader va en cada sección (remite al README del
     handoff).
   - Decisiones: Propósito y Proyectos se retiran; el aviso de privacidad
     solo habilita el botón y no se envía; el campo de sitio web no se
     construye; anclas responsive 390/1440; el logo no cambia.
2. **Aviso al inicio** de `branding.md`, `landing/design-extract.md`,
   `landing/ui-map.md` y `landing/content.md`: "Describe el diseño v1. Para v2
   manda `muush-1.0.md`; este archivo se retira en la feature 47."
3. **Sin cambios** en `overview.md`, `services.md`, `messaging.md`,
   `form-api-contract.md` y `rules.md` (siguen vigentes; `rules.md` § R32 ya
   dice que el `.pen` manda).
4. En la feature 47 se borran o reescriben los documentos v1.

Si apruebas la estrategia, el leader redacta `muush-1.0.md` y te lo muestra
antes de escribirlo.

## C · Decisiones que siguen abiertas (no bloquean la 41)

| # | Pregunta | Bloquea |
|---|---|---|
| C1 | Aviso de privacidad y Términos: ✅ tendrán páginas propias (Roberto, 2026-10-31). Entran en v2 como feature 48; Clau las diseña y el texto legal llega después | — |
| C2 | ✅ `/es/preguntas` ↔ `/en/faq`, indexada (Roberto, 2026-10-31) | — |
| C3 | Cursor personalizado y spotlight: ✅ se quedan (Roberto, 2026-10-31); se ajustan al fondo oscuro en la 42 | — |
| C4 | Features 15, 18 y 19: ✅ marcadas `superseded` (Roberto, 2026-10-31) | — |
