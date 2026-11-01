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
  faq: {
    u_y0: 0.84,
    u_y1: 0.76,
    u_th: 0.13,
    u_right: 0.6,
    u_tx: 0.5,
    u_ty: 0.5,
    u_trx: 0.45,
    u_try: 0.26,
    u_tdark: 1,
    u_fadeT: 0.1,
    u_fadeB: 0.15,
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
}

const entries = Object.entries(BACKGROUND_PRESETS) as [
  BackgroundPresetName,
  (typeof BACKGROUND_PRESETS)[BackgroundPresetName],
][]

describe('backgroundPresets', () => {
  it('should define exactly the seven production uses when imported', () => {
    expect(Object.keys(BACKGROUND_PRESETS).sort()).toEqual(
      [
        'aboutHero',
        'assessment',
        'faq',
        'homeHero',
        'howWeWork',
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

    it(`should point at a poster when the preset is ${name}`, () => {
      expect(preset.poster).toMatch(/\.webp/)
    })
  }

  it('should give Trabaja con muush the assessment uniforms and poster when compared', () => {
    expect(BACKGROUND_PRESETS.workWithUs.uniforms).toEqual(
      BACKGROUND_PRESETS.assessment.uniforms
    )
    expect(BACKGROUND_PRESETS.workWithUs.poster).toBe(
      BACKGROUND_PRESETS.assessment.poster
    )
  })

  it('should load above-the-fold posters eagerly and the rest lazily when compared', () => {
    const high = entries
      .filter(([, preset]) => preset.priority === 'high')
      .map(([name]) => name)
      .sort()

    expect(high).toEqual(['aboutHero', 'faq', 'homeHero', 'notFound'])
  })

  it('should load each GLSL source when asked for it', async () => {
    for (const shader of ['liston', 'acanalado'] as const) {
      const source = await SHADER_SOURCES[shader]()
      expect(source).toBe(shaderSource(shader))
    }
  })
})
