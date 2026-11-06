import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { CONSENT_COPY } from '@/features/legal/data/legalFixtures.testing'
import ConsentSwitch from './ConsentSwitch.vue'
import CookiePreferences from './CookiePreferences.vue'

/*
 * happy-dom's `<dialog>` may lack the modal API; these stand-ins only set
 * `open`, which is all the component reads.
 */
beforeAll(() => {
  const proto = HTMLDialogElement.prototype
  proto.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  proto.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
})

function render(open = true, advertising = false) {
  return mount(CookiePreferences, {
    props: { open, copy: CONSENT_COPY.es, choice: { advertising } },
    attachTo: document.body,
  })
}

describe('CookiePreferences', () => {
  it('should open as a labelled modal dialog when open', () => {
    const wrapper = render()
    const dialog = wrapper.find('dialog')

    expect((dialog.element as HTMLDialogElement).open).toBe(true)
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('preferencias-titulo')
    expect(wrapper.find('#preferencias-titulo').text()).toBe(
      'Tus preferencias de cookies'
    )
    wrapper.unmount()
  })

  it('should pre-fill the switch with the given choice', () => {
    const wrapper = render(true, true)

    expect(wrapper.findComponent(ConsentSwitch).props('checked')).toBe(true)
    wrapper.unmount()
  })

  it('should save the edited draft', async () => {
    const wrapper = render()

    await wrapper.findComponent(ConsentSwitch).trigger('click')
    await wrapper.find('button.shadow-boton').trigger('click')

    expect(wrapper.emitted('save')?.[0]).toEqual([{ advertising: true }])
    wrapper.unmount()
  })

  it('should emit close from the X, Escape and the backdrop without saving', async () => {
    const wrapper = render()
    const dialog = wrapper.find('dialog')

    await wrapper.find('button[aria-label="Cerrar"]').trigger('click')
    await dialog.trigger('cancel')
    dialog.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(wrapper.emitted('close')).toHaveLength(3)
    expect(wrapper.emitted('save')).toBeUndefined()
    wrapper.unmount()
  })

  it('should not close when the panel itself is clicked', async () => {
    const wrapper = render()

    await wrapper.find('dialog > div').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })

  it('should emit accept and reject for all', async () => {
    const wrapper = render()
    const buttons = wrapper.findAll('button')
    const byText = (text: string) =>
      buttons.find(button => button.text() === text)

    await byText('Rechazar todo')?.trigger('click')
    await byText('Aceptar todo')?.trigger('click')

    expect(wrapper.emitted('reject-all')).toHaveLength(1)
    expect(wrapper.emitted('accept-all')).toHaveLength(1)
    wrapper.unmount()
  })

  it('should link the intro words to the privacy page', () => {
    const wrapper = render()
    const link = wrapper.find('p a')

    expect(link.text()).toBe('aviso de privacidad')
    expect(link.attributes('href')).toBe('/es/privacidad')
    wrapper.unmount()
  })

  it('should close the dialog when open turns false', async () => {
    const wrapper = render()

    await wrapper.setProps({ open: false })

    expect((wrapper.find('dialog').element as HTMLDialogElement).open).toBe(
      false
    )
    wrapper.unmount()
  })
})
