<script setup lang="ts">
import { watch } from 'vue'
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
 * the section glows (hidden at their single wrapper, `SectionBackdrop`).
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
      <main class="mx-auto max-w-shell-max px-page">
        <slot />
      </main>

      <!--
        `mt-section-gap` keeps the space the v1 sections had above the footer
        (feature 23); without it the v1 contact panel and the Work with
        muush form touch the footer's rule. It belongs to those v1 sections:
        features 44–46 replace them and decide the v2 rhythm, and drop it.
      -->
      <SiteFooter
        class="mt-section-gap"
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
    </div>
  </div>
</template>
