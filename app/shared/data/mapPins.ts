/**
 * The pins of the dotted world map (feature 44, spec FR-008; data-model
 * § 1). Transcribed from the leader's export of the `.pen`,
 * `docs/harness/progress/assets-44/map-pins.json` (2026-11-01): each pin is
 * a city, the centre of its marker in the map's own 1408 × 470 space (the
 * viewBox of `app/assets/map/world-dots.svg`) and its kind. Never drawn by
 * hand in markup: `WorldMap` places one `MapPin` per entry.
 *
 * Order: as exported. City names are copy and live in the locale files
 * (`map.cities.*`, `@/shared/data/mapCopy`); this file holds only the stable ids.
 */
export type MapPinKind = 'team' | 'partner' | 'soon'

export type MapCity =
  | 'cdmx'
  | 'puebla'
  | 'merida'
  | 'dublin'
  | 'nyc'
  | 'amsterdam'
  | 'estonia'
  | 'sanFrancisco'
  | 'losAngeles'

export interface MapPin {
  city: MapCity
  x: number
  y: number
  kind: MapPinKind
}

/** The map's coordinate space: the SVG's viewBox and the `.pen` block. */
export const MAP_SIZE = { width: 1408, height: 470 } as const

export const MAP_PINS: readonly MapPin[] = [
  { city: 'cdmx', x: 338, y: 254, kind: 'team' },
  { city: 'puebla', x: 342, y: 255, kind: 'team' },
  { city: 'merida', x: 373, y: 248, kind: 'team' },
  { city: 'dublin', x: 681, y: 134, kind: 'team' },
  { city: 'nyc', x: 431, y: 179, kind: 'team' },
  { city: 'amsterdam', x: 722, y: 138, kind: 'partner' },
  { city: 'estonia', x: 795, y: 113, kind: 'soon' },
  { city: 'sanFrancisco', x: 252, y: 189, kind: 'team' },
  { city: 'losAngeles', x: 268, y: 202, kind: 'team' },
]

/** The kinds in legend order: Equipo, Aliados, Estonia · pronto. */
export const MAP_PIN_KINDS: readonly MapPinKind[] = ['team', 'partner', 'soon']
