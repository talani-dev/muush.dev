import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { CONSENT_COPY } from '@/features/legal/data/legalFixtures.testing'
import ConsentSwitch from './ConsentSwitch.vue'
import CookieCategoryRow from './CookieCategoryRow.vue'
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

function render(open = true, advertising = false, analytics = false) {
  return mount(CookiePreferences, {
    props: { open, copy: CONSENT_COPY.es, choice: { analytics, advertising } },
    attachTo: document.body,
  })
}

describe('CookiePreferences', () => {
  it('should open as a labelled modal dialog when open', () => {
    const wrapper = render()
    const dialog = wrapper.find('dialog')

    expect((dialog.element as HTMLDialogElement).open).toBe(true)
    /* showModal() makes it modal; a redundant aria-modal is not set. */
    expect(dialog.attributes('aria-modal')).toBeUndefined()
    expect(dialog.attributes('aria-labelledby')).toBe('preferencias-titulo')
    expect(wrapper.find('#preferencias-titulo').text()).toBe(
      'Tus preferencias de cookies'
    )
    wrapper.unmount()
  })

  it('should list Necesarias, Analítica and Publicidad in that order', () => {
    const wrapper = render()
    const rows = wrapper.findAllComponents(CookieCategoryRow)

    expect(rows.map(row => row.props('category').id)).toEqual([
      'necessary',
      'analytics',
      'advertising',
    ])
    expect(rows.map(row => row.props('category').name)).toEqual([
      'Necesarias',
      'Analítica',
      'Publicidad',
    ])
    wrapper.unmount()
  })

  it('should give each optional category its own switch, both off when there is no choice', () => {
    const wrapper = render()
    const switches = wrapper.findAllComponents(ConsentSwitch)

    expect(switches).toHaveLength(2)
    expect(switches.map(control => control.props('checked'))).toEqual([
      false,
      false,
    ])
    wrapper.unmount()
  })

  it('should pre-fill each switch with the given choice', () => {
    const wrapper = render(true, true, false)
    const switches = wrapper.findAllComponents(ConsentSwitch)

    expect(switches.map(control => control.props('checked'))).toEqual([
      false,
      true,
    ])
    wrapper.unmount()
  })

  it('should save the edited draft with the switches independent', async () => {
    const wrapper = render()
    const [analytics] = wrapper.findAllComponents(ConsentSwitch)

    await analytics?.trigger('click')
    await wrapper.find('button.shadow-boton').trigger('click')

    expect(wrapper.emitted('save')?.[0]).toEqual([
      { analytics: true, advertising: false },
    ])
    wrapper.unmount()
  })

  it('should render the analytics row with the very classes of the advertising row', () => {
    const wrapper = render()
    const [, analytics, advertising] = wrapper.findAll('li')

    expect(analytics?.attributes('class')).toBe(
      advertising?.attributes('class')
    )
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

  it('should emit close when the dialog closes natively while open', () => {
    /* Safety net: a native close path other than `cancel` keeps the
       caller's state in sync. */
    const wrapper = render()

    wrapper.find('dialog').element.dispatchEvent(new Event('close'))

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('save')).toBeUndefined()
    wrapper.unmount()
  })

  it('should not emit close when the dialog closes because open turned false', async () => {
    const wrapper = render()

    await wrapper.setProps({ open: false })
    wrapper.find('dialog').element.dispatchEvent(new Event('close'))

    expect(wrapper.emitted('close')).toBeUndefined()
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
