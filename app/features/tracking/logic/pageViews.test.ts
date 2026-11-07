import { describe, expect, it } from 'vitest'
import { isNewPage, localeChange, pageKeyOf } from './pageViews'

describe('isNewPage', () => {
  it('should count a change of path as a new page', () => {
    expect(isNewPage('/es', '/es/nosotros')).toBe(true)
  })

  it('should not count an in-page anchor jump when only the hash changes', () => {
    /* The hash is not part of `path`: `/es#diagnostico` arrives as `/es`. */
    expect(isNewPage('/es', '/es')).toBe(false)
  })

  it('should not count a query-only change when the path is the same', () => {
    expect(isNewPage('/en/about', '/en/about')).toBe(false)
  })

  it('should not count a trailing slash as a new page', () => {
    /* A static host serves `/es/`; the router then settles on `/es`, and a
       link to `/es#diagnostico` keeps `/es`. Neither is a new page. */
    expect(isNewPage('/es/', '/es')).toBe(false)
    expect(isNewPage('/es/nosotros/', '/es/nosotros')).toBe(false)
    expect(isNewPage('/', '/')).toBe(false)
  })

  it('should not count the first navigation when there is no previous page', () => {
    expect(isNewPage(undefined, '/es')).toBe(false)
  })
})

describe('localeChange', () => {
  it('should report both locales when the first segment switches language', () => {
    expect(localeChange('/es/nosotros', '/en/about')).toEqual({
      from_locale: 'es',
      to_locale: 'en',
    })
  })

  it('should report nothing when the language stays the same', () => {
    expect(localeChange('/en', '/en/faq')).toBeNull()
  })

  it('should report nothing when a path has no site locale', () => {
    expect(localeChange('/', '/es')).toBeNull()
    expect(localeChange(undefined, '/es')).toBeNull()
  })
})

describe('pageKeyOf', () => {
  it('should map the localized home and about routes to their page keys', () => {
    expect(pageKeyOf('index___es')).toBe('home')
    expect(pageKeyOf('about___en')).toBe('about')
  })

  it('should return undefined when the page has no timed sections', () => {
    expect(pageKeyOf('privacy___es')).toBeUndefined()
    expect(pageKeyOf(undefined)).toBeUndefined()
  })
})
