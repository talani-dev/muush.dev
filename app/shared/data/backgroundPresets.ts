import posterNotFound from '@/assets/backgrounds/404-acanalado.webp'
import posterHowWeWork from '@/assets/backgrounds/como-trabajamos-acanalado.webp'
import posterAssessment from '@/assets/backgrounds/diagnostico-liston.webp'
import posterHomeHero from '@/assets/backgrounds/hero-liston.webp'
import posterAboutHero from '@/assets/backgrounds/nosotros-hero-liston.webp'
import posterFaq from '@/assets/backgrounds/preguntas-acanalado.webp'

/**
 * The animated section backgrounds of Muush 1.0 (feature 42, spec FR-018,
 * research R9, data-model § 3): one preset per production use in the
 * handoff README, each bundling its shader, its uniform overrides, its still
 * poster and whether that poster is above the fold.
 *
 * Only the listón and the vidrio acanalado ship; brasa-acero is reserved for
 * another brand (handoff README). Every preset carries `u_flip: 1`. A preset
 * lists overrides only: every uniform it omits takes the `@default` of its
 * `.glsl`, read at runtime by `readShaderDefaults`
 * (`utils/shaderUniformDefaults.ts`) and merged by `withShaderDefaults`
 * (`utils/shaderFrame.ts`) under the engine base values (`u_speed`,
 * `u_flip`, `u_grain`) and then the preset. WebGL would otherwise leave it
 * at 0 — the cause of the missing hero listón and acanalado ribs fixed on
 * 2026-11-01. The uniform values are the README's, which the `.pen` fills
 * use too (pen extract § 6).
 *
 * Posters are imported as modules so the build hashes them under `_nuxt/`;
 * nothing is served from `docs/` (FR-025).
 *
 * Feature 46 (Roberto 2026-11-02, spec 046 Clarifications Q3, FR-046): the
 * `.pen` mobile frames draw their own uniforms for every section
 * background, so a preset may carry `compactUniforms`, used below 1024 px
 * (`ShaderBackground`). Values from pen extract-46 §§ 2–4 and § 6 (home
 * frame `V2s7T`). Like `uniforms`, they are overrides only: a uniform the
 * compact set omits takes the shader `@default`, never the desktop value.
 * The mobile menu has no compact set (it is mobile only). The poster stays
 * one per section.
 */
export type ShaderName = 'liston' | 'acanalado'

export type BackgroundPresetName =
  | 'homeHero'
  | 'howWeWork'
  | 'assessment'
  | 'aboutHero'
  | 'workWithUs'
  | 'faq'
  | 'notFound'
  | 'mobileMenu'

export interface BackgroundPreset {
  shader: ShaderName
  /** Overrides only; `u_flip: 1` always included. */
  uniforms: Readonly<Record<`u_${string}`, number>>
  /** Overrides used below 1024 px, where the mobile frame draws its own. */
  compactUniforms?: Readonly<Record<`u_${string}`, number>>
  /**
   * Hashed asset URL of the still frame. Optional since feature 43: the
   * mobile menu's listón has none in the handoff, and without one the
   * fallback is the host's own background (research R7).
   */
  poster?: string
  /** `high`: above the fold, may be the LCP image, loaded eagerly. */
  priority: 'high' | 'lazy'
}

/** Diagnóstico y contacto; Trabaja con muush reuses it (handoff README). */
const ASSESSMENT_UNIFORMS = {
  u_flip: 1,
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
} as const

/**
 * The mobile Diagnóstico listón (home frame `V2s7T`, pen extract-46 § 6);
 * the mobile Trabaja con muush draws the same values (§ 2, `JIhrf`).
 */
const ASSESSMENT_COMPACT_UNIFORMS = {
  u_flip: 1,
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
} as const

export const BACKGROUND_PRESETS: Readonly<
  Record<BackgroundPresetName, Readonly<BackgroundPreset>>
> = {
  /* Home · hero, 1000 px. */
  homeHero: {
    shader: 'liston',
    uniforms: {
      u_flip: 1,
      u_tx: 0.5,
      u_ty: 0.53,
      u_trx: 0.36,
      u_try: 0.28,
      u_tdark: 1,
      u_fadeB: 0.06,
    },
    /* Home mobile hero listón (pen extract-46 § 6). */
    compactUniforms: {
      u_flip: 1,
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
    poster: posterHomeHero,
    priority: 'high',
  },
  /* Home · Cómo trabajamos. */
  howWeWork: {
    shader: 'acanalado',
    uniforms: {
      u_flip: 1,
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
    /* Home mobile Cómo trabajamos acanalado (pen extract-46 § 6). */
    compactUniforms: {
      u_flip: 1,
      u_ribs: 16,
      u_y0: 0.045,
      u_y1: 0.035,
      u_th: 0.035,
      u_right: 0.5,
      u_tdark: 0,
      u_fadeB: 0,
    },
    poster: posterHowWeWork,
    priority: 'lazy',
  },
  /* Home · Diagnóstico y contacto. */
  assessment: {
    shader: 'liston',
    uniforms: ASSESSMENT_UNIFORMS,
    compactUniforms: ASSESSMENT_COMPACT_UNIFORMS,
    poster: posterAssessment,
    priority: 'lazy',
  },
  /* Nosotros · hero, 820 px. */
  aboutHero: {
    shader: 'liston',
    uniforms: {
      u_flip: 1,
      u_tx: 0.5,
      u_ty: 0.55,
      u_trx: 0.4,
      u_try: 0.32,
      u_tdark: 1,
      u_fadeB: 0.08,
    },
    /* Nosotros mobile hero listón `eU4li` (pen extract-46 § 2). */
    compactUniforms: {
      u_flip: 1,
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
    poster: posterAboutHero,
    priority: 'high',
  },
  /*
   * Nosotros · Trabaja con muush: the README gives it the assessment's
   * uniforms and the handoff ships no poster of its own, so it reuses the
   * diagnóstico poster (confirmed by Roberto 2026-10-31). Its mobile frame
   * (`JIhrf`, pen extract-46 § 2) draws the mobile Diagnóstico values too.
   */
  workWithUs: {
    shader: 'liston',
    uniforms: ASSESSMENT_UNIFORMS,
    compactUniforms: ASSESSMENT_COMPACT_UNIFORMS,
    poster: posterAssessment,
    priority: 'lazy',
  },
  /* Preguntas · all content, 1100 px. */
  faq: {
    shader: 'acanalado',
    uniforms: {
      u_flip: 1,
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
    /* Preguntas mobile acanalado, 18 ribs (pen extract-46 § 3). */
    compactUniforms: {
      u_flip: 1,
      u_ribs: 18,
      u_y0: 0.86,
      u_y1: 0.8,
      u_th: 0.08,
      u_right: 0.6,
      u_tx: 0.5,
      u_ty: 0.48,
      u_trx: 0.6,
      u_try: 0.26,
      u_tdark: 1,
      u_fadeB: 0.1,
    },
    poster: posterFaq,
    priority: 'high',
  },
  /* 404 · content, 760 px. */
  notFound: {
    shader: 'acanalado',
    uniforms: {
      u_flip: 1,
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
    /* 404 mobile acanalado, 18 ribs (pen extract-46 § 4). */
    compactUniforms: {
      u_flip: 1,
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
    poster: posterNotFound,
    priority: 'high',
  },
  /*
   * The open mobile menu (feature 43, spec FR-015; pen extract-43 § 4,
   * frames `chQ4f` / `QpUCy`). Not in the handoff README table, and the
   * handoff ships no poster for it, so it has none: without WebGL the
   * menu's Negro 950 base and its glass show alone. Mounted only while the
   * menu is open.
   */
  mobileMenu: {
    shader: 'liston',
    uniforms: {
      u_flip: 1,
      u_y0: 1.02,
      u_y1: 0.8,
      u_th: 0.06,
      u_amp: 0.03,
      u_tdark: 0,
    },
    priority: 'lazy',
  },
}

/**
 * The GLSL sources, loaded on demand so a page bundles only the shader it
 * shows. The files are copies of the handoff's two shaders (research R8),
 * with the version prefix dropped from their file names and one deliberate
 * divergence: the grain hash in `finish()` no longer depends on `u_time`, so
 * the grain is static (Roberto 2026-11-01, feature 43 spec FR-057).
 */
export const SHADER_SOURCES: Readonly<
  Record<ShaderName, () => Promise<string>>
> = {
  liston: () =>
    import('@/assets/shaders/liston.glsl?raw').then(module => module.default),
  acanalado: () =>
    import('@/assets/shaders/acanalado.glsl?raw').then(
      module => module.default
    ),
}
