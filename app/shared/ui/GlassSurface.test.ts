import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GlassSurface from '@/shared/ui/GlassSurface.vue'

/** Feature 42 · FR-010, contract § 1, pen extract § 3. */
const PANEL = [
  'bg-vidrio-fondo',
  'rounded-panel',
  'backdrop-blur-vidrio',
  'borde-luz',
  'borde-panel',
  'shadow-vidrio',
  'p-panel',
]
const SERVICIO = [
  'bg-negro-900',
  'rounded-servicio',
  'borde-luz',
  'borde-tarjeta',
  'overflow-clip',
]
const FRANJA = [
  'bg-franja-fondo',
  'rounded-franja',
  'backdrop-blur-boton',
  'borde-luz',
  'borde-plano',
  'py-franja-y',
  'px-franja-x',
]
/** Classes every surface carries regardless of preset. */
const BASE = ['relative']

function surfaceClasses(props: Record<string, unknown> = {}) {
  return mount(GlassSurface, { props }).classes()
}

describe('GlassSurface', () => {
  for (const [preset, expected] of [
    ['panel', PANEL],
    ['servicio', SERVICIO],
    ['franja', FRANJA],
  ] as const) {
    it(`should render exactly the ${preset} class set when given the ${preset} preset`, () => {
      expect(surfaceClasses({ preset }).sort()).toEqual(
        [...BASE, ...expected].sort()
      )
    })
  }

  it('should render the panel preset when given no props', () => {
    expect(surfaceClasses().sort()).toEqual([...BASE, ...PANEL].sort())
  })

  it('should replace only the radius when a radius override is given', () => {
    const classes = surfaceClasses({ preset: 'panel', radius: 'franja' })

    expect(classes).toContain('rounded-franja')
    expect(classes).not.toContain('rounded-panel')
    for (const kept of PANEL.filter(name => name !== 'rounded-panel')) {
      expect(classes).toContain(kept)
    }
  })

  it('should drop the shadow and add clipping when those overrides are given', () => {
    const classes = surfaceClasses({
      preset: 'panel',
      shadow: false,
      clip: true,
    })

    expect(classes).not.toContain('shadow-vidrio')
    expect(classes).toContain('overflow-clip')
  })

  it('should drop the blur when the blur override is none', () => {
    expect(surfaceClasses({ preset: 'franja', blur: 'none' })).not.toContain(
      'backdrop-blur-boton'
    )
  })

  it('should render the requested root tag when given as', () => {
    const wrapper = mount(GlassSurface, { props: { as: 'article' } })

    expect(wrapper.element.tagName).toBe('ARTICLE')
  })

  it('should render a div when given no as', () => {
    expect(mount(GlassSurface).element.tagName).toBe('DIV')
  })

  it('should render its slot content when given some', () => {
    const wrapper = mount(GlassSurface, {
      slots: { default: '<p>Estrategia tecnológica</p>' },
    })

    expect(wrapper.find('p').text()).toBe('Estrategia tecnológica')
  })
})
