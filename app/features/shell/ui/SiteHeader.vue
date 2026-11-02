<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import type {
  ResolvedShellItem,
  ShellLocale,
} from '@/features/shell/data/types'
import { useMobileMenu } from '@/features/shell/logic/useMobileMenu'
import { useNavScrollReveal } from '@/features/shell/logic/useNavScrollReveal'
import Lockup from '@/shared/ui/Lockup.vue'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import LanguageToggle from './LanguageToggle.vue'
import MenuButton from './MenuButton.vue'
import NavLinkBar from './NavLinkBar.vue'

/**
 * The Muush 1.0 header (feature 43, spec FR-001…FR-014, contract § 3; pen
 * extract-43 §§ 2, 3, 5). One row whose arrangement swaps at `lg`:
 *
 * - below `lg`, the mobile bar: 60 tall, 16 from the top, inset by the
 *   gutter, radius 18, Negro 900 45 %, 1 px Blanco 12 %, blur 20, padding
 *   0 10 0 16; the isotipo, then the language and menu controls (gap 8).
 *   No CTA (pen extract-43 § 3).
 * - from `lg`, the floating nav: a transparent 1280 × 64 row 24 from the top
 *   with three slots (isotipo | link bar | language + CTA, gap 12). The
 *   first slot holds the isotipo alone, no wordmark (FR-059).
 *
 * The desktop row is a `1fr auto 1fr` grid (`grid-cols-cabecera`), not
 * `space-between`: the isotipo slot is narrower than the language + CTA
 * group, so `space-between` centred the link bar in the free space, off the
 * page centre. With two equal outer tracks the bar sits on the nav's centre,
 * which is the page centre (feature 44, FR-040; Roberto review 2026-11-02);
 * the isotipo justifies to the start of its track, the group to the end.
 *
 * One row rather than two copies keeps exactly one home link, one toggle
 * and one `<nav>` landmark in the document.
 *
 * ## Floating and hiding
 *
 * Fixed to the viewport, so a section's background runs under it (FR-009).
 * The header itself takes no pointer; only the bar (mobile) and the three
 * slots (desktop) do, so the page under the gaps stays clickable.
 * `useNavScrollReveal` hides it past 80 px going down and shows it on any
 * upward scroll (features 26 and 43); it never hides while the menu is
 * open. Hidden is `translate -100%` plus `opacity 0` at `--medio`, which is
 * 0 ms under reduced motion, and `motion-reduce:transition-none` besides.
 * Focus landing on a hidden control reveals it (FR-013).
 *
 * The menu button exists only once scripting runs (FR-008). When the menu
 * is dismissed (Cerrar, Esc, history, resize), focus returns to it; when it
 * closes because the visitor chose a link, focus follows the navigation.
 */
interface Props {
  items: ResolvedShellItem[]
  cta: ResolvedShellItem
  home: string
  homeLabel: string
  locale: ShellLocale
  localeSwitchHref: string
  localeSwitchLabel: string
  localeSwitchInPlace?: boolean
  navLabel: string
  menuOpenLabel: string
}

const {
  items,
  cta,
  home,
  homeLabel,
  locale,
  localeSwitchHref,
  localeSwitchLabel,
  localeSwitchInPlace = false,
  navLabel,
  menuOpenLabel,
} = defineProps<Props>()

const emit = defineEmits<{
  /** The visitor chose `locale` on a page that switches in place. */
  switchLocale: [locale: ShellLocale]
}>()

const { isOpen, lastCloseReason, open } = useMobileMenu()
const { isNavVisible, reveal } = useNavScrollReveal(isOpen)

const menuButton = useTemplateRef<{ focus: () => void }>('menuButton')

const isScriptingAvailable = ref(false)
onMounted(() => {
  isScriptingAvailable.value = true
})

watch(isOpen, async opened => {
  if (opened || lastCloseReason.value !== 'dismiss') return
  /* The header leaves `inert` in the same render; focus after it. */
  await nextTick()
  menuButton.value?.focus()
})
</script>

<template>
  <header
    :class="[
      'pointer-events-none fixed inset-x-0 top-0 z-40 px-gutter pt-header-top transition duration-(--medio) ease-muush motion-reduce:transition-none print:hidden lg:px-gutter-desktop lg:pt-header-top-desktop',
      isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
    ]"
    @focusin="reveal"
  >
    <nav
      :aria-label="navLabel"
      class="pointer-events-auto mx-auto flex h-header-alto max-w-contenido items-center justify-between lg:grid lg:grid-cols-cabecera rounded-header border border-linea bg-nav-fondo pr-header-fin pl-header-inicio backdrop-blur-header lg:pointer-events-none lg:h-header-alto-desktop lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    >
      <!--
        `aria-current` cleared on purpose (feature 44, FR-028; review-43c nit
        5): the router marks any exact-active link "current page", and on the
        home that would announce the logo as well as the Home item.
      -->
      <NuxtLink
        :to="home"
        :aria-label="homeLabel"
        :aria-current="undefined"
        class="pointer-events-auto inline-flex rounded-control foco lg:justify-self-start"
      >
        <!-- Isotipo only at every width, no wordmark (Roberto 2026-11-01,
             spec FR-059): the desktop .pen frame shows the full lockup; the
             footer keeps it. The link's name is the aria-label above. -->
        <Lockup form="isotipo" />
      </NuxtLink>

      <div class="pointer-events-auto hidden lg:block">
        <NavLinkBar :items="items" />
      </div>

      <div
        class="pointer-events-auto flex items-center gap-header-grupo-movil lg:justify-self-end lg:gap-header-grupo"
      >
        <LanguageToggle
          :locale="locale"
          :href="localeSwitchHref"
          :switch-label="localeSwitchLabel"
          :in-place="localeSwitchInPlace"
          @switch-in-place="emit('switchLocale', $event)"
        />
        <!--
          `aria-current` cleared on purpose: the router marks any link to the
          current path "current page", hash or not, and on the home page this
          one points at a section of it, not at the page itself.
        -->
        <span class="hidden lg:inline-flex">
          <PrimaryButton
            size="nav"
            :to="cta.href"
            :label="cta.label"
            :aria-current="undefined"
          />
        </span>
        <span v-if="isScriptingAvailable" class="inline-flex lg:hidden">
          <MenuButton
            ref="menuButton"
            kind="open"
            :label="menuOpenLabel"
            :expanded="isOpen"
            @click="open"
          />
        </span>
      </div>
    </nav>
  </header>
</template>
