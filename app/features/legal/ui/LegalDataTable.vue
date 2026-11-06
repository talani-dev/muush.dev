<script setup lang="ts">
/**
 * LegalDataTable — "Qué datos recabamos" (feature 48, pen-extract-48 § 3).
 *
 * From `md` a two-column table: rows with a Carbón 700 bottom rule,
 * padding 14 / 0, gap 24, the "where" column 190 wide in 600. Below `md`
 * the `.pen` (`XaxDq`) stacks the same rows as cards: Negro 900, radius 22,
 * a 1 px Carbón 700 stroke, padding 18, gap 6, 10 apart.
 *
 * One `<table>` serves both: below `md` its rows become blocks, so the
 * cards keep the row/cell semantics a screen reader announces. The `.pen`
 * draws no column headings, so each row is labelled by its own "where"
 * cell (`th scope="row"`). Presentational.
 */
interface Props {
  rows: { where: string; data: string }[]
}

const { rows } = defineProps<Props>()
</script>

<template>
  <table class="block w-full md:table">
    <tbody
      class="flex flex-col gap-legal-tarjetas-gap md:table-row-group md:gap-0"
    >
      <tr
        v-for="row in rows"
        :key="row.where"
        class="flex flex-col gap-legal-tarjeta-gap rounded-tarjeta bg-negro-900 p-legal-tarjeta inset-ring inset-ring-carbon-700 md:table-row md:rounded-none md:bg-transparent md:p-0 md:inset-ring-0"
      >
        <th
          scope="row"
          class="block text-left align-top font-texto text-legal-donde text-blanco md:table-cell md:w-legal-donde md:border-b md:border-carbon-700 md:py-legal-fila-y md:pe-legal-fila-gap"
        >
          {{ row.where }}
        </th>
        <td
          class="block align-top font-texto text-legal-datos text-blanco md:table-cell md:border-b md:border-carbon-700 md:py-legal-fila-y"
        >
          {{ row.data }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
