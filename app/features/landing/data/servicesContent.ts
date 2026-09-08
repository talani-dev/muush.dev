/**
 * Servicios' content model: the keys it renders, the five service nodes, and
 * the geometry both compositions generate from.
 *
 * This file imports **nothing** (Article II). It holds keys, the five-node
 * list, the five confirmed radar centres and one pure geometry helper — no
 * copy, no destination and no Nuxt call.
 */

/** The two standalone keys, plus the closer's own Pill label. */
export const SERVICES_KEYS = {
  eyebrow: 'landing.services.eyebrow',
  /**
   * ⚠️ Not in `data-model.md` § 1.1 — added while implementing. The delivery
   * closer is "Pill + copy" (`data-model.md` § 2.3), and `design-extract.md`
   * § 3 lists `Delivery` among the landing's eleven Pill instances, so the
   * closer needs its own label distinct from the section's `eyebrow`. Kept
   * English in both locales, the same treatment `services.md` gives the five
   * area names and `landing.hero.eyebrow` already gets.
   */
  deliveryLabel: 'landing.services.delivery.label',
  deliveryCopy: 'landing.services.delivery.copy',
} as const

export type ServiceNodeId =
  | 'consulting'
  | 'software'
  | 'cloud'
  | 'automation'
  | 'product'

export interface ServiceNodeKeys {
  id: ServiceNodeId
  /**
   * `index` generates every desktop node-token lookup (`--services-node-{n}-x`
   * with `n = index + 1`) and the mobile `72 + index × 185` step
   * (`data-model.md` §§ 2, 3). Nothing else distinguishes the five.
   */
  index: 0 | 1 | 2 | 3 | 4
  nameKey: string
  briefKey: string
}

/** The five areas, in `services.md`'s own order. */
export const SERVICE_NODES: readonly ServiceNodeKeys[] = [
  {
    id: 'consulting',
    index: 0,
    nameKey: 'landing.services.consulting.name',
    briefKey: 'landing.services.consulting.brief',
  },
  {
    id: 'software',
    index: 1,
    nameKey: 'landing.services.software.name',
    briefKey: 'landing.services.software.brief',
  },
  {
    id: 'cloud',
    index: 2,
    nameKey: 'landing.services.cloud.name',
    briefKey: 'landing.services.cloud.brief',
  },
  {
    id: 'automation',
    index: 3,
    nameKey: 'landing.services.automation.name',
    briefKey: 'landing.services.automation.brief',
  },
  {
    id: 'product',
    index: 4,
    nameKey: 'landing.services.product.name',
    briefKey: 'landing.services.product.brief',
  },
]

/** One node, already translated. */
export interface ServiceNodeContent {
  id: ServiceNodeId
  index: 0 | 1 | 2 | 3 | 4
  name: string
  brief: string
}

/** What `logic/` hands `ui/`: already translated, nothing left to resolve. */
export interface ServicesContent {
  eyebrow: string
  deliveryLabel: string
  deliveryCopy: string
  nodes: ServiceNodeContent[]
}

/**
 * The five confirmed radar centres (`data-model.md` § 2.1), in
 * `SERVICE_NODES`' own order. The single source of truth `connectorEndpoints`
 * reads — never four/five literals (spec FR-006, FR-007, FR-008).
 */
export const SERVICE_NODE_CENTRES: readonly (readonly [number, number])[] = [
  [150, 330],
  [430, 200],
  [690, 440],
  [950, 250],
  [1150, 480],
]

export interface ConnectorEndpoints {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * The four connectors, generated from consecutive radar-centre pairs
 * (`data-model.md` § 2.2) — never four independent shapes. Connector *i* is
 * the straight line from centre *i* to centre *i + 1*.
 */
export function connectorEndpoints(
  centres: readonly (readonly [number, number])[]
): ConnectorEndpoints[] {
  const endpoints: ConnectorEndpoints[] = []

  for (let i = 0; i < centres.length - 1; i += 1) {
    const start = centres[i]
    const end = centres[i + 1]
    if (!start || !end) continue

    const [x1, y1] = start
    const [x2, y2] = end
    endpoints.push({ x1, y1, x2, y2 })
  }

  return endpoints
}
