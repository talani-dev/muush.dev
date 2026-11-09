<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue'
import type {
  ResolvedShellItem,
  ResolvedSocial,
  ShellLocale,
} from '@/features/shell/data/types'
import { scrollToTopIfCurrent } from '@/features/shell/logic/scrollToTopIfCurrent'
import { useFocusTrap } from '@/shared/logic/useFocusTrap'
import Lockup from '@/shared/ui/Lockup.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import LanguageToggle from './LanguageToggle.vue'
import MenuButton from './MenuButton.vue'
import SocialLinks from './SocialLinks.vue'

/**
 * The full-screen mobile menu of Muush 1.0 (feature 43, spec FR-015…FR-023,
 * contract § 6; pen extract-43 § 4, frames `chQ4f` / `QpUCy`).
 *
 * Layers, bottom to top: the Negro 950 base, the listón (`mobileMenu`
 * preset, no poster: without WebGL the base and the glass show alone), the
 * Negro 950 70 % glass with a 24 px blur, and the content. The shader is
 * inside the `v-if`, so it runs only while the menu is open and releases
 * its context when it closes (FR-022).
 *
 * The top bar repeats the mobile header's, with "Cerrar" in place of the
 * menu button. Below it, from 150 px down: the links in Poppins 32 / 500
 * with no arrows (rows padding 16, gap 6), a 1 px Blanco 12 % divider and
 * the four social buttons. The vertical gaps reproduce the frame's y 440
 * and y 480 at 390 (tokens in `global.css`).
 *
 * A modal dialog with a name (FR-021). On open, focus moves to Cerrar and
 * Tab cycles inside (FR-020; the rest of the page is `inert`, set by the
 * layout). Every way out is an event; the layout decides the close reason:
 * `close` (Cerrar), `itemChosen` (a link, the logo or the language,
 * emitted before the browser follows it), `switchLocale` (the in-place
 * switch of the 404).
 *
 * The fade and the links' 8 px rise staggered by 40 ms follow the handoff;
 * under reduced motion both durations are 0 (FR-023).
 */
interface Props {
  open: boolean
  items: ResolvedShellItem[]
  socials: ResolvedSocial[]
  home: string
  homeLabel: string
  locale: ShellLocale
  localeSwitchHref: string
  localeSwitchLabel: string
  localeSwitchInPlace?: boolean
  label: string
  closeLabel: string
}

const {
  open,
  items,
  socials,
  home,
  homeLabel,
  locale,
  localeSwitchHref,
  localeSwitchLabel,
  localeSwitchInPlace = false,
  label,
  closeLabel,
} = defineProps<Props>()

const emit = defineEmits<{
  close: []
  itemChosen: [href: string | undefined]
  switchLocale: [locale: ShellLocale]
}>()

const dialog = useTemplateRef<HTMLElement>('dialog')
const closeButton = useTemplateRef<{ focus: () => void }>('closeButton')

useFocusTrap(dialog, () => open)

/*
 * The layout closes the menu on `itemChosen`, which restores the scroll it
 * locked; only then can the Home item scroll to the top of its own page.
 */
function chooseItem(item: ResolvedShellItem) {
  emit('itemChosen', item.href)
  if (item.scrollsToTop) scrollToTopIfCurrent(item.href)
}

watch(
  () => open,
  async opened => {
    if (!opened) return
    await nextTick()
    closeButton.value?.focus()
  },
  { immediate: true }
)
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-(--medio) ease-muush"
    leave-active-class="transition-opacity duration-(--medio) ease-muush"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      ref="dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="label"
      class="fixed inset-0 z-50 isolate overflow-y-auto bg-negro-950 print:hidden lg:hidden"
    >
      <ShaderBackground preset="mobileMenu" />
      <div
        aria-hidden="true"
        class="absolute inset-0 z-0 bg-menu-vidrio backdrop-blur-cristal"
      />

      <div class="relative z-10 px-gutter pt-header-top">
        <div
          class="flex h-header-alto items-center justify-between rounded-header border border-linea bg-nav-fondo pr-header-fin pl-header-inicio backdrop-blur-header"
        >
          <!-- No `aria-current` on the logo (feature 44, FR-028; see SiteHeader). -->
          <NuxtLink
            :to="home"
            :aria-label="homeLabel"
            :aria-current="undefined"
            class="inline-flex rounded-control foco"
            @click="emit('itemChosen', home)"
          >
            <Lockup form="isotipo" />
          </NuxtLink>
          <div class="flex items-center gap-header-grupo-movil">
            <LanguageToggle
              variant="menu"
              :locale="locale"
              :href="localeSwitchHref"
              :switch-label="localeSwitchLabel"
              :in-place="localeSwitchInPlace"
              @click="emit('itemChosen', localeSwitchHref)"
              @switch-in-place="emit('switchLocale', $event)"
            />
            <MenuButton
              ref="closeButton"
              kind="close"
              :label="closeLabel"
              @click="emit('close')"
            />
          </div>
        </div>

        <ul class="mt-menu-lista flex flex-col gap-menu-filas">
          <li
            v-for="(item, index) in items"
            :key="item.label"
            class="menu-enlace"
            :style="{ '--orden': index }"
          >
            <NuxtLink
              :to="item.href"
              :aria-current="item.current === 'page' ? 'page' : undefined"
              class="block rounded-control py-menu-fila font-titulo text-menu text-blanco foco"
              @click="chooseItem(item)"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>

        <div aria-hidden="true" class="mt-menu-divisor h-px bg-linea" />

        <SocialLinks class="mt-menu-redes" :socials="socials" size="menu" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/*
 * The handoff's link entrance (`componentes.css`): rise `--menu-desliz` and
 * fade in over `--medio`, each link `--menu-escalon` after the previous.
 * Both tokens are 0 under reduced motion (global.css), so there the links
 * are simply there.
 */
.menu-enlace {
  animation: menu-enlace-entrada var(--medio) var(--ease) both;
  animation-delay: calc(var(--orden) * var(--menu-escalon));
}

@keyframes menu-enlace-entrada {
  from {
    opacity: 0;
    translate: 0 var(--menu-desliz);
  }
}
</style>
