<script setup lang="ts">
import type { ResolvedShellItem } from '@/features/shell/data/types'
import { scrollToTopIfCurrent } from '@/features/shell/logic/scrollToTopIfCurrent'

/**
 * One footer entry, rendered by what its destination is (feature 43, spec
 * FR-031…FR-034, contract § 7), so both footers say the same thing about
 * the same entry:
 *
 * - external: an `<a>` opening a new tab with the opener severed;
 * - internal or `mailto:`: a `NuxtLink` (it renders a plain anchor for a
 *   protocol, and a mail link stays in the same tab);
 * - no destination ("Blog · próximamente"): a `<span>`, never an anchor
 *   without `href`.
 *
 * Classes passed by the caller land on whichever element renders. The Home
 * item (`scrollsToTop`) scrolls to the top when clicked on its own page. A
 * CTA's `data-track*` attributes (feature 49) go on its link, never on the
 * text-only `<span>`.
 */
interface Props {
  item: ResolvedShellItem
}

const { item } = defineProps<Props>()
</script>

<template>
  <a
    v-if="item.external && item.href"
    :href="item.href"
    target="_blank"
    rel="noopener noreferrer"
    v-bind="item.trackAttrs"
  >
    <slot>{{ item.label }}</slot>
  </a>
  <NuxtLink
    v-else-if="item.href"
    :to="item.href"
    :aria-current="item.current === 'page' ? 'page' : undefined"
    v-bind="item.trackAttrs"
    @click="item.scrollsToTop && scrollToTopIfCurrent(item.href)"
  >
    <slot>{{ item.label }}</slot>
  </NuxtLink>
  <span v-else><slot>{{ item.label }}</slot></span>
</template>
