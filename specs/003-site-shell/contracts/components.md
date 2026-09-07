# Component Contracts: Site shell

**Feature**: `specs/003-site-shell` | **Date**: 2026-09-07

The public interface this feature exposes is the **`index.ts` barrel of
`app/features/shell/`** plus the prop surface of the components behind it.
Constitution Article III makes the barrel the module's *only* public API: no
consumer may import `app/features/shell/ui/Nav.vue` directly.

Feature 2's contract froze nine primitives that this module consumes. Nothing
here changes any of them.

## Conventions

Inherited unchanged from `specs/002-primitive-ui-layer/contracts/components.md`:

- `<script setup lang="ts">` with type-only `defineProps<Props>()` and
  **destructured defaults** — no `withDefaults`.
- `class` is **not** a prop; it arrives through fallthrough attributes.
- Variant props are string-literal unions with a documented default.
- The variant → class map is a `const … satisfies Record<K, string>` lookup
  with complete class names, never built by concatenation.

Added for this module:

- **No `ui/` component calls a Nuxt composable.** No `useI18n`, no
  `useLocalePath`, no `useRoute`, no `useSwitchLocalePath`. Copy and
  destinations arrive resolved, as props (spec FR-008). This is Article V's
  presentational rule, and research § R4 is the mechanism that proves it holds:
  a component that cheats cannot render in Storybook.
- `ui/` components may use `<NuxtLink>`, which Storybook stubs globally
  (research § R4).
- Emitted events are past-tense facts, not commands.

---

## Barrel — `app/features/shell/index.ts`

```ts
export { default as SiteNav } from './ui/SiteNav.vue'
export { default as SiteFooter } from './ui/SiteFooter.vue'
export { useMobileMenu } from './logic/useMobileMenu'
export { useShellNavigation } from './logic/useShellNavigation'
export type { ShellDestination, ShellItem, ShellRouteName, ResolvedShellItem } from './data/types'
```

`MobileMenu`, `FooterColumn` and `LanguageToggle` are **not** exported. They are
internal composition detail; only the layout's two components and the two
composables cross the boundary.

> **Naming**: `SiteNav` / `SiteFooter`, not `Nav` / `Footer`. Both bare names
> collide with HTML elements, and unlike the feature 2 primitives these are
> **not** covered by the `useVueMultiWordComponentNames` override in
> `biome.json`, which lists only `app/pages/**`, `app/layouts/**` and
> `app/shared/ui/**`. `rules.md` § R20 records that the rule stays active
> everywhere else, "incluido cualquier componente futuro dentro de una
> feature". Two-word names here cost nothing and keep the linter honest.

---

## Resolved item — the shape `logic/` hands `ui/`

`data/` holds `ShellItem` (an i18n key plus a `ShellDestination`).
`ui/` never sees either — it receives this:

```ts
export interface ResolvedShellItem {
  /** Already translated. */
  label: string
  /** Absent when the item has no destination — spec FR-039. */
  href?: string
  /** True only for `kind: 'external'`; drives target and rel. */
  external?: boolean
  /** True for the route matching the current page — spec A-04. */
  current?: boolean
}
```

`href === undefined` is the whole of FR-039: the component renders a `<span>`,
not an `<a>` with a dead `href`. The type makes the broken-link state
**unrepresentable** rather than merely discouraged.

> `mailto:` items carry `external: false`. A new browsing context for a
> `mailto:` leaves the visitor staring at a blank tab. `wa.me` and the three
> social profiles carry `external: true`.

---

## `SiteNav`

```ts
interface Props {
  items: ResolvedShellItem[]        // required — Proyectos, Nosotros
  cta: ResolvedShellItem            // required — the primary button
  home: string                      // required — resolved href for both lockups
  locale: ShellLocale               // required — 'es' | 'en'
  localeSwitchHref: string          // required — anchorless equivalent route
  menuItems: ResolvedShellItem[]    // required — the 4 mobile-menu destinations
  socials: ResolvedSocial[]         // required — the 3 mobile-menu buttons
}
```

No slot. Renders the responsive nav of `design-extract.md` § 9.bis and owns the
mobile menu it opens.

- **At `lg` and above**: lockup, `items`, the `cta` as `BotonPrimario`
  variant `nav`, and the toggle.
- **Below `lg`**: lockup, toggle, hamburger. **No CTA** — spec FR-011, a
  recorded decision that must carry a comment saying so.
- Root element is `<nav>`.

`menuItems` and `socials` are threaded through `SiteNav` rather than given to a
separately mounted menu because the hamburger, the close control and the panel
are one interactive unit; splitting them would put the open state above the
component that owns it and force it back out through props.

## `MobileMenu` *(internal)*

```ts
interface Props {
  open: boolean
  items: ResolvedShellItem[]
  socials: ResolvedSocial[]
  home: string
  locale: ShellLocale
  localeSwitchHref: string
}
type Emits = {
  closed: []            // any of the four triggers fired
  itemChosen: [href: string]   // lets the parent close before scrolling — FR-030
}
```

Renders the layer stack of § 9.bis: the full-viewport dark-glass panel, the nav
row with the close control, the four items, the divider and the three social
buttons.

It does **not** paint the `BG · base` or `Dotted paper` layers the frame draws
beneath it — spec A-03. Those are the page showing through the blur, which is
the frame's intent; repainting them would double them.

`itemChosen` exists because FR-030 requires the close to complete *before* the
scroll. A component that navigated on its own could not honour the ordering.

## `LanguageToggle` *(internal)*

```ts
interface Props {
  locale: ShellLocale         // the active one
  href: string                // anchorless equivalent route — research § R3
}
```

No slot, no emit. Renders both labels and the divider of § 9.bis: active
bone-100 weight 600, inactive ink-200 weight 500.

The **anchor enhancement** (FR-021) lives here, in the click handler: read
`window.location.hash`, and if non-empty navigate to `href + hash` instead. It
must not intercept modified clicks (middle, ⌘, Ctrl, Shift) or the visitor
loses "open in new tab". With no scripting the plain `href` still works and
lands at the top of the equivalent page — the documented degradation, not a
defect.

> This is the one place a `ui/` component touches the browser, and it is
> deliberate: it is a click handler on its own element, not ambient state. The
> *decision* of where to go is `logic/`'s; only the fragment, which cannot
> exist before the click, is read here.

## `SiteFooter`

```ts
interface Props {
  columns: ResolvedFooterColumn[]   // required — exactly 4
  home: string                      // required — resolved href for the lockup
  tagline: string                   // required
  category: string                  // required
  copyright: string                 // required
  location: string                  // required
}

export interface ResolvedFooterColumn {
  title: string
  items: ResolvedShellItem[]
}
```

No slot. Root element is `<footer>`. Renders the container, brand block, four
columns and bottom bar of § 9.bis, reflowing to two rows of two below `lg`.

`columns` is typed as an array rather than four named props because the four
are structurally identical; the design fixing their count does not make four
props better than one array. The component asserts the length in its test.

## `FooterColumn` *(internal)*

```ts
interface Props {
  title: string
  items: ResolvedShellItem[]
}
```

No slot. Renders the red-300 title and the items at the geometry of
`design-extract.md` § 10 · *FooterColumn*. This is the component that must
render an item with no `href` as plain ink-300 text (FR-039) — the single place
that behaviour is implemented for all three affected items.

---

## Composables — `logic/`

### `useShellNavigation()`

```ts
export function useShellNavigation(): {
  navItems: ComputedRef<ResolvedShellItem[]>
  navCta: ComputedRef<ResolvedShellItem>
  menuItems: ComputedRef<ResolvedShellItem[]>
  footerColumns: ComputedRef<ResolvedFooterColumn[]>
  socials: ComputedRef<ResolvedSocial[]>
  home: ComputedRef<string>
  locale: ComputedRef<ShellLocale>
  localeSwitchHref: ComputedRef<string>
  brand: ComputedRef<{ tagline: string; category: string; copyright: string; location: string }>
}
```

The single seam between the Nuxt runtime and the presentational layer. It reads
`useI18n`, `useLocalePath`, `useSwitchLocalePath` and `useRoute`, and turns the
`data/` model into `Resolved*` shapes. Everything it returns is inert data.

**Anchor destinations always resolve to the locale home plus the hash**, never
a bare fragment (FR-041) — a bare `#proposito` does nothing on the About page,
where the footer also renders.

### `resolveLocaleDestination()` — pure, and the unit-test target

```ts
export function resolveLocaleDestination(
  switchedPath: string,   // may be '' — see below
  fallbackHome: string,
  hash?: string
): string
```

Not a composable. A pure function, no Nuxt import, unit-tested directly.

It exists because `SwitchLocalePathFunction` is typed `(locale) => string` and
returns the **empty string** when the current route has no counterpart in the
target locale (research § R2). An empty `href` resolves to the current page — a
silent no-op the visitor reads as a broken button. This function guarantees
FR-019's totality:

- `switchedPath` non-empty → use it
- `switchedPath` empty → `fallbackHome`
- `hash` present and non-empty → append it

Testing this tests **repository logic**, not the i18n module. That distinction
was raised in planning and is the reason the pure function exists at all.

### `useMobileMenu()`

```ts
export function useMobileMenu(): {
  isOpen: Readonly<Ref<boolean>>
  open: () => void
  close: () => void
}
```

Owns everything FR-009 keeps out of the component: the open flag, the Escape
listener, the body scroll lock with exact offset restoration, `inert` on the
content behind, closing on route change and on crossing the breakpoint upward,
and unconditional lock release in `onScopeDispose`.

`isOpen` is `Readonly` so state changes go through `open()` / `close()` and the
lock can never desynchronise from the flag.

No new dependency. VueUse is absent from the tree (research § R5) and is not
added for this.

---

## What the shell consumes from `app/shared/ui/` — unchanged

| Primitive | Where | Props used |
|---|---|---|
| `Lockup` | nav ×2 (page + menu), footer ×1 | default `form="full"`; wrapped in a link by the caller, since `Lockup` is deliberately not one |
| `BotonPrimario` | nav CTA, desktop only | `variant="nav"`, `href` |
| `SocialIcon` | mobile menu ×3 | `network`, `href`, `label` |
| `Wordmark` | — | reached only through `Lockup` |

**Deliberately not used**, though the feature's acceptance criteria name two of
them — spec A-08:

- **`Pill`** — all eleven instances in `design-extract.md` § 3 are section
  eyebrows. None is in the shell.
- **`LinkArrow`** — all four instances in § 7 are the hero and final CTA. The
  footer's `Agenda una llamada` is a plain 15px column item, and is
  non-interactive anyway under FR-039.
- **`GlassPanel`** — the menu panel has the dark fill but no border, radius or
  padding, so variant `dark` does not fit; the hamburger and close controls
  have their own geometry.
- **`Radar`**, **`SectionGlow`** — no shell instance.

Composing a primitive the design does not place would add markup to satisfy a
checklist. Recorded here so the omission is visibly deliberate.

---

## Deliberately NOT in this contract

No `variant`, `theme`, `size`, `sticky`, `compact`, `transparent` or
`showCta` prop anywhere. Each was considered and rejected:

- **`sticky` / `compact`** — `decisions-open.md` #5 is open and has no frame
  for the compressed state (spec A-05). A prop for an undesigned state is a
  guess with a type signature.
- **`showCta`** — the CTA's absence on mobile is a viewport fact, not a caller
  choice (FR-011).
- **`variant` on `SiteNav` / `SiteFooter`** — § 9.bis verified the two pages'
  chrome is byte-identical. A variant prop would encode a difference the design
  explicitly does not have.
