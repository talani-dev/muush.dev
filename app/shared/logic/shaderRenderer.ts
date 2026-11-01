/**
 * The WebGL 1 half of the animated backgrounds (feature 42, research R7):
 * compile and link one fragment shader over a full-screen triangle, cache
 * its uniform locations and draw a frame. Translated from the handoff's
 * `MuushGradient` (`#build`, `#u`, `#draw`), which stays in `docs/` as
 * reference and is never imported.
 *
 * Every failure (compile, link, no buffer) returns `null` instead of
 * throwing, and the caller shows the poster: a background may fail, a
 * section may never be blank (spec FR-021). Nothing is logged; the fallback
 * is the whole report.
 */

/** Passes the triangle's clip-space corners straight through. */
export const VERTEX_SOURCE =
  'attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}'

/** One triangle that covers the viewport: cheaper than a two-triangle quad. */
const FULL_SCREEN_TRIANGLE = [-1, -1, 3, -1, -1, 3]
const VERTEX_COUNT = 3
const COMPONENTS_PER_VERTEX = 2

export interface ShaderRenderer {
  draw(timeSeconds: number, uniforms: Readonly<Record<string, number>>): void
  resize(width: number, height: number): void
  dispose(): void
}

interface LinkedProgram {
  program: WebGLProgram
  shaders: WebGLShader[]
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  gl.deleteShader(shader)
  return null
}

function linkProgram(
  gl: WebGLRenderingContext,
  fragmentSource: string
): LinkedProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const shaders = [vertex, fragment].filter(
    (shader): shader is WebGLShader => shader !== null
  )
  const program = vertex && fragment ? gl.createProgram() : null
  if (!vertex || !fragment || !program) {
    for (const shader of shaders) gl.deleteShader(shader)
    return null
  }
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return { program, shaders }
  }
  gl.deleteProgram(program)
  for (const shader of shaders) gl.deleteShader(shader)
  return null
}

function uploadTriangle(
  gl: WebGLRenderingContext,
  program: WebGLProgram
): WebGLBuffer | null {
  const buffer = gl.createBuffer()
  if (!buffer) return null
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(FULL_SCREEN_TRIANGLE),
    gl.STATIC_DRAW
  )
  const position = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, COMPONENTS_PER_VERTEX, gl.FLOAT, false, 0, 0)
  return buffer
}

function releaseProgram(gl: WebGLRenderingContext, linked: LinkedProgram) {
  gl.deleteProgram(linked.program)
  for (const shader of linked.shaders) gl.deleteShader(shader)
}

/** Looks each uniform location up once; `null` for an undeclared name. */
function createLocator(gl: WebGLRenderingContext, program: WebGLProgram) {
  const locations = new Map<string, WebGLUniformLocation | null>()
  return (name: string) => {
    if (!locations.has(name)) {
      locations.set(name, gl.getUniformLocation(program, name))
    }
    return locations.get(name) ?? null
  }
}

/** A renderer for one fragment shader, or `null` when it cannot be built. */
export function createShaderRenderer(
  gl: WebGLRenderingContext,
  fragmentSource: string
): ShaderRenderer | null {
  const linked = linkProgram(gl, fragmentSource)
  if (!linked) return null
  const buffer = uploadTriangle(gl, linked.program)
  if (!buffer) {
    releaseProgram(gl, linked)
    return null
  }
  const locate = createLocator(gl, linked.program)
  const size = { width: 1, height: 1 }

  return {
    draw(timeSeconds, uniforms) {
      gl.useProgram(linked.program)
      gl.uniform2f(locate('u_res'), size.width, size.height)
      gl.uniform1f(locate('u_time'), timeSeconds)
      for (const [name, value] of Object.entries(uniforms)) {
        const location = locate(name)
        if (location) gl.uniform1f(location, value)
      }
      gl.drawArrays(gl.TRIANGLES, 0, VERTEX_COUNT)
    },
    resize(width, height) {
      size.width = width
      size.height = height
      gl.viewport(0, 0, width, height)
    },
    dispose() {
      gl.deleteBuffer(buffer)
      releaseProgram(gl, linked)
    },
  }
}
