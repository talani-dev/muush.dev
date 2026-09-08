# Feature 010 · white_band_and_build_lock — implementación (2026-09-08)

**`in_progress`** (sin tocar `feature_list.json`, falta el reviewer) · `./init.sh` sale **0** · 30 archivos / **369 pruebas** (eran 29/349) · sin commit · rama **`master`**, nunca `feat/hero-section`; ningún comando de git que reescriba el árbol. Detalle técnico y mediciones en `docs/harness/findings.md` §§ **R57** y **R58** (§ R54 queda cerrada). `DotGrid.vue`, `SectionBackdrop.vue`, `SectionGlow.vue` sin tocar.

## 1 · Banda blanca

- **`app/assets/css/global.css`** — regla nueva `html { background-color: var(--ink-500) }`, sin `@layer`. El lienzo toma el fondo del **elemento raíz** y solo cae al `body` si el del raíz es transparente, así que declararlo en `html` es lo que hace que **una sola** declaración decida el lienzo en vez de dos (`body` también lo pintaría — medido por el reviewer, no supuesto). Lo que **nunca** puede decidirlo es la raíz del layout, porque es un `<div>`, y ese es el defecto: sin fondo en el lienzo, el **overscroll** lo descubre a cualquier altura de página.
- **`app/layouts/default.vue`** — `overflow-x-clip` → `overflow-clip`.
- **`tests/static-output.test.ts`** — fondo en `html`, token alcanzable, una sola regla de fondo sobre `html`/`body`, y los dos ejes recortados por ruta con `overflow-x-clip` / `overflow-hidden` asertados **ausentes**: es lo que devolvería un revert.

**El eje vertical, decidido.** `clip` también en vertical, por simetría con FR-007: un glow es decoración y la decoración no puede alargar el documento en **ningún** eje. No cuesta nada dibujado — el footer lleva `bg-ink-500` opaco, así que la cola de `Hero · cierre` ya estaba tapada en todo el solape y solo asomaba en la banda de 159px **bajo** el footer, que es el defecto; y el diseño hace lo mismo (página 5060, `CTA · cierre` hasta 5080). Recortar no puede cortar contenido: los hijos en flujo son los que dan la altura. `clip` y no `hidden` porque `hidden` vuelve la raíz un contenedor de scroll y rompería el nav `sticky`. **Las dos piezas hacen falta**: recortar no cubre el overscroll, y el fondo en `html` no evita 159px de scroll muerto.

**Medido sobre `.output/public` con Chrome/CDP** (§ R44), no en Storybook: a 1440 el sobrante bajo la raíz pasa de **+158.97 a −0.03**, `html` da `rgb(38,38,38)` de 320 a 2560 y el desbordamiento horizontal sigue en **0**. Capas intactas (backdrop `-3`, puntos `-2`, spotlight `-1`, ausente hasta el primer `mousemove`), nav `sticky` en `top: 0` con el scroll al máximo, panel `fixed` del menú móvil sin recortar (390×844, hit-test en centro y esquina). Captura al final de la página: oscuro de borde a borde.

## 2 · Candado de build

**`tests/nuxt-build-lock.ts`** (nuevo) lee `.nuxt/nuxt.lock` y replica las tres condiciones de `nuxi` (PID propio, PID muerto, >24h). **`tests/global-setup.ts`** lo consulta antes de invocar, otra vez si la build falla igual, y si no imprime las últimas 30 líneas de lo que imprimió la build (`stdio`: `'ignore'` → `'pipe'`). `NUXT_IGNORE_LOCK=1` lo saltea porque `@nuxt/cli` lo saltea. **`tests/build-lock.test.ts`** cubre las ramas que la reproducción no alcanza, sobre todo el falso positivo: un candado rancio de un dev server muerto **no** debe bloquear la suite.

**Reproducido** con `NUXT_LOCK=1 pnpm dev` de fondo (PID 10237) y `pnpm test` encima; el dev server se mató después y el candado quedó liberado. Salida literal:

```
⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error:
A Nuxt dev server is holding the build lock, so `pnpm generate` cannot run —
and this suite generates the site before any test file loads, so the whole
run fails here rather than in a test.

  PID:     10237
  URL:     http://[::1]:3000
  Dir:     /Users/betonajera/Workspaces/muush/muush.dev
  Started: 2026-09-08T07:55:49.138Z
  Lock:    .nuxt/nuxt.lock

Run `kill 10237` to stop it, then run the suite again.
If that process is already gone, delete .nuxt/nuxt.lock.
Set NUXT_IGNORE_LOCK=1 to build anyway (it will race the other process
over .nuxt/).

 ❯ Object.setup tests/global-setup.ts:112:11
```
