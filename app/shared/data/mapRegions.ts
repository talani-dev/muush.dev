/**
 * The two regions the mobile map zooms into (feature 44, spec FR-010;
 * data-model § 1), in the map's 1408 × 470 space. Values are the handoff's
 * `REGIONES` (`docs/handoff/muush-1.0/componentes/componentes.js`):
 * America `[210, 95, 285, 200]`, Europe `[645, 75, 190, 95]`. Array order is
 * the tab order; America is the default (server render and no-script).
 */
export type MapRegionName = 'america' | 'europe'

export interface MapRegion {
  name: MapRegionName
  x: number
  y: number
  width: number
  height: number
}

export const MAP_REGIONS: readonly MapRegion[] = [
  { name: 'america', x: 210, y: 95, width: 285, height: 200 },
  { name: 'europe', x: 645, y: 75, width: 190, height: 95 },
]

export const DEFAULT_MAP_REGION: MapRegionName = 'america'

/**
 * The mobile map box's width / height: 342 × 240 in the 390 frame (pen
 * extract-44 § 2.1). The box keeps this proportion at every width below
 * `lg`, which is what lets each region's zoom be a constant (research R4).
 * The same ratio is the `aspect-mapa-ventana` token in `global.css`.
 */
export const MAP_WINDOW_ASPECT = 342 / 240
