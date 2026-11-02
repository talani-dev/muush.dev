<script setup lang="ts">
/**
 * FormNotice — the "Aviso" of "Error al enviar" (feature 45, spec FR-013,
 * FR-034; pen extract-45 §§ 3, 8): full width, Red muush 12 % fill, a flat
 * Red 40 % edge, radius 10, an 8 px Red muush dot before the text, Blanco
 * text. Mobile padding 12 / 14, gap 10, 13 / 1.45; desktop 14 / 16, gap 12,
 * 14 / 1.45.
 *
 * `role="alert"`: it is announced when it appears (spec US3-3). The dot is
 * centred on the first line (`h-lh`), whatever the size. Content by slot.
 */
</script>

<template>
  <div
    role="alert"
    class="relative flex w-full items-start gap-aviso-gap rounded-aviso bg-rojo-12 px-aviso-x py-aviso-y font-texto text-aviso text-blanco borde-luz borde-aviso md:gap-aviso-gap-escritorio md:px-aviso-x-escritorio md:py-aviso-y-escritorio md:text-aviso-escritorio"
  >
    <span aria-hidden="true" class="flex h-lh shrink-0 items-center">
      <span class="size-aviso-punto rounded-full bg-red-muush-500" />
    </span>
    <div class="min-w-0 flex-1">
      <slot />
    </div>
  </div>
</template>
