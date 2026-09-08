import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import HeroSection from './HeroSection.vue'

/**
 * Fixtures, not copy. The component takes already-translated strings, which is
 * the whole reason it mounts here with no i18n instance and no router present
 * (`docs/business/rules.md` § R23).
 */
const props = {
  eyebrow: 'Technology solution studio',
  headline: 'Hablamos negocio y código.',
  subhead:
    'Diseñamos y construimos soluciones digitales alrededor de tu negocio.',
  ctaPrimary: 'Cuéntanos tu proyecto',
  ctaSecondary: 'Agenda una llamada',
}

/*
 * Every mount is unmounted afterwards. The Hero registers an
 * `IntersectionObserver` through `useHeroSentinel`, and `happy-dom` gives one
 * `window` per file — a component left mounted keeps observing into the next
 * test (`findings.md` § R43).
 */
const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

type HeroOverrides = Partial<typeof props> & {
  contactHref?: string
  callHref?: string
}

function mountHero(overrides: HeroOverrides = {}) {
  const wrapper = mount(HeroSection, { props: { ...props, ...overrides } })
  mounted.push(wrapper)
  return wrapper
}

/** The row that holds the two calls to action — the stack's fourth child. */
function ctaRow(wrapper: VueWrapper): string[] {
  const row = wrapper.find('section > div > div:last-child')
  return row.classes()
}

describe('HeroSection · copy and tokens', () => {
  it('should render the four children in the design order when mounted', () => {
    const stack = mountHero().findAll('section > div:last-child > *')

    expect(stack).toHaveLength(4)
    expect(stack[0]?.text()).toBe(props.eyebrow)
    expect(stack[1]?.element.tagName).toBe('H1')
    expect(stack[2]?.element.tagName).toBe('P')
    expect(stack[3]?.text()).toContain(props.ctaPrimary)
  })

  it('should render every supplied string exactly once when mounted', () => {
    const text = mountHero().text()

    for (const copy of Object.values(props)) {
      expect(text, copy).toContain(copy)
    }
  })

  it('should render the headline as the only h1 when mounted', () => {
    const wrapper = mountHero()

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe(props.headline)
  })

  it('should carry the display role and bone-100 when the headline renders', () => {
    const headline = mountHero().find('h1').classes()

    expect(headline).toContain('text-display')
    expect(headline).toContain('text-bone-100')
    expect(headline).toContain('font-instrument')
  })

  it('should cap the subhead at its own measure when the subhead renders', () => {
    /* The design caps it at 600 while the body is 900, so the two do not wrap
       to the same width. One token, no breakpoint (spec A-09). */
    const subhead = mountHero().find('p').classes()

    expect(subhead).toContain('text-body-lg')
    expect(subhead).toContain('text-ink-100')
    expect(subhead).toContain('max-w-hero-measure')
  })

  it('should cap the stack at the body width and align it to the start when mounted', () => {
    /* `items-start` keeps the Pill at its intrinsic width; it is also what
       keeps the mobile primary button as wide as its label (spec FR-007). */
    const stack = mountHero().find('section > div:last-child').classes()

    expect(stack).toContain('max-w-hero-body')
    expect(stack).toContain('gap-hero-gap')
    expect(stack).toContain('items-start')
    expect(stack).toContain('flex-col')
  })

  it('should position the first child with the section top padding when mounted', () => {
    expect(mountHero().find('section').classes()).toContain('pt-hero-top')
  })

  it('should turn the call-to-action row from a column into a row at lg when mounted', () => {
    /* The feature's only breakpoint. It changes direction and cross-axis
       alignment and never a size (spec FR-019). */
    const row = ctaRow(mountHero())

    expect(row).toContain('flex-col')
    expect(row).toContain('items-start')
    expect(row).toContain('lg:flex-row')
    expect(row).toContain('lg:items-center')
    expect(row).toContain('gap-hero-cta-gap')
    expect(row).toContain('pt-hero-cta-top')
  })

  it('should declare no size at the breakpoint when mounted', () => {
    /* Article VII: a `lg:` that changed a font size or a padding would mean a
       fluid token is missing, not that the token should be bypassed. */
    const breakpointClasses = mountHero()
      .html()
      .match(/lg:[\w./:-]+/g)

    expect(breakpointClasses).toEqual(['lg:flex-row', 'lg:items-center'])
  })
})

describe('HeroSection · the two destinations', () => {
  it('should render the primary call to action as a real button when no contact href is given', () => {
    const wrapper = mountHero()
    const button = wrapper.find('button')

    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
    expect(button.text()).toBe(props.ctaPrimary)
    expect(wrapper.html()).not.toContain('#contacto')
  })

  it('should render the primary call to action as a link when a contact href is given', () => {
    const wrapper = mountHero({ contactHref: '/es#contacto' })
    const link = wrapper
      .findAll('a')
      .find(anchor => anchor.text() === props.ctaPrimary)

    expect(link?.attributes('href')).toBe('/es#contacto')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('should render the secondary call to action as inert grey text when no call href is given', () => {
    /*
     * ⚠️ **Not dead code, and not to be deleted with the blocker it was written
     * for.** The site supplies a call href from 2026-09-07, so this branch is
     * no longer what the landing ships — but it is still what *any* control
     * with no destination renders, it is still the treatment `FooterColumn.vue`
     * gives `FAQ` and `Blog · próximamente`, and the Hero's own primary CTA is
     * still in the equivalent state. Losing the coverage would mean the next
     * blocked destination reintroduces a broken link with nothing to catch it.
     *
     * No anchor element, no pointer, no hover — and no arrow, because an arrow
     * is the affordance for going somewhere (spec FR-011).
     */
    const wrapper = mountHero()
    const secondary = wrapper.find('span.text-ink-300')

    expect(secondary.exists()).toBe(true)
    expect(secondary.element.tagName).toBe('SPAN')
    expect(secondary.classes()).toContain('text-link')
    expect(secondary.text()).toBe(props.ctaSecondary)
    expect(wrapper.text()).not.toContain('→')
  })

  it('should render the secondary call to action as an external link when a call href is given', () => {
    /* The branch the site takes today. `bone-100` and the arrow are not styled
       in here and were never missing: they belong to `LinkArrow`, and the href
       is what selects it. */
    const wrapper = mountHero({ callHref: CALL_BOOKING_URL })
    const link = wrapper
      .findAll('a')
      .find(anchor => anchor.text().startsWith(props.ctaSecondary))

    expect(link?.attributes('href')).toBe(CALL_BOOKING_URL)
    expect(link?.attributes('target')).toBe('_blank')
    expect(link?.attributes('rel')).toBe('noopener noreferrer')
    expect(link?.classes()).toContain('text-bone-100')
    expect(link?.text()).toContain('→')
    expect(wrapper.find('span.text-ink-300').exists()).toBe(false)
  })

  it('should leave no anchor without a destination in either state', () => {
    for (const overrides of [
      {},
      { contactHref: '/es#contacto' },
      { callHref: CALL_BOOKING_URL },
    ]) {
      const anchors = mountHero(overrides).findAll('a')

      for (const anchor of anchors) {
        expect(anchor.attributes('href')).toBeTruthy()
      }
    }
  })
})

describe('HeroSection · the pointer cursor', () => {
  it('should offer no pointer on the primary call to action while it has no destination', () => {
    /* A control with a box, a label and nowhere to go must not claim to be
       clickable — `ui-map.md` § 6's rule for the Proyectos slots, applied to
       the same shape. It is a `<button type="button">` with no handler: today
       clicking it does nothing at all. */
    const button = mountHero().find('button')

    expect(button.classes()).not.toContain('cursor-pointer')
  })

  it('should offer a pointer on the primary call to action once it has a destination', () => {
    /* And it arrives with the destination, from `BotonPrimario`, with no edit
       to this component — the same mechanism that lit the secondary CTA. */
    const link = mountHero({ contactHref: '/es#contacto' })
      .findAll('a')
      .find(anchor => anchor.text() === props.ctaPrimary)

    expect(link?.classes()).toContain('cursor-pointer')
  })
})

describe('HeroSection · the paint-order contract', () => {
  /**
   * Every property that would create a stacking context on the section, from
   * `SectionBackdrop.vue`'s contract. The failure mode is silent — the glows
   * simply move above the dot sheet — so it is asserted mechanically here and
   * measured on the generated page as well (spec FR-025, FR-028).
   */
  const STACKING_CONTEXT_UTILITIES = [
    'transform',
    'translate',
    'scale',
    'rotate',
    'filter',
    'backdrop-filter',
    'opacity-',
    'isolate',
    'will-change',
    'contain-paint',
    'fixed',
    'sticky',
  ]

  it('should create no stacking context on the section root when mounted', () => {
    const root = mountHero().find('section').classes()

    expect(root).toContain('relative')
    for (const utility of STACKING_CONTEXT_UTILITIES) {
      expect(
        root.some(name => name.includes(utility)),
        utility
      ).toBe(false)
    }
  })

  it('should paint no background of its own on the section root when mounted', () => {
    /* An opaque section background is painted after the negative levels and
       would hide the section's own glows. */
    const root = mountHero().find('section').classes()

    expect(root.some(name => name.startsWith('bg-'))).toBe(false)
  })

  it('should declare no bottom and no horizontal padding when mounted', () => {
    /* The next block owns the separation, and `<main>` already applies the
       page gutter — re-declaring it would place the Hero at twice it. */
    const root = mountHero().find('section').classes()

    expect(root.some(name => /^(pb|px|ps|pe|pl|pr|p)-/.test(name))).toBe(false)
  })

  it('should contribute exactly the three Landing hero glows when mounted', () => {
    const glows = mountHero().findAllComponents(SectionGlow)

    expect(
      glows.map(glow => ({
        color: glow.props('color'),
        opacity: glow.props('opacity'),
        size: glow.props('size'),
      }))
    ).toEqual([
      { color: 'red-400', opacity: 65, size: '1500-700' },
      { color: 'wine-300', opacity: 40, size: '1100-520' },
      { color: 'wine-400', opacity: 30, size: '900-520' },
    ])
  })

  it('should render every glow inside the section backdrop when mounted', () => {
    const wrapper = mountHero()
    const backdrop = wrapper.getComponent(SectionBackdrop).element

    for (const glow of wrapper.findAllComponents(SectionGlow)) {
      expect(backdrop.contains(glow.element)).toBe(true)
    }
  })

  it('should anchor each glow by its own centre on its own pair of tokens when mounted', () => {
    /* Six independent anchors: the two viewports place the glows by hand and
       neither set derives from the other (`rules.md` § R48). The translate
       is permitted here and nowhere else in the subtree. */
    const anchors = mountHero()
      .findAllComponents(SectionGlow)
      .map(glow => glow.classes())

    const expected = [
      ['top-hero-glow-foco-y', 'left-hero-glow-foco-x'],
      ['top-hero-glow-wine-y', 'left-hero-glow-wine-x'],
      ['top-hero-glow-cierre-y', 'left-hero-glow-cierre-x'],
    ]

    anchors.forEach((classes, index) => {
      expect(classes).toContain('absolute')
      expect(classes).toContain('-translate-x-1/2')
      expect(classes).toContain('-translate-y-1/2')
      for (const token of expected[index] ?? []) {
        expect(classes, token).toContain(token)
      }
    })
  })
})
