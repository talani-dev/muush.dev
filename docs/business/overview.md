# muush.dev — Contexto de negocio

## Qué es

Sitio de marketing de **muush**, un technology solution studio. El sitio es
la carta de presentación pública del estudio — no es un producto con lógica
de negocio propia, es contenido + diseño.

## Páginas planeadas

| Página    | Ruta                          | Estado      |
|-----------|-------------------------------|-------------|
| Landing   | `/es/`, `/en/`                | Cascarón — placeholder, falta UI real |
| Nosotros  | `/es/nosotros`, `/en/about`   | No creada aún |

Ambas páginas existen en español (default) e inglés — ver Constitution
Artículo III (i18n Parity).

## Idiomas

- `es` — default, con prefijo de URL (`/es/...`)
- `en` — con prefijo de URL (`/en/...`)
- La raíz (`/`) redirige a `/es/`

## Stack

- **Astro 7**, salida 100% estática (`output: 'static'`) — sin servidor
- **Svelte** para islands de interactividad puntual
- **Tailwind CSS v4** leyendo tokens desde variables CSS en `src/styles/global.css`
- **Biome** — único linter/formateador
- **Vitest** — único test runner
- **Husky** — hooks de commit/push con convención gitmoji + Conventional Commits

## Deploy

S3 + CloudFront. El build (`dist/`) son archivos estáticos servidos directo
desde S3 detrás de CloudFront — no hay cómputo detrás del sitio.

## Diseño

Los tokens de diseño (`--bone-*`, `--ink-*`, `--red-*`, `--wine-*` en
`src/styles/global.css`) son **placeholders** — el branding book real de
muush todavía no se ha integrado. Cuando llegue, solo cambia
`src/styles/global.css`; ver Constitution Artículo IV.

## Restricciones conocidas

- Sin backend, sin base de datos, sin autenticación — cualquier feature que
  los requiera no pertenece a este repo.
- Sin Playwright ni Storybook — decisión explícita, el sitio es demasiado
  pequeño para justificar esa infraestructura (ver Constitution Artículo VII).
