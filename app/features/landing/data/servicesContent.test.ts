import { describe, expect, it } from 'vitest'
import {
  connectorEndpoints,
  SERVICE_NODE_CENTRES,
  SERVICE_NODES,
} from './servicesContent'

/**
 * Seen red on purpose first (`findings.md` § R39): the file below started as
 * `expect(true).toBe(false)`.
 */
describe('connectorEndpoints · the four connectors are generated, never literal', () => {
  it('should join every consecutive pair of centres when given five points', () => {
    const centres: [number, number][] = [
      [0, 0],
      [10, 20],
      [30, 40],
      [50, 10],
      [70, 90],
    ]

    expect(connectorEndpoints(centres)).toEqual([
      { x1: 0, y1: 0, x2: 10, y2: 20 },
      { x1: 10, y1: 20, x2: 30, y2: 40 },
      { x1: 30, y1: 40, x2: 50, y2: 10 },
      { x1: 50, y1: 10, x2: 70, y2: 90 },
    ])
  })

  it('should return one fewer connector than the number of centres given', () => {
    expect(connectorEndpoints([[0, 0]])).toEqual([])
    expect(connectorEndpoints([])).toEqual([])
    expect(
      connectorEndpoints([
        [0, 0],
        [1, 1],
      ])
    ).toHaveLength(1)
  })

  it('should generate the four confirmed connectors from the five real radar centres', () => {
    /* `data-model.md` § 2.2: every rectangle the frame draws is the bounding
       box of two consecutive radar centres, to within 1px of rounding — this
       is the generative relation the desktop composition consumes. */
    expect(connectorEndpoints(SERVICE_NODE_CENTRES)).toEqual([
      { x1: 150, y1: 330, x2: 430, y2: 200 },
      { x1: 430, y1: 200, x2: 690, y2: 440 },
      { x1: 690, y1: 440, x2: 950, y2: 250 },
      { x1: 950, y1: 250, x2: 1150, y2: 480 },
    ])
  })
})

describe('SERVICE_NODES · services.md order', () => {
  it('should hold five nodes with a contiguous zero-based index', () => {
    expect(SERVICE_NODES).toHaveLength(5)
    expect(SERVICE_NODES.map(node => node.index)).toEqual([0, 1, 2, 3, 4])
  })

  it('should hold one radar centre per node, in the same order', () => {
    expect(SERVICE_NODE_CENTRES).toHaveLength(SERVICE_NODES.length)
  })
})
