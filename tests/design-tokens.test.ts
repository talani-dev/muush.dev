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

/**
 * Feature 44 · the home tokens (data-model § 6; pen extract-44 §§ 1–4, 8).
 * Fluid values are evaluated at both anchors; constants are pinned as
 * declared. Nothing new may be declared twice: a second declaration of the
 * same key would silently win in one of the two blocks.
 */
describe('design tokens · the home (feature 44)', () => {
  const FLUID: [string, number, number][] = [
    ['--spacing-portada-alto', 740, 1000],
    ['--spacing-portada-arriba', 110, 290],
    ['--spacing-portada-gap', 22, 28],
    ['--spacing-portada-botones-gap', 8, 14],
    ['--spacing-portada-botones-arriba', 8, 0],
    ['--spacing-mapa-y', 72, 110],
    ['--spacing-mapa-gap', 24, 28],
    ['--spacing-leyenda-gap', 16, 22],
    ['--spacing-bloque-y', 72, 120],
    ['--spacing-cabeza-gap', 24, 22],
    ['--spacing-servicios-gap', 24, 44],
    ['--text-servicios-titulo', 30, 56],
    ['--text-servicios-titulo--line-height', 34.5, 61.6],
    ['--spacing-tarjetas-gap', 14, 20],
    ['--spacing-proceso-gap', 24, 64],
    ['--text-paso', 17, 22],
    ['--text-paso--letter-spacing', 0, -0.4],
    ['--text-paso-texto', 14, 15],
    ['--text-paso-texto--line-height', 20.3, 22.5],
  ]

  for (const [name, mobile, desktop] of FLUID) {
    it(`should resolve ${name} to ${mobile} px at 390 and ${desktop} px at 1440 when evaluated`, () => {
      const value = (declared(name) ?? '').replaceAll(/\s+/g, ' ')

      expect(value, name).toMatch(/^clamp\(/)
      expect(Math.abs(clampPx(value, MOBILE_ANCHOR) - mobile)).toBeLessThan(
        TOLERANCE_PX
      )
      expect(Math.abs(clampPx(value, DESKTOP_ANCHOR) - desktop)).toBeLessThan(
        TOLERANCE_PX
      )
    })
  }

  const FIXED: [string, number][] = [
    ['--spacing-portada-abajo', 60],
    ['--container-medida', 640],
    ['--container-mapa', 1408],
    ['--container-mapa-ventana', 640],
    ['--radius-caja', 16],
    ['--spacing-pin', 28],
    ['--spacing-pin-nucleo', 8],
    ['--spacing-selector', 4],
    ['--spacing-pestana-y', 8],
    ['--spacing-pestana-x', 16],
    ['--radius-pestana', 9],
    ['--text-pestana', 14],
    ['--spacing-chip-y', 7],
    ['--spacing-chip-x', 11],
    ['--spacing-chip-gap', 6],
    ['--spacing-tarjeta-movil', 290],
    ['--spacing-tarjeta-visual', 210],
    ['--spacing-tile', 96],
    ['--spacing-tile-icono', 40],
    ['--spacing-tarjeta-texto-arriba', 22],
    ['--spacing-tarjeta-texto-x', 24],
    ['--spacing-tarjeta-texto-abajo', 28],
    ['--spacing-tarjeta-texto-gap', 10],
    ['--spacing-indicador-activo', 22],
    ['--spacing-indicador-punto', 6],
    ['--spacing-indicador-gap', 6],
    ['--radius-indicador', 3],
    ['--spacing-franja-grupo', 18],
    ['--spacing-franja-chip-x', 14],
    ['--spacing-franja-chip-gap', 8],
    ['--spacing-chip-punto', 6],
    ['--spacing-tambien', 20],
    ['--spacing-tambien-gap', 8],
    ['--text-rotulo', 11],
    ['--text-rotulo-movil', 12],
    ['--text-tambien', 18],
    ['--text-nota', 14],
    ['--spacing-pasos', 20],
    ['--spacing-paso', 16],
    ['--spacing-paso-punto', 28],
    ['--spacing-paso-nucleo', 12],
    ['--spacing-linea-proceso', 2],
    ['--spacing-linea-proceso-arriba', 13],
    ['--spacing-riel', 14],
    ['--spacing-riel-gap', 14],
    ['--spacing-riel-punto', 12],
    ['--spacing-riel-centro', 6],
    ['--spacing-linea-riel', 1],
    ['--spacing-paso-movil', 112],
    ['--spacing-paso-texto', 6],
    ['--text-paso-numero', 13],
    ['--spacing-compromiso-alto', 38],
    ['--spacing-compromiso', 8],
    ['--spacing-compromiso-fin', 10],
    ['--text-servicio--line-height', 34],
    ['--spacing-burbuja', 22],
    ['--spacing-burbuja-icono', 12],
    ['--text-compromiso', 13],
    ['--spacing-compromiso-movil-y', 6],
    ['--spacing-compromiso-movil-x', 10],
    ['--spacing-compromiso-movil-punto', 5],
    ['--text-compromiso-movil', 12],
    ['--trazo-anillo', 1.5],
  ]

  for (const [name, px] of FIXED) {
    it(`should declare ${name} as ${px} px at both anchors when the stylesheet loads`, () => {
      expect(normalise(declared(name) ?? ''), name).toBe(`${px}px`)
    })
  }

  it('should derive the home colours from the palette when the stylesheet loads', () => {
    const mixes: [string, string, number][] = [
      ['--blanco-10', 'blanco', 10],
      ['--blanco-25', 'blanco', 25],
      ['--rojo-10', 'red-muush-500', 10],
      ['--rojo-15', 'red-muush-500', 15],
      ['--rojo-25', 'red-muush-500', 25],
      ['--mapa-punto', 'blanco', 18],
    ]
    for (const [name, family, percent] of mixes) {
      expect(normalise(declared(name) ?? ''), name).toBe(
        normalise(
          `color-mix(in srgb, var(--${family}) ${percent}%, transparent)`
        )
      )
    }
    expect(declared('--compromiso-icono')).toBe('#e98a77')
    expect(declared('--mapa-opacidad')).toBe('0.8')
  })

  it('should drop the drawn process gradient when the stylesheet loads', () => {
    /* Roberto review 2026-11-02 (FR-044): the desktop line is the unlit
       track (Blanco 20 %) at rest and red only up to a previewed step; the
       .pen gradient no longer paints anywhere. */
    expect(declared('--proceso-linea')).toBeUndefined()
    /* FR-048: no timeline dot paints a static halo, so the Blanco 6 % that
       drew it has no reader and is gone. */
    expect(declared('--blanco-6')).toBeUndefined()
    expect(globalCss).not.toContain('--color-blanco-6')
  })

  it('should time the timeline fill at 120 ms and zero it under reduced motion when the stylesheet loads', () => {
    expect(declared('--progreso-paso')).toBe('120ms')
    const reducedBlocks = [
      ...globalCss.matchAll(
        /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/g
      ),
    ]
      .map(match => match[1] ?? '')
      .join('\n')
    expect(reducedBlocks).toMatch(/--progreso-paso:\s*0ms;/)
  })

  /* `--progreso-paso` is left out: its reduced-motion zero is a deliberate
     second declaration, pinned by the test above. */
  it('should declare no home token twice when the stylesheet loads', () => {
    const names = [
      ...FLUID.map(([name]) => name),
      ...FIXED.map(([name]) => name),
      '--rojo-25',
      '--mapa-punto',
      '--luz-crimson',
      '--tile-fondo',
      '--borde-tile',
      '--tile-sombra',
    ]
    for (const name of names) {
      const declarations = globalCss.match(
        new RegExp(`(?:^|[\\s;{])${name}:`, 'g')
      )
      expect(declarations?.length, name).toBe(1)
    }
  })

  it('should ping the markers with the v1 radar recipe rebuilt in v2 when the stylesheet loads', () => {
    /* Pen extract-44 § 9 (Roberto 2026-11-01): ghost 1 → 3, 0.6 → 0,
       2.4 s ease-out, infinite, in the dot's own colour; none under reduced
       motion; no static ring tokens left. */
    expect(declared('--pulso')).toBe('2.4s')
    const keyframes =
      globalCss.match(/@keyframes pulso\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(normalise(keyframes)).toBe(
      normalise(
        'from { opacity: 0.6; transform: scale(1); } to { opacity: 0; transform: scale(3); }'
      )
    )
    const utility =
      globalCss.match(/@utility pulso\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(utility).toMatch(
      /animation:\s*pulso var\(--pulso\) ease-out infinite;/
    )
    expect(utility).toMatch(
      /background-color:\s*var\(--pulso-fantasma, inherit\);/
    )
    /* FR-047: the unlit timeline dot pings in its ring's Blanco 40 %. */
    expect(
      globalCss.match(/@utility pulso-tenue\s*\{([\s\S]*?)\n\}/)?.[1]
    ).toMatch(/--pulso-fantasma:\s*var\(--texto-tenue\);/)
    /* FR-048: one trail. The ghost starts at the host's outer edge: 0 for
       borderless hosts, the ring width for the unlit timeline dot. */
    expect(utility).toMatch(
      /inset:\s*calc\(-1 \* var\(--pulso-borde, 0rem\)\);/
    )
    expect(
      globalCss.match(/@utility pulso-tenue\s*\{([\s\S]*?)\n\}/)?.[1]
    ).toMatch(/--pulso-borde:\s*var\(--trazo-anillo\);/)
    expect(utility).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*&::before\s*\{\s*content:\s*none;/
    )
    expect(globalCss).not.toMatch(
      /--(rojo-20|punto-halo2?|pin-equipo-anillo|pin-aliado-(halo|anillo)|spacing-pill-halo|spacing-pin-halo):/
    )
  })

  it('should give the step title and number the .pen line boxes when the stylesheet loads', () => {
    /* Pen extract-44 § 10: 31 for a 22 px title, 16 for a 13 px number. */
    expect(declared('--text-paso--line-height')).toBe('1.41')
    expect(declared('--text-paso-numero--line-height')).toBe('1.23')
  })

  it('should pin the Roberto review 2026-11-02 tokens once each when the stylesheet loads', () => {
    /* FR-040: the header row's equal outer tracks; FR-043: the step's
       subtle hover growth, within the asked 1.03–1.05. */
    expect(declared('--grid-template-columns-cabecera')).toBe('1fr auto 1fr')
    const scale = Number(declared('--paso-escala'))
    expect(scale).toBe(1.04)
    for (const name of ['--grid-template-columns-cabecera', '--paso-escala']) {
      expect(
        globalCss.match(new RegExp(`(?:^|[\\s;{])${name}:`, 'g'))?.length,
        name
      ).toBe(1)
    }
  })
})

/**
 * Feature 45 · the form and section tokens (pen extract-45 §§ 1–5, 8;
 * data-model § 5). The form's two anatomies are constant pairs swapped at
 * `md`; the section values between the anchors are fluid.
 */
describe('design tokens · the forms (feature 45)', () => {
  const FLUID: [string, number, number][] = [
    ['--spacing-diagnostico-abajo', 72, 140],
    ['--spacing-diagnostico-gap', 24, 72],
    ['--spacing-diagnostico-izq', 24, 26],
    ['--text-cuerpo-diagnostico', 16, 18],
    ['--text-cuerpo-diagnostico--line-height', 24, 27.9],
  ]

  for (const [name, mobile, desktop] of FLUID) {
    it(`should resolve ${name} to ${mobile} px at 390 and ${desktop} px at 1440 when evaluated`, () => {
      const value = (declared(name) ?? '').replaceAll(/\s+/g, ' ')

      expect(value, name).toMatch(/^clamp\(/)
      expect(Math.abs(clampPx(value, MOBILE_ANCHOR) - mobile)).toBeLessThan(
        TOLERANCE_PX
      )
      expect(Math.abs(clampPx(value, DESKTOP_ANCHOR) - desktop)).toBeLessThan(
        TOLERANCE_PX
      )
    })
  }

  const FIXED: [string, number][] = [
    ['--panel-form-ancho', 600],
    ['--whatsapp-alto', 120],
    ['--container-cuerpo-diagnostico', 500],
    ['--spacing-recibes-arriba', 8],
    ['--spacing-recibes-gap', 14],
    ['--spacing-recibe-gap', 12],
    ['--spacing-recibe-burbuja', 24],
    ['--spacing-recibe-icono', 14],
    ['--text-recibe', 16],
    ['--spacing-llamada-arriba', 18],
    ['--spacing-llamada-gap', 14],
    ['--spacing-llamada-enlace', 8],
    ['--text-llamada', 15],
    ['--spacing-panel-movil', 20],
    ['--spacing-formulario-gap', 14],
    ['--spacing-formulario-gap-escritorio', 18],
    ['--spacing-formulario-fila', 14],
    ['--spacing-campo-gap', 7],
    ['--spacing-campo-gap-escritorio', 8],
    ['--spacing-campo-alto', 46],
    ['--spacing-campo-alto-escritorio', 50],
    ['--spacing-campo-x', 14],
    ['--spacing-campo-x-escritorio', 16],
    ['--spacing-area-alto', 96],
    ['--spacing-area-y', 12],
    ['--spacing-area-y-escritorio', 14],
    ['--spacing-campo-icono', 16],
    ['--spacing-select-fin', 40],
    ['--radius-campo-escritorio', 14],
    ['--text-etiqueta-campo', 12],
    ['--text-etiqueta-campo-escritorio', 12],
    ['--text-etiqueta-campo-escritorio--letter-spacing', 0.3],
    ['--text-campo', 14],
    ['--text-campo-escritorio', 15],
    ['--text-ayuda', 13],
    ['--spacing-segmento-caja', 4],
    ['--spacing-segmento-caja-escritorio', 5],
    ['--spacing-segmento-gap', 4],
    ['--spacing-segmento-gap-escritorio', 6],
    ['--spacing-segmento-y', 8],
    ['--spacing-segmento-y-escritorio', 9],
    ['--spacing-segmento-x', 14],
    ['--spacing-segmento-x-escritorio', 20],
    ['--spacing-segmento-punto-gap', 8],
    ['--text-segmento', 13],
    ['--text-segmento-escritorio', 14],
    ['--spacing-check', 18],
    ['--radius-check', 5],
    ['--spacing-privacidad-gap', 10],
    ['--spacing-privacidad-gap-escritorio', 12],
    ['--text-privacidad', 12],
    ['--text-privacidad-escritorio', 13],
    ['--spacing-progreso-gap', 10],
    ['--text-progreso', 12],
    ['--spacing-barra-paso-ancho', 28],
    ['--spacing-barra-paso-alto', 4],
    ['--spacing-barra-paso-gap', 4],
    ['--radius-barra-paso', 2],
    ['--spacing-atras-y', 6],
    ['--spacing-atras-x', 10],
    ['--radius-aviso', 10],
    ['--spacing-aviso-punto', 8],
    ['--spacing-aviso-y', 12],
    ['--spacing-aviso-y-escritorio', 14],
    ['--spacing-aviso-x', 14],
    ['--spacing-aviso-x-escritorio', 16],
    ['--spacing-aviso-gap', 10],
    ['--spacing-aviso-gap-escritorio', 12],
    ['--text-aviso', 13],
    ['--text-aviso-escritorio', 14],
    ['--spacing-exito-tile', 56],
    ['--spacing-exito-tile-escritorio', 64],
    ['--radius-exito', 18],
    ['--spacing-exito-punto', 14],
    ['--spacing-exito-y', 40],
    ['--spacing-exito-x', 8],
    ['--text-exito', 26],
    ['--text-exito-escritorio', 32],
    ['--text-exito-cuerpo', 16],
    ['--container-exito', 420],
  ]

  for (const [name, px] of FIXED) {
    it(`should declare ${name} as ${px} px at both anchors when the stylesheet loads`, () => {
      expect(normalise(declared(name) ?? ''), name).toBe(`${px}px`)
    })
  }

  it('should pin the form line boxes and weights when the stylesheet loads', () => {
    const exact: [string, string][] = [
      ['--text-etiqueta-campo--font-weight', '400'],
      ['--text-etiqueta-campo-escritorio--font-weight', '600'],
      ['--text-privacidad--line-height', '1.4'],
      ['--text-privacidad-escritorio--line-height', '1.45'],
      ['--text-aviso--line-height', '1.45'],
      ['--text-aviso-escritorio--line-height', '1.45'],
      ['--text-exito--font-weight', '500'],
      ['--text-exito-escritorio--font-weight', '500'],
      ['--text-exito-cuerpo--line-height', 'var(--interlineado-texto)'],
      ['--grid-template-rows-diagnostico', '1fr auto auto 1fr'],
      [
        '--grid-template-columns-diagnostico',
        'minmax(var(--diagnostico-izq-min), 1fr) minmax(0, var(--panel-form-ancho))',
      ],
      ['--diagnostico-izq-min', '22rem'],
    ]
    for (const [name, value] of exact) {
      expect(declared(name)?.replaceAll(/\s+/g, ' '), name).toBe(value)
    }
  })

  it('should derive the notice colours from the palette when the stylesheet loads', () => {
    for (const [name, percent] of [
      ['--rojo-12', 12],
      ['--rojo-40', 40],
    ] as const) {
      expect(normalise(declared(name) ?? ''), name).toBe(
        normalise(
          `color-mix(in srgb, var(--red-muush-500) ${percent}%, transparent)`
        )
      )
    }
    expect(
      globalCss.match(/@utility borde-aviso\s*\{([\s\S]*?)\n\}/)?.[1]
    ).toMatch(/--borde:\s*var\(--rojo-40\);/)
  })

  it('should declare no form token twice when the stylesheet loads', () => {
    const names = [
      ...FLUID.map(([name]) => name),
      ...FIXED.map(([name]) => name),
      '--rojo-12',
      '--rojo-40',
      '--grid-template-columns-diagnostico',
      '--grid-template-rows-diagnostico',
    ]
    for (const name of names) {
      const declarations = globalCss.match(
        new RegExp(`(?:^|[\\s;{])${name}:`, 'g')
      )
      expect(declarations?.length, name).toBe(1)
    }
  })
})

/**
 * Feature 46 · the secondary pages (data-model § 5; pen extract-46 §§ 1–4,
 * § 6). Headings without a drawn line height follow the v2 scale (Roberto
 * 2026-11-02): 1.15 at 390, 1.08 at 64, 1.06 at 88, −0.035 em at 1440.
 */
describe('design tokens · the secondary pages (feature 46)', () => {
  const FLUID: [string, number, number][] = [
    ['--h-pagina', 32, 64],
    ['--lh-pagina', 36.8, 69.12],
    ['--h-estado', 34, 88],
    ['--lh-estado', 39.1, 93.28],
    ['--tracking-estado', 0, -3.08],
    ['--spacing-pagina-alto', 700, 820],
    ['--spacing-pagina-arriba', 110, 120],
    ['--spacing-pagina-gap', 24, 28],
    ['--text-pagina-intro', 16, 20],
    ['--spacing-composicion-arriba', 72, 100],
    ['--spacing-composicion-abajo', 72, 80],
    ['--spacing-composicion-gap', 24, 40],
    ['--spacing-composicion-tarjetas', 14, 24],
    ['--spacing-tarjeta-equipo', 24, 32],
    ['--text-donde-cuerpo', 16, 17],
    ['--text-donde-cuerpo--line-height', 24, 26.35],
    ['--spacing-estado-gap', 32, 40],
    ['--spacing-preguntas-alto', 720, 1100],
    ['--spacing-preguntas-arriba', 100, 120],
    ['--spacing-preguntas-abajo', 60, 80],
    ['--spacing-error-alto', 720, 760],
    ['--spacing-error-botones-arriba', 0, 8],
    /* Review-46 fix round 1: card padding minus a 10 px edge floor. */
    ['--spacing-tarjeta-equipo-titulo-fin', 14, 22],
  ]

  for (const [name, mobile, desktop] of FLUID) {
    it(`should resolve ${name} to ${mobile} px at 390 and ${desktop} px at 1440 when evaluated`, () => {
      const value = (declared(name) ?? '').replaceAll(/\s+/g, ' ')

      expect(value, name).toMatch(/^clamp\(/)
      expect(Math.abs(clampPx(value, MOBILE_ANCHOR) - mobile)).toBeLessThan(
        TOLERANCE_PX
      )
      expect(Math.abs(clampPx(value, DESKTOP_ANCHOR) - desktop)).toBeLessThan(
        TOLERANCE_PX
      )
    })
  }

  const FIXED: [string, number][] = [
    ['--container-pagina-intro', 720],
    ['--container-composicion', 1248],
    ['--spacing-tarjeta-equipo-gap', 14],
    ['--spacing-tarjeta-equipo-rotulo', 10],
    ['--spacing-tarjeta-equipo-punto', 8],
    ['--text-tarjeta-equipo-rotulo', 14],
    ['--text-tarjeta-equipo-titulo', 26],
    ['--text-tarjeta-equipo-texto', 17],
    ['--spacing-error-arriba', 100],
  ]

  for (const [name, px] of FIXED) {
    it(`should declare ${name} as ${px} px at both anchors when the stylesheet loads`, () => {
      expect(normalise(declared(name) ?? ''), name).toBe(`${px}px`)
    })
  }

  it('should give both new heading sizes the v2 tracking and weight when the theme compiles', () => {
    const exact: [string, string][] = [
      ['--text-pagina--line-height', 'var(--lh-pagina)'],
      ['--text-pagina--letter-spacing', 'var(--tracking-diagnostico)'],
      ['--text-pagina--font-weight', '500'],
      ['--text-estado--line-height', 'var(--lh-estado)'],
      ['--text-estado--letter-spacing', 'var(--tracking-estado)'],
      ['--text-estado--font-weight', '500'],
      ['--text-tarjeta-equipo-rotulo--font-weight', '600'],
      ['--text-tarjeta-equipo-titulo--line-height', '1.4'],
      ['--text-tarjeta-equipo-titulo--font-weight', '500'],
      ['--text-tarjeta-equipo-texto--line-height', 'var(--interlineado-texto)'],
      ['--text-pagina-intro--line-height', 'var(--interlineado-texto)'],
    ]
    for (const [name, value] of exact) {
      expect(declared(name), name).toBe(value)
    }
  })

  it('should declare no secondary-page token twice when the stylesheet loads', () => {
    const names = [
      ...FLUID.map(([name]) => name),
      ...FIXED.map(([name]) => name),
      '--text-pagina',
      '--text-estado',
    ]
    for (const name of names) {
      const declarations = globalCss.match(
        new RegExp(`(?:^|[\\s;{])${name}:`, 'g')
      )
      expect(declarations?.length, name).toBe(1)
    }
  })
})

/*
 * Feature 48 · the legal pages and cookie consent (pen-extract-48 § 3,
 * `pen-48/`). Fluid values hit the 390 / 1440 frames; fixed ones are the
 * same in both.
 */
describe('design tokens · the legal pages and cookie consent (feature 48)', () => {
  const FLUID: [string, number, number][] = [
    ['--h-legal', 34, 56],
    ['--lh-legal', 39.1, 61.6],
    ['--spacing-legal-arriba', 112, 168],
    ['--spacing-legal-abajo', 72, 120],
    ['--spacing-legal-gap', 40, 64],
    ['--spacing-legal-encabezado-gap', 16, 20],
    ['--text-legal-fecha', 13, 15],
    ['--text-legal-fecha--line-height', 20, 23],
    ['--spacing-legal-seccion-arriba', 28, 40],
    ['--spacing-legal-seccion-gap', 14, 18],
    ['--text-legal-titulo', 22, 28],
    ['--text-legal-titulo--line-height', 29, 35],
    ['--text-legal-cuerpo', 16, 17],
    ['--text-legal-cuerpo--line-height', 26, 29],
    ['--spacing-legal-item-gap', 12, 14],
    ['--spacing-legal-punto-arriba', 11, 12],
    ['--spacing-legal-numero', 16, 18],
    ['--text-legal-numero', 15, 16],
    ['--text-legal-numero--line-height', 25, 27],
    ['--text-legal-donde', 14, 15],
    ['--text-legal-donde--line-height', 21, 24],
    ['--text-legal-datos', 15, 16],
    ['--text-legal-datos--line-height', 24, 26],
    ['--text-legal-boton', 14, 15],
    ['--spacing-cookies', 18, 24],
    ['--spacing-cookies-abajo', 16, 24],
    ['--text-cookies-titulo', 17, 18],
    ['--text-cookies-titulo--line-height', 22, 23],
    ['--spacing-preferencias', 20, 28],
    ['--text-preferencias-titulo', 18, 22],
  ]

  for (const [name, mobile, desktop] of FLUID) {
    it(`should resolve ${name} to ${mobile} px at 390 and ${desktop} px at 1440 when evaluated`, () => {
      const value = (declared(name) ?? '').replaceAll(/\s+/g, ' ')

      expect(value, name).toMatch(/^clamp\(/)
      expect(Math.abs(clampPx(value, MOBILE_ANCHOR) - mobile)).toBeLessThan(
        TOLERANCE_PX
      )
      expect(Math.abs(clampPx(value, DESKTOP_ANCHOR) - desktop)).toBeLessThan(
        TOLERANCE_PX
      )
    })
  }

  const FIXED: [string, number][] = [
    ['--container-legal', 680],
    ['--spacing-legal-indice', 220],
    ['--spacing-legal-indice-gap', 14],
    ['--spacing-legal-indice-arriba', 80],
    ['--spacing-legal-indice-fijo', 168],
    ['--spacing-legal-plegado', 48],
    ['--spacing-legal-lista-gap', 10],
    ['--spacing-legal-punto', 6],
    ['--spacing-legal-fila-y', 14],
    ['--spacing-legal-fila-gap', 24],
    ['--spacing-legal-donde', 190],
    ['--spacing-legal-tarjeta', 18],
    ['--spacing-legal-tarjeta-gap', 6],
    ['--spacing-legal-boton-y', 12],
    ['--spacing-legal-boton-x', 20],
    ['--spacing-cookies-gap', 32],
    ['--spacing-cookies-movil-gap', 12],
    ['--spacing-cookies-boton-y', 10],
    ['--spacing-cookies-boton-x', 18],
    ['--text-cookies', 14],
    ['--container-panel-preferencias', 720],
    ['--spacing-preferencias-borde', 8],
    ['--spacing-interruptor-ancho', 44],
    ['--spacing-interruptor-alto', 26],
    ['--spacing-interruptor-aire', 3],
    ['--spacing-perilla', 20],
    ['--spacing-perilla-recorrido', 18],
    ['--text-cookie-categoria', 15],
    ['--text-cookie-categoria-detalle', 13],
  ]

  for (const [name, px] of FIXED) {
    it(`should declare ${name} as ${px} px at both anchors when the stylesheet loads`, () => {
      expect(normalise(declared(name) ?? ''), name).toBe(`${px}px`)
    })
  }

  it('should derive the new surfaces from the palette when the stylesheet loads', () => {
    expect(declared('--cookies-fondo')).toBe(
      'color-mix(in srgb, var(--negro-900) 95%, transparent)'
    )
    expect(declared('--velo')).toBe('rgb(0 0 0 / 0.7)')
    expect(declared('--texto-cookies')).toBe('#b4b4b0')
  })

  it('should declare no feature 48 token twice when the stylesheet loads', () => {
    for (const name of [
      ...FLUID.map(([name]) => name),
      ...FIXED.map(([name]) => name),
      '--text-legal',
    ]) {
      const declarations = globalCss.match(
        new RegExp(`(?:^|[\\s;{])${name}:`, 'g')
      )
      expect(declarations?.length, name).toBe(1)
    }
  })
})
