import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rememberLocalePreference } from '@/features/shell/logic/localePreference'
import { clearLocalePreferenceCookie } from '@/features/shell/logic/localePreference.testing'
import LanguageToggle from './LanguageToggle.vue'

/* Feature 33: the writer is wrapped in a spy that still calls through, so
   one suite can count calls and another can read the real cookie jar. */
vi.mock('@/features/shell/logic/localePreference', async importOriginal => {
  const actual =
    await importOriginal<
      typeof import('@/features/shell/logic/localePreference')
    >()
  return {
    ...actual,
    rememberLocalePreference: vi.fn(actual.rememberLocalePreference),
  }
})

const ENGLISH_ABOUT = '/en/about'
const SWITCH_TO_ENGLISH = 'Cambiar a inglés'

function mountToggle(overrides: Partial<{ locale: 'es' | 'en' }> = {}) {
  return mount(LanguageToggle, {
    props: {
      locale: 'es' as const,
      href: ENGLISH_ABOUT,
      switchLabel: SWITCH_TO_ENGLISH,
      ...overrides,
    },
  })
}

describe('LanguageToggle', () => {
  afterEach(() => {
    window.location.hash = ''
    vi.restoreAllMocks()
  })

  it('should render exactly one circular control when rendered', () => {
    /* feature 21 — the toggle is a single circle, not the old `ES / EN`
       pair with a divider (spec FR-015, User Story 4). */
    const wrapper = mountToggle()

    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(wrapper.findAll('span')).toHaveLength(0)
  })

  it('should render only the active locale code, never the inactive one', () => {
    const text = mountToggle().text()

    expect(text).toBe('ES')
    expect(text).not.toContain('EN')
    expect(text).not.toContain('/')
  })

  it('should render the active locale at weight 600 in bone when rendered', () => {
    const link = mountToggle().find('a')

    expect(link.classes()).toContain('text-bone-100')
    expect(link.classes()).toContain('font-semibold')
  })

  it('should carry the circular glass surface when rendered', () => {
    /* Reuses the existing glass/pill vocabulary — no new token or variant
       (spec FR-002, FR-022). */
    const link = mountToggle().find('a')

    for (const utility of [
      'size-lang-circle',
      'rounded-full',
      'bg-glass-dark',
      'border-glass-line',
    ]) {
      expect(link.classes(), utility).toContain(utility)
    }
  })

  it('should point at the anchorless destination when rendered', () => {
    const link = mountToggle().find('a')

    expect(link.attributes('href')).toBe(ENGLISH_ABOUT)
    expect(link.attributes('hreflang')).toBe('en')
  })

  it('should describe the destination locale in the accessible name, not just echo the code', () => {
    /* spec FR-018, User Story 4 Scenario 5 — a screen reader user does not
       learn what activating the control does from a code that already
       announces which locale is active. */
    const link = mountToggle().find('a')

    expect(link.attributes('aria-label')).toBe(SWITCH_TO_ENGLISH)
  })

  it('should resolve the accessible name for the other direction when the active locale is English', () => {
    const link = mountToggle({ locale: 'en' }).find('a')

    expect(link.attributes('hreflang')).toBe('es')
    expect(link.attributes('lang')).toBe('es')
  })

  it('should carry the fragment when a plain click happens with a hash', async () => {
    const assign = vi
      .spyOn(window.location, 'assign')
      .mockImplementation(() => undefined)
    window.location.hash = '#work'

    await mountToggle().find('a').trigger('click', { button: 0 })

    expect(assign).toHaveBeenCalledWith(`${ENGLISH_ABOUT}#work`)
  })

  it('should leave the plain link alone when no hash is present', async () => {
    const assign = vi
      .spyOn(window.location, 'assign')
      .mockImplementation(() => undefined)

    await mountToggle().find('a').trigger('click', { button: 0 })

    expect(assign).not.toHaveBeenCalled()
  })

  it('should not intercept the click when a modifier key is held', async () => {
    const assign = vi
      .spyOn(window.location, 'assign')
      .mockImplementation(() => undefined)
    window.location.hash = '#work'

    await mountToggle().find('a').trigger('click', { button: 0, metaKey: true })

    expect(assign).not.toHaveBeenCalled()
  })

  it('should not intercept the click when it is not the primary button', async () => {
    const assign = vi
      .spyOn(window.location, 'assign')
      .mockImplementation(() => undefined)
    window.location.hash = '#work'

    await mountToggle().find('a').trigger('click', { button: 1 })

    expect(assign).not.toHaveBeenCalled()
  })
})

describe('LanguageToggle · locale preference (feature 33)', () => {
  const remember = vi.mocked(rememberLocalePreference)

  beforeEach(() => {
    remember.mockClear()
    clearLocalePreferenceCookie()
  })

  afterEach(() => {
    window.location.hash = ''
    clearLocalePreferenceCookie()
  })

  it('should record English once when a plain click leaves the Spanish page', async () => {
    await mountToggle({ locale: 'es' })
      .find('a')
      .trigger('click', { button: 0 })

    expect(remember).toHaveBeenCalledTimes(1)
    expect(remember).toHaveBeenCalledWith('en')
  })

  it('should record Spanish once when a plain click leaves the English page', async () => {
    await mountToggle({ locale: 'en' })
      .find('a')
      .trigger('click', { button: 0 })

    expect(remember).toHaveBeenCalledTimes(1)
    expect(remember).toHaveBeenCalledWith('es')
  })

  it('should still record the destination when a modifier key opens a new tab', async () => {
    /* contract locale-preference-cookie.md § 2: a ⌘/Ctrl-click is an
       explicit choice too, so the write precedes the modifier early return. */
    await mountToggle().find('a').trigger('click', { button: 0, metaKey: true })
    await mountToggle().find('a').trigger('click', { button: 0, ctrlKey: true })

    expect(remember).toHaveBeenCalledTimes(2)
    expect(remember).toHaveBeenNthCalledWith(1, 'en')
    expect(remember).toHaveBeenNthCalledWith(2, 'en')
  })

  it('should record once and still carry the fragment when a hash is present', async () => {
    const assign = vi
      .spyOn(window.location, 'assign')
      .mockImplementation(() => undefined)
    window.location.hash = '#work'

    await mountToggle().find('a').trigger('click', { button: 0 })

    expect(remember).toHaveBeenCalledTimes(1)
    expect(remember).toHaveBeenCalledWith('en')
    expect(assign).toHaveBeenCalledWith(`${ENGLISH_ABOUT}#work`)
    assign.mockRestore()
  })

  it('should never record a preference when the toggle is only rendered', () => {
    mountToggle()
    mountToggle({ locale: 'en' })

    expect(remember).not.toHaveBeenCalled()
    expect(document.cookie).not.toContain('muush_locale')
  })

  it('should leave the preference in the real cookie jar when clicked', async () => {
    /* happy-dom reads back name=value only; the attributes are asserted on
       the serialised string in logic/localePreference.test.ts. */
    await mountToggle().find('a').trigger('click', { button: 0 })

    expect(document.cookie).toContain('muush_locale=en')
  })
})

describe('LanguageToggle · in place on the not-found page (feature 39)', () => {
  const remember = vi.mocked(rememberLocalePreference)
  const ENGLISH_HOME = '/en'

  function mountInPlace(locale: 'es' | 'en' = 'es') {
    return mount(LanguageToggle, {
      props: {
        locale,
        href: locale === 'es' ? ENGLISH_HOME : '/es',
        switchLabel: SWITCH_TO_ENGLISH,
        inPlace: true,
      },
    })
  }

  beforeEach(() => {
    remember.mockClear()
    clearLocalePreferenceCookie()
  })

  afterEach(() => {
    window.location.hash = ''
    clearLocalePreferenceCookie()
    vi.restoreAllMocks()
  })

  it('should keep the other locale home as a real href when rendered in place', () => {
    /* No scripting, a click before hydration, or a new tab: all land here. */
    const link = mountInPlace().find('a')

    expect(link.attributes('href')).toBe(ENGLISH_HOME)
    expect(link.attributes('hreflang')).toBe('en')
    expect(link.attributes('aria-label')).toBe(SWITCH_TO_ENGLISH)
    expect(link.classes()).toContain('size-lang-circle')
  })

  it('should emit the other locale and stay on the page when a plain click switches in place', async () => {
    const assign = vi
      .spyOn(window.location, 'assign')
      .mockImplementation(() => undefined)
    const wrapper = mountInPlace()
    const click = new MouseEvent('click', { button: 0, cancelable: true })

    wrapper.find('a').element.dispatchEvent(click)

    expect(click.defaultPrevented).toBe(true)
    expect(wrapper.emitted('switchInPlace')).toEqual([['en']])
    expect(assign).not.toHaveBeenCalled()
  })

  it('should emit Spanish when the page in place is English', async () => {
    const wrapper = mountInPlace('en')

    await wrapper.find('a').trigger('click', { button: 0 })

    expect(wrapper.emitted('switchInPlace')).toEqual([['es']])
  })

  it('should write the chosen locale to the cookie when switching in place', async () => {
    await mountInPlace().find('a').trigger('click', { button: 0 })

    expect(remember).toHaveBeenCalledTimes(1)
    expect(remember).toHaveBeenCalledWith('en')
    expect(document.cookie).toContain('muush_locale=en')
  })

  it('should leave a modified click to the browser when switching in place', async () => {
    const wrapper = mountInPlace()
    const click = new MouseEvent('click', {
      button: 0,
      metaKey: true,
      cancelable: true,
    })

    wrapper.find('a').element.dispatchEvent(click)

    expect(click.defaultPrevented).toBe(false)
    expect(wrapper.emitted('switchInPlace')).toBeUndefined()
    expect(remember).toHaveBeenCalledWith('en')
  })

  it('should not carry a fragment away when switching in place with a hash', async () => {
    const assign = vi
      .spyOn(window.location, 'assign')
      .mockImplementation(() => undefined)
    window.location.hash = '#work'
    const wrapper = mountInPlace()

    await wrapper.find('a').trigger('click', { button: 0 })

    expect(assign).not.toHaveBeenCalled()
    expect(wrapper.emitted('switchInPlace')).toEqual([['en']])
  })

  it('should never emit when the toggle navigates as on every other page', async () => {
    const wrapper = mountToggle()

    await wrapper.find('a').trigger('click', { button: 0 })

    expect(wrapper.emitted('switchInPlace')).toBeUndefined()
  })
})
