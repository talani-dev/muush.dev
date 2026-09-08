# Feature 022 · primary_button_pill_shape — implementación (2026-09-08)

**`in_progress`** (sin tocar `feature_list.json`, falta el reviewer) · `./init.sh` sale **0** · 30 archivos / **372 pruebas** (eran 30/369) · sin commit · rama `master`; ningún comando de git que reescriba el árbol. `DotGrid.vue`, `SectionBackdrop.vue`, `SectionGlow.vue`, `CursorSpotlight.vue` sin tocar. Detalle técnico en `docs/harness/findings.md` §§ **R59** y **R60**.

## Qué cambió

- **`app/shared/ui/BotonPrimario.vue`** — `rounded-control` → `rounded-full`, y nada más: relleno `bg-glass-dark` (`#1c1416a6`), anillo, paddings, cursor y media queries intactos. Sin prop ni variante de forma. `rounded-full` y no un `--radius-pill` propio porque `global.css` ya había resuelto eso para la cápsula del Pill; un segundo nombre para la misma forma es como se separan dos cápsulas. Dos comentarios nuevos: por qué la píldora va en todas las instancias, y por qué la banda del anillo sobrevive al radio (§ R59).
- **`app/assets/css/global.css`** — solo comentario: `--radius-control: 0.75rem` **se queda** aunque hoy no lo consuma nadie. El 12 sigue siendo el radio de control del diseño y lo pide `FormField` (`design-extract.md § FormField`, `cornerRadius 12`) cuando existan los formularios. Borrarlo sería tirar un valor de diseño para que la feature de forms lo reinvente.
- **`app/shared/ui/BotonPrimario.stories.ts`** — qué mirar en `AllVariants` para revisar el anillo sobre la forma nueva.

## Pruebas actualizadas y añadidas (+3)

- **`BotonPrimario.test.ts`** — las 3 pruebas de variante afirmaban `rounded-control`; ahora `rounded-full` (actualizadas, no relajadas). Nueva: no hay vuelta al rectángulo (ni `rounded-control` ni un radio arbitrario en el código fuente). **El guard de `/@(click|mouseenter|mouseleave)/` quedó intacto** y ninguna prosa nueva lo dispara.
- **`tests/static-output.test.ts`** — no existía ninguna aserción de artefacto que fijara el radio del hero, así que se **agregó** la que el criterio 6 pide: los 6 controles `.led` de los 4 documentos llevan `rounded-full` y `bg-glass-dark`, y `.rounded-full` emite un radio que ningún radio de control alcanza.
- **Control negativo**: revirtiendo la clase, **5 pruebas se ponen en rojo** (4 de componente + 1 de artefacto). Verificado y revertido.

## Cómo se ve el anillo LED, mirado de verdad

Medido y capturado con Chrome sobre `.output/public` (§ R44), no en Storybook. Tamaños: hero **236.19×55.19** a 1440 (radio de tapa 27.6) · hero móvil **213.55×50** a 390 (25) · CTA del nav **198.78×42.8** (21.4) · `submit` en banco de pruebas, porque los formularios no existen todavía.

### ⚠️ El CTA del nav no se puede ver hoy sin una palanca — y este informe se la había callado

**No hay ninguna posición de scroll alcanzable en la que el CTA del nav sea
visible.** `showCta` es falso en todas: el documento mide 1161px y el `scrollY`
máximo es 261, así que `::before` computa `visibility: hidden` y el nav se mide
en blanco. Un agente que siga el párrafo de abajo al pie de la letra va a medir
un anillo que no está y va a concluir que se rompió.

**La palanca que lo revela** —la única que se usó, y la que faltaba aquí— es
`Emulation.setScriptExecutionDisabled` por CDP: sin scripting, la regla
`<noscript>` de `SiteNav` (`.site-nav__cta.site-nav__cta{opacity:1;visibility:visible}`,
fijada por `tests/static-output.test.ts`) fuerza el control a visible y el
anillo se puede medir. Con eso, la geometría del CTA del nav es la de abajo y
el reviewer la reprodujo por su cuenta.

**No es un defecto y se cierra solo**: el caso es inalcanzable porque la landing
todavía no tiene una sección después del hero, así que no hay altura para
scrollear más allá de él. En cuanto la siguiente sección aterrice, el documento
crece, el reveal se puede ejercer con scroll normal y la palanca deja de hacer
falta. Es el mismo límite que la feature 9 ya registró para el reveal a 1440×900
(`history.md`).

**En las tres, y a 0/45/90/135/180/270 grados de barrido, a DPR 1 y a DPR 4: banda de 1.5px continua, tapas semicirculares completas, sin hilo, sin muesca donde la tapa encuentra el lado recto y sin corte.** El borde interior queda concéntrico porque `mask-clip: content-box` redondea por radio − padding, no por un rectángulo (§ R59). Comparado lado a lado contra r12 a DPR 1: mismo grosor, mismo antialias, misma posición del color. Con `prefers-reduced-motion: reduce` forzado: anillo rojo plano y uniforme sobre la píldora, igual que antes.

**Lo único que la forma cambia**, y conviene que se sepa antes de que se reporte como defecto: la parada `bone-100` se lee como un arco brillante corto sobre la línea central vertical y las tapas quedan casi de un color. Es la proporción de la caja (una caja ancha le da ±12° a cada tapa), no el radio — el mismo botón a 12px pone el arco en el mismo sitio.

## Para Roberto (no lo decide un agente)

1. **El `.pen` quedó a medio propagar.** Componente `OqChv` en r12; hero móvil (`wJxJc`, `FlmrR`) y los dos Submit (`uBI9F`, `dVj6J`) heredando 12; solo hero de escritorio y los cuatro CTA de nav (desprendidos) en r999. El código va por delante y **a Clau le toca alinear el archivo**. Ningún agente editó el `.pen` ni `docs/business/`.
2. **`branding.md` § Materiales dice "radio 12px controles"** y el botón primario ya no cumple esa línea. La receta de vidrio no la cambia un agente: queda reportada para que la corrija quien la escribió.
3. **`design-extract.md` § 4 sigue documentando `cornerRadius 12`** para el botón primario. Misma corrección pendiente, mismo dueño.

## Adenda del cierre (2026-09-08, después del APPROVED)

Tres arreglos de los tres puntos no bloqueantes del reviewer. **Ni el cambio de clase ni las pruebas aprobadas se tocaron.**

1. **Excepción al Artículo V registrada** en el encabezado de `BotonPrimario.vue`, que es donde alguien que lea el Artículo V contra este archivo se la va a encontrar. Medido: **176 → 251 líneas crudas** (`wc -l`; las 251 incluyen la nota misma), **74 líneas no-comentario y no-vacías antes y después** —quitando comentarios de bloque, comentarios HTML y `//`, y luego las vacías—. El reviewer contó 177/214 y 78; la diferencia es de método sobre las líneas delimitadoras de comentario y las dos medidas coinciden en lo que importa: **la feature no agregó código**. No se reestructuró nada: la cláusula de remedio del Artículo V ("extract sub-components") es lo que identifica la enfermedad como complejidad **estructural**, y aquí no hay ninguna que partir.
2. **`--radius-control` lo guarda una prueba, no un comentario.** Nueva aserción en `BotonPrimario.test.ts` (el componente fue su último consumidor) sobre el **fuente** de `global.css`, no sobre el artefacto: Tailwind v4 lo elimina del build por no tener referencias, así que el artefacto no puede hablar por él. Nombra a `FormField` como el consumidor que viene (`design-extract.md § FormField`, `cornerRadius 12`, 13 usos). Leído por `readFileSync`, no por `?raw`, que el plugin de Tailwind devuelve vacío (§ del `SectionGlow.test.ts`). **Visto en rojo antes de confiar en él**: renombrando el token, `expected '@import "tailwindcss";…' to match /--radius-control:\s*0\.75rem/`, 1 failed | 17 passed. Token restaurado. El comentario de `global.css` ahora apunta a la prueba.
3. **La palanca del CTA del nav** quedó escrita arriba, que es el arreglo que más vale de los tres.

`./init.sh` sale **0**. 30 archivos / **373 pruebas** (+1). `feature_list.json`: id 22 `reviewing` → `done`. Sin commit.
