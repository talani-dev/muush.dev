import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BotonPrimario, {
  type ButtonVariant,
} from '@/shared/ui/BotonPrimario.vue'
import buttonSource from '@/shared/ui/BotonPrimario.vue?raw'

/*
 * Read as a file rather than imported: the Tailwind Vite plugin claims every
 * `.css` request, so `@/assets/css/global.css?raw` resolves to an empty string
 * and any assertion over it would pass against nothing — the trap
 * `SectionGlow.test.ts` records. Resolved from Vitest's root, which is this
 * repository; it is a path and not an import, so Article XII does not apply.
 */
const globalCss = readFileSync(
  resolve(process.cwd(), 'app/assets/css/global.css'),
  'utf8'
)

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
      // Fill, shape and the ring are identical across all three variants.
      expect(wrapper.classes()).toContain('bg-glass-dark')
      expect(wrapper.classes()).toContain('rounded-full')
      expect(wrapper.classes()).toContain('led')
    })
  }

  it('should offer no way to ask for the old rectangle when its source is inspected', () => {
    /* The pill is the shape, not a shape (Roberto, 2026-09-08): every instance
       rounds, so there is no prop and no variant to switch it back, and the
       12px control radius is gone from this component entirely. A caller that
       wanted the rectangle would have to add an API for it, which is a visible
       change rather than a class slipping back in.

       Two assertions and no prose-sensitive third one on purpose: a guard that
       greps for an English word is the trap § R56 of `findings.md` records,
       where a doc comment turned this file red. `rounded-control` and an
       arbitrary radius are class strings, not prose. */
    expect(buttonSource).not.toContain('rounded-control')
    expect(buttonSource).not.toMatch(/rounded-\[/)
  })

  it('should keep the control radius token alive when this component no longer consumes it', () => {
    /* This component was `--radius-control`'s last consumer, so as of feature
       022 nothing in `app/` references the token. It is not dead code: 12px is
       still the design's control radius, and the consumer that is coming is
       **`FormField`** — `design-extract.md § FormField`, `cornerRadius 12`, 13
       uses across the two forms. Deleting it would throw away a design
       measurement so the forms feature could reinvent it.

       Asserted here, on the stylesheet source, because Tailwind v4 tree-shakes
       an unreferenced custom property out of the build: the token is not in
       `.output/public` at all, so the artefact cannot speak for it. And
       asserted at all because a comment is not a guard — an unconsumed token
       protected only by prose is exactly how `SectionGlow`'s `'920'` variant
       nearly went out as dead code.

       Retire this the day `FormField` lands: from then on its own test is what
       keeps the token honest. */
    expect(globalCss).toMatch(/--radius-control:\s*0\.75rem/)
  })

  it('should carry the nav variant tokens sized for the 221×48 CTA box', () => {
    /* Feature 21 — 13/24/14px → 15/28/15px so the nav CTA (with its new
       leading arrow, added in `SiteNav.vue`) measures 221×48 at 1440px.
       `-x` corrected in review round 1 (1.75rem measured 232.546875×48 live
       via CDP, 11.5px over) to `1.3892rem`, derived from that same live
       measurement: (221 − 176.546875 content px) ÷ 2. Read from source, not
       the emitted stylesheet — a minifier is free to reformat `0.9375rem`
       and this assertion should not depend on that (contrast
       `--radius-control` above, same technique). */
    expect(globalCss).toMatch(/--spacing-btn-nav-y:\s*0\.9375rem/)
    expect(globalCss).toMatch(/--spacing-btn-nav-x:\s*1\.3892rem/)
    expect(globalCss).toMatch(/--text-button-sm:\s*0\.9375rem/)
  })

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
