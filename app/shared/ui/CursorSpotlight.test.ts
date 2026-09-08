import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CursorSpotlight from '@/shared/ui/CursorSpotlight.vue'

/*
 * Both files are read from disk rather than imported. The Tailwind Vite plugin
 * claims every `.css` request, so `global.css?raw` resolves to an empty string
 * and every assertion would pass against nothing; and a `<style scoped>` block
 * never reaches a mounted component under `happy-dom`, which does no styling
 * at all. Paths come from Vitest's root with `node:path`, never `new URL`
 * (docs/business/rules.md §§ R16, R27) — precedent: `DotGrid.test.ts`.
 */
const globalCss = readFileSync(
  resolve(process.cwd(), 'app/assets/css/global.css'),
  'utf8'
)

const source = readFileSync(
  resolve(process.cwd(), 'app/shared/ui/CursorSpotlight.vue'),
  'utf8'
)

/** The `<style scoped>` block with its prose removed — what the browser reads. */
const declarations = (source.split('<style scoped>')[1] ?? '').replaceAll(
  /\/\*[\s\S]*?\*\//g,
  ''
)

/**
 * Every token this feature added, and the layer level it paints on. Each must
 * be named by the component **and** declared in `global.css`; neither half
 * alone is worth anything.
 */
const SPOTLIGHT_TOKENS = [
  '--spotlight-red-400-42',
  '--spotlight-red-400-17',
  '--spotlight-red-400-37',
  '--spotlight-stop-mid',
  '--spotlight-outer-size',
  '--spotlight-core-size',
  '--dot-paper-lit-color',
  '--duration-spotlight-fade',
  '--layer-spotlight',
] as const

/** Shared with `DotGrid`, and the reason the two sheets cannot drift apart. */
const DOT_PAPER_TOKENS = [
  '--dot-paper-lit-color',
  '--dot-paper-radius',
  '--dot-paper-step',
] as const

describe('CursorSpotlight', () => {
  it('should render four nested elements holding no content when mounted', () => {
    /* root → beam → window → lit (contracts/components.md § 1). The window
       exists so the mask can stay still while the beam moves; collapsing it
       into the beam is what would put a repaint on every frame. */
    const wrapper = mount(CursorSpotlight)
    const root = wrapper.element

    expect(root.tagName).toBe('DIV')
    expect(root.children).toHaveLength(1)

    const beam = root.children[0]
    expect(beam?.className).toContain('cursor-spotlight__beam')
    expect(beam?.children).toHaveLength(1)

    const window = beam?.children[0]
    expect(window?.className).toContain('cursor-spotlight__window')
    expect(window?.children).toHaveLength(1)

    const lit = window?.children[0]
    expect(lit?.className).toContain('cursor-spotlight__lit')
    expect(lit?.children).toHaveLength(0)
    expect(wrapper.text()).toBe('')
  })

  it('should hide itself from assistive technology when rendered', () => {
    const wrapper = mount(CursorSpotlight)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('should never intercept pointer events when rendered', () => {
    /* It covers the entire page. A single missed `pointer-events-none` would
       swallow every click on the site (FR-015). */
    const wrapper = mount(CursorSpotlight)

    expect(wrapper.classes()).toContain('pointer-events-none')
  })

  it('should fill its host rather than the viewport when rendered', () => {
    /* `inset-0` against the layout root, which spans the document — the same
       host contract `DotGrid` has. */
    const wrapper = mount(CursorSpotlight)

    expect(wrapper.classes()).toContain('absolute')
    expect(wrapper.classes()).toContain('inset-0')
  })

  it('should take no props and expose no configuration when mounted', () => {
    /* There is one spotlight in the design, at one size, with one recipe
       (contracts/components.md § 1). */
    expect(CursorSpotlight.props).toBeUndefined()
    expect(mount(CursorSpotlight).attributes('style')).toBeUndefined()
  })

  it('should sit on the spotlight layer when rendered', () => {
    /* Above the dot sheet and below all content — the third negative level
       (docs/business/rules.md § R37, spec FR-016). */
    expect(declarations).toContain('z-index: var(--layer-spotlight)')
    expect(globalCss).toContain('--layer-spotlight:')
  })

  it('should resolve every value it paints from a declared token when rendered', () => {
    /*
     * The cross-file half of the contract, and the half no compiler sees: the
     * component names custom properties inside a `<style scoped>` block and
     * `global.css` declares them, with nothing connecting the two. A token
     * renamed on one side only still typechecks, still builds, and paints
     * nothing at all — the silent failure `rules.md` § R18 exists because of.
     */
    for (const token of SPOTLIGHT_TOKENS) {
      expect(declarations, token).toContain(`var(${token}`)
      expect(globalCss, token).toContain(`${token}:`)
    }
  })

  it('should resolve the lit dots from the same dot-paper tokens as DotGrid', () => {
    /* FR-009: the two sheets must resolve the *same* geometry or they separate
       the moment the visitor changes their text size. */
    for (const token of DOT_PAPER_TOKENS) {
      expect(declarations, token).toContain(`var(${token})`)
      expect(globalCss, token).toContain(`${token}:`)
    }
  })

  it('should register the lit sheet against the base grid when rendered', () => {
    /*
     * The one declaration that stops the second dot pattern showing as doubled
     * dots (FR-006). Asserted as source rather than as pixels because
     * `happy-dom` does no styling; that `mod()` actually *resolves* is a
     * browser measurement (`research.md` § R3, `quickstart.md` § 4).
     */
    expect(declarations).toMatch(
      /mod\(var\(--spotlight-beam-x\), var\(--dot-paper-step\)\)/
    )
    expect(declarations).toMatch(
      /mod\(var\(--spotlight-beam-y\), var\(--dot-paper-step\)\)/
    )
  })

  it('should stop the page growing under a beam near its edge when rendered', () => {
    /* An unclipped absolutely-positioned box near the footer lengthens the
       document as the pointer moves down (FR-019, SC-006). `clip`, not
       `hidden`, for feature 006's reason. */
    expect(declarations).toMatch(/overflow:\s*clip/)
    expect(declarations).not.toMatch(/overflow:\s*hidden/)
  })

  it('should composite normally rather than through a blend mode when rendered', () => {
    /* Frame `gViAx` records no blend mode on either circle, and both
       candidates were rejected with arithmetic (spec § The dot-brightening
       decision). */
    expect(declarations).not.toContain('mix-blend-mode')
    expect(declarations).not.toContain('background-blend-mode')
  })

  it('should switch itself off for reduced motion, coarse pointers and print', () => {
    /* Redundant with the composable by design: two independent mechanisms for
       the requirement `ui-map.md` § Movimiento reducido lists first
       (FR-010, FR-011). */
    for (const query of [
      '@media (prefers-reduced-motion: reduce)',
      '@media not (hover: hover)',
      '@media print',
    ]) {
      expect(declarations, query).toContain(query)
    }
    expect(
      declarations.match(/display:\s*none/g),
      'one per guard'
    ).toHaveLength(3)
  })

  it('should carry no colour or size literal when rendered', () => {
    /* Constitution Article VII, SC-008, checked against the source because the
       values live in CSS the DOM never sees here. `#CF3147`, `660px` and
       `180px` are the three the design writes and the three a shortcut would
       reach for. */
    expect(declarations).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(declarations).not.toMatch(/\b\d+(\.\d+)?(px|rem|em)\b/)
  })

  it('should add no token to the namespace SectionGlow owns', () => {
    /*
     * `SectionGlow.test.ts` scans `global.css` for `--color-glow-*` and
     * `--spacing-glow-*` and asserts every match is reachable through its
     * props, so a spotlight token in that family turns a green suite red in a
     * file this feature never opens (docs/business/rules.md § R36, SC-009).
     * Asserted here as well as there, because there it fails as somebody
     * else's problem.
     */
    expect(declarations).not.toMatch(/var\(--(?:color|spacing)-glow-/)
    for (const token of SPOTLIGHT_TOKENS) {
      expect(token, token).not.toMatch(/^--(?:color|spacing)-glow-/)
    }
  })
})
