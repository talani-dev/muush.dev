import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BACKGROUND_PRESETS } from '@/shared/data/backgroundPresets'
import { withShaderDefaults } from '@/shared/utils/shaderFrame'
import { readShaderDefaults } from '@/shared/utils/shaderUniformDefaults'

/**
 * Feature 43 reopened 2026-11-01 · uniforms a preset omits take their
 * shader's `@default` (handoff `MuushGradient.defaults()`), never WebGL's 0.
 * The real shaders are read from disk (rules.md § R27).
 */
function shaderSource(name: 'liston' | 'acanalado'): string {
  return readFileSync(
    join(process.cwd(), 'app', 'assets', 'shaders', `${name}.glsl`),
    'utf8'
  )
}

describe('readShaderDefaults', () => {
  it('should read the @default of each float uniform when it has a doc comment', () => {
    const source = [
      '/** @resolution */',
      'uniform vec2 u_res;',
      '/**',
      ' * @label A',
      ' * @default 0.25',
      ' * @range 0, 1',
      ' */',
      'uniform float u_a;',
      '/** @default -0.2 */',
      'uniform float u_b;',
      '/** @time */',
      'uniform float u_time;',
      'uniform float u_bare;',
    ].join('\n')
    expect(readShaderDefaults(source)).toEqual({ u_a: 0.25, u_b: -0.2 })
  })

  it('should return nothing when the source has no doc comments', () => {
    expect(readShaderDefaults('uniform float u_a;')).toEqual({})
  })

  it('should read the listón geometry the hero preset omits', () => {
    expect(readShaderDefaults(shaderSource('liston'))).toMatchObject({
      u_y0: 0.98,
      u_y1: 0.5,
      u_amp: 0.07,
      u_th: 0.1,
      u_twist: 0.6,
      u_speed: 1,
      u_flip: 1,
      u_grain: 0.07,
    })
  })

  it('should read the acanalado ribs and refraction no preset passes', () => {
    expect(readShaderDefaults(shaderSource('acanalado'))).toMatchObject({
      u_ribs: 46,
      u_refract: 0.05,
      u_y0: 0.62,
      u_y1: 0.45,
      u_th: 0.22,
      u_right: 0.55,
    })
  })
})

describe('withShaderDefaults · shader @default layer', () => {
  it('should give a missing uniform its @default when the preset omits it', () => {
    const merged = withShaderDefaults(
      BACKGROUND_PRESETS.homeHero.uniforms,
      readShaderDefaults(shaderSource('liston'))
    )
    expect(merged.u_th).toBe(0.1)
    expect(merged.u_y0).toBe(0.98)
    expect(merged.u_twist).toBe(0.6)
  })

  it('should give the acanalado its 46 ribs when the preset omits them', () => {
    const merged = withShaderDefaults(
      BACKGROUND_PRESETS.howWeWork.uniforms,
      readShaderDefaults(shaderSource('acanalado'))
    )
    expect(merged.u_ribs).toBe(46)
    expect(merged.u_refract).toBe(0.05)
  })

  it('should let an explicit preset value win over the @default', () => {
    const merged = withShaderDefaults(
      BACKGROUND_PRESETS.howWeWork.uniforms,
      readShaderDefaults(shaderSource('acanalado'))
    )
    expect(merged.u_th).toBe(0.15)
    expect(merged.u_right).toBe(0.45)
    expect(merged.u_y0).toBe(0.52)
  })

  it('should let the engine base values win over the @default', () => {
    expect(
      withShaderDefaults({}, { u_grain: 0.5, u_speed: 2, u_other: 3 })
    ).toEqual({ u_grain: 0.03, u_speed: 1, u_flip: 1, u_other: 3 })
  })

  it('should leave every uniform of every preset non-missing when merged', () => {
    for (const preset of Object.values(BACKGROUND_PRESETS)) {
      const defaults = readShaderDefaults(shaderSource(preset.shader))
      const merged = withShaderDefaults(preset.uniforms, defaults)
      for (const name of Object.keys(defaults)) {
        expect(merged[name], `${preset.shader}.${name}`).toBeTypeOf('number')
      }
    }
  })
})
