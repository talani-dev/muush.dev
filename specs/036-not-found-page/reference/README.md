# Página 404 · muush.dev

`404.html` es la página de error en un solo archivo, en español e inglés. Funciona tal cual y sirve como referencia visual exacta. Diseño de referencia: canvas "Página 404 · muush.dev" en Claude Design. El copy es el aprobado en Notion (Landing · Contenido y copy → Página 404).

## Cómo se decide el idioma

- Por defecto se muestra en español.
- Si la ruta empieza con `/en` (por ejemplo `/en/lo-que-sea`), un script cambia textos, enlaces y `aria-label` a inglés. Usa los atributos `data-en`, `data-href-en` y `data-aria-en`.
- Sin JavaScript se ve completa en español.

Así funciona con un solo `404.html`, que es lo que sirven Vercel, Netlify y casi cualquier host estático. Si prefieres dos rutas (`src/pages/404.astro` y `src/pages/en/404.astro`), quita el script y deja cada idioma fijo.

## Reglas al implementar

- **Código HTTP 404.** La página tiene que responder con estado 404, no 200. Si responde 200, Google la indexa como página real.
- **`noindex`.** Ya está en el `<head>`.
- **Reutiliza los componentes del sitio.** Header flotante, footer, fondo (dotted paper con manchas radiales), spotlight del cursor y botón `.led`. El CSS de este archivo copia lo que hay en producción solo para que funcione suelto; en Astro debe usar los componentes y tokens que ya existen.
- **Un solo LED por pantalla.** El botón "Volver al inicio" es el primario y lleva el LED. Por eso el header del 404 no muestra el CTA "Cuéntanos tu proyecto".
- **Botón de idioma.** Muestra el idioma activo y lleva al inicio del otro idioma (`/en` o `/es`), porque en un 404 no hay página equivalente a la cual cambiar.
- **Fuentes.** El archivo carga Instrument Sans y Poppins desde Google Fonts. Si el sitio las sirve localmente, usar esas.

## Qué hay en la página

| Elemento | ES | EN | Enlace ES | Enlace EN |
|---|---|---|---|---|
| Pill | Error 404 | Error 404 | — | — |
| Título | No encontramos esta página. | We couldn't find this page. | — | — |
| Subtítulo | Puede que el link venga mal escrito o que la página haya cambiado de lugar. | The link may be mistyped, or the page may have moved. | — | — |
| Botón LED | Volver al inicio | Back to home | `/es` | `/en` |
| Atajos | Propósito · Servicios · Nosotros | Purpose · Services · About us | `/es#proposito` · `/es#servicios` · `/es/nosotros` | `/en#proposito` · `/en#servicios` · `/en/about` |

**Concepto visual · radar vacío.** Tres anillos concéntricos detrás del texto, sin ningún punto. Escritorio: 700 / 500 / 300 px de diámetro. Móvil: 420 / 300 / 180 px. El anillo interior va en Red 400 al 24%; los de afuera, en Bone 100 al 12% y al 8%.

## Revisar

- Que existan los anchors `#proposito` y `#servicios` en `/en`. Hoy el sitio en inglés usa `#servicios`; confirmar que `#proposito` también.
- En el copy de Notion los atajos decían "Servicios · Proyectos · Nosotros". Hoy no hay sección de Proyectos publicada, así que se cambió a "Propósito", igual que el footer. Cuando Proyectos exista, se puede regresar.
