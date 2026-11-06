import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChoiceButton from './ChoiceButton.vue'
import CookieBanner from './CookieBanner.vue'
import { CONSENT_COPY } from './legalFixtures.testing'

function render(locale: 'es' | 'en' = 'es') {
  return mount(CookieBanner, { props: { copy: CONSENT_COPY[locale] } })
}

describe('CookieBanner', () => {
  it('should be a region named by its title, not a dialog', () => {
    const wrapper = render()

    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.attributes('aria-labelledby')).toBe('aviso-cookies-titulo')
    expect(wrapper.find('#aviso-cookies-titulo').text()).toBe('Usamos cookies')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('should emit reject and accept from the two choices', async () => {
    const wrapper = render('en')
    const [reject, accept] = wrapper.findAllComponents(ChoiceButton)

    expect(reject?.text()).toBe('Decline all')
    expect(accept?.text()).toBe('Accept all')
    await reject?.trigger('click')
    await accept?.trigger('click')
    expect(wrapper.emitted('reject-all')).toHaveLength(1)
    expect(wrapper.emitted('accept-all')).toHaveLength(1)
  })

  it('should emit customize with its own button as the trigger', async () => {
    const wrapper = render()
    const customize = wrapper.find('button')

    await customize.trigger('click')

    expect(customize.text()).toBe('Personalizar')
    expect(wrapper.emitted('customize')?.[0]?.[0]).toBe(customize.element)
  })

  it('should sit fixed at the bottom inside the gutters', () => {
    expect(render().classes()).toEqual(
      expect.arrayContaining([
        'fixed',
        'bottom-cookies-abajo',
        'inset-x-gutter',
        'lg:inset-x-gutter-desktop',
      ])
    )
  })
})
