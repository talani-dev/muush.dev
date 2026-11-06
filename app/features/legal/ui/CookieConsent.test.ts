import { mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick } from 'vue'
import { CONSENT_STORAGE_KEY } from '@/features/legal/data/cookieCategories'
import { CONSENT_COPY } from '@/features/legal/data/legalFixtures.testing'
import {
  resetCookieConsentState,
  useCookieConsent,
} from '@/features/legal/logic/useCookieConsent'
import CookieBanner from './CookieBanner.vue'
import CookieConsent from './CookieConsent.vue'
import CookiePreferences from './CookiePreferences.vue'

/*
 * The host's wiring (feature 48, review S2): the copy composable is stubbed
 * (it needs the Nuxt i18n runtime); the consent state is the real
 * module-scoped `useCookieConsent`, because "Cambiar mis preferencias"
 * reaching this dialog through that shared state is what is under test.
 */
vi.mock('@/features/legal/logic/useCookieConsentContent', () => ({
  useCookieConsentContent: () => computed(() => CONSENT_COPY.es),
}))

/* happy-dom's `<dialog>` may lack the modal API; these only set `open`. */
beforeAll(() => {
  const proto = HTMLDialogElement.prototype
  proto.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  proto.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
})

function render() {
  return mount(CookieConsent, { attachTo: document.body })
}

function store(advertising: boolean) {
  localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      decidedAt: '2026-11-05T12:00:00.000Z',
      categories: { advertising },
    })
  )
}

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCookieConsentState()
  })

  it('should show the banner and keep the dialog closed when no choice is stored', () => {
    const wrapper = render()

    expect(wrapper.findComponent(CookieBanner).isVisible()).toBe(true)
    expect(wrapper.findComponent(CookiePreferences).props('open')).toBe(false)
    wrapper.unmount()
  })

  it('should hide the banner but keep it mounted while the dialog is open', async () => {
    const wrapper = render()

    await wrapper.findComponent(CookieBanner).vm.$emit('customize')

    const banner = wrapper.findComponent(CookieBanner)
    expect(banner.exists()).toBe(true)
    expect(banner.isVisible()).toBe(false)
    expect(wrapper.findComponent(CookiePreferences).props('open')).toBe(true)
    wrapper.unmount()
  })

  it('should show the banner again when the dialog is dismissed without a choice', async () => {
    const wrapper = render()

    await wrapper.findComponent(CookieBanner).vm.$emit('customize')
    await wrapper.findComponent(CookiePreferences).vm.$emit('close')

    expect(wrapper.findComponent(CookieBanner).isVisible()).toBe(true)
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull()
    wrapper.unmount()
  })

  it('should remove the banner once a choice exists', async () => {
    const wrapper = render()

    await wrapper.findComponent(CookieBanner).vm.$emit('reject-all')

    expect(wrapper.findComponent(CookieBanner).exists()).toBe(false)
    expect(useCookieConsent().hasDecided.value).toBe(true)
    wrapper.unmount()
  })

  it('should render no banner when a choice was already stored', () => {
    store(false)
    const wrapper = render()

    expect(wrapper.findComponent(CookieBanner).exists()).toBe(false)
    wrapper.unmount()
  })

  it('should pass all-off to the dialog when no choice is stored', () => {
    const wrapper = render()

    expect(wrapper.findComponent(CookiePreferences).props('choice')).toEqual({
      advertising: false,
    })
    wrapper.unmount()
  })

  it('should pass the stored choice to the dialog when one exists', () => {
    store(true)
    const wrapper = render()

    expect(wrapper.findComponent(CookiePreferences).props('choice')).toEqual({
      advertising: true,
    })
    wrapper.unmount()
  })

  it('should reopen the dialog when another caller opens the shared preferences', async () => {
    /* "Cambiar mis preferencias" on the privacy page calls this. */
    store(true)
    const wrapper = render()

    useCookieConsent().openPreferences()
    await nextTick()

    const preferences = wrapper.findComponent(CookiePreferences)
    expect(preferences.props('open')).toBe(true)
    expect((preferences.find('dialog').element as HTMLDialogElement).open).toBe(
      true
    )
    expect(wrapper.findComponent(CookieBanner).exists()).toBe(false)
    wrapper.unmount()
  })

  it('should store the saved choice and close the dialog when saved', async () => {
    const wrapper = render()

    await wrapper.findComponent(CookieBanner).vm.$emit('customize')
    await wrapper
      .findComponent(CookiePreferences)
      .vm.$emit('save', { advertising: true })

    expect(useCookieConsent().isGranted('advertising')).toBe(true)
    expect(wrapper.findComponent(CookiePreferences).props('open')).toBe(false)
    expect(wrapper.findComponent(CookieBanner).exists()).toBe(false)
    wrapper.unmount()
  })
})
