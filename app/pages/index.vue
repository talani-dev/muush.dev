<script setup lang="ts">
const { t } = useI18n()

useHead({ title: t('site.title') })
</script>

<template>
  <h1 class="font-instrument text-h2 text-bone-100">{{ t('site.title') }}</h1>
</template>
