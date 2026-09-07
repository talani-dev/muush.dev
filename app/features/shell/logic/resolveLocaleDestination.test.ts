import { describe, expect, it } from 'vitest'
import { resolveLocaleDestination } from './resolveLocaleDestination'

/**
 * These cases exercise repository logic, not `@nuxtjs/i18n`. The empty-string
 * input is the one the library really produces when a route has no
 * counterpart (`docs/business/rules.md` § R22), and it is the case that makes
 * the toggle silently do nothing if it is not guarded.
 */
describe('resolveLocaleDestination', () => {
  const SPANISH_HOME = '/es'
  const ENGLISH_HOME = '/en'

  it('should use the switched path when the route has a counterpart', () => {
    expect(resolveLocaleDestination('/en/about', ENGLISH_HOME)).toBe(
      '/en/about'
    )
  })

  it('should translate the segment back when switching to Spanish', () => {
    expect(resolveLocaleDestination('/es/nosotros', SPANISH_HOME)).toBe(
      '/es/nosotros'
    )
  })

  it('should round trip when the destination is switched twice', () => {
    const toEnglish = resolveLocaleDestination('/en/about', ENGLISH_HOME)
    const backToSpanish = resolveLocaleDestination('/es/nosotros', SPANISH_HOME)

    expect(toEnglish).toBe('/en/about')
    expect(backToSpanish).toBe('/es/nosotros')
  })

  it('should reach the other home when switching from home to home', () => {
    expect(resolveLocaleDestination('/en', ENGLISH_HOME)).toBe('/en')
  })

  it('should fall back to the home when the switched path is empty', () => {
    expect(resolveLocaleDestination('', ENGLISH_HOME)).toBe('/en')
  })

  it('should never return an empty destination when nothing resolves', () => {
    expect(resolveLocaleDestination('', SPANISH_HOME, '')).not.toBe('')
  })

  it('should append the fragment when one is present', () => {
    expect(resolveLocaleDestination('/en/about', ENGLISH_HOME, '#work')).toBe(
      '/en/about#work'
    )
  })

  it('should append the fragment when it arrives without its hash', () => {
    expect(resolveLocaleDestination('/en/about', ENGLISH_HOME, 'work')).toBe(
      '/en/about#work'
    )
  })

  it('should omit the fragment when none is given', () => {
    expect(resolveLocaleDestination('/en/about', ENGLISH_HOME)).toBe(
      '/en/about'
    )
  })

  it('should omit the fragment when it is the empty string', () => {
    expect(resolveLocaleDestination('/en/about', ENGLISH_HOME, '')).toBe(
      '/en/about'
    )
  })

  it('should omit the fragment when it is a bare hash', () => {
    expect(resolveLocaleDestination('/en/about', ENGLISH_HOME, '#')).toBe(
      '/en/about'
    )
  })

  it('should not double the hash when the fragment already carries one', () => {
    const destination = resolveLocaleDestination(
      '/en/about',
      ENGLISH_HOME,
      '#work'
    )

    expect(destination.match(/#/g)).toHaveLength(1)
  })

  it('should carry the fragment onto the fallback when nothing resolves', () => {
    expect(resolveLocaleDestination('', ENGLISH_HOME, '#proyectos')).toBe(
      '/en#proyectos'
    )
  })
})
