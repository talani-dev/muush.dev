<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import type {
  ResolvedShellItem,
  ResolvedSocial,
  ShellLocale,
} from '@/features/shell/data/types'
import { useMobileMenu } from '@/features/shell/logic/useMobileMenu'
import BotonPrimario from '@/shared/ui/BotonPrimario.vue'
import Lockup from '@/shared/ui/Lockup.vue'
import LanguageToggle from './LanguageToggle.vue'
import MobileMenu from './MobileMenu.vue'

/**
 * The nav of `design-extract.md` § 9.bis. One responsive component: § 9.bis
 * verified the nav is byte-identical between the Landing and About frames in
 * both viewports, so there is no per-page variant and no `variant` prop.
 *
 * It also owns the mobile menu, because the hamburger, the close control and
 * the panel are one interactive unit — splitting them would put the open
 * state above the component that owns it and force it back down as props.
 *
 * Every `lg:` here changes **layout**: which controls exist, never their size
 * (spec FR-047).
 *
 * ## The nav is pinned, and only its button animates (feature 009)
 *
 * `ui-map.md` § 2, decided by Roberto on 2026-09-07, replacing
 * `decisions-open.md` #5: the nav stays at the top while the page scrolls, at
 * **the same height and the same background**, and the compressed state is
 * dropped. Nothing about the nav itself changes at any scroll position — no
 * height, no background, no opacity. The **only** thing that changes is
 * whether the `Cuéntanos tu proyecto` button is showing, because on the
 * landing it duplicates the one the Hero offers two steps below.
 *
 * `position: sticky`, not `fixed`: it keeps the nav in normal flow, so
 * `<main>` needs no compensating top padding and every section's top padding
 * stays `design y − nav height` (`rules.md` § R49). Either would need an
 * explicit level, because the Hero section is `position: relative` later in
 * the document — hence `--layer-nav`.
 *
 * ⚠️ **Known, and deliberately not fixed here.** The nav has **no background
 * of its own** — the ink base belongs to the layout root — so once the page
 * scrolls, content passes *underneath* the lockup and the links. `ui-map.md`
 * § 2 says the nav keeps "el mismo fondo", and its background today is none;
 * the compressed state that would have introduced `#1c1416a6` is what that
 * same decision dropped. This component implements what the document says and
 * does not invent a background. Reported as spec D-07 — **owner: Clau /
 * Roberto**. The fix, if they want one, is two utilities on the row
 * (`bg-glass-dark` and a blur), which is exactly what the dropped compressed
 * state would have supplied.
 */
interface Props {
  /** Proyectos and Nosotros. */
  items: ResolvedShellItem[]
  cta: ResolvedShellItem
  /**
   * Whether the call to action is showing. Resolved by `logic/`, like every
   * other value here: the component never asks which route it is on.
   *
   * Hidden means `visibility: hidden` as well as `opacity: 0` — opacity alone
   * would leave an invisible button focusable and clickable (spec FR-048).
   */
  showCta: boolean
  /** Resolved href for the lockup. */
  home: string
  locale: ShellLocale
  /** The equivalent route in the other locale, without a fragment. */
  localeSwitchHref: string
  /** The four destinations the mobile menu carries. */
  menuItems: ResolvedShellItem[]
  socials: ResolvedSocial[]
  /** Accessible names. Resolved by `logic/`, like every other string here. */
  navLabel: string
  menuLabel: string
  menuOpenLabel: string
  menuCloseLabel: string
}

const {
  items,
  cta,
  showCta,
  home,
  locale,
  localeSwitchHref,
  menuItems,
  socials,
  navLabel,
  menuLabel,
  menuOpenLabel,
  menuCloseLabel,
} = defineProps<Props>()

/**
 * The no-scripting override for the call to action, as a string.
 *
 * **It is a string because Vue's client template compiler refuses a literal
 * `<style>` inside a template** — *"Tags with side effect (`<script>` and
 * `<style>`) are ignored in client component templates"*, which is a hard
 * error, not a warning. The SSR compiler accepts it, so the mistake builds and
 * generates correctly and only fails when the component is compiled for the
 * client. `v-html` with a build-time constant is the way past it, and it is
 * the same mechanism `Lockup.vue` and `SocialIcon.vue` already use to inline
 * their SVGs.
 *
 * The class is **doubled** rather than marked `!important`: it has to beat
 * `.invisible` and `.opacity-0`, which are single-class utilities, and
 * repeating the class raises this to two-class specificity — the ordinary
 * cascade rather than an override of it. (Tailwind emits its utilities inside
 * `@layer utilities`, so an unlayered rule would win regardless; the doubled
 * class means this does not depend on that.)
 */
const NOSCRIPT_CTA_OVERRIDE =
  '<style>.site-nav__cta.site-nav__cta{opacity:1;visibility:visible}</style>'

const { isOpen, open, close } = useMobileMenu()

const menuTrigger = useTemplateRef<HTMLButtonElement>('menuTrigger')

/*
 * The hamburger appears only once scripting has run. Without it the menu
 * cannot open, and a control that looks operable and is not reads as a broken
 * site; every destination the menu offers also lives in the footer, which is
 * on every page and needs no scripting (spec FR-032).
 */
const isScriptingAvailable = ref(false)
onMounted(() => {
  isScriptingAvailable.value = true
})

/* Focus returns to the control that opened the menu. */
watch(isOpen, opened => {
  if (!opened) menuTrigger.value?.focus()
})
</script>

<template>
  <nav :aria-label="navLabel" class="site-nav sticky top-0">
    <!--
      Inert while the panel is up: the row underneath is covered visually, and
      without this it would still take focus and still be announced.
    -->
    <div
      :inert="isOpen"
      class="mx-auto flex max-w-shell-max items-center justify-between gap-nav-gap px-page py-nav-y"
    >
      <NuxtLink :to="home" class="text-bone-100 focus-visible:outline-red-400">
        <Lockup />
      </NuxtLink>

      <div class="flex items-center gap-nav-gap">
        <ul class="hidden items-center gap-nav-gap lg:flex">
          <li v-for="item in items" :key="item.label">
            <NuxtLink
              :to="item.href"
              :aria-current="item.current ? 'page' : undefined"
              class="font-instrument text-nav-link text-bone-300 focus-visible:outline-red-400"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>

        <!--
          No CTA below `lg`. It does not collapse into the menu either: on
          mobile the only call to action is the social row inside the open
          menu (`decisions-open.md`, 2026-09-06). This is a recorded decision,
          not an omission — please do not "fix" it. It is also why the reveal
          below is desktop-only: there is nothing to reveal at 390px.

          `visible`/`invisible` alongside the opacity: an invisible button that
          is still focusable and still clickable is not hidden (FR-048).
        -->
        <div
          class="site-nav__cta hidden lg:block"
          :class="showCta ? 'visible opacity-100' : 'invisible opacity-0'"
        >
          <BotonPrimario variant="nav" :href="cta.href">
            {{ cta.label }}
          </BotonPrimario>
        </div>

        <!--
          Without scripting the observer never runs, so the flag never changes
          and the landing's button would stay hidden forever. This is the whole
          no-JS path, and it is CSS rather than script on purpose: the button
          ships **hidden** in the landing's HTML so it cannot flash before the
          observer has an answer (FR-045), and a browser with scripting off
          overrides that instead (FR-046). Shipping it visible and hiding it on
          mount is exactly the flash FR-045 forbids.
        -->
        <noscript v-html="NOSCRIPT_CTA_OVERRIDE" />

        <LanguageToggle :locale="locale" :href="localeSwitchHref" />

        <!--
          `cursor-pointer` is declared because nothing else does: a native
          `<button>` gets `cursor: default` from the user agent and Tailwind's
          preflight sets no cursor at all (`docs/harness/findings.md` § R56).
          This one is unconditionally clickable — it only renders once scripting
          is available, and it opens the menu.
        -->
        <button
          v-if="isScriptingAvailable"
          ref="menuTrigger"
          type="button"
          :aria-label="menuOpenLabel"
          :aria-expanded="isOpen"
          class="inline-flex cursor-pointer flex-col items-center gap-burger-gap rounded-icon border border-glass-line bg-glass-dark px-burger-x py-burger-y focus-visible:outline-red-400 lg:hidden"
          @click="open"
        >
          <span
            class="h-burger-bar-h w-burger-bar-w rounded-burger-bar bg-bone-100"
          />
          <span
            class="h-burger-bar-h w-burger-bar-w rounded-burger-bar bg-bone-100"
          />
        </button>
      </div>
    </div>

    <!--
      `itemChosen` closes before the browser follows the link, so the scroll
      to the anchor happens with the panel already dismissed (spec FR-030).
    -->
    <MobileMenu
      :open="isOpen"
      :items="menuItems"
      :socials="socials"
      :home="home"
      :locale="locale"
      :locale-switch-href="localeSwitchHref"
      :label="menuLabel"
      :close-label="menuCloseLabel"
      @closed="close"
      @item-chosen="close"
    />
  </nav>
</template>

<style scoped>
/*
 * The pinned nav. `--layer-nav` is a positive level and it is not optional:
 * `sticky` makes this a positioned element, and the Hero section is
 * `position: relative` **later in the document**, so without a level the Hero
 * would paint over the nav.
 *
 * The three negative levels the background depends on are untouched, and the
 * nav is neither a section nor an ancestor of one, so nothing `rules.md`
 * §§ R28/R37 ask of a section changes (spec A-13).
 *
 * ⚠️ No height, no background and no opacity are declared here or anywhere
 * else on the nav, at any scroll position. That is the requirement, not an
 * omission (FR-042).
 */
.site-nav {
  z-index: var(--layer-nav);
}

/*
 * The fade, and the only animation this whole change introduces.
 *
 * It is written here rather than with `transition-opacity` +
 * `motion-reduce:transition-none` because a scoped rule carries the
 * component's data attribute and therefore **outranks** a utility of the same
 * class specificity: mixing the two would let this rule silently win over the
 * reduced-motion utility and keep animating for a visitor who asked not to be
 * animated. One place, one specificity. Same shape as
 * `CursorSpotlight.vue`'s own fade, which reads its own duration token.
 *
 * `visibility` is in the transition list on purpose: it interpolates
 * discretely and in the direction that matters — the button stays visible for
 * the whole fade out and becomes visible at the start of the fade in.
 */
.site-nav__cta {
  transition-property: opacity, visibility;
  transition-duration: var(--duration-nav-cta-fade);
  transition-timing-function: ease-out;
}

/*
 * Reduced motion drops the fade and keeps the appearing and disappearing:
 * hiding the button carries information — *the Hero already offers this* — and
 * the fade is decoration (FR-047).
 */
@media (prefers-reduced-motion: reduce) {
  .site-nav__cta {
    transition-property: none;
  }
}
</style>
