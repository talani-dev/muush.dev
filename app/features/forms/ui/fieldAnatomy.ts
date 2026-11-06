/**
 * The v2 field anatomy, shared by every control of both forms (feature 45,
 * pen extract-45 §§ 2, 4; data-model § 5). Two anatomies swap at `md`
 * together with the view (spec FR-002): below it the mobile one (46 tall,
 * no stroke, radius 12, 14 px, labels 400), from it the desktop one (50
 * tall, 1 px Blanco 10 % stroke, radius 14, 15 px, labels 600 tracked).
 *
 * Complete static class strings so Tailwind's scanner sees them (a
 * concatenated class name is a utility that is never emitted).
 */
export const LABEL_CLASSES =
  'font-texto text-etiqueta-campo text-gris-400 md:text-etiqueta-campo-escritorio'

export const HELP_CLASSES = 'font-texto text-ayuda text-red-muush-500'

/** Fill, radius, type and focus of every control box. */
const CONTROL_BASE =
  'w-full min-w-0 rounded-campo border bg-carbon-800 font-texto text-campo text-blanco placeholder:text-texto-tenue transition-colors duration-(--rapido) ease-muush foco md:rounded-campo-escritorio md:text-campo-escritorio md:placeholder:text-gris-400'

/** One-line controls: inputs, selects, the dial-code face. */
export const LINE_CONTROL_CLASSES = `${CONTROL_BASE} h-campo-alto px-campo-x md:h-campo-alto-escritorio md:px-campo-x-escritorio`

/** The 96-tall boxes: the textarea and the CV box. */
export const AREA_CONTROL_CLASSES = `${CONTROL_BASE} min-h-area-alto px-campo-x py-area-y md:px-campo-x-escritorio md:py-area-y-escritorio`

/** The stroke: Red muush 500 when invalid (§ 3), else none on mobile and
 * Blanco 10 % on desktop. A transparent border keeps both the same size. */
export function strokeClasses(invalid: boolean): string {
  return invalid
    ? 'border-red-muush-500'
    : 'border-transparent md:border-blanco-10'
}

/** `aria-describedby` for a control: its own help line when it shows one,
 * plus any extra ids. */
export function describedBy(
  id: string,
  error: string | undefined,
  ...extra: (string | undefined)[]
): string | undefined {
  const ids = [error ? `${id}-error` : undefined, ...extra].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}
