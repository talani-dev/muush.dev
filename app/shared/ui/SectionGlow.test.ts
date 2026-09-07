import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SectionGlow, {
  type GlowSize,
  type RedGlowOpacity,
  type Wine300GlowOpacity,
  type Wine400GlowOpacity,
} from '@/shared/ui/SectionGlow.vue'

/** The colour+opacity pairs the component accepts, as it accepts them. */
type GlowFill =
  | { color: 'red-400'; opacity: RedGlowOpacity }
  | { color: 'wine-300'; opacity: Wine300GlowOpacity }
  | { color: 'wine-400'; opacity: Wine400GlowOpacity }

/*
 * The 12 pairs the design actually draws
 * (docs/business/landing/design-extract.md § 10 · SectionGlow). This list is
 * the point of the test: there is no variant system to check, only that each
 * hand-tuned pair reaches its own token. A pair that appears here and not in
 * the table — or the reverse — is the failure this catches.
 */
const fills: Array<{ glow: GlowFill; fillClass: string }> = [
  {
    glow: { color: 'red-400', opacity: 65 },
    fillClass: 'from-glow-red-400-65',
  },
  {
    glow: { color: 'red-400', opacity: 60 },
    fillClass: 'from-glow-red-400-60',
  },
  {
    glow: { color: 'red-400', opacity: 12 },
    fillClass: 'from-glow-red-400-12',
  },
  {
    glow: { color: 'wine-300', opacity: 40 },
    fillClass: 'from-glow-wine-300-40',
  },
  {
    glow: { color: 'wine-300', opacity: 37 },
    fillClass: 'from-glow-wine-300-37',
  },
  {
    glow: { color: 'wine-300', opacity: 17 },
    fillClass: 'from-glow-wine-300-17',
  },
  {
    glow: { color: 'wine-300', opacity: 14 },
    fillClass: 'from-glow-wine-300-14',
  },
  {
    glow: { color: 'wine-400', opacity: 30 },
    fillClass: 'from-glow-wine-400-30',
  },
  {
    glow: { color: 'wine-400', opacity: 28 },
    fillClass: 'from-glow-wine-400-28',
  },
  {
    glow: { color: 'wine-400', opacity: 20 },
    fillClass: 'from-glow-wine-400-20',
  },
  {
    glow: { color: 'wine-400', opacity: 14 },
    fillClass: 'from-glow-wine-400-14',
  },
  {
    glow: { color: 'wine-400', opacity: 12 },
    fillClass: 'from-glow-wine-400-12',
  },
]

/** Every distinct desktop/mobile diameter pair in § 10's two tables. */
const sizes: GlowSize[] = [
  '1500-760',
  '1500-700',
  '1400-700',
  '1100-520',
  '1000-560',
  '1000-520',
  '960-560',
  '900-520',
  '880-500',
  '860-520',
  '860-480',
  '820-480',
  '920',
]

/** Any valid pair; used where the test is about something other than fill. */
const anyGlow = { color: 'wine-400', opacity: 20, size: '960-560' } as const

/*
 * Read as a file rather than imported: the Tailwind Vite plugin claims every
 * `.css` request, so `@/assets/css/global.css?raw` resolves to an empty
 * string and every assertion below would pass against nothing. Resolved from
 * Vitest's root, which is this repository; it is a path, not an import, so
 * Article XII does not apply.
 */
const globalCss = readFileSync(
  resolve(process.cwd(), 'app/assets/css/global.css'),
  'utf8'
)

/** Every `--color-glow-*` and `--spacing-glow-*` declared in the stylesheet. */
const declaredGlowTokens = new Set(
  Array.from(
    globalCss.matchAll(/--(?:color|spacing)-glow-[\w-]+(?=\s*:)/g),
    ([token]) => token
  )
)

/**
 * The token names behind the utilities on a rendered glow — `from-glow-x`
 * comes from `--color-glow-x`, `size-glow-x` from `--spacing-glow-x`.
 */
function glowTokensOn(classes: string[]): string[] {
  return classes.flatMap(name => {
    const fill = name.match(/^from-(glow-.+)$/)
    if (fill) return [`--color-${fill[1]}`]

    const diameter = name.match(/^size-(glow-.+)$/)
    if (diameter) return [`--spacing-${diameter[1]}`]

    return []
  })
}

/** Mounts every accepted fill and every accepted size, and collects what they render. */
function tokensReachedByEveryCombination(): Set<string> {
  const reached = new Set<string>()

  /* Two loops rather than one array of props: `fills` is a discriminated
     union, and merging both lists would widen it past what `mount` accepts. */
  for (const { glow } of fills) {
    const wrapper = mount(SectionGlow, { props: { ...glow, size: '900-520' } })
    for (const token of glowTokensOn(wrapper.classes())) reached.add(token)
  }

  for (const size of sizes) {
    const wrapper = mount(SectionGlow, { props: { ...anyGlow, size } })
    for (const token of glowTokensOn(wrapper.classes())) reached.add(token)
  }

  return reached
}

describe('SectionGlow', () => {
  for (const { glow, fillClass } of fills) {
    it(`should fill from the ${glow.color} token at ${glow.opacity}% when that pair is given`, () => {
      const wrapper = mount(SectionGlow, {
        props: { ...glow, size: '900-520' },
      })

      expect(wrapper.classes()).toContain(fillClass)
    })
  }

  it('should name a token global.css actually declares when every accepted combination is mounted', () => {
    /*
     * The cross-file half of the contract, and the half the compiler cannot
     * see: the component names its tokens as class strings, `global.css`
     * declares them as custom properties, and nothing connects the two. A
     * token renamed on one side only still typechecks, still builds, and
     * renders a glow with no fill or no diameter — the silent class of
     * failure rules.md § R18 exists because of.
     */
    const unknownTokens = [...tokensReachedByEveryCombination()].filter(
      token => !declaredGlowTokens.has(token)
    )

    expect(unknownTokens).toEqual([])
  })

  it('should leave no glow token in global.css unreachable when every accepted combination is mounted', () => {
    /*
     * The other direction, which is how dead tokens accumulate: a diameter
     * dropped from the design, or an opacity the props no longer accept,
     * leaves a declaration nothing can render. There are 25 — 12 fills and 13
     * diameters — and every one must be reachable through the props.
     */
    const reached = tokensReachedByEveryCombination()
    const unreachableTokens = [...declaredGlowTokens].filter(
      token => !reached.has(token)
    )

    expect(unreachableTokens).toEqual([])
  })

  for (const size of sizes) {
    it(`should take its diameter from the fluid token when size is ${size}`, () => {
      const wrapper = mount(SectionGlow, {
        props: { ...anyGlow, size },
      })

      /*
       * One utility sets width and height together, so the circle can never
       * be measured into an ellipse, and the token behind it interpolates
       * 390 → 1440 on its own — no breakpoint reaches in here.
       */
      expect(wrapper.classes()).toContain(`size-glow-${size}`)
    })
  }

  it('should fade to a fully transparent outer stop when mounted', () => {
    const wrapper = mount(SectionGlow, { props: anyGlow })

    expect(wrapper.classes()).toContain('to-transparent')
  })

  it('should size the gradient to the circle, not to its corners, when mounted', () => {
    const wrapper = mount(SectionGlow, { props: anyGlow })

    /*
     * Without `closest-side` the fade ends 41% outside the circle and
     * `rounded-full` cuts it at a visible edge — the one failure that looks
     * fine in a screenshot of a single glow and wrong on the page.
     */
    expect(wrapper.classes()).toContain('bg-radial-[circle_closest-side]')
    expect(wrapper.classes()).toContain('rounded-full')
  })

  it('should be hidden from assistive technology and inert to pointers when mounted', () => {
    const wrapper = mount(SectionGlow, { props: anyGlow })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.classes()).toContain('pointer-events-none')
  })

  it('should leave positioning entirely to the caller when mounted', () => {
    const wrapper = mount(SectionGlow, { props: anyGlow })

    /*
     * All 22 sit at different absolute offsets, so any coordinate or
     * positioning class in here would be right once and wrong 21 times.
     */
    expect(wrapper.attributes('style')).toBeUndefined()
    const positioning = ['absolute', 'relative', 'fixed', 'sticky', 'inset-0']
    for (const utility of positioning) {
      expect(wrapper.classes()).not.toContain(utility)
    }
  })

  it('should render a single leaf element that holds no content when mounted', () => {
    const wrapper = mount(SectionGlow, { props: anyGlow })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.element.children).toHaveLength(0)
    expect(wrapper.text()).toBe('')
  })
})
