import { computed, nextTick, readonly, ref, shallowRef } from 'vue'
import {
  CONSENT_STORAGE_KEY,
  type ConsentRecord,
  type CookieChoice,
  type OptionalCookieCategory,
} from '@/features/legal/data/cookieCategories'
import {
  choiceForAll,
  createConsentRecord,
  parseConsentRecord,
} from './consentRecord'

/**
 * The visitor's cookie choice and the preferences dialog's open state
 * (feature 48). The one seam feature 49 reads before loading Meta Pixel or
 * Google Analytics: `isGranted('advertising')`, or a `watch` on `consent`.
 * Feature 48 itself loads no tracking script.
 *
 * **Module-scoped on purpose**, like `useMobileMenu`: a document has one
 * banner, one dialog and one choice, and the banner, the dialog and the
 * privacy page's "Cambiar mis preferencias" button must agree on them.
 *
 * **Client only.** The record is read from `localStorage` on the first call
 * in the browser. During prerendering nothing is read and `hasDecided` is
 * `false`, which is why the banner renders inside `<ClientOnly>`: a
 * returning visitor never sees it flash from the static HTML.
 *
 * If storage is unavailable (blocked, private mode, quota), the choice still
 * holds for the rest of the visit; it is just not remembered.
 */
const record = shallowRef<ConsentRecord | null>(null)
const preferencesOpen = ref(false)
let loaded = false
/** The control that opened the dialog, focused again when it closes. */
let returnFocusTo: HTMLElement | null = null

function browserStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function loadOnce() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    record.value = parseConsentRecord(
      browserStorage()?.getItem(CONSENT_STORAGE_KEY) ?? null
    )
  } catch {
    record.value = null
  }
}

function persist(next: ConsentRecord) {
  try {
    browserStorage()?.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* Not remembered across visits; the in-memory choice still applies. */
  }
}

function closePreferences() {
  if (!preferencesOpen.value) return
  preferencesOpen.value = false
  const target = returnFocusTo
  returnFocusTo = null
  void nextTick(() => {
    if (target?.isConnected) target.focus()
  })
}

function openPreferences(trigger?: HTMLElement | null) {
  const active = typeof document === 'undefined' ? null : document.activeElement
  returnFocusTo = trigger ?? (active instanceof HTMLElement ? active : null)
  preferencesOpen.value = true
}

/** Stores the choice and closes the dialog: the banner then disappears. */
function saveChoice(choice: CookieChoice) {
  const next = createConsentRecord(choice, new Date())
  record.value = next
  persist(next)
  closePreferences()
}

export function useCookieConsent() {
  loadOnce()
  return {
    consent: readonly(record),
    hasDecided: computed(() => record.value !== null),
    isGranted: (category: OptionalCookieCategory): boolean =>
      record.value?.categories[category] ?? false,
    preferencesOpen: readonly(preferencesOpen),
    openPreferences,
    closePreferences,
    saveChoice,
    acceptAll: () => saveChoice(choiceForAll(true)),
    rejectAll: () => saveChoice(choiceForAll(false)),
  }
}

/**
 * Tests only: the state is module-scoped, so each test starts from a
 * document that has not read storage yet (findings.md § R43).
 */
export function resetCookieConsentState() {
  record.value = null
  preferencesOpen.value = false
  loaded = false
  returnFocusTo = null
}
