import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DotGrid from '@/shared/ui/DotGrid.vue'

/*
 * Both files are read from disk rather than imported. The Tailwind Vite plugin
 * claims every `.css` request, so `global.css?raw` resolves to an empty string
 * and every assertion would pass against nothing; and a `<style scoped>` block
 * never reaches a mounted component under `happy-dom`, which does no styling
 * at all. Paths are built from Vitest's root with `node:path`, never with
 * `new URL` (docs/business/rules.md §§ R16, R27) — precedent:
 * `SectionGlow.test.ts`.
 */
const globalCss = readFileSync(
  resolve(process.cwd(), 'app/assets/css/global.css'),
  'utf8'
)

const dotGridSource = readFileSync(
  resolve(process.cwd(), 'app/shared/ui/DotGrid.vue'),
  'utf8'
)

/** The three values the dotted paper resolves — colour, dot radius, grid step. */
const DOT_PAPER_TOKENS = [
  '--dot-paper-color',
  '--dot-paper-radius',
  '--dot-paper-step',
] as const

describe('DotGrid', () => {
  it('should render exactly one element when mounted', () => {
    /*
     * The anti-tiling assertion (spec FR-001). The design file draws 144
     * ellipses per tile and instances the tile 90 times over the page; if that
     * construction were ever reproduced, this is where it shows up — 12 960
     * nodes instead of one.
     */
    const wrapper = mount(DotGrid)

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.element.children).toHaveLength(0)
    expect(wrapper.text()).toBe('')
  })

  it('should hide itself from assistive technology when rendered', () => {
    const wrapper = mount(DotGrid)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('should never intercept pointer events when rendered', () => {
    /* It covers the entire page, so a single missed `pointer-events-none`
       would swallow every click on the site. */
    const wrapper = mount(DotGrid)

    expect(wrapper.classes()).toContain('pointer-events-none')
  })

  it('should fill its host rather than the viewport when rendered', () => {
    /* `inset-0` against a positioned, full-document ancestor is what makes the
       sheet reach the footer of a 5000px page; the ancestor is the layout's
       obligation (contracts/components.md § Host contract). */
    const wrapper = mount(DotGrid)

    expect(wrapper.classes()).toContain('absolute')
    expect(wrapper.classes()).toContain('inset-0')
  })

  it('should resolve its pattern from the dot-paper tokens when rendered', () => {
    /*
     * The cross-file half of the contract, and the half no compiler sees: the
     * component names custom properties inside a `<style scoped>` block and
     * `global.css` declares them, with nothing connecting the two. A token
     * renamed on one side only still typechecks, still builds, and paints a
     * blank sheet — the silent failure `rules.md` § R18 exists because of.
     *
     * Asserting the token names rather than `12%` / `1.5rem` is the point: a
     * literal here would let someone bypass the token and still pass.
     */
    for (const token of DOT_PAPER_TOKENS) {
      expect(dotGridSource, token).toContain(`var(${token})`)
      expect(globalCss, token).toContain(`${token}:`)
    }
  })

  it('should sit on the dot layer when rendered', () => {
    /* Above the section glows and below all content — the child order of frame
       `SdEJx` and the single visual requirement of the background
       (spec FR-005). */
    expect(dotGridSource).toContain('z-index: var(--layer-dots)')
    expect(globalCss).toContain('--layer-dots:')
  })

  it('should carry no colour or size literal when rendered', () => {
    /* Constitution Article VII, checked against the source because the values
       live in CSS the DOM never sees here. `2.5px`, `24px` and `#D9D9D9` are
       the three the design writes and the three a shortcut would reach for. */
    const declarations = (dotGridSource.split('<style scoped>')[1] ?? '')
      /* Comments are prose and cite the design's own `2.5px` / `24px`; what is
         under test is what the browser reads. */
      .replaceAll(/\/\*[\s\S]*?\*\//g, '')

    expect(declarations).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(declarations).not.toMatch(/\b\d+(\.\d+)?(px|rem|em)\b/)
  })
})
