import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, shallowRef } from 'vue'
import { START_LOCATION } from 'vue-router'
import type { ConsentRecord } from '@/features/legal'
import type { TrackingTool } from '@/features/tracking/data/vendorTypes'
import { emitTrackingEvent, resetTrackingBus } from '@/shared/logic/trackingBus'
import {
  resetTrackingStart,
  type StartTrackingOptions,
  startTracking,
  type TrackingDeps,
} from './startTracking'

type AfterEach = (to: { path: string }, from: unknown) => void

/*
 * The consent seam, through the `legal` barrel, replaced by a plain ref: this
 * file tests how tracking follows a choice, not how a choice is stored or
 * expires (that is `legal`'s, and `tests/tracking-consent.test.ts` runs the
 * two together).
 */
const consent = vi.hoisted(() => ({ record: undefined as unknown }))
vi.mock('@/features/legal', () => ({
  useCookieConsent: () => ({ consent: consent.record }),
}))

function choose(analytics: boolean, advertising: boolean) {
  ;(consent.record as { value: ConsentRecord | null }).value = {
    version: 1,
    decidedAt: new Date().toISOString(),
    categories: { analytics, advertising },
  }
}

function fakeTool() {
  return {
    grant: vi.fn(),
    revoke: vi.fn(),
    sendPageView: vi.fn(),
    sink: vi.fn(),
  } satisfies TrackingTool
}

function setup() {
  const hooks: AfterEach[] = []
  const router = {
    afterEach: (hook: AfterEach) => {
      hooks.push(hook)
      return () => undefined
    },
    isReady: () => Promise.resolve(),
    currentRoute: ref({ name: 'index___es', path: '/es' }),
  } as unknown as StartTrackingOptions['router']
  const ga = fakeTool()
  const meta = fakeTool()
  const timing = { start: vi.fn(), stop: vi.fn(), pageChanged: vi.fn() }
  const deps: TrackingDeps = {
    loadAnalytics: vi.fn(async () => ga),
    loadAdvertising: vi.fn(async () => meta),
    sectionTiming: () => timing,
    clickRoot: document,
    defer: task => task(),
  }
  const start = () =>
    startTracking({ gaMeasurementId: 'ga', metaPixelId: 'px', router }, deps)
  const navigate = (to: string, from: string) =>
    hooks.forEach(hook => {
      hook({ path: to }, { path: from })
    })
  return { start, deps, ga, meta, timing, navigate, hooks }
}

/* Lets the lazy vendor imports resolve. */
const settle = () => new Promise(resolve => setTimeout(resolve, 0))

describe('startTracking', () => {
  beforeEach(() => {
    consent.record = shallowRef<ConsentRecord | null>(null)
    resetTrackingBus()
    resetTrackingStart()
  })

  afterEach(() => {
    resetTrackingBus()
  })

  it('should load nothing when there is no choice', async () => {
    const { start, deps, timing } = setup()

    start()
    await settle()

    expect(deps.loadAnalytics).not.toHaveBeenCalled()
    expect(deps.loadAdvertising).not.toHaveBeenCalled()
    expect(timing.start).not.toHaveBeenCalled()
  })

  it('should load only Google Analytics when only analytics is saved', async () => {
    const { start, deps, ga, timing } = setup()
    start()

    choose(true, false)
    await settle()

    expect(deps.loadAnalytics).toHaveBeenCalledWith('ga')
    expect(ga.grant).toHaveBeenCalledOnce()
    expect(timing.start).toHaveBeenCalled()
    expect(deps.loadAdvertising).not.toHaveBeenCalled()
  })

  it('should load only the Meta Pixel when only advertising is saved', async () => {
    const { start, deps, meta } = setup()
    start()

    choose(false, true)
    await settle()

    expect(deps.loadAdvertising).toHaveBeenCalledWith('px')
    expect(meta.grant).toHaveBeenCalledOnce()
    expect(deps.loadAnalytics).not.toHaveBeenCalled()
  })

  it('should load both when every category is accepted', async () => {
    const { start, ga, meta } = setup()
    start()

    choose(true, true)
    await settle()

    expect(ga.grant).toHaveBeenCalledOnce()
    expect(meta.grant).toHaveBeenCalledOnce()
  })

  it('should load neither when every category is declined', async () => {
    const { start, deps } = setup()
    start()

    choose(false, false)
    await settle()

    expect(deps.loadAnalytics).not.toHaveBeenCalled()
    expect(deps.loadAdvertising).not.toHaveBeenCalled()
  })

  it('should load the granted tools at start when a returning visitor chose before', async () => {
    choose(true, false)
    const { start, ga, deps } = setup()

    start()
    await settle()

    expect(ga.grant).toHaveBeenCalledOnce()
    expect(deps.loadAdvertising).not.toHaveBeenCalled()
  })

  it('should start only once when called twice', () => {
    const { start, hooks } = setup()

    start()
    start()

    expect(hooks).toHaveLength(1)
  })

  it('should deliver an event emitted while the tool loads after its page view', async () => {
    const { start, ga } = setup()
    start()

    choose(true, false)
    emitTrackingEvent({
      name: 'cookie_preferences',
      params: { analytics: true, ads: false },
    })
    await settle()

    expect(ga.grant.mock.invocationCallOrder[0]).toBeLessThan(
      ga.sink.mock.invocationCallOrder[0] ?? 0
    )
    expect(ga.sink).toHaveBeenCalledWith({
      name: 'cookie_preferences',
      params: { analytics: true, ads: false },
    })
  })

  it('should send one page view per path change to every granted tool', async () => {
    choose(true, true)
    const { start, ga, meta, navigate, timing } = setup()
    start()
    await settle()

    navigate('/es/nosotros', '/es')
    navigate('/es/nosotros', '/es/nosotros')

    expect(ga.sendPageView).toHaveBeenCalledOnce()
    expect(meta.sendPageView).toHaveBeenCalledOnce()
    expect(timing.pageChanged).toHaveBeenCalledOnce()
  })

  it('should send no page view for the first navigation of the document', async () => {
    choose(true, true)
    const { start, ga, hooks } = setup()
    start()
    await settle()

    hooks[0]?.({ path: '/es' }, START_LOCATION)

    expect(ga.sendPageView).not.toHaveBeenCalled()
  })

  it('should emit a language change when the locale switches', async () => {
    choose(true, false)
    const { start, ga, navigate } = setup()
    start()
    await settle()

    navigate('/en/about', '/es/nosotros')

    expect(ga.sink).toHaveBeenCalledWith({
      name: 'language_change',
      params: { from_locale: 'es', to_locale: 'en' },
    })
  })

  it('should stop sending and revoke when a granted category is turned off', async () => {
    choose(true, true)
    const { start, ga, meta, navigate, timing } = setup()
    start()
    await settle()

    choose(false, false)
    emitTrackingEvent({ name: 'form_start', params: { form: 'assessment' } })
    navigate('/es/nosotros', '/es')

    expect(ga.revoke).toHaveBeenCalledOnce()
    expect(meta.revoke).toHaveBeenCalledOnce()
    expect(timing.stop).toHaveBeenCalled()
    expect(ga.sink).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'form_start' })
    )
    expect(ga.sendPageView).not.toHaveBeenCalled()
    expect(meta.sendPageView).not.toHaveBeenCalled()
  })

  it('should resume with a page view and no second load when re-granted in the same visit', async () => {
    choose(true, false)
    const { start, ga, deps } = setup()
    start()
    await settle()

    choose(false, false)
    choose(true, false)
    await settle()

    expect(deps.loadAnalytics).toHaveBeenCalledOnce()
    expect(ga.grant).toHaveBeenCalledTimes(2)
  })
})
