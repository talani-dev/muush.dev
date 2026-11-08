<script setup lang="ts">
import { watch } from 'vue'
import { CookieConsent } from '@/features/legal'
import {
  MobileMenu,
  type ShellLocale,
  SiteFooter,
  SiteHeader,
  useMobileMenu,
  useShellNavigation,
  useSiteSeo,
} from '@/features/shell'

/**
 * The chrome every page inherits (feature 43, contract § 10): the floating
 * header, the full-screen mobile menu, the page, and the footer. No page
 * composes the shell itself, and the shell is reached only through its
 * barrel (Constitution Article III).
 *
 * ## The canvas
 *
 * Plain Negro 950 (`bg-negro-950`, the same token `global.css` puts on
 * `html`, so overscroll shows no seam). Feature 43 retired what the v1 page
 * painted over it: the dotted paper, the red-dot cursor spotlight (Roberto,
 * 2026-11-01, superseding feature 42's "spotlight sigue funcionando") and
 * the section glows; feature 47 deleted their code.
 * The "You" cursor stays; it is CSS in `global.css` and needs nothing here.
 * Features 44–46 paint their own shader backgrounds inside their sections.
 *
 * The root stays one stacking context (`isolate`), positioned, and clips
 * horizontally so a full-bleed section can never add a sideways scrollbar.
 * `clip`, not `hidden`, so it is not a scroll container. The vertical axis
 * no longer needs clipping: it existed for the glows (feature 010).
 *
 * ## The header floats
 *
 * `SiteHeader` is fixed and takes no space in the flow, so a section's
 * background runs under it; in-page jumps stop below it through
 * `scroll-padding-top` (global.css). `MobileMenu` is its sibling, never its
 * descendant, so the header's hide transform can never contain the fixed
 * menu.
 *
 * While the menu is open, the header and everything behind the menu are
 * `inert`: unfocusable and hidden from assistive technology (spec FR-020).
 * The menu's events carry the close reason: Cerrar dismisses (focus returns
 * to the menu button); a link, the logo or the language navigates.
 */
const {
  navItems,
  navCta,
  menuItems,
  footerColumns,
  contactChannels,
  mobileFooterLinks,
  legalItems,
  socials,
  home,
  labels,
  locale,
  localeSwitchHref,
  localeSwitchLabel,
  localeSwitchInPlace,
  switchLocale,
  brand,
} = useShellNavigation()

const { isOpen, close } = useMobileMenu()

/** The 404's in-place switch from the open menu: switch, then close. */
function switchLocaleFromMenu(target: ShellLocale) {
  void switchLocale(target)
  close('navigate')
}

/*
 * A route change under an open menu closes it: a link or the language
 * chosen inside it already closed it, so this catches what is left (a
 * programmatic navigation). History has its own listener in the composable.
 */
const route = useRoute()
watch(
  () => route.fullPath,
  () => close('navigate')
)

/*
 * The page frame is gone (feature 46, spec FR-052): every page is Muush 1.0
 * and full bleed, each section carrying its own drawn padding and its
 * shader background edge to edge. The v1 frame (centred at `shell-max`
 * with the `px-page` inset) and the `fullBleed` page meta that opted out
 * of it went with the last v1 page.
 */

/*
 * The cookie banner and preferences (feature 48) are global: every page,
 * the 404 included. Client-only, so the prerendered HTML carries no banner
 * and a visitor who already chose never sees one flash before hydration.
 * They sit inside the `inert` wrapper: the open mobile menu covers them.
 * The preferences dialog is a modal `<dialog>` in the top layer.
 */

/*
 * The `hreflang` alternates and the `lang` attribute, from the same i18n
 * route table the toggle resolves against (Constitution Article VI).
 *
 * Where each head tag comes from (feature 35, research R7), each once:
 * - i18n (`useLocaleHead`, here): lang, canonical, hreflang, og:locale, og:url
 * - `useSiteSeo` (here): og:type, og:site_name, twitter:card, the JSON-LD Organization
 * - each page, via `usePageSeo`: title, description, og:title, og:description
 */
useHead(useLocaleHead())
useSiteSeo()
</script>

<template>
  <div class="relative isolate min-h-screen overflow-x-clip bg-negro-950">
    <SiteHeader
      :inert="isOpen"
      :items="navItems"
      :cta="navCta"
      :home="home"
      :home-label="labels.home"
      :locale="locale"
      :locale-switch-href="localeSwitchHref"
      :locale-switch-label="localeSwitchLabel"
      :locale-switch-in-place="localeSwitchInPlace"
      :nav-label="labels.nav"
      :menu-open-label="labels.menuOpen"
      @switch-locale="switchLocale"
    />

    <MobileMenu
      :open="isOpen"
      :items="menuItems"
      :socials="socials"
      :home="home"
      :home-label="labels.home"
      :locale="locale"
      :locale-switch-href="localeSwitchHref"
      :locale-switch-label="localeSwitchLabel"
      :locale-switch-in-place="localeSwitchInPlace"
      :label="labels.menu"
      :close-label="labels.menuClose"
      @close="close('dismiss')"
      @item-chosen="close('navigate')"
      @switch-locale="switchLocaleFromMenu"
    />

    <div :inert="isOpen">
      <main>
        <slot />
      </main>

      <!--
        Flush after the last section (feature 46, leader answer of
        2026-11-02, pen extract-46 § 6): in the `.pen` the footer is the
        next child of the page stack with no gap. The v1 `mt-section-gap`
        went with the last v1 section.
      -->
      <SiteFooter
        :columns="footerColumns"
        :contact-channels="contactChannels"
        :mobile-links="mobileFooterLinks"
        :socials="socials"
        :legal="legalItems"
        :home="home"
        :home-label="labels.home"
        :tagline="brand.tagline"
        :category="brand.category"
        :copyright="brand.copyright"
        :label="labels.footer"
      />

      <ClientOnly>
        <CookieConsent />
      </ClientOnly>
    </div>
  </div>
</template>
