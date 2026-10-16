# Data model: Not-found page (feature 36)

The feature has no runtime data. Its "data" is copy keys, destination descriptors and tokens, all static.

## 1 · Destinations — `app/features/shell/data/notFound.ts`

Reuses the shell's existing types (`ShellItem`, `ShellDestination`, `SHELL_ANCHORS`) from `data/types.ts` and `data/navigation.ts`. No path literal.

```ts
/** The LED button: the same-locale home. */
export const NOT_FOUND_HOME: ShellItem = {
  labelKey: 'shell.notFound.cta',
  destination: { kind: 'route', name: 'index' },
}

/** The shortcuts row, in render order (reference README § Qué hay en la página). */
export const NOT_FOUND_SHORTCUTS: ShellItem[] = [
  { labelKey: 'shell.notFound.shortcuts.purpose',
    destination: { kind: 'anchor', name: 'index', hash: SHELL_ANCHORS.purpose } },
  { labelKey: 'shell.notFound.shortcuts.services',
    destination: { kind: 'anchor', name: 'index', hash: SHELL_ANCHORS.services } },
  { labelKey: 'shell.notFound.shortcuts.about',
    destination: { kind: 'route', name: 'nosotros' } },
]

/** The other i18n keys of the page. */
export const NOT_FOUND_COPY_KEYS = {
  documentTitle: 'pages.notFound.title',
  eyebrow: 'shell.notFound.eyebrow',
  headline: 'shell.notFound.headline',
  body: 'shell.notFound.body',
  shortcutsLabel: 'shell.notFound.shortcutsLabel',
} as const

/** The reference's robots value, verbatim. */
export const NOT_FOUND_ROBOTS = 'noindex'
```

Validation: exactly three shortcuts; every destination is `route` or `anchor` (never `external`/`none`); asserted by a unit test.

## 2 · Copy — `i18n/locales/{es,en}.json`

New keys only; no existing key changes.

| Key | es | en |
|---|---|---|
| `pages.notFound.title` | Página no encontrada · muush | Page not found · muush |
| `shell.notFound.eyebrow` | Error 404 | Error 404 |
| `shell.notFound.headline` | No encontramos esta página. | We couldn't find this page. |
| `shell.notFound.body` | Puede que el link venga mal escrito o que la página haya cambiado de lugar. | The link may be mistyped, or the page may have moved. |
| `shell.notFound.cta` | Volver al inicio | Back to home |
| `shell.notFound.shortcutsLabel` | Atajos | Shortcuts |
| `shell.notFound.shortcuts.purpose` | Propósito | Purpose |
| `shell.notFound.shortcuts.services` | Servicios | Services |
| `shell.notFound.shortcuts.about` | Nosotros | About us |

`pages.notFound` has a `title` and **no** `description` (`research.md` R3). `tests/seo-output.test.ts` reads `pages.home` / `pages.about` only, so the new sibling does not affect it. The apostrophe in "couldn't" is a plain character for vue-i18n; no escaping needed (only `@`, `{`, `}`, `|` are special).

## 3 · Resolved content — what `logic/` hands `ui/`

```ts
export interface NotFoundContent {
  eyebrow: string
  headline: string
  body: string
  cta: ResolvedShellItem          // { label, href }
  shortcutsLabel: string
  shortcuts: ResolvedShellItem[]  // 3 × { label, href }
}
```

Produced by `useNotFoundContent()` through the shared `useShellItemResolver()` (lifted from `useShellNavigation`, `research.md` R5). Values per locale:

| Field | es | en |
|---|---|---|
| `cta.href` | `/es` | `/en` |
| `shortcuts[0].href` | `/es#proposito` | `/en#proposito` |
| `shortcuts[1].href` | `/es#servicios` | `/en#servicios` |
| `shortcuts[2].href` | `/es/nosotros` | `/en/about` |

## 4 · Shell navigation state change

| Value from `useShellNavigation()` | Before | After |
|---|---|---|
| `navCta` | `ResolvedShellItem` | `ResolvedShellItem \| undefined` — `undefined` while `useError().value` is set |
| everything else | unchanged | unchanged |

`SiteNav` prop `cta` becomes optional; when absent, neither the CTA wrapper nor its `<noscript>` override renders.

## 5 · Documents written by the build

| File | Language | Status at build | Notes |
|---|---|---|---|
| `es/404/index.html` + `es/404/_payload.json` | es-MX | rendered 404, written via the hook | Stage 2: served for `/es`, `/es/*` (Stage 1: not referenced by the edge) |
| `en/404/index.html` + `en/404/_payload.json` | en-US | same | Stage 1: served for every missing path; Stage 2: `/en`, `/en/*` and every unprefixed/unknown path (G6) |
| `200.html`, `404.html` | — | **no longer written** | `research.md` R2 |

## 6 · Tokens

Listed with values and derivations in `research.md` R6 (rings, spacing) and R6b (glow position). Ring tokens in `:root`; spacing tokens, including `--spacing-not-found-glow-x` / `--spacing-not-found-glow-y`, in `@theme inline`.

## 7 · Background glow (gate G4)

| Prop / class | Value | Source |
|---|---|---|
| `color` | `red-400` | reference `.bg__blob--red` |
| `opacity` | `60` | nearest admitted red opacity to the reference's 55 % |
| `size` | `1400-700` | nearest existing size to the reference's 1440 px |
| position | `left-not-found-glow-x top-not-found-glow-y -translate-x-1/2 -translate-y-1/2` | centre derived in R6b |

One instance, inside `SectionBackdrop`, in the not-found section only.
