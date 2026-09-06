# Reglas de negocio y de sistema descubiertas al especificar

> Este archivo acumula reglas que **no estaban documentadas** en el resto de
> `docs/business/` y que salieron al escribir una spec. Cada entrada cita la
> feature que la originó. **Se agrega, nunca se sobrescribe.**
>
> Estas reglas complementan `branding.md`, `landing/design-extract.md`,
> `landing/ui-map.md` y `landing/decisions-open.md`; donde haya conflicto,
> gana el documento específico salvo que aquí se marque una corrección
> explícita con fecha.

---

## Feature 002 · Primitive UI layer (2026-09-06)

### R1 · El `#1C1416` del vidrio oscuro no pertenece a ninguna rampa

Todas las superficies de vidrio oscuro del diseño (Pill, botón primario,
botones de red, ambos formularios, panel del menú móvil) usan `#1C1416A6`, es
decir `#1C1416` al 65%. Ese negro cálido **no es `ink-500` (`#262626`)** ni
ningún otro paso de las cuatro rampas de `branding.md`.

Queda como token propio, `--dark-glass`, en `src/styles/global.css`. Si algún
día el branding book define oficialmente ese color, se actualiza ahí y ningún
componente cambia.

### R2 · El borde de `bone-faint` en el diseño usa `#FBF8F2`, no `#FBF8F6`

`design-extract.md` § 1 documenta el stroke de la variante `bone-faint` como
`#FBF8F229`. La base `#FBF8F2` difiere de `bone-100` (`#FBF8F6`) en 4/255 de
un solo canal, a 16% de opacidad — imperceptible.

**Decisión:** se implementa como `bone-100` al 16% para no romper el sistema
de tokens. **Pendiente:** Clau debería corregirlo en el archivo de diseño para
que las dos fuentes coincidan.

### R3 · El `strokeWidth` del isotipo se escala solo en SVG

`branding.md` y `design-extract.md` § 6 documentan
`strokeWidth = 12 × (ancho ÷ 70.5)` y advierten que "no escala solo". Eso es
cierto **dentro de Pencil**. En SVG con `viewBox` es automático: el asset
declara `viewBox="14.5 38.5 70.5 39.5"` con `stroke-width="12"` en unidades de
usuario, así que renderizarlo a cualquier ancho escala el trazo en la misma
proporción.

Verificado: 12 × 52 ÷ 70.5 = 8.851 (el diseño dice 8.85) y
12 × 40 ÷ 70.5 = 6.809 (el diseño dice 6.8). Las alturas confirman lo mismo:
52 × 39.5 ÷ 70.5 = 29.13 ≈ 29 y 40 × 39.5 ÷ 70.5 = 22.41 ≈ 22.

**Implicación:** al implementar el lockup solo se fija el ancho. No hace falta
prop de `strokeWidth`, ni cálculo, ni helper. La fórmula sigue siendo la
referencia correcta para material impreso y para otras herramientas de diseño.

### R4 · El tracking del sistema es proporcional (≈ −3%), no en píxeles

Los valores de `letterSpacing` en píxeles de `design-extract.md` § 9
convergen a una razón casi constante respecto al tamaño de fuente:
display −0.036/−0.037 em · h2 −0.034/−0.034 em · h2-alt −0.031/−0.031 em ·
wordmark −0.030/−0.030 em · nombre de servicio −0.030/−0.030 em.

Coincide con lo que `branding.md` ya dice en palabras ("tracking −3%"). La
regla operativa: **el tracking se expresa en `em`**, y así escala solo con el
tamaño fluido en vez de necesitar su propia interpolación.

Única excepción documentada: el rol `lead` (tarjetas de Propósito), que va a
−0.02 em en escritorio y −0.03 em en móvil, y además cambia de peso 500 a 600.
Eso lo resuelve la feature que construya `PurposeCard`, no la capa de
primitivos.

### R5 · Los dos anchos de referencia del diseño son 390 y 1440

No existe un frame intermedio. Toda la escala fluida interpola entre esos dos
valores y se detiene (clamp) fuera del rango. Cualquier medida futura que
llegue del `.pen` debe leerse como uno de esos dos extremos.

### R6 · El rango del rol "meta" está documentado como rango, no como valor

`design-extract.md` § 9 registra Meta como 12–13 px en escritorio y 11–12.5 px
en móvil. La capa de primitivos usa el punto medio (11.5 → 12.5). Si una
sección concreta necesita el extremo del rango, esa feature lo afina — el
rango es real, no una imprecisión del extracto.

### R7 · Sin hover no hay borde LED (provisional)

`decisions-open.md` #8 (no bloqueante) pregunta si en móvil el borde LED va
estático o en loop permanente. Mientras Clau decide, la implementación usa
`@media (hover: hover)`: **en dispositivos táctiles el anillo queda estático en
Red 400**, igual que el fallback de `prefers-reduced-motion` y el de "sin
JavaScript" que ya documenta `ui-map.md` § 10.

Razón: sería el único elemento en animación permanente de la página y
contradice la regla de `branding.md` de "un solo botón con borde LED por
pantalla, y solo en hover". **Es reversible borrando un media query** — no
sustituye la decisión de Clau.

### R8 · Los íconos de redes no pueden ir en `public/`

Los tres SVG normalizados tienen que inlinearse desde `src/assets/` para que
`currentColor` funcione. Servidos como `<img src="/…">` desde `public/` nunca
podrían tomar el token `bone-100` y se verían blanco puro, que es exactamente
el problema que la normalización de `decisions-open.md` § Íconos de redes
existe para resolver. Mismo criterio que ya se aplicó al isotipo en la
feature 001.

---

## Feature 003 · Site shell (2026-09-06)

### R9 · El ancla no existe en tiempo de build

`ui-map.md` § 1 pide que el toggle ES/EN conserve el ancla
(`/es/nosotros#work` → `/en/about#work`). **No se puede resolver en el HTML
estático:** el fragmento de una URL nunca se envía al servidor y no existe
cuando Astro genera la página. `Astro.url.pathname` jamás trae `#`.

Consecuencia operativa: el `href` estático del toggle apunta a la ruta
equivalente **sin ancla**, y conservar el ancla requiere una mejora progresiva
en el cliente (unas 10 líneas que agregan `location.hash` al destino al hacer
click). Sin JavaScript el toggle sigue funcionando: cae al inicio de la página
equivalente.

**Esto aplica a cualquier feature futura** que quiera "recordar dónde iba el
visitante" al cambiar de idioma, de página o de vista. La regla general: todo
lo que dependa del fragmento es comportamiento de cliente, nunca de build.

### R10 · Las URLs canónicas llevan diagonal final

El destino de despliegue es S3 + CloudFront sin cómputo (Constitución,
Artículo I). Con el `build.format: 'directory'` por defecto de Astro,
`src/pages/es/nosotros.astro` se emite como `/es/nosotros/index.html`. Una
petición a `/es/nosotros` **sin** diagonal no mapea a ese objeto salvo que
exista una función de reescritura en el edge, que este proyecto no tiene.

**Regla:** todo `href` interno que genere el sitio termina en `/` antes del
ancla (`/es/nosotros/`, `/en/#proyectos`). Los helpers de `src/i18n/` aceptan
la entrada con o sin diagonal y siempre emiten la forma canónica.

### R11 · El filete del bottom bar del footer tiene dos colores en el diseño

`design-extract.md` § 9.bis documenta el mismo filete de 1px como `#c9c9c91f`
en escritorio y `#FBF8F61F` en móvil. Ambos son un neutro claro al 12%; la
diferencia es la base (`#c9c9c9` no pertenece a ninguna rampa, `#FBF8F6` es
`bone-100`).

**Decisión:** se implementa como `bone-100` al 12% en ambos viewports — el
valor móvil exacto — para no meter un color fuera del sistema de tokens.
Mismo criterio que R2. **Pendiente:** Clau debería unificarlo en el archivo de
diseño.

### R12 · Las posiciones absolutas del menú móvil son del frame, no del diseño

El frame `MENÚ móvil abierto` mide 390×844 y coloca sus piezas por posición
absoluta: items en y176, divisor en y448, redes en y493. **Un teléfono real
casi nunca mide 844px de alto**, así que replicar las posiciones rompería el
layout en cualquier otro dispositivo.

Se traducen a flujo: el bloque de items arranca a 176px del borde superior, y
con `line-height: 1.1` los 4 items de 30px ocupan 222px (176→398), lo que deja
**50px** hasta el divisor y **44px** del divisor a la fila de redes. Esos dos
gaps reproducen el frame exactamente a 844px y fluyen bien a cualquier otra
altura.

El `line-height` es la única variable libre de esa derivación y queda
registrada aquí por si el diseño la contradice después.

### R13 · El handle de LinkedIn está documentado, la URL no

`branding.md` y `overview.md` registran el handle como `/muush-dev`;
`design-extract.md` § 9.bis registra el destino solo como "linkedin.com".
**Nadie documenta si la URL real es una página de empresa
(`/company/muush-dev`) o un perfil personal (`/in/muush-dev`).**

Instagram y TikTok sí tienen ruta completa, así que el hueco es específico de
LinkedIn. Se asume página de empresa (muush es una empresa) y el valor vive en
un solo lugar de los datos del shell, para que corregirlo sea una línea.
**Pendiente de confirmación de Clau.**
