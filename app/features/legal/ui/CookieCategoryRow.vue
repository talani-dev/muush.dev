<script setup lang="ts">
import type { ResolvedCookieCategory } from '@/features/legal/data/cookieCategories'
import ConsentSwitch from './ConsentSwitch.vue'

/**
 * CookieCategoryRow — one category of the cookie preferences (feature 48,
 * pen-extract-48 § 3, `vR0os` / `sB1jP`): a Carbón 700 rule on top,
 * padding 16 / 0, gap 16, centred; the name in Poppins 15 / 21 Blanco and
 * the detail 13 / 20 (`#B4B4B0`), gap 4. On the right, an always-on
 * category shows the "Siempre activas" pill (Carbón 800, Blanco 15 %
 * stroke, padding 6 / 12, 12 / 500); any other its switch.
 * Presentational.
 */
interface Props {
  category: ResolvedCookieCategory
  alwaysOn: string
  checked: boolean
}

const { category, alwaysOn, checked } = defineProps<Props>()

defineEmits<{ 'update:checked': [value: boolean] }>()
</script>

<template>
  <li
    class="flex items-center gap-cookie-categoria-gap border-t border-carbon-700 py-cookie-categoria-y"
  >
    <div class="flex min-w-0 flex-1 flex-col gap-cookie-categoria-texto-gap">
      <h3
        :id="`cookies-${category.id}`"
        class="font-titulo text-cookie-categoria text-blanco"
      >
        {{ category.name }}
      </h3>
      <p
        :id="`cookies-${category.id}-detalle`"
        class="font-texto text-cookie-categoria-detalle text-texto-cookies"
      >
        {{ category.detail }}
      </p>
    </div>
    <span
      v-if="category.required"
      class="shrink-0 whitespace-nowrap rounded-pill bg-carbon-800 px-siempre-x py-siempre-y font-texto text-siempre text-texto-cookies inset-ring inset-ring-blanco-15"
    >
      {{ alwaysOn }}
    </span>
    <ConsentSwitch
      v-else
      :checked="checked"
      :labelled-by="`cookies-${category.id}`"
      :described-by="`cookies-${category.id}-detalle`"
      @update:checked="$emit('update:checked', $event)"
    />
  </li>
</template>
