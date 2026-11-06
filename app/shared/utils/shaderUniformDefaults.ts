/**
 * Reads the `@default` of every `float` uniform from a fragment shader's own
 * doc comments — the port of the handoff's `MuushGradient.defaults()`
 * (`docs/handoff/muush-1.0/muush-gradient.js`, corrected 2026-11-01).
 *
 * WebGL starts every uniform at 0. A uniform a preset does not pass must take
 * the value its `.glsl` declares instead: without this the hero listón has
 * zero thickness and the acanalado has zero ribs (feature 43, reopened
 * 2026-11-01). The `.glsl` files are the same ones Pencil reads, so the
 * defaults are the design's own.
 *
 * Only a doc comment (`/** … *\/`) placed directly before a `uniform float`
 * counts, matching the handoff's pattern; `vec2` uniforms (`u_res`) and
 * comments without `@default` are skipped.
 */
const DOC_COMMENT_BEFORE_FLOAT_UNIFORM =
  /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*uniform\s+float\s+(\w+)/g
const DEFAULT_TAG = /@default\s+(-?[\d.]+)/

export function readShaderDefaults(source: string): Record<string, number> {
  const defaults: Record<string, number> = {}
  for (const [, doc = '', name = ''] of source.matchAll(
    DOC_COMMENT_BEFORE_FLOAT_UNIFORM
  )) {
    const tag = DEFAULT_TAG.exec(doc)
    const value = tag ? Number.parseFloat(tag[1] ?? '') : Number.NaN
    if (Number.isFinite(value)) defaults[name] = value
  }
  return defaults
}
