import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import AboutHeroSection from './AboutHeroSection.vue'

/**
 * Fixtures, not copy — same reasoning as `landing/ui/HeroSection.test.ts`
 * (`docs/business/rules.md` § R23): the component takes already-translated
 * strings and calls no composable at all.
 */
const props = {
  eyebrow: 'Nosotros',
  headline: 'El equipo se arma alrededor del proyecto.',
  intro:
    'Reunimos al talento indicado para cada proyecto y le damos libertad de elegir en qué proyectos entra y desde dónde trabaja.',
}

function mountSection(overrides: Partial<typeof props> = {}) {
  return mount(AboutHeroSection, { props: { ...props, ...overrides } })
}

describe('AboutHeroSection · copy and tokens', () => {
  it('should render exactly three children in the design order when mounted', () => {
    const stack = mountSection().findAll('section > div:last-child > *')

    expect(stack).toHaveLength(3)
    expect(stack[0]?.text()).toBe(props.eyebrow)
    expect(stack[1]?.element.tagName).toBe('H1')
    expect(stack[2]?.element.tagName).toBe('P')
  })

  it('should render every supplied string exactly once when mounted', () => {
    const text = mountSection().text()

    for (const copy of Object.values(props)) {
      expect(text, copy).toContain(copy)
    }
  })

  it('should render the headline as the only h1 when mounted', () => {
    const wrapper = mountSection()

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe(props.headline)
  })

  it('should carry the about h1 role when the headline renders', () => {
    /* Distinct from the landing Hero's `text-display` — design-extract.md § 9
       gives Nosotros' Hero its own "H1" role (74/600 D · 38/600 M). */
    const headline = mountSection().find('h1').classes()

    expect(headline).toContain('text-h1')
    expect(headline).toContain('text-bone-100')
    expect(headline).not.toContain('text-display')
  })

  it('should cap the intro at its own about measure when it renders', () => {
    const intro = mountSection().find('p').classes()

    expect(intro).toContain('text-body')
    expect(intro).toContain('text-ink-100')
    expect(intro).toContain('max-w-about-hero-measure')
    expect(intro).not.toContain('text-body-lg')
  })

  it('should cap the stack at the about body width when mounted', () => {
    const stack = mountSection().find('section > div:last-child').classes()

    expect(stack).toContain('max-w-about-hero-body')
    expect(stack).toContain('gap-about-hero-gap')
    expect(stack).toContain('items-start')
    expect(stack).toContain('flex-col')
  })

  it('should render no CTA row, unlike the landing Hero', () => {
    /* The one structural difference the leader's brief names: three children,
       never four. */
    expect(mountSection().findAll('a')).toHaveLength(0)
    expect(mountSection().findAll('button')).toHaveLength(0)
  })

  it('should position the first child with the about section top padding when mounted', () => {
    expect(mountSection().find('section').classes()).toContain(
      'pt-about-hero-top'
    )
  })
})

describe('AboutHeroSection · the paint-order contract', () => {
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
    const root = mountSection().find('section').classes()

    expect(root).toContain('relative')
    for (const utility of STACKING_CONTEXT_UTILITIES) {
      expect(
        root.some(name => name.includes(utility)),
        utility
      ).toBe(false)
    }
  })

  it('should paint no background of its own on the section root when mounted', () => {
    const root = mountSection().find('section').classes()

    expect(root.some(name => name.startsWith('bg-'))).toBe(false)
  })

  it('should declare no bottom and no horizontal padding when mounted', () => {
    const root = mountSection().find('section').classes()

    expect(root.some(name => /^(pb|px|ps|pe|pl|pr|p)-/.test(name))).toBe(false)
  })

  it('should contribute exactly the three Nosotros hero glows, matching Landing’s opacities', () => {
    /* 60/37/28 on the SAME component regardless of viewport — the `.pen`'s
       mobile frame drawing 65/40/30 is a declared design-file error
       (Roberto, 2026-09-08), not a per-viewport value to encode. */
    const glows = mountSection().findAllComponents(SectionGlow)

    expect(
      glows.map(glow => ({
        color: glow.props('color'),
        opacity: glow.props('opacity'),
        size: glow.props('size'),
      }))
    ).toEqual([
      { color: 'red-400', opacity: 60, size: '1400-700' },
      { color: 'wine-300', opacity: 37, size: '1000-520' },
      { color: 'wine-400', opacity: 28, size: '860-520' },
    ])
  })

  it('should render every glow inside the section backdrop when mounted', () => {
    const wrapper = mountSection()
    const backdrop = wrapper.getComponent(SectionBackdrop).element

    for (const glow of wrapper.findAllComponents(SectionGlow)) {
      expect(backdrop.contains(glow.element)).toBe(true)
    }
  })

  it('should anchor each glow by its own centre on its own pair of tokens when mounted', () => {
    const anchors = mountSection()
      .findAllComponents(SectionGlow)
      .map(glow => glow.classes())

    const expected = [
      ['top-about-hero-glow-foco-y', 'left-about-hero-glow-foco-x'],
      ['top-about-hero-glow-wine-y', 'left-about-hero-glow-wine-x'],
      ['top-about-hero-glow-cierre-y', 'left-about-hero-glow-cierre-x'],
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
