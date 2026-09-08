import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import type { PurposeNodeContent } from '@/features/landing/data/purposeContent'
import PurposeCarousel from './PurposeCarousel.vue'

/**
 * The mobile composition. Seen red on purpose first (`findings.md` § R39).
 *
 * Two things shape every test below.
 *
 * `await nextTick()` after mounting, because the composable's watcher is
 * `flush: 'post'`: the run that sees the real track lands on a microtask, and
 * asserting in the same tick observes the **unenhanced** carousel. That is
 * genuinely useful — it is exactly the prerendered state — so both are
 * asserted, before and after.
 *
 * And every mount is unmounted in `afterEach`: `happy-dom` gives one `window`
 * per file and an `IntersectionObserver` outlives the test that made it
 * (`findings.md` § R43).
 */
const nodes: PurposeNodeContent[] = [
  { id: 'why', index: 0, label: 'Why', copy: 'Copy for why.' },
  { id: 'how', index: 1, label: 'How', copy: 'Copy for how.' },
  { id: 'what', index: 2, label: 'What', copy: 'Copy for what.' },
]

const props = { nodes, label: 'Propósito' }

const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

function mountCarousel() {
  const wrapper = mount(PurposeCarousel, { props })
  mounted.push(wrapper)
  return wrapper
}

async function mountEnhanced() {
  const wrapper = mountCarousel()
  await nextTick()
  return wrapper
}

describe('PurposeCarousel · the track', () => {
  it('should render one snapping card per node when mounted', () => {
    const cards = mountCarousel().findAll('article')

    expect(cards).toHaveLength(3)
    cards.forEach((card, index) => {
      expect(card.classes()).toContain('snap-center')
      expect(card.classes()).toContain('w-purpose-card-m')
      expect(card.classes()).toContain('shrink-0')
      expect(card.text()).toContain(nodes[index]?.copy)
    })
  })

  it('should make the track a native centre-snapping scroller when mounted', () => {
    /* This is swiping, snapping and centring in full, and it is also the no-JS
       fallback verbatim (`ui-map.md` § 10, spec FR-020). */
    const track = mountCarousel().find('.track').classes()

    expect(track).toContain('snap-x')
    expect(track).toContain('snap-mandatory')
    expect(track).toContain('overflow-x-auto')
    expect(track).toContain('flex')
  })

  it('should break the track out of the page gutter when mounted', () => {
    /* The frame draws the track 390 wide at x 0, so it bleeds past the 24px
       page margin `<main>` applies. The wrapper is what breaks out, because
       the track's inline padding is a percentage of its containing block. */
    const wrapper = mountCarousel()

    expect(wrapper.find('.-mx-page').exists()).toBe(true)
    expect(wrapper.find('.-mx-page > .track').exists()).toBe(true)
  })

  it('should paint each card its own label below lg when mounted', () => {
    /* `decisions-open.md` § D6: there is no constellation here, so the label
       is integrated into the card. The `lg:hidden` that suppresses it on
       desktop is `PurposeCard`'s and is never reached at this width. */
    const cards = mountCarousel().findAll('article')

    cards.forEach((card, index) => {
      expect(card.text()).toContain(nodes[index]?.label)
    })
  })

  it('should name the track for assistive technology when mounted', () => {
    /* `ui-map.md` § Accesibilidad mínima. The section itself stays unnamed
       (spec A-08); this is the track, and naming it is what the WAI carousel
       pattern asks for. */
    expect(mountCarousel().attributes('aria-label')).toBe(props.label)
  })

  it('should make no card a link and claim no pointer on one when mounted', () => {
    /* `ui-map.md` § 4: *"Las cartas no son links."* Only the dots do
       something, so only the dots claim a pointer
       (`findings.md` § R56, spec FR-024). */
    const wrapper = mountCarousel()

    expect(wrapper.find('a').exists()).toBe(false)
    for (const card of wrapper.findAll('article')) {
      expect(card.classes()).not.toContain('cursor-pointer')
    }
  })
})

describe('PurposeCarousel · without scripting', () => {
  it('should dim no card before the tracking is wired when mounted', () => {
    /*
     * The state the prerendered document carries, and the one a visitor with
     * no scripting keeps: **every** card at full size and full opacity —
     * *"nunca atenuadas por default"* (`ui-map.md` § 10, spec FR-023).
     */
    for (const card of mountCarousel().findAll('article')) {
      expect(card.attributes('data-dimmed')).toBeUndefined()
    }
  })

  it('should ship no indicator before the tracking is wired when mounted', () => {
    /* Three dots that do nothing would be three controls that look clickable
       and lead nowhere (`findings.md` § R56). They arrive with the behaviour
       that makes them work. */
    expect(mountCarousel().findAll('button')).toHaveLength(0)
  })
})

describe('PurposeCarousel · the indicator', () => {
  it('should render one real button per node once enhanced', async () => {
    /* `ui-map.md` § Accesibilidad mínima: *"Los 3 puntos del indicador son
       botones reales, centran su carta."* (spec FR-022). */
    const dots = (await mountEnhanced()).findAll('button')

    expect(dots).toHaveLength(3)
    dots.forEach((dot, index) => {
      expect(dot.attributes('type')).toBe('button')
      expect(dot.attributes('aria-label')).toBe(nodes[index]?.label)
      expect(dot.classes()).toContain('cursor-pointer')
    })
  })

  it('should mark exactly one dot as current once enhanced', async () => {
    const dots = (await mountEnhanced()).findAll('button')
    const current = dots.filter(dot => dot.attributes('aria-current'))

    expect(current).toHaveLength(1)
    expect(current[0]?.attributes('aria-label')).toBe('Why')
  })

  it('should size and colour the active dot apart from the other two', async () => {
    /* The frame's 8px `red-400` active against 6px `ink-300` inactive. */
    const dots = (await mountEnhanced()).findAll('button')

    expect(dots[0]?.classes()).toContain('size-purpose-dot')
    expect(dots[0]?.classes()).toContain('bg-red-400')
    for (const dot of dots.slice(1)) {
      expect(dot.classes()).toContain('size-purpose-dot-sm')
      expect(dot.classes()).toContain('bg-ink-300')
    }
  })

  it('should move the active card and the marking together when a dot is used', async () => {
    const wrapper = await mountEnhanced()

    await wrapper.findAll('button')[2]?.trigger('click')

    const dots = wrapper.findAll('button')
    expect(dots[2]?.attributes('aria-current')).toBe('true')
    expect(dots[0]?.attributes('aria-current')).toBeUndefined()
    expect(dots[2]?.classes()).toContain('size-purpose-dot')
  })

  it('should dim the two cards that are not centred once enhanced', async () => {
    /* One scale plus one opacity on the same card, never a second smaller
       card (spec FR-021). Here only the attribute that switches it on is
       observable: `happy-dom` resolves no `scale` and no `calc()`. */
    const cards = (await mountEnhanced()).findAll('article')

    expect(cards[0]?.attributes('data-dimmed')).toBeUndefined()
    expect(cards[1]?.attributes('data-dimmed')).toBe('true')
    expect(cards[2]?.attributes('data-dimmed')).toBe('true')
  })
})
