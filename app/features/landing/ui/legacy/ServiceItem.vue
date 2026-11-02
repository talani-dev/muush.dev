<script setup lang="ts">
/**
 * One service area: a name and a brief, **no glass surface and no reveal
 * state** — `services.md` is explicit that the section has "sin tarjetas."
 *
 * It shares nothing with `PurposeCard`, whose entire contract is a glass
 * surface plus a two-stage CSS reveal: forcing a shared base between that and
 * an always-visible plain block would need a `variant`/`mode` prop, which is
 * exactly the speculative branching Article VIII forbids before a second real
 * consumer asks for it.
 *
 * The radar that always accompanies it (`design-extract.md` § 10 · ServiceItem)
 * is a sibling in both compositions, not a child here — desktop positions it
 * independently from the text block (spec FR-007) and mobile centres it on
 * the row (spec FR-012), so neither placement belongs inside this component.
 *
 * Colour is **not documented anywhere** for either role — `design-extract.md`
 * § 9 gives only size/weight for "Nombre de servicio" and "Brief de servicio".
 * `bone-100` / `ink-100` mirror the Hero's headline/subhead pair, which is the
 * same primary/secondary split already established for this typography scale.
 */
interface Props {
  name: string
  brief: string
}

const { name, brief } = defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-services-item-gap">
    <p class="font-instrument text-service-name text-bone-100">{{ name }}</p>
    <p class="font-instrument text-service-brief text-ink-100">{{ brief }}</p>
  </div>
</template>
