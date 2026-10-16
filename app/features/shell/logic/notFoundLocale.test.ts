import { describe, expect, it } from 'vitest'
import { notFoundLocaleForPath, resolveNotFoundLocale } from './notFoundLocale'

describe('notFoundLocaleForPath', () => {
  it.each([
    ['/es/xyz', 'es'],
    ['/es', 'es'],
    ['/es/404', 'es'],
    ['/en/xyz', 'en'],
    ['/en/404', 'en'],
    ['/xyz', 'en'],
    ['/fr/es', 'en'],
    ['/fr/abc', 'en'],
    ['/espanol', 'en'],
  ])(
    'should resolve %s to %s when the path matches no route',
    (path, locale) => {
      expect(notFoundLocaleForPath(path)).toBe(locale)
    }
  )
})

describe('resolveNotFoundLocale', () => {
  const base = {
    requested: 'es' as const,
    rendered: undefined,
    hydrating: false,
    initialSetup: true,
    unmatchedPath: undefined,
  }

  it('should keep the rendered locale when a not-found document is hydrating', () => {
    expect(
      resolveNotFoundLocale({ ...base, rendered: 'en', hydrating: true })
    ).toBe('en')
  })

  it('should keep the rendered locale over the path rule when hydrating', () => {
    expect(
      resolveNotFoundLocale({
        ...base,
        rendered: 'es',
        hydrating: true,
        unmatchedPath: '/xyz',
      })
    ).toBe('es')
  })

  it('should default an unmatched unprefixed path to English when rendered at runtime', () => {
    expect(resolveNotFoundLocale({ ...base, unmatchedPath: '/fr/es' })).toBe(
      'en'
    )
  })

  it('should follow the es prefix of an unmatched path when rendered at runtime', () => {
    expect(
      resolveNotFoundLocale({
        ...base,
        requested: 'en',
        unmatchedPath: '/es/xyz',
      })
    ).toBe('es')
  })

  it('should honour the requested locale when the path matches a route', () => {
    expect(resolveNotFoundLocale({ ...base, unmatchedPath: undefined })).toBe(
      'es'
    )
  })

  it('should honour the requested locale when the switch is not the initial one', () => {
    expect(
      resolveNotFoundLocale({
        ...base,
        rendered: 'en',
        initialSetup: false,
        unmatchedPath: '/xyz',
      })
    ).toBe('es')
  })
})
