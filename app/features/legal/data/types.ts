/**
 * The legal module's content model (feature 48).
 *
 * This layer holds i18n **keys** and structure only. Turning a key into a
 * string is `logic/`'s job, and nothing here imports from `logic/` or `ui/`
 * (Constitution Article II).
 */

/**
 * One block of a legal section, in the `.pen`'s order:
 * - `paragraph`: running text;
 * - `bullets`: a list with the red 6 px dot;
 * - `steps`: the numbered list (the ARCO request), numbers in Red muush;
 * - `table`: "Qué datos recabamos" — a two-column table from `md`, stacked
 *   cards below it;
 * - `preferences`: the "Cambiar mis preferencias" button, which reopens the
 *   cookie preferences.
 */
export type LegalBlock =
  | { kind: 'paragraph'; key: string }
  | { kind: 'bullets'; keys: string[] }
  | { kind: 'steps'; keys: string[] }
  | { kind: 'table'; rows: { whereKey: string; dataKey: string }[] }
  | { kind: 'preferences'; key: string }

export interface LegalSectionModel {
  /** The section's anchor, the target of its index link. */
  id: string
  /** The index label, shorter than the title in places. */
  navKey: string
  titleKey: string
  blocks: LegalBlock[]
}

export interface LegalPageModel {
  headingFirstKey: string
  headingSecondKey: string
  updatedKey: string
  sections: LegalSectionModel[]
}

/** What `ui/` renders: the same shape with every key resolved. */
export type ResolvedLegalBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'table'; rows: { where: string; data: string }[] }
  | { kind: 'preferences'; label: string }

export interface ResolvedLegalSection {
  id: string
  nav: string
  title: string
  blocks: ResolvedLegalBlock[]
}

export interface LegalPageContent {
  headingFirst: string
  headingSecond: string
  updated: string
  /**
   * "Courtesy translation…": drawn on the English frames only, so it is
   * absent on the Spanish page, which is the version that prevails.
   */
  translationNote?: string
  /** "En esta página", the index label. */
  onThisPage: string
  sections: ResolvedLegalSection[]
}
