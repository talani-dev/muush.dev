import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import FaqBand from './FaqBand.vue'

/** Feature 51 · spec FR-020; research R4. */
vi.mock('@/shared/logic/useShaderCanvas', () => ({
  useShaderCanvas: () => ({ isReady: ref(false), isFallback: ref(false) }),
}))

describe('FaqBand', () => {
  it('should place a full-width box from the page top at the band tokens when rendered', () => {
    const wrapper = mount(FaqBand)

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'absolute',
        'inset-x-0',
        'top-faq-franja-arriba',
        'h-faq-franja-alto',
        'pointer-events-none',
      ])
    )
  })

  it('should host the faq acanalado and hide itself from assistive technology', () => {
    const wrapper = mount(FaqBand)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.findComponent(ShaderBackground).props('preset')).toBe('faq')
  })
})
