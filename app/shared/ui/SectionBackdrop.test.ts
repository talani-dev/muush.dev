import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'

/* Read from disk for the same two reasons as `DotGrid.test.ts`: a
   `<style scoped>` block never reaches a mounted component under `happy-dom`,
   and `?raw` on a stylesheet is swallowed by the Tailwind plugin
   (docs/business/rules.md §§ R16, R27). */
const globalCss = readFileSync(
  resolve(process.cwd(), 'app/assets/css/global.css'),
  'utf8'
)

const backdropSource = readFileSync(
  resolve(process.cwd(), 'app/shared/ui/SectionBackdrop.vue'),
  'utf8'
)

describe('SectionBackdrop', () => {
  it('should hide itself from assistive technology when rendered', () => {
    const wrapper = mount(SectionBackdrop)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('should never intercept pointer events when rendered', () => {
    /* It fills its whole section and sits behind the copy, so it must never
       come between a visitor and a link. */
    const wrapper = mount(SectionBackdrop)

    expect(wrapper.classes()).toContain('pointer-events-none')
  })

  it('should fill its section rather than position itself when rendered', () => {
    /* `inset-0` resolves against the section, which the section makes
       `position: relative` — that is what keeps a glow anchored to its own
       section instead of to a page-absolute offset (rules.md § R29). */
    const wrapper = mount(SectionBackdrop)

    expect(wrapper.classes()).toContain('absolute')
    expect(wrapper.classes()).toContain('inset-0')
  })

  it('should sit on the glow layer when rendered', () => {
    /*
     * Below the dot sheet, which is on `--layer-dots`. The two levels must be
     * different values: at the same level the tie-break is document order, and
     * a section is written after the layout's sheet, so the glows would land
     * on top of the dots and invert the design (rules.md § R28).
     */
    expect(backdropSource).toContain('z-index: var(--layer-glow)')
    expect(globalCss).toContain('--layer-glow:')
    expect(globalCss).toContain('--layer-dots:')
  })

  it('should render the glows it is given when a default slot is provided', () => {
    /*
     * The glows arrive as a slot rather than as a `glows: GlowPlacement[]`
     * prop: each one's position is a set of utility classes, not data, and
     * splitting one decision across a `data/` file and this component would
     * buy nothing (contracts/components.md § SectionBackdrop).
     */
    const wrapper = mount(SectionBackdrop, {
      slots: {
        default: [
          h(SectionGlow, {
            color: 'red-400',
            opacity: 65,
            size: '1500-700',
            class: 'absolute top-0 left-0',
          }),
          h(SectionGlow, {
            color: 'wine-300',
            opacity: 40,
            size: '1100-520',
            class: 'absolute right-0 bottom-0',
          }),
        ],
      },
    })

    expect(wrapper.findAllComponents(SectionGlow)).toHaveLength(2)
    expect(wrapper.element.children).toHaveLength(2)
  })

  it('should leave every glow position to the caller when a slot is provided', () => {
    /* The 21 glows all sit somewhere different, so a backdrop that positioned
       them would be right once. Nothing here may add a coordinate. */
    const wrapper = mount(SectionBackdrop, {
      slots: {
        default: h(SectionGlow, {
          color: 'wine-400',
          opacity: 20,
          size: '960-560',
          class: 'absolute top-0 left-0',
        }),
      },
    })

    const glow = wrapper.findComponent(SectionGlow)

    expect(glow.classes()).toContain('absolute')
    expect(glow.classes()).toContain('top-0')
    expect(wrapper.attributes('style')).toBeUndefined()
  })
})
