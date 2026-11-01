import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 42 · the Muush 1.0 token vocabulary (spec FR-001…FR-008, SC-001;
 * research R1–R4, R19; data-model § 1).
 *
 * `global.css` is read from disk with `node:path` + `process.cwd()`
 * (rules.md § R27) and its comments are stripped, so a value quoted in a
 * comment can neither satisfy nor fail an assertion.
 *
 * The expected handoff table is embedded below instead of read from
 * `docs/handoff/muush-1.0/componentes/tokens.css`: nothing in the build or the
 * tests may depend on `docs/` (spec FR-025). It is a verbatim copy of every
 * variable of that file as delivered on 2026-10-31, keyed by the name the
 * site uses: the handoff's own version prefix is dropped (naming
 * reorganization, Roberto 2026-11-01), and its two font stacks are
 * `--fuente-titulo` and `--fuente-texto` (see the comment over them in
 * `global.css`). The values are untouched.
 */
const globalCss = readFileSync(
  join(process.cwd(), 'app', 'assets', 'css', 'global.css'),
  'utf8'
).replaceAll(/\/\*[\s\S]*?\*\//g, '')

/** px per rem at the browser's default root font size (research R3). */
const ROOT_PX = 16
/** The two widths the `.pen` draws (Constitution VII, responsive anchors). */
const MOBILE_ANCHOR = 390
const DESKTOP_ANCHOR = 1440
/** Rounding tolerance of a 4-decimal `rem` clamp, in px. */
const TOLERANCE_PX = 0.02

const HANDOFF_TOKENS: Record<string, string> = {
  '--negro-950': '#050505',
  '--negro-900': '#0B0B0B',
  '--carbon-800': '#1A1A1A',
  '--carbon-700': '#2C2C2C',
  '--gris-400': '#8C8C8A',
  '--blanco': '#F4F4F2',
  '--red-muush-500': '#E5352F',
  '--crimson-600': '#8E2A1E',
  '--oxblood-800': '#4A1715',
  '--coral-300': '#C9604A',
  '--arena-300': '#B38B7B',
  '--acero-200': '#A6B6B2',
  '--acero-400': '#4A676B',
  '--acero-800': '#1F3236',
  '--texto': 'var(--blanco)',
  '--texto-suave': 'rgba(244, 244, 242, 0.70)',
  '--texto-tenue': 'rgba(244, 244, 242, 0.40)',
  '--linea': 'rgba(244, 244, 242, 0.12)',
  '--linea-fuerte': 'rgba(244, 244, 242, 0.20)',
  '--fuente-titulo': '"Poppins", system-ui, sans-serif',
  '--fuente-texto': '"Instrument Sans", system-ui, sans-serif',
  '--h-hero': 'clamp(34px, 6vw + 10px, 84px)',
  '--h-seccion': 'clamp(28px, 3vw + 14px, 56px)',
  '--h-tarjeta': 'clamp(19px, 1vw + 14px, 26px)',
  '--p-grande': 'clamp(16px, 0.5vw + 14px, 20px)',
  '--p': '15px',
  '--p-chico': '13px',
  '--etiqueta': '12px',
  '--interlineado-titulo': '1.15',
  '--interlineado-texto': '1.5',
  '--radio-control': '12px',
  '--radio-campo': '12px',
  '--radio-tarjeta': '22px',
  '--radio-tile': '28px',
  '--radio-pill': '999px',
  '--control': '36px',
  '--gutter': '24px',
  '--gutter-desktop': '80px',
  '--seccion-y': '72px',
  '--seccion-y-desktop': '120px',
  '--vidrio-fondo': 'rgba(11, 11, 11, 0.70)',
  '--vidrio-blur': 'blur(30px)',
  '--vidrio-borde':
    'linear-gradient(180deg, rgba(244,244,242,.25), rgba(244,244,242,.04))',
  '--vidrio-sombra': '0 30px 80px rgba(0, 0, 0, 0.67)',
  '--nav-fondo': 'rgba(11, 11, 11, 0.45)',
  '--btn-fondo':
    'linear-gradient(180deg, #EC4A44 0%, #E5352F 55%, #C42A25 100%)',
  '--btn-borde': 'rgba(255, 255, 255, 0.20)',
  '--btn-sombra': '0 10px 32px rgba(229, 53, 47, 0.33)',
  '--btn2-fondo': 'rgba(26, 26, 26, 0.55)',
  '--ease': 'cubic-bezier(.2, .7, .2, 1)',
  '--rapido': '180ms',
  '--medio': '320ms',
  '--lento': '700ms',
  '--max': '1280px',
}

/**
 * The `.pen` overrides (pen extract § 4, rules.md § R32): the hero heading
 * caps at 96 px, not 84, and the hero subtitle starts at 17 px, not 16.
 */
const PEN_OVERRIDES: Record<string, string> = {
  '--h-hero': 'clamp(2.125rem, 0.6857rem + 5.9048vw, 6rem)',
  '--p-grande': 'clamp(1.0625rem, 0.9929rem + 0.2857vw, 1.25rem)',
}

/**
 * Re-anchored, same range: `--h-seccion` keeps the handoff's 28 → 56 but
 * interpolates between the 390 and 1440 anchors (research R4), so it equals
 * the handoff at and beyond both anchors and differs only in between.
 */
const REANCHORED = new Set(['--h-seccion'])

/** Heading tracking: 0 at 390, the `.pen` value at 1440 (pen extract § 8). */
const FLUID_TRACKING: Record<string, number> = {
  '--tracking-hero': -3.5,
  '--tracking-seccion': -1.96,
  '--tracking-proceso': -1.82,
  '--tracking-diagnostico': -2.24,
}

/** The first declaration of `name` in the file (the `:root` one). */
function declared(name: string): string | undefined {
  return globalCss
    .match(new RegExp(`(?:^|[\\s;{])${name}:\\s*([^;]+);`))?.[1]
    ?.trim()
}

/**
 * A comparable form of a CSS value: lower case, every `rem`
 * converted to `px` at 16 px per rem, and every number re-printed so `.25`,
 * `0.25` and `0.250` agree. Digits inside a hex colour or a name are left
 * alone (the look-behind refuses a preceding `#` or word character), and
 * whitespace is dropped last.
 */
function normalise(value: string): string {
  /* Numbers first, whitespace last: stripping first would fuse `0 30px`. */
  return value
    .toLowerCase()
    .replaceAll(/(?<![#\w.])(-?\d*\.?\d+)(rem|px)?/g, (_, number, unit) => {
      const parsed = Number.parseFloat(number)
      if (unit === 'rem') return `${parsed * ROOT_PX}px`
      return `${parsed}${unit ?? ''}`
    })
    .replaceAll(/\s+/g, '')
}

/** A length term (`2rem`, `-14px`, `6vw`) in px at a viewport width. */
function termPx(term: string, viewportPx: number): number {
  const match = term.match(/^([+-]?\d*\.?\d+)(rem|px|vw)$/)
  if (!match) throw new Error(`unsupported term ${term}`)
  const amount = Number.parseFloat(match[1] ?? '')
  if (match[2] === 'rem') return amount * ROOT_PX
  if (match[2] === 'vw') return (amount * viewportPx) / 100
  return amount
}

/** A `+`/`-` sum of length terms in px at a viewport width. */
function sumPx(expression: string, viewportPx: number): number {
  const terms = expression.replaceAll(/\s+/g, '').match(/[+-]?[^+-]+/g) ?? []
  return terms.reduce((total, term) => total + termPx(term, viewportPx), 0)
}

/** Evaluates `clamp(min, a + b, max)` at a viewport width, in px. */
function clampPx(value: string, viewportPx: number): number {
  const parts = value.match(/^clamp\(([^,]+),([^,]+),([^,]+)\)$/)
  if (!parts) throw new Error(`not a clamp: ${value}`)
  const [min, preferred, max] = [parts[1], parts[2], parts[3]].map(part =>
    sumPx(part ?? '', viewportPx)
  ) as [number, number, number]
  return Math.min(Math.max(preferred, min), max)
}

describe('design tokens · the handoff vocabulary (FR-001, SC-001)', () => {
  for (const [name, handoffValue] of Object.entries(HANDOFF_TOKENS)) {
    it(`should declare ${name} with the handoff value when the stylesheet loads`, () => {
      const value = declared(name)
      expect(value, name).toBeDefined()

      const override = PEN_OVERRIDES[name]
      if (override) {
        expect(normalise(value ?? ''), name).toBe(normalise(override))
        return
      }

      if (!handoffValue.startsWith('clamp(')) {
        expect(normalise(value ?? ''), name).toBe(normalise(handoffValue))
        return
      }

      const widths = REANCHORED.has(name)
        ? [320, MOBILE_ANCHOR, DESKTOP_ANCHOR, 1920]
        : [320, MOBILE_ANCHOR, 768, 1024, DESKTOP_ANCHOR, 1920]
      for (const width of widths) {
        expect(clampPx(value ?? '', width), `${name} @ ${width}`).toBeCloseTo(
          clampPx(handoffValue, width),
          1
        )
      }
    })
  }
})

describe('design tokens · the .pen heading scale (FR-006, FR-007)', () => {
  const anchors: [string, number, number][] = [
    ['--h-hero', 34, 96],
    ['--h-seccion', 28, 56],
    ['--h-proceso', 28, 52],
    ['--h-diagnostico', 34, 64],
    ['--p-grande', 17, 20],
    ['--lh-hero', 37.4, 101.76],
    ['--lh-seccion', 32.2, 61.6],
    ['--lh-proceso', 32.2, 57.2],
    ['--lh-diagnostico', 39.1, 69.12],
  ]

  for (const [name, mobile, desktop] of anchors) {
    it(`should resolve ${name} to ${mobile} px at 390 and ${desktop} px at 1440 when evaluated`, () => {
      const value = declared(name) ?? ''

      expect(Math.abs(clampPx(value, MOBILE_ANCHOR) - mobile)).toBeLessThan(
        TOLERANCE_PX
      )
      expect(Math.abs(clampPx(value, DESKTOP_ANCHOR) - desktop)).toBeLessThan(
        TOLERANCE_PX
      )
    })
  }

  for (const [name, desktop] of Object.entries(FLUID_TRACKING)) {
    it(`should resolve ${name} to 0 at 390 and ${desktop} px at 1440 when evaluated`, () => {
      const value = declared(name) ?? ''

      expect(value).toMatch(/^clamp\(/)
      expect(Math.abs(clampPx(value, MOBILE_ANCHOR))).toBeLessThan(TOLERANCE_PX)
      expect(Math.abs(clampPx(value, DESKTOP_ANCHOR) - desktop)).toBeLessThan(
        TOLERANCE_PX
      )
      /* Clamped: never positive below 390, never past the 1440 value above. */
      expect(clampPx(value, 320)).toBeCloseTo(0, 5)
      expect(Math.abs(clampPx(value, 1920) - desktop)).toBeLessThan(
        TOLERANCE_PX
      )
    })
  }

  it('should fix the service-card title at 24 px with -0.6 px tracking when the stylesheet loads', () => {
    expect(declared('--h-servicio')).toBe('1.5rem')
    expect(declared('--tracking-servicio')).toBe('-0.0375rem')
  })

  it('should round the service card at 24 px and keep the handoff card radius at 22 when the stylesheet loads', () => {
    expect(declared('--radio-servicio')).toBe('1.5rem')
    expect(normalise(declared('--radio-tarjeta') ?? '')).toBe('22px')
  })
})

describe('design tokens · the utility layer (FR-003)', () => {
  const themeBlock =
    [...globalCss.matchAll(/@theme inline\s*\{([\s\S]*?)\n\}/g)]
      .map(match => match[1] ?? '')
      .find(block => block.includes('--color-negro-950:')) ?? ''

  const palette = [
    'negro-950',
    'negro-900',
    'carbon-800',
    'carbon-700',
    'gris-400',
    'blanco',
    'red-muush-500',
    'crimson-600',
    'oxblood-800',
    'coral-300',
    'arena-300',
    'acero-200',
    'acero-400',
    'acero-800',
    'texto',
    'texto-suave',
    'texto-tenue',
    'linea',
    'linea-fuerte',
  ]

  for (const colour of palette) {
    it(`should expose --color-${colour} as a utility when the theme compiles`, () => {
      expect(themeBlock).toMatch(
        new RegExp(`--color-${colour}:\\s*var\\(--${colour}\\)`)
      )
    })
  }

  for (const alias of [
    '--font-titulo',
    '--font-texto',
    '--text-hero',
    '--text-seccion',
    '--text-proceso',
    '--text-diagnostico',
    '--text-servicio',
    '--radius-control',
    '--radius-pill',
    '--radius-panel',
    '--radius-servicio',
    '--radius-franja',
    '--spacing-gutter',
    '--blur-vidrio',
    '--shadow-boton',
    '--shadow-vidrio',
    '--ease-muush',
    '--container-contenido',
  ]) {
    it(`should declare ${alias} in the v2 theme when the theme compiles`, () => {
      expect(themeBlock).toMatch(new RegExp(`${alias}:`))
    })
  }

  it('should carry the heading tracking and weight on each heading size when the theme compiles', () => {
    for (const size of ['hero', 'seccion', 'proceso', 'diagnostico']) {
      expect(themeBlock).toMatch(
        new RegExp(
          `--text-${size}--letter-spacing:\\s*var\\(--tracking-${size}\\)`
        )
      )
      expect(themeBlock).toMatch(
        new RegExp(`--text-${size}--line-height:\\s*var\\(--lh-${size}\\)`)
      )
      expect(themeBlock).toMatch(
        new RegExp(`--text-${size}--font-weight:\\s*500`)
      )
    }
  })
})

describe('design tokens · guards (FR-002, FR-005, FR-008)', () => {
  it('should import no Google Fonts stylesheet when the stylesheet loads', () => {
    expect(globalCss).not.toMatch(/@import[^;]*fonts\.googleapis\.com/)
    expect(globalCss).not.toContain('fonts.gstatic.com')
  })

  it('should hold #CF3147 in the v1 red-400 only when the stylesheet loads', () => {
    /* The Kit's "rojo anterior" is reference only (pen extract § 1). */
    const holders = [...globalCss.matchAll(/(--[\w-]+):\s*#cf3147\s*;/gi)].map(
      match => match[1]
    )

    expect(holders).toEqual(['--red-400'])
    const v2Root =
      [...globalCss.matchAll(/:root\s*\{([\s\S]*?)\n\}/g)]
        .map(match => match[1] ?? '')
        .find(block => block.includes('--negro-950:')) ?? ''
    expect(v2Root).toContain('--negro-950:')
    expect(v2Root).not.toMatch(/#cf3147/i)
    expect(globalCss).not.toMatch(/--brasa-500\s*:/)
  })

  it('should zero the three motion durations when the visitor reduces motion', () => {
    const reducedBlocks = [
      ...globalCss.matchAll(
        /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/g
      ),
    ]
      .map(match => match[1] ?? '')
      .join('\n')

    for (const duration of ['--rapido', '--medio', '--lento']) {
      expect(reducedBlocks, duration).toMatch(
        new RegExp(`${duration}:\\s*0ms;`)
      )
    }
  })

  it('should time the rotating pill slide as the handoff does when the stylesheet loads', () => {
    /* `rotatePill`: out 220 ms, in 260 ms, 6 px. Not zeroed under reduced
       motion: there the rotation itself never runs (useRotatingText). */
    expect(declared('--pill-salida')).toBe('220ms')
    expect(declared('--pill-entrada')).toBe('260ms')
    expect(declared('--pill-desliz')).toBe('0.375rem')
  })

  it('should keep a layout-free system-colour edge when colours are forced', () => {
    /* Spec § Edge Cases, review S1: the painted band vanishes in forced
       colours, so `borde-luz` adds an inset outline there. */
    const utility =
      globalCss.match(/@utility borde-luz\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    const forced =
      utility.match(/@media \(forced-colors: active\)\s*\{([^}]*)\}/)?.[1] ?? ''

    expect(forced).toMatch(
      /outline:\s*var\(--borde-ancho\)\s+solid\s+CanvasText;/
    )
    expect(forced).toMatch(
      /outline-offset:\s*calc\(var\(--borde-ancho\)\s*\*\s*-1\);/
    )
  })

  it('should define the focus ring as a 2 px outline 3 px away when the stylesheet loads', () => {
    /* Clarifications Q3, confirmed by Roberto 2026-10-31. */
    expect(declared('--foco-ancho')).toBe('0.125rem')
    expect(declared('--foco-separacion')).toBe('0.1875rem')
  })
})
