/**
 * The v1 Servicios' node type and geometry (quarantined in feature 44 until
 * feature 47 deletes it). Its keys, key lists and content type left with
 * the v1 copy: the v2 home has its own `data/servicesContent.ts`. What
 * remains is what the quarantined components and their stories still read.
 *
 * This file imports **nothing** (Article II).
 */

export type ServiceNodeId =
  | 'consulting'
  | 'software'
  | 'cloud'
  | 'automation'
  | 'product'

/** One node, already translated. */
export interface ServiceNodeContent {
  id: ServiceNodeId
  index: 0 | 1 | 2 | 3 | 4
  name: string
  brief: string
}

/**
 * The five confirmed radar centres (`data-model.md` § 2.1), in
 * the v1 node order (consulting, software, cloud, automation, product). The single source of truth `connectorEndpoints`
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

/** The inline custom properties one floating connector line reads. */
export type ConnectorFloatVars = Record<
  '--x1' | '--x2' | '--i-a' | '--i-b',
  string
>

/**
 * Feature 34 · the inputs connector `index` needs to follow the float of the
 * two radars it joins (spec FR-008): its resting x ends and the indices of
 * node `index` and node `index + 1`. The CSS in `ServicesConnectors.vue` turns
 * them into the exact vertical shear of the line, from the same clock the
 * nodes read. Built only from `connectorEndpoints` output, never from
 * literals.
 */
export function connectorFloatVars(
  connector: ConnectorEndpoints,
  index: number
): ConnectorFloatVars {
  return {
    '--x1': String(connector.x1),
    '--x2': String(connector.x2),
    '--i-a': String(index),
    '--i-b': String(index + 1),
  }
}
