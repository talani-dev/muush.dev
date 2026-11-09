# Feature 51 · Preguntas abiertas para Roberto

Contesta con el número y una letra ("1A, 2B…") o "sí" para aceptar la
recomendación. **Bloqueantes: 1–4.** Las 5–8 tienen un default razonable que
el spec ya aplica si no dices nada.

El `.pen` no lo leyó el spec_author (sin Pencil MCP en subagentes): todo sale
del README, los JSON y los PNG del handoff `preguntas-muush-1.0`.

---

## 1 · Espaciado vertical vs. el centrado de secciones (bloqueante)

El handoff pide padding fijo: escritorio `300` arriba / `200` abajo; móvil
`200` arriba y `64` abajo de la tarjeta. El fix 8c9f79e dice: toda sección
mide al menos una pantalla, contenido centrado, arriba `seccion-arriba`
(header + 24–32 px). Con esa regla el pill quedaría a ~120 px, encima de la
franja de luz (84–684 px), y el README pide "franja entre el header y el
título, todo el texto sobre negro".

- **A (recomendada):** esta página usa los valores del handoff como tokens
  fluidos (arriba 200 → 300, abajo 64 → 200), conserva el mínimo de una
  pantalla y **no** centra verticalmente. El contenido a 1440 ya es más alto
  que 900 px, así que centrar casi no cambiaría nada.
- **B:** regla de centrado igual que el resto del sitio; el título queda
  sobre la franja.
- **C:** centrado, pero con arriba = valor del handoff.

## 2 · "Preguntas" en el header (bloqueante)

El README y los PNG dibujan la barra `Servicios · Nosotros · Preguntas` con
Preguntas activa. Hoy la barra es `Inicio · Servicios · Nosotros`, y tú
decidiste en las features 43 y 46 que Preguntas **no** va en la barra ni en el
menú móvil, "permanentemente" (`shell/data/navigation.ts`).

- **A (recomendada):** agregar "Preguntas" / "FAQ" como cuarto ítem, después
  de Nosotros, en la barra y en el menú móvil; activo en esta página. Inicio
  se queda.
- **B:** la barra no cambia; en esta página no se ilumina nada (como hoy).
- **C:** la barra exacta del diseño, sin Inicio.

## 3 · Dónde vive el código: módulo nuevo `faq` (bloqueante)

La feature 46 dejó escrito que, al tener preguntas reales, Preguntas pasa a su
propio módulo, y eso requiere enmendar el Artículo I de la Constitución (lista
de módulos). Una enmienda necesita tu aprobación por escrito.

- **A (recomendada):** nuevo módulo `app/features/faq/` (ui/logic/data) y
  enmienda PATCH 2.1.4 → 2.1.5 del Artículo I que lo agrega a la lista.
- **B:** se queda dentro de `shell`, sin enmienda.

## 4 · Texto de llms.txt (bloqueante: es copy)

Decidido en el spec: no se copian las 20 preguntas a `llms.txt` (es un índice
de enlaces; las respuestas van en el HTML y en el FAQPage). Solo cambian las
dos líneas de Preguntas, que hoy dicen "en construcción". Borrador:

- `- [FAQ](https://muush.dev/en/faq): frequently asked questions about the free assessment, pricing and payments, process and timeline, delivery and ownership, and working with muush.`
- `- [Preguntas](https://muush.dev/es/preguntas): preguntas frecuentes sobre el diagnóstico gratis, precios y pagos, proceso y tiempos, entrega y propiedad, y cómo trabajar con muush.`

- **A (recomendada):** aprobar tal cual.
- **B:** cambiarlo (dime el texto).

---

## 5 · Poster de la franja (no bloqueante)

El poster actual (`preguntas-acanalado.webp`) es del fondo viejo; los uniforms
nuevos dibujan otra franja y el handoff no trae poster nuevo. Se ve sin WebGL
y mientras carga.

- **A (recomendada):** el implementer saca un cuadro fijo del propio shader
  con los uniforms nuevos (1440 × 600) y tú lo apruebas al revisar.
- **B:** Clau exporta el poster.

## 6 · El tema en la URL (no bloqueante)

- **A (recomendada):** al elegir un tema, la URL cambia a `#precios` sin
  saltar ni llenar el historial; al cambiar de idioma se conserva el tema por
  número (`#precios` → `#pricing`).
- **B:** la URL solo se lee al entrar; el cambio de idioma vuelve al tema 01.

## 7 · Sin JavaScript (no bloqueante)

Las 20 respuestas siempre están en el HTML (buscadores e IA las leen). Sin
JavaScript el visitante ve el tema 01 con su primera respuesta abierta.

- **A (recomendada):** aceptarlo.
- **B:** sin JavaScript mostrar los 5 temas abiertos uno tras otro.

## 8 · Medición (no bloqueante)

- **A (recomendada):** "Agenda una llamada" de la tarjeta sigue mandando
  `book_call_click` (`cta_location: faq`); los dos `support@muush.dev` mandan
  `contact_click` (correo, `faq`); pestañas y preguntas no mandan eventos.
- **B:** además, un evento al abrir cada pregunta (requiere actualizar el plan
  de medición).

---

## Respuestas de Roberto (2026-11-08)

- **1 → B.** Centrado igual que el resto del sitio (regla del fix 8c9f79e). Si no
  le gusta al verlo, se cambia a los valores del handoff de Clau.
- **2 → A.** Barra `Inicio · Servicios · Nosotros · Preguntas` (centrada), también en
  el menú móvil; "Preguntas"/"FAQ" activo en esta página. Revoca la decisión de las
  features 43/46 de dejar Preguntas fuera de la barra.
- **5 → exportado del .pen.** El leader exportó la capa `Fondo · vidrio acanalado` de
  los frames elegidos con el Pencil MCP: escritorio `h3JSJ` (1440 × 600) y móvil
  `xJCj0` (390 × 300), en
  `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/faq-poster/{h3JSJ,xJCj0}.png`.
  El implementer los convierte a webp y reemplaza `preguntas-acanalado.webp`.
- **3 → A.** Módulo nuevo `app/features/faq/` y enmienda PATCH 2.1.4 → 2.1.5 del
  Artículo I que lo agrega a la lista de módulos. Aprobada por Roberto por escrito
  en esta respuesta.
- **4 → A.** Las dos líneas de llms.txt aprobadas tal cual; las 20 preguntas NO se
  copian a llms.txt.
- **6 → A.** El tema elegido actualiza el hash sin saltar ni llenar el historial; el
  cambio de idioma conserva el tema por número.
- **7 → A.** Sin JavaScript: tema 01 con su primera respuesta abierta.
- **8 → A + B.** Se mantienen `book_call_click` (`cta_location: faq`) y
  `contact_click` (correo, `faq`), y ADEMÁS un evento nuevo al abrir una pregunta
  (solo al abrir, no al cerrar), con el tema y la pregunta como parámetros. Requiere
  actualizar el plan de medición (`docs/harness/progress/tracking-plan-49.md` y el
  catálogo `app/shared/data/trackingEvents.ts`) y, en GA4, registrar las
  dimensiones nuevas.

## Gate (2026-11-08)

Roberto aprobó el spec ("si"), incluidos: etiqueta de lector de pantalla
`faq.tabsLabel` = "Temas" / "Topics", y `faq_question_open` solo a GA4 (no Meta).

## Revisión 1 (2026-11-08)

Header de 4 ítems entre ~1024 y ~1077 px: 26 px fuera de centro y pegado al
botón ES (FR-021). Roberto eligió **A**: corregirlo solo en ese rango (menos
padding/gap en los ítems de la barra) para que quede centrado y con aire junto
a ES; arriba de ~1080 px no cambia nada.

## Visto bueno visual (2026-11-08)

Roberto revisó la página renderizada y la ve igual que el diseño: se queda el
centrado (respuesta 1 → B), sin pasar a los valores del handoff.
