import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONSENT_STORAGE_KEY } from '@/features/legal/data/cookieCategories'
import { onTrackingEvent, resetTrackingBus } from '@/shared/logic/trackingBus'
import { resetCookieConsentState, useCookieConsent } from './useCookieConsent'

/* Decided "now", so the record is never expired whenever the suite runs. */
function storedRecord(
  categories: Record<string, boolean>,
  decidedAt = new Date().toISOString()
) {
  return JSON.stringify({ version: 1, decidedAt, categories })
}

const STORED = storedRecord({ analytics: false, advertising: true })

describe('useCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCookieConsentState()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetTrackingBus()
  })

  it('should report the saved choice when analytics stays on after the save', () => {
    const sink = vi.fn()
    onTrackingEvent(sink)

    useCookieConsent().saveChoice({ analytics: true, advertising: false })

    expect(sink).toHaveBeenCalledWith({
      name: 'cookie_preferences',
      params: { analytics: true, ads: false },
    })
  })

  it('should report nothing when the saved choice leaves analytics off', () => {
    const sink = vi.fn()
    onTrackingEvent(sink)

    useCookieConsent().saveChoice({ analytics: false, advertising: true })
    useCookieConsent().rejectAll()

    expect(sink).not.toHaveBeenCalled()
  })

  it('should have no choice and grant nothing when storage is empty', () => {
    const consent = useCookieConsent()

    expect(consent.hasDecided.value).toBe(false)
    expect(consent.consent.value).toBeNull()
    expect(consent.isGranted('analytics')).toBe(false)
    expect(consent.isGranted('advertising')).toBe(false)
  })

  it('should read a stored choice when first used', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, STORED)
    const consent = useCookieConsent()

    expect(consent.hasDecided.value).toBe(true)
    expect(consent.isGranted('analytics')).toBe(false)
    expect(consent.isGranted('advertising')).toBe(true)
  })

  it('should have no choice when the stored one is 12 months old or more', () => {
    const decided = new Date()
    decided.setUTCFullYear(decided.getUTCFullYear() - 1)
    decided.setUTCDate(decided.getUTCDate() - 1)
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      storedRecord(
        { analytics: true, advertising: true },
        decided.toISOString()
      )
    )
    const consent = useCookieConsent()

    expect(consent.hasDecided.value).toBe(false)
    expect(consent.isGranted('analytics')).toBe(false)
  })

  it('should ask again when the stored choice predates the analytics category', () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      storedRecord({ advertising: true })
    )
    const consent = useCookieConsent()

    expect(consent.hasDecided.value).toBe(false)
    expect(consent.isGranted('advertising')).toBe(false)
  })

  it('should store every category granted when accepting all', () => {
    const consent = useCookieConsent()

    consent.acceptAll()

    expect(consent.isGranted('advertising')).toBe(true)
    const stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? '')
    expect(stored.categories).toEqual({ analytics: true, advertising: true })
    expect(stored.version).toBe(1)
  })

  it('should store every category refused when rejecting all', () => {
    const consent = useCookieConsent()

    consent.rejectAll()

    expect(consent.hasDecided.value).toBe(true)
    expect(consent.isGranted('analytics')).toBe(false)
    expect(consent.isGranted('advertising')).toBe(false)
  })

  it('should share one state between callers', () => {
    useCookieConsent().acceptAll()

    expect(useCookieConsent().isGranted('advertising')).toBe(true)
  })

  it('should close the preferences when a choice is saved', () => {
    const consent = useCookieConsent()
    consent.openPreferences()

    consent.saveChoice({ analytics: false, advertising: false })

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
