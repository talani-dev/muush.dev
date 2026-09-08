<script setup lang="ts">
import {
  SiteFooter,
  SiteNav,
  useMobileMenu,
  useShellNavigation,
} from '@/features/shell'
import DotGrid from '@/shared/ui/DotGrid.vue'

/**
 * The chrome every page inherits: the nav above, the page below, the footer
 * under it. No page composes the shell itself (spec FR-004).
 *
 * The shell module is reached only through its barrel — never a deep path
 * into `ui/`, `logic/` or `data/` (Constitution Article III).
 *
 * ## The background stack
 *
 * The page is not a dark surface, it is four layers. Bottom to top, which is
 * the child order of frame `SdEJx` and the single visual requirement the
 * background is judged against (feature 006, FR-005):
 *
 * | Layer | Where it is written |
 * |---|---|
 * | ink-500 base | this element's own background |
 * | section glow groups · `--layer-glow` (-2) | inside each section |
 * | dotted paper · `--layer-dots` (-1), page-wide | `<DotGrid />`, once, here |
 * | nav, page content, footer | normal flow |
 *
 * The root element is the page's **single stacking context** (`isolate`) and
 * is positioned (`relative`), which is what lets both negative levels resolve
 * against the whole document instead of escaping to the document root and
 * painting behind this element's own ink. Because the two levels differ, a
 * glow authored *inside* a section still paints *beneath* a sheet declared
 * once here — no registry, no list of 21, no client state
 * (`docs/business/rules.md` § R28). What a section must and must not do is in
 * `SectionBackdrop.vue`'s doc comment.
 *
 * `overflow-x: clip`, not `hidden`: several glows sit at negative x in the
 * design, and both keep them from producing a horizontal scrollbar — but
 * `hidden` on one axis coerces `visible` on the other to `auto`, turning the
 * page into a scroll container and breaking any future `position: sticky`.
 * `clip` does not (CSS Overflow 3; feature 006 `research.md` § R3).
 *
 * Feature 3's scope flag **A-03 is resolved by feature 006**: the dotted paper
 * and the glow mechanism are painted here. The mobile menu still repaints
 * nothing — its glass blurs what this stack paints, which is now dots and
 * glows rather than flat ink (FR-008).
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
  <div class="relative isolate min-h-screen overflow-x-clip bg-ink-500">
    <!--
      The page-wide dotted paper, rendered once: not per page and not per
      section, because a 24px grid restarted at every section boundary shows
      its seams unless every section is an exact multiple of 24px tall.
    -->
    <DotGrid />

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
