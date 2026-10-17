# muush.dev

Sitio de marketing de muush, un technology solution studio. Construido con
[Astro](https://astro.build), salida 100% estática, pensado para desplegarse
en S3 + CloudFront.

## Requisitos

- Node 22+ (ver `.nvmrc`)
- [pnpm](https://pnpm.io)

## Comandos

| Comando            | Qué hace                                      |
| ------------------ | ---------------------------------------------- |
| `pnpm dev`          | Levanta el servidor de desarrollo              |
| `pnpm build`        | Genera el sitio estático en `dist/`            |
| `pnpm preview`      | Sirve el build de `dist/` localmente           |
| `pnpm typecheck`    | `astro check` — valida tipos                   |
| `pnpm lint`         | Lint con Biome                                 |
| `pnpm lint:fix`     | Lint con Biome, aplicando fixes                |
| `pnpm format`       | Chequea formato con Biome                      |
| `pnpm format:fix`   | Formatea con Biome                             |
| `pnpm check`        | Lint + formato con Biome (`--error-on-warnings`)|
| `pnpm check:fix`    | `pnpm check` aplicando fixes                   |
| `pnpm test`         | Corre los tests con Vitest                     |
| `pnpm test:watch`   | Vitest en modo watch                           |

## Estructura de carpetas

```
src/
  components/   Componentes .astro de presentación
  islands/      Componentes .svelte interactivos ("islands")
  layouts/      Layouts compartidos (BaseLayout.astro)
  pages/        Rutas — una carpeta por locale (es/, en/)
  i18n/         Diccionario de strings (ui.ts) y helpers (utils.ts)
  styles/       global.css — tokens de diseño y setup de Tailwind
  types/        Tipos compartidos de TypeScript
  utils/        Utilidades compartidas
public/
  fonts/        Archivos de fuentes (Poppins, Instrument Sans)
tests/          Tests de Vitest
```

Los imports usan alias definidos en `tsconfig.json` (`@/components/*`,
`@/islands/*`, `@/layouts/*`, `@/i18n/*`, `@/types/*`, `@/utils/*`). Los
imports relativos solo se permiten entre archivos del mismo directorio.

## i18n

El sitio usa `@nuxtjs/i18n` (ver `i18n` en `nuxt.config.ts`) con dos locales,
`en` (default desde la feature 37) y `es`, ambos con prefijo de URL
(`/en/...`, `/es/...`, `strategy: 'prefix'`). Los segmentos de ruta están
traducidos (`/en/about` ↔ `/es/nosotros`) y se declaran una sola vez en
`i18n.pages`.

La raíz (`/`) no tiene página: en `nuxt dev` la resuelve
`i18n.rootRedirect` (`/en`) y en el sitio estático la sirve
`public/index.html`, que redirige a `/en`. En producción el edge decide `/`
antes (cookie `muush_locale`, luego país, luego `en`; ver
`specs/033-ip-locale-root-redirect/`). `hreflang="x-default"` apunta a la
versión en inglés de cada página.

Las cadenas viven en `i18n/locales/en.json` y `i18n/locales/es.json`, con
las mismas claves (lo verifica `tests/i18n-parity.test.ts`). El texto se
resuelve con `useI18n()`, normalmente en los composables de `logic/` de cada
feature; ningún componente escribe una cadena visible a mano.

## Convención de commits y branches

Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/)
con gitmoji, validado por un hook de Husky (`.husky/commit-msg`):

```
<gitmoji> <type>(<scope>): <descripción>
```

| Type       | Gitmoji | Uso                          |
| ---------- | ------- | ----------------------------- |
| `feat`     | ✨      | Nueva funcionalidad           |
| `fix`      | 🐛      | Corrección de bug             |
| `chore`    | 🔧      | Mantenimiento                 |
| `docs`     | 📝      | Documentación                 |
| `refactor` | ♻️      | Refactor                      |
| `test`     | ✅      | Tests                         |
| `ci`       | 👷      | CI/CD                         |
| `build`    | 🏗️      | Build system o dependencias   |
| `perf`     | ⚡️      | Performance                   |
| `style`    | 💄      | Formato, sin cambios de lógica|
| `revert`   | ⏪      | Revertir un commit anterior   |
| `merge`    | 🔀      | Merge de branch               |
| `release`  | 🔖      | Release de versión            |

Los nombres de branch siguen el mismo prefijo: `feat/`, `fix/`, `chore/`,
`docs/`, `refactor/`, `test/`, `ci/`, `build/`, `perf/`, `style/` (validado
en `.husky/pre-commit`, salvo en `main`, `master`, `init` y `hotfix/*`).

Antes de cada commit y push, los hooks de Husky corren Biome, `astro check`
y (en push) Vitest — ver `.husky/`.
