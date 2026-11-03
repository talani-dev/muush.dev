<script setup lang="ts">
import type { NuxtError } from '#app'
import {
  StatusSection,
  useNotFoundContent,
  useNotFoundDocument,
} from '@/features/shell'

/**
 * Nuxt's error page, rendered for every error the site can reach — on a
 * static site that is a missing route (feature 36, spec A-03). Prerendered
 * once per locale as `/es/404` and `/en/404` (`nuxt.config.ts`,
 * `NOT_FOUND_ROUTES`).
 *
 * A thin wrapper (Constitution Article I): the shell owns the content, the
 * head and the nav's behaviour while an error is shown. Since feature 46
 * the body is the Muush 1.0 `StatusSection` (the block Preguntas uses too);
 * every feature 36/39 behaviour (document per locale, noindex, in-place
 * language switch) is untouched.
 */

// Declared so Nuxt's `error` prop does not fall through onto the root as an
// attribute (specs/036-not-found-page/research.md R9 F32). Unused otherwise:
// the page renders the same content for every error.
defineProps<{ error: NuxtError }>()

const content = useNotFoundContent()
useNotFoundDocument()
</script>

<template>
  <NuxtLayout>
    <StatusSection v-bind="content" />
  </NuxtLayout>
</template>
