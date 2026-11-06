/**
 * Which legal section the index marks as current (feature 48), as a pure
 * function of measurements so it is unit-tested without a layout engine.
 *
 * The current section is the last one whose top has crossed the reading
 * line (`line`, px from the viewport top). Before the first crosses it, the
 * first section is current, which is also what the prerendered page shows.
 * At the bottom of the page the last section is current even if it is too
 * short to reach the line ("Autoridad", "Contacto").
 */
export interface SectionMeasure {
  id: string
  /** `getBoundingClientRect().top`. */
  top: number
}

export function pickActiveSection(
  sections: readonly SectionMeasure[],
  line: number,
  atBottom: boolean
): string | null {
  if (sections.length === 0) return null
  if (atBottom) return sections.at(-1)?.id ?? null
  let active = sections[0]?.id ?? null
  for (const section of sections) {
    if (section.top <= line) active = section.id
  }
  return active
}
