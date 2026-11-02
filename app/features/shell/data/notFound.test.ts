import { describe, expect, it } from 'vitest'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import {
  NOT_FOUND_HOME,
  NOT_FOUND_ROBOTS,
  NOT_FOUND_SHORTCUTS,
} from './notFound'

describe('not-found content model', () => {
  it('should list exactly two shortcuts in the order services, about when read', () => {
    /* Feature 44: the Propósito shortcut left with its section (FR-026). */
    expect(NOT_FOUND_SHORTCUTS.map(item => item.labelKey)).toEqual([
      'shell.notFound.shortcuts.services',
      'shell.notFound.shortcuts.about',
    ])
  })

  it('should use only route or anchor destinations when read', () => {
    const kinds = [NOT_FOUND_HOME, ...NOT_FOUND_SHORTCUTS].map(
      item => item.destination.kind
    )

    for (const kind of kinds) {
      expect(['route', 'anchor']).toContain(kind)
    }
  })

  it('should point the home at route index when read', () => {
    expect(NOT_FOUND_HOME.destination).toEqual({ kind: 'route', name: 'index' })
  })

  it('should point services at the declared anchor and about at its route when read', () => {
    const [services, about] = NOT_FOUND_SHORTCUTS

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
