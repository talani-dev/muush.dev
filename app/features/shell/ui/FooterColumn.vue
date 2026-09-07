<script setup lang="ts">
import type { ResolvedShellItem } from '@/features/shell/data/types'

/**
 * One footer column: a red-300 title over its items, at the geometry of
 * `design-extract.md` § 10 · *FooterColumn*.
 *
 * This is the single place spec FR-039 is implemented. An item with no `href`
 * renders a `<span>`, never an `<a>` with a dead one: an anchor without an
 * href is not focusable and not announced as a link, but it still invites a
 * pointer, and the item is supposed to read as text. Three items are in that
 * state today — `Agenda una llamada`, `FAQ` and `Blog · próximamente` — and
 * they must read identically.
 *
 * `href === undefined` is the whole of it. The type makes the broken-link
 * state unrepresentable rather than merely discouraged.
 */
interface Props {
  title: string
  items: ResolvedShellItem[]
}

const { title, items } = defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-footer-col-gap">
    <h2 class="font-instrument text-footer-col-title text-red-300">
      {{ title }}
    </h2>

    <ul
      class="flex flex-col gap-footer-item-gap font-instrument text-footer-item text-ink-100"
    >
      <li v-for="item in items" :key="item.label">
        <a
          v-if="item.external"
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          class="focus-visible:outline-red-400"
        >
          {{ item.label }}
        </a>

        <!--
          `NuxtLink` also covers the `mailto:` item: it renders a plain anchor
          for anything carrying a protocol, and a mail link deliberately stays
          in the same browsing context — a new tab for it leaves the visitor
          on a blank page.
        -->
        <NuxtLink
          v-else-if="item.href"
          :to="item.href"
          :aria-current="item.current ? 'page' : undefined"
          class="focus-visible:outline-red-400"
        >
          {{ item.label }}
        </NuxtLink>

        <!--
          No destination: plain text, no pointer, no hover, no anchor element
          at all (spec FR-039). The two open decisions behind two of these
          items are Clau's and stay open; this renders their absence
          correctly rather than resolving them.
        -->
        <span v-else class="text-ink-300">{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>
