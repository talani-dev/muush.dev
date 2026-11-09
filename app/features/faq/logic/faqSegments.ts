import type { FaqTextSegment } from '@/features/faq/data/types'

/**
 * Splits a translated string at its `{name}` placeholders into the runs
 * `ui/` renders (feature 51, spec FR-007; research R2).
 *
 * The locale file writes an inline link or the address as a named
 * placeholder ("…nuestro {privacy}."); `logic/` translates the string with
 * each placeholder passed back as itself, so it survives translation, and
 * this function swaps each one for its segment. `ui/` then renders plain
 * text and real links with no `v-html` and no vue-i18n component, which
 * keeps it free of the Nuxt runtime (rules.md § R23; Storybook renders it).
 * A placeholder with no segment stays as text, so nothing is ever dropped.
 */
const PLACEHOLDER = /\{(\w+)\}/g

export function faqTextSegments(
  template: string,
  parts: Readonly<Record<string, FaqTextSegment>>
): FaqTextSegment[] {
  const segments: FaqTextSegment[] = []
  let cursor = 0
  for (const match of template.matchAll(PLACEHOLDER)) {
    const part = parts[match[1] ?? '']
    if (!part) continue
    pushText(segments, template.slice(cursor, match.index))
    segments.push(part)
    cursor = match.index + match[0].length
  }
  pushText(segments, template.slice(cursor))
  return segments
}

function pushText(segments: FaqTextSegment[], text: string) {
  if (text !== '') segments.push({ kind: 'text', text })
}

/** The segments as one plain string: link texts and the address inline. */
export function faqPlainText(segments: readonly FaqTextSegment[]): string {
  return segments.map(segment => segment.text).join('')
}

/** Every placeholder passed back as itself, for `t(key, params)`. */
export function keepPlaceholders(
  names: readonly string[]
): Record<string, string> {
  return Object.fromEntries(names.map(name => [name, `{${name}}`]))
}
