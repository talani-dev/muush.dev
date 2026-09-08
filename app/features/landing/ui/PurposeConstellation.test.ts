import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { PurposeNodeContent } from '@/features/landing/data/purposeContent'
import PurposeCard from './PurposeCard.vue'
import PurposeConstellation from './PurposeConstellation.vue'

/**
 * The desktop composition. Seen red on purpose first (`findings.md` § R39).
 *
 * ⚠️ Two things this file deliberately does **not** try to assert. `happy-dom`
 * resolves no `calc()`, no percentage and no `:hover`, so neither the rendered
 * line width nor the reveal itself is observable here — pretending otherwise
 * would ship a test that is green forever (`rules.md` § R27). Both are
 * measured in Chrome against `.output/public` and recorded in the
 * implementation report. What this file proves is the **structure** the reveal
 * depends on: the DOM order, the peer relationship, and that nothing is
 * hidden in a way that removes it from the accessibility tree.
 */
const nodes: PurposeNodeContent[] = [
  { id: 'why', index: 0, label: 'Why', copy: 'Copy for why.' },
  { id: 'how', index: 1, label: 'How', copy: 'Copy for how.' },
  { id: 'what', index: 2, label: 'What', copy: 'Copy for what.' },
]

const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

function mountConstellation() {
  const wrapper = mount(PurposeConstellation, { props: { nodes } })
  mounted.push(wrapper)
  return wrapper
}

/**
 * The `<style scoped>` block with its comments stripped.
 *
 * Both halves matter. `lastIndexOf` and not `indexOf`, because the doc comment
 * above the template mentions `<style scoped>` in prose. And the comments come
 * out because the block *documents* the frame's 394 / 244 / 94 as the check on
 * the formula — recording the values it must not hardcode is the point, so an
 * assertion that cannot tell a declaration from a comment would punish exactly
 * the right code.
 */
function styleDeclarations(file: string): string {
  const source = readFileSync(
    join(process.cwd(), 'app', 'features', 'landing', 'ui', file),
    'utf8'
  )
  return source
    .slice(source.lastIndexOf('<style scoped>'))
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
}

describe('PurposeConstellation · the three nodes', () => {
  it('should render one row per node carrying its own index when mounted', () => {
    /* `--i` is the whole of what distinguishes the three rows: every
       horizontal offset and the line length are generated from it. */
    const rows = mountConstellation().findAll('.node')

    expect(rows).toHaveLength(3)
    rows.forEach((row, index) => {
      expect(
        (row.element as HTMLElement).style.getPropertyValue('--i'),
        `row ${index}`
      ).toBe(String(index))
    })
  })

  it('should order every row trigger, line, card when mounted', () => {
    /* This order **is** the reveal: the line and the card are the trigger's
       later siblings, which is what `~` needs (spec FR-008). Reversing it
       would break the section with no error and no failing style. */
    for (const row of mountConstellation().findAll('.node')) {
      const children = row.findAll(':scope > *')

      expect(children).toHaveLength(3)
      expect(children[0]?.classes()).toContain('trigger')
      expect(children[1]?.classes()).toContain('link')
      expect(children[2]?.classes()).toContain('card')
    }
  })

  it('should make each trigger a real button named by its label when mounted', () => {
    /* A real focusable control, so the reveal is reachable by keyboard
       (spec FR-009), and no `href` and no fragment, because its activation has
       no destination (`rules.md` § R50). */
    const triggers = mountConstellation().findAll('button')

    expect(triggers).toHaveLength(3)
    triggers.forEach((trigger, index) => {
      expect(trigger.attributes('type')).toBe('button')
      expect(trigger.attributes('href')).toBeUndefined()
      expect(trigger.text()).toBe(nodes[index]?.label)
      expect(trigger.classes()).toContain('peer')
    })
  })

  it('should offer no pointer on a trigger that does nothing when clicked', () => {
    /* Hover and focus reveal; clicking does nothing at all. `findings.md`
       § R56: a control is painted clickable only when it does something. */
    const wrapper = mountConstellation()

    expect(wrapper.html()).not.toContain('cursor-pointer')
    expect(wrapper.html()).not.toContain('#proposito')
  })

  it('should hang the label off the trigger so the word shares its hit area', () => {
    /* One trigger, two ways in. The word is a child of the button rather than
       a second peer, which is why hovering the label reveals exactly what
       hovering the dot reveals — from one selector (acceptance scenario 3). */
    for (const trigger of mountConstellation().findAll('.trigger')) {
      expect(trigger.find('.label').exists()).toBe(true)
      expect(trigger.find('.radar').exists()).toBe(true)
    }
  })

  it('should keep every card in the accessibility tree at rest when mounted', () => {
    /*
     * FR-010, and the assertion that matters most for US2: hiding is by
     * `opacity` only. A `hidden`, `invisible` or `display: none` card would
     * take the section's substance away from a screen-reader user, who never
     * hovers anything.
     */
    const wrapper = mountConstellation()

    /* `findAll('article')`, not `findAllComponents(PurposeCard)`: when a
       component's root is itself a component — `PurposeCard` → `GlassPanel` —
       Vue Test Utils resolves the component wrapper's `element` to the
       *parent* DOM node, so `.classes()` would silently report the row's
       classes and every `not.toContain` below would pass for the wrong
       reason. */
    expect(wrapper.findAllComponents(PurposeCard)).toHaveLength(3)
    const cards = wrapper.findAll('article')
    expect(cards).toHaveLength(3)

    for (const card of cards) {
      const classes = card.classes()
      expect(classes).not.toContain('hidden')
      expect(classes).not.toContain('invisible')
      expect(classes).not.toContain('sr-only')
      expect(card.attributes('aria-hidden')).toBeUndefined()
      expect(card.attributes('hidden')).toBeUndefined()
    }

    for (const node of nodes) {
      expect(wrapper.text(), node.copy).toContain(node.copy)
    }
  })

  it('should promote the card surface from the trigger when mounted', () => {
    /* The revealed surface has to be Tailwind utilities on the card: the glass
       colours live in `@theme inline` and a `var(--color-glass-red-strong)` in
       hand-written CSS resolves to nothing in the site build
       (`rules.md` § R18). It also has to be on the card element itself, which
       is why the peer relationship is asserted above. */
    for (const card of mountConstellation().findAll('article')) {
      const classes = card.classes()

      expect(classes).toContain('peer-hover:bg-glass-red-strong')
      expect(classes).toContain('peer-hover:border-glass-red-strong-line')
      expect(classes).toContain('peer-focus-visible:bg-glass-red-strong')
      expect(classes).toContain(
        'peer-focus-visible:border-glass-red-strong-line'
      )
    }
  })
})

describe('PurposeConstellation · nothing is a measured pixel', () => {
  it('should express the connector lengths as one formula, never as literals', () => {
    /* FR-014. The frame draws 394 / 244 / 94; they are
       `100% − card − nodeX − i·step − offset` and appear nowhere as numbers.
       Card heights (228 / 187 / 146) are intrinsic, so they are absent too. */
    const style = styleDeclarations('PurposeConstellation.vue')

    for (const literal of ['394', '244', '94', '228', '187', '146']) {
      expect(style, literal).not.toContain(literal)
    }

    expect(style).toContain('--purpose-link-revealed: calc(')
    expect(style).toContain('var(--purpose-node-step)')
  })

  it('should give the card no height of its own when mounted', () => {
    /* FR-015: the stack is copy-driven, so a longer locale grows its own card
       and the radar stays centred on it. A height token would freeze the
       Spanish line count into the layout. The connector's 1px is the only
       `height` the component is allowed to declare. */
    const style = styleDeclarations('PurposeConstellation.vue')
    const heights = [...style.matchAll(/(?:^|[\s;{])(min-)?height:\s*([^;]+)/g)]

    expect(
      heights.map(([, prefix, value]) => `${prefix ?? ''}${value}`)
    ).toEqual(['var(--purpose-link-h)'])
  })
})

describe('PurposeConstellation · the paint-order contract', () => {
  /**
   * The eleven properties that would create a stacking context, from
   * `SectionBackdrop.vue`'s contract. The failure mode is silent — the
   * section's glows simply move above the page-wide dot sheet — so it is
   * asserted mechanically here and measured on the generated page as well
   * (spec FR-030).
   *
   * The trigger's `translate`, the card's `opacity` and every glass surface's
   * `backdrop-filter` are permitted: each contains only its own subtree, and
   * the backdrop is a sibling of this whole component rather than a
   * descendant.
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

  it('should create no stacking context on the root or any row when mounted', () => {
    const wrapper = mountConstellation()
    const suspects = [
      wrapper.classes(),
      ...wrapper.findAll('.node').map(r => r.classes()),
    ]

    for (const classes of suspects) {
      for (const utility of STACKING_CONTEXT_UTILITIES) {
        expect(
          classes.some(name => name.includes(utility)),
          `${utility} in [${classes.join(' ')}]`
        ).toBe(false)
      }
    }
  })

  it('should paint no background on the root or any row when mounted', () => {
    /* An opaque background anywhere between the section and its content would
       hide the section's own glows, which paint at a negative level. */
    const wrapper = mountConstellation()
    const suspects = [
      wrapper.classes(),
      ...wrapper.findAll('.node').map(r => r.classes()),
    ]

    for (const classes of suspects) {
      expect(classes.some(name => name.startsWith('bg-'))).toBe(false)
    }
  })

  it('should leave the display decision to the caller when mounted', () => {
    /* The section chooses which composition renders (`hidden lg:flex`), so
       declaring `flex` here would fight the `lg:` that switches it on. */
    expect(mountConstellation().classes()).not.toContain('flex')
    expect(mountConstellation().classes()).toContain('flex-col')
  })
})
