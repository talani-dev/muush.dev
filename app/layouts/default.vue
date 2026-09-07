<script setup lang="ts">
import {
  SiteFooter,
  SiteNav,
  useMobileMenu,
  useShellNavigation,
} from '@/features/shell'

/**
 * The chrome every page inherits: the nav above, the page below, the footer
 * under it. No page composes the shell itself (spec FR-004).
 *
 * The shell module is reached only through its barrel — never a deep path
 * into `ui/`, `logic/` or `data/` (Constitution Article III).
 *
 * The surface here is a flat ink-500, which is what `content.md` § Dirección
 * visual describes: the site is dark end to end. The dotted paper and the
 * section glows are **not** painted — no feature owns them yet, and the
 * mobile menu's glass is meant to blur whatever the page paints rather than
 * repaint it (spec A-03, scope flagged for Roberto).
 */
const {
  navItems,
  navCta,
  menuItems,
  footerColumns,
  socials,
  home,
  locale,
  localeSwitchHref,
  brand,
} = useShellNavigation()

const { t } = useI18n()
const { isOpen } = useMobileMenu()

/*
 * The `hreflang` alternates and the `lang` attribute. They come from the same
 * i18n route table the locale toggle resolves against, so an alternate can
 * never name a page that does not exist — the failure Constitution
 * Article VI calls out by name (spec FR-022).
 */
useHead(useLocaleHead())
</script>

<template>
  <div class="min-h-screen bg-ink-500">
    <SiteNav
      :items="navItems"
      :cta="navCta"
      :home="home"
      :locale="locale"
      :locale-switch-href="localeSwitchHref"
      :menu-items="menuItems"
      :socials="socials"
      :nav-label="t('shell.nav.label')"
      :menu-label="t('shell.menu.label')"
      :menu-open-label="t('shell.menu.open')"
      :menu-close-label="t('shell.menu.close')"
    />

    <!--
      Everything behind the open panel, in one subtree, so a single `inert`
      makes it both unfocusable and invisible to assistive technology — the
      two halves of spec FR-031 without a hand-written tab cycle.
    -->
    <div :inert="isOpen">
      <!--
        No bottom padding: the footer's own `pt-footer-top` is the separation
        the design draws, and adding one here would double it. Vertical rhythm
        inside a page belongs to the sections a later feature builds.
      -->
      <main class="mx-auto max-w-shell-max px-page">
        <slot />
      </main>

      <SiteFooter
        :columns="footerColumns"
        :home="home"
        :tagline="brand.tagline"
        :category="brand.category"
        :copyright="brand.copyright"
        :location="brand.location"
      />
    </div>
  </div>
</template>
