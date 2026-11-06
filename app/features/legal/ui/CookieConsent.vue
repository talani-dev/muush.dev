<script setup lang="ts">
import { computed } from 'vue'
import { choiceForAll } from '@/features/legal/logic/consentRecord'
import { useCookieConsent } from '@/features/legal/logic/useCookieConsent'
import { useCookieConsentContent } from '@/features/legal/logic/useCookieConsentContent'
import CookieBanner from './CookieBanner.vue'
import CookiePreferences from './CookiePreferences.vue'

/**
 * CookieConsent — the banner and the preferences dialog, wired to the
 * visitor's stored choice (feature 48, pen-extract-48 § 4). The layout
 * renders it once, inside `<ClientOnly>`, so a returning visitor never
 * sees the banner flash from the prerendered HTML.
 *
 * - The banner shows until a choice is stored; "Personalizar" opens the
 *   dialog. While the dialog is open the banner is hidden, as in the
 *   `.pen`'s preferences frames, but stays mounted so focus can return to
 *   "Personalizar" when the dialog is dismissed.
 * - The dialog opens pre-filled with the stored choice (all off when there
 *   is none, the `.pen`'s default). Dismissing it saves nothing, so the
 *   banner stays if there is still no choice.
 * - Every saving action stores the choice and closes the dialog; focus
 *   goes back to the control that opened it, when it is still there.
 *
 * The privacy page's "Cambiar mis preferencias" opens the same dialog
 * through `useCookieConsent().openPreferences`. The banner enters with the
 * open menu's slide (`--menu-desliz`); with reduced motion `--medio` is 0
 * and it simply appears. No tracking script is loaded here: that is
 * feature 49, reading the same composable.
 */
const {
  consent,
  hasDecided,
  preferencesOpen,
  openPreferences,
  closePreferences,
  saveChoice,
  acceptAll,
  rejectAll,
} = useCookieConsent()
const copy = useCookieConsentContent()

const currentChoice = computed(
  () => consent.value?.categories ?? choiceForAll(false)
)
</script>

<template>
  <Transition
    appear
    enter-from-class="translate-y-(--menu-desliz) opacity-0"
    leave-to-class="translate-y-(--menu-desliz) opacity-0"
    enter-active-class="transition duration-(--medio) ease-muush"
    leave-active-class="transition duration-(--medio) ease-muush"
  >
    <CookieBanner
      v-if="!hasDecided"
      v-show="!preferencesOpen"
      :copy="copy"
      @accept-all="acceptAll"
      @reject-all="rejectAll"
      @customize="openPreferences"
    />
  </Transition>
  <CookiePreferences
    :open="preferencesOpen"
    :copy="copy"
    :choice="currentChoice"
    @close="closePreferences"
    @save="saveChoice"
    @accept-all="acceptAll"
    @reject-all="rejectAll"
  />
</template>
