# Branding — sistema visual

> Fuente: Notion → Branding (branding book v1.0, actualizado con la
> sesión de materiales/superficies del 2026-08-17) y Project State
> (dirección visual v2 de la landing, 2026-08-18). Sincronizado 2026-08-27.
>
> ⚠️ **Esto reemplaza los valores placeholder que hoy están en
> `src/styles/global.css`** (comentario "TODO: reemplazar con los valores
> del branding book"). Aplicar estos valores es trabajo de una feature
> futura, no de este documento — pero son los valores reales, no otro
> placeholder.

**Valores de marca:** custodia · claridad · continuidad · criterio.

## Color — tokens reales (reemplazan el placeholder de global.css)

| Token | 100 | 200 | 300 | 400 (base) | 500 |
|---|---|---|---|---|---|
| `--red-*` (acento, ≤10% de superficie) | `#FAD9DE` | `#F0A3AE` | `#E36B7C` | **`#CF3147`** | `#9E2436` |
| `--wine-*` (estructura) | `#E9D3D7` | `#C08A94` | `#8A4552` | **`#591F28`** | `#3B141B` |
| `--ink-*` (texto/estructura) | `#D9D9D9` | `#A6A6A6` | `#737373` | `#404040` | **`#262626`** |
| `--bone-*` (fondo, ~60%) | `#FBF8F6` | **`#F2EBE7`** | `#E0D3CC` | `#C7B4A9` | `#A38D80` |

Proporción base del sistema: **60% bone/ink · 30% ink/wine · 10% red**. El
rojo nunca supera el 10% de la superficie **en el sistema de marca**.

> ⚠️ **La landing específicamente flexibiliza la regla del 10% de rojo**
> (decisión 2026-08-18, dirección visual v2) — ver `landing/ui-map.md` y
> `landing/content.md`. La regla del 10% sigue vigente para el resto del
> sistema de marca (documentos, redes, print).

Solo hay **5 tokens por rampa** (100–500), no la escala 50–950 que se usó
como placeholder en el scaffold inicial. Si se adopta el sistema real, la
escala de Tailwind debe ajustarse a 5 pasos, no 10.

### Degradados (solo 2 variantes, nunca una tercera)

- **B (el que se aplica):** `linear-gradient(200deg, #CF3147 0%, #262626 100%)`
  — usado en fondos: portadas, banners, cintillos, CTA final de la landing.
- **A (reserva de paleta, no se aplica hoy):**
  `linear-gradient(135deg, #262626 0%, #591F28 34%, #CF3147 66%)`

### Sobre qué fondo va qué trazo

- bone 200 → trazo ink 500
- ink 500 → trazo bone 100
- red 400 → **todo bone 100, punto incluido** (nunca rojo sobre rojo)
- foto → siempre capa de contraste
- degradado B → todo bone 100, lockup en el tercio Red 400

## Tipografía (aplicada en el repo desde la feature 006 — ver la nota de abajo)

| Uso | Fuente |
|---|---|
| Logo / wordmark (exclusivo) | Poppins SemiBold 600 · tracking −3% |
| Títulos (minúsculas) | Instrument Sans SemiBold 600 · tracking −3% |
| Cuerpo | Instrument Sans Regular 400 / Medium 500 |
| Técnico, labels, specs | Instrument Sans Medium 500 · tracking +6%, tamaño reducido |

**Solo dos tipografías en el sistema: Poppins e Instrument Sans.** IBM Plex
Mono quedó fuera del sistema (corrección 2026-08-18) — lo que antes iba en
mono se resuelve con Instrument Sans en tamaño reducido y tracking
abierto.

> ⚠️ **Corregido 2026-09-07 (feature 006 · fondo del sitio y chrome de marca).**
> Estas dos líneas decían que la tabla de arriba "ya coincide con las
> `@font-face` declaradas en `src/styles/global.css`". **Las dos mitades eran
> falsas.** Las `@font-face` escritas a mano declaraban Poppins 400/700 e
> Instrument Sans 400/700 — dos pesos que el diseño no usa en ninguna parte y
> ninguno de los tres que sí pide esta tabla (Poppins 600, Instrument Sans
> 400/500/600) — y apuntaban a archivos que nunca existieron en
> `public/fonts/`, así que el sitio entero se renderizaba en la tipografía de
> sistema. Además la ruta citada no existe desde la migración a Nuxt: el
> archivo es `app/assets/css/global.css`.
>
> **Estado real desde la feature 006:** las cuatro declaraciones escritas a
> mano se borraron. Las caras las emite `@nuxt/fonts`, configurado en
> `nuxt.config.ts` exactamente con los pesos de esta tabla; los binarios se
> descargan en tiempo de build y se sirven desde el propio origen del sitio
> (`/_fonts`), sin ninguna petición a un tercero en runtime. La verificación
> es un grep sobre `.output/public` — ver `rules.md` § R31.

## Logo — assets fuente (isotipo, lockup C)

> Fuente: sincronizado 2026-08-27. Archivos locales, no vienen de Notion.

Los 3 SVG oficiales del isotipo (lockup C · isotipo solo) viven en:

```
/Users/betonajera/Library/Mobile Documents/com~apple~CloudDocs/Pictures/Icons/Muush/
  muush-dark.svg          — para fondo claro (bone): trazo Ink 500, punto Red 400
  muush-light.svg         — para fondo oscuro (ink 500): trazo Bone 100, punto Red 400
  muush-triple-white.svg  — para fondo Red 400 o el tercio rojo del degradado B: todo Bone 100, punto incluido
```

### Íconos de redes sociales

Los SVG oficiales de marca (no glifos tipográficos) viven en:

```
/Users/betonajera/Library/Mobile Documents/com~apple~CloudDocs/Pictures/Icons/Redes/
  Instagram/Instagram_Glyph_White.svg
  TikTok/tiktok-logo-white.svg
  Linkedin/linkedin-logo-white.svg
```

⚠️ **Requieren normalización antes de inlinearse** (viewBox inconsistentes,
`fill` blanco puro hardcodeado, CSS embebido en el de Instagram, DOCTYPE y
metadata en el de TikTok). Detalle completo y pasos en
`landing/decisions-open.md` § Íconos de redes sociales.

### Isotipo — geometría compartida

Los tres SVG del isotipo comparten el mismo `viewBox="14.5 38.5 70.5 39.5"` y la misma
geometría (`circle cx=21 cy=45 r=6.5` + `path M21 72 a17 17 0 0 1 34 0 a12
12 0 0 1 24 0`, `stroke-width=12`, `stroke-linecap=round`) — solo cambian
los colores de relleno/trazo, exactamente como documenta la sección
"Aplicación sobre fondos" de este archivo. No hay lockup A (horizontal con
wordmark) ni B (apilado) como archivos — solo el isotipo solo, en sus tres
variantes de fondo.

## Isotipo

Trazo continuo de dos crestas decrecientes con un punto suspendido.
Terminales redondos siempre. El punto rojo es el **único** acento de color
del sistema. Nunca: rellenar el trazo, rotarlo, separar el punto de su
posición.

Geometría oficial (para reconstrucción vectorial):

```
circle: cx=21 cy=45 r=6.5
path: M21 72 a17 17 0 0 1 34 0 a12 12 0 0 1 24 0
stroke-width: 12 · stroke-linecap: round
viewBox recorte: 14.5 38.5 70.5 39.5
viewBox avatar/favicon: 0 0 100 100 con transform translate(3,-8)
strokeWidth por instancia = 12 × (ancho de la instancia ÷ 70.5)
```

### Lockups (u = altura del isotipo)

- **A · horizontal** — isotipo + wordmark a 0.55u, texto a 0.82u. Dos
  versiones oficiales: "muush" y "muush.dev". El punto de ".dev" siempre en
  Red 400.
- **B · apilado** — isotipo 1.15u arriba, wordmark 0.66u centrado, gap
  0.34u.
- **C · isotipo solo** — favicon/avatar. Sobre Red 400 la marca va completa
  en Bone 100, punto incluido. Nunca rojo sobre rojo.

### Reglas duras

- Área de respeto: 0.5u por los cuatro lados.
- Mínimos: horizontal 120px/28mm · isotipo 16px/8mm (12mm en troquel).
- Bajo 120px: solo isotipo, nunca el horizontal comprimido.
- Sobre fotografía: siempre capa de contraste debajo.

## Materiales y superficies (interfaz — no la marca en sí)

La identidad (isotipo/isologo/wordmark) se queda **plana**, siempre 2D.
Vidrio, metal y degradado-como-material viven en la **interfaz** (fondos de
sección, tarjetas, botones, headers, estados, microanimación), nunca en la
marca en sí.

- **Alcance:** permitido en digital (landing, app, iconos). **Prohibido en
  print** (contratos, NDA, propuestas).
- **Glass (liquid glass):** Bone 100 al 10–12% sobre oscuro · Ink 500 al 6%
  sobre claro · blur 20px superficies / 16px controles · borde 1px Bone 100
  al 22–28% · highlight interior 1px arriba al 35% · radio 12px controles /
  16px tarjetas.
  - Sobre fondo con color o foto: **versión oscura** (Ink 500 al 55–65%,
    blur 20px). La receta clara solo sobre fondos planos oscuros de la
    paleta — sobre Bone 100 es prácticamente invisible.
  - Nunca vidrio sobre vidrio (un solo plano traslúcido por capa).
- **Legibilidad primero:** contraste ≥ 4.5:1; si no llega, se oscurece el
  fondo — nunca se sube la opacidad del vidrio.
- **Borde LED** (única animación de control, un botón primario por
  pantalla): anillo cónico de 1.5px con máscara, giro cada 2.6s lineal,
  arranca en hover y se detiene al salir.
  > ⚠️ **Corregido 2026-09-06 contra el `.pen`:** las paradas reales son
  > `Red 400 → Bone 100 → #cf3247` (Red 400 otra vez, para cerrar el loop
  > sin salto visual). **Wine 400 no aparece en el gradiente** — la
  > redacción anterior de esta línea, heredada de Notion, era incorrecta.
  > Ver `landing/design-extract.md` § 4.
- **Metálico/espejo:** ink anodizado (headers, hero, cards grandes) · red
  anodizado (acentos) · espejo bone (superficies claras, iconos). Nunca al
  isotipo. Nada de plateado neutro ni dorado.
- **Fotografía: toda en blanco y negro.**

## Voz y tono (resumen — detalle completo en `messaging.md`)

- **Sí:** estudio, no agencia. Experto sereno: técnico pero cálido, directo
  sin ser frío, seguro sin arrogancia.
- **No:** degradados morados, estética genérica de SaaS, "transformación
  digital", lenguaje de consultora inflada, submarcas.

## Presencia digital — handles oficiales

- **Dominio:** muush.dev ✅ asegurado
- **LinkedIn:** /muush-dev
- **Instagram:** @muush.dev
- **TikTok:** @muush.dev

## Pendientes de branding (no bloquean implementación, pero afectan assets)

- Exportar assets PNG de alta resolución (isotipo, lockups, avatares).
- Definir iconografía propia (trazo, terminales redondos, grid).
- Fotografía B&N real del equipo (hoy son placeholders).
- El branding book (Claude Design) aún dice "IT services & consulting" y
  "sistemas que no pueden fallar" en la portada — **ninguna de las dos es
  válida**, la página de Notion (y este archivo) es la fuente de verdad
  vigente, no el PDF/book.
