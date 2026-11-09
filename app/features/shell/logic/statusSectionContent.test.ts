import { describe, expect, it } from 'vitest'
import type { ShellRouteName } from '@/features/shell/data/types'
import { notFoundSectionProps } from './useNotFoundContent'
import { createShellItemResolver } from './useShellItemResolver'

/**
 * Feature 46 · FR-035, FR-039, FR-043; data-model § 3. The 404 seam's
 * pure half (Preguntas left the status block in feature 51), fed the real resolver with a stub route map and copy that
 * follow an `active` locale, which is what the feature 39 in-place switch
 * changes on the 404 without navigating.
 */
const PATHS: Record<'es' | 'en', Record<ShellRouteName, string>> = {
  es: {
    index: '/es',
    about: '/es/nosotros',
    faq: '/es/preguntas',
    privacy: '/es/privacidad',
    terms: '/es/terminos',
  },
  en: {
    index: '/en',
    about: '/en/about',
    faq: '/en/faq',
    privacy: '/en/privacy',
    terms: '/en/terms',
  },
}

const COPY: Record<'es' | 'en', Record<string, string>> = {
  es: {
    'shell.notFound.heading.first': 'Volvamos a un',
    'shell.notFound.heading.second': 'lugar conocido.',
    'shell.notFound.cta': 'Volver al inicio',
    'shell.notFound.assessment': 'Diagnóstico gratis',
  },
  en: {
    'shell.notFound.heading.first': "Let's get you back",
    'shell.notFound.heading.second': 'somewhere familiar.',
    'shell.notFound.cta': 'Back to home',
    'shell.notFound.assessment': 'Free assessment',
  },
}

function harness(initial: 'es' | 'en' = 'es') {
  let active = initial
  const t = (key: string) => COPY[active][key] ?? key
  const { resolveItem } = createShellItemResolver({
    t,
    localePath: ({ name }) => PATHS[active][name],
    /* The 404 has no route name (feature 36). */
    currentRouteName: () => undefined,
  })
  return {
    t,
    resolveItem,
    switchTo: (locale: 'es' | 'en') => {
      active = locale
    },
  }
}

describe('notFoundSectionProps', () => {
  it('should resolve the two-tone heading and both buttons when read', () => {
    const { t, resolveItem } = harness()

    expect(notFoundSectionProps(t, resolveItem)).toEqual({
      preset: 'notFound',
      headingFirst: 'Volvamos a un',
      headingSecond: 'lugar conocido.',
      primary: { label: 'Volver al inicio', href: '/es', external: false },
      secondary: {
        label: 'Diagnóstico gratis',
        href: '/es#diagnostico',
        external: false,
        trackAttrs: {
          'data-track': 'assessment_cta_click',
          'data-track-location': 'not_found',
        },
      },
    })
  })

  it('should point both buttons at the switched locale after an in-place switch', () => {
    const { t, resolveItem, switchTo } = harness('es')

    switchTo('en')
    const props = notFoundSectionProps(t, resolveItem)

    expect(props.headingFirst).toBe("Let's get you back")
    expect(props.primary).toEqual({
      label: 'Back to home',
      href: '/en',
      external: false,
    })
    expect(props.secondary).toEqual({
      label: 'Free assessment',
      href: '/en#diagnostico',
      external: false,
      trackAttrs: {
        'data-track': 'assessment_cta_click',
        'data-track-location': 'not_found',
      },
    })
  })
})
