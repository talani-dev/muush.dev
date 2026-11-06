import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONSENT_STORAGE_KEY } from '@/features/legal/data/cookieCategories'
import { resetCookieConsentState, useCookieConsent } from './useCookieConsent'

const STORED = JSON.stringify({
  version: 1,
  decidedAt: '2026-11-05T12:00:00.000Z',
  categories: { advertising: true },
})

describe('useCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCookieConsentState()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have no choice and grant nothing when storage is empty', () => {
    const consent = useCookieConsent()

    expect(consent.hasDecided.value).toBe(false)
    expect(consent.consent.value).toBeNull()
    expect(consent.isGranted('advertising')).toBe(false)
  })

  it('should read a stored choice when first used', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, STORED)
    const consent = useCookieConsent()

    expect(consent.hasDecided.value).toBe(true)
    expect(consent.isGranted('advertising')).toBe(true)
  })

  it('should store every category granted when accepting all', () => {
    const consent = useCookieConsent()

    consent.acceptAll()

    expect(consent.isGranted('advertising')).toBe(true)
    const stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? '')
    expect(stored.categories).toEqual({ advertising: true })
    expect(stored.version).toBe(1)
  })

  it('should store every category refused when rejecting all', () => {
    const consent = useCookieConsent()

    consent.rejectAll()

    expect(consent.hasDecided.value).toBe(true)
    expect(consent.isGranted('advertising')).toBe(false)
  })

  it('should share one state between callers', () => {
    useCookieConsent().acceptAll()

    expect(useCookieConsent().isGranted('advertising')).toBe(true)
  })

  it('should close the preferences when a choice is saved', () => {
    const consent = useCookieConsent()
    consent.openPreferences()

    consent.saveChoice({ advertising: false })

    expect(consent.preferencesOpen.value).toBe(false)
  })

  it('should leave no choice when the preferences are dismissed', () => {
    const consent = useCookieConsent()
    consent.openPreferences()

    consent.closePreferences()

    expect(consent.preferencesOpen.value).toBe(false)
    expect(consent.hasDecided.value).toBe(false)
  })

  it('should return focus to the trigger when the preferences close', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    const consent = useCookieConsent()

    consent.openPreferences(trigger)
    consent.closePreferences()
    await Promise.resolve()

    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })

  it('should keep the choice for the visit when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    const consent = useCookieConsent()

    consent.acceptAll()

    expect(consent.isGranted('advertising')).toBe(true)
  })
})
