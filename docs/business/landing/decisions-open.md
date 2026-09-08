# Landing — decisiones abiertas y discrepancias

> Fuente: Notion → Landing · Mapa de UI § 11-12, Project State § Próximo
> trabajo. **Actualizado 2026-09-06** contra el archivo de diseño
> `/Users/betonajera/Downloads/muush.pen`. **Cualquier spec que toque estas
> áreas debe marcar lo abierto como `[NEEDS CLARIFICATION]` en vez de
> asumir una respuesta.**

## Bloqueantes (sin esto, la feature correspondiente no se puede cerrar)

| # | Decisión | De quién | Por qué bloquea |
|---|---|---|---|
| 1 | A dónde llegan los formularios: servicio externo (Formspree/Web3Forms), función serverless a support@muush.dev, o directo a CRM del Company OS | Roberto y Clau | Sin esto no hay formulario funcional |
| ~~2~~ | ~~Link real de Google Calendar para el CTA de llamada~~ | ~~Clau~~ | ✅ **RESUELTA 2026-09-07** — ver abajo |
| 3 | Qué pasa con FAQ: escribirla, quitar el link del footer, o dejarla "próximamente" sin link | Clau | Hoy sería un 404 en el footer de todo el sitio |
| ~~4~~ | ~~Estrategia de URL del idioma~~ | ~~Roberto~~ | ✅ **RESUELTA 2026-09-06** — ver abajo |

## No bloqueantes (afectan diseño/UX, no impiden implementar)

| # | Decisión | De quién |
|---|---|---|
| 5 | Nav fijo al hacer scroll y su estado comprimido — falta el frame | Clau y Roberto |
| 7 | Si el CV de la aplicación (Nosotros) es obligatorio, y dónde se guardan los archivos | Clau |
| 8 | Borde LED en móvil: estático o en loop permanente (no hay hover en móvil) | Clau |
| 9 | Si el envío del formulario dispara también un correo de confirmación al usuario | Clau |

---

# Paridad desktop ↔ móvil — auditoría 2026-09-06

Se auditaron los 4 frames (`Landing ES · v4`, `Landing ES · móvil`,
`Nosotros ES`, `Nosotros ES · móvil`) sección por sección. Las 6 secciones
de cada página hacen match 1:1.

## Discrepancias resueltas ✅

| # | Discrepancia | Cómo quedó |
|---|---|---|
| D1 | Proyectos tenía 4 casos en desktop y 3 en móvil | **4 en ambos.** Móvil: Caso 01–04 a 252×290 en carrusel |
| D2 | Footer móvil perdía Tagline y Categoría | **Presentes en ambos.** El bloque pasó de `Lockup` a `Marca` completo; el footer móvil creció 520 → 577px |
| D3 | Nombres de equipo: `"Name and last name"` en desktop vs. nombres reales en móvil | **Unificado a `"Nombre y apellido"`** en los 6. Sigue siendo placeholder — los nombres reales entran con la sesión de fotos |
| D4 | Orden del footer "Navegación" no coincidía | **`Propósito → Servicios → Proyectos → Nosotros`** en ambos |
| D5 | Orden del footer "Contacto" no coincidía | **`Agenda una llamada → support@muush.dev → WhatsApp`** en ambos |
| D7 | Menú hamburguesa sin frame | **Diseñado:** `MENÚ móvil abierto · ES` y `· EN` (390×844) |

## Diferencia deliberada (no es discrepancia) ⚙️

**D6 · El label de Propósito va fuera de la tarjeta en desktop y dentro en
móvil.** No es un descuido: en desktop el label pertenece a la constelación
(radar + label + línea conectora + arcos concéntricos); en móvil no hay
constelación, es un carrusel, así que el label se integra a la carta.

**Implicación para el código:** el componente de tarjeta debe recibir
siempre `label` + `copy`. Móvil lo pinta adentro; desktop lo delega al
radar. Un solo dato, dos posiciones — no requiere prop de "modo".

## Contenido del menú móvil — decidido 2026-09-06 ✅

El menú diseñado **diverge a propósito** de lo que decía `ui-map.md` §2
(que listaba "Cuéntanos tu proyecto" y "Agenda una llamada →"). La
decisión de Clau:

> **En desktop el CTA es el botón "Cuéntanos tu proyecto" del nav. En móvil
> el único CTA son las redes sociales.**

Contenido real del frame:

- Panel de vidrio a pantalla completa (`#1c1416a6`, blur 20)
- Nav: Lockup + toggle ES/EN + botón Cerrar (ícono `x` de lucide, vidrio,
  radio 10)
- Items a 30px: Propósito · Servicios · Proyectos · Nosotros
- Divisor (`#FBF8F614`, 342×1)
- 3 botones de red de 48×48 (vidrio `#1c1416a6`, radio 10, borde
  `#FBF8F62E`): LinkedIn · Instagram · TikTok

`ui-map.md` §2 ya quedó corregido para reflejar esto.

---

# Íconos de redes sociales

> Confirmado 2026-09-06: se usan los SVG oficiales de marca, no glifos
> tipográficos. En el `.pen` aparecen como las letras `L`/`I`/`T` — eso es
> placeholder, no el diseño final.

**Archivos fuente:**

```
/Users/betonajera/Library/Mobile Documents/com~apple~CloudDocs/Pictures/Icons/Redes/
  Instagram/Instagram_Glyph_White.svg
  TikTok/tiktok-logo-white.svg
  Linkedin/linkedin-logo-white.svg
```

## ⚠️ Requieren normalización antes de usarse

Los tres vienen de fuentes distintas y ninguno está listo para inlinear:

| Ícono | viewBox | Problema |
|---|---|---|
| **LinkedIn** | `34.13 34.13 187.73 187.73` | Offset raro + `transform="scale(8.53333)"` anidado. `fill="#ffffff"` hardcodeado |
| **Instagram** | `0 0 1000 1000` | Usa `<defs><style>.cls-1{fill:#fff}</style></defs>` — **clase CSS global**, colisiona al inlinear y no se puede recolorear |
| **TikTok** | `0 0 1419 1627` | **No es cuadrado** (ratio 0.87). Trae DOCTYPE, metadata de Serif y `<g transform>` anidados múltiples |

**Los tres tienen blanco puro (`#ffffff`) hardcodeado**, pero en el diseño
los glifos van en `$bone-100` = `#FBF8F6`, que **no es blanco puro**. Tal
como están, no respetarían el token de marca.

**Qué hay que hacer al implementarlos:**

1. Normalizar los tres a un `viewBox` cuadrado común (24×24 recomendado),
   centrando TikTok ópticamente ya que su arte no es cuadrado.
2. Reemplazar todo `fill` por `currentColor`, para que hereden el color del
   contenedor y respeten `text-bone-100`.
3. Eliminar `<defs>`, `<style>`, DOCTYPE, comentarios y metadata de
   herramienta.
4. Aplanar los `<g transform>` anidados donde se pueda.

Sin esto, los íconos se ven blancos puros sobre un sistema que usa bone, y
el de Instagram puede romper estilos de otras partes de la página.

---

# Discrepancias pendientes de resolver

| Qué | Detalle |
|---|---|
| **El footer de escritorio se pasa 52px** (detectado 2026-09-07) | Aritmética literal del `.pen`: Marca 340 + gap 80 + Columnas (4×180 + 3×64 = 912) = **1332px**, contra 1440−80−80 = **1280px** disponibles. En código se resuelve dejando que el gap ceda y las columnas flexeen, que es lo que hará el navegador igual — pero **el archivo de diseño está mal** y conviene ajustarlo |
| **Breakpoint y tope de contenido sin definir** (detectado 2026-09-07) | El diseño solo tiene frames a 390 y 1440. No documenta en qué ancho cambia de layout ni si el contenido topa a 1440 o sigue creciendo. La spec de la feature 3 asumió **1024px** y **tope de 1440**, ambos marcados UNVERIFIED. Decisión de Clau |
| **Hairline del footer fuera de paleta** (detectado 2026-09-06) | El borde superior de la barra inferior del footer usa `#c9c9c91f` en desktop y `#FBF8F61F` en móvil — dos colores distintos para la misma línea. Además **`#c9c9c9` no corresponde a ningún token de la marca** (lo más cercano es `ink-100` = `#D9D9D9`, pero no es igual). En código se unificó a `bone-100 @12%`, que es exactamente el valor móvil. **Conviene corregir el desktop en Pencil** para que use el token |
| **Forma de la URL de LinkedIn** | `branding.md` registra el handle `/muush-dev` pero no si la URL es `linkedin.com/company/muush-dev` o `linkedin.com/in/muush-dev`. Se asumió página de empresa (`/company/`). Confirmar con Clau |
| Opciones de "¿Cómo te identificas?" | El archivo de diseño tiene 6 opciones; `content.md` documenta 5. "Restaurante o bar" está en el diseño sin documentar — conecta con el tema de restaurantes/bares como vertical, guardado para después |
| Copy de Nosotros | Hero, Network y Work with muush siguen marcados como borrador, falta aprobar |
| Nombres reales del equipo | Los 6 dicen `"Nombre y apellido"`. Entran con la sesión de fotos B&N |

---

# Estrategia de rutas i18n — RESUELTA 2026-09-06 ✅

**Decisión de Roberto: se mantiene el scaffold — ambos locales con
prefijo.** Esto supersede lo que documenta `ui-map.md` § 1, que venía del
diseño.

| Página | ES | EN |
|---|---|---|
| Landing | `/es/` | `/en/` |
| Nosotros / About | `/es/nosotros` | `/en/about` |
| Raíz | `/` → redirect a `/es/` (ya existe en `src/pages/index.astro`) |

**Qué cambia frente al diseño:** el diseño asumía ES sin prefijo (`/`).
Ahora ES también lleva prefijo. `astro.config.mjs` se queda como está
(`prefixDefaultLocale: true`), no hay que reconfigurar nada.

**Qué NO cambia:** el segmento de Nosotros sigue **traducido**
(`nosotros` ↔ `about`), no es una copia literal. Por lo tanto **sigue
haciendo falta un mapa de rutas en `src/i18n/`** — el toggle ES/EN no
puede limitarse a intercambiar el prefijo, tiene que resolver también el
segmento y conservar el ancla (`/es/nosotros#work` → `/en/about#work`).

**Regla de implementación:** ese mapeo vive en `src/i18n/`, nunca
hardcodeado dentro del componente Nav. Si algún día se revierte a ES sin
prefijo, debe ser un cambio de datos y no de componentes.

---

## ✅ Decisión 2 — RESUELTA 2026-09-07 · el link de la llamada

**`https://cal.com/muush/intro-call`** — dado por Roberto el 2026-09-07.

Nota: la decisión estaba redactada como *"link real de Google Calendar"*. La
herramienta resultó ser **Cal.com, no Google Calendar**; el destino es lo que
importa y la redacción anterior daba por hecha una herramienta que no se usó.

**Dónde aplica** — los tres lugares que la decisión ya listaba:

| Dónde | Qué cambia |
|---|---|
| Hero, CTA secundario | Deja de ser `<span>` gris inerte; pasa a `LinkArrow` real en `bone-100`, **con flecha** |
| Footer, columna Contacto | Deja de ser `<span class="text-ink-300">`; pasa a link real |
| CTA final | Aún no construido — nace ya con el link |

**Comportamiento:** pestaña nueva con `rel="noopener"`, como pide
`ui-map.md` § 3. `LinkArrow` ya acepta `external` y lo hace.

Esto también resuelve dos síntomas que Roberto reportó al ver el Hero — texto
gris en vez de blanco, y flecha ausente. Los dos eran la misma causa: sin
`callHref`, `HeroSection.vue` cae a su rama inerte. No eran bugs de estilo.
