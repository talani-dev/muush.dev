# Paquete de código · muush 1.0

Todo lo que Roberto necesita para codear el sitio sin sacar valores a mano de Pencil.

| Carpeta / archivo | Qué es |
|---|---|
| `componentes/tokens.css` | **Variables de diseño**: colores, tipografías, escalas de texto, radios, vidrio, botones y movimiento, con los valores exactos de muush.pen. |
| `componentes/componentes.css` | Estilos de los componentes, móvil primero y escritorio desde 1024 px. |
| `componentes/componentes.js` | Lógica sin dependencias: menú, header, mapa con pestañas, carrusel, línea de tiempo y formulario en dos pasos. |
| `componentes/demo-componentes.html` | Página de prueba con todo funcionando. |
| `muush-gradient.js`, `MuushGradient.astro`, `shaders/`, `posters/`, `demo.html` | Fondos animados (abajo). |

**Para ver los demos:** desde esta carpeta, `npx serve .` y abrir `componentes/demo-componentes.html` y `demo.html` (los módulos de JavaScript necesitan servidor, no abren con doble clic).

## Componentes (`componentes/`)

Se activan con `iniciarTodo()` o uno por uno (`iniciarMenu`, `iniciarHeader`, `iniciarMapa`, `iniciarCarrusel`, `iniciarLineaTiempo`, `iniciarFormulario`). En Astro: importar `tokens.css` y `componentes.css` en el layout y llamar `iniciarTodo()` en un `<script>`.

1. **Header y menú.** Móvil: solo isotipo, idioma a la izquierda de la hamburguesa, todos los controles de 36 × 36 con radio 12. El menú abre a pantalla completa con vidrio, sin flechas; cierra con la X, con Esc o al tocar un link, y bloquea el scroll de fondo. Escritorio: links al centro y botón "Diagnóstico gratis". El header se oculta al bajar 80 px y vuelve al subir.
2. **Mapa con pestañas.** Móvil: América / Europa con zoom animado del mismo mapa de 1408 × 470 (las regiones están en `REGIONES` dentro del JS). Escritorio: mapa completo, sin pestañas. Cambiar la `<img>` del demo por el SVG del mapa.
3. **Carrusel de servicios.** Móvil: scroll horizontal con snap, la siguiente tarjeta asoma y el indicador sigue al dedo. Escritorio: cuadrícula de 4.
4. **Línea de Cómo trabajamos.** Móvil vertical, escritorio horizontal. La animación incluida es solo un punto de partida (Clau define la final contigo): la línea se llena en rojo con el scroll y cada punto se enciende al llegar. Se controla con la variable `--m1-progreso`.
5. **Formulario en dos pasos** (diagnóstico y aplicación usan el mismo código). Móvil: paso 1 → paso 2 con barra de progreso; Escritorio: todos los campos en una vista. Valida en positivo ("Escribe tu nombre."), muestra el campo de WhatsApp solo si se elige, valida el CV (PDF, máximo 10 MB), conserva los datos al regresar y si falla el envío, y muestra los estados Enviando, Error al enviar e Enviado. Para conectarlo: `iniciarFormulario(form, { enviar: (formData) => fetch(...) })` o dejar que haga POST al `action`.
6. **Footer móvil.** Contacto primero como botones (WhatsApp, agenda, correo), enlaces en una línea, redes y legal.

Probado en Chrome a 390 y 1440 px: menú, carrusel, mapa, validación de los dos pasos, campo condicional de WhatsApp, conservación de datos, error de envío y envío exitoso, sin errores en consola y sin scroll horizontal.

**Regla de texto:** el botón principal dice "Diagnóstico gratis" (EN: "Free assessment").

---

# Fondos animados · muush 1.0

Paquete para la landing (Astro). Todo lo que se mueve en el sitio sale de aquí.

## Qué hay

| Archivo | Qué es |
|---|---|
| `shaders/m1-liston.glsl` | **Listón de luz.** Banda curva en diagonal que gira de brasa a acero y ondula despacio. |
| `shaders/m1-acanalado.glsl` | **Vidrio acanalado.** El color se ve a través de costillas verticales de vidrio. |
| `shaders/m1-brasa-acero.glsl` | **Brasa contra acero.** No se usa en muush (reservado para otra marca). |
| `muush-gradient.js` | Motor WebGL 1, sin dependencias. También trae `rotatePill` y `smartHeader`. |
| `MuushGradient.astro` | Componente listo para usar en cada sección. |
| `posters/*.webp` | Cuadro fijo de cada sección. Se ve si no hay WebGL y mientras carga. |
| `demo.html` | Abre en el navegador para ver los cuatro fondos moviéndose. |

Los shaders son los mismos que viven en `muush.pen`: lo que se ve en Pencil es lo que se ve en la web.

## Dónde va cada uno (Landing ES · Muush 1.0 · producción)

Cada fondo cubre su sección completa (`position:absolute; inset:0`) y el contenido va encima con `position:relative; z-index:1`.

| Sección | Shader | Opacidad | Uniforms |
|---|---|---|---|
| Hero (1000 px) | `liston` | 1 | `u_tx:0.5, u_ty:0.53, u_trx:0.36, u_try:0.28, u_tdark:1, u_fadeB:0.06` |
| Qué es muush | ninguno (negro) | | |
| Servicios | ninguno (negro) | | |
| Cómo trabajamos | `acanalado` | 1 | `u_y0:0.52, u_y1:0.47, u_th:0.15, u_right:0.45, u_tx:0.5, u_ty:0.27, u_trx:0.42, u_try:0.22, u_tdark:0.9, u_fadeT:0.2, u_fadeB:0.15` |
| Diagnóstico y contacto | `liston` | 1 | `u_y0:1.0, u_y1:0.35, u_th:0.11, u_amp:0.06, u_twist:0.5, u_tx:0.27, u_ty:0.45, u_trx:0.25, u_try:0.35, u_tdark:0.75, u_fadeT:0.3, u_fadeB:0.05` |
| Footer | ninguno (negro) | | |

Todos llevan además `u_flip:1` (ya viene por default en el motor). Los uniforms que no se pasan toman el `@default` del shader: el motor los lee del propio `.glsl` con `MuushGradient.defaults()` (corregido el 2026-11-01; antes quedaban en 0 y el listón del hero no se dibujaba).

Qué controla cada uniform:
- `u_speed` velocidad (1 = la de Pencil) · `u_grain` grano.
- `u_tx, u_ty, u_trx, u_try, u_tdark` zona de texto que se oscurece (centro, ancho, alto y cuánto). Es lo que cuida que el texto y el botón rojo se lean.
- `u_fadeT, u_fadeB` fundido a negro arriba y abajo, para que las secciones se unan sin corte.
- Listón: `u_y0, u_y1` altura al entrar por la izquierda y al salir por la derecha · `u_amp` ondulación · `u_th` grosor · `u_twist` cuántas veces gira de brasa a acero.
- Acanalado: `u_ribs` costillas · `u_refract` refracción · `u_right` intensidad del lado derecho.
- Brasa contra acero: `u_angle` dirección · `u_scale` tamaño de las masas · `u_warp` qué tan orgánica es la frontera · `u_gap` negro entre masas · `u_bias` balance brasa/acero.

## Otras páginas (escritorio, ES y EN iguales)

| Página · sección | Shader | Uniforms |
|---|---|---|
| Preguntas · todo el contenido (1100 px) | `acanalado` | `u_y0:0.84, u_y1:0.76, u_th:0.13, u_right:0.6, u_tx:0.5, u_ty:0.5, u_trx:0.45, u_try:0.26, u_tdark:1, u_fadeT:0.1, u_fadeB:0.15` |
| Nosotros · hero (820 px) | `liston` | `u_tx:0.5, u_ty:0.55, u_trx:0.4, u_try:0.32, u_tdark:1, u_fadeB:0.08` |
| Nosotros · Cómo se arma y Dónde estamos | ninguno (negro) | |
| Nosotros · Trabaja con muush | `liston` | los mismos de Diagnóstico y contacto de la landing |
| 404 · contenido (760 px) | `acanalado` | `u_y0:0.98, u_y1:0.92, u_th:0.11, u_right:0.6, u_tx:0.5, u_ty:0.5, u_trx:0.42, u_try:0.4, u_tdark:1, u_fadeT:0.1, u_fadeB:0.02` |

Regla general: en muush solo se usan el listón y el vidrio acanalado. **`m1-brasa-acero.glsl` no se usa en muush**: queda reservado para otra marca (detailing). Se deja en la carpeta solo como referencia.

## Reglas de comportamiento

- **Pausa fuera de pantalla** (IntersectionObserver) y con la pestaña oculta. Solo se mueve lo que se ve.
- **`prefers-reduced-motion`:** se dibuja un solo cuadro fijo, sin animación. El pill rotativo se queda en el primer texto y el header no anima.
- **Celular (< 768 px):** resolución 1x. Escritorio: máximo 1.5x. Si en algún celular se siente pesado, usar el poster y no el shader.
- **Sin WebGL:** se ve el poster de la sección.
- Los fondos no reciben clics (`pointer-events:none`) y van con `aria-hidden`.

## Pill rotativo del hero

```js
import { rotatePill } from './muush-gradient.js';
rotatePill(document.querySelector('[data-pill-text]'), [
  'Estrategia tecnológica', 'Software, web y nube', 'Automatización, datos e IA', 'Diseño de producto y UX'
]);
// EN: 'Technology strategy', 'Software, web and cloud', 'Automation, data and AI', 'Product design and UX'
```
Cambia cada 2.6 s con un deslizamiento corto hacia arriba.

## Header flotante

```js
import { smartHeader } from './muush-gradient.js';
smartHeader(document.querySelector('header'), { menuOpen: () => document.body.classList.contains('menu-open') });
```
Visible arriba, se oculta al bajar después de 80 px, reaparece al subir y no se oculta con el menú abierto. Es el mismo comportamiento en escritorio y móvil.

## Verificar
1. Abrir `demo.html` con un servidor local (`npx serve .`), porque carga los shaders con fetch.
2. Activar "reducir movimiento" en el sistema y recargar: todo debe quedarse quieto.
3. Probar en un celular real y revisar que no se caliente.

## Móvil (2026-10-31)

- **Cómo trabajamos · línea vertical:** Clau le explica a Roberto la animación directamente. Sugerencia de partida: la línea se va llenando en Red muush 500 conforme se hace scroll y cada punto se enciende al llegar a su paso. Con `prefers-reduced-motion`, todo encendido desde el inicio.
- **Servicios:** carrusel horizontal con `scroll-snap-type: x mandatory`; la siguiente tarjeta asoma y el indicador marca la posición.
- **Mapa:** pestañas América / Europa; el cambio de región es un desplazamiento suave del mismo mapa.
- **Formularios:** dos pasos con barra de progreso; los datos del paso 1 se conservan al regresar.
- Los shaders se usan igual que en escritorio, a 1x.
