import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { CONSENT_STORAGE_KEY } from '@/features/legal/data/cookieCategories'
import {
  resetCookieConsentState,
  useCookieConsent,
} from '@/features/legal/logic/useCookieConsent'
import type { TrackingTool } from '@/features/tracking/data/vendorTypes'
import {
  resetTrackingStart,
  type StartTrackingOptions,
  startTracking,
} from '@/features/tracking/logic/startTracking'
import { resetTrackingBus } from '@/shared/logic/trackingBus'

/**
 * Feature 49 · the real consent store (`legal`) driving the real tracking
 * start-up, with the two vendors replaced by recorders. What only the two
 * features together can show: a stored choice that expired or predates the
 * Analytics category loads nothing (FR-001, FR-002), and the
 * `cookie_preferences` of the save that grants Analytics reaches Google
 * Analytics after its first page view (FR-024).
 */
function recorder(): TrackingTool & {
  grant: ReturnType<typeof vi.fn>
  sink: ReturnType<typeof vi.fn>
  revoke: ReturnType<typeof vi.fn>
} {
  return {
    grant: vi.fn(),
    revoke: vi.fn(),
    sendPageView: vi.fn(),
    sink: vi.fn(),
  }
}

function start() {
  const ga = recorder()
  const meta = recorder()
  const loadAnalytics = vi.fn(async () => ga)
  const loadAdvertising = vi.fn(async () => meta)
  const router = {
    afterEach: () => () => undefined,
    isReady: () => Promise.resolve(),
    currentRoute: ref({ name: 'index___es', path: '/es' }),
  } as unknown as StartTrackingOptions['router']
  startTracking(
    { gaMeasurementId: 'ga', metaPixelId: 'px', router },
    {
      loadAnalytics,
      loadAdvertising,
      sectionTiming: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        pageChanged: vi.fn(),
      }),
      clickRoot: new EventTarget() as unknown as Document,
      defer: task => task(),
    }
  )
  return { ga, meta, loadAnalytics, loadAdvertising }
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0))

function store(decidedAt: Date, categories: Record<string, boolean>) {
  localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      decidedAt: decidedAt.toISOString(),
      categories,
    })
  )
}

describe('tracking follows the stored consent (feature 49)', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCookieConsentState()
    resetTrackingBus()
    resetTrackingStart()
  })

  it('should load nothing when the stored choice is 12 months old', async () => {
    const decided = new Date()
    decided.setUTCFullYear(decided.getUTCFullYear() - 1)
    store(decided, { analytics: true, advertising: true })

    const { loadAnalytics, loadAdvertising } = start()
    await settle()

    expect(loadAnalytics).not.toHaveBeenCalled()
    expect(loadAdvertising).not.toHaveBeenCalled()
  })

  it('should load nothing when the stored choice predates the Analytics category', async () => {
    store(new Date(), { advertising: true })

    const { loadAdvertising } = start()
    await settle()

    expect(loadAdvertising).not.toHaveBeenCalled()
  })

  it('should load the granted tool for a returning visitor', async () => {
    store(new Date(), { analytics: false, advertising: true })

    const { meta, loadAnalytics } = start()
    await settle()

    expect(meta.grant).toHaveBeenCalledOnce()
    expect(loadAnalytics).not.toHaveBeenCalled()
  })

  it('should deliver the saved choice to Google Analytics after the page view of its grant', async () => {
    const { ga } = start()

    useCookieConsent().saveChoice({ analytics: true, advertising: false })
    await settle()

    expect(ga.sink).toHaveBeenCalledWith({
      name: 'cookie_preferences',
      params: { analytics: true, ads: false },
    })
    expect(ga.grant.mock.invocationCallOrder[0]).toBeLessThan(
      ga.sink.mock.invocationCallOrder[0] ?? 0
    )
  })

  it('should revoke a tool when the privacy page turns its category off', async () => {
    store(new Date(), { analytics: true, advertising: true })
    const { ga, meta } = start()
    await settle()

    useCookieConsent().saveChoice({ analytics: false, advertising: false })

    expect(ga.revoke).toHaveBeenCalledOnce()
    expect(meta.revoke).toHaveBeenCalledOnce()
  })
})
