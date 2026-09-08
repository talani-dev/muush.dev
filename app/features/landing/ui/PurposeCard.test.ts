import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import GlassPanel from '@/shared/ui/GlassPanel.vue'
import PurposeCard from './PurposeCard.vue'

/**
 * Fixtures, not copy. The component takes already-translated strings, which is
 * what lets it mount here with no i18n instance (`rules.md` § R23).
 *
 * ⚠️ Seen red on purpose before a single real assertion below was written
 * (`findings.md` § R39). `vitest.config.ts` already collects
 * `app/features/**​/*.test.ts`, so no `include` change was needed — but "the
 * glob looks right" is not the same as "the file ran".
 */
const props = {
  label: 'Why',
  copy: 'Construimos con el estándar de las aplicaciones que admiramos.',
}

const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

function mountCard(overrides: Partial<typeof props> = {}) {
  const wrapper = mount(PurposeCard, { props: { ...props, ...overrides } })
  mounted.push(wrapper)
  return wrapper
}

describe('PurposeCard · one card, two label placements', () => {
  it('should render the label and the copy in that order when mounted', () => {
    /* Label first is the Golden Circle's own order, and it is what a screen
       reader reads on mobile where both are visible. */
    const children = mountCard().findAll('article > *')

    expect(children).toHaveLength(2)
    expect(children[0]?.text()).toBe(props.label)
    expect(children[1]?.element.tagName).toBe('P')
    expect(children[1]?.text()).toBe(props.copy)
  })

  it('should hide the label above lg when the label renders', () => {
    /*
     * `decisions-open.md` § D6: mobile paints the label inside the card,
     * desktop delegates it to the constellation. One utility, no mode prop —
     * and it is what stops the word being announced twice on desktop, where
     * the trigger already carries it as its accessible name (spec FR-004).
     */
    const label = mountCard().find('article > span').classes()

    expect(label).toContain('lg:hidden')
    expect(label).toContain('text-purpose-card-label')
    expect(label).toContain('text-red-200')
  })

  it('should carry the lead role and the mobile weight when the copy renders', () => {
    /* The one documented exception to the fluid scale: `rules.md` § R4 left
       the 500 → 600 change below `lg` to this component. The `lg:` changes a
       weight and never a size, which is what keeps it legal under Article
       VII — `text-lead` still carries the 22 → 30 `clamp()`. */
    const copy = mountCard().find('article > p').classes()

    expect(copy).toContain('text-lead')
    expect(copy).toContain('font-semibold')
    expect(copy).toContain('lg:font-medium')
    expect(copy).toContain('font-instrument')
  })

  it('should declare no size at the breakpoint when mounted', () => {
    /* Article VII: a `lg:` that changed a font size or a padding would mean a
       fluid token is missing, not that the token should be bypassed. */
    const breakpointClasses = mountCard()
      .html()
      .match(/lg:[\w./:-]+/g)

    expect(breakpointClasses).toEqual(['lg:hidden', 'lg:font-medium'])
  })

  it('should rest on the soft red glass surface when mounted', () => {
    /*
     * All three cards share one resting surface. The design file draws the Why
     * card brighter (`red-strong`), which reads as Golden Circle hierarchy and
     * is not: the frame draws the revealed state and those are hover values
     * (Roberto, 2026-09-08 — spec FR-005). The constellation promotes it.
     */
    const wrapper = mountCard()

    expect(wrapper.getComponent(GlassPanel).props('variant')).toBe('red-soft')
    expect(wrapper.getComponent(GlassPanel).props('as')).toBe('article')
    expect(wrapper.findAll('article')).toHaveLength(1)
  })

  it('should take no mode or variant prop at all when mounted', () => {
    /* FR-004: one component, two placements, one data value. A `mode` prop is
       exactly the speculative abstraction Article VIII forbids. */
    expect(Object.keys(mountCard().vm.$props)).toEqual(['label', 'copy'])
  })

  it('should be no link and claim no pointer when mounted', () => {
    /* `ui-map.md` § 4: *"Las cartas no son links."* A card that looks
       clickable and does nothing reads as a broken site
       (`findings.md` § R56). */
    const wrapper = mountCard()

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('cursor-pointer')
  })
})
