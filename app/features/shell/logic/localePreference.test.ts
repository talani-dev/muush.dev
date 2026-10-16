import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  rememberLocalePreference,
  serializeLocalePreference,
} from './localePreference'
import { clearLocalePreferenceCookie } from './localePreference.testing'

/**
 * A stand-in for `document` that records every assignment to `cookie`, so a
 * test can count writes — a real `document.cookie` reads back name=value
 * only and cannot tell one write from two.
 */
function cookieTarget() {
  const writes: string[] = []
  const target = {
    get cookie() {
      return writes.at(-1) ?? ''
    },
    set cookie(value: string) {
      writes.push(value)
    },
  }
  return { target, writes }
}

describe('serializeLocalePreference', () => {
  it('should produce the exact contracted string when the locale is en', () => {
    expect(serializeLocalePreference('en')).toBe(
      'muush_locale=en; Path=/; Max-Age=31536000; SameSite=Lax; Secure'
    )
  })

  it('should produce the exact contracted string when the locale is es', () => {
    expect(serializeLocalePreference('es')).toBe(
      'muush_locale=es; Path=/; Max-Age=31536000; SameSite=Lax; Secure'
    )
  })

  it('should accept only the two locale codes when typed', () => {
    /* Enforced by `pnpm typecheck`: widening the parameter to `string` (and
       so letting anything but `es`/`en` reach the cookie) fails the build. */
    expectTypeOf(serializeLocalePreference)
      .parameter(0)
      .toEqualTypeOf<'es' | 'en'>()
    expectTypeOf(rememberLocalePreference)
      .parameter(0)
      .toEqualTypeOf<'es' | 'en'>()
  })

  it('should stay host-only and script-writable when serialised', () => {
    /* contract § 1: no `Domain` (never sent to subdomains), no `HttpOnly`
       (impossible from script), no `Expires` (Max-Age wins). */
    const serialised = serializeLocalePreference('en').toLowerCase()

    expect(serialised).not.toContain('domain')
    expect(serialised).not.toContain('httponly')
    expect(serialised).not.toContain('expires')
  })
})

describe('rememberLocalePreference', () => {
  afterEach(() => {
    clearLocalePreferenceCookie()
  })

  it('should assign the serialised preference exactly once when called', () => {
    const { target, writes } = cookieTarget()

    rememberLocalePreference('es', target)

    expect(writes).toEqual([serializeLocalePreference('es')])
  })

  it('should overwrite with the new locale when called again', () => {
    const { target, writes } = cookieTarget()

    rememberLocalePreference('es', target)
    rememberLocalePreference('en', target)

    expect(writes).toEqual([
      serializeLocalePreference('es'),
      serializeLocalePreference('en'),
    ])
  })

  it('should write to the real document when no target is given', () => {
    /* happy-dom reads back name=value only; the attributes are covered by
       the serialiser tests above. */
    rememberLocalePreference('en')

    expect(document.cookie).toContain('muush_locale=en')
  })
})

describe('clearLocalePreferenceCookie (test helper)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should leave no preference cookie when cleared within the same millisecond', () => {
    /* Regression for the feature 33 review, finding 1: with `Max-Age=0`
       happy-dom kept `muush_locale=` whenever write, clear and read shared a
       millisecond. Freezing the clock makes that case deterministic. */
    vi.useFakeTimers({ now: new Date('2026-10-15T12:00:00Z') })

    rememberLocalePreference('en')
    clearLocalePreferenceCookie()

    expect(document.cookie).not.toContain('muush_locale')
  })
})
