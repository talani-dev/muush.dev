// Degradados con movimiento · muush 1.0
// Uso: new MuushGradient(canvas, { fragment: codigoGLSL, uniforms: { u_y0: 0.98 } })
// - Pausa cuando el canvas sale de pantalla o la pestaña se oculta.
// - Con prefers-reduced-motion dibuja un solo cuadro fijo.
// - En pantallas chicas baja la resolución para cuidar batería.
// - Los uniforms que no se pasan toman el @default del shader (2026-11-01).

const VERT = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}`;

export class MuushGradient {
  constructor(canvas, { fragment, uniforms = {}, stillTime = 12.0 } = {}) {
    this.canvas = canvas;
    this.uniforms = { ...MuushGradient.defaults(fragment), u_speed: 1, u_flip: 1, u_grain: 0.07, ...uniforms };
    this.stillTime = stillTime;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.visible = false;
    this.start = performance.now();
    this.raf = 0;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) { canvas.dataset.fallback = 'true'; return; }
    this.gl = gl;
    this.program = this.#build(VERT, fragment);
    if (!this.program) { canvas.dataset.fallback = 'true'; return; }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.loc = {};
    this.#resize();
    new ResizeObserver(() => { this.#resize(); if (!this.raf) this.#draw(this.#time()); }).observe(canvas);
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.#loop(); }, { rootMargin: '100px' }).observe(canvas);
    document.addEventListener('visibilitychange', () => this.#loop());
  }

  // Lee los @default de cada uniform del shader (los mismos que usa Pencil).
  // Sin esto, un uniform que no se pasa vale 0 y el degradado puede desaparecer.
  static defaults(fragment = '') {
    const out = {};
    const re = /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*uniform\s+float\s+(\w+)/g;
    for (const [, doc, name] of fragment.matchAll(re)) {
      const m = /@default\s+(-?[\d.]+)/.exec(doc);
      if (m) out[name] = parseFloat(m[1]);
    }
    return out;
  }

  set(uniforms) { Object.assign(this.uniforms, uniforms); if (!this.raf) this.#draw(this.#time()); }

  #time() { return this.reduced ? this.stillTime : (performance.now() - this.start) / 1000; }

  #loop() {
    const run = this.visible && !document.hidden && !this.reduced;
    if (run && !this.raf) {
      const tick = () => { this.#draw(this.#time()); this.raf = requestAnimationFrame(tick); };
      this.raf = requestAnimationFrame(tick);
    } else if (!run && this.raf) {
      cancelAnimationFrame(this.raf); this.raf = 0;
    }
    if (!run && this.visible) this.#draw(this.#time());
  }

  #resize() {
    const small = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    this.gl.viewport(0, 0, w, h);
  }

  #u(name) { if (!(name in this.loc)) this.loc[name] = this.gl.getUniformLocation(this.program, name); return this.loc[name]; }

  #draw(t) {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.uniform2f(this.#u('u_res'), this.canvas.width, this.canvas.height);
    gl.uniform1f(this.#u('u_time'), t);
    for (const [k, v] of Object.entries(this.uniforms)) { const l = this.#u(k); if (l) gl.uniform1f(l, v); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  #build(vs, fs) {
    const gl = this.gl;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; } return s; };
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return null; }
    return p;
  }
}

// Pill rotativo del hero. Cambia el texto cada 2.6 s con un deslizamiento corto.
export function rotatePill(el, items, { every = 2600 } = {}) {
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0;
  setInterval(() => {
    if (document.hidden) return;
    el.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 220, easing: 'ease-in', fill: 'forwards' })
      .finished.then(() => {
        i = (i + 1) % items.length; el.textContent = items[i];
        el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out', fill: 'forwards' });
      });
  }, every);
}

// Header flotante: visible arriba, se oculta al bajar después de 80 px y reaparece al subir.
export function smartHeader(header, { offset = 80, menuOpen = () => false } = {}) {
  if (!header) return;
  let last = window.scrollY;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  header.style.transition = reduced ? 'none' : 'transform 280ms ease, opacity 280ms ease';
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const hide = y > offset && y > last && !menuOpen();
    header.style.transform = hide ? 'translateY(-120%)' : 'translateY(0)';
    header.style.opacity = hide ? '0' : '1';
    last = y;
  }, { passive: true });
}
