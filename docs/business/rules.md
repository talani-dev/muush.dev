# Reglas de negocio y de sistema

> ## Quién puede agregar aquí — política, 2026-09-07
>
> **Una regla de negocio la determina un humano, nunca un agente.** Se agrega
> aquí solo cuando Roberto —u otra persona— lo pide explícitamente, y siempre
> apoyada en algo que un humano escribió o decidió. Un agente que "descubre"
> una regla al especificar o al implementar **no la escribe**: la reporta y
> espera.
>
> Esto corrige lo que venía pasando. El archivo se llenó de hallazgos de
> herramienta —comportamientos de Chrome, globs de Vitest, defaults de CSS—
> que nunca fueron reglas de negocio. El `implementer` los escribía sin tener
> mandato alguno para hacerlo, por imitación del patrón que ya veía en el
> archivo. Los 14 hallazgos técnicos se movieron a
> `docs/harness/findings.md` el 2026-09-07.
>
> **Dónde va cada cosa:**
>
> | Qué | Dónde |
> |---|---|
> | Regla de negocio, dicha por un humano | aquí |
> | Decisión de arquitectura | `.specify/memory/constitution.md` |
> | Comportamiento de herramienta, medición, trampa | `docs/harness/findings.md` |
> | Detalle que solo importa en un archivo | comentario en ese archivo |
>
> ## Sobre el contenido existente
>
> Cada entrada cita la feature que la originó. **Se agrega, nunca se
> sobrescribe.** Complementan `branding.md`, `landing/design-extract.md`,
> `landing/ui-map.md` y `landing/decisions-open.md`; donde haya conflicto,
> gana el documento específico salvo que aquí se marque una corrección
> explícita con fecha.
>
> ⚠️ **R1–R31 y R36–R50 las determinaron agentes, no humanos**, bajo la
> política anterior. Siguen aquí porque hay código y specs que las
> referencian, pero **ninguna ha sido revisada por una persona** y varias son
> decisiones de arquitectura mal ubicadas más que reglas de negocio. La única
> de origen humano es la § R32, que sale de la decisión de Roberto del
> 2026-09-07 sobre el `.pen`. Depurarlas es trabajo pendiente.

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

---

## Feature 003 · Site shell — reespecificación sobre Nuxt (2026-09-07)

> Las reglas R9–R13 de arriba salieron del ciclo original de esta misma
> feature en Astro. **R9, R11, R12 y R13 siguen vigentes**: son reglas de
> diseño, de marca o de la plataforma web, no del framework. **R10 queda
> corregida por R21.** Las cuatro de abajo salieron al especificar y planear
> la feature sobre Nuxt 4, y están verificadas contra un `pnpm generate`
> real. Se agregan al final para no tocar nada de lo anterior.

### R21 · Corrección a R10 — la forma de la salida estática de Nitro

R10 concluyó que todo `href` interno debe llevar diagonal final. Esa
conclusión se derivó del `build.format: 'directory'` de Astro y **no
transfiere a Nitro tal cual**. Lo verificado el 2026-09-07 con
`pnpm generate`:

```
.output/public/es/index.html
.output/public/en/index.html
.output/public/200.html
.output/public/404.html
```

**Lo que sí transfiere:** el objeto vive en `es/index.html`, así que
`/es/nosotros` se emitirá como `es/nosotros/index.html`
(`nitro.prerender.autoSubfolderIndex` es `true` por defecto).

**Lo que NO transfiere:** que agregar la diagonal al `href` resuelva algo.
Depende del origen de CloudFront, no del marcado:

| Origen | `/es/nosotros` | `/es/nosotros/` |
|---|---|---|
| Endpoint **website** de S3 | resuelve (301) | resuelve |
| Origen **REST** de S3, sin reescritura | **404** | **404** |
| REST + CloudFront Function que agrega `index.html` | resuelve | resuelve |

Con origen REST y sin reescritura, la forma con diagonal **también falla** —
la llave `es/nosotros/` tampoco existe. Poner diagonales solo *parece*
arreglarlo.

**Regla:** los `href` se emiten en la forma que produce `useLocalePath()`,
sin diagonal final, y la reescritura de documento índice es un **requisito
de despliegue**, no un parche de marcado. Pendiente de confirmar con Roberto
que existe en la distribución.

**Hallazgo adicional del mismo build:** `/` **no genera ningún archivo**.
`i18n.rootRedirect` viene vacío por defecto y el redirect es de runtime, así
que en un sitio prerenderizado solo existe si `/` se prerenderiza. Quien
toque el enrutamiento tiene que verificarlo corriendo el comando, no
leyendo la documentación.

### R22 · `switchLocalePath` devuelve cadena vacía, y una cadena vacía miente

`SwitchLocalePathFunction` de `@nuxtjs/i18n@10.6.0` está tipada
`(locale: Locale) => string` y devuelve la **cadena vacía** cuando la ruta
actual no tiene equivalente en el idioma destino. Un `href=""` resuelve a la
página actual: el visitante hace clic en el toggle y no pasa nada, sin error
en consola y sin nada que revisar.

**Regla:** todo consumo de `switchLocalePath` pasa por una función pura que
garantiza un destino real — si viene vacío, cae al home del otro idioma. Esa
función es además lo único que tiene sentido cubrir con pruebas unitarias:
una prueba que afirma `switchLocalePath('en') === '/en/about'` prueba la
librería, no el repositorio.

**Generaliza:** cualquier helper de una librería tipado `=> string` que pueda
devolver `''` para "no hay resultado" necesita esta guarda. El tipo no
distingue el caso vacío del caso resuelto.

### R23 · Storybook necesita el stub de `NuxtLink` declarado a mano

Extensión directa de R19. Storybook corre Vite fuera de Nuxt, así que además
del compilador de SFC y los alias, **tampoco tiene `NuxtLink`**. Un
componente que lo use no renderiza en el catálogo.

La salida adoptada, sin tocar la API de ningún componente: registrar un stub
global en `.storybook/preview.ts` usando el export `setup()` de
`@storybook/vue3-vite`, que renderiza `<a :href="to"><slot /></a>`.

Se descartaron las dos alternativas: que los componentes rendericen `<a>`
suelto (convertiría toda navegación interna en recarga completa, tirando el
enrutamiento de cliente de todo el sitio para resolver un problema del
catálogo) y una prop `linkComponent` por componente (contamina la superficie
pública de cinco componentes por una preocupación del arnés de pruebas).

**Corolario que vale más que la regla:** el catálogo solo puede detectar esto
si los componentes de `ui/` **no llaman ninguna composable de Nuxt**. Esa
disciplina — copy y destinos resueltos llegan como props, `logic/` los
resuelve — es lo que hace que un componente tramposo falle de inmediato en
Storybook en vez de en producción.

### R24 · El renglón superior del footer de escritorio está sobre-restringido en el diseño

`design-extract.md` § 9.bis registra tres valores que no pueden cumplirse a la
vez en el frame de 1440:

```
caja de contenido = 1440 − 80 − 80        = 1280
Marca                                      =  340
Columnas = 4 × 180 + 3 × 64                =  912
Marca + Columnas                           = 1252   (caben, sobran 28)
Marca + gap 80 + Columnas                  = 1332   (se pasan por 52)
```

**Decisión:** cede el gap. El renglón es `space_between` — que el mismo § 9.bis
registra — y `space_between` reparte lo que sobra en vez de honrar un gap
declarado; a 1440 exactos realiza 28px, no 80. La Marca conserva sus 340 y
**las columnas flexionan: los 180 son una base, no un ancho fijo.** Tratarlos
como fijos reproduce el desbordamiento.

El frame móvil no tiene el conflicto: `390 − 24 − 24 = 342`, y dos columnas con
gap 20 lo dividen en 161 cada una — los mismos 342 que usan los items y el
divisor del menú.

**Pendiente:** Clau debería corregirlo en el archivo de diseño, junto con el
filete fuera de paleta de R11. Mismo criterio que R2 y R11: se implementa lo
coherente con el sistema y se registra la discrepancia en vez de silenciarla.

---

## Feature 003 · Site shell — hallazgos de implementación (2026-09-07)

> Las reglas R21–R24 salieron del ciclo de **especificación** de esta misma
> feature y siguen vigentes tal cual. Las tres de abajo salieron al
> **implementarla** y ninguna estaba anticipada. Se agregan al final; nada de
> lo anterior se toca.

### R25 · Nitro **no** emite archivo para `rootRedirect`, ni forzándolo

`research.md` § R1d de la feature 003 proponía `i18n.rootRedirect: '/es'` más
`'/'` en `nitro.prerender.routes`, y pedía explícitamente **correr el comando**
en vez de cerrarlo leyendo. Se corrió, y el resultado es negativo:

```
$ pnpm generate
[nitro] ℹ Prerendering 5 initial routes with crawler
[nitro]   ├─ /200.html  ├─ /404.html  ├─ /es  ├─ /en …     ← `/` no aparece
$ ls .output/public/index.html
ls: .output/public/index.html: No such file or directory
```

`rootRedirect` sí llega al runtime config del HTML generado
(`rootRedirect:"/es"`), así que la opción está bien puesta: lo que no ocurre es
la escritura del archivo. La ruta se descarta del crawl y el redirect queda
como comportamiento de **runtime**, que en un sitio estático no corre nadie.

**Decisión:** se aplicó el fallback que la propia tarea contemplaba — un
`public/index.html` versionado con `meta refresh`, `canonical` y el juego de
`hreflang`, más un enlace real para que funcione sin scripting y sin refresh.
La entrada en `nitro.prerender.routes` se **borró** en vez de dejarse como
no-op: una línea de configuración que no hace nada es peor que su ausencia,
porque el siguiente lector asume que sí hace algo. `rootRedirect` se conserva
porque sí gobierna `nuxt dev` y el router de cliente cuando el host sirve
`200.html` como fallback de SPA.

**Generaliza:** cualquier redirect declarado como configuración de runtime hay
que verificarlo contra `.output/public`, no contra la documentación de la
opción. En este repo la pregunta siempre es "¿qué archivo se escribió?".

### R26 · Una arroba en un archivo de locale rompe la compilación de vue-i18n

`support@muush.dev` en `i18n/locales/*.json` **impide compilar el archivo
entero**:

```
Error: Invalid linked format (error code: 10) in i18n/locales/en.json
  target message: support@muush.dev
  target message path: shell.footer.contact.email
```

vue-i18n lee `@` como el inicio de un *linked message* (`@:otra.clave`). No es
un warning: la suite de paridad falló al importar el JSON, y el sitio no
compila.

**Regla:** una arroba literal en copy se escribe `{'@'}` — la escapatoria
documentada de vue-i18n, que renderiza un `@` normal. Verificado en el HTML
generado: el ítem del footer dice `support@muush.dev`.

**Ojo con el alcance:** esto aplica **solo** al copy. El `mailto:` del footer y
las URLs de TikTok (`tiktok.com/@muush.dev`) viven en
`app/features/shell/data/`, que es TypeScript y no pasa por el compilador de
mensajes. Si alguna vez una URL con arroba se mueve al archivo de locale,
vuelve a romper.

### R27 · El JSON de locales llega como AST, no como objeto, y eso vacía una prueba

La transformación de Vite de `@nuxtjs/i18n` compila los archivos de locale a un
**AST de mensajes** en el import — desde `app/` y también desde `tests/`. Un
nodo del AST nunca es la cadena vacía, así que la aserción "ningún valor vacío"
de `tests/i18n-parity.test.ts` **pasaba con cualquier entrada**. La de "mismas
claves" seguía siendo válida por casualidad: las dos estructuras compiladas son
igual de profundas.

Descubierto al escribir una prueba que comparaba un valor de copy contra su
texto literal y recibía un objeto con `{ type, start, end, loc, … }`.

**Regla:** toda prueba que afirme algo sobre el **contenido** de un archivo de
locale lo lee del disco (`readFileSync` + `JSON.parse`), nunca lo importa. Ya
está aplicado a `tests/i18n-parity.test.ts` y a `tests/shell-copy.test.ts`, y
la comprobación de vacíos quedó verificada con un control negativo: poner
`""` en una clave hace fallar la suite.

**Detalle de entorno:** el path se arma con `node:path` y `process.cwd()`, no
con `new URL(..., import.meta.url)`. El entorno global es `happy-dom`
(§ R16), que reemplaza el `URL` global por una implementación que `node:fs` no
acepta — el síntoma es un `ENOENT` sobre la ruta `[object Object]`.

---

## Feature 006 · Fondo del sitio y chrome de marca — especificación (2026-09-07)

> Las cuatro reglas de abajo salieron al **especificar** la feature 006
> (`site_background_and_brand_chrome`). Se agregan al final; nada de lo
> anterior se toca. Las que salgan al implementarla se agregan después, en su
> propia sección, igual que hicieron R25–R27 con la feature 003.

### R28 · El orden de pintado es el contrato del fondo, y se rompe en silencio

El fondo del sitio son cuatro capas, en el orden que fija el frame `SdEJx`:
base `ink-500` → glows de sección → papel punteado → contenido.

La restricción real no es dibujarlas: es que **el papel punteado es una sola
hoja de página completa** y **los glows se escriben dentro de cada sección**,
pero tienen que pintarse **debajo** de esa hoja. Se resuelve con orden de
pintado de CSS, no con estado:

| Nivel | Qué | Dónde se escribe |
|---|---|---|
| fondo del elemento raíz | base `ink-500` | el layout |
| `--layer-glow` (`-2`) | los glows de cada sección | dentro de la sección |
| `--layer-dots` (`-1`) | el papel punteado, de página completa | el layout |
| flujo normal | nav, contenido, footer | en todas partes |

**Los dos niveles tienen que ser distintos.** Si compartieran nivel, el
desempate es el orden del documento y los glows —que van después— quedarían
**encima** de los puntos, invirtiendo el diseño.

**Lo que le exige a cualquier sección futura:** la sección es
`position: relative`, mete sus glows en `<SectionBackdrop>`, y **ni ella ni
ningún envoltorio entre ella y la raíz del layout puede crear un contexto de
apilamiento** (`transform`, `translate`, `filter`, `backdrop-filter`,
`opacity < 1`, `isolation`, `will-change`, `contain: paint`, `sticky`/`fixed`
con `z-index`). Tampoco puede pintarse un fondo opaco propio: se taparía sus
propios glows. El único bloque opaco del diseño es el footer, y no aporta
glows.

**El modo de falla es silencioso**: no hay error, la página simplemente deja
de parecerse al diseño. Por eso la regla vive en tres lugares — el comentario
de `SectionBackdrop.vue`, el `quickstart.md` de la feature y aquí.

**Salida de emergencia:** una sección que de verdad necesite un `transform`
sube sus glows al nivel de página. Es un cambio en esa sección, no en la capa.

Se descartaron, con razones, `<Teleport>` (Vue SSR no resuelve un teleport a
un selector arbitrario dentro de la app, así que los glows no saldrían en el
HTML prerenderizado), un registro con `provide`/`inject` (en SSR el padre
renderiza antes que el hijo, así que la capa saldría vacía, y agrega estado de
cliente a algo idéntico en cada carga) y una lista central de los 21 en el
layout (lo que Roberto descartó explícitamente el 2026-09-07: cinco features
futuras editando la misma lista).

### R29 · Los offsets de los glows del diseño son absolutos de página; en código son relativos a su sección

`design-extract.md` § 10 y el archivo de diseño colocan los glows por
posición absoluta dentro de un frame de 1440×5060, varios con x negativa. **Un
offset absoluto de página no sobrevive al contenido real**: la altura de cada
sección depende del copy y del idioma, así que en cuanto una frase crece, todo
lo que venía después se desalinea.

**Regla:** cada glow se posiciona relativo a **su propia sección**. Convertir
el offset del diseño a un offset relativo a la sección es trabajo de la
feature que construya esa sección, no del fondo.

**Discrepancia registrada de paso (D-01):** el frame `SdEJx` tiene **once**
glows en Landing; § 10 documenta **doce**. El sobrante es `Glow origen`
(red-400 12%, 920px, solo escritorio), que § 10 describe como el ancla de la
constelación de Propósito. **Gana el archivo de diseño** (decisión de Roberto,
2026-09-07 — ver § R32): Landing tiene **once**, el total del sitio es **21**
y no 22, y `Glow origen` es documentación vieja, no un nodo que falte
encontrar. **Lo que se corrige es `design-extract.md` § 10** — la fila, el
total y el bullet de "Observaciones" que lo menciona. Pendiente de Clau.
Quien construya Propósito monta once, y no resucita el doceavo desde el
documento.

### R32 · El `.pen` manda sobre `docs/business/` · y el que extrae los valores es el líder

> Decisión de Roberto, 2026-09-07. Corrige cómo la spec de la feature 006
> había resuelto D-01, que había preferido el documento.

**Primera mitad — precedencia.** El archivo de diseño
`/Users/betonajera/Documents/Muush/Landing Page/muush.pen` es el artefacto
**más actualizado** y la **fuente de verdad de todo lo visual**. Los archivos
de `docs/business/` —`landing/design-extract.md` el primero— son **derivados**
de él y pueden quedarse atrás.

**Cuando se contradicen, gana el `.pen` y lo que se corrige es el documento.**
Nunca al revés, y nunca "se registra la discrepancia y se sigue con el
documento": eso deja el error vivo en el archivo que todos leen. La
discrepancia se registra **y** se abre la corrección del documento con dueño
(Clau, salvo que sea un dato que le toque a otra persona).

Esto no degrada a `design-extract.md`: sigue siendo la referencia de medidas
que se lee todos los días, precisamente porque el `.pen` no se puede abrir
desde cualquier sesión. Solo fija quién gana un empate.

**Segunda mitad — y esta es la que muerde.** El puente MCP de Pencil **solo
existe en la sesión interactiva principal**: los subagentes (`spec_author`,
`implementer`, `reviewer`) no lo heredan aunque aparezca en su lista de
herramientas. Está registrado en la Constitución (§ *Development Workflow*) y
en la descripción de la feature 3 en `feature_list.json`.

Consecuencia operativa, en orden:

1. **Un subagente no puede verificar la fuente de verdad por su cuenta.** No
   es una cuestión de disciplina, es que la herramienta no responde.
2. **Extraer valores del `.pen` es responsabilidad del líder.** Los lee del
   frame y los pasa hacia abajo en el prompt de la tarea — exactamente como se
   hizo con el frame `SdEJx` para la feature 006.
3. **Una lectura del frame que da el líder pesa más que
   `docs/business/`.** Una spec que en silencio prefiere el valor del documento
   sobre el que le pasaron está reintroduciendo el bug que esta regla existe
   para cerrar.
4. **Si a un subagente le falta un valor, lo pide.** Pregunta al líder; no cae
   al documento y no lo presenta como medida del diseño. La alternativa es
   marcarlo `UNVERIFIED` con dueño, que es lo que ya hacen A-01/A-02 de la
   feature 003.

**Cómo se lee esto en una spec:** la sección de procedencia distingue
`CONFIRMED` (contra el `.pen`, vía el líder, o contra el repositorio),
`DERIVED` (aritmética a la vista) y `UNVERIFIED` (nadie lo documenta). Un
valor tomado solo de `docs/business/` y contradicho por el frame **no es
`CONFIRMED`**: es documentación vieja.

---

## Feature 006 · Fondo del sitio y chrome de marca — hallazgos de implementación (2026-09-07)

> Las reglas R28–R32 salieron del ciclo de **especificación** de esta misma
> feature. Se verificaron una por una al implementarla y **las cinco quedan
> vigentes tal cual**: el orden de pintado funciona como lo describe R28
> (verificado en el navegador, ver abajo), R31 acertó en la ruta de emisión de
> `@nuxt/fonts` **y en que no haría falta `global: true`**, y R29, R30 y R32 no
> se tocan. Las tres de abajo salieron al implementar y ninguna estaba
> anticipada. Se agregan al final; nada de lo anterior se toca.

## Feature 008 · Spotlight del cursor — especificación (2026-09-07)

> Las cuatro reglas de abajo salieron al **especificar y planear** la feature
> 008 (`cursor_spotlight`). Se agregan al final; nada de lo anterior se toca.
> Las que salgan al implementarla se agregan después, en su propia sección,
> igual que hicieron R33–R35 con la feature 006.
>
> ⚠️ **R37 modifica la § R28, y ya está vigente.** La feature 008 se implementó
> el 2026-09-07: `global.css` declara los tres niveles negativos y el árbol
> corresponde a la tabla de la § R37, no a la de la § R28. Verificado en el
> navegador contra el artefacto generado: el backdrop de sección computa
> `z-index: -3`, la hoja de puntos `-2`, la raíz del spotlight `-1` y el
> contenido `auto`.

### R36 · `--color-glow-*` y `--spacing-glow-*` son un namespace cerrado de `SectionGlow`

`app/shared/ui/SectionGlow.test.ts` construye

```ts
globalCss.matchAll(/--(?:color|spacing)-glow-[\w-]+(?=\s*:)/g)
```

y luego afirma **en las dos direcciones**: que toda combinación de props
alcanza un token declarado, y que **todo token declarado con ese prefijo es
alcanzable desde las props**. Es una prueba correcta — es lo que mantiene
honestos los 12 pares afinados a mano — y tiene una consecuencia que no es
obvia: **cualquier feature que agregue un token llamado `--color-glow-…` o
`--spacing-glow-…` rompe esa suite sin tocar una línea de `SectionGlow.vue`.**

El mensaje sería `should leave no glow token in global.css unreachable …` en un
archivo que la feature nueva nunca abrió, y el instinto sería relajar la
prueba. **No se relaja.** La lectura correcta es que `glow` es un namespace
cerrado: un fondo radial nuevo usa su propia familia
(la feature 008 usa `--spotlight-*`).

Corolario del mismo hallazgo: tampoco se resuelve *ampliando* las uniones de
opacidad de `SectionGlow`. Serían tres tokens más en ese namespace **y** un
cambio a un contrato `done`.

### R37 · La § R28 pasa a **tres** niveles negativos

El orden de pintado del fondo queda así, y **la relación es el contrato, no
los números**:

| Nivel | Qué | Dónde se escribe |
|---|---|---|
| fondo del elemento raíz | base `ink-500` | el layout |
| `--layer-glow` (**−3**) | los glows de cada sección | dentro de la sección |
| `--layer-dots` (**−2**) | el papel punteado, de página completa | el layout |
| `--layer-spotlight` (**−1**) | el spotlight del cursor: la luz y los puntos iluminados | el layout, tras montar |
| flujo normal | nav, contenido, footer | en todas partes |

**Por qué se renumera en vez de agregar un nivel libre:** el spotlight tiene
que pintar **encima** de los puntos para poder iluminarlos
(`ui-map.md:271`), y **no existe un entero entre `−1` y `0`**.

**Los dos tokens conservan su nombre**, así que `DotGrid.vue` y
`SectionBackdrop.vue` —que nombran el token y nunca el número— no cambian.
Todo lo que la § R28 exige de una sección sigue idéntico: el spotlight es
hermano de la hoja de puntos, nunca ancestro de una sección.

**Descartado, con razones.** Compartir `--layer-dots` y confiar en el orden
del documento es exactamente la fragilidad que la § R28 existe para prohibir;
aceptarla una vez la erosiona para las cinco features de sección que faltan.
Poner el spotlight **debajo** de los puntos no exige enmienda alguna y sí
funciona para los puntos —dos hojas del mismo color en las mismas posiciones
dan el mismo píxel en cualquier orden, porque `1−(1−a)(1−b)` es simétrico—
pero entierra **la luz** bajo glows de sección de hasta 65% justo donde la
página es más brillante, contra un frame que dibuja los círculos encima.

**Efecto secundario que hay que pagar en el mismo cambio:**
`DotGrid.stories.ts` y `SectionBackdrop.stories.ts` imprimen los números
viejos en un comentario. Se corrigen junto con la renumeración, nunca después:
un comentario que contradice la hoja de estilos es justo la deuda que la
feature 7 existe para saldar.

### R38 · Hay valores que el archivo de diseño **no puede** contener, y ese hueco se registra, no se inventa

`ui-map.md:271` pide que los puntos del papel dentro del radio del spotlight
suban de brillo. El frame `gViAx` dibuja tres posiciones estáticas con los dos
círculos sobre un campo de puntos **normal**: un mockup estático no puede
dibujar una respuesta al puntero. **No es documentación vieja (§ R32), es una
imposibilidad estructural**, y las dos se tratan distinto: la vieja se
corrige, esta se registra.

La salida adoptada no inventa un porcentaje: la capa del spotlight vuelve a
pintar **la misma receta** `--dot-paper-*`, así que dentro del radio el punto
queda al `1 − (1 − 0.12)² = 22.6%` — un valor **derivado**, no elegido. Un
token (`--dot-paper-lit-color`) queda delante para que el día que Clau dé una
cifra cueste una línea. **Pendiente de Clau.**

**Generaliza:** cuando el diseño pide un comportamiento que ningún frame puede
dibujar, la spec (1) lo marca `UNVERIFIED` con dueño, (2) elige una derivación
aritmética a partir de valores que **sí** están confirmados, y (3) deja un
token delante. Presentar la derivación como si fuera una medida del diseño es
el error que la § R32 cierra.

## Feature 008 · Spotlight del cursor — hallazgos de implementación (2026-09-07)

> Las reglas R36–R39 salieron del ciclo de **especificación** de esta misma
> feature. Se verificaron una por una al implementarla y **las cuatro quedan
> vigentes**: el namespace cerrado de la § R36 se respetó y `SectionGlow.test.ts`
> pasa sin modificarse; la § R37 ya está en el árbol (ver el aviso de arriba);
> la § R38 se cumplió tal cual y su derivación resultó **exacta al medirla**
> (abajo); y la § R39 se demostró con un rojo deliberado antes de escribir una
> sola aserción real. Las cinco de abajo salieron al implementar y ninguna
> estaba anticipada. Se agregan al final; nada de lo anterior se toca.

## Feature 009 · Hero — especificación (2026-09-07)

> Las cinco reglas de abajo salieron al **especificar y planear** la feature
> 009 (`hero_section`), la primera sección real del sitio. Se agregan al final;
> nada de lo anterior se toca. Las que salgan al implementarla se agregan
> después, en su propia sección, igual que hicieron R33–R35 con la feature 006
> y R40–R45 con la 008.
>
> Las cuatro primeras son de sistema y **aplican a las cinco secciones que
> faltan**, no solo al Hero.

### R48 · Cómo se convierte un offset de glow de página a sección — la receta

> ⚠️ **Corregida el mismo día que se escribió (2026-09-07).** La primera
> versión de esta regla decía que el eje horizontal se vuelve un **porcentaje
> de la sección** y que basta con el frame de escritorio. **Es falso**, y se
> deja escrito abajo con su desmentido porque es exactamente la inferencia que
> las cinco secciones que faltan van a repetir.

La § R29 dice **que** hay que convertir los offsets y deja el **cómo** a quien
monte cada sección. Esta es la receta, ya corregida contra los cuatro frames
del Hero.

1. **Se piden los centros de LOS DOS viewports al líder.** No uno. Las
   coordenadas del frame son la esquina superior izquierda (convención de todas
   las lecturas de `docs/business/`: § 9.bis coloca los items del menú en
   "x 24, y 176"), así que el centro sale sumando el radio — pero eso solo
   convierte una coordenada, no inventa la otra.
2. **El origen de la sección es la caja real, no la página.** Horizontal: el
   margen de página (80 / 24). Vertical: **el borde inferior del nav**, porque
   el nav va en flujo normal y `<main>` no lleva padding superior (§ R49).
3. **Cada offset se interpola entre sus dos extremos medidos** con `clamp()`,
   la misma interpolación 390↔1440 de la escala fluida. Son **seis** tokens por
   sección de tres glows: uno por glow por eje.
4. **Solo los extremos son diseño.** Todo ancho intermedio es una decisión de
   suavizado y hay que decirlo en el comentario del token, o el siguiente
   lector va a tomar un valor a 900px por algo que dibujó Clau. Se elige el
   `clamp()` sobre seis media queries para que la sección conserve la propiedad
   de tener **un solo breakpoint, que cambia dirección y nunca una posición**.
5. **El glow se ancla por su CENTRO**, con `-translate-x-1/2 -translate-y-1/2`
   (permitido sobre un glow individual, § R28). Su diámetro es un `clamp()`;
   anclado por la esquina, el centro se desplazaría al cambiar el diámetro y la
   composición solo sería correcta a 1440 exactos.

#### Lo que NO funciona, y por qué parecía que sí

La feature 009 derivó primero las posiciones móviles de las de escritorio, de
dos formas, y **las dos fallaron** al leer los frames `t5n4Sm` / `dwool`:

| Derivación | Predice a 390 | El diseño dibuja | Error |
|---|---|---|---|
| `foco` x = 96.094% de la sección | 374.8 | **410** | 35px |
| `wine` x = 3.906% | 15.2 | **40** | 25px |
| `cierre` x = 105.469% | 411.3 | **440** | 29px |
| `cierre` y = `calc(100% + 94px)` | 94px **debajo** del borde inferior | **30px arriba** | cambia de signo |

Dos coincidencias hicieron que la derivación pareciera segura, y ninguna
sobrevivió:

- **El par especular.** En escritorio `foco` y `wine` caen en 0.90972 y 0.09028
  del ancho de página y **suman exactamente 1**. En móvil caen en 1.0513 y
  0.1026. La simetría es un hecho de un frame, no un sistema.
- **La proporción vertical.** El centro de `foco` está al 30.9% del alto de la
  sección en escritorio y al **7.8%** en móvil.

**Los glows están colocados a mano, frame por frame.** `design-extract.md` § 10
ya lo decía con todas sus letras — *"22 glows afinados a mano"*, *"el
posicionamiento es absoluto y distinto en las 22"* — y esa frase, leída
despacio, era la advertencia.

**Regla operativa, y vale para cualquier medida visual, no solo para glows:**
si a un subagente le faltan las coordenadas de un viewport, **las pide**
(§ R32, punto 4). No las deriva del otro y las presenta como medida del
diseño. Una derivación que reproduce perfectamente el frame del que salió no
es evidencia de nada: reproduce su propia fuente.

### R49 · El padding vertical de una sección se mide desde el nav, y la sección no lleva padding inferior

Dos consecuencias de que el nav esté en flujo normal y de que el diseño sea un
frame plano de 1440×5060 sin cajas de sección.

**Arriba.** El diseño coloca el primer hijo del Hero en `y310` (escritorio) y
`y150` (móvil), y `<main>` no lleva padding superior. Entonces el padding
superior de la sección es **`y del diseño − alto del nav`**, no `y` a secas.

| | Escritorio (1440) | Móvil (390) |
|---|---|---|
| **Alto del nav, resuelto del frame** | **103** | **76** |
| Derivado de los tokens del repositorio | 102.8 | 76.2 |
| **Padding superior de la sección** | 310 − 103 = **207** | 150 − 76 = **74** |

Las dos filas de arriba salieron de métodos sin relación —una lectura del
archivo de diseño y la aritmética de `--spacing-nav-y` más el hijo más alto del
renglón— y coinciden dentro del redondeo. **Igual se mide en el navegador**
(§ R44) como comprobación de que la página construida coincide con el frame;
dos de los cuatro sumandos de la derivación son productos de una altura de
línea sobre una tipografía real, y este repositorio ya se equivocó una vez
sobre una tipografía (la feature 006 existió por eso).

**Abajo.** La sección **no declara padding inferior**. La separación con lo que
viene después pertenece al bloque siguiente — que es exactamente lo que
`app/layouts/default.vue` ya dice del footer ("No bottom padding: the footer's
own `pt-footer-top` is the separation the design draws").

**Y ese sobrante ahora está medido**, así que quien monte `02 Propósito` no
tiene que adivinarlo:

| | Escritorio | Móvil |
|---|---|---|
| La sección Hero abarca (página) | 0 → **940** | 0 → **640** |
| La pila de contenido termina en | 776 | 550 |
| **Sobrante que le toca a Propósito** | **164** | **90** |

`02 Propósito` arranca en 940 / 640, y su padding superior es esos 164 / 90
**más** el offset interno de su propio primer hijo. Mismo cálculo que el de
arriba, un nivel más abajo.

**Corroboración aritmética que conviene repetir en cada sección:** con el mapeo
de tokens elegido, la pila del Hero calcula 38 + 34 + 2×96.04 + 34 + 2×31.5 +
34 + (14 + 55.2) = **464.3px** contra los **466** del frame. Un acuerdo de
1.7px entre siete valores derivados por separado no es casualidad: confirma el
mapeo **y** dice que el titular y el subtítulo van a dos líneas a 1440.

### R50 · Un destino que todavía no existe: las tres formas, y la que se elige según el control

El sitio tiene ya tres controles apuntando a decisiones abiertas y una
inconsistencia real entre el shell y las secciones. Queda escrito para que la
próxima sección no la decida otra vez.

**Invariante que ya se cumple y no se negocia:** el HTML generado no contiene
ningún `<a>` sin `href` — lo asserta `tests/static-output.test.ts` desde la
feature 003.

| Situación | Cómo se renderiza | Precedente |
|---|---|---|
| Ítem de lista sin destino (`FAQ`, `Blog`, `Agenda una llamada` del footer) | `<span class="text-ink-300">`. Sin ancla, sin cursor, sin hover | feature 003, `FooterColumn.vue` |
| **Texto suelto sin destino** (CTA secundario del Hero) | Igual: `<span>` en `ink-300`, **y sin la flecha** | feature 009 |
| **Control con caja sin destino** (CTA primario del Hero) | Conserva su caja, su anillo LED y su etiqueta, y **no lleva `href`**: `BotonPrimario` renderiza un `<button type="button">` real. No emite fragmento al HTML | feature 009 |

**Por qué el estado muerto no lleva flecha.** Una flecha es la señal de que
algo lleva a alguna parte, y esto no lleva a ninguna. Además la misma frase ya
se pinta sin flecha, en el mismo gris, en el footer de todas las páginas: el
sitio dice una sola cosa sobre ese control en vez de dos. La flecha vuelve el
día que llegue la URL, y la pone `LinkArrow`, nunca el copy.

**La flecha NUNCA vive en el string de i18n.** El `.pen` la escribe dentro del
texto (`Agenda una llamada →`) porque un mockup estático no puede dibujar un
hover — misma clase de cosa que la § R38. `LinkArrow` es dueño del glifo justo
para que el hover tenga qué mover, y un glifo en el string se renderizaría
**dos veces** el día que el control se active.

**Los dos huecos se modelan como datos**, en un solo archivo del módulo, cada
uno con el comentario de la decisión que lo bloquea. Llenar cualquiera de los
dos es **cambiar una clave**, nunca editar marcado. Un objeto con campos
opcionales y vacío hoy (`export const HERO_DESTINATIONS: HeroDestinations = {}`)
dice eso mejor que dos constantes en `undefined`.

**Ninguno se rellena con un sustituto**: ni `mailto:`, ni WhatsApp, ni el
footer, ni un scroll a una posición arbitraria.

> ⚠️ **Inconsistencia registrada, pendiente de Roberto.** El shell **ya emite
> cinco enlaces a anclas que no existen** — `#contacto` desde el CTA del nav,
> y `#proposito` / `#servicios` / `#proyectos` desde el menú móvil y la columna
> Navegación del footer. Hacer clic en cualquiera cambia la URL y no mueve
> nada. La feature 009 toma la línea estricta para su CTA primario (no emite el
> fragmento) por instrucción explícita y porque un fragmento colgante también
> es una URL colgante para un rastreador. **La inconsistencia es real y se
> disuelve sola cuando las secciones existan**; si conviene alinear el shell
> antes, es decisión de Roberto y no de la feature que toque el tema después.
