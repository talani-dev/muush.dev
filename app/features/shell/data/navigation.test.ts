import { describe, expect, it } from 'vitest'
import { MENU_ITEMS, NAV_CTA, NAV_HOME, NAV_ITEMS } from './navigation'

/** Feature 43 · data-model § 3, spec FR-003, FR-004, FR-024. */
describe('navigation', () => {
  it('should list Inicio, Servicios then Nosotros in the link bar when read', () => {
    expect(NAV_ITEMS).toEqual([
      {
        labelKey: 'shell.nav.homeLink',
        destination: { kind: 'top', name: 'index' },
      },
      {
        labelKey: 'shell.nav.services',
        destination: { kind: 'anchor', name: 'index', anchor: 'servicios' },
      },
      {
        labelKey: 'shell.nav.about',
        destination: { kind: 'route', name: 'about' },
      },
    ])
  })

  it('should carry no Preguntas item when the link bar or the menu is read', () => {
    /* Permanent (Roberto, feature 43; feature 46 gate 2026-11-02): Preguntas
       is linked from the footers only. */
    const keys = [...NAV_ITEMS, ...MENU_ITEMS].map(item => item.labelKey)

    expect(keys.some(key => key.includes('faq'))).toBe(false)
  })

  it('should point the CTA at the home diagnostic section when read', () => {
    expect(NAV_CTA).toEqual({
      labelKey: 'shell.nav.cta',
      destination: { kind: 'anchor', name: 'index', anchor: 'diagnostico' },
      track: { name: 'assessment_cta_click', params: { cta_location: 'nav' } },
    })
  })

  it('should list the same items in the menu as in the link bar when read', () => {
    expect(MENU_ITEMS).toEqual(NAV_ITEMS)
  })

  /* Supersedes "no Home item" (pen extract-43 § 9 Q1): Home link added by
     Roberto 2026-11-01, first in the bar and the menu; the logo stays. */
  it('should open the link bar and the menu with the one Home item when read', () => {
    const toHome = NAV_ITEMS.filter(
      item =>
        (item.destination.kind === 'top' ||
          item.destination.kind === 'route') &&
        item.destination.name === 'index'
    )

    expect(toHome).toEqual([NAV_HOME])
    expect(NAV_ITEMS[0]).toBe(NAV_HOME)
    expect(MENU_ITEMS[0]).toBe(NAV_HOME)
  })
})
