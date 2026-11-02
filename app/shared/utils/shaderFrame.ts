/**
 * Pure rules of the animated backgrounds (feature 42, research R10,
 * contract § 8), translated from the handoff's `muush-gradient.js`.
 *
 * These numbers are runtime thresholds, not visual values, so they are named
 * constants here rather than CSS tokens (Article VIII). `768` mirrors the
 * handoff's "celular < 768 px" rule; it is not a layout breakpoint.
 */

/** Below this viewport width (CSS px) the shader draws at 1×. */
export const MOBILE_MAX_WIDTH = 768
/** Device-pixel ratio below `MOBILE_MAX_WIDTH`, to save battery. */
export const MOBILE_PIXEL_RATIO = 1
/** Device-pixel ratio ceiling from `MOBILE_MAX_WIDTH` up. */
export const DESKTOP_MAX_PIXEL_RATIO = 1.5
/** Shader time of the single still frame drawn under reduced motion. */
export const STILL_TIME_SECONDS = 12
/**
 * The engine's uniform defaults; a preset's own values win. `u_grain` is
 * 0.03, softer than the 0.07 `@default` in the `.glsl` files, which this base
 * overrides (Roberto 2026-11-01, feature 43 spec FR-060).
 */
export const SHADER_DEFAULTS = { u_speed: 1, u_flip: 1, u_grain: 0.03 } as const

export interface AnimationState {
  visible: boolean
  documentHidden: boolean
  reducedMotion: boolean
}

/** The drawing ratio: the device's, capped at 1× on mobile and 1.5× above. */
export function capPixelRatio(
  devicePixelRatio: number,
  viewportWidth: number
): number {
  const cap =
    viewportWidth < MOBILE_MAX_WIDTH
      ? MOBILE_PIXEL_RATIO
      : DESKTOP_MAX_PIXEL_RATIO
  const deviceRatio =
    Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
      ? devicePixelRatio
      : 1
  return Math.min(deviceRatio, cap)
}

/** The canvas backing-store size for a CSS box at a ratio, at least 1 × 1. */
export function canvasPixelSize(
  cssWidth: number,
  cssHeight: number,
  ratio: number
): { width: number; height: number } {
  return {
    width: Math.max(1, Math.round(cssWidth * ratio)),
    height: Math.max(1, Math.round(cssHeight * ratio)),
  }
}

/** Animate only what is seen, in a visible tab, when motion is allowed. */
export function shouldAnimate(state: AnimationState): boolean {
  return state.visible && !state.documentHidden && !state.reducedMotion
}

/**
 * The uniforms one draw sends, in the handoff engine's precedence
 * (`MuushGradient` constructor, 2026-11-01): the shader's own `@default`
 * values (`readShaderDefaults`), then the engine base values above, then the
 * preset's uniforms. Each layer wins over the one before it.
 */
export function withShaderDefaults(
  uniforms: Readonly<Record<string, number>>,
  shaderDefaults: Readonly<Record<string, number>> = {}
): Record<string, number> {
  return { ...shaderDefaults, ...SHADER_DEFAULTS, ...uniforms }
}
