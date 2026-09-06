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
