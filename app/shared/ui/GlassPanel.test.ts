import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GlassPanel, { type GlassVariant } from '@/shared/ui/GlassPanel.vue'

/**
 * Guards the six-row recipe of docs/business/landing/design-extract.md § 1.
 * A variant that silently loses its blur or its border is exactly the drift
 * this layer exists to prevent.
 */
const surfaceByVariant: Record<GlassVariant, string[]> = {
  'red-strong': [
    'bg-glass-red-strong',
    'border-glass-red-strong-line',
    'backdrop-blur-glass-red',
    'rounded-panel',
    'p-glass-red',
  ],
  'red-soft': [
    'bg-glass-red-soft',
    'border-glass-red-soft-line',
    'backdrop-blur-glass-red',
    'rounded-panel',
    'p-glass-red',
  ],
  'bone-strong': [
    'bg-glass-bone-strong',
    'border-glass-line',
    'backdrop-blur-glass',
    'rounded-panel-sm',
    'p-glass-bone',
  ],
  bone: [
    'bg-glass-bone',
    'border-glass-line',
    'backdrop-blur-glass',
    'rounded-panel-sm',
    'p-glass-bone',
  ],
  'bone-faint': [
    'bg-glass-bone-faint',
    'border-glass-line-faint',
    'backdrop-blur-glass',
    'rounded-panel-sm',
    'p-glass-red',
  ],
  dark: [
    'bg-glass-dark',
    'border-glass-dark-line',
    'backdrop-blur-glass-dark',
    'rounded-panel-sm',
    'p-glass-dark',
  ],
}

describe('GlassPanel', () => {
  for (const [variant, expectedClasses] of Object.entries(surfaceByVariant)) {
    it(`should emit its documented fill, border, blur, radius and padding when variant is ${variant}`, () => {
      const wrapper = mount(GlassPanel, {
        props: { variant: variant as GlassVariant },
      })

      for (const expected of expectedClasses) {
        expect(wrapper.classes()).toContain(expected)
      }
      expect(wrapper.classes()).toContain('border')
    })
  }

  it('should use the tight padding when padding is tight', () => {
    const wrapper = mount(GlassPanel, {
      props: { variant: 'bone', padding: 'tight' },
    })

    expect(wrapper.classes()).toContain('p-glass-tight')
    expect(wrapper.classes()).not.toContain('p-glass-bone')
  })

  it('should emit no padding class when padding is none', () => {
    const wrapper = mount(GlassPanel, {
      props: { variant: 'bone', padding: 'none' },
    })

    expect(wrapper.classes().some(name => name.startsWith('p-glass'))).toBe(
      false
    )
  })

  it('should render a div when as is not given', () => {
    const wrapper = mount(GlassPanel, { props: { variant: 'dark' } })

    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('should render the requested element when as is given', () => {
    const wrapper = mount(GlassPanel, {
      props: { variant: 'dark', as: 'article' },
    })

    expect(wrapper.element.tagName).toBe('ARTICLE')
  })

  it('should merge a caller-supplied class instead of replacing its own', () => {
    const wrapper = mount(GlassPanel, {
      props: { variant: 'dark' },
      attrs: { class: 'w-full' },
    })

    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.classes()).toContain('bg-glass-dark')
  })

  it('should render its default slot when content is given', () => {
    const wrapper = mount(GlassPanel, {
      props: { variant: 'bone' },
      slots: { default: 'Contenido' },
    })

    expect(wrapper.text()).toBe('Contenido')
  })
})
