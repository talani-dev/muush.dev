import { describe, expect, it } from 'vitest'
import { SHELL_ANCHORS } from './navigation'
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

  it('should use only route or anchor destinations when read', () => {
    const kinds = [NOT_FOUND_HOME, ...NOT_FOUND_SHORTCUTS].map(
      item => item.destination.kind
    )

    for (const kind of kinds) expect(['route', 'anchor']).toContain(kind)
  })

  it('should point the home at route index when read', () => {
    expect(NOT_FOUND_HOME.destination).toEqual({ kind: 'route', name: 'index' })
  })

  it('should use the shell anchors for purpose and services when read', () => {
    const [purpose, services, about] = NOT_FOUND_SHORTCUTS

    expect(purpose?.destination).toEqual({
      kind: 'anchor',
      name: 'index',
      hash: SHELL_ANCHORS.purpose,
    })
    expect(services?.destination).toEqual({
      kind: 'anchor',
      name: 'index',
      hash: SHELL_ANCHORS.services,
    })
    expect(about?.destination).toEqual({ kind: 'route', name: 'about' })
  })

  it('should carry the reference robots value when read', () => {
    expect(NOT_FOUND_ROBOTS).toBe('noindex')
  })
})
