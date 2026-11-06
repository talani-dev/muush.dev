# Component and composable contracts · feature 43

`ui/` components receive resolved data and strings as props, emit events,
and call no Nuxt composable except `NuxtLink` rendering (repo rule
`rules.md` § R23, feature 3 precedent). Every component stays under 200
lines. Class strings are complete static strings so Tailwind's scanner sees
them.

## 1 · Shared brand marks (`app/shared/ui/`)

| Component | Props | Renders |
|---|---|---|
| `Isotipo.vue` | — | inline `<svg>` 40 × 22 (`size-isotipo` token), `aria-hidden`, stroke `currentColor` (caller sets `text-blanco`), dot `fill-red-muush-500` |
| `Wordmark.vue` | — | `<span>` Poppins 22 (new `text-marca` token), baseline: `muush` 600 Blanco · `.` 600 Red muush 500 · `dev` 400 Gris 400 |
| `Lockup.vue` | `form?: 'full' \| 'isotipo'` (default `full`) | `Isotipo` + `Wordmark`, gap 10, 176 × 31; `isotipo` renders the mark only. Decorative: the accessible name lives on the caller's link |
| `SocialIcon.vue` | `network: SocialNetwork` | the brand SVG, `aria-hidden`, `fill: currentColor`, sized by the caller (`size-*`) |

`export type SocialNetwork = 'linkedin' | 'instagram' | 'tiktok'`.

## 2 · `LanguageToggle.vue` (restyled in place)

Props unchanged (`locale`, `href`, `switchLabel`, `inPlace?`) plus
`variant?: 'desktop' | 'mobile'` (default `desktop`). Emits
`switchInPlace(locale)`. Desktop: 40 × 40 pill, `bg-nav-fondo`, 1 px Blanco
15 %, blur 20, 12 / 600 Blanco. Mobile: 36 × 36, radius 12, 1 px
`linea-fuerte`, no fill. **All behaviour code is untouched** (route-map href,
fragment preservation, cookie write first, in-place switch, NuxtLink vs
`<a>`). Existing tests keep every behavioural assertion; only class
assertions change.

## 3 · `SiteHeader.vue`

| Prop | Type | Notes |
|---|---|---|
| `items` | `ResolvedShellItem[]` | link bar |
| `cta` | `ResolvedShellItem` | always present (Q1) |
| `home` | `string` | logo href |
| `homeLabel` | `string` | accessible name of the logo link |
| `locale`, `localeSwitchHref`, `localeSwitchLabel`, `localeSwitchInPlace?` | as v1 | passed to both toggles |
| `navLabel`, `menuOpenLabel` | `string` | |

Emits `switchLocale(locale)`. Owns: `useNavScrollReveal(isOpen)` and
`reveal()` on `focusin`; the menu button ref; focus return when
`lastCloseReason === 'dismiss'`. Markup: `<header>` fixed, `<nav
:aria-label>`; below `lg` the mobile bar (isotipo link, mobile toggle,
`MenuButton`), from `lg` the desktop row (lockup link, `NavLinkBar`, desktop
toggle + `PrimaryButton size="nav"`). `inert` while the menu is open is set
by the layout. Not printed (`print:hidden`).

## 4 · `NavLinkBar.vue`

Props `items: ResolvedShellItem[]`. A `<ul>` in the glass pill; each item a
`NuxtLink`; `current === 'page'` → `aria-current="page"`, `'section'` →
`aria-current="true"`; either shows the active fill, Blanco text and the
decorative 6 × 6 dot.

## 5 · `MenuButton.vue`

Props `label: string`, `expanded: boolean`, `kind: 'open' | 'close'`. A
`<button type="button">` 36 × 36 radius 12; `open` draws three lines,
`close` draws the 14 × 14 X (stroke 1.6, round caps, `currentColor`).
`aria-expanded` only on `open`. Emits `click`. Exposes its root element for
focus.

## 6 · `MobileMenu.vue`

| Prop | Type |
|---|---|
| `open` | `boolean` |
| `items` | `ResolvedShellItem[]` |
| `socials` | `ResolvedSocial[]` |
| `home`, `homeLabel` | `string` |
| `locale`, `localeSwitchHref`, `localeSwitchLabel`, `localeSwitchInPlace?` | as header |
| `label`, `closeLabel` | `string` |

Emits `close()` (Cerrar), `itemChosen(href)`, `switchLocale(locale)`.
Renders only when `open` (`v-if`, inside `<Transition>`). Layers: Negro 950
base, `<ShaderBackground preset="mobileMenu">`, glass, content. Root
`role="dialog" aria-modal="true" :aria-label="label"`. Uses
`useFocusTrap(rootRef, () => open)`; focuses the Cerrar button on open.
Links: Poppins 32 / 500, no arrows; divider; `SocialLinks size="menu"`.

## 7 · `SiteFooter.vue`, `FooterColumns.vue`, `MobileFooter.vue`, `SocialLinks.vue`

- `SiteFooter` props: `columns: ResolvedFooterColumn[]`, `contactChannels:
  ResolvedContactChannel[]`, `mobileLinks: ResolvedShellItem[]`, `socials:
  ResolvedSocial[]`, `legal: ResolvedShellItem[]`, `home`, `homeLabel`,
  `tagline`, `category`, `copyright`, `label`. Renders `<footer>`; desktop
  part `hidden lg:block`, mobile part `lg:hidden` (copy is duplicated in the
  DOM; the hidden copy is `display: none`, so it is not announced).
- `FooterColumns` props `columns`; an item without `href` renders as
  `<span>`; external items get `target="_blank" rel="noopener noreferrer"`.
- `MobileFooter` props: the mobile subset; contact rows are links with the
  label and a hint plus decorative `→`.
- `SocialLinks` props `socials`, `size: 'menu' | 'footer'` (48 filled /
  44 outline); each an `<a>` with `aria-label` = network label, external
  attributes, `SocialIcon` inside in Blanco.
- Legal entries (`legal`) render as `<span>` until 48.

## 8 · Composables (`app/features/shell/logic/`)

| Composable | Signature | Notes |
|---|---|---|
| `useMobileMenu()` | `{ isOpen, lastCloseReason, open(), close(reason?) }` | existing; adds `lastCloseReason`; `releaseScroll` restores with `behavior: 'instant'` (research R5) |
| `useNavScrollReveal(menuOpen)` | `{ isNavVisible, reveal() }` | existing rule; `reveal()` new |
| `useFocusTrap(container, active)` | `void` | Tab/Shift+Tab wrap among focusable descendants while `active()`; listener removed on dispose |
| `useActiveSection(enabled, anchors)` | `{ activeAnchor: Ref<SectionAnchor \| null> }` | client only; `IntersectionObserver` on `document.getElementById(id)`; re-observes on route change; disconnects on dispose; `null` when unsupported |
| `createShellItemResolver(deps)` | adds optional `activeAnchor: () => SectionAnchor \| null` | anchor items current = `'section'` when route matches and id matches; route items `'page'` |
| `useShellNavigation()` | returns `navItems`, `navCta`, `menuItems`, `footerColumns`, `contactChannels`, `mobileFooterLinks`, `legalItems`, `socials`, `home`, `locale`, `localeSwitchHref`, `localeSwitchInPlace`, `switchLocale`, `brand` | drops `showNavCta`; `navCta` no longer removed on error |

## 9 · Shared changes

- `ShaderBackground.vue`: poster `<img>` only when `preset.poster` exists.
- `useShaderCanvas.ts`: `try { source = await load() } catch { return
  this.fallBack() }`.
- `GlassButton.vue`: `size` prop removed.
- `legacy/SectionBackdrop.vue`: root gets `hidden` (glows retired).

## 10 · Layout (`app/layouts/default.vue`)

```
<div class="relative isolate min-h-screen overflow-x-clip bg-negro-950">
  <SiteHeader :inert="isOpen" … />
  <MobileMenu :open="isOpen" … />
  <div :inert="isOpen">
    <main class="mx-auto max-w-shell-max px-page"><slot /></main>
    <SiteFooter … />
  </div>
</div>
```

No `DotGrid`, no `CursorSpotlight`, no `useCursorSpotlight`. `<main>` is
unchanged (44 owns full-bleed sections).

## Amendment 2026-11-01 — Home link added by Roberto 2026-11-01

- `NavLinkBar`, `MobileMenu`, `FooterColumns` / `ShellItemLink`,
  `MobileFooter`: props unchanged. The first item they receive is the Home
  item; a `scrollsToTop` item clicked on its own page scrolls to the top
  (`MobileMenu` emits `itemChosen` first, so the layout releases the scroll
  lock before the scroll).
- `useActiveSection(enabled, anchors, refreshKey)` →
  `{ activeAnchor, atTop }`.
- `createShellItemResolver({ …, atTop? })`; `useShellItemResolver(activeAnchor?, atTop?)`.
- `scrollToTopIfCurrent(href)` / `isCurrentPageWithoutHash(href, location)`
  in `app/features/shell/logic/scrollToTopIfCurrent.ts`.
- Shared (reopened 2026-11-01, shader defaults):
  `readShaderDefaults(source): Record<string, number>` in
  `app/shared/utils/shaderUniformDefaults.ts`;
  `withShaderDefaults(uniforms, shaderDefaults = {})` in
  `app/shared/utils/shaderFrame.ts`.
