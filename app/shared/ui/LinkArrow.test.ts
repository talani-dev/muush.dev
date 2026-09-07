import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LinkArrow from '@/shared/ui/LinkArrow.vue'
import linkArrowSource from '@/shared/ui/LinkArrow.vue?raw'

const markup = linkArrowSource.slice(
  linkArrowSource.indexOf('<template>'),
  linkArrowSource.indexOf('</template>')
)

/**
 * The component's template opens with a `biome-ignore` comment, so Vue's
 * root vnode is a fragment of [comment, anchor]. Attribute fallthrough is
 * unaffected — Vue skips comments when it resolves the single root — but the
 * assertions below have to reach for the anchor rather than for the wrapper.
 */
describe('LinkArrow', () => {
  it('should use the small type role when no size is given', () => {
    const link = mount(LinkArrow, { props: { href: '#contacto' } }).find('a')

    expect(link.classes()).toContain('text-link')
    expect(link.classes()).toContain('text-bone-100')
  })

  it('should use the large type role when the size is large', () => {
    const link = mount(LinkArrow, {
      props: { href: '#contacto', size: 'large' },
    }).find('a')

    expect(link.classes()).toContain('text-link-lg')
  })

  /**
   * design-extract.md § 7 and ui-map.md § 3 both say loose text, "nunca un
   * fondo". A background or a border in any state — including hover and
   * focus — turns it back into a button competing with the primary CTA.
   */
  it('should paint no background and no border in any state when rendered', () => {
    const link = mount(LinkArrow, { props: { href: '#contacto' } }).find('a')

    for (const name of link.classes()) {
      expect(name).not.toMatch(/^(hover:|focus:|focus-visible:|active:)?bg-/)
      expect(name).not.toMatch(/^(hover:|focus:|focus-visible:|active:)?border/)
    }
    expect(markup).not.toMatch(/\bbg-/)
    expect(markup).not.toMatch(/\bborder-/)
  })

  it('should render the arrow itself rather than expecting it from the caller', () => {
    const wrapper = mount(LinkArrow, {
      props: { href: '#contacto' },
      slots: { default: 'Agenda una llamada' },
    })

    expect(wrapper.text()).toContain('→')
    expect(markup).toContain('→')
  })

  it('should hide the arrow from assistive technology when rendered', () => {
    const wrapper = mount(LinkArrow, { props: { href: '#contacto' } })

    const arrow = wrapper.find('[aria-hidden="true"]')
    expect(arrow.exists()).toBe(true)
    expect(arrow.text()).toBe('→')
  })

  it('should stay in the same context when external is not set', () => {
    const link = mount(LinkArrow, { props: { href: '#contacto' } }).find('a')

    expect(link.attributes('target')).toBeUndefined()
    expect(link.attributes('rel')).toBeUndefined()
  })

  it('should open safely in a new context when external is set', () => {
    const link = mount(LinkArrow, {
      props: { href: 'https://calendar.google.com', external: true },
    }).find('a')

    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('should render the caller-supplied label when slot content is given', () => {
    const wrapper = mount(LinkArrow, {
      props: { href: '#contacto' },
      slots: { default: 'Book a call' },
    })

    expect(wrapper.text()).toContain('Book a call')
  })
})
