<script setup lang="ts">
const { t } = useI18n()

useHead({ title: t('site.title') })
</script>

<template>
  <main class="bg-ink-500 text-bone-100 min-h-screen p-gutter">
    <h1 class="text-h2 font-instrument">{{ t('site.title') }}</h1>
  </main>
</template>
