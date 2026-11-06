<script setup lang="ts">
/**
 * ChoiceButton — "Rechazar todo" / "Aceptar todo" (feature 48,
 * pen-extract-48 §§ 3; `aZd7S`, `c0bziG`, `Dzqir`, `cuynw`): Carbón 800,
 * a 1 px Blanco 20 % stroke inside the edge, the pill radius, padding
 * 10 / 18, Instrument Sans 14 / 500 Blanco. Both choices weigh the same,
 * as drawn. Hover is the handoff's brightness step; the `.pen` draws no
 * states. Presentational.
 */
interface Props {
  label: string
}

const { label } = defineProps<Props>()

defineEmits<{ choose: [] }>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center whitespace-nowrap rounded-pill bg-carbon-800 px-cookies-boton-x py-cookies-boton-y font-texto text-cookies-boton text-blanco inset-ring inset-ring-linea-fuerte transition duration-(--rapido) ease-muush hover:brightness-(--btn-brillo) active:scale-(--btn-presion) foco"
    @click="$emit('choose')"
  >
    {{ label }}
  </button>
</template>
