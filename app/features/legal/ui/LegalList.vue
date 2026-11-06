<script setup lang="ts">
/**
 * LegalList — a legal section's list (feature 48, pen-extract-48 § 3).
 *
 * `bullets`: each item behind the 6 px Red muush dot, 11 → 12 px from the
 * item's top so it sits on the first line. `steps`: the ARCO request, a
 * real ordered list whose numbers are drawn in Red muush (Poppins 15 → 16,
 * 16 → 18 wide); the native marker is replaced, not duplicated.
 * Gap 10 between items, 12 → 14 between marker and text. Presentational.
 */
interface Props {
  kind: 'bullets' | 'steps'
  items: string[]
}

const { kind, items } = defineProps<Props>()
</script>

<template>
  <component
    :is="kind === 'steps' ? 'ol' : 'ul'"
    class="flex flex-col gap-legal-lista-gap"
  >
    <li
      v-for="(item, index) in items"
      :key="item"
      class="flex items-start gap-legal-item-gap"
    >
      <span
        v-if="kind === 'steps'"
        aria-hidden="true"
        class="w-legal-numero shrink-0 font-titulo text-legal-numero text-red-muush-500"
        >{{
          index + 1
        }}</span
      >
      <span
        v-else
        aria-hidden="true"
        class="w-legal-punto shrink-0 pt-legal-punto-arriba"
      >
        <span class="block size-legal-punto rounded-full bg-red-muush-500" />
      </span>
      <span class="min-w-0 flex-1">{{ item }}</span>
    </li>
  </component>
</template>
