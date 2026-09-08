# Data model: Floating nav redesign

No new type is introduced. This feature edits the *contents* of one existing
data array and reads one existing computed value differently; the shapes in
`app/features/shell/data/types.ts` (`ShellItem`, `ShellDestination`,
`ResolvedShellItem`) are unchanged.

## `NAV_ITEMS` (edited)

`app/features/shell/data/navigation.ts`

| Before | After |
|---|---|
| `{ labelKey: 'shell.nav.projects', destination: { kind: 'anchor', name: 'index', hash: SHELL_ANCHORS.projects } }` | **removed** |
| `{ labelKey: 'shell.nav.about', destination: { kind: 'route', name: 'nosotros' } }` | unchanged |
| — | **added**: `{ labelKey: 'shell.nav.services', destination: { kind: 'anchor', name: 'index', hash: SHELL_ANCHORS.services } }` |

Order in the array is the render order (`Servicios` then `Nosotros`), matching
the redesigned frame's `Links` child and the spec's User Story 2.

`SHELL_ANCHORS.services` (`'#servicios'`) already exists — it is not new,
only newly consumed by `NAV_ITEMS` (it was already used by `MENU_ITEMS` and
`FOOTER_COLUMNS`).

A code comment at this entry's definition site states the divergence from
the `.pen` (per spec FR-006): `Proyectos` is deliberately absent even though
the redesigned frame draws it, because feature 15 is `blocked` and Roberto
ruled a nav link to a non-existent section reads as a broken site.

**Untouched**: `SHELL_ANCHORS`, `MENU_ITEMS`, `NAV_CTA`'s destination
(`kind: 'anchor', name: 'index', hash: SHELL_ANCHORS.contact` — unchanged;
only its rendered *box* and slot content change, in `ui/`, not here).

## i18n keys (added/removed)

`i18n/locales/{es,en}.json`, under `shell`:

| Key | Change | ES | EN |
|---|---|---|---|
| `shell.nav.projects` | **removed** (no remaining consumer — `shell.menu.projects` and `shell.footer.nav.projects` are separate, untouched keys) | — | — |
| `shell.nav.services` | **added** | `Servicios` | `Services` |
| `shell.nav.switchToEs` | **added** | `Cambiar a español` | `Switch to Spanish` |
| `shell.nav.switchToEn` | **added** | `Cambiar a inglés` | `Switch to English` |

`shell.nav.about` and `shell.nav.cta` are unchanged. The `→` glyph never
enters any key (spec FR-012).

## Component prop contracts

No prop contract changes. See `contracts/components.md`.
