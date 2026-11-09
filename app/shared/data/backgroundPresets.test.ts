import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BACKGROUND_PRESETS,
  type BackgroundPresetName,
  SHADER_SOURCES,
} from '@/shared/data/backgroundPresets'

/**
 * Feature 42 · FR-018, research R9, data-model § 3. The shader files are read
 * from disk (`node:path` + `process.cwd()`, rules.md § R27) to prove every
 * uniform a preset sets is one its shader declares: a misspelt name would be
 * skipped by the renderer in silence.
 */
function shaderSource(name: string): string {
  return readFileSync(
    join(process.cwd(), 'app', 'assets', 'shaders', `${name}.glsl`),
    'utf8'
  )
}

/** The README table (handoff `README.md`), as research R9 copies it. */
const EXPECTED_UNIFORMS: Record<
  BackgroundPresetName,
  Record<string, number>
> = {
  homeHero: {
    u_tx: 0.5,
    u_ty: 0.53,
    u_trx: 0.36,
    u_try: 0.28,
    u_tdark: 1,
    u_fadeB: 0.06,
  },
  howWeWork: {
    u_y0: 0.52,
    u_y1: 0.47,
    u_th: 0.15,
    u_right: 0.45,
    u_tx: 0.5,
    u_ty: 0.27,
    u_trx: 0.42,
    u_try: 0.22,
    u_tdark: 0.9,
    u_fadeT: 0.2,
    u_fadeB: 0.15,
  },
  assessment: {
    u_y0: 1,
    u_y1: 0.35,
    u_th: 0.11,
    u_amp: 0.06,
    u_twist: 0.5,
    u_tx: 0.27,
    u_ty: 0.45,
    u_trx: 0.25,
    u_try: 0.35,
    u_tdark: 0.75,
    u_fadeT: 0.3,
    u_fadeB: 0.05,
  },
  aboutHero: {
    u_tx: 0.5,
    u_ty: 0.55,
    u_trx: 0.4,
    u_try: 0.32,
    u_tdark: 1,
    u_fadeB: 0.08,
  },
  workWithUs: {
    u_y0: 1,
    u_y1: 0.35,
    u_th: 0.11,
    u_amp: 0.06,
    u_twist: 0.5,
    u_tx: 0.27,
    u_ty: 0.45,
    u_trx: 0.25,
    u_try: 0.35,
    u_tdark: 0.75,
    u_fadeT: 0.3,
    u_fadeB: 0.05,
  },
  /* Feature 51 · the handoff `preguntas-muush-1.0` band (README). */
  faq: {
    u_y0: 0.2,
    u_y1: 0.5,
    u_th: 0.24,
    u_right: 0.6,
    u_tx: 0.5,
    u_ty: 0.5,
    u_trx: 0.62,
    u_try: 0.42,
    u_tdark: 0,
    u_fadeT: 0.06,
    u_fadeB: 0.3,
  },
  notFound: {
    u_y0: 0.98,
    u_y1: 0.92,
    u_th: 0.11,
    u_right: 0.6,
    u_tx: 0.5,
    u_ty: 0.5,
    u_trx: 0.42,
    u_try: 0.4,
    u_tdark: 1,
    u_fadeT: 0.1,
    u_fadeB: 0.02,
  },
  /* Feature 43 · the open mobile menu, pen extract-43 § 4 (not in the README). */
  mobileMenu: {
    u_y0: 1.02,
    u_y1: 0.8,
    u_th: 0.06,
    u_amp: 0.03,
    u_tdark: 0,
  },
}

/**
 * Feature 46 · FR-046 and Roberto's ruling of 2026-11-02 (Clarifications
 * Q3): the mobile uniforms the `.pen` draws, used below 1024 px. Pen
 * extract-46 §§ 2–4 (Nosotros, Preguntas, 404) and § 6 (home `V2s7T`).
 */
const ASSESSMENT_COMPACT = {
  u_y0: 1,
  u_y1: 0.5,
  u_th: 0.05,
  u_amp: 0.03,
  u_twist: 0.5,
  u_tx: 0.5,
  u_ty: 0.2,
  u_trx: 0.6,
  u_try: 0.2,
  u_tdark: 0.8,
  u_fadeT: 0.15,
  u_fadeB: 0.02,
}

const EXPECTED_COMPACT: Partial<
  Record<BackgroundPresetName, Record<string, number>>
> = {
  homeHero: {
    u_y0: 0.95,
    u_y1: 0.68,
    u_th: 0.07,
    u_amp: 0.04,
    u_tx: 0.5,
    u_ty: 0.5,
    u_trx: 0.5,
    u_try: 0.32,
    u_tdark: 1,
    u_fadeB: 0.06,
  },
  howWeWork: {
    u_ribs: 16,
    u_y0: 0.045,
    u_y1: 0.035,
    u_th: 0.035,
    u_right: 0.5,
    u_tdark: 0,
    u_fadeB: 0,
  },
  assessment: ASSESSMENT_COMPACT,
  aboutHero: {
    u_y0: 0.95,
    u_y1: 0.68,
    u_th: 0.07,
    u_amp: 0.04,
    u_tx: 0.5,
    u_ty: 0.5,
    u_trx: 0.5,
    u_try: 0.34,
    u_tdark: 1,
    u_fadeB: 0.06,
  },
  workWithUs: ASSESSMENT_COMPACT,
  /* Feature 51 · the desktop set plus `u_ribs: 18`, `u_th: 0.26` (README). */
  faq: {
    u_ribs: 18,
    u_y0: 0.2,
    u_y1: 0.5,
    u_th: 0.26,
    u_right: 0.6,
    u_tx: 0.5,
    u_ty: 0.5,
    u_trx: 0.62,
    u_try: 0.42,
    u_tdark: 0,
    u_fadeT: 0.06,
    u_fadeB: 0.3,
  },
  notFound: {
    u_ribs: 18,
    u_y0: 0.9,
    u_y1: 0.84,
    u_th: 0.08,
    u_right: 0.6,
    u_tx: 0.5,
    u_ty: 0.48,
    u_trx: 0.6,
    u_try: 0.28,
    u_tdark: 1,
    u_fadeB: 0.08,
  },
}

/** The presets the handoff ships a poster for: all but the mobile menu. */
const WITH_POSTER = new Set<BackgroundPresetName>([
  'homeHero',
  'howWeWork',
  'assessment',
  'aboutHero',
  'workWithUs',
  'faq',
  'notFound',
])

const entries = Object.entries(BACKGROUND_PRESETS) as [
  BackgroundPresetName,
  (typeof BACKGROUND_PRESETS)[BackgroundPresetName],
][]

describe('backgroundPresets', () => {
  it('should define the seven section uses and the mobile menu when imported', () => {
    expect(Object.keys(BACKGROUND_PRESETS).sort()).toEqual(
      [
        'aboutHero',
        'assessment',
        'faq',
        'homeHero',
        'howWeWork',
        'mobileMenu',
        'notFound',
        'workWithUs',
      ].sort()
    )
  })

  for (const [name, preset] of entries) {
    it(`should use the listón or the acanalado when the preset is ${name}`, () => {
      expect(['liston', 'acanalado']).toContain(preset.shader)
    })

    it(`should flip the y axis when the preset is ${name}`, () => {
      expect(preset.uniforms.u_flip).toBe(1)
    })

    it(`should carry the README uniforms when the preset is ${name}`, () => {
      expect(preset.uniforms).toEqual({ u_flip: 1, ...EXPECTED_UNIFORMS[name] })
    })

    it(`should only set uniforms its shader declares when the preset is ${name}`, () => {
      const source = shaderSource(preset.shader)

      for (const uniform of Object.keys(preset.uniforms)) {
        expect(source, uniform).toMatch(new RegExp(`uniform float ${uniform};`))
      }
    })

    const compact = EXPECTED_COMPACT[name]
    if (compact) {
      it(`should carry the .pen mobile uniforms below 1024 when the preset is ${name}`, () => {
        expect(preset.compactUniforms).toEqual({ u_flip: 1, ...compact })
      })

      it(`should only set compact uniforms its shader declares when the preset is ${name}`, () => {
        const source = shaderSource(preset.shader)

        for (const uniform of Object.keys(preset.compactUniforms ?? {})) {
          expect(source, uniform).toMatch(
            new RegExp(`uniform float ${uniform};`)
          )
        }
      })
    }

    if (WITH_POSTER.has(name)) {
      it(`should point at a poster when the preset is ${name}`, () => {
        expect(preset.poster).toMatch(/\.webp/)
      })
    }
  }

  it('should give Trabaja con muush the assessment uniforms and poster when compared', () => {
    expect(BACKGROUND_PRESETS.workWithUs.uniforms).toEqual(
      BACKGROUND_PRESETS.assessment.uniforms
    )
    expect(BACKGROUND_PRESETS.workWithUs.poster).toBe(
      BACKGROUND_PRESETS.assessment.poster
    )
  })

  it('should give every section preset a compact set and the mobile menu none when compared', () => {
    const compact = entries
      .filter(([, preset]) => preset.compactUniforms)
      .map(([name]) => name)
      .sort()

    expect(compact).toEqual([...WITH_POSTER].sort())
    expect(BACKGROUND_PRESETS.mobileMenu.compactUniforms).toBeUndefined()
  })

  it('should carry u_flip 1 in every compact set when compared', () => {
    for (const [name, preset] of entries) {
      if (!preset.compactUniforms) continue
      expect(preset.compactUniforms.u_flip, name).toBe(1)
    }
  })

  it('should draw 18 ribs on both mobile acanalados of Preguntas and the 404 when compared', () => {
    expect(BACKGROUND_PRESETS.faq.compactUniforms?.u_ribs).toBe(18)
    expect(BACKGROUND_PRESETS.notFound.compactUniforms?.u_ribs).toBe(18)
  })

  it('should share the mobile Diagnóstico set with Trabaja con muush when compared', () => {
    expect(BACKGROUND_PRESETS.workWithUs.compactUniforms).toEqual(
      BACKGROUND_PRESETS.assessment.compactUniforms
    )
  })

  it('should load above-the-fold posters eagerly and the rest lazily when compared', () => {
    const high = entries
      .filter(([, preset]) => preset.priority === 'high')
      .map(([name]) => name)
      .sort()

    expect(high).toEqual(['aboutHero', 'faq', 'homeHero', 'notFound'])
  })

  it('should give the mobile menu a lazy listón with no poster when read', () => {
    /* Feature 43 · FR-015, research R7: the handoff ships no poster for it. */
    expect(BACKGROUND_PRESETS.mobileMenu.shader).toBe('liston')
    expect(BACKGROUND_PRESETS.mobileMenu.poster).toBeUndefined()
    expect(BACKGROUND_PRESETS.mobileMenu.priority).toBe('lazy')
  })

  it('should load each GLSL source when asked for it', async () => {
    for (const shader of ['liston', 'acanalado'] as const) {
      const source = await SHADER_SOURCES[shader]()
      expect(source).toBe(shaderSource(shader))
    }
  })
})

/**
 * Feature 43 reopened 2 · 2026-11-01 (spec FR-057, FR-058). The handoff seeds
 * the grain hash in `finish()` with `fract(u_time*7.0)`, so the grain changes
 * every frame and flickers "como ISO alto". Roberto chose a static grain: the
 * hash takes only the pixel coordinate, and `u_grain` still scales it.
 */
describe('shader grain', () => {
  const GRAIN_TERM = /col\+=\(hash\(([^()]*)\)-0\.5\)\*u_grain;/

  function finishBody(source: string): string {
    const start = source.indexOf('vec3 finish(')
    expect(start, 'finish() is declared').toBeGreaterThanOrEqual(0)
    return source.slice(start, source.indexOf('\n', start))
  }

  for (const shader of ['liston', 'acanalado'] as const) {
    it(`should seed the ${shader} grain hash without u_time when finish() adds it`, () => {
      const body = finishBody(shaderSource(shader))
      const grain = GRAIN_TERM.exec(body)
      expect(grain, 'finish() adds the grain scaled by u_grain').not.toBeNull()
      expect(grain?.[1]).toBe('gl_FragCoord.xy')
      expect(body).not.toContain('u_time')
    })
  }
})
