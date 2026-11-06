import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Heading from '@/shared/ui/Heading.vue'

/** Feature 42 · FR-006, FR-014, contract § 6, pen extract §§ 4, 8. */
const FIRST = 'Hablamos negocio'
const SECOND = 'y código.'

function render(props: Record<string, unknown> = {}, attrs = {}) {
  return mount(Heading, {
    props: { first: FIRST, second: SECOND, ...props },
    attrs,
  })
}

describe('Heading', () => {
  for (const level of [1, 2, 3] as const) {
    it(`should render an h${level} when the level is ${level}`, () => {
      expect(render({ level }).element.tagName).toBe(`H${level}`)
    })
  }

  it('should render an h2 when given no level', () => {
    expect(render().element.tagName).toBe('H2')
  })

  for (const size of [
    'hero',
    'seccion',
    'proceso',
    'diagnostico',
    'pagina',
    'estado',
    'legal',
  ] as const) {
    it(`should use the ${size} type token when the size is ${size}`, () => {
      expect(render({ size }).classes()).toContain(`text-${size}`)
    })
  }

  it('should use the section size when given no size', () => {
    expect(render().classes()).toContain('text-seccion')
  })

  it('should set the heading in Poppins when rendered', () => {
    expect(render().classes()).toContain('font-titulo')
  })

  it('should pass a caller class to the heading element when given one', () => {
    /* Per-use mobile sizes (30 / 32 / 34 px) are features 44 and 46's. */
    expect(render({}, { class: 'mt-gutter' }).classes()).toContain('mt-gutter')
  })

  it('should colour line 1 Blanco and line 2 Gris 400 when given two lines', () => {
    const [first, second] = render().findAll('span')

    expect(first?.classes()).toEqual(['block', 'text-blanco'])
    expect(second?.classes()).toEqual(['block', 'text-gris-400'])
  })

  it('should render one line only when given no second line', () => {
    const wrapper = render({ second: undefined })

    expect(wrapper.findAll('span')).toHaveLength(1)
    expect(wrapper.text()).toBe(FIRST)
  })

  it('should read as one heading with both lines in order when rendered', () => {
    expect(render().element.textContent).toBe(`${FIRST} ${SECOND}`)
  })
})
