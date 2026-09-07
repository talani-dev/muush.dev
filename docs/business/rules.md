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

---

## Feature 002 · Primitive UI layer — reespecificación sobre Nuxt (2026-09-06)

> Las reglas R1–R8 de arriba salieron del ciclo original en Astro y **siguen
> vigentes**: son reglas de diseño y de marca, no de framework. Las cuatro de
> abajo salieron al reescribir la misma feature sobre Nuxt 4 + Vue 3 y son de
> sistema. Se agregan al final para no tocar nada de lo anterior.

### R14 · Un SVG que necesita `currentColor` se inlinea con `?raw`, no con un plugin

Vue/Nuxt **no tiene** el equivalente del import de componente SVG de Astro que
usaba la implementación anterior. La forma que se adoptó, sin agregar ninguna
dependencia:

```ts
import glifo from '@/assets/social/linkedin.svg?raw'
```

y se pinta con `v-html` dentro de un envoltorio `aria-hidden`, dimensionado con
un `:deep(svg) { width: 100%; height: auto }` en el `<style scoped>`. El
`:deep()` **no es opcional**: el contenido que inyecta `v-html` no lo reescribe
la transformación de estilos con scope de Vue, así que una regla `svg {}` a
secas nunca hace match.

Verificado: `vite/client.d.ts` declara `*?raw` como `string`, y
`.nuxt/types/builder-env.d.ts` lo importa, así que tipa solo. El alias
`@/assets` ya está declarado en los tres lugares que hacen falta.

**Por qué importa más allá de esta feature:** el menú móvil necesita el ícono
`x` de lucide, y los formularios necesitan `chevron-down` y `paperclip`. Todos
siguen esta misma vía. Se descartó agregar un plugin de Vite para SVG —
infraestructura de build nueva, con su propia superficie de supply chain, para
un problema de cuatro archivos, y habría que sincronizarla aparte en
`.storybook/main.ts`. Se reevalúa solo si aparece un sistema de iconografía de
verdad.

### R15 · Los alias solo se duplican en Storybook, no en Vitest

El Artículo XII pide replicar los alias en `.storybook/main.ts` porque ahí Vite
corre fuera de Nuxt. **`vitest.config.ts` no lo necesita**: `defineVitestConfig`
de `@nuxt/test-utils` levanta Nuxt y fusiona su config de Vite resuelta —
incluidos `resolve.alias`, el plugin de Vue y el manejo de `?raw`. Duplicarlos
ahí sería una tercera copia que se desincroniza sola.

### R16 · El entorno de pruebas es uno solo, y es global

Vitest 4 eliminó `environmentMatchGlobs`, y `defineVitestConfig` **lanza un
error** si la config declara `projects` o `workspace`. No hay forma limpia de
dar DOM a una carpeta y dejar otra en Node.

**Regla:** `environment: 'happy-dom'` global, e `include` que abarque tanto
`tests/**` como los tests de componente colocados junto a su `.vue`. Las
pruebas que no tocan el DOM no se rompen por tenerlo disponible. Cualquier
feature futura que agregue tests de componente extiende ese `include`, no
inventa un proyecto nuevo.

### R17 · Los nombres de una sola palabra de los primitivos no violan el lint

`Radar`, `Wordmark`, `Lockup` y `Pill` son de una sola palabra, y `biome.json`
desactiva `useVueMultiWordComponentNames` para `app/pages/**` y
`app/layouts/**` — lo que parecía indicar que la regla iba a estallar en
`app/shared/ui/`.

**No estalla.** Verificado ejecutando Biome dos veces contra el config real: la
regla **no forma parte del preset `recommended`**, y solo dispara si se activa
a mano. Los nombres del contrato se conservan tal cual y **no hace falta tocar
`biome.json`**. El override existente para páginas y layouts es defensivo, no
una señal.

---

## Feature 002 · Primitive UI layer — hallazgos de implementación (2026-09-06)

> Las tres reglas de abajo salieron al **implementar** la feature 002 y
> corrigen suposiciones de su propio `research.md`. Se agregan al final; nada
> de lo anterior se toca.

### R18 · En el build del sitio, las variables `--color-*` del tema no existen

`app/assets/css/global.css` declara el tema con `@theme inline`. Esa palabra
clave hace que Tailwind **sustituya el valor directamente dentro de cada
utilidad** en vez de referenciarlo, así que la variable del tema solo llega a
`:root` si el escaneo de contenido encuentra a alguien usándola.

Verificado sobre el CSS emitido por `pnpm generate`
(`.output/public/_nuxt/*.css`): `--red-400` está en `:root`, y las
declaraciones `--color-*` son **cero**.

**Regla:** cualquier CSS escrito a mano (un `<style scoped>`, una at-rule de
documento) tiene que referirse a los nombres de la rampa — `var(--red-400)`,
`var(--bone-100)`, `var(--stroke-led)` — nunca a los nombres del tema
(`var(--color-red-400)`), que en el sitio resolverían a nada y romperían el
degradado en silencio. Las utilidades (`bg-red-400`, `text-bone-100`) no se
ven afectadas; esto aplica **solo** a CSS escrito a mano.

> ⚠️ **El catálogo no sirve para detectar este error.** En
> `storybook-static/assets/iframe-*.css` sí aparecen
> `--color-red-400: var(--red-400)` y `--color-bone-100: var(--bone-100)` —
> exactamente esas dos y ninguna más. No es que Storybook trate el tema
> distinto: es que su escaneo de contenido alcanza los `.md` de `specs/` y
> `docs/`, donde esos dos nombres están escritos como `var(--color-…)` (13 y 4
> ocurrencias), y Tailwind emite la variable del tema al verla usada. El del
> sitio, acotado por Nuxt a la app, no los ve.
>
> Consecuencia práctica: un anillo escrito con `var(--color-red-400)` se
> vería **bien en Storybook y roto en producción**, y dejaría de verse bien en
> Storybook en cuanto alguien editara esos `.md`. Al verificar este tipo de
> variable, mirar el build del sitio, no el del catálogo.

`research.md` § R3 de la feature 002 documentaba `var(--color-red-400)` para
el anillo LED. Es incorrecto y quedó implementado con `var(--red-400)`, que es
además lo que ya usaba la implementación anterior en Astro.

### R19 · Storybook necesita el plugin de SFC declarado a mano

`@storybook/vue3-vite@10` **no aporta `@vitejs/plugin-vue`**: su preset solo
agrega su compilación de plantillas y su docgen, y `@storybook/builder-vite`
espera encontrar el plugin en el `vite.config.*` del proyecto. Este repo no
tiene uno, porque Nuxt es el dueño de la config de Vite.

Síntoma exacto sin el plugin: `PARSE_ERROR — Unexpected JSX expression` en la
primera línea de cada `.vue` importado desde un story, y `pnpm storybook:build`
falla. Con solo stories de plantilla en línea el problema no aparece, que es
por qué no se detectó al montar Storybook.

**Regla:** `.storybook/main.ts` registra `vue()` en su `viteFinal`, junto a
`tailwindcss()` y a los seis alias. Es la misma obligación del Artículo XII
("lo que Nuxt provee, Storybook lo redeclara"), extendida al compilador de
SFC. `@vitejs/plugin-vue` pasa a ser devDependency explícita en la versión que
ya estaba en el árbol como dependencia transitiva de Nuxt (6.0.8): no entra
código nuevo, solo se vuelve importable.

### R20 · `useVueMultiWordComponentNames` sí emite diagnóstico, pero no rompe el gate

Corrección a R17. La regla **no** está silenciosa: con `preset: recommended`
emite un diagnóstico de nivel **info** por cada componente de una palabra
(`Radar`, `Wordmark`, `Lockup`, `Pill`). Lo que R17 acertó es la consecuencia
práctica: `biome check --error-on-warnings` **sale con código 0**, porque no
promueve los `info` a error.

**Regla:** los cuatro nombres del contrato se conservan.

**Resuelto 2026-09-06.** Los 4 `info` salían en cada commit y cada push, y
ruido que siempre se ignora entrena a ignorar salida que sí importa. Se
aplicó la salida que esta misma regla anticipaba: un `overrides` que apaga
`useVueMultiWordComponentNames` en `app/shared/ui/**`, junto a `app/pages/`
y `app/layouts/`. **No se renombró ningún primitivo.**

**Por qué apagarla ahí es legítimo y no una supresión de conveniencia:** la
regla previene que un componente de una palabra choque con un elemento HTML
cuando está **registrado globalmente**. Nuxt auto-importa únicamente desde
`app/components/`; `app/shared/ui/` no está en esa ruta, así que estos
componentes se importan explícitamente en cada SFC. No hay registro global,
no hay colisión posible — la premisa de la regla no se cumple aquí.

Renombrar habría sido peor: solo `Pill` tiene nombre de dos palabras en el
diseño (`Pill sección`). `Radar`, `Lockup` y `Wordmark` habrían exigido
inventar prefijos que el diseño no usa, y romper los contratos que la
feature 3 va a consumir.

La regla **sigue activa** en el resto del código, incluido cualquier
componente futuro dentro de una feature.
