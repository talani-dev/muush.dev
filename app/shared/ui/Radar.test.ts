import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Radar, { type RadarSize } from '@/shared/ui/Radar.vue'

/**
 * Footprint and dot from docs/business/landing/design-extract.md § 2
 * ("Cómo se traduce a código"). The two halos of the design file are the
 * static drawing of the ping and are deliberately not rendered.
 */
const geometryBySize: Record<RadarSize, [string, string]> = {
  sm: ['size-radar-sm', 'size-radar-sm-core'],
  md: ['size-radar-md', 'size-radar-md-core'],
  'sm-alt': ['size-radar-alt', 'size-radar-alt-core'],
}

describe('Radar', () => {
  for (const [size, [footprint, dot]] of Object.entries(geometryBySize)) {
    it(`should centre the dot in its reserved footprint when size is ${size}`, () => {
      const wrapper = mount(Radar, { props: { size: size as RadarSize } })

      const reservedBox = wrapper.element
      const redDot = reservedBox.firstElementChild

      expect(reservedBox.classList).toContain(footprint)
      expect(redDot?.classList).toContain(dot)
      expect(redDot?.firstElementChild).toBeNull()
    })

    it(`should hang the ping on the dot and add no node of its own when size is ${size}`, () => {
      const wrapper = mount(Radar, { props: { size: size as RadarSize } })

      /*
       * The ghost is a pseudo-element of the dot: that is what makes it
       * inherit the dot's diameter at every size and expand from the dot
       * rather than from the footprint. The node count is the real
       * assertion — it fails the moment someone re-adds the halo circles,
       * or re-implements the ping as a real element or with JavaScript.
       */
      expect(wrapper.element.firstElementChild?.classList).toContain('ping')
      expect(wrapper.element.children).toHaveLength(1)
    })
  }

  it('should render only the red dot, and no halo ring, when mounted', () => {
    const wrapper = mount(Radar)

    /*
     * Rendering the halos next to a live ping would show the drawn effect
     * and the real one at once (design-extract.md § 2).
     */
    expect(wrapper.element.firstElementChild?.classList).toContain('bg-red-400')
    expect(wrapper.html()).not.toContain('halo')
  })

  it('should default to the small size when no size is given', () => {
    const wrapper = mount(Radar)

    expect(wrapper.classes()).toContain('size-radar-sm')
  })

  it('should be hidden from assistive technology when rendered', () => {
    const wrapper = mount(Radar)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })
})
