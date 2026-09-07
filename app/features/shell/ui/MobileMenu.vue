<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import closeGlyph from '@/assets/icons/x.svg?raw'
import type {
  ResolvedShellItem,
  ResolvedSocial,
  ShellLocale,
} from '@/features/shell/data/types'
import Lockup from '@/shared/ui/Lockup.vue'
import SocialIcon from '@/shared/ui/SocialIcon.vue'
import LanguageToggle from './LanguageToggle.vue'

/**
 * The open mobile menu of `design-extract.md` § 9.bis: a full-viewport
 * dark-glass panel carrying the same nav row as the closed nav — with a close
 * control in place of the hamburger — then the four destinations, the divider
 * and the three social buttons.
 *
 * On mobile this is the *only* navigation, and there is deliberately **no
 * CTA button** in it: on desktop the call to action is the nav's primary
 * button, and on mobile it is the social row (`decisions-open.md`,
 * 2026-09-06).
 *
 * The frame stacks a `BG · base` and a `Dotted paper` layer beneath the
 * glass. Neither is painted here: those are the page showing through the
 * blur, which is the frame's intent — repainting them would double them
 * (spec A-03).
 *
 * The frame's absolute coordinates (y176, y448, y493) are **not** reproduced
 * as positions. A real phone is rarely 844px tall, so they are translated to
 * flow spacing exactly as `docs/business/rules.md` § R12 derived them.
 */
interface Props {
  open: boolean
  items: ResolvedShellItem[]
  socials: ResolvedSocial[]
  /** Resolved href for the lockup. */
  home: string
  locale: ShellLocale
  /** The equivalent route in the other locale, without a fragment. */
  localeSwitchHref: string
  /**
   * Accessible name of the panel, and of the close control.
   *
   * Not in `contracts/components.md`, and added deliberately: a modal surface
   * and an icon-only button both need a name, and no user-facing string may
   * be written inside a component (Constitution Article VI). They arrive
   * resolved like every other string here.
   */
  label: string
  closeLabel: string
}

const {
  open,
  items,
  socials,
  home,
  locale,
  localeSwitchHref,
  label,
  closeLabel,
} = defineProps<Props>()

const emit = defineEmits<{
  /** Any of the triggers this component owns fired. */
  closed: []
  /**
   * An item was activated. The parent closes on this rather than the
   * component navigating itself, so the close completes before the page
   * scrolls to the anchor (spec FR-030).
   */
  itemChosen: [href: string]
}>()

const closeControl = useTemplateRef<HTMLButtonElement>('closeControl')

/* The panel is mounted on open, so this is where focus enters it. */
onMounted(() => closeControl.value?.focus())

function chooseItem(item: ResolvedShellItem) {
  if (!item.href) return
  emit('itemChosen', item.href)
}
</script>

<template>
  <div
    v-if="open"
    role="dialog"
    aria-modal="true"
    :aria-label="label"
    class="fixed inset-0 z-50 bg-glass-dark backdrop-blur-menu-panel"
  >
    <!--
      The same container as the closed nav row. It sits at the top edge of the
      panel so the item block below can start at the 176 the frame measures
      from that same edge.
    -->
    <div
      class="absolute inset-x-0 top-0 flex items-center justify-between gap-nav-gap px-page py-nav-y"
    >
      <NuxtLink
        :to="home"
        class="text-bone-100 focus-visible:outline-red-400"
        @click="emit('closed')"
      >
        <Lockup />
      </NuxtLink>

      <div class="flex items-center gap-nav-gap">
        <LanguageToggle :locale="locale" :href="localeSwitchHref" />

        <button
          ref="closeControl"
          type="button"
          :aria-label="closeLabel"
          class="inline-grid place-items-center rounded-icon border border-glass-line bg-glass-dark p-close-pad text-bone-100 focus-visible:outline-red-400"
          @click="emit('closed')"
        >
          <span
            aria-hidden="true"
            class="inline-flex size-close-glyph"
            v-html="closeGlyph"
          />
        </button>
      </div>
    </div>

    <div class="px-page pt-menu-top">
      <ul
        class="flex flex-col gap-menu-gap font-instrument text-menu-item text-bone-100"
      >
        <li v-for="item in items" :key="item.label">
          <NuxtLink
            :to="item.href"
            :aria-current="item.current ? 'page' : undefined"
            class="focus-visible:outline-red-400"
            @click="chooseItem(item)"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <hr class="mt-menu-divider-gap border-t border-divider-menu">

      <!--
        The only call to action on mobile. The row is centred rather than
        positioned at the frame's x109/171/233, which is the same 14px gap
        expressed as flow.
      -->
      <div
        class="mt-menu-social-gap flex justify-center gap-menu-social-row-gap"
      >
        <SocialIcon
          v-for="social in socials"
          :key="social.network"
          :network="social.network"
          :href="social.href"
          :label="social.label"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * `:deep()` is required, not stylistic: content injected by `v-html` is not
 * rewritten by Vue's scoped-style transform, so a plain `svg {}` rule would
 * never match it (docs/business/rules.md § R14). `100%`/`auto` are layout
 * keywords, not design values.
 */
:deep(svg) {
  width: 100%;
  height: auto;
}
</style>
