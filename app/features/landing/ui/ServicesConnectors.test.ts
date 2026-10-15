import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import {
  connectorEndpoints,
  connectorFloatVars,
  SERVICE_NODE_CENTRES,
} from '@/features/landing/data/servicesContent'
import ServicesConnectors from './ServicesConnectors.vue'

/**
 * Feature 34 · the four desktop connector lines, extracted from
 * `ServicesConstellation.vue` so each line can follow the float of the two
 * radars it joins. Seen red first (`findings.md` § R39).
 *
 * `happy-dom` resolves no `calc()` / `sin()`, so the glue itself is measured
 * in a real browser (quickstart § 1). This file proves the structure the glue
 * depends on: the resting geometry, the per-line inputs and the shared
 * formulas.
 */
const connectors = connectorEndpoints(SERVICE_NODE_CENTRES)

const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

function mountConnectors() {
  const wrapper = mount(ServicesConnectors, { props: { connectors } })
  mounted.push(wrapper)
  return wrapper
}

/** The `<style scoped>` block, comments stripped, whitespace collapsed. */
function styleDeclarations(): string {
  const source = readFileSync(
    join(
      process.cwd(),
      'app',
      'features',
      'landing',
      'ui',
      'ServicesConnectors.vue'
    ),
    'utf8'
  )
  /* Whitespace collapsed, so the formatter's line wrapping of a long
     `calc(… sin(…))` cannot break an assertion on the expression. */
  return source
    .slice(source.lastIndexOf('<style scoped>'))
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/\s+/g, ' ')
    .replaceAll('( ', '(')
    .replaceAll(' )', ')')
}

describe('ServicesConnectors · the resting geometry', () => {
  it('should render four lines on the confirmed radar centres when mounted', () => {
    const lines = mountConnectors().findAll('line')

    expect(
      lines.map(line => ({
        x1: Number(line.attributes('x1')),
        y1: Number(line.attributes('y1')),
        x2: Number(line.attributes('x2')),
        y2: Number(line.attributes('y2')),
      }))
    ).toEqual(connectors)
  })

  it('should give each line its own frame and the float inputs of the two nodes it joins', () => {
    /* One <svg> per line, so the shear lives on a CSS box and never on an
       SVG child (FR-007; see the template note). The inputs inherit. */
    const frames = mountConnectors().findAll('svg')

    expect(frames).toHaveLength(4)
    frames.forEach((frame, index) => {
      const connector = connectors[index]
      if (!connector) throw new Error(`no connector ${index}`)
      expect(frame.findAll('line')).toHaveLength(1)
      const style = (frame.element as unknown as HTMLElement).style
      for (const [name, value] of Object.entries(
        connectorFloatVars(connector, index)
      )) {
        expect(style.getPropertyValue(name), name).toBe(value)
      }
    })
  })

  it('should keep the 1440×910 frame and stay decorative when mounted', () => {
    for (const svg of mountConnectors().findAll('svg')) {
      expect(svg.attributes('aria-hidden')).toBe('true')
      expect(svg.attributes('viewBox')).toBe('0 0 1440 910')
      expect(svg.classes()).not.toContain('size-full')
    }
  })
})

describe('ServicesConnectors · lines follow the float (research R1)', () => {
  it('should size the svg to the fixed frame instead of the canvas (OA-3)', () => {
    const style = styleDeclarations()

    expect(style).toContain('width: var(--services-canvas-w)')
    expect(style).toContain('height: var(--services-canvas-h)')
    expect(style).toContain('overflow: visible')
  })

  it('should derive both line ends from the shared clock', () => {
    const style = styleDeclarations()

    expect(style).toContain(
      'sin(var(--services-float-phase) + var(--i-a) * var(--services-float-phase-step))'
    )
    expect(style).toContain(
      'sin(var(--services-float-phase) + var(--i-b) * var(--services-float-phase-step))'
    )
  })

  it('should move each line by the exact vertical shear of its two ends', () => {
    const style = styleDeclarations()

    expect(style).toContain(
      'translate(0, calc(var(--shift) * var(--services-frame-px))) skewY(atan(var(--slope)))'
    )
    expect(style).toContain('transform-origin: 0 0')
    expect(style).toContain('vector-effect: non-scaling-stroke')
  })

  it('should hold no literal coordinate when the style is read', () => {
    const style = styleDeclarations()

    for (const literal of ['150', '330', '430', '690', '950', '1150']) {
      expect(style, literal).not.toContain(literal)
    }
  })
})
