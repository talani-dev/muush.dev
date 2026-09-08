<script setup lang="ts">
import {
  SiteFooter,
  SiteNav,
  useMobileMenu,
  useShellNavigation,
} from '@/features/shell'
import { useCursorSpotlight } from '@/shared/logic/useCursorSpotlight'
import CursorSpotlight from '@/shared/ui/CursorSpotlight.vue'
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
 * The page is not a dark surface, it is five layers. Bottom to top, which is
 * the child order of frame `SdEJx` and the single visual requirement the
 * background is judged against (feature 006, FR-005), with the cursor
 * spotlight added above the dots by feature 008 (`rules.md` § R37):
 *
 * | Layer | Where it is written |
 * |---|---|
 * | ink-500 base | this element's own background |
 * | section glow groups · `--layer-glow` (-3) | inside each section |
 * | dotted paper · `--layer-dots` (-2), page-wide | `<DotGrid />`, once, here |
 * | cursor spotlight · `--layer-spotlight` (-1) | `<CursorSpotlight />`, here, after mount |
 * | nav, page content, footer | normal flow |
 *
 * The root element is the page's **single stacking context** (`isolate`) and
 * is positioned (`relative`), which is what lets all three negative levels
 * resolve against the whole document instead of escaping to the document root
 * and painting behind this element's own ink. Because the levels differ, a
 * glow authored *inside* a section still paints *beneath* a sheet declared
 * once here — no registry, no list of 21, no client state
 * (`docs/business/rules.md` § R28). What a section must and must not do is in
 * `SectionBackdrop.vue`'s doc comment.
 *
 * The two existing levels were renumbered rather than reordered: the spotlight
 * has to paint **above** the dots to brighten them (`ui-map.md:271`) and there
 * is no integer between -1 and 0. Both keep their token names, so `DotGrid`,
 * `SectionBackdrop` and `SectionGlow` did not change a line.
 *
 * **The spotlight is the only layer absent from the prerendered HTML**, and
 * that absence is mechanical rather than promised: `isActive` is `false` on the
 * server and stays `false` until the first mouse event, so the element cannot
 * appear in the artefact, the first client render agrees with the server's, and
 * no red blob is painted in the corner before the pointer has moved
 * (feature 008 `research.md` § R7). It is also the no-JS fallback `ui-map.md`
 * § 10 specifies — "fondo normal, sin glow — no se pierde contenido" — with
 * nothing written to arrange it.
 *
 * This root is also the element the spotlight's coordinates are published on,
 * which is what makes them agree with `DotGrid`'s own origin.
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
  showNavCta,
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
 * The pointer tracking. The ref is this root element, which is both where the
 * coordinates are published and the origin they are measured against — the
 * host contract in `contracts/components.md` § 1. Every listener, every media
 * condition and the once-per-frame coalescing live in the composable
 * (Constitution Article V).
 */
const layoutRoot = ref<HTMLElement | null>(null)
const { isActive: isSpotlightActive } = useCursorSpotlight(layoutRoot)

/*
 * The `hreflang` alternates and the `lang` attribute. They come from the same
 * i18n route table the locale toggle resolves against, so an alternate can
 * never name a page that does not exist — the failure Constitution
 * Article VI calls out by name (spec FR-022).
 */
useHead(useLocaleHead())
</script>

<template>
  <div
    ref="layoutRoot"
    class="relative isolate min-h-screen overflow-x-clip bg-ink-500"
  >
    <!--
      The page-wide dotted paper, rendered once: not per page and not per
      section, because a 24px grid restarted at every section boundary shows
      its seams unless every section is an exact multiple of 24px tall.
    -->
    <DotGrid />

    <!--
      The cursor spotlight, after the dots for readability — correctness comes
      from the level, not the document order, which is the whole point of
      § R28 having distinct levels. It exists only where the design says it
      should: a fine, hovering pointer, motion not reduced, and after the first
      mouse event has arrived.
    -->
    <CursorSpotlight v-if="isSpotlightActive" />

    <!--
      `show-cta` is the only thing feature 009 changes in this file. Whether
      the nav offers `Cuéntanos tu proyecto` is resolved in the shell's own
      `logic/` and passed through here, so the layout stays a composer and no
      page can publish it from below — in SSR the layout renders before the
      page, which is the same reason feature 006 rejected a `provide`/`inject`
      glow registry (`rules.md` § R28).
    -->
    <SiteNav
      :items="navItems"
      :cta="navCta"
      :show-cta="showNavCta"
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
