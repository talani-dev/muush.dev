import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LanguageToggle from './LanguageToggle.vue'

const ENGLISH_ABOUT = '/en/about'

function mountToggle() {
  return mount(LanguageToggle, {
    props: { locale: 'es' as const, href: ENGLISH_ABOUT },
  })
}

describe('LanguageToggle', () => {
  afterEach(() => {
    window.location.hash = ''
    vi.restoreAllMocks()
  })

  it('should render both locale labels when rendered', () => {
    const text = mountToggle().text()

    expect(text).toContain('ES')
    expect(text).toContain('EN')
  })

  it('should render the active locale as text rather than a link', () => {
    const wrapper = mountToggle()

    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(wrapper.find('a').text()).toBe('EN')
  })

  it('should mark the active locale in bone at weight 600 when rendered', () => {
    const active = mountToggle()
      .findAll('span')
      .find(span => span.text() === 'ES')

    expect(active?.classes()).toContain('text-bone-100')
    expect(active?.classes()).toContain('font-semibold')
  })

  it('should render the inactive locale in ink 200 when rendered', () => {
    expect(mountToggle().find('a').classes()).toContain('text-ink-200')
  })

  it('should point at the anchorless destination when rendered', () => {
    const link = mountToggle().find('a')

    expect(link.attributes('href')).toBe(ENGLISH_ABOUT)
    expect(link.attributes('hreflang')).toBe('en')
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
