# Component contracts touched by this feature

Convention matches `docs/business/landing/component-contracts.md`: this
records the public prop/slot/emit surface, not internal markup. Where a
contract is unchanged, that is stated explicitly rather than omitted, since
an approved spec that silently reaches into a shipped contract is worse than
one that says so (the same discipline feature 9's *Files this feature
modifies* table established).

## `SiteNav.vue` — UNCHANGED prop contract

```ts
interface Props {
  items: ResolvedShellItem[]
  cta: ResolvedShellItem
  showCta: boolean
  home: string
  locale: ShellLocale
  localeSwitchHref: string
  menuItems: ResolvedShellItem[]
  socials: ResolvedSocial[]
  navLabel: string
  menuLabel: string
  menuOpenLabel: string
  menuCloseLabel: string
}
```

Zero props added, removed or retyped. `items` now resolves to
`[Servicios, Nosotros]` instead of `[Proyectos, Nosotros]` — a change in
what the caller (`useShellNavigation.ts` via `NAV_ITEMS`) passes, not in the
prop's shape. Internal template/markup changes only: the pill container
classes, and the CTA's slot content (label + leading arrow span).

## `LanguageToggle.vue` — UNCHANGED prop contract

```ts
interface Props {
  locale: ShellLocale
  href: string
}
```

Zero props added, removed or retyped. The component's *rendered output*
changes materially (one 44×44 circular link instead of a two-code text
pair with a divider), but every prop it already accepts is sufficient to
build the new markup — `locale` picks which two-letter code shows and which
`switchTo*` key resolves the accessible name; `href` is unchanged in what it
carries (still the anchorless equivalent-route URL; `preserveAnchor` still
appends the fragment at click time).

## `BotonPrimario.vue` — UNCHANGED prop contract, updated `nav` variant values

```ts
export type ButtonVariant = 'nav' | 'hero' | 'submit'

interface Props {
  variant?: ButtonVariant
  href?: string
  type?: 'button' | 'submit'
}
```

Zero props added, removed or retyped (spec FR-013). Only the **value**
`sizeByVariant.nav` maps to changes (its padding/font-size utility string),
to hit the new 221×48 box. The component still renders whatever its default
slot is given — this feature is the first `nav`-variant caller to put more
than a bare label in that slot (the leading arrow span), which the existing
`<slot />` already supports without modification.

## `MobileMenu.vue`, `useShellNavigation.ts`, `useNavCtaReveal.ts`, `useMobileMenu.ts`, `resolveLocaleDestination.ts` — UNCHANGED

No prop, return-value or exported-function signature changes. Listed here
so a reviewer can confirm the claim against a `git diff --stat` rather than
trusting prose.
