import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HeroStack from './HeroStack.vue'

/**
 * Fixtures, not copy — same reasoning as `HeroSection.test.ts`
 * (`docs/business/rules.md` § R23): the component takes already-translated
 * strings and calls no composable at all.
 */
const props = {
  eyebrow: 'Nosotros',
  headline: 'El equipo se arma alrededor del proyecto.',
  body: 'Reunimos al talento indicado para cada proyecto.',
}

describe('HeroStack · shared Pill+headline+intro base', () => {
  it('should render the three children in order when mounted', () => {
    const stack = mount(HeroStack, { props }).findAll(':scope > *')

    expect(stack).toHaveLength(3)
    expect(stack[0]?.text()).toBe(props.eyebrow)
    expect(stack[1]?.element.tagName).toBe('H1')
    expect(stack[2]?.element.tagName).toBe('P')
  })

  it('should render the headline as the only h1 when mounted', () => {
    const wrapper = mount(HeroStack, { props })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe(props.headline)
    expect(wrapper.find('p').text()).toBe(props.body)
  })

  it('should default to the landing type roles and widths when no variant is given', () => {
    const wrapper = mount(HeroStack, { props })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['max-w-hero-body', 'gap-hero-gap'])
    )
    expect(wrapper.find('h1').classes()).toContain('text-display')
    expect(wrapper.find('p').classes()).toEqual(
      expect.arrayContaining(['text-body-lg', 'max-w-hero-measure'])
    )
  })

  it('should switch to the about type roles and widths when variant is about', () => {
    const wrapper = mount(HeroStack, { props: { ...props, variant: 'about' } })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['max-w-about-hero-body', 'gap-about-hero-gap'])
    )
    expect(wrapper.find('h1').classes()).toContain('text-h1')
    expect(wrapper.find('p').classes()).toEqual(
      expect.arrayContaining(['text-body', 'max-w-about-hero-measure'])
    )
  })

  it('should render slot content after the intro copy when a slot is supplied', () => {
    /* This is what lets Landing's Hero append a CTA row without this
       component knowing anything about buttons or destinations, and lets
       About's Hero render none at all (feature 17's own brief). */
    const wrapper = mount(HeroStack, {
      props,
      slots: { default: '<div class="cta-row">cta</div>' },
    })
    const children = wrapper.findAll(':scope > *')

    expect(children).toHaveLength(4)
    expect(children[3]?.classes()).toContain('cta-row')
  })

  it('should render no fourth child when no slot content is supplied', () => {
    const children = mount(HeroStack, { props }).findAll(':scope > *')

    expect(children).toHaveLength(3)
  })
})
