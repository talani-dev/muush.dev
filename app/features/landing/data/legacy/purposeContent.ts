/**
 * The v1 Propósito's node type (quarantined in feature 44 until feature 47
 * deletes it). Its keys, node key list and content type left with the v1
 * copy when Roberto retired the section (2026-10-31); what remains is what
 * the quarantined components and their stories still read.
 *
 * This file imports **nothing** (Articles II and VI).
 */

/** The three blocks, in the Golden Circle's own order. */
export type PurposeNodeId = 'why' | 'how' | 'what'

/** One node, already translated. */
export interface PurposeNodeContent {
  id: PurposeNodeId
  index: 0 | 1 | 2
  label: string
  /** The v1 copy now lives only in the legacy stories' inline fixtures. */
  copy: string
}
