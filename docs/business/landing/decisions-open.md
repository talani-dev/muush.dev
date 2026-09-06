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
| 2 | Link real de Google Calendar para el CTA de llamada | Clau | Aparece en hero, CTA final y footer |
| 3 | Qué pasa con FAQ: escribirla, quitar el link del footer, o dejarla "próximamente" sin link | Clau | Hoy sería un 404 en el footer de todo el sitio |
| 4 | Estrategia de URL del idioma: prefijo `/en/` vs. parámetro vs. estado del cliente | Roberto | Afecta SEO y el enrutamiento i18n de todo el sitio (ver conflicto con el scaffold en `ui-map.md`) |

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
| Opciones de "¿Cómo te identificas?" | El archivo de diseño tiene 6 opciones; `content.md` documenta 5. "Restaurante o bar" está en el diseño sin documentar — conecta con el tema de restaurantes/bares como vertical, guardado para después |
| Copy de Nosotros | Hero, Network y Work with muush siguen marcados como borrador, falta aprobar |
| Nombres reales del equipo | Los 6 dicen `"Nombre y apellido"`. Entran con la sesión de fotos B&N |

---

# Conflicto de arquitectura (no viene de Notion — detectado al comparar con este repo)

El scaffold de este repo configuró rutas simétricas con prefijo en ambos
locales (`prefixDefaultLocale: true` → `/es/`, `/en/`). El diseño real
(ver `ui-map.md` § 1) usa ES sin prefijo (`/`) y Nosotros con rutas
**asimétricas** por locale (`/nosotros` vs `/en/about`, no una traducción
literal de segmento). Esto requiere either reconfigurar el i18n routing de
Astro, o resolver el mapeo de rutas manualmente (patrón
`useTranslatedPath`/`getRouteFromUrl` de la recipe de i18n de Astro) —
decisión que le toca a la primera spec real de la landing, no algo para
asumir en `docs/business/`.
