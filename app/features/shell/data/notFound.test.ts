import { describe, expect, it } from 'vitest'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import {
  NOT_FOUND_HOME,
  NOT_FOUND_ROBOTS,
  NOT_FOUND_SHORTCUTS,
} from './notFound'

describe('not-found content model', () => {
  it('should list exactly three shortcuts in the order purpose, services, about when read', () => {
    expect(NOT_FOUND_SHORTCUTS.map(item => item.labelKey)).toEqual([
      'shell.notFound.shortcuts.purpose',
      'shell.notFound.shortcuts.services',
      'shell.notFound.shortcuts.about',
    ])
  })

  it('should use only route, anchor or the transitional legacy hash when read', () => {
    const kinds = [NOT_FOUND_HOME, ...NOT_FOUND_SHORTCUTS].map(
      item => item.destination.kind
    )

    for (const kind of kinds) {
      expect(['route', 'anchor', 'legacyHash']).toContain(kind)
    }
  })

  it('should point the home at route index when read', () => {
    expect(NOT_FOUND_HOME.destination).toEqual({ kind: 'route', name: 'index' })
  })

  it('should keep the v1 purpose hash and the declared services anchor when read', () => {
    /* Feature 43: the v1 404 still links Propósito until feature 46. */
    const [purpose, services, about] = NOT_FOUND_SHORTCUTS

    expect(purpose?.destination).toEqual({
      kind: 'legacyHash',
      name: 'index',
      hash: '#proposito',
    })
    expect(services?.destination).toEqual({
      kind: 'anchor',
      name: 'index',
      anchor: SECTION_ANCHORS.services,
    })
    expect(about?.destination).toEqual({ kind: 'route', name: 'about' })
  })

  it('should carry the reference robots value when read', () => {
    expect(NOT_FOUND_ROBOTS).toBe('noindex')
  })
})
