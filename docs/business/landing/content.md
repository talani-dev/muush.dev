# Landing — contenido y copy aprobado

> Fuente: Notion → Project State → Landing · Contenido y copy. Diseño
> cerrado 2026-08-20. Sincronizado 2026-08-27.
>
> Esta página es el **contenido**. El comportamiento (qué dispara qué,
> destinos, estados) vive en `ui-map.md`.

## Decisiones ya tomadas (marco general)

| Tema | Definición |
|---|---|
| Stack | Astro — Roberto codea |
| Diseño | Pencil (`Documents/Muush/Landing Page/muush.pen`), Clau diseña |
| Alcance | Solo landing page + Nosotros, con jerarquías claras |
| Idioma | Bilingüe ES + EN — no cerrarse a clientes extranjeros |
| Precios | **NO se muestran.** Llamado a discovery, nunca lista de precios |
| Categoría | Technology Solution Studio |
| Design system | Descartado por ahora — el UI kit sale como **subproducto** de la landing, no como proyecto aparte |

## Arquitectura de páginas

El sitio **no** es una sola página de scroll infinito:

| Página | Contenido |
|---|---|
| **Main page (landing)** | Hero · Propósito · Servicios · Proyectos · CTA final · Footer |
| **Nosotros / About us** | Todo lo de equipo y network (sale de la main page). Incluye el espacio reservado del globo. Referencia de arquitectura: papisandmamis.org |

Orden de secciones en la landing: Hero → Propósito → Servicios → Proyectos
(portafolio) → CTA final → Footer.

## Dirección visual (para contexto — el detalle vive en `branding.md`)

La landing es **oscura de principio a fin** (fondo Ink 500 en toda la
página, sin alternar claro/oscuro). El contraste se construye con
degradados, vidrio y piezas 3D metálicas, no alternando fondos. Dotted
paper estilo atlassian.design con spotlight de cursor (JavaScript). Para
la landing específicamente, **la regla del 10% de rojo se flexibiliza** —
diverge del límite general de `branding.md`.

## Navegación (contenido — ver `ui-map.md` para comportamiento exacto)

Orden en el header: **proyectos · nosotros · cuéntanos tu proyecto · ES/EN**.
**Servicios no va en el nav** — se llega scrolleando desde el hero.

## Tagline oficial

Ver `../messaging.md` — "business and code" / "hablamos negocio y código".

## Canales de contacto

- **Correo:** support@muush.dev
- **WhatsApp Business:** 5639060739
- **Agenda:** Google Calendar — 🔴 falta el link real, ver `decisions-open.md`

---

# Propósito · Golden Circle ✅ aprobado

Enfoque: **Golden Circle de Simon Sinek** — Why → How → What. No abrir con
"hacemos software", sino con la razón por la que existe el estudio. Misión
y visión formales **no van en la landing** (no son prioridad ahora).

Regla de esta sección: los tres bloques van igual de concisos — una idea
por bloque, máximo dos frases. Nunca definirse por lo que **no** se es. El
modelo de talento distribuido **no** vive aquí — vive en Nosotros.

## WHY · por qué existe muush

**ES-MX**
> Construimos con el estándar de las aplicaciones que admiramos.
> Tu negocio merece estar a la misma altura.

**EN**
> We build to the standard of the apps we admire.
> Your business deserves to be held to it.

> Regla aprendida: nada de referencias geográficas tipo "aquí"/"here" — la
> tensión del Why es "lo que aguantas vs. lo que admiras", nunca "aquí vs.
> allá".

## HOW · cómo lo hacemos

**ES-MX**
> Con precisión: lo que tu negocio necesita, sin relleno.
> Un technology solution studio que responde como un solo equipo.

**EN**
> With precision: what your business needs, nothing padded.
> A technology solution studio that answers as one team.

## WHAT · qué hacemos

**ES-MX**
> Diseñamos y construimos soluciones digitales alrededor de tu negocio.

**EN**
> We design and build digital solutions around your business.

---

# Servicios

Ver `../services.md` para los 5 briefs completos (ES/EN) — ya viven ahí
para no duplicar. Concepto visual: constelación de 5 puntos rojos con halo
sobre la geometría del isotipo. Sin numeración, sin tarjetas.

---

# CTA

- **Primario:** "cuéntanos tu proyecto" / "tell us about your project" —
  lleva al formulario de contacto. Único botón con borde LED de la página.
- **Secundario:** "agenda una llamada →" / "book a call →" — Google
  Calendar. Es **texto suelto, sin caja**, en escritorio y móvil (no un
  botón).

---

# Equipo & network (vive en Nosotros, no en la landing)

Modelo de talento distribuido: no hace falta ser una empresa de mil
personas para entregar bien — muush reúne al talento indicado para cada
proyecto y le da libertad de elegir con quién, en cuánto tiempo y desde
dónde trabaja. Esa flexibilidad es lo que fideliza a la red y permite
entregar sin estructura pesada.

Fotos del equipo y de la red: siempre en **blanco y negro**.

**Idea guardada, no implementar todavía:** globo terráqueo con pines de
radar mostrando desde dónde trabaja el equipo. Con solo 3 personas hoy, un
globo con 1-2 pines comunica lo contrario de lo buscado — esperar a tener
red suficiente. Dejar el espacio reservado (1280×520px) desde ahora, igual
que con portafolio.

---

# Formulario "cuéntanos tu proyecto"

Campo **"¿cómo te identificas?"** (select) — pensado para que llegue
cualquier perfil, no solo empresas constituidas:

- Empresa / Company
- Emprendedor o persona física / Independent or sole proprietor
- Startup
- Creador de contenido o marca personal / Creator or personal brand
- Otro / Other

> Nota: "influencer" y "content creator" se fusionan en una sola opción a
> propósito — para calificar un proyecto de tecnología ambos se comportan
> igual, separarlos agrega fricción sin dar información útil.
>
> ⚠️ **Discrepancia con `ui-map.md`:** el archivo de diseño (Pencil) tiene
> **6** opciones (agregó "Restaurante o bar", sin documentar aquí). Ver
> `decisions-open.md`.

Campo "¿cómo prefieres que te contactemos?": correo o WhatsApp — evita
forzar videollamada a quien no la quiere. El campo de WhatsApp es
condicional (solo aparece si se elige esa opción).

Campos completos y validaciones: ver `ui-map.md` § 7.

---

# Footer

- Copyright
- Redes: LinkedIn /muush-dev · Instagram @muush.dev · TikTok @muush.dev
- **Work with muush** — dirigido a talento/network que quiera colaborar,
  no a clientes
- FAQ — 🔴 la página no existe todavía, ver `decisions-open.md`
- Blog — espacio previsto, "próximamente", sin link
- Categoría: Technology Solution Studio

---

# Convención de emojis en el diseño

Pencil no renderiza emojis. Donde el copy final lleva uno, el archivo de
diseño usa el token `[emoji: descripción]` (ej. `[emoji: cohete]`) para que
al implementar se sepa exactamente qué pieza va ahí.

# Reglas de redacción de la landing

Idénticas a las de `../messaging.md` — no hay reglas adicionales
específicas de la landing.
