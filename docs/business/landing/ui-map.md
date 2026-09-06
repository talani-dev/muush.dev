# Landing — mapa de UI (comportamiento)

> Fuente: Notion → Project State → Landing · Mapa de UI. Sincronizado
> 2026-08-27. Última actualización de la fuente: 2026-08-24.
>
> Pencil (`muush.pen`) documenta **cómo se ve** cada estado. Este
> documento documenta **qué lo dispara y qué pasa después**. Cubre los 8
> frames vigentes: landing y Nosotros, ES y EN, escritorio 1440px y móvil
> 390px.

## ⚠️ Conflicto con el scaffold actual de este repo

El scaffold inicial de este repo (`astro.config.mjs`) configuró
`i18n.routing.prefixDefaultLocale: true`, lo que pone ES en `/es/`. **El
diseño real asume otra cosa** (tabla abajo): ES sin prefijo (`/`), EN con
prefijo `/en/`, y la ruta de Nosotros **no es simétrica** entre locales
(`/nosotros` vs `/en/about`, no una traducción literal). Esto requiere
resolver el enrutamiento i18n como parte de la primera spec de la landing,
no asumir que el scaffold actual ya está bien.

## 1 · Rutas e idioma

| Página | ES | EN |
|---|---|---|
| Landing | `/` | `/en/` |
| Nosotros / About | `/nosotros` | `/en/about` |

Anclas en la landing: `#proposito` · `#servicios` · `#proyectos` ·
`#contacto`. Nosotros lleva el ancla `#work` (sección Work with muush).

**Toggle ES/EN:** cambia a la ruta equivalente de la otra página,
conservando el ancla (`/nosotros#work` en ES → `/en/about#work`, no al
home). **Español de México es el default — no se detecta idioma por IP ni
por `Accept-Language`**: un visitante que llega por un link en español debe
ver lo que le compartieron. La elección se recuerda en `localStorage` para
visitas siguientes al home, nunca para sobrescribir un link directo. El
toggle marca el idioma activo en Bone 100, el inactivo en Ink 200.

> 🔴 Decisión abierta (de Roberto, por SEO): ruta con prefijo `/en/` frente
> a parámetro `?lang=en` o solo estado del cliente. La ruta con prefijo es
> la única que permite indexar las dos versiones por separado y usar
> `hreflang`. El diseño ya asume rutas.

## 2 · Nav

### Escritorio (1440px)

| Elemento | Acción | Destino |
|---|---|---|
| Lockup muush.dev | Click | Home del idioma activo; en el home, scroll suave al inicio |
| Proyectos | Click | Scroll suave a `#proyectos`; desde Nosotros, navega a `/#proyectos` |
| Nosotros | Click | `/nosotros`, queda activo ahí |
| Cuéntanos tu proyecto (botón) | Click | Scroll a `#contacto` + foco en el primer campo; desde Nosotros, navega a `/#contacto` |
| ES / EN | Click | Ver sección 1 |

**Servicios no está en el nav** (decisión tomada) — se llega scrolleando
desde el hero.

> 🔴 Decisión abierta: si el nav es fijo al hacer scroll (hoy solo arriba
> del hero). Si se hace fijo, falta definir el estado comprimido (fondo
> `#1c1416a6`, alto reducido, sombra/borde inferior) — no hay frame de ese
> estado.

### Móvil (390px)

Lockup y toggle ES/EN visibles; todo lo demás colapsa en hamburguesa de dos
líneas (16×1.6, en botón de vidrio `#1c1416a6`, radio 10).

### Menú abierto — ✅ diseñado (frames `MENÚ móvil abierto · ES` / `· EN`, 390×844)

| Zona | Contenido |
|---|---|
| Panel | Vidrio a pantalla completa: `#1c1416a6`, blur 20 |
| Nav | Lockup + toggle ES/EN + botón **Cerrar** (ícono `x` de lucide, vidrio, radio 10, padding 10) |
| Items | Propósito (`#proposito`) · Servicios (`#servicios`) · Proyectos (`#proyectos`) · Nosotros (`/nosotros`) — 30px |
| Divisor | `#FBF8F614`, 342×1 |
| Redes | 3 botones 48×48 (vidrio `#1c1416a6`, radio 10, borde `#FBF8F62E`): LinkedIn · Instagram · TikTok |

> **Decisión 2026-09-06 (Clau):** el menú móvil **no lleva** el botón
> "Cuéntanos tu proyecto" ni "Agenda una llamada →". En desktop el CTA es
> el botón del nav; **en móvil el único CTA son las redes sociales.**
> Esta tabla reemplaza la especificación anterior, que sí los listaba.

> Los glifos `L`/`I`/`T` del `.pen` son placeholder. Los íconos reales y su
> normalización pendiente están en `decisions-open.md` § Íconos de redes.

**Comportamiento:** abre a pantalla completa sobre vidrio oscuro, el ícono
de hamburguesa cambia a X, el scroll del fondo se bloquea, y cierra al
elegir un item / tocar X / Escape. Al cerrar por un ancla, hace el scroll
ya cerrado.

> Nota: el menú móvil sí incluye Propósito y Servicios aunque el nav de
> escritorio no los tenga — en móvil el scroll es mucho más largo.

## 3 · Hero

| Elemento | Acción | Destino |
|---|---|---|
| Cuéntanos tu proyecto (primario, borde LED) | Click | Scroll a `#contacto` + foco en Nombre |
| Agenda una llamada → (texto) | Click | Google Calendar, pestaña nueva, `rel="noopener"` |

El CTA secundario es **texto suelto, sin caja**, en escritorio y móvil — el
hero tiene una sola caja (el botón primario). En móvil el primario mide el
ancho de su texto, no el de la pantalla. Hover del secundario: subrayado o
desplazamiento de flecha, nunca un fondo.

> 🔴 Bloqueante: falta el link real de Google Calendar. Mientras no exista,
> el botón no debe llevar a ningún lado en producción — deshabilitado u
> oculto antes de publicar.

## 4 · Propósito

- **Escritorio:** estático, sin interacción. Tres tarjetas de vidrio rojo
  visibles a la vez — Why ancha arriba al 17%, How y What abajo al 12%. Sin
  hover, sin click, sin destino.
- **Móvil:** carrusel centrado (ver receta abajo). Entrada: Why al centro
  activa, What asoma a la izquierda y How a la derecha (48px de cada lado,
  atenuadas al 50%). Swipe horizontal o tap en vecina para centrarla. Sin
  flechas. Transición de escala y opacidad, sin inclinación 3D. **Loop
  activo** (Why hacia atrás llega a What). Indicador: 3 puntos, activo 8px
  Red 400, inactivos 6px Ink 300. Scroll normal, la sección no secuestra el
  scroll. Las cartas no son links.

## 5 · Servicios

- **Escritorio:** constelación de 5 puntos con halo, unidos por líneas
  finas. Los puntos **no son clickeables** — la landing no tiene páginas de
  servicio. La única interacción real es el spotlight del cursor
  (página completa, no de esta sección).
- **Móvil:** línea de tiempo vertical con **efecto lyrics** — área
  centrada al 100%, vecinas al 45%, siguientes al 22%. Aplica a texto y
  puntos con halo. Seguimiento de scroll con JavaScript.

La línea de cierre de Delivery & Technology Management es texto, no
interactiva.

## 6 · Proyectos

- **Escritorio:** bento asimétrico estático. **Cuatro** slots reservados,
  etiqueta "Próximamente".
- **Móvil:** carrusel horizontal, carta alineada a la izquierda, barra de
  progreso Red 400, hint "Desliza →". Sin flechas, sin loop.

Mientras digan "Próximamente" **no son clickeables** — sin cursor de link
ni hover (un espacio reservado que parece clickeable y no lleva a nada se
lee como sitio roto). Cuando lleguen los permisos de SUMO, cada slot se
vuelve link a su caso de estudio (implica una plantilla de caso que hoy no
existe — alcance nuevo, no entra en esta implementación).

> ⚠️ Discrepancia: escritorio tiene 4 slots, móvil tiene 3 — igualar antes
> de codear o documentar la diferencia explícitamente.

## 7 · CTA final y formulario de contacto

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Nombre | Texto | Sí | Mínimo 2 caracteres |
| Correo | Email | Sí | Formato válido |
| Empresa o proyecto | Texto | No | Libre |
| ¿Cómo te identificas? | Select | Sí | Una opción (ver `content.md`) |
| ¿Qué necesitas? | Textarea | Sí | Mínimo 10 caracteres |
| ¿Cómo prefieres que te contactemos? | Radio | Sí | Correo o WhatsApp, default Correo |
| Número de WhatsApp | Tel + país | Solo si eligió WhatsApp | 10 dígitos para +52, default México |

Campo de WhatsApp: aparece solo si se elige esa opción, transición de alto
y opacidad; si regresa a Correo, se oculta y **su valor se descarta**.

### Flujo de envío

| Estado | Qué ve el usuario |
|---|---|
| Idle | Botón Enviar activo, 216px, centrado |
| Validación fallida | Bordes en Red 400 + mensaje corto; foco al primer error; no se limpia nada |
| Enviando | Botón deshabilitado, texto "Enviando…", borde LED detenido, campos solo lectura |
| Éxito | Formulario se reemplaza por confirmación en la misma tarjeta, sin cambiar de página |
| Error del servidor | Formulario se conserva con todo lo capturado + mensaje con salida alterna a support@muush.dev |

Copy de éxito — **ES**: "Listo, ya lo recibimos. Te respondemos por
[correo/WhatsApp] en menos de 24 horas hábiles." — **EN**: "Got it. We'll
get back to you by [email/WhatsApp] within one business day."

Copy de error — **ES**: "No pudimos enviarlo. Escríbenos a support@muush.dev
o por WhatsApp y lo resolvemos." — **EN**: "We couldn't send it. Write to
support@muush.dev or reach us on WhatsApp and we'll sort it out."

Protección contra spam: honeypot oculto + marca de tiempo mínima. Sin
captcha visible (agrega fricción en el punto de conversión).

> 🔴 **Bloqueante:** a dónde llega el envío. Opciones: Formspree/Web3Forms,
> función serverless a support@muush.dev, o directo a una base del Company
> OS (Notion) para que el lead caiga en CRM. La última es la que conviene
> al negocio. Sin esto el formulario no se puede terminar — ver
> `decisions-open.md`.
> 🔴 Si el envío también dispara un correo de confirmación al usuario.

## 8 · Footer

Columnas: **Navegación** (Servicios, Proyectos `#proyectos`, Propósito
`#proposito`, Nosotros `/nosotros`) · **Contacto** (Agenda una llamada,
support@muush.dev, WhatsApp `wa.me/525639060739` con mensaje precargado) ·
**muush** (Work with muush, FAQ 🔴 no existe, Blog "próximamente" sin link)
· **Redes** (LinkedIn, Instagram `instagram.com/muush.dev`, TikTok
`tiktok.com/@muush.dev`).

Mensaje precargado de WhatsApp — **ES**: "Hola muush, me interesa platicar
sobre un proyecto." — **EN**: "Hi muush, I'd like to talk about a
project."

Móvil: 4 columnas en 2 filas de 2. Lockup del footer lleva al home del
idioma activo.

> 🔴 Bloqueante: qué hacer con FAQ. Un link a una página que no existe es
> un 404 en el footer de **todas** las páginas del sitio.

## 9 · Página Nosotros

**No lleva CTA de "cuéntanos tu proyecto" al final** — existe para conocer
al equipo y reunir CVs, no para vender proyectos.

| Sección | Comportamiento |
|---|---|
| Hero About | Estático, sin botones |
| Equipo | 3 fotos B&N, nombre y rol. Sin link a perfiles, sin hover. Hoy son placeholders |
| Network | Espacio reservado 1280×520px para el globo con pines — no se implementa todavía (ver `content.md`) |
| Work with muush | Formulario de aplicación, ancla `#work` |

### Formulario de aplicación

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Nombre | Texto | Sí | Mínimo 2 caracteres |
| Correo | Email | Sí | Formato válido |
| Área y rol | Select agrupado | Sí | Un rol (las áreas son encabezados, no seleccionables) |
| Portafolio | URL | No | Formato URL si viene lleno |
| LinkedIn | URL | No | Formato URL si viene lleno |
| CV | Upload | 🔴 ver abajo | Solo PDF, máximo 5MB propuesto |
| ¿Cómo prefieres que te contactemos? | Radio | Sí | Correo o WhatsApp, mismo campo condicional |

Desplegable Área y rol — dos columnas, áreas como encabezados (rojo/bold),
roles como opciones (light). Áreas: IT · Product · Project management ·
Sales · Marketing · Creative (roles detallados en `content.md` si se
necesitan, o en la fuente Notion original).

Copy de éxito — **ES**: "Gracias, ya tenemos tu perfil. Te escribimos
cuando haya un proyecto donde encajes." — **EN**: "Thanks, we've got your
profile. We'll reach out when there's a project that fits."

> 🔴 Si el CV es obligatorio — recomendación de la fuente: **opcional**,
> con portafolio/LinkedIn como respaldo.
> 🔴 Dónde se guardan los CVs (implica storage + consentimiento de datos).
> 🔴 El copy de Hero, Network y Work with muush sigue en borrador.

## 10 · Efectos que dependen de JavaScript (con fallback sin JS)

| Efecto | Dónde | Si no hay JS |
|---|---|---|
| Spotlight del cursor | Escritorio, toda la página | Fondo normal, sin glow — no se pierde contenido |
| Efecto lyrics | Servicios, móvil | Las 5 áreas al 100% (nunca atenuadas por default) |
| Carrusel de propósito | Propósito, móvil | Scroll horizontal nativo con `scroll-snap`, se pierde el loop |
| Carrusel de proyectos | Proyectos, móvil | Igual, `scroll-snap` nativo |
| Borde LED | Botón primario | Borde estático en Red 400 |
| Dotted paper | Toda la página | Es CSS (`background-image: radial-gradient`), no depende de JS |

**Spotlight del cursor** (receta): radial Red 400 al 42% en el centro,
radio ~330px, núcleo interior ~90px al 37%. Los puntos del dotted paper
dentro del radio suben de brillo.

### Movimiento reducido

Con `prefers-reduced-motion: reduce` se apagan spotlight, borde LED y
transiciones de carruseles. El efecto lyrics se apaga dejando todo al
**100%**, nunca atenuado. Los carruseles siguen funcionando por swipe.

### Accesibilidad mínima

- Carruseles navegables con teclado (flechas), anuncian la carta activa.
- Los 3 puntos del indicador son botones reales, centran su carta.
- Contraste mínimo 4.5:1 sobre vidrio — si no llega, se oscurece el fondo.
- Foco visible en Red 400, nunca se elimina.

## Frames de referencia visual en `muush.pen`

`Estados de formulario` · `Estados de scroll · servicios móvil` ·
`Estados del carrusel · propósito móvil` · `DEMO spotlight cursor`.
