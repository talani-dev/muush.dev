import {
  type MaybeRefOrGetter,
  onBeforeUnmount,
  onMounted,
  type Ref,
  readonly,
  ref,
  toValue,
  watch,
} from 'vue'
import {
  type BackgroundPreset,
  SHADER_SOURCES,
} from '@/shared/data/backgroundPresets'
import {
  createShaderRenderer,
  type ShaderRenderer,
} from '@/shared/logic/shaderRenderer'
import { useReducedMotion } from '@/shared/logic/useReducedMotion'
import {
  canvasPixelSize,
  capPixelRatio,
  STILL_TIME_SECONDS,
  shouldAnimate,
  withShaderDefaults,
} from '@/shared/utils/shaderFrame'
import { readShaderDefaults } from '@/shared/utils/shaderUniformDefaults'

/**
 * The lifecycle of one animated background canvas (feature 42, research R7,
 * R10, R11; data-model § 4):
 *
 * ```
 * idle (SSR, before mount) → loading (poster visible, canvas transparent)
 *   ├─ no WebGL / compile or link failure → fallback (poster only)
 *   └─ first frame drawn → ready
 * ready: in view ∧ tab visible ∧ motion allowed → rAF loop; otherwise
 *        paused (one frame drawn while in view); context lost → fallback
 * unmount → everything released
 * ```
 *
 * Everything starts in `onMounted`, which never runs during prerender
 * (Article IV), and everything is released in `onBeforeUnmount` — the
 * handoff never releases its observers, listeners or context, which a
 * client-routed site must (spec FR-024).
 *
 * The shader is chosen once, at mount, and its `@default` values are read
 * from its source then; preset uniforms are read on every draw.
 */

/** IntersectionObserver look-ahead, as in the handoff. Not a visual value. */
const LOOKAHEAD_MARGIN_PX = 100

/** WebGL 1 context options of the handoff engine. */
const CONTEXT_OPTIONS: WebGLContextAttributes = {
  antialias: false,
  premultipliedAlpha: false,
  powerPreference: 'low-power',
}

interface CanvasState {
  isReady: Ref<boolean>
  isFallback: Ref<boolean>
  reducedMotion: Readonly<Ref<boolean>>
}

/** The imperative half: one instance per mounted canvas. */
class ShaderCanvas {
  private renderer: ShaderRenderer | null = null
  /** The shader's `@default` values, read once from its source at start. */
  private shaderDefaults: Readonly<Record<string, number>> = {}
  private gl: WebGLRenderingContext | null = null
  private resizeObserver: ResizeObserver | null = null
  private intersectionObserver: IntersectionObserver | null = null
  private frame = 0
  private visible = false
  private startedAt = 0
  private disposed = false

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly preset: MaybeRefOrGetter<BackgroundPreset>,
    private readonly state: CanvasState
  ) {}

  async start(): Promise<void> {
    this.gl = this.canvas.getContext('webgl', CONTEXT_OPTIONS)
    if (!this.gl) return this.fallBack()
    /*
     * The source is a lazy chunk; one that cannot be downloaded (offline, a
     * stale deploy) rejects. It falls back to the poster like any other failure, and the
     * rejection is handled here rather than escaping as unhandled (feature
     * 43, spec FR-045; review-42b advisory 1).
     */
    let source: string
    try {
      source = await SHADER_SOURCES[toValue(this.preset).shader]()
    } catch {
      return this.fallBack()
    }
    if (this.disposed) return
    this.shaderDefaults = readShaderDefaults(source)
    this.renderer = createShaderRenderer(this.gl, source)
    if (!this.renderer) return this.fallBack()
    this.startedAt = performance.now()
    this.observe()
    this.resize()
  }

  /** Re-evaluates the run condition: start, stop, or draw one paused frame. */
  readonly update = (): void => {
    if (!this.renderer) return
    const run = shouldAnimate({
      visible: this.visible,
      documentHidden: document.hidden,
      reducedMotion: this.state.reducedMotion.value,
    })
    if (run && !this.frame) this.frame = requestAnimationFrame(this.tick)
    if (!run) this.stopLoop()
    /* A hidden tab draws nothing at all, not even the paused frame. */
    if (!run && this.visible && !document.hidden) this.draw()
  }

  dispose(): void {
    this.disposed = true
    this.stopLoop()
    this.resizeObserver?.disconnect()
    this.intersectionObserver?.disconnect()
    document.removeEventListener('visibilitychange', this.update)
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    this.renderer?.dispose()
    this.renderer = null
    this.gl?.getExtension('WEBGL_lose_context')?.loseContext()
  }

  private observe(): void {
    this.canvas.addEventListener('webglcontextlost', this.onContextLost)
    document.addEventListener('visibilitychange', this.update)
    this.resizeObserver = new ResizeObserver(this.resize)
    this.resizeObserver.observe(this.canvas)
    this.intersectionObserver = new IntersectionObserver(this.onIntersect, {
      rootMargin: `${LOOKAHEAD_MARGIN_PX}px`,
    })
    this.intersectionObserver.observe(this.canvas)
  }

  private readonly onIntersect = (
    entries: IntersectionObserverEntry[]
  ): void => {
    this.visible = entries.at(-1)?.isIntersecting ?? false
    this.update()
  }

  /** Applies the DPR cap for the current width, then repaints if paused. */
  private readonly resize = (): void => {
    if (!this.renderer) return
    const ratio = capPixelRatio(window.devicePixelRatio, window.innerWidth)
    const { width, height } = canvasPixelSize(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      ratio
    )
    if (this.canvas.width !== width) this.canvas.width = width
    if (this.canvas.height !== height) this.canvas.height = height
    this.renderer.resize(width, height)
    if (!this.frame && this.visible && !document.hidden) this.draw()
  }

  private readonly tick = (): void => {
    this.draw()
    this.frame = requestAnimationFrame(this.tick)
  }

  private draw(): void {
    if (!this.renderer) return
    const time = this.state.reducedMotion.value
      ? STILL_TIME_SECONDS
      : (performance.now() - this.startedAt) / 1000
    this.renderer.draw(
      time,
      withShaderDefaults(toValue(this.preset).uniforms, this.shaderDefaults)
    )
    this.state.isReady.value = true
  }

  private stopLoop(): void {
    if (this.frame) cancelAnimationFrame(this.frame)
    this.frame = 0
  }

  /** The GPU took the context away: the poster shows again, silently. */
  private readonly onContextLost = (): void => {
    this.stopLoop()
    this.renderer = null
    this.fallBack()
  }

  private fallBack(): void {
    this.state.isReady.value = false
    this.state.isFallback.value = true
  }
}

export function useShaderCanvas(
  canvas: Ref<HTMLCanvasElement | null>,
  preset: MaybeRefOrGetter<BackgroundPreset>
): { isReady: Readonly<Ref<boolean>>; isFallback: Readonly<Ref<boolean>> } {
  /* First, so its own `onMounted` has read the preference before ours runs. */
  const reducedMotion = useReducedMotion()
  const isReady = ref(false)
  const isFallback = ref(false)
  let controller: ShaderCanvas | null = null

  onMounted(() => {
    if (!canvas.value) return
    controller = new ShaderCanvas(canvas.value, preset, {
      isReady,
      isFallback,
      reducedMotion,
    })
    void controller.start()
  })

  watch(reducedMotion, () => controller?.update())

  onBeforeUnmount(() => controller?.dispose())

  return { isReady: readonly(isReady), isFallback: readonly(isFallback) }
}
