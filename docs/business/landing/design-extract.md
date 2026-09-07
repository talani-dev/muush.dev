# Extracto del diseño — medidas reales del `.pen`

> **Extraído directamente de `/Users/betonajera/Downloads/muush.pen` el
> 2026-09-06** vía el MCP de Pencil, leyendo los 4 frames vigentes
> (`Landing ES · v4`, `Landing ES · móvil`, `Nosotros ES`,
> `Nosotros ES · móvil`) más los 2 nuevos de `MENÚ móvil abierto`.
>
> **Por qué existe este archivo:** el MCP de Pencil es un puente en vivo
> hacia la app de escritorio y **solo funciona en la sesión interactiva
> principal** — los subagentes (`spec_author`, `implementer`) no lo
> heredan aunque lo tengan en su lista de `tools`. Este archivo es la
> fuente de verdad de medidas para ellos: **léelo en vez de intentar
> abrir el `.pen`.**
>
> Los valores aquí son literales del archivo de diseño. Donde hay un token
> (`$red-400`, `$bone-100`, `$font-display`) es porque el diseño ya lo usa
> como variable — mapea a los tokens de `src/styles/global.css`.

---

## 0 · Cómo leer los colores

El diseño usa hex de 8 dígitos (RGBA). Los más repetidos:

| Hex | Equivale a | Uso |
|---|---|---|
| `#1c1416a6` | ink oscuro @65% | Vidrio oscuro: Pill, Botón, formularios, panel del menú |
| `#FBF8F60F` | bone-100 @6% | Vidrio neutro estándar |
| `#FBF8F61A` | bone-100 @10% | Vidrio neutro destacado |
| `#FBF8F60A` | bone-100 @4% | Vidrio neutro tenue |
| `#FBF8F62E` | bone-100 @18% | Borde estándar |
| `#CF31472B` | red-400 @17% | Vidrio rojo destacado |
| `#CF31471F` | red-400 @12% | Vidrio rojo estándar |
| `#CF314778` | red-400 @47% | Borde rojo destacado |
| `#CF314759` | red-400 @35% | Borde rojo estándar |

---

## 1 · GlassPanel — el patrón que unifica todo

**13 elementos** entre las dos páginas usan la misma receta con distinta
opacidad. Es el componente de mayor impacto del sistema.

| Variante | Fill | Stroke | Blur | Radio D/M | Padding D/M | Usado en |
|---|---|---|---|---|---|---|
| `red-strong` | `#CF31472B` | `#CF314778` | 22/20 | 22/18 | 32/22 | Tarjeta **Why** |
| `red-soft` | `#CF31471F` | `#CF314759` | 22/20 | 22/18 | 32/22 | Tarjetas **How**, **What** |
| `bone-strong` | `#FBF8F61A` | `#FBF8F62E` | 16 | 20/18 | 28/22 | **Caso 01** (proyecto destacado) |
| `bone` | `#FBF8F60F` | `#FBF8F62E` | 16 | 20/18 | 28/22 · 22/18 | **Casos 02–04**, **Foto B&N** ×3 |
| `bone-faint` | `#FBF8F60A` | `#FBF8F229` | 16 | 20/18 | 32/22 | **Reservado · globo**, **Upload CV** |
| `dark` | `#1C1416A6` | `#FBF8F63B` | 22 | 20/18 | 34/24 | **Ambos formularios** |

> El `dark` también es el fill de Pill, Botón primario, botones de red y
> el panel del menú móvil — pero esos tienen su propio borde/radio, así
> que no reusan la variante completa.

---

## 2 · Radar — 3 tamaños

> ⚠️ **Leer antes de implementar (aclarado 2026-09-06).** En el `.pen` el
> radar son 3 elipses concéntricas, pero **los dos halos no son aros que
> deban existir en el sitio**: son la manera de dibujar la animación en un
> mockup estático. Pencil no anima, así que la diseñadora congeló el pulso
> del radar como círculos concéntricos para comunicar la intención.
>
> **En código el radar es: el punto rojo + el ping animado.** Los dos halos
> no se replican — hacerlo produce un punto con aros que además pulsa, que
> es el efecto dibujado más el efecto real, duplicado.
>
> Lo que sí se conserva de la tabla de abajo es **el espacio reservado**
> (la medida de `halo2`), porque las medidas de la Pill y de las secciones
> están calculadas contra ese footprint. El punto va centrado dentro.

Medidas del archivo de diseño: `halo2` (externo) + `halo` (medio) +
`dot` (núcleo, siempre `$red-400`).

| Tamaño | halo2 | halo | dot | Dónde |
|---|---|---|---|---|
| **sm** | 20 · `#CF31471F` | 14 @(3,3) · `#CF31474D` | 7 @(6.5,6.5) | Dentro de **Pill sección** |
| **md** | 30 · `#CF31471F` | 20 @(5,5) · `#CF31474D` | 12 @(9,9) | **Propósito** ×3 y **Servicios** ×5 (desktop) |
| **sm-alt** | 22 | 16 | 10 | **Servicios móvil** (con opacidades del efecto lyrics) |

**Cómo se traduce a código:**

| Tamaño | Footprint reservado | Punto rojo | Halos |
|---|---|---|---|
| `sm` | 20×20 | 7 | no se replican |
| `md` | 30×30 | 12 | no se replican |
| `sm-alt` | 22×22 | 10 | no se replican |

El punto va centrado en su footprint, y el ping se expande desde el punto.
Ver `ui-map.md` § Receta del ping del radar.

Servicios móvil aplica opacidad al conjunto radar+texto según posición:
`0.18` (lejos) · `0.45` (vecino) · `1` (activo).

---

## 3 · Pill sección

```
frame  fill #1c1416a6 · cornerRadius 999 · stroke #FBF8F62E 1px
       gap 11 · padding [9,20,9,10] · alignItems center
├── Radar sm (20×20, layout none)
└── Texto  $bone-200 · $font-display · 13px/500 · letterSpacing 0.7
```

**Móvil:** idéntico salvo `fontSize: 12`.

**11 instancias** — solo cambia el texto:

| Página | Labels |
|---|---|
| Landing | `Technology solution studio` (eyebrow del hero) · `Propósito` · `Servicios` · `Delivery` · `Proyectos` · `Contacto` |
| Nosotros | `Nosotros` · `Equipo` · `Network` · `Work with muush` |

→ Un solo prop real: `label`. Más `size` si se quiere resolver el 13/12 sin
media query (mejor con token fluido).

---

## 4 · Botón primario

```
frame  fill #1c1416a6 · cornerRadius 12 · strokeWidth 1.5
       stroke = GRADIENTE ANGULAR (cónico), 3 paradas:
              $red-400 @0 · $bone-100 @0.5 · #cf3247 @1  ← ver nota
       padding [16,28] · alignItems center
└── Texto  $bone-100 · $font-display · 15px/600
```

> ⚠️ **Corrección a `branding.md`**: ese archivo describe el borde LED como
> `Red 400 → Bone 100 → Wine 400`. **El diseño real NO usa Wine** — la
> tercera parada cierra el loop volviendo a rojo. Ya está corregido abajo
> en § Correcciones.
>
> 🐛 **Typo en el archivo de diseño (verificado 2026-09-06).** La tercera
> parada en el `.pen` es literalmente `#cf3247`, pero el token `red-400`
> vale `#CF3147`. Difieren en un dígito (`32` vs `31`) — es un error de
> dedo de quien construyó el gradiente, no un color deliberado: la
> diferencia es de 1/255 en el canal verde, imperceptible, y la intención
> obvia era repetir Red 400 para cerrar el giro sin salto.
>
> **En código se usa `var(--red-400)`**, que es lo correcto. Si alguien
> compara pixel a pixel contra el `.pen` y ve la diferencia, es esto —
> no un bug de implementación. Vale la pena corregir el `.pen` para que
> use el token en vez del hex suelto.

**3 variantes de tamaño** (derivadas de las instancias reales):

| Variante | Padding D | Padding M | fontSize D | fontSize M | Dónde |
|---|---|---|---|---|---|
| `nav` | `[13,24]` | — | 14 | — | CTA del nav (solo desktop) |
| `hero` | `[18,32]` | `[16,26]` / `[17,24]` | 16 | 15 | CTA primario del hero |
| `submit` | `[18,32]` | `[16,28]` | 16 | 15 | Botón Enviar de ambos formularios |

**Contenido por locale:** ES `Cuéntanos tu proyecto` / `Enviar` — EN
`Tell us about your project` / `Submit`.

**Animación LED:** anillo cónico de 1.5px, un giro cada 2.6s lineal,
arranca en hover y se detiene al salir. **CSS puro, sin JS.** Uno por
pantalla. Sin JS o con `prefers-reduced-motion`: borde estático Red 400.

---

## 5 · Wordmark

```
frame  alignItems center  (sin gap — los 3 textos van pegados)
├── "muush"  $bone-100 · $font-logo (Poppins) · 24px/600 · ls -0.72
├── "."      $red-400  · $font-logo · 24px/600 · ls -0.72
└── "dev"    $bone-100 · $font-logo · 24px/600 · ls -0.72
```

**Móvil:** 19px/600 · ls −0.57.

`branding.md` documenta dos lockups oficiales: `muush` y `muush.dev`. En el
diseño **siempre aparece la versión completa**, pero el componente debe
poder ocultar `.dev` para el caso "muush" solo.

**4 usos:** Nav ×2 (Landing, Nosotros) + Footer ×2. Más el nav del menú
móvil.

---

## 6 · Lockup (Isotipo + Wordmark)

```
frame  gap 12 (desktop) / 9 (móvil) · alignItems center
├── Isotipo (ref)  52×29 desktop, strokeWidth 8.85
│                  40×22 móvil,   strokeWidth 6.8
│                  stroke $bone-100 en ambos
└── Wordmark
```

> ⚠️ **Corregido 2026-09-06 — no repliques el override en código.**
>
> La fórmula `strokeWidth = 12 × (ancho ÷ 70.5)` que documentan
> `branding.md` y `content.md` es un **workaround específico de Pencil**:
> Pencil no escala el `strokeWidth` con el `viewBox` (bug documentado en
> `content.md` § Hallazgo técnico). **El navegador sí lo escala**, porque
> es comportamiento estándar de SVG.
>
> Verificado numéricamente: con `viewBox` de ancho 70.5 y `stroke-width:12`,
> renderizar a 52px da escala `52/70.5 = 0.73759` → `12 × 0.73759 = 8.851`
> (Pencil override: 8.85 ✓) y a 40px da `6.809` (override: 6.8 ✓).
>
> **En código el `<svg>` solo necesita `width`/`height`** — el trazo escala
> solo. Meter el override sería duplicar la escala y engrosar el trazo.

---

## 7 · LinkArrow ("Agenda una llamada →")

Texto suelto, **sin caja**, en escritorio y móvil. 4 instancias:

| Dónde | fontSize | weight | letterSpacing |
|---|---|---|---|
| Hero desktop | 16 | 500 | 0 |
| CTA final desktop | 23 | 600 | −0.7 |
| Hero móvil | 16 | 600 | −0.3 |
| Ruta alterna móvil | 20 | 600 | −0.6 |

Siempre `$bone-100`. Hover: subrayado o desplazamiento de la flecha —
**nunca un fondo** que lo vuelva a convertir en botón.

---

## 8 · Botón de red social (menú móvil)

```
frame  48×48 · fill #1c1416a6 · cornerRadius 10
       stroke #FBF8F62E 1px · padding 10 · center
└── glifo  $bone-100 · 18px/600 · ls 0.4
```

Los glifos `L`/`I`/`T` del `.pen` son **placeholder**. Los SVG reales y su
normalización pendiente están en `decisions-open.md` § Íconos de redes.

---

## 9 · Escala tipográfica desktop → móvil

Todos `$font-display` (Instrument Sans) salvo el Wordmark.

| Rol | Desktop | Móvil | Notas |
|---|---|---|---|
| Display (hero landing) | 98/600 · ls −3.5 · lh 0.98 | 46/600 · ls −1.7 · lh 1 | |
| H1 (hero Nosotros) | 74/600 · ls −2.6 · lh 1.02 | 38/600 | |
| H2 (CTA final) | 62/600 · ls −2.1 · lh 1.02 | 38/600 · ls −1.3 · lh 1.03 | |
| H2 (Proyectos) | 52/600 · ls −1.6 · lh 1.05 | 34/600 · ls −1.05 | |
| H3 (Work with muush) | 44/600 · ls −1.35 · lh 1.1 | — | |
| H3 (Network) | 34/600 · ls −1 · lh 1.24 | 22/600 · ls −0.66 · lh 1.28 | |
| Lead (tarjetas Propósito) | 30/500 · ls −0.6 · lh 1.35 | 22/600 · ls −0.66 · lh 1.3 | ⚠️ el weight cambia 500→600 |
| Copy (Delivery) | 24/500 · ls −0.72 · lh 1.35 | — | |
| Body (subhead hero) | 21 · lh 1.5 | 17 · lh 1.5 | weight normal |
| Body (intro Nosotros) | 20 · lh 1.55 | 16 · lh 1.55 | |
| Body (copy CTA) | 18 · lh 1.6 | 16 · lh 1.55 | |
| Nombre de servicio | 19/600 · ls −0.57 · lh 1.18 | 18/600 · ls −0.54 · lh 1.2 | |
| Brief de servicio | 14 · lh 1.55 | 14 · lh 1.55 | **no cambia** |
| Label de formulario | 12/500 · ls 0.5 | 12/500 · ls 0.5 | **no cambia** |
| Valor de input | 15 | 15 | **no cambia** |
| Texto de Pill | 13/500 · ls 0.7 | 12/500 | |
| Meta / nota | 12–13 · `$ink-200`/`$ink-300` | 11–12.5 | |

**Escala de espacio y superficie:**

| Token | Desktop | Móvil |
|---|---|---|
| Margen de página | 80 | 24 |
| Radio de panel | 20–22 | 18 |
| Padding de tarjeta | 28–36 | 22 |
| Ancho de formulario | 660 | 342 |
| Gap de formulario | 16 | 14 |
| Padding de formulario | 34 | 24 |

---

## 9.bis · Shell del sitio — Nav, Footer y menú móvil

> Extraído 2026-09-06. **Verificado: Nav y Footer son byte-idénticos entre
> Landing y Nosotros en ambos viewports** — misma anchura, padding, gap y
> alineación. Son un componente cada uno, no cuatro.

### Nav — contenedor

| | Desktop | Móvil |
|---|---|---|
| Ancho | 1440 | 390 |
| Padding | `[30, 80]` | `[22, 24]` |
| alignItems | center | center |

**Desktop** = `Lockup` (fill_container, gap 12) + `Nav right` (gap 30):
- `Proyectos` · `Nosotros` → `$bone-300` · 15px/500
- `CTA nav` → BotonPrimario variante `nav` (padding `[13,24]`, fs 14)
- `Idioma` → gap 6: `ES` `$bone-100` 13/600 ls 0.8 · `/` `$ink-300` 13 · `EN` `$ink-200` 13/500 ls 0.8

**Móvil** = `Lockup` (fill_container, gap 9) + `Nav right` (gap 14):
- `Idioma` → gap 5, fs 12 (mismos colores/pesos)
- `Menú` (hamburguesa) → fill `#1c1416a6`, radio 10, borde `#FBF8F62E` 1px,
  padding `[12,11]`, vertical, gap 5, 2 rectángulos de 16×1.6 `$bone-100`
  con `cornerRadius: 1`

> **El CTA del nav no existe en móvil.** No colapsa al menú: en móvil el
> único CTA son las redes del menú abierto (decisión 2026-09-06).

### Footer — contenedor

| | Desktop | Móvil |
|---|---|---|
| Tamaño | 1440×400 | 390×577 |
| Fill | `$ink-500` | `$ink-500` |
| Padding | `[80, 80, 44, 80]` | `[52, 24, 32, 24]` |
| Gap | 56 | 40 |
| Layout | vertical | vertical |

**Desktop** — `Top` (gap 80, `space_between`) + `Bottom`:
- `Top` → `Marca` (w 340, vertical, gap 20) + `Columnas` (gap 64)
- `Marca` → Lockup + `Tagline` (`$ink-100` 18/500 ls −0.54) + `Categoría`
  (`$ink-300` 12/500 ls 0.9)
- `Columnas` → 4× `FooterColumn` de w 180, vertical, gap 16
- `Bottom` → borde superior `#c9c9c91f` 1px, padding `[26,0,0,0]`,
  `space_between`, 2 textos `$ink-300` 13px

**Móvil** — `Marca` + `Columnas 1` + `Columnas 2` + `Bottom`:
- `Marca` → fill_container, vertical, gap 10. Tagline 16/500 ls −0.54,
  Categoría 11/500 ls 0.9 (más chicos que desktop)
- `Columnas 1` y `Columnas 2` → fill_container, gap 20, 2 columnas c/u
- Columnas → vertical, gap 12; título 11/600 ls 1.1; items gap 9, 14px
- `Bottom` → borde `#FBF8F61F` 1px, padding `[22,0,0,0]`, **vertical**
  (no `space_between` como desktop), gap 6, textos 12px

### Menú móvil abierto (`390×844`)

Capas, de abajo hacia arriba:
1. `BG · base` 390×844
2. `Dotted paper` 390×844
3. `Panel vidrio` → fill `#1c1416a6`, blur 20, cubre todo
4. `Nav` → mismo contenedor que el nav normal (`padding [22,24]`), pero
   `Nav right` lleva `Idioma` + botón **Cerrar** (fill `#1c1416a6`, radio
   10, borde `#FBF8F62E`, padding 10, ícono `x` de lucide 18×18 `$bone-100`)
5. `Items` → x 24, y 176, w 342, vertical, **gap 30**, textos `$bone-100`
   30px/600 ls −0.9
6. `Divisor` → x 24, y 448, 342×1, `#FBF8F614`
7. 3 botones de red 48×48 en y 493, x 109 / 171 / 233 (gap efectivo 14,
   centrados en los 390px)

### Copy del shell — ES / EN

| Elemento | ES | EN |
|---|---|---|
| Nav link 1 | Proyectos | Projects |
| Nav link 2 | Nosotros | About us |
| CTA nav | Cuéntanos tu proyecto | Tell us about your project |
| Tagline footer | Hablamos negocio y código. | We speak business and code. |
| Categoría | Technology solution studio | Technology solution studio |
| Col. 1 título | Navegación | Navigation |
| Col. 1 items | Propósito · Servicios · Proyectos · Nosotros | Purpose · Services · Projects · About us |
| Col. 2 título | Contacto | Contact |
| Col. 2 items | Agenda una llamada · support@muush.dev · WhatsApp | Book a call · support@muush.dev · WhatsApp |
| Col. 3 título | muush | muush |
| Col. 3 items | Work with muush · FAQ · Blog · próximamente | Work with muush · FAQ · Blog · coming soon |
| Col. 4 título | Redes | Social |
| Col. 4 items | LinkedIn · Instagram · TikTok | LinkedIn · Instagram · TikTok |
| Copyright | © 2026 muush · Todos los derechos reservados | © 2026 muush · All rights reserved |
| Ubicación | CDMX · MX | CDMX · MX |
| Menú items | Propósito · Servicios · Proyectos · Nosotros | Purpose · Services · Projects · About us |

> `Work with muush` y `FAQ` **no se traducen** — son nombres propios.
> Ojo: el ítem `Blog · próximamente` lleva el separador `·` dentro del
> propio string, no es una lista de dos.

### Destinos (de `ui-map.md` §2 y §8)

| Elemento | Destino |
|---|---|
| Lockup | Home del idioma activo |
| Proyectos | `#proyectos` (desde Nosotros: `/#proyectos`) |
| Nosotros | `/nosotros` — item activo en esa página |
| CTA nav | `#contacto` + foco en primer campo |
| ES/EN | Ruta equivalente del otro idioma, conservando el ancla |
| Footer · Agenda una llamada | 🔴 Google Calendar — link pendiente (decisión #2) |
| Footer · support@muush.dev | `mailto:support@muush.dev` |
| Footer · WhatsApp | `https://wa.me/525639060739` con mensaje precargado, pestaña nueva |
| Footer · FAQ | 🔴 la página no existe (decisión #3) |
| Footer · Blog | **Sin link.** Texto `$ink-300`, sin cursor ni hover |
| Redes | `linkedin.com` · `instagram.com/muush.dev` · `tiktok.com/@muush.dev`, pestaña nueva |

---

## 10 · Componentes de contenido (para features posteriores)

### PurposeCard
Desktop: GlassPanel `red-strong`/`red-soft`, 700px ancho, gap 14,
**solo Copy** (el label vive fuera, en la constelación).
Móvil: activa 274×316, vecinas 241×278 @opacity 0.5, **Label + Copy**.
Label: `$red-200` · desktop 17px/600 ls −0.2 · móvil 13px/500 ls 0.9.

→ El componente recibe siempre `label` + `copy`; cada layout decide dónde
pintar el label. Ver `decisions-open.md` § D6.

### ProjectCard
GlassPanel `bone-strong` (Caso 01) / `bone` (02–04), `justifyContent: end`.
Desktop bento: 620×560 · 636×265 · 306×265 · 306×265.
Móvil carrusel: 4× 252×290.
Contenido: `Etiqueta` (desktop 22px destacado / 16px resto · móvil 18px,
600, ls −0.4) + `Meta` ("Próximamente", 12px, `$ink-200`, ls 0.5–0.6).

### TeamMemberCard
`Foto B&N` = GlassPanel `bone` (desktop h:440 padding 22 · móvil h:260
padding 18) con nota "Foto B&N" (`$ink-200` 11px/500) + `Datos` (Nombre
24/600 ls −0.72 desktop, 20/600 ls −0.6 móvil · Rol 13px `$ink-200`
desktop, 12.5 móvil).
Contenido actual: los 3 dicen `"Nombre y apellido"` (placeholder). Roles:
`Ingeniería` · `Operación · Producto · Administración` · `Ventas`.

### ServiceItem
Frame vertical, gap 12 (desktop) / 10 (móvil), ancho 232 / 310.
`Nombre` + `Brief` (specs en § 9). Acompañado siempre de un Radar.

### FormField — 4 variantes
```
frame vertical gap 8 (desktop) / 7 (móvil)
├── L (label)   $bone-300 · 12px/500 · ls 0.5
└── control     fill #FBF8F60F · cornerRadius 12 · stroke #FBF8F62E 1px
                padding [14,16] · justifyContent space_between
    └── V (valor) $ink-100 · 15px
```
| Variante | Diferencia |
|---|---|
| `text` | base |
| `select` | + ícono `chevron-down` de lucide 16×16 `$bone-300` |
| `textarea` | `height: 92`, layout vertical, valor en `$ink-200` con lh 1.5 |
| `upload` | fill `#FBF8F60A`, stroke `#FBF8F229`, padding 16, gap 10, + ícono `paperclip` de lucide |

**13 usos:** Landing 6 campos · Nosotros 7 campos.

### RadioPill
```
frame cornerRadius 999 · gap 9 · padding [11,18] · alignItems center
├── dot  ellipse 8×8
└── L    $bone-100 · 14px
```
Activo: fill `#FBF8F624`, stroke `#FBF8F65C`, dot `$red-400`.
Inactivo: fill `#FBF8F60A`, stroke `#FBF8F229`, dot `#FBF8F63D`.
**4 usos** (Correo/WhatsApp en ambos formularios).

### FooterColumn
Frame vertical, ancho 180 (desktop), gap 16 / 12 (móvil).
`T` (título): `$red-300` · 12px/600 · ls 1.2 (móvil 11px/600 ls 1.1).
`Items`: gap 11 / 9, textos `$ink-100` 15px (móvil 14px).

Contenido (idéntico D/M tras la corrección del 2026-09-06):
- **Navegación** → Propósito · Servicios · Proyectos · Nosotros
- **Contacto** → Agenda una llamada · support@muush.dev · WhatsApp
- **muush** → Work with muush · FAQ · Blog · próximamente
- **Redes** → LinkedIn · Instagram · TikTok

### SectionGlow

Frames circulares (`cornerRadius: 999`) con fill de gradiente radial
`color → #26262600` (ink-500 transparente). **22 instancias** — 12 en
Landing, 10 en Nosotros. Es el fondo entero del sitio.

> ⚠️ **No hay sistema de variantes aquí.** Son 22 glows afinados a mano:
> tres colores base combinados con **diez** opacidades distintas (65, 60,
> 40, 37, 30, 28, 20, 17, 14 y 12%), en 12 pares color+opacidad, y nombres
> que no siempre corresponden al color (`Propósito · red` usa wine-300, no
> rojo). **No inventes variantes con nombre.** El componente debe recibir
> color, opacidad y tamaño explícitos, y esta tabla es la referencia de qué
> combinación va en cada posición.

**Colores base — solo 3:**

| Hex | Token | Dónde |
|---|---|---|
| `#CF3147` | `red-400` | Solo en `foco` (hero y CTA) |
| `#8A4552` | `wine-300` | Capa media |
| `#591F28` | `wine-400` | Capa de cierre |

**Landing — 12 glows** (desktop / móvil):

| Nombre | Color | Opacidad | Tamaño D / M |
|---|---|---|---|
| Hero · foco | red-400 | 65% | 1500 / 700 |
| Hero · wine | wine-300 | 40% | 1100 / 520 |
| Hero · cierre | wine-400 | 30% | 900 / 520 |
| Propósito · wine | wine-400 | 20% | 1000 / 560 |
| Propósito · red | wine-300 | 17% | 820 / 480 |
| Servicios · red | wine-300 | 14% | 900 / 520 |
| Servicios · wine | wine-400 | 12% | 860 / 480 |
| Proyectos · wine | wine-400 | 14% | 880 / 500 |
| CTA · foco | red-400 | 60% | 1500 / 760 |
| CTA · wine | wine-300 | 37% | 1000 / 560 |
| CTA · cierre | wine-400 | 28% | 900 / 520 |
| Glow origen | red-400 | 12% | 920 / — |

**Nosotros — 10 glows:**

| Nombre | Color | Opacidad | Tamaño D / M |
|---|---|---|---|
| Hero · foco | red-400 | 60% D / 65% M | 1400 / 700 |
| Hero · wine | wine-300 | 37% D / 40% M | 1000 / 520 |
| Hero · cierre | wine-400 | 28% D / 30% M | 860 / 520 |
| Equipo · wine | wine-400 | 20% | 960 / 560 |
| Equipo · red | wine-300 | 17% | 820 / 480 |
| Network · red | wine-300 | 14% | 900 / 520 |
| Network · wine | wine-400 | 12% | 860 / 480 |
| Work · foco | red-400 | 60% | 1500 / 760 |
| Work · wine | wine-300 | 37% | 1000 / 560 |
| Work · cierre | wine-400 | 28% | 900 / 520 |

**Observaciones:**

- El hero de Nosotros es **ligeramente más tenue que el de Landing** en
  desktop (60% vs 65%) pero **idéntico en móvil** (ambos 65%). Puede ser
  intencional o deriva; no bloquea nada.
- `Glow origen` solo existe en Propósito de Landing desktop — es el que
  ancla los arcos concéntricos de la constelación.
- Los tamaños móviles rondan el **0.5×** del desktop, no una fracción
  exacta. Candidato a `clamp()`, pero verificar caso por caso: Hero·cierre
  es 0.58× mientras Hero·foco es 0.47×.
- El posicionamiento es absoluto y distinto en las 22 — **lo resuelve quien
  monta la sección, no el componente**.

### DottedPaper
⚠️ **NO es un componente.** En Pencil son 90+ tiles × 144 elipses de 2.5px
(`#D9D9D91F`, grid de 24px). En producción es:
```css
background-image: radial-gradient(#D9D9D91F 1.25px, transparent 1.25px);
background-size: 24px 24px;
```
Ver `ui-map.md` § 10.

---

## 11 · Correcciones a la documentación previa

| Documento | Decía | Realidad del `.pen` |
|---|---|---|
| `branding.md` § materiales | Borde LED `Red 400 → Bone 100 → Wine 400` | `$red-400 → $bone-100 → rojo otra vez` (**sin Wine**). El `.pen` escribe la 3ª parada como `#cf3247`, un typo de un dígito frente a `red-400` = `#CF3147`; en código va el token. Ver § 4 |
| `ui-map.md` § 2 (ya corregido) | Menú móvil con CTA + "Agenda una llamada" | Items + divisor + 3 redes. **Sin CTA** — decisión del 2026-09-06 |
| `content.md` | Propósito: Label dentro de cada tarjeta | Desktop lo tiene fuera (constelación); móvil dentro |
