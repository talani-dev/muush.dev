import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CommitmentChip from './CommitmentChip.vue'

/** Feature 44 · FR-021; pen extract-44 § 4. */
function render() {
  return mount(CommitmentChip, {
    props: {
      text: 'Te decimos qué te conviene',
      icon: 'message-circle-warning',
    },
  })
}

describe('CommitmentChip', () => {
  it('should carry the lucide glyph in a red bubble from lg when rendered', () => {
    const chip = render().find('[data-compromiso="escritorio"]')
    const bubble = chip.find('span[aria-hidden="true"]')

    expect(chip.classes()).toEqual(
      expect.arrayContaining([
        'hidden',
        'lg:inline-flex',
        'h-compromiso-alto',
        'borde-barra',
        /* Pen extract-44 § 10: 8 / 10 / 8 / 8, gap 6, blur 16. */
        'py-compromiso',
        'ps-compromiso',
        'pe-compromiso-fin',
        'gap-chip-gap',
        'backdrop-blur-pill',
      ])
    )
    expect(bubble.classes()).toEqual(
      expect.arrayContaining(['size-burbuja', 'bg-rojo-15'])
    )
    expect(bubble.find('.icono').classes()).toContain('text-compromiso-icono')
    expect(bubble.find('title').text()).toBe('lucide · message-circle-warning')
    /* The glyph's <title> sits inside the aria-hidden bubble. */
    expect(chip.text()).toMatch(/Te decimos qué te conviene$/)
  })

  it('should swap to the red mobile chip with a dot and no icon below lg when rendered', () => {
    const chip = render().find('[data-compromiso="movil"]')

    expect(chip.classes()).toEqual(
      expect.arrayContaining([
        'lg:hidden',
        'bg-rojo-10',
        'borde-rojo',
        'text-compromiso-movil',
      ])
    )
    expect(chip.find('svg').exists()).toBe(false)
    expect(chip.find('span').classes()).toContain('size-compromiso-movil-punto')
  })
})
