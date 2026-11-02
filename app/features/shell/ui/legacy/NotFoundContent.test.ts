import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NotFoundContent from './NotFoundContent.vue'

/** Fixtures: the approved Spanish copy (spec § Copy), resolved as `logic/` would. */
const props = {
  eyebrow: 'Error 404',
  headline: 'No encontramos esta página.',
  body: 'Puede que el link venga mal escrito o que la página haya cambiado de lugar.',
  cta: { label: 'Volver al inicio', href: '/es' },
  shortcutsLabel: 'Atajos',
  shortcuts: [
    { label: 'Propósito', href: '/es#proposito' },
    { label: 'Servicios', href: '/es#servicios' },
    { label: 'Nosotros', href: '/es/nosotros' },
  ],
}

function mountContent() {
  return mount(NotFoundContent, { props })
}

describe('NotFoundContent', () => {
  it('should render the pill, the heading and the body when rendered', () => {
    const wrapper = mountContent()

    expect(wrapper.text()).toContain(props.eyebrow)
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe(props.headline)
    expect(wrapper.find('p').text()).toBe(props.body)
  })

  it('should render one primary link to the given href when rendered', () => {
    const leds = mountContent().findAll('.led')

    expect(leds).toHaveLength(1)
    expect(leds[0]?.element.tagName).toBe('A')
    expect(leds[0]?.attributes('href')).toBe(props.cta.href)
    expect(leds[0]?.text()).toBe(props.cta.label)
  })

  it('should render the three shortcuts in order inside a nav named by shortcutsLabel when rendered', () => {
    const nav = mountContent().find('nav')
    const links = nav.findAll('a')

    expect(nav.attributes('aria-label')).toBe(props.shortcutsLabel)
    expect(links.map(link => link.attributes('href'))).toEqual(
      props.shortcuts.map(shortcut => shortcut.href)
    )
    expect(links.map(link => link.text())).toEqual(
      props.shortcuts.map(shortcut => shortcut.label)
    )
  })

  it('should hide the separators from assistive technology when rendered', () => {
    const separators = mountContent()
      .find('nav')
      .findAll('span')
      .filter(span => span.text() === '·')

    expect(separators).toHaveLength(2)
    for (const separator of separators)
      expect(separator.attributes('aria-hidden')).toBe('true')
  })

  it('should render one aria-hidden backdrop with the red glow before the rings when rendered', () => {
    const section = mountContent().find('section')
    const backdrops = section.findAll('.section-backdrop')
    const children = section.element.children

    expect(backdrops).toHaveLength(1)
    expect(backdrops[0]?.attributes('aria-hidden')).toBe('true')
    const glow = backdrops[0]?.find('span')
    expect(glow?.classes()).toContain('from-glow-red-400-60')
    expect(glow?.classes()).toContain('size-glow-1400-700')
    expect(children[0]?.classList.contains('section-backdrop')).toBe(true)
    expect(children[1]?.classList.contains('not-found-rings')).toBe(true)
  })

  it('should keep the section free of a stacking context or an opaque background when rendered', () => {
    const classes = mountContent().find('section').classes()

    expect(classes).toContain('relative')
    for (const forbidden of classes)
      expect(forbidden).not.toMatch(
        /^(?:bg-|transform|translate|opacity-|isolate|z-|filter|backdrop-)/
      )
  })
})
