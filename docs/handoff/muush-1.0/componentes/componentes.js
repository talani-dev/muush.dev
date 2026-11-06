// ==========================================================
// muush 1.0 · componentes
// JavaScript sin dependencias. Cada componente se activa solo con
// atributos data-*; también se pueden importar las funciones sueltas.
// Uso rápido:  <script type="module">import { iniciarTodo } from './componentes.js'; iniciarTodo();</script>
// ==========================================================

const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esMovil = () => window.matchMedia('(max-width: 767px)').matches;

// ----------------------------------------------------------
// 1 · Menú móvil (hamburguesa ↔ X) y header que se oculta al bajar
// ----------------------------------------------------------
export function iniciarMenu(menu = document.querySelector('[data-menu]')) {
  if (!menu) return;
  const abrir = document.querySelectorAll('[data-menu-abrir]');
  const cerrar = menu.querySelectorAll('[data-menu-cerrar], .m1-menu__links a');
  let ultimoFoco = null;
  const set = (abierto) => {
    menu.classList.toggle('is-abierto', abierto);
    menu.setAttribute('aria-hidden', String(!abierto));
    document.body.classList.toggle('m1-sin-scroll', abierto);
    abrir.forEach((b) => b.setAttribute('aria-expanded', String(abierto)));
    if (abierto) { ultimoFoco = document.activeElement; menu.querySelector('[data-menu-cerrar]')?.focus(); }
    else ultimoFoco?.focus?.();
  };
  abrir.forEach((b) => b.addEventListener('click', () => set(true)));
  cerrar.forEach((b) => b.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-abierto')) set(false); });
}

export function iniciarHeader(header = document.querySelector('[data-header]'), { umbral = 80, menuAbierto = () => document.body.classList.contains('m1-sin-scroll') } = {}) {
  if (!header) return;
  let ultimo = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('is-oculto', y > umbral && y > ultimo && !menuAbierto());
    ultimo = y;
  }, { passive: true });
}

// ----------------------------------------------------------
// 2 · Mapa con pestañas América / Europa
// Las regiones están en coordenadas del mapa base de 1408 × 470 px
// (el mismo de la landing). [x, y, ancho, alto]
// ----------------------------------------------------------
const REGIONES = { america: [210, 95, 285, 200], europa: [645, 75, 190, 95] };

export function iniciarMapa(raiz) {
  const ventana = raiz.querySelector('.m1-mapa__ventana');
  const lienzo = raiz.querySelector('.m1-mapa__lienzo');
  const tabs = [...raiz.querySelectorAll('[data-region]')];
  let actual = tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.region || 'america';
  const aplicar = () => {
    const W = ventana.clientWidth;
    if (!esMovil() && window.matchMedia('(min-width: 1024px)').matches) {
      const s = W / 1408; lienzo.style.transform = `scale(${s})`; return; // escritorio: mapa completo
    }
    const [x, y, w, h] = REGIONES[actual];
    const H = ventana.clientHeight;
    const s = Math.min(W / w, H / h);
    const ox = (W - w * s) / 2 - x * s;
    const oy = (H - h * s) / 2 - y * s;
    lienzo.style.transform = `translate(${ox}px, ${oy}px) scale(${s})`;
  };
  tabs.forEach((t) => t.addEventListener('click', () => {
    actual = t.dataset.region;
    tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    aplicar();
  }));
  new ResizeObserver(aplicar).observe(ventana);
  aplicar();
}

// ----------------------------------------------------------
// 3 · Carrusel de servicios: indicador sincronizado con el scroll
// ----------------------------------------------------------
export function iniciarCarrusel(carrusel) {
  const tarjetas = [...carrusel.children];
  const indicador = (carrusel.dataset.indicador && document.querySelector(carrusel.dataset.indicador)) || carrusel.nextElementSibling;
  if (!indicador || !indicador.classList.contains('m1-indicador')) return;
  indicador.innerHTML = tarjetas.map(() => '<span></span>').join('');
  const puntos = [...indicador.children];
  const actualizar = () => {
    const centro = carrusel.scrollLeft + carrusel.clientWidth * 0.35;
    let i = tarjetas.findIndex((t) => t.offsetLeft + t.offsetWidth > centro);
    if (carrusel.scrollLeft + carrusel.clientWidth >= carrusel.scrollWidth - 4) i = tarjetas.length - 1;
    puntos.forEach((p, j) => p.classList.toggle('is-activo', j === Math.max(0, i)));
  };
  carrusel.addEventListener('scroll', actualizar, { passive: true });
  actualizar();
}

// ----------------------------------------------------------
// 4 · Línea de "Cómo trabajamos"
// Sugerencia de partida (Clau define la final con Roberto):
// la línea se llena en rojo con el scroll y cada punto se enciende al llegar.
// ----------------------------------------------------------
export function iniciarLineaTiempo(lista) {
  const pasos = [...lista.querySelectorAll('.m1-paso')];
  if (reducido()) { lista.style.setProperty('--m1-progreso', 1); pasos.forEach((p) => p.classList.add('is-activo')); return; }
  let pendiente = false;
  const calcular = () => {
    pendiente = false;
    const r = lista.getBoundingClientRect();
    const horizontal = window.matchMedia('(min-width: 1024px)').matches;
    const meta = window.innerHeight * 0.65; // el "lápiz" está al 65% de la pantalla
    let p;
    if (horizontal) p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight * 0.6)));
    else p = Math.min(1, Math.max(0, (meta - r.top) / r.height));
    lista.style.setProperty('--m1-progreso', p.toFixed(3));
    pasos.forEach((paso) => {
      const pr = paso.getBoundingClientRect();
      const llegado = horizontal ? p >= (paso.offsetLeft / lista.clientWidth) : pr.top < meta;
      paso.classList.toggle('is-activo', llegado);
    });
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(calcular); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  calcular();
}

// ----------------------------------------------------------
// 5 · Formulario en dos pasos (diagnóstico y aplicación)
// Móvil: paso 1 → paso 2 con barra de progreso. Escritorio: todo visible.
// Los datos del paso 1 se conservan al regresar. Nunca se borran si falla el envío.
//
// enviar(formData) debe regresar una Promise que se resuelve si el envío salió bien.
// Si no se pasa, hace POST al action del formulario y espera un 2xx.
// ----------------------------------------------------------
const TEXTOS = {
  es: { paso: (n, t) => `Paso ${n} de 2 · ${t}` },
  en: { paso: (n, t) => `Step ${n} of 2 · ${t}` },
};

export function iniciarFormulario(form, { enviar } = {}) {
  const idioma = form.dataset.idioma === 'en' ? 'en' : 'es';
  const pasos = [...form.querySelectorAll('[data-paso]')];
  const etiqueta = form.querySelector('[data-progreso-texto]');
  const barras = [...form.querySelectorAll('.m1-form__barras i')];
  const boton = form.querySelector('[type="submit"]');
  const textoBoton = boton.querySelector('[data-texto]') || boton;
  const original = textoBoton.textContent;
  let paso = 1;

  const mostrar = (n) => {
    paso = n;
    const movil = esMovil();
    pasos.forEach((f) => { f.hidden = movil && Number(f.dataset.paso) !== n; });
    if (etiqueta) etiqueta.textContent = TEXTOS[idioma].paso(n, pasos[n - 1].dataset.etiqueta || '');
    barras.forEach((b, i) => b.classList.toggle('is-activa', i < n));
  };

  // Preferencia de contacto (botones segmentados → input oculto)
  form.querySelectorAll('[data-segmentado]').forEach((grupo) => {
    const oculto = form.querySelector(`input[name="${grupo.dataset.segmentado}"]`);
    const telefono = form.querySelector('[data-si-whatsapp]');
    grupo.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      grupo.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      oculto.value = b.dataset.valor;
      if (telefono) {
        const ws = b.dataset.valor === 'whatsapp';
        telefono.hidden = !ws;
        telefono.querySelector('input').required = ws;
      }
    }));
  });

  // Archivo (CV): muestra el nombre del archivo elegido
  form.querySelectorAll('.m1-archivo input[type="file"]').forEach((inp) => inp.addEventListener('change', () => {
    const caja = inp.closest('.m1-archivo');
    const f = inp.files[0];
    caja.querySelector('[data-archivo-texto]').textContent = f ? f.name : caja.dataset.vacio;
    caja.classList.toggle('tiene-archivo', !!f);
  }));

  const valido = (el) => {
    if (el.type === 'checkbox') return !el.required || el.checked;
    if (el.type === 'file') {
      const f = el.files[0];
      if (!f) return !el.required;
      const max = Number(el.dataset.maxMb || 10) * 1024 * 1024;
      return f.size <= max && /pdf$/i.test(f.type || f.name);
    }
    if (el.closest('[hidden]') && !el.closest('[data-paso]')?.hasAttribute('hidden')) return true;
    return el.checkValidity();
  };
  const validar = (contenedor) => {
    let ok = true; let primero = null;
    contenedor.querySelectorAll('input, select, textarea').forEach((el) => {
      if (el.type === 'hidden' || el.closest('[data-si-whatsapp][hidden]')) return;
      const caja = el.closest('.m1-campo, .m1-privacidad');
      const bien = valido(el);
      caja?.classList.toggle('is-error', !bien);
      if (!bien) { ok = false; primero ??= el; }
    });
    primero?.focus();
    return ok;
  };
  form.addEventListener('input', (e) => e.target.closest('.m1-campo, .m1-privacidad')?.classList.remove('is-error'));
  form.addEventListener('change', (e) => e.target.closest('.m1-campo, .m1-privacidad')?.classList.remove('is-error'));

  form.querySelector('[data-continuar]')?.addEventListener('click', () => {
    if (!validar(pasos[0])) return;
    mostrar(2);
    pasos[1].querySelector('input, select, textarea')?.focus({ preventScroll: true });
    form.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' });
  });
  form.querySelector('[data-atras]')?.addEventListener('click', () => mostrar(1));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validar(form)) {
      // En móvil, si el error está en el paso 1, regresa a ese paso
      if (esMovil() && pasos[0].querySelector('.is-error')) {
        mostrar(1);
        pasos[0].querySelector('.is-error input, .is-error select, .is-error textarea')?.focus();
      }
      return;
    }
    form.classList.remove('is-error-envio');
    boton.disabled = true;
    textoBoton.textContent = boton.dataset.textoEnviando || 'Enviando…';
    try {
      const datos = new FormData(form);
      if (enviar) await enviar(datos);
      else {
        const r = await fetch(form.action, { method: 'POST', body: datos });
        if (!r.ok) throw new Error(r.status);
      }
      form.classList.add('is-enviado');
      form.querySelector('.m1-exito')?.focus?.();
    } catch {
      form.classList.add('is-error-envio');
      textoBoton.textContent = boton.dataset.textoReintentar || original;
      form.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' });
    } finally {
      boton.disabled = false;
    }
  });

  window.matchMedia('(max-width: 767px)').addEventListener('change', () => mostrar(paso));
  mostrar(1);
}

// ----------------------------------------------------------
// Activa todo lo que encuentre en la página
// ----------------------------------------------------------
export function iniciarTodo({ enviar } = {}) {
  iniciarMenu();
  iniciarHeader();
  document.querySelectorAll('[data-mapa]').forEach(iniciarMapa);
  document.querySelectorAll('[data-carrusel]').forEach(iniciarCarrusel);
  document.querySelectorAll('[data-linea-tiempo]').forEach(iniciarLineaTiempo);
  document.querySelectorAll('form[data-dos-pasos]').forEach((f) => iniciarFormulario(f, { enviar }));
}
