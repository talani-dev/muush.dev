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
 * (spec FR-047). The nav is static, not sticky — `decisions-open.md` #5 is
 * open and has no frame for a compressed state (spec A-05).
 */
interface Props {
  /** Proyectos and Nosotros. */
  items: ResolvedShellItem[]
  cta: ResolvedShellItem
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
  <nav :aria-label="navLabel">
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
          not an omission — please do not "fix" it.
        -->
        <div class="hidden lg:block">
          <BotonPrimario variant="nav" :href="cta.href">
            {{ cta.label }}
          </BotonPrimario>
        </div>

        <LanguageToggle :locale="locale" :href="localeSwitchHref" />

        <button
          v-if="isScriptingAvailable"
          ref="menuTrigger"
          type="button"
          :aria-label="menuOpenLabel"
          :aria-expanded="isOpen"
          class="inline-flex flex-col items-center gap-burger-gap rounded-icon border border-glass-line bg-glass-dark px-burger-x py-burger-y focus-visible:outline-red-400 lg:hidden"
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
