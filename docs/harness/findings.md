# Hallazgos técnicos de los ciclos de implementación

> **Esto NO son reglas de negocio.** Son cosas que un agente se topó al
> construir: comportamientos de herramienta, trampas de configuración y
> mediciones. Ninguna la decidió un humano.
>
> Vivían en `docs/business/rules.md` por imitación —el `implementer` no tiene
> mandato para escribir ahí y lo hizo de todos modos, y el `spec_author` tiene
> uno acotado a *reglas de negocio*, que ninguna de estas es. Se movieron aquí
> el **2026-09-07** por instrucción de Roberto. La numeración `R` original se
> conserva para que las referencias existentes en `specs/` y en el código
> sigan resolviendo; donde un archivo diga `rules.md § R34`, léase
> `findings.md § R34`.
>
> **Cómo leerlas.** No todas valen lo mismo. Las que traen tabla de mediciones
> o dicen "verificado corriendo X" son reproducibles. Las que solo argumentan
> son hipótesis bien redactadas. Ninguna pasó por revisión humana.
>
> Si algo de aquí merece ser norma del proyecto, lo decide un humano y sube a
> `rules.md` o a la constitución. Mientras tanto es memoria de trabajo.

---

### R30 · Storybook también necesita las fuentes declaradas aparte

Extensión directa de R19 y R23. Storybook corre Vite fuera de Nuxt, así que
además del compilador de SFC, los alias y el stub de `NuxtLink`, **tampoco ve
el módulo de fuentes**: no hay `@nuxt/fonts`, no hay handler de `/_fonts`, y
los binarios que el módulo escribe en `.nuxt/cache/fonts` llevan nombre con
hash de contenido, así que no se pueden referenciar a mano.

Al borrar los `@font-face` escritos a mano de `global.css`, el catálogo se
queda **sin ninguna declaración de fuente** y renderiza todo en la tipografía
de sistema — que es exactamente lo que el Artículo X existe para evitar: un
componente revisado en la tipografía equivocada no está revisado.

**Regla:** el catálogo declara las dos familias por su cuenta, en
`.storybook/`. Es tooling local y nunca se despliega; el artefacto del sitio
sigue siendo autocontenido, que es lo que gobierna el Artículo IV.

### R31 · `@nuxt/fonts` descarga en build y emite en `/_fonts` — se verifica sobre `.output/public`

Verificado sobre las declaraciones de tipos publicadas de `@nuxt/fonts@0.14.0`
(que extiende `FontlessOptions` de `fontless`) y sobre su `dist/module.mjs`:

- El módulo registra un `publicAssets` de Nitro apuntando a
  `<buildDir>/cache/fonts` con baseURL `assets.prefix` (por defecto `/_fonts`).
- En `rollup:before` descarga cada URL resuelta (con caché en
  `node_modules/.cache/nuxt/fonts`) y escribe los binarios ahí. Con
  `nitro.preset: 'static'` terminan en `.output/public/_fonts/`.
- La inyección de `@font-face` es **por uso**: escanea el CSS buscando
  declaraciones de `font-family`. Si no aparecieran, la salida documentada es
  `global: true` por familia.
- `processCSSVariables` vale `'font-prefixed-only'` por defecto, que es
  justamente lo que atiende las variables `--font-*` del tema de Tailwind v4.
- `throwOnError` vale `false` por defecto: una descarga fallida es un
  **warning** y el sitio se publica con `@font-face` apuntando a archivos que
  nunca se escribieron. En este repo se pone en `true` — el defecto que la
  feature 006 existe para eliminar es exactamente ese, tipografía de respaldo
  sin que nadie se entere.

**Regla, que es la de siempre (§§ R18, R25) aplicada a fuentes:** la
verificación es un grep sobre `.output/public` — que existan los binarios, que
el CSS emitido apunte a `/_fonts/…`, y que `fonts.gstatic.com` no aparezca en
ningún archivo. Ni el servidor de desarrollo ni el catálogo sirven como
prueba.

**Contrapartida que hay que decir en voz alta:** esto mete una dependencia de
red **en tiempo de build** y un paquete nuevo. La alternativa —commitear los
dos `.woff2` y declarar las caras a mano— no necesita ninguna de las dos, pero
mete binarios opacos sin procedencia ni ruta de actualización. Se eligió el
módulo con aprobación de Roberto (2026-09-07); revertir es volver al enfoque
actual con los pesos correctos.

### R33 · Storybook copiaba `public/` DOS veces sobre su propia salida, y una era Vite

Al declarar el favicon del catálogo se descubrió que
`storybook-static/index.html` **no era el documento del manager**: era el
`public/index.html` del sitio, los 1480 bytes del `<meta http-equiv="refresh"
content="0; url=/es">` de la § R25. El catálogo construido redirigía desde su
propia raíz a una página que no existe dentro de él. `public/favicon.svg`
pisaba al de Storybook por la misma vía, que es por qué la pestaña del catálogo
venía mostrando el logo de Nuxt.

**Son dos copias, no una, y hay que apagar las dos:**

1. `staticDirs: ['../public']` copia el directorio **al raíz** de la salida,
   después de que Storybook escribe sus archivos. Se cambió a la forma con
   mapeo, `[{ from: '../public', to: '/brand' }]`, que el tipo
   `DirectoryMapping` de `storybook@10.6.0` ya soporta.
2. **El `publicDir` de Vite vale `<root>/public` por defecto**, que en este
   repo es el mismo directorio — así que el build del *preview* lo volvía a
   copiar al raíz, por su cuenta, independientemente de `staticDirs`. Se
   verificó corriendo el build: con solo el punto 1 aplicado, `index.html`
   seguía midiendo 1480 bytes. Se apaga con `viteConfig.publicDir = false` en
   el `viteFinal` de `.storybook/main.ts`.

Con las dos, `storybook-static/index.html` vuelve a ser el manager (3816 bytes)
y el ícono vive en `/brand/favicon.svg`, **un solo archivo fuente compartido
con el sitio**, apuntado desde `.storybook/manager-head.html`.

**Generaliza, y es la § R19/R23 otra vez:** todo lo que Storybook comparte con
la app hay que verificarlo sobre `storybook-static/`, no suponerlo. Este error
llevaba desde la feature 003 sin que nadie lo notara, porque
`pnpm storybook:build` **sale con código 0**: sobreescribir el documento de
entrada no es un error de build. Cualquier archivo que se agregue a `public/`
con un nombre que Storybook también use vuelve a producirlo.

### R34 · `--headless --window-size` de Chrome no fija el viewport, y eso miente en las capturas

Al verificar el fondo a 390px (spec FR-007, SC-004) las capturas de
`--headless=new --window-size=390,844` salían con el texto cortado en el borde
derecho: parecía que `overflow-x: clip` estaba recortando contenido, que es
justo lo que la FR-007 prohíbe.

**No era cierto.** Medido dentro de la página —
`documentElement.scrollWidth` contra `clientWidth`, y el rectángulo de cada
elemento contra el ancho del viewport— **no hay un solo elemento que rebase los
390px**, ni con el clip puesto ni quitándolo en caliente. Chrome renderiza con
un viewport más ancho que el `--window-size` pedido y **recorta la imagen** al
tamaño solicitado; el resultado se ve idéntico a un desbordamiento real.

**Regla:** una captura headless no sirve como evidencia de layout a un ancho
dado. Para un ancho concreto, se carga la página en un `<iframe>` de ese ancho
exacto dentro de una página contenedora y se mide desde ahí — el `<iframe>` sí
fija el viewport de layout, y de paso permite medir `scrollWidth`, recorrer los
rectángulos y capturar la imagen correcta. Es la misma disciplina de la § R25
aplicada a los píxeles: la pregunta es "¿qué mide el documento?", no "¿qué
parece la foto?".

### R35 · El `.woff2` que descarga `@nuxt/fonts` no es uno por peso

`.output/public/_fonts/` contiene **cuatro** binarios para cuatro pesos, pero no
se corresponden uno a uno: Google sirve Instrument Sans como fuente variable,
así que **los pesos 400, 500 y 600 apuntan al mismo archivo** (uno por subset,
`latin` y `latin-ext`) con distinto `font-weight` en cada `@font-face`. Poppins
sí trae su propio binario por subset. Ocho declaraciones `@font-face`, cuatro
archivos.

Es correcto y esperado, no una mala configuración — pero cualquier
verificación que cuente archivos y espere uno por peso va a fallar. **Lo que se
verifica es que exista una cara por cada peso de la marca y que ningún `src`
apunte fuera del propio origen**, que es lo que asserta
`tests/static-output.test.ts`.

Verificado también en el navegador contra el artefacto generado: las cuatro
caras cargan (`document.fonts.check` en verde para Poppins 600 e Instrument
Sans 400/500/600), y el ancho medido del mismo texto difiere entre los tres
pesos de Instrument Sans (289.92 / 293.72 / 297.53 px) y contra la familia de
respaldo (288.16 px). Es decir: hay tres caras reales, no una sintetizada.

---

### R39 · Una prueba en una carpeta que `vitest.config.ts` no incluye reporta verde por no existir

El `include` de `vitest.config.ts` lista `tests/**`,
`app/shared/ui/**/*.test.ts` y `app/features/**/*.test.ts`. **No incluye
`app/shared/logic/**`**, que es donde la Constitución (Artículo I) pone las
composables transversales. Un archivo de pruebas ahí **corre cero veces**, la
suite sale en verde, y el conteo de archivos sube en cero sin que nadie mire.

La § R16 ya lo anticipaba en una línea ("cualquier feature futura que agregue
tests de componente extiende ese `include`"); esto lo vuelve explícito y le
agrega el procedimiento:

**Regla:** al agregar pruebas en una ruta nueva, se extiende el `include`
**y se demuestra** con una aserción que falle a propósito —hay que *ver* el
archivo en rojo— antes de escribir las aserciones reales. Un archivo de
pruebas que nunca se ha visto fallar no se ha demostrado que corra. Un
proyecto de Vitest aparte no es opción: `defineVitestConfig` lanza error sobre
`projects` (§ R16).

---

### R40 · Nuxt inlinea el CSS con scope de un componente aunque el componente no se renderice

La feature 008 tiene que estar **ausente** del HTML prerenderizado (su spec
FR-012: ese es el fallback sin JavaScript). La aserción obvia —que la cadena
`cursor-spotlight` no aparezca en el documento— **falla en las cuatro rutas**, y
no porque el elemento esté ahí:

```
<div ... class="dot-grid ..."></div><!---->     ← el v-if no renderizó nada
<style>.cursor-spotlight[data-v-…]{ … }</style> ← pero su CSS sí está, en el <head>
```

Nuxt recolecta los estilos de **todos** los componentes del grafo de módulos de
la ruta y los inlinea en cada documento. Que el `v-if` haya dicho que no es
irrelevante: el componente está importado por el layout, así que su hoja viaja.

**Regla:** una aserción de "esto no está en el artefacto" que busque un nombre
de clase tiene que acotarse al `<body>`, nunca al documento completo. Un grep
sobre todo el HTML no distingue marcado de hoja de estilos y reprueba a la
feature justo por enviar lo que debe enviar (los estilos viajan, el elemento
espera al ratón). Ya está aplicado en `tests/static-output.test.ts`, que además
afirma lo contrario en positivo: el CSS **sí** tiene que estar.

### R41 · Leer `window.scrollX` dentro de un `requestAnimationFrame` fuerza estilo, aunque sea lo primero que hace

Corrección medida al `research.md` § R2 de esta feature, que pedía leer el
scroll **primero** y escribir después, con el argumento de que el orden inverso
fuerza un layout sincrónico. **El orden no basta.** El callback de rAF corre
*antes* del pase de estilo del cuadro, así que un `window.scrollX` ahí dentro
tiene que vaciar lo que invalidó la escritura de propiedades del cuadro
anterior, vaya donde vaya en el callback.

Medido con dos trazas de 5s de movimiento continuo del puntero contra un
control con el efecto apagado (`prefers-reduced-motion: reduce`):

| | Con el efecto | Control (apagado) | Atribuible |
|---|---|---|---|
| `Blink.ForcedStyleAndLayout` — leyendo en el rAF | 2723 | 2169 | **≈ 600** (2 por cuadro: una por eje) |
| `Blink.ForcedStyleAndLayout` — con el scroll cacheado | 2147 | 2148 | **0** |

La línea base de ambas columnas es el número de eventos de puntero: Chrome
hace un hit test por cada `mousemove` para actualizar `:hover` y el cursor, y
eso pasa con el efecto puesto o quitado.

**Regla:** el camino caliente de un efecto por cuadro no lee geometría. El
offset de scroll se toma en el handler de `scroll` —donde ya está vigente— y en
la activación; el cuadro hace aritmética y escribe. Vale igual para
`scrollY`, `getBoundingClientRect`, `offsetTop` y `getComputedStyle`.

### R42 · `mask-repeat` vale `repeat` por defecto, y un degradado de máscara se tesela

Una `mask-image: radial-gradient(...)` sin `mask-repeat: no-repeat` **se repite
en mosaico** sobre la caja del elemento. En una máscara de recorte circular eso
no da un círculo: da una retícula de círculos, y lo que sobresale de la caja
queda visible en vez de recortado.

No es teórico: el CSS emitido de `BotonPrimario.vue` lleva
`mask-repeat: repeat, repeat`. Ahí no molesta porque su máscara es
`linear-gradient(black 0 0)`, uniforme, así que teselarla es idéntico a no
hacerlo. La primera máscara **no uniforme** del repositorio es la de
`CursorSpotlight.vue`, y ahí sí importa.

**Regla:** toda `mask-image` que no sea uniforme declara `mask-repeat: no-repeat`
(y su par `-webkit-`) en la misma regla. De paso es lo que convierte a la
máscara en el recorte del desbordamiento deliberado de sus hijos.

### R43 · Una composable con listeners de `window` se filtra entre pruebas del mismo archivo

`happy-dom` da **un solo** `window` por archivo de pruebas. Una composable que
hace `window.addEventListener` en `onMounted` y solo limpia en
`onScopeDispose` sigue escuchando después de que la prueba terminó, porque
nadie desmontó el componente.

El síntoma no señala a la causa: la prueba de coalescencia de
`useCursorSpotlight` esperaba **un** cuadro pedido tras 20 eventos y contó
**cinco** — uno por cada instancia viva de las pruebas anteriores del mismo
archivo. Se lee como un fallo del sujeto, no del arnés.

**Regla:** un archivo de pruebas que monta componentes con listeners globales
lleva un registro de lo montado y lo desmonta en `afterEach`. Es el Artículo X
("ninguna prueba depende del estado de otra") aplicado a algo que no parece
estado.

### R44 · La contrapartida de la § R34 — cómo **sí** se mide un ancho, y qué se puede medir de una captura

La § R34 prohíbe la captura headless como evidencia de layout, y tiene razón,
pero deja al siguiente agente sin método. El que funcionó aquí, contra el
artefacto generado y servido desde `.output/public`:

- **El viewport se fija con `Emulation.setDeviceMetricsOverride` del protocolo
  de DevTools, no con `--window-size`.** A diferencia de la bandera, esta sí fija
  el viewport de layout: el documento reflowea al ancho pedido y `scrollWidth`,
  `getBoundingClientRect()` y las media queries responden a él. Es el equivalente
  programático del `<iframe>` de ancho exacto que la § R34 recomienda, y permite
  además mover el puntero (`Input.dispatchMouseEvent`), emular preferencias
  (`Emulation.setEmulatedMedia`), apagar el scripting
  (`Emulation.setScriptExecutionDisabled`) y grabar una traza (`Tracing.*`).
  Node 22+ trae `WebSocket` global, así que el cliente son ~80 líneas y **cero
  dependencias nuevas** — Playwright sigue fuera de alcance (Artículo X).
- **De una captura sí se puede medir color, nunca layout.** Con el viewport
  fijado y las coordenadas conocidas de antemano, decodificar el PNG y leer
  píxeles es una medición legítima: se compara un valor contra una aritmética
  que la spec ya escribió. Lo que la § R34 prohíbe es deducir posiciones o
  desbordamientos *de la foto*, y eso sigue prohibido.

Así se verificó la § R38 de esta feature, cuya derivación decía que un punto
iluminado debía quedar en ≈133 R sobre un fondo de ≈109: **medido, el centro
del punto da exactamente `rgb(133, 43, 56)`**. Y la mitad que ninguna prueba de
este repositorio alcanza (SC-002) quedó en números: dentro del radio los puntos
miden luma 84 sobre papel 55 (separación **29**), fuera miden 60 sobre 38
(separación **22**) — más brillantes **y** más nítidos, que son las dos mitades
que pide `ui-map.md:271`.

### R45 · Lo que este repositorio verifica es Chrome, y hay tres piezas de CSS moderno que dependen de eso

La feature 008 se midió a fondo (§ R44) **en un solo navegador**: Chrome en
macOS. No existe arnés multi-navegador y el Artículo X deja E2E fuera de
alcance, así que no lo habrá pronto. Eso no es un problema mientras se sepa
qué queda descubierto.

Tres declaraciones del efecto no están verificadas fuera de Chrome:

| Declaración | Dónde | Si el motor no la soporta |
|---|---|---|
| `mod()` | `CursorSpotlight.vue`, el contra-desplazamiento de la hoja iluminada | **La declaración `transform` completa se invalida.** La hoja deja de registrarse contra la retícula base y se ven **puntos dobles** |
| `mask-image` + `mask-repeat` | el recorte circular de la hoja iluminada | los puntos iluminados no se recortan al radio: canto duro, o mosaico si además falta `no-repeat` (§ R42) |
| `overflow: clip` | la raíz del spotlight | la página **crece** al acercar el puntero al footer (SC-006) |

Las tres son baseline en Safari 15.4+ y Firefox 118+ según el
`research.md` § R3 de la feature, y el modo de falla de la peor de ellas es
**cosmético**: el efecto es decorativo, solo de escritorio, y no se pierde
contenido ni se rompe ninguna interacción. Por eso se aceptó publicar así.

**Regla, y es de proceso más que de CSS:** cuando una feature dependa de CSS
reciente, (1) se nombra la declaración, (2) se dice qué pasa donde no exista y
(3) se deja escrito **aquí**, no solo en el reporte de la sesión — un reporte
de progreso es justo donde el siguiente agente no va a mirar. Si alguna vez
llegan puntos dobles reportados desde Safari o Firefox, la respuesta ya está
escrita y costeada en `research.md` § R3 de la feature 008: la composable
publica el offset reducido en vez de dejárselo a `mod()`, al precio de leer el
paso de la retícula una vez del estilo computado.

---

### R46 · Un token derivado de otro va en `:root`, nunca en `@theme inline`

Extensión directa de la § R18, y la primera vez que muerde. El Hero necesita un
ancla de glow expresada como "20px arriba del borde superior de la pila", es
decir **un token derivado de otro**. Escrito así, no funciona:

```css
@theme inline {
  --spacing-hero-top: clamp(…);
  --spacing-hero-glow-foco-y: calc(var(--spacing-hero-top) - 1.25rem); /* ❌ */
}
```

`@theme inline` **sustituye el texto del valor** dentro de cada utilidad en vez
de emitir una custom property, así que la utilidad sale con
`calc(var(--spacing-hero-top) - 1.25rem)` apuntando a una propiedad que
`:root` nunca declara en el build del sitio. El `calc()` entero se invalida y
el glow cae a `top: auto`. **Sin error y sin prueba en rojo**, y la § R18 ya
advierte que el catálogo tampoco lo detecta: su escaneo de contenido alcanza
`specs/` y `docs/`, así que emite variables de tema que el sitio no emite.

**Regla:** el valor crudo se declara en el bloque `:root` escrito a mano y
`@theme inline` lo referencia — exactamente el patrón que ya usan las rampas de
color (`--red-400` en `:root`, `--color-red-400: var(--red-400)` en el tema).

```css
:root { --hero-top: clamp(4.6125rem, 1.5157rem + 12.7048vw, 12.95rem); }
@theme inline {
  --spacing-hero-top:         var(--hero-top);
  --spacing-hero-glow-foco-y: calc(var(--hero-top) - 1.25rem);  /* ✅ */
}
```

Verificado compilando esa forma exacta con el Tailwind del propio repositorio
(4.3.3) por su API de Node: la utilidad emite
`top: calc(var(--hero-top) - 1.25rem)` **y** la declaración de `--hero-top` en
`:root` viaja con ella. La verificación va contra
`.output/public/_nuxt/*.css`, nunca contra el catálogo (§§ R18, R25, R31).

> **Nota para quien busque el ejemplo en el árbol y no lo encuentre.** La
> feature 009 **no acabó necesitando esta salida**: al corregirse la § R48, sus
> seis anclas de glow pasaron a ser seis medidas independientes y ninguna
> deriva de otra, así que sus doce tokens viven todos en `@theme inline` y no
> agrega nada a `:root`. La regla se verificó antes de dejar de hacer falta,
> es real, y la primera sección que quiera un valor derivado la va a necesitar.
> De paso: atar el ancla vertical de `Hero · wine` al padding superior de la
> sección —lo que motivó el hallazgo— habría estado mal por otro motivo, porque
> los dos coinciden a 1440 (207) y difieren a 390 (64 contra 74).

### R47 · Las utilidades de posición sí leen el namespace `--spacing-*` por nombre

`size-glow-1500-700` ya demostraba que `--spacing-*` alimenta a `size-*`, pero
nadie había comprobado `top-*`, `left-*` ni `max-w-*` con **claves con
nombre** (no múltiplos numéricos de la unidad base). Compilado con
`tailwindcss@4.3.3`:

| Forma del valor | Ejemplo | Emite |
|---|---|---|
| `rem` suelto | `12.95rem` | `top: 12.95rem` |
| porcentaje | `96.094%` | `left: 96.094%` |
| `calc()` con `100%` | `calc(100% + 5.875rem)` | pasa tal cual |
| `calc()` con `var()` | `calc(var(--hero-top) - 1.25rem)` | pasa tal cual |
| `clamp()` | la escala fluida | pasa tal cual |

Lo mismo para `pt-*`, `gap-*`, `max-w-*` y `size-*`.

**Consecuencia práctica:** una sección posiciona sus glows con utilidades
normales. **No hace falta** un `<style scoped>` con nombres de `:root` (el
camino de `DotGrid.vue` y `CursorSpotlight.vue`), ni un `style` en línea, ni
valores arbitrarios `[...]` que el Artículo VII prohíbe.

**Detalle del mismo experimento:** `-translate-x-1/2` emite la propiedad
`translate`, no el atajo `transform`. Las dos crean contexto de apilamiento y
las dos están permitidas **sobre un glow individual** — la salida que el
comentario de `SectionBackdrop.vue` ya contempla, porque el contexto que crea
solo contiene su propio subárbol vacío.

---

## Feature 009 · Hero — hallazgos de implementación (2026-09-07)

> Las §§ R46 y R47 salieron del ciclo de **especificación** de esta feature y
> se verificaron al implementarla: **las dos quedan vigentes**. La § R47 se
> ejerció tal cual (los seis anclas de glow se posicionan con `top-*` /
> `left-*` por nombre, sin `<style scoped>` y sin valores arbitrarios) y la
> § R46 no llegó a hacer falta, tal como su propia nota anticipaba — pero
> **sí mordió en otro namespace**, ver la § R52. Las cinco de abajo son
> nuevas.

### R51 · Un `<style>` literal dentro de un `<template>` compila en SSR y **revienta** en el compilador de cliente

El bloque `<noscript>` que fuerza visible el CTA del nav necesita una hoja de
estilos. Escrito como marcado normal:

```vue
<noscript>
  <style>.site-nav__cta.site-nav__cta{opacity:1;visibility:visible}</style>
</noscript>
```

`pnpm generate` **pasa** y el HTML emitido es correcto. Lo que falla es la
compilación de cliente, con un error duro:

```
SyntaxError: Tags with side effect (<script> and <style>) are ignored in
client component templates.
```

Apareció al correr la suite (Vitest compila el SFC para cliente), no al
construir el sitio. El modo de falla es el peor de los dos: el artefacto se ve
bien y el error sale en otro comando.

**Salida:** la hoja va como constante de módulo y se pinta con `v-html`, que es
el mismo mecanismo que `Lockup.vue` y `SocialIcon.vue` ya usan para inlinear
sus SVG (§ R14). Ojo: Vue **sí** le pone el atributo de scope al `<noscript>`
(`<noscript data-v-…>`), así que una aserción sobre el artefacto tiene que
tolerarlo.

**Generaliza:** cualquier etiqueta con efecto secundario dentro de un
`<template>` hay que verificarla contra `pnpm test`, no contra
`pnpm generate`.

### R52 · Tailwind v4 no tiene namespace de tema para `z-index` ni para `transition-duration`

Extensión directa de las §§ R18 y R46, y la segunda vez que muerde. Compilado
con el Tailwind del propio repositorio (4.3.3) por su API de Node, contra un
`@theme inline` que declara `--duration-nav-cta-fade` y `--layer-nav-theme`:

| Candidato | Emite |
|---|---|
| `duration-nav-cta-fade` | **nada** |
| `z-nav-theme` / `z-layer-nav-theme` | **nada** |
| `transition-opacity` | `transition-duration: var(--tw-duration, var(--default-transition-duration))` |

Los namespaces de tema de v4 son `--color-*`, `--font-*`, `--text-*`,
`--spacing-*`, `--radius-*`, `--blur-*`, `--breakpoint-*`, `--ease-*`,
`--animate-*` y compañía. **`z-index` y `transition-duration` no están**: sus
utilidades solo aceptan números o valores arbitrarios.

**Regla:** un token de nivel (`--layer-*`) o de duración (`--duration-*`) va en
el bloque `:root` escrito a mano y lo lee un `<style scoped>` — que es lo que
ya hacían los cuatro `--layer-*` y las dos `--duration-*` anteriores.
Declararlo en `@theme inline` no emite nada, el `var()` resuelve a nada, y la
declaración entera se invalida **en silencio**.

### R53 · Un `<style scoped>` le gana a una utilidad de Tailwind, y eso puede apagar una preferencia de accesibilidad

Vue le agrega `[data-v-…]` a cada selector de un bloque con scope, así que
`.x[data-v-…]` pesa **dos clases** contra la sola clase de `.motion-reduce\:transition-none`.

Consecuencia concreta: escribir el fundido como
`transition-opacity motion-reduce:transition-none` en las clases **y** la
duración en un `<style scoped>` deja la regla con scope ganando, y
`transition-property: none` de la utilidad de movimiento reducido **no se
aplica**. El visitante que pidió no ver animaciones las sigue viendo, y ninguna
prueba lo nota.

**Regla:** una propiedad se declara en **un solo lugar**. Si la duración tiene
que salir de un token (§ R52), entonces la transición completa —propiedad,
duración, y el `@media (prefers-reduced-motion: reduce)`— vive en el
`<style scoped>`. Es lo que ya hace `CursorSpotlight.vue`.

### R54 · Un glow de sección puede alargar el documento por debajo de la raíz del layout, y ahí abajo no pinta nadie

Medido en el artefacto generado, a 1440×900, con solo el Hero y el footer
construidos:

| | |
|---|---|
| Alto de la raíz del layout (nav + main + footer) | **1161.03** |
| `document.documentElement.scrollHeight` | **1320** |
| Borde inferior del glow `Hero · cierre` | **1319.8** |
| Sobrante | **158.97** |

`overflow-x: clip` de la raíz absorbe el desbordamiento horizontal (verificado
de 320 a 2560: cero desbordamiento), pero **el vertical no está recortado**, y
`html` y `body` no tienen fondo (`rgba(0,0,0,0)`) — el `bg-ink-500` vive en el
div raíz. Píxeles leídos de una captura con el viewport fijado (§ R44), al
final del scroll: arriba de la costura `rgb(38, 38, 38)`, abajo
`rgb(255, 255, 255)`.

**Es transitorio**: el diseño da 5060px de página y el glow cae en 1320, así
que desaparece solo en cuanto exista `02 Propósito`. A 390 no ocurre
(sobrante 0.47px). Se registra porque **cualquier sección con un glow que
sobresalga por abajo lo reproduce** mientras sea la última del documento, y
porque la cura —recortar el eje vertical en la raíz del layout— es un cambio
en un archivo de la feature 006, no de la sección.

> **Cerrada por la § R57** (feature 010, 2026-09-08). Y con una corrección: la
> cura que se propone arriba —recortar el eje vertical— es necesaria pero **no
> suficiente**. No cubre el overscroll, que descubre el lienzo a cualquier
> altura de página. La superficie tenía que ir en `html`.

### R55 · La altura del nav móvil construido es 78.19, no 76 — falta el borde de la hamburguesa

Medida en el artefacto generado con `Emulation.setDeviceMetricsOverride`
(§ R44), no con `--window-size` (§ R34):

| | Escritorio 1440 | Móvil 390 |
|---|---|---|
| Medido en el navegador | **102.80** | **78.19** |
| Frame del diseño (lectura del líder) | 103 | 76 |
| Δ | −0.2 | **+2.19** |

El desglose del móvil: `--spacing-nav-y` × 2 = 44, más el hijo más alto del
renglón, que es la hamburguesa: padding 12 × 2 + dos barras de 1.6 + gap 5 =
32.2 **más su borde de 1px arriba y abajo** = 34.2. 44 + 34.2 = 78.2, que es
exactamente lo medido. La derivación que da 76.2 **omite el borde**, y el
borde sí está en el diseño (`design-extract.md` § 9.bis: "borde `#FBF8F62E`
1px").

**No se absorbió retocando `--spacing-hero-top`**, que sigue valiendo
`150 − 76 = 74`: el primer hijo del Hero queda a y 152.19 en vez de y 150, y
los tres centros de glow móviles quedan 2.2px abajo. Es una discrepancia entre
el frame y el propio dibujo del frame, y le toca a una persona decidir cuál de
los dos gana. **Reportado, no resuelto.**

Detalle que cambia el número según el contexto: la hamburguesa solo se
renderiza después de montar (`v-if="isScriptingAvailable"`), así que **sin
JavaScript el nav móvil mide menos**.

### R56 · La preflight de Tailwind v4 no declara ningún `cursor`, y un `<button>` nativo queda en `default`

Verificado sobre el CSS emitido por `pnpm generate`, antes del cambio de la
feature 11:

```
$ grep -oh "cursor:[a-z-]*" .output/public/_nuxt/*.css | sort | uniq -c
   (sin resultados)
```

**Cero declaraciones de `cursor` en toda la hoja del sitio.** Las únicas
coincidencias de la palabra eran nombres de clase de `CursorSpotlight.vue`.

Tailwind **v3** traía en su preflight `button, [role="button"] { cursor:
pointer }`. **v4 la quitó**, para alinearse con la hoja del agente de usuario.
Consecuencia: un `<a href>` sigue mostrando `pointer` porque se lo da el
navegador, y un `<button>` muestra `default` — que es lo correcto según la
especificación de CSS, y casi nunca lo que se quiere en una web.

**Por qué costó verlo.** El síntoma no es un error ni una regla que falla: es
que la mitad de los controles se ven bien *por accidente del agente de usuario*
y la otra mitad no, sin que nada en el repositorio diga una palabra sobre el
tema. `BotonPrimario` renderiza `<a>` o `<button>` según tenga `href`
(línea 43), así que el mismo componente se comportaba distinto en el nav y en
el Hero.

**Regla operativa:** un componente que puede renderizar como `<button>`
declara su cursor explícitamente, y lo declara **condicionado a que el control
haga algo**. No se pinta con `cursor-pointer` un control sin destino: eso es lo
que `ui-map.md` § 6 ya prohíbe para los slots de Proyectos —*"sin cursor de
link ni hover (un espacio reservado que parece clickeable y no lleva a nada se
lee como sitio roto)"*— y aplica igual al CTA primario del Hero mientras la
sección 05 no exista.

**Trampa de al lado, encontrada al escribirlo:** `BotonPrimario.test.ts` hace
grep del código fuente crudo buscando `/@(click|mouseenter|mouseleave)/` para
probar que el componente no lleva script de cliente. Un **comentario** que
mencione `@click` en prosa rompe esa prueba. La salida correcta es reescribir
la prosa, no aflojar la guarda.

## Feature 010 · Banda blanca y candado de build — hallazgos (2026-09-08)

### R57 · Un `<div>` no pinta el lienzo, y por eso la § R54 no se cura recortando el desbordamiento

Cierre de la § R54. El fondo del sitio vivía en `bg-ink-500` sobre el `<div>`
raíz del layout, y **ninguna regla de la hoja compilada tocaba `html` ni
`body`** (verificado: `grep -o "html{[^}]*}"` solo daba la preflight de
Tailwind). El lienzo del documento toma el fondo del **elemento raíz**, y solo
lo hereda del `body` si el del raíz es transparente
(CSS Backgrounds 3 § 3.11.2). Un `<div>`, por muy raíz del layout que sea, no
participa: donde no llega, pinta el blanco por defecto del navegador.

Eso hace que el defecto tenga **dos** manifestaciones y que solo una dependa
de la altura de la página:

| | Se ve cuando | Recortar el eje vertical lo cura | Fondo en `html` lo cura |
|---|---|---|---|
| Banda bajo el documento | un glow alarga el documento | sí | sí |
| **Overscroll** | se arrastra más allá del final, a **cualquier** altura | **no** | sí |

El overscroll es el que decide dónde va la cura: trackpad de macOS e iOS
descubren el lienzo por debajo del documento con la página en cualquier
tamaño, así que **ninguna sección futura lo tapa** y recortar el
desbordamiento no lo toca. La superficie va en `html`.

Medido en el artefacto generado, mismo método que la § R44
(`Emulation.setDeviceMetricsOverride`, CDP), después del cambio:

| Ancho | Sobrante bajo la raíz | Desbordamiento horizontal | `background` de `html` |
|---|---|---|---|
| 320 | +0.38 | 0 | `rgb(38, 38, 38)` |
| 390 | +0.47 | 0 | `rgb(38, 38, 38)` |
| 768 | +0.47 | 0 | `rgb(38, 38, 38)` |
| 1024 | −0.48 | 0 | `rgb(38, 38, 38)` |
| 1440 | **−0.03** (era **+158.97**) | 0 | `rgb(38, 38, 38)` |
| 2560 | −0.03 | 0 | `rgb(38, 38, 38)` |

`body` sigue en `rgba(0, 0, 0, 0)` a propósito: una sola declaración decide el
lienzo. Dos —una en `html` y otra en `body`— lo dejarían decidido por el orden.

**Lo que costó cero:** el eje vertical se recortó además del horizontal
(`overflow-clip` en vez de `overflow-x-clip`), y no se pierde nada dibujado. El
footer lleva su propio `bg-ink-500` opaco, así que la cola del glow
`Hero · cierre` ya estaba tapada en todo el tramo que solapa al footer; lo
único que asomaba era la banda de 159px **por debajo** del footer, que es el
defecto. El diseño hace lo mismo: su página mide 5060 y `CTA · cierre` llega a
5080, o sea que el marco de la página lo corta.

**Verificado que `overflow: clip` en los dos ejes no rompe nada de lo que ya
estaba:** el nav sigue `sticky` y queda en `top: 0` con el scroll al máximo
(261 de 261), y el panel `fixed inset-0 z-50` del menú móvil mide 390×844 y
acierta el hit-test en el centro **y** en la esquina inferior derecha — un
descendiente `position: fixed` no lo recorta el `overflow` de un ancestro que no
sea contenedor de bloque para `fixed`. Con `hidden` en un eje no valdría lo
mismo: coacciona el otro a `auto` y vuelve la raíz un contenedor de scroll
(§ FR-007 / feature 006 `research.md` § R3).

El orden de capas de las §§ R28/R37 medido sobre la página generada, no en
Storybook: backdrop de sección `z-index: -3`, hoja de puntos `-2`
(`radial-gradient(color(srgb .85098 .85098 .85098 / .12) …)`), spotlight `-1`
—ausente hasta el primer `mousemove` y presente después—, footer y nav en flujo
normal.

### R58 · El candado de build de Nuxt es un archivo JSON, y solo está activo dentro de un agente

`@nuxt/cli` 3.37 escribe `<buildDir>/nuxt.lock` antes de construir y antes de
levantar el dev server, y se niega a arrancar un segundo Nuxt mientras un
proceso vivo lo tenga (`dist/lockfile-*.mjs`, `acquireLock`). El archivo es
JSON plano y trae todo lo que hace falta para decir qué matar:

```json
{ "pid": 10237, "startedAt": 1788854149138, "command": "dev",
  "cwd": "/Users/…/muush.dev", "port": 3000, "url": "http://[::1]:3000" }
```

Un candado se considera **inactivo** —y se borra— si el PID no vive, si es el
PID propio, o si `startedAt` tiene más de 24h (`MAX_LOCK_AGE_MS`). Las tres
condiciones se replicaron tal cual en `tests/nuxt-build-lock.ts`: un lector que
las juzgue distinto daría un mensaje que contradice a la herramienta que
describe.

**El detalle que explica por qué esto muerde a los agentes y no a las
personas:** `isLockEnabled()` devuelve `isAgent` de `std-env` por defecto.
`NUXT_LOCK=1` lo fuerza encendido, `NUXT_IGNORE_LOCK=1` apagado. Un humano en
su terminal con `pnpm dev` corriendo genera sin candado (y sin protección
contra la carrera sobre `.nuxt/`); una sesión automatizada choca.

Consecuencia para las pruebas: `tests/global-setup.ts` hace `execFileSync('pnpm',
['generate'])`, y Vitest serializa la excepción de `execFileSync` por sus
propiedades enumerables — de ahí el `Serialized Error: { status: 1 }` que no
nombra nada. Cuatro apariciones, tres de ellas costando una corrida completa.
La cura es leer el candado antes de invocar, volver a leerlo si la build falla
igual, y en cualquier otro caso reportar el **texto** que imprimió la build en
vez de su código de salida (por eso `stdio` pasó de `'ignore'` a `'pipe'`).

Reproducido para verificar el mensaje —`NUXT_LOCK=1 pnpm dev` de fondo y
`pnpm test` encima— y la salida está en
`docs/harness/progress/impl_white_band_and_build_lock.md`.

## Feature 022 · Botón primario en píldora — hallazgos (2026-09-08)

### R59 · Un anillo enmascarado sobrevive a un radio de píldora, y la razón es que `mask-clip: content-box` redondea

El anillo LED de `BotonPrimario` se pinta con un pseudo-elemento de
`padding: 1.5px` y `mask-composite: exclude` entre una máscara de `border-box` y
otra de `content-box`. La duda razonable al pasar de r12 a píldora era si la
banda se adelgazaría o se cortaría en las tapas — un agujero **rectangular**
dentro de una forma de estadio dejaría la banda vacía justo en las curvas.

No pasa, y no por suerte: `mask-clip: content-box` recorta con las esquinas
redondeadas por el **radio menos el padding** (CSS Backgrounds 3 § 5.3), así que
para una píldora el borde interior vale (alto ÷ 2) − 1.5 = medio alto del
content box: otra píldora, concéntrica. `border-radius: inherit` copia el valor
*especificado*, y cada caja lo acota a su propio tamaño — por eso hereda "lo más
redondo posible" y no un número que le quedaría grande al pseudo-elemento.

**Medido sobre `.output/public` con Chrome (§ R44)**, no en Storybook: hero
236.19×55.19 a 1440 (radio de tapa 27.6), hero móvil 213.55×50 a 390 (25), CTA
del nav 198.78×42.8 (21.4). Banda de 1.5px continua en las tres, a 0/45/90/135/
180/270 grados de barrido, a DPR 1 y a DPR 4, y con
`prefers-reduced-motion: reduce` forzado (anillo rojo plano). Sin hilo, sin
muesca donde la tapa encuentra el lado recto.

**Corrección al valor del radio (2026-09-08).** `rounded-full` emite
`border-radius: 2147483647px` **verbatim en la hoja de estilos generada** —eso
se verificó y es literal—, pero el valor **computado** en vivo no es ese: el
navegador lo devuelve como `3.35544e+07px`, y solo después lo acota al pintar a
la mitad del lado corto. Son dos números distintos de la misma declaración. Si
alguien vuelve a medir esto por `getComputedStyle` y busca el 2147483647, no lo
va a encontrar y va a creer que la clase no se aplicó. Por eso la aserción de
`tests/static-output.test.ts` no fija el literal: comprueba que el radio emitido
supera 1000, que es la propiedad que lo hace píldora a cualquier tamaño.

**Lo que la píldora sí cambia** es dónde se lee el barrido, y conviene decirlo
antes de que alguien lo reporte como defecto: una caja mucho más ancha que alta
le da a cada tapa apenas ±12° del giro, así que la parada `bone-100` cae como un
arco brillante corto sobre la línea central vertical y las tapas se leen casi de
un solo color. Es función de la proporción de la caja, no del radio: el mismo
botón a 12px pone el arco en el mismo sitio (comparado lado a lado).

### R60 · `--screenshot` de Chrome headless recorta el contenido y **miente** sobre el desbordamiento

Capturando `/es` con `--window-size=390,844` el titular del Hero sale cortado a
la derecha, igual a DPR 1 que a DPR 3 — la imagen de un sitio con
desbordamiento horizontal. Medido por CDP con
`Emulation.setDeviceMetricsOverride` a los mismos 390: `scrollWidth === clientWidth === 390`
y el `<h1>` con `scrollWidth === offsetWidth === 342`. **No hay
desbordamiento**: el recorte es del capturador, no de la página.

**Regla:** una captura sirve para juzgar forma y color; para afirmar
**geometría** —anchos, desbordamiento, alturas— se mide por CDP, que es
exactamente lo que la § R44 ya pedía. Un agente que reporte "la landing se
desborda en móvil" a partir de una captura está reportando su herramienta.

---

## Feature 012 · rescatado antes de cancelarla (2026-09-08)

> La feature 12 (`english_url_segments`) se canceló por decisión de Roberto:
> se le hace caso al Artículo VI, que manda segmentos de ruta traducidos. Su
> spec se borró, pero este hallazgo **no dependía de ella** y se pierde si no
> queda aquí.

### R61 · Ninguna prueba detecta un `aria-current="page"` roto en el nav

`SiteNav` marca el link activo con `aria-current="page"`, que se anuncia a
tecnología asistiva y **a propósito no se dibuja** (feature 3, spec A-04). Si
la marca desaparece, nada se ve.

**Y ninguna de las dos pruebas existentes lo caza:**

- `tests/static-output.test.ts:286` compara el markup del nav entre páginas y
  **le quita `aria-current="page"` a propósito** (línea 321), porque las dos
  páginas tienen que diferir justo en eso. Al quitarlo, su ausencia se vuelve
  invisible ahí.
- `SiteNav.test.ts:103` afirma sobre `aria-current` con un fixture al que le
  pasan `current: true` a mano. Prueba el render del componente, nunca la
  comparación de nombre de ruta que produce la marca.

`ShellRouteName` siendo una unión literal cerrada hace que el **compilador**
cace un descriptor con nombre inválido. No puede cazar el inverso: unión y
descriptores actualizados juntos mientras el archivo de página sigue con el
nombre viejo type-checkea perfecto y deja de marcar en silencio.

**Regla:** una marca que solo existe para tecnología asistiva necesita una
aserción sobre el artefacto generado — en `/es/nosotros` y `/en/about` un link
del nav lleva `aria-current="page"`; en `/es` y `/en` ninguno lo lleva. La
prueba que la afirme se verifica en rojo primero (§ R39).

**Estado:** el hueco sigue abierto. No hay feature que lo reclame.
