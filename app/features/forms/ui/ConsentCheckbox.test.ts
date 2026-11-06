import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConsentCheckbox from './ConsentCheckbox.vue'

const label = {
  before: 'Acepto el ',
  link: 'aviso de privacidad',
  after: ' y que muush me contacte sobre mi diagnóstico.',
  newTab: '(se abre en una pestaña nueva)',
  href: '/es/privacidad',
}

function render() {
  return mount(ConsentCheckbox, {
    props: { id: 'privacy', label, modelValue: false },
  })
}

describe('ConsentCheckbox', () => {
  it('should render an unticked native checkbox tied to its label', () => {
    const wrapper = render()
    const box = wrapper.find('input')

    expect(box.attributes('type')).toBe('checkbox')
    expect((box.element as HTMLInputElement).checked).toBe(false)
    expect(wrapper.find('label').attributes('for')).toBe('privacy')
    /* The sentence a sighted reader sees: the new-tab notice is sr-only. */
    const visible = wrapper.find('label').element.cloneNode(true) as HTMLElement
    for (const hidden of visible.querySelectorAll('.sr-only')) hidden.remove()
    expect(visible.textContent).toBe(
      'Acepto el aviso de privacidad y que muush me contacte sobre mi diagnóstico.'
    )
  })

  it('should link the privacy words to the privacy page in a new tab', () => {
    /* Feature 48 · pen-extract-48 § 4: a half-filled form is not lost. */
    const link = render().find('label a')

    expect(link.element.firstChild?.textContent).toBe('aviso de privacidad')
    expect(link.attributes('href')).toBe('/es/privacidad')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('should announce the new tab in the link name when read by assistive tech', () => {
    /* Roberto 2026-11-05 · WCAG G201: visually hidden, separated from the
       link text by a leading space. */
    const link = render().find('label a')
    const notice = link.find('.sr-only')

    expect(notice.exists()).toBe(true)
    expect(notice.element.textContent).toBe(' (se abre en una pestaña nueva)')
    expect(link.element.textContent).toBe(
      'aviso de privacidad (se abre en una pestaña nueva)'
    )
  })

  it('should draw the .pen box: 18, radius 5, Blanco 40 % on mobile and 25 % from md', () => {
    const box = render().find('input')

    expect(box.classes()).toEqual(
      expect.arrayContaining([
        'size-check',
        'rounded-check',
        'border-texto-tenue',
        'md:border-blanco-25',
        'checked:bg-red-muush-500',
      ])
    )
  })

  it('should emit the new state when toggled', async () => {
    const wrapper = render()

    await wrapper.find('input').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })
})
