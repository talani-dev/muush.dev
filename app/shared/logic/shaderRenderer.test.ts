import { describe, expect, it, vi } from 'vitest'
import { createShaderRenderer } from '@/shared/logic/shaderRenderer'

/**
 * Feature 42 · research R7. `happy-dom` has no WebGL, so the renderer is
 * driven against a hand-written stand-in that records calls. It proves call
 * order and failure handling; real pixels are reviewed in Storybook
 * (quickstart § 8), never asserted here (rules.md § R27).
 */
const GL = {
  VERTEX_SHADER: 0x8b31,
  FRAGMENT_SHADER: 0x8b30,
  COMPILE_STATUS: 0x8b81,
  LINK_STATUS: 0x8b82,
  ARRAY_BUFFER: 0x8892,
  STATIC_DRAW: 0x88e4,
  FLOAT: 0x1406,
  TRIANGLES: 0x0004,
}

interface StubOptions {
  failVertex?: boolean
  failFragment?: boolean
  failLink?: boolean
  declared?: string[]
}

function stubContext(options: StubOptions = {}) {
  const declared = new Set(
    options.declared ?? ['u_res', 'u_time', 'u_speed', 'u_tx']
  )
  const shaders: { type: number }[] = []
  const gl = {
    ...GL,
    createShader: vi.fn((type: number) => {
      const shader = { type }
      shaders.push(shader)
      return shader
    }),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn((shader: { type: number }) => {
      if (shader.type === GL.VERTEX_SHADER) return !options.failVertex
      return !options.failFragment
    }),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => ({ program: true })),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => !options.failLink),
    deleteProgram: vi.fn(),
    useProgram: vi.fn(),
    createBuffer: vi.fn(() => ({ buffer: true })),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    deleteBuffer: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    getUniformLocation: vi.fn((_program: unknown, name: string) =>
      declared.has(name) ? { name } : null
    ),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    viewport: vi.fn(),
    drawArrays: vi.fn(),
  }
  return { gl, context: gl as unknown as WebGLRenderingContext, shaders }
}

describe('createShaderRenderer', () => {
  for (const [label, options] of [
    ['the vertex shader fails to compile', { failVertex: true }],
    ['the fragment shader fails to compile', { failFragment: true }],
    ['the program fails to link', { failLink: true }],
  ] as const) {
    it(`should return null without throwing when ${label}`, () => {
      const { gl, context } = stubContext(options)

      expect(createShaderRenderer(context, 'void main(){}')).toBeNull()
      expect(gl.deleteShader).toHaveBeenCalled()
    })
  }

  it('should upload the full-screen triangle once when created', () => {
    const { gl, context } = stubContext()

    const renderer = createShaderRenderer(context, 'fragment')
    renderer?.draw(1, {})
    renderer?.draw(2, {})

    expect(gl.createBuffer).toHaveBeenCalledTimes(1)
    expect(gl.bufferData).toHaveBeenCalledTimes(1)
    const triangle = gl.bufferData.mock.calls[0]?.[1] as Float32Array
    expect([...triangle]).toEqual([-1, -1, 3, -1, -1, 3])
  })

  it('should set the resolution and time, then draw three vertices when drawing', () => {
    const { gl, context } = stubContext()
    const renderer = createShaderRenderer(context, 'fragment')

    renderer?.resize(300, 200)
    renderer?.draw(12, {})

    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 300, 200)
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: 'u_res' }, 300, 200)
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_time' }, 12)
    expect(gl.drawArrays).toHaveBeenCalledWith(GL.TRIANGLES, 0, 3)
  })

  it('should set each declared uniform and skip undeclared ones when drawing', () => {
    const { gl, context } = stubContext()
    const renderer = createShaderRenderer(context, 'fragment')

    renderer?.draw(0, { u_speed: 1, u_tx: 0.5, u_missing: 3 })

    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_speed' }, 1)
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_tx' }, 0.5)
    expect(gl.uniform1f).not.toHaveBeenCalledWith(null, 3)
  })

  it('should look each uniform location up once when drawing repeatedly', () => {
    const { gl, context } = stubContext()
    const renderer = createShaderRenderer(context, 'fragment')

    renderer?.draw(0, { u_tx: 0.5 })
    renderer?.draw(1, { u_tx: 0.5 })

    const lookups = gl.getUniformLocation.mock.calls.filter(
      call => call[1] === 'u_tx'
    )
    expect(lookups).toHaveLength(1)
  })

  it('should delete the program, both shaders and the buffer when disposed', () => {
    const { gl, context } = stubContext()
    const renderer = createShaderRenderer(context, 'fragment')

    renderer?.dispose()

    expect(gl.deleteProgram).toHaveBeenCalledTimes(1)
    expect(gl.deleteShader).toHaveBeenCalledTimes(2)
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(1)
  })
})
