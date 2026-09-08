import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BotonPrimario, {
  type ButtonVariant,
} from '@/shared/ui/BotonPrimario.vue'
import buttonSource from '@/shared/ui/BotonPrimario.vue?raw'

/** Padding and label role per variant, from design-extract.md § 4. */
const sizeByVariant: Record<ButtonVariant, string[]> = {
  nav: ['py-btn-nav-y', 'px-btn-nav-x', 'text-button-sm'],
  hero: ['py-btn-y', 'px-btn-hero-x', 'text-button'],
  submit: ['py-btn-y', 'px-btn-submit-x', 'text-button'],
}

describe('BotonPrimario', () => {
  it('should render a button when no href is given', () => {
    const wrapper = mount(BotonPrimario)

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('href')).toBeUndefined()
  })

  it('should render a link when an href is given', () => {
    const wrapper = mount(BotonPrimario, { props: { href: '#contacto' } })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('#contacto')
    expect(wrapper.attributes('type')).toBeUndefined()
  })

  it('should default its type to submit when the variant is submit', () => {
    const wrapper = mount(BotonPrimario, { props: { variant: 'submit' } })

    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('should default its type to button when the variant is not submit', () => {
    const wrapper = mount(BotonPrimario, { props: { variant: 'nav' } })

    expect(wrapper.attributes('type')).toBe('button')
  })

  it('should honour an explicit type when one is given', () => {
    const wrapper = mount(BotonPrimario, {
      props: { variant: 'submit', type: 'button' },
    })

    expect(wrapper.attributes('type')).toBe('button')
  })

  for (const [variant, expectedClasses] of Object.entries(sizeByVariant)) {
    it(`should emit its documented padding and label size when the variant is ${variant}`, () => {
      const wrapper = mount(BotonPrimario, {
        props: { variant: variant as ButtonVariant },
      })

      for (const expected of expectedClasses) {
        expect(wrapper.classes()).toContain(expected)
      }
      // Fill, radius and the ring are identical across all three variants.
      expect(wrapper.classes()).toContain('bg-glass-dark')
      expect(wrapper.classes()).toContain('rounded-control')
      expect(wrapper.classes()).toContain('led')
    })
  }

  it('should offer a pointer when it renders as a link', () => {
    /* The user agent would give an `<a href>` a pointer anyway; it is declared
       so the two branches stop depending on which element they happen to be
       (`findings.md` § R56). */
    const wrapper = mount(BotonPrimario, { props: { href: '#contacto' } })

    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  it('should offer a pointer when it renders as a form submit', () => {
    /* A submit always does something: submitting is native to the element. */
    const wrapper = mount(BotonPrimario, { props: { variant: 'submit' } })

    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  for (const variant of ['nav', 'hero'] as const) {
    it(`should offer no pointer when the ${variant} variant has no destination`, () => {
      /* The state the Hero's primary CTA is in while section 05 does not
         exist: a `<button type="button">` with no href and no handler, which
         does nothing when clicked. `ui-map.md` § 6 rules on exactly this shape
         — "un espacio reservado que parece clickeable y no lleva a nada se lee
         como sitio roto". */
      const wrapper = mount(BotonPrimario, { props: { variant } })

      expect(wrapper.element.tagName).toBe('BUTTON')
      expect(wrapper.classes()).not.toContain('cursor-pointer')
    })
  }

  it('should offer no pointer when a submit variant is overridden to a plain button', () => {
    /* The override makes it inert, so the cursor follows the resolved type and
       not the variant name. */
    const wrapper = mount(BotonPrimario, {
      props: { variant: 'submit', type: 'button' },
    })

    expect(wrapper.classes()).not.toContain('cursor-pointer')
  })

  it('should render the caller-supplied label when slot content is given', () => {
    const wrapper = mount(BotonPrimario, {
      slots: { default: 'Cuéntanos tu proyecto' },
    })

    expect(wrapper.text()).toBe('Cuéntanos tu proyecto')
  })

  it('should use three gradient stops and no wine when its source is inspected', () => {
    // No wine token in any form: `--wine-400`, `wine-400`, `bg-wine-300`…
    expect(buttonSource).not.toMatch(/wine-[1-5]00/i)
    expect(buttonSource).toContain('var(--red-400) 0%')
    expect(buttonSource).toContain('var(--bone-100) 50%')
    expect(buttonSource).toContain('var(--red-400) 100%')
  })

  it('should ship no client-side script when its source is inspected', () => {
    expect(buttonSource).not.toContain('onMounted')
    expect(buttonSource).not.toContain('addEventListener')
    expect(buttonSource).not.toMatch(/@(click|mouseenter|mouseleave)/)
  })
})
