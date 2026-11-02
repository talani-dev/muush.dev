import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isCurrentPageWithoutHash,
  scrollToTopIfCurrent,
} from './scrollToTopIfCurrent'

/** Home link added by Roberto 2026-11-01: "Inicio" on the home page. */
function at(url: string) {
  const { href, pathname, hash } = new URL(url)
  return { href, pathname, hash }
}

describe('isCurrentPageWithoutHash', () => {
  it('should match the page shown when neither side has a hash', () => {
    expect(isCurrentPageWithoutHash('/es', at('https://muush.dev/es'))).toBe(
      true
    )
  })

  it('should ignore a trailing slash on either side', () => {
    expect(isCurrentPageWithoutHash('/es', at('https://muush.dev/es/'))).toBe(
      true
    )
  })

  it('should not match another page', () => {
    expect(
      isCurrentPageWithoutHash('/es', at('https://muush.dev/es/nosotros'))
    ).toBe(false)
  })

  it('should leave a URL with a hash to the router', () => {
    expect(
      isCurrentPageWithoutHash('/es', at('https://muush.dev/es#servicios'))
    ).toBe(false)
    expect(
      isCurrentPageWithoutHash('/es#servicios', at('https://muush.dev/es'))
    ).toBe(false)
  })
})

describe('scrollToTopIfCurrent', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.history.replaceState(null, '', '/')
  })

  it('should scroll to the top when the link is the page shown', () => {
    window.history.replaceState(null, '', '/es')
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    scrollToTopIfCurrent('/es')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 })
  })

  it('should do nothing when the link is another page or missing', () => {
    window.history.replaceState(null, '', '/es/nosotros')
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    scrollToTopIfCurrent('/es')
    scrollToTopIfCurrent(undefined)

    expect(scrollTo).not.toHaveBeenCalled()
  })
})
