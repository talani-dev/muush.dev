import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CommitmentChip from './CommitmentChip.vue'
import { HOW_WE_WORK_COPY } from './landingFixtures.testing'
import ProcessStep from './ProcessStep.vue'

/**
 * Feature 44 · FR-018, FR-021, FR-022, FR-043…FR-047; pen extract-44 § 4.
 * `lit` drives both the rail and the column here unless `columnLit` is
 * given apart, so each case reads as one state.
 */
function render(
  lit: boolean,
  index = 0,
  isLast = false,
  columnLit: boolean = lit
) {
  const step = HOW_WE_WORK_COPY.es.steps[index]
  if (!step) throw new Error('fixture missing')
  return mount(ProcessStep, {
    props: { ...step, lit, columnLit, fill: 0.25, isLast },
  })
}

describe('ProcessStep', () => {
  it('should light the column dot, number and description when column-lit', () => {
    const wrapper = render(true)
    const [halo, number] = wrapper.findAll(
      'li > span[aria-hidden="true"], li > div > span[aria-hidden="true"]'
    )

    expect(wrapper.attributes('data-column-lit')).toBe('true')
    /* Pen extract-44 § 11: only the red core, pinging; no static halo. */
    expect(halo?.classes()).not.toContain('bg-rojo-20')
    expect(halo?.classes()).not.toContain('bg-blanco-6')
    expect(halo?.find('span').classes()).toEqual(
      expect.arrayContaining(['bg-red-muush-500', 'pulso', 'relative'])
    )
    /* FR-046 (Roberto review 2026-11-02): Blanco in both states. */
    expect(number?.classes()).toContain('text-blanco')
    expect(number?.classes()).not.toContain('text-coral-300')
    expect(wrapper.find('p').classes()).toContain('lg:text-blanco-85')
  })

  it('should dim the column dot and description, pinging in grey, when not column-lit', () => {
    const wrapper = render(false)
    const [halo, number] = wrapper.findAll(
      'li > span[aria-hidden="true"], li > div > span[aria-hidden="true"]'
    )

    expect(wrapper.attributes('data-column-lit')).toBeUndefined()
    /* FR-047 (Roberto 2026-11-02): the not-lit dot pings too, in its
       ring's Blanco 40 % (`pulso-tenue`), never in red. */
    expect(halo?.find('span').classes()).toEqual(
      expect.arrayContaining([
        'bg-negro-950',
        'border-texto-tenue',
        'pulso',
        'pulso-tenue',
        'relative',
      ])
    )
    expect(number?.classes()).toContain('text-blanco')
    expect(number?.classes()).not.toContain('text-gris-400')
    expect(wrapper.find('p').classes()).toContain('lg:text-gris-400')
  })

  it('should keep the title Blanco in an h3 led by the mobile number when rendered', () => {
    const title = render(false).find('h3')

    expect(title.classes()).toEqual(
      expect.arrayContaining(['text-paso', 'text-blanco'])
    )
    expect(title.find('span').attributes('aria-hidden')).toBe('true')
    expect(title.find('span').classes()).toContain('lg:hidden')
    expect(title.text().replace(/\s+/g, ' ')).toBe('01 Diagnóstico')
  })

  it('should show the short sentence below lg and the full one from lg when the step has both', () => {
    const [full, short] = render(true).find('p').findAll('span')

    expect(full?.classes()).toEqual(['hidden', 'lg:inline'])
    expect(full?.text()).toContain('Si hace falta ir a fondo')
    expect(short?.classes()).toEqual(['lg:hidden'])
    expect(short?.text()).toBe(
      'Una revisión rápida para ver qué conviene resolver.'
    )
  })

  it('should render one description when the step has no short one', () => {
    const description = render(true, 1).find('p')

    expect(description.findAll('span')).toHaveLength(0)
    expect(description.text()).toBe('Alcance, tiempos y costo por escrito.')
  })

  it('should fill its rail segment by the given share except on the last step', () => {
    const segment = render(true).find('[data-segmento]')

    expect(segment.attributes('style')).toContain('--relleno: 0.25')
    expect(segment.find('span').classes()).toContain('scale-y-(--relleno)')
    expect(render(true, 4, true).find('[data-segmento]').exists()).toBe(false)
  })

  it('should end with the commitment chip when rendered', () => {
    expect(render(false, 2).findComponent(CommitmentChip).props()).toEqual({
      text: 'Tú apruebas cada pantalla',
      icon: 'user-round',
    })
  })

  it('should ping the rail dot red when lit and grey when not', () => {
    const railDot = (lit: boolean) =>
      render(lit).find('li > div[aria-hidden="true"] > span')

    expect(railDot(true).classes()).toEqual(
      expect.arrayContaining(['bg-red-muush-500', 'pulso', 'size-riel-punto'])
    )
    expect(railDot(true).classes()).not.toContain(
      'border-(length:--trazo-anillo)'
    )
    expect(railDot(true).classes()).not.toContain('pulso-tenue')
    expect(railDot(false).classes()).toEqual(
      expect.arrayContaining(['border-texto-tenue', 'pulso', 'pulso-tenue'])
    )
  })

  it('should grow from its top-left corner only when raised and motion is allowed', async () => {
    const wrapper = render(true)
    const RAISE = 'motion-safe:lg:scale-(--paso-escala)'

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'lg:origin-top-left',
        'lg:transition-transform',
        'lg:duration-(--medio)',
        'motion-reduce:transition-none',
      ])
    )
    expect(wrapper.classes()).not.toContain(RAISE)
    expect(wrapper.attributes('data-elevado')).toBeUndefined()

    await wrapper.setProps({ raised: true })
    expect(wrapper.classes()).toContain(RAISE)
    expect(wrapper.attributes('data-elevado')).toBe('true')
  })

  it('should be a tab stop with a focus ring only when focusable', async () => {
    const wrapper = render(false)

    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.classes()).toContain('foco')
    await wrapper.setProps({ focusable: true })
    expect(wrapper.attributes('tabindex')).toBe('0')
  })

  it('should mark the desktop dot the line splits at when rendered', () => {
    const dot = render(false).find('[data-punto-paso]')

    expect(dot.classes()).toEqual(
      expect.arrayContaining(['size-paso-punto', 'lg:grid'])
    )
  })

  it('should show the number in Blanco on the mobile title too when rendered', () => {
    const title = render(false, 3).find('h3')

    expect(title.classes()).toContain('text-blanco')
    /* The number inherits the title's Blanco: no colour of its own. */
    expect(
      title
        .find('span')
        .classes()
        .filter(name => /^(lg:)?text-(?!paso)/.test(name))
    ).toEqual([])
  })

  it('should keep the rail and the column states apart when they differ', () => {
    /* FR-044: the rail is lit by the scroll (full by default) while the
       desktop column rests unlit until previewed. */
    const wrapper = render(true, 0, false, false)
    const railDot = wrapper.find('li > div[aria-hidden="true"] > span')
    const columnDot = wrapper.find('[data-punto-paso] > span')

    expect(wrapper.attributes('data-lit')).toBe('true')
    expect(wrapper.attributes('data-column-lit')).toBeUndefined()
    expect(railDot.classes()).toContain('bg-red-muush-500')
    expect(columnDot.classes()).toContain('pulso-tenue')
    expect(wrapper.find('p').classes()).toContain('lg:text-gris-400')
  })

  it('should rest unlit as a column when no column state is given', () => {
    const step = HOW_WE_WORK_COPY.es.steps[0]
    if (!step) throw new Error('fixture missing')
    const wrapper = mount(ProcessStep, {
      props: { ...step, lit: true, fill: 1, isLast: false },
    })

    expect(wrapper.attributes('data-column-lit')).toBeUndefined()
  })

  it('should paint no static halo around the desktop dot in either state', () => {
    /* FR-048 (Roberto 2026-11-02): the drawn halo is the radar ping; a
       static Blanco 6 % disc behind the unlit dot read as a second trail. */
    for (const columnLit of [false, true]) {
      const wrapper = render(columnLit, 0, false, columnLit)
      const halo = wrapper.find('[data-punto-paso]')

      expect(
        halo
          .classes()
          .filter(name => /^(lg:)?(bg|border|shadow|ring)-/.test(name))
      ).toEqual([])
      expect(halo.attributes('style')).toBeUndefined()
    }
  })
})
