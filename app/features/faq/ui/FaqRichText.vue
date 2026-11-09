<script setup lang="ts">
import type { FaqTextSegment } from '@/features/faq/data/types'

/**
 * A paragraph of Preguntas copy with its inline links (feature 51, spec
 * FR-007): an answer or the card text, already split by `logic/` into
 * plain runs, route links (`NuxtLink`) and the tracked `mailto:` link.
 * No `v-html`, no vue-i18n component: every string arrives resolved.
 *
 * Links keep the paragraph's colour and are underlined, so they read as
 * links without relying on colour (WCAG 1.4.1); the handoff draws them
 * plain. Hover brightens them to Blanco. Keyboard focus is the shared
 * `foco` ring.
 */
interface Props {
  segments: readonly FaqTextSegment[]
}

const { segments } = defineProps<Props>()

const LINK_CLASSES =
  'underline transition-colors duration-(--rapido) ease-muush hover:text-blanco foco'
</script>

<template>
  <p>
    <template v-for="(segment, index) in segments" :key="index">
      <NuxtLink
        v-if="segment.kind === 'link'"
        :to="segment.href"
        :class="LINK_CLASSES"
        >{{
          segment.text
        }}</NuxtLink
      ><a
        v-else-if="segment.kind === 'email'"
        v-bind="segment.trackAttrs"
        :href="segment.href"
        :class="LINK_CLASSES"
        >{{
          segment.text
        }}</a
      ><template v-else>{{ segment.text }}</template>
    </template>
  </p>
</template>
