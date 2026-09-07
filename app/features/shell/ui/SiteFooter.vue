<script setup lang="ts">
import type { ResolvedFooterColumn } from '@/features/shell/data/types'
import Lockup from '@/shared/ui/Lockup.vue'
import FooterColumn from './FooterColumn.vue'

/**
 * The footer of `design-extract.md` § 9.bis: an ink-500 surface carrying the
 * brand block, four columns and the bottom bar. One responsive component, not
 * one per page — § 9.bis verified the footer is byte-identical between the
 * Landing and About frames in both viewports.
 *
 * Every `lg:` below changes **layout** and nothing else: four columns become
 * two rows of two, and the bottom bar's two texts stop sharing a row. No
 * `clamp()` can express a change of order and count; a size, padding, radius
 * or blur behind a breakpoint would be a real violation (spec FR-047).
 */
interface Props {
  /** Exactly four, in the order the design fixes. */
  columns: ResolvedFooterColumn[]
  /** Resolved href for the brand lockup. */
  home: string
  tagline: string
  category: string
  copyright: string
  location: string
}

const { columns, home, tagline, category, copyright, location } =
  defineProps<Props>()
</script>

<template>
  <footer class="bg-ink-500">
    <!--
      The cap includes the gutter, so the content box above 1440 is the same
      1280 the design frame draws rather than growing to 1440.
      ⚠️ The cap itself is UNVERIFIED — no frame exists wider than 1440 and no
      document states this behaviour (spec A-02, flagged for Clau).
    -->
    <div
      class="mx-auto flex max-w-shell-max flex-col gap-footer-gap px-page pt-footer-top pb-footer-bottom"
    >
      <!--
        Top row. `justify-between` and no declared horizontal gap, because the
        design over-constrains this row: Marca 340 + gap 80 + Columnas 912 =
        1332 against a 1280 content box. The gap is what yields — the brand
        block keeps its 340, the columns flex from a 180 basis, and whatever
        is left (28px at exactly 1440) becomes the separation
        (docs/business/rules.md § R24, spec FR-060). The vertical gap is
        declared on the y axis only, so it applies to the stacked arrangement
        and does nothing once the row is horizontal.
      -->
      <div
        class="flex flex-col gap-y-footer-gap lg:flex-row lg:justify-between"
      >
        <div
          class="flex flex-col gap-footer-brand-gap lg:w-footer-brand-w lg:shrink-0"
        >
          <NuxtLink
            :to="home"
            class="self-start text-bone-100 focus-visible:outline-red-400"
          >
            <Lockup />
          </NuxtLink>
          <p class="font-instrument text-footer-tagline text-ink-100">
            {{ tagline }}
          </p>
          <p class="font-instrument text-footer-category text-ink-300">
            {{ category }}
          </p>
        </div>

        <!--
          Two rows of two below `lg`, four across at and above it. The column
          gap is the design's own 20 → 64; the row gap is the container gap,
          which is what separates `Columnas 1` from `Columnas 2` in the mobile
          frame.
        -->
        <div
          class="grid grid-cols-2 gap-x-footer-cols-gap gap-y-footer-gap lg:flex lg:min-w-0"
        >
          <FooterColumn
            v-for="column in columns"
            :key="column.title"
            :title="column.title"
            :items="column.items"
            class="lg:basis-footer-col-w lg:min-w-0"
          />
        </div>
      </div>

      <!--
        Bottom bar. The two frames differ in arrangement, not only in size:
        one row apart at `lg`, stacked below it.
      -->
      <div class="border-t border-hairline-footer pt-footer-bar-gap">
        <div
          class="flex flex-col gap-y-footer-bar-stack font-instrument text-footer-bottom text-ink-300 lg:flex-row lg:justify-between"
        >
          <p>{{ copyright }}</p>
          <p>{{ location }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>
