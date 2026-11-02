import { flushPromises, mount } from '@vue/test-utils'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { defineComponent, h, type Ref, ref } from 'vue'
import {
  BACKGROUND_PRESETS,
  SHADER_SOURCES,
} from '@/shared/data/backgroundPresets'
import { createShaderRenderer } from '@/shared/logic/shaderRenderer'
import { useShaderCanvas } from '@/shared/logic/useShaderCanvas'
import { STILL_TIME_SECONDS } from '@/shared/utils/shaderFrame'

/**
 * Feature 42 · FR-019…FR-024, research R7, R10, R11, data-model § 4.
 *
 * `happy-dom` has neither WebGL nor layout, so every browser piece the
 * composable leans on is replaced by a controllable stand-in: the context
 * (`getContext`), the renderer module (`vi.mock`), both observers, the frame
 * queue and the reduced-motion query. What this proves is gating and
 * clean-up: when frames are requested, drawn and stopped, and that every
 * resource is released. That the result looks right is a browser check
 * (quickstart § 8), never asserted here (rules.md § R27).
 */
vi.mock('@/shared/logic/shaderRenderer', () => ({
  createShaderRenderer: vi.fn(),
}))

type MediaListener = (event: MediaQueryListEvent) => void

class FakeMediaQuery {
  matches = false
  readonly listeners = new Set<MediaListener>()
  addEventListener(_type: 'change', listener: MediaListener) {
    this.listeners.add(listener)
  }
  removeEventListener(_type: 'change', listener: MediaListener) {
    this.listeners.delete(listener)
  }
  set(matches: boolean) {
    this.matches = matches
    for (const listener of [...this.listeners]) {
      listener({ matches } as MediaQueryListEvent)
    }
  }
}

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  readonly disconnect = vi.fn()
  readonly observe = vi.fn()
  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit
  ) {
    FakeIntersectionObserver.instances.push(this)
  }
  emit(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    )
  }
}

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = []
  readonly disconnect = vi.fn()
  readonly observe = vi.fn()
  constructor(readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this)
  }
  emit() {
    this.callback([], this as unknown as ResizeObserver)
  }
}

const renderer = { draw: vi.fn(), resize: vi.fn(), dispose: vi.fn() }
const loseContext = vi.fn()
const context = {
  getExtension: vi.fn(() => ({ loseContext })),
}

let media: FakeMediaQuery
let frames: Map<number, FrameRequestCallback>
let nextFrame: number
let hidden: boolean
const restore: (() => void)[] = []
/* Every host is unmounted after its case: a host left mounted keeps its
   `visibilitychange` listener on the shared document and would request
   frames into the next case's queue (findings.md § R43). */
const mounted: { unmount(): void }[] = []

/** Replaces a read-only browser property with a getter, undone after each case. */
function stubGetter(target: object, key: string, get: () => unknown) {
  const original = Object.getOwnPropertyDescriptor(target, key)
  Object.defineProperty(target, key, { configurable: true, get })
  restore.push(() => {
    if (original) Object.defineProperty(target, key, original)
    else delete (target as Record<string, unknown>)[key]
  })
}

function stubProperty(target: object, key: string, value: unknown) {
  stubGetter(target, key, () => value)
}

function flushFrame() {
  const pending = [...frames.values()]
  frames.clear()
  for (const frame of pending) frame(0)
}

function setHidden(value: boolean) {
  hidden = value
  document.dispatchEvent(new Event('visibilitychange'))
}

async function mountHost() {
  let state: ReturnType<typeof useShaderCanvas> | undefined
  let canvasRef: Ref<HTMLCanvasElement | null> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        canvasRef = ref<HTMLCanvasElement | null>(null)
        state = useShaderCanvas(canvasRef, BACKGROUND_PRESETS.homeHero)
        return () => h('canvas', { ref: canvasRef })
      },
    }),
    { attachTo: document.body }
  )
  mounted.push(wrapper)
  if (!state || !canvasRef?.value) throw new Error('host did not mount')
  /* Settled = the renderer was asked for, or the canvas already fell back. */
  const settled = state
  await vi.waitFor(() => {
    const asked = vi.mocked(createShaderRenderer).mock.calls.length > 0
    if (!asked && !settled.isFallback.value) throw new Error('loading')
  })
  await flushPromises()
  return { wrapper, state, canvas: canvasRef.value }
}

const io = () => FakeIntersectionObserver.instances.at(-1)
const ro = () => FakeResizeObserver.instances.at(-1)

/*
 * The `?raw` imports resolve as real modules, later than `flushPromises`.
 * Loading both once here keeps each case's wait in `mountHost` short.
 */
beforeAll(async () => {
  await Promise.all([SHADER_SOURCES.liston(), SHADER_SOURCES.acanalado()])
})

beforeEach(() => {
  vi.mocked(createShaderRenderer).mockClear()
  vi.mocked(createShaderRenderer).mockReturnValue(renderer)
  for (const spy of [renderer.draw, renderer.resize, renderer.dispose]) {
    spy.mockClear()
  }
  loseContext.mockClear()
  FakeIntersectionObserver.instances = []
  FakeResizeObserver.instances = []
  media = new FakeMediaQuery()
  frames = new Map()
  nextFrame = 0
  hidden = false

  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    nextFrame += 1
    frames.set(nextFrame, callback)
    return nextFrame
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media)
  )
  stubGetter(document, 'hidden', () => hidden)
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context as unknown as RenderingContext)
  restore.push(() => getContext.mockRestore())
  stubProperty(HTMLElement.prototype, 'clientWidth', 400)
  stubProperty(HTMLElement.prototype, 'clientHeight', 300)
  stubProperty(window, 'devicePixelRatio', 3)
  stubProperty(window, 'innerWidth', 1440)
})

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  for (const undo of restore.splice(0).reverse()) undo()
})

describe('useShaderCanvas · fallback', () => {
  it('should fall back and never be ready when WebGL is unavailable', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)

    const { state } = await mountHost()

    expect(state.isFallback.value).toBe(true)
    expect(state.isReady.value).toBe(false)
    expect(io()).toBeUndefined()
  })

  it('should fall back when the shader fails to build', async () => {
    vi.mocked(createShaderRenderer).mockReturnValue(null)

    const { state } = await mountHost()

    expect(state.isFallback.value).toBe(true)
    expect(state.isReady.value).toBe(false)
  })

  it('should fall back with no unhandled rejection when the shader source fails to load', async () => {
    /* Feature 43 · FR-045 (review-42b advisory 1): a lazy chunk that cannot
       be fetched. Vitest fails the run on an unhandled rejection, so passing
       here also proves the rejection is handled. */
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    const load = vi
      .spyOn(
        SHADER_SOURCES as Record<'liston', () => Promise<string>>,
        'liston'
      )
      .mockRejectedValue(new Error('chunk failed to load'))
    restore.push(() => load.mockRestore())

    const { state } = await mountHost()
    await flushPromises()
    process.off('unhandledRejection', unhandled)

    expect(state.isFallback.value).toBe(true)
    expect(state.isReady.value).toBe(false)
    expect(createShaderRenderer).not.toHaveBeenCalled()
    expect(unhandled).not.toHaveBeenCalled()
  })

  it('should fall back and stop drawing when the GPU context is lost', async () => {
    const { state, canvas } = await mountHost()
    io()?.emit(true)
    flushFrame()

    canvas.dispatchEvent(new Event('webglcontextlost'))

    expect(state.isFallback.value).toBe(true)
    expect(state.isReady.value).toBe(false)
    expect(frames.size).toBe(0)
  })
})

describe('useShaderCanvas · gating', () => {
  it('should request no frame before the canvas is in view', async () => {
    await mountHost()

    expect(frames.size).toBe(0)
    expect(renderer.draw).not.toHaveBeenCalled()
  })

  it('should look 100 px ahead when observing the canvas', async () => {
    await mountHost()

    expect(io()?.options?.rootMargin).toBe('100px')
  })

  it('should animate and become ready when the canvas comes into view', async () => {
    const { state } = await mountHost()

    io()?.emit(true)
    flushFrame()
    flushFrame()

    expect(renderer.draw).toHaveBeenCalledTimes(2)
    expect(state.isReady.value).toBe(true)
    expect(frames.size).toBe(1)
  })

  it('should pass the preset uniforms over the engine defaults when drawing', async () => {
    await mountHost()
    io()?.emit(true)
    flushFrame()

    expect(renderer.draw.mock.calls[0]?.[1]).toMatchObject({
      u_speed: 1,
      u_grain: 0.03,
      u_flip: 1,
      u_tx: 0.5,
      u_fadeB: 0.06,
    })
  })

  it('should fill the uniforms the preset omits with the shader @default when drawing', async () => {
    await mountHost()
    io()?.emit(true)
    flushFrame()

    /* homeHero passes no listón geometry: it must come from liston.glsl. */
    expect(renderer.draw.mock.calls[0]?.[1]).toMatchObject({
      u_y0: 0.98,
      u_y1: 0.5,
      u_th: 0.1,
      u_amp: 0.07,
      u_twist: 0.6,
      u_ty: 0.53,
    })
  })

  it('should stop when the canvas leaves the view and resume when it returns', async () => {
    await mountHost()
    io()?.emit(true)
    flushFrame()

    io()?.emit(false)
    expect(frames.size).toBe(0)

    io()?.emit(true)
    expect(frames.size).toBe(1)
  })

  it('should stop when the tab is hidden and resume when it is shown', async () => {
    await mountHost()
    io()?.emit(true)
    flushFrame()

    setHidden(true)
    expect(frames.size).toBe(0)

    setHidden(false)
    expect(frames.size).toBe(1)
  })

  it('should draw nothing at all while the tab is hidden', async () => {
    await mountHost()
    io()?.emit(true)
    flushFrame()
    renderer.draw.mockClear()

    setHidden(true)
    ro()?.emit()

    expect(renderer.draw).not.toHaveBeenCalled()
    expect(frames.size).toBe(0)
  })

  it('should draw exactly one still frame and loop never when motion is reduced', async () => {
    media.matches = true
    const { state } = await mountHost()

    io()?.emit(true)
    flushFrame()

    expect(frames.size).toBe(0)
    expect(renderer.draw).toHaveBeenCalledTimes(1)
    expect(renderer.draw.mock.calls[0]?.[0]).toBe(STILL_TIME_SECONDS)
    expect(state.isReady.value).toBe(true)
  })

  it('should stop on a still frame when motion is reduced while animating', async () => {
    await mountHost()
    io()?.emit(true)
    flushFrame()
    renderer.draw.mockClear()

    media.set(true)
    await flushPromises()

    expect(frames.size).toBe(0)
    expect(renderer.draw).toHaveBeenCalledTimes(1)
    expect(renderer.draw.mock.calls[0]?.[0]).toBe(STILL_TIME_SECONDS)
  })
})

describe('useShaderCanvas · resolution', () => {
  it('should draw at 1x when the viewport is below 768 px', async () => {
    stubProperty(window, 'innerWidth', 767)
    const { canvas } = await mountHost()

    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(300)
    expect(renderer.resize).toHaveBeenLastCalledWith(400, 300)
  })

  it('should cap at 1.5x when the viewport is 1440 px on a 3x screen', async () => {
    const { canvas } = await mountHost()

    expect(canvas.width).toBe(600)
    expect(canvas.height).toBe(450)
  })

  it('should re-apply the cap when the canvas is resized', async () => {
    const { canvas } = await mountHost()

    stubProperty(window, 'innerWidth', 390)
    ro()?.emit()

    expect(canvas.width).toBe(400)
  })
})

describe('useShaderCanvas · clean-up (FR-024)', () => {
  it('should release every observer, listener, frame and the context when unmounted', async () => {
    const removeDocument = vi.spyOn(document, 'removeEventListener')
    const { wrapper, canvas } = await mountHost()
    const removeCanvas = vi.spyOn(canvas, 'removeEventListener')
    io()?.emit(true)
    flushFrame()

    wrapper.unmount()

    expect(io()?.disconnect).toHaveBeenCalled()
    expect(ro()?.disconnect).toHaveBeenCalled()
    expect(frames.size).toBe(0)
    expect(removeDocument).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    )
    expect(removeCanvas).toHaveBeenCalledWith(
      'webglcontextlost',
      expect.any(Function)
    )
    expect(renderer.dispose).toHaveBeenCalled()
    expect(loseContext).toHaveBeenCalled()
    expect(media.listeners.size).toBe(0)
    removeDocument.mockRestore()
  })

  it('should start nothing when unmounted before the shader source loads', async () => {
    let state: ReturnType<typeof useShaderCanvas> | undefined
    const wrapper = mount(
      defineComponent({
        setup() {
          const canvasRef = ref<HTMLCanvasElement | null>(null)
          state = useShaderCanvas(canvasRef, BACKGROUND_PRESETS.howWeWork)
          return () => h('canvas', { ref: canvasRef })
        },
      })
    )

    wrapper.unmount()
    await flushPromises()

    expect(createShaderRenderer).not.toHaveBeenCalled()
    expect(io()).toBeUndefined()
    expect(state?.isReady.value).toBe(false)
  })
})
