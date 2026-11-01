/**
 * The translucent dark surface family of Muush 1.0 (feature 42, spec FR-010,
 * data-model § 2): a fill, a radius, an optional backdrop blur, the 1 px
 * top-lit edge, an optional long shadow, padding and clipping.
 *
 * The three presets are the three surfaces the `.pen` draws in production
 * (pen extract § 3). Every field is a NAME, never a value: `GLASS_CLASSES`
 * maps each name to complete, static utility classes so Tailwind's scanner
 * sees them (a concatenated class name is a utility that is never emitted).
 */

/** negro-900 at 70 % · opaque negro-900 · carbón-800 at 40 %. */
export type GlassFill = 'panel' | 'servicio' | 'franja'
/** 28 · 24 · 20 px. */
export type GlassRadius = 'panel' | 'servicio' | 'franja'
/** none · 20 px · 30 px. */
export type GlassBlur = 'none' | 'boton' | 'vidrio'
/** Blanco 25 → 4 % · 18 → 4 % · flat 10 %. */
export type GlassEdge = 'panel' | 'tarjeta' | 'plano'
/** none · 36 px · 22 / 28 px. */
export type GlassPadding = 'none' | 'panel' | 'franja'

export type GlassPresetName = 'panel' | 'servicio' | 'franja'

export interface GlassStyle {
  fill: GlassFill
  radius: GlassRadius
  blur: GlassBlur
  edge: GlassEdge
  shadow: boolean
  padding: GlassPadding
  clip: boolean
}

export const GLASS_PRESETS: Readonly<
  Record<GlassPresetName, Readonly<GlassStyle>>
> = {
  /* Form glass panel `yCKxV`: blur 30, black shadow y 30 blur 80, padding 36. */
  panel: {
    fill: 'panel',
    radius: 'panel',
    blur: 'vidrio',
    edge: 'panel',
    shadow: true,
    padding: 'panel',
    clip: false,
  },
  /* Service card: opaque, no blur, clips its media; its text block pads
     itself (22 / 24 / 28 / 24), which is feature 44's. */
  servicio: {
    fill: 'servicio',
    radius: 'servicio',
    blur: 'none',
    edge: 'tarjeta',
    shadow: false,
    padding: 'none',
    clip: true,
  },
  /* "También" strip `i6K0R`: blur 20, flat edge, padding 22 / 28. */
  franja: {
    fill: 'franja',
    radius: 'franja',
    blur: 'boton',
    edge: 'plano',
    shadow: false,
    padding: 'franja',
    clip: false,
  },
}

export const GLASS_CLASSES = {
  fill: {
    panel: 'bg-vidrio-fondo',
    servicio: 'bg-negro-900',
    franja: 'bg-franja-fondo',
  },
  radius: {
    panel: 'rounded-panel',
    servicio: 'rounded-servicio',
    franja: 'rounded-franja',
  },
  blur: {
    none: '',
    boton: 'backdrop-blur-boton',
    vidrio: 'backdrop-blur-vidrio',
  },
  edge: {
    panel: 'borde-luz borde-panel',
    tarjeta: 'borde-luz borde-tarjeta',
    plano: 'borde-luz borde-plano',
  },
  shadow: { on: 'shadow-vidrio', off: '' },
  padding: {
    none: '',
    panel: 'p-panel',
    franja: 'py-franja-y px-franja-x',
  },
  clip: { on: 'overflow-clip', off: '' },
} as const satisfies {
  fill: Record<GlassFill, string>
  radius: Record<GlassRadius, string>
  blur: Record<GlassBlur, string>
  edge: Record<GlassEdge, string>
  shadow: Record<'on' | 'off', string>
  padding: Record<GlassPadding, string>
  clip: Record<'on' | 'off', string>
}

/** The complete class list of one surface style. */
export function glassClasses(style: Readonly<GlassStyle>): string[] {
  return [
    GLASS_CLASSES.fill[style.fill],
    GLASS_CLASSES.radius[style.radius],
    GLASS_CLASSES.blur[style.blur],
    GLASS_CLASSES.edge[style.edge],
    GLASS_CLASSES.shadow[style.shadow ? 'on' : 'off'],
    GLASS_CLASSES.padding[style.padding],
    GLASS_CLASSES.clip[style.clip ? 'on' : 'off'],
  ].filter(Boolean)
}
