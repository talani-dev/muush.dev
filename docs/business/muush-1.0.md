# Muush 1.0 — diseño, estructura y copy del sitio v2

> Aprobado por Roberto el 2026-10-31 (redactado por el leader desde el `.pen`).
>
> Fuente: `muush.pen` (frames abajo) y `docs/handoff/muush-1.0/`. El `.pen`
> manda sobre este documento (rules.md § R32). Este archivo es autoritativo
> para v2 (features 41–48); los documentos v1 de `docs/business/` llevan un
> aviso y se retiran en la feature 47.

## 1 · Decisiones de Roberto (2026-10-31)

- Tema oscuro único. El logo (isotipo + wordmark) **no cambia**; el punto va en
  Red muush 500.
- **Responsive:** 390 px y 1440 px son anclas que deben coincidir con el `.pen`.
  En cualquier otro ancho se pueden ajustar tamaños y espacios; color,
  componentes, copy y comportamiento no.
- La home ya **no** lleva Propósito ni Proyectos.
- Formularios: el aviso de privacidad es un checkbox obligatorio que habilita
  el botón de enviar y **no se envía**. El campo "Tu sitio web o redes
  (opcional)" del diagnóstico **no se construye** por ahora; el backend no
  cambia (`landing/form-api-contract.md` sigue vigente tal cual).
- Aviso de privacidad y Términos y condiciones tendrán **páginas propias**
  dentro de v2; diseño y texto legal llegan después (feature 48).
- El cursor personalizado y el spotlight **se quedan**.
- Preguntas vive en `/es/preguntas` ↔ `/en/faq` y **se indexa** desde el primer
  día, aunque diga "En construcción": todo el sitio se indexa y va en el sitemap.
- El CTA principal dice "Diagnóstico gratis" / "Free assessment".

## 2 · Sistema visual (Kit `Cs3AJ`)

Valores exactos en `docs/handoff/muush-1.0/componentes/tokens.css`.

| Grupo | Token | Hex | Uso |
|---|---|---|---|
| Base | Negro 950 | `#050505` | Fondo principal |
| Base | Negro 900 | `#0B0B0B` | Secciones alternas, vidrio |
| Base | Carbón 800 | `#1A1A1A` | Campos y tarjetas |
| Base | Carbón 700 | `#2C2C2C` | Líneas y bordes |
| Base | Gris 400 | `#8C8C8A` | Texto de apoyo, segunda línea de titulares |
| Base | Blanco | `#F4F4F2` | Titulares y texto |
| Brasa | Red muush 500 | `#E5352F` | Único acento sólido: logo, favicon, botón primario |
| Brasa | Crimson 600 | `#8E2A1E` | Degradados |
| Brasa | Oxblood 800 | `#4A1715` | Degradados |
| Brasa | Coral 300 | `#C9604A` | Tope cálido; nada de naranja |
| Brasa | Arena 300 | `#B38B7B` | Degradados |
| Acero | Acero 200 | `#A6B6B2` | Punto de aliados |
| Acero | Acero 400 | `#4A676B` | Par frío del degradado |
| Acero | Acero 800 | `#1F3236` | Degradados |

- **Tipografía:** Poppins 500 en titulares, logo y wordmark; Instrument Sans en
  todo lo demás. Titulares en dos líneas: la primera en Blanco, la segunda en
  Gris 400.
- **Componentes base:** vidrio (carbón al 50–70 %, blur, borde de luz que se
  apaga abajo, sombra larga), pill con punto rojo, botón primario rojo (texto
  blanco 19 px semibold), botón de vidrio secundario.
- **Fondos animados:** solo "listón" y "vidrio acanalado" (WebGL, con póster
  fijo de respaldo). Qué fondo va en cada sección y con qué valores:
  `docs/handoff/muush-1.0/README.md`.

## 3 · Páginas y frames

| Página | Escritorio ES / EN | Móvil ES / EN |
|---|---|---|
| Home | `Tng1t` / `ZL2Vo` | `V2s7T` / `mJxKt` |
| Nosotros | `gQ0NG` / `D1CqYA` | `trkk7` / `XoSI5` |
| Preguntas | `FXvwz` / `Gc1U5` | `pDsNQ` / `qSDZU` |
| 404 | `X9EQIz` / `zV0qI` | `Y2fsOQ` / `son4B` |
| Menú móvil abierto | — | `chQ4f` / `QpUCy` |
| Estados diagnóstico | `uUEnn` / `Vh9NI` | `Bw4IB` / `qUy14` |
| Estados aplicación | `w9Owd` / `gNda1` | `u1CDBO` / `H3cNSD` |

**Home, en orden:** Nav → Hero (listón) → Qué es muush (mapa) → Servicios →
Cómo trabajamos (acanalado) → Diagnóstico y contacto (listón) → Footer.

**Nosotros:** Hero (listón) → Cómo se arma → Dónde estamos (mapa) → Trabaja
con muush (listón, formulario de aplicación) → Footer.

**Preguntas:** por ahora solo "En construcción 🚧" con dos CTAs, sobre
acanalado. **404:** sobre acanalado.

**Comportamiento** (detalle en el README del handoff): header que se oculta al
bajar 80 px y vuelve al subir; menú móvil a pantalla completa; mapa con
pestañas América / Europa en móvil; Servicios en carrusel en móvil y en
cuadrícula de 4 desde 1024 px; línea de Cómo trabajamos que se llena con el
scroll; formularios en dos pasos en móvil; pill del hero que rota cada 2.6 s;
todo respeta `prefers-reduced-motion`.

## 4 · Copy aprobada (tal cual está en el `.pen`)

`/` marca un salto de línea del diseño. La copy de móvil que no aparece aquí
es la misma que la de escritorio, salvo lo indicado en § 4.9.

### 4.1 Nav

| ES | EN |
|---|---|
| Servicios · Nosotros · Preguntas | Services · About · FAQ |
| ES (botón de idioma) | EN |
| Diagnóstico gratis | Free assessment |

### 4.2 Hero

| ES | EN |
|---|---|
| Pill rotativo: Estrategia tecnológica · Software, web y nube · Automatización, datos e IA · Diseño de producto y UX | Technology strategy · Software, web and cloud · Automation, data and AI · Product design and UX |
| Hablamos negocio / y código. | We speak business / and code. |
| Diseñamos y construimos las soluciones digitales que tu negocio usa todos los días. | We design and build the digital solutions your business uses every day. |
| Diagnóstico gratis · Cómo trabajamos | Free assessment · How we work |

### 4.3 Qué es muush

| ES | EN |
|---|---|
| Qué es muush | Who we are |
| Un equipo base y aliados de confianza, / según lo que pida tu proyecto. | A core team and trusted partners, / shaped by what your project needs. |
| Estrategia, diseño e ingeniería trabajan juntos desde el primer día. Cuando el proyecto lo pide, sumamos aliados con el mismo estándar, estén donde estén. | Strategy, design and engineering work together from day one. When the project calls for it, we bring in partners held to the same standard, wherever they are. |
| Equipo · Aliados · Trabajamos con clientes en cualquier país. | Team · Partners · We work with clients in any country. |

### 4.4 Servicios

| ES | EN |
|---|---|
| Servicios | Services |
| Lo que hacemos / por tu negocio. | What we do / for your business. |
| **Estrategia tecnológica** — Un diagnóstico claro y un plan de qué hacer y en qué orden, antes de invertir. | **Technology strategy** — A clear diagnosis and a plan for what to do, and in what order, before you invest. |
| **Software, web y nube** — Sitios, sistemas, portales y apps, con la nube donde viven y tus herramientas conectadas. | **Software, web and cloud** — Websites, systems, portals and apps, with the cloud they run on and your tools connected. |
| **Automatización, datos e IA** — Procesos que corren solos, datos que se vuelven decisiones e IA donde sí suma. | **Automation, data and AI** — Processes that run themselves, data that turns into decisions, and AI where it truly helps. |
| **Diseño de producto y UX** — Pantallas tan claras que tu equipo las usa sin manual. | **Product design and UX** — Screens so clear your team uses them without a manual. |
| TAMBIÉN, SI LO NECESITAS · Creativo · Marketing · Contenido, foto, video, redes y anuncios con nuestros aliados. Siempre se cotiza aparte. | ALSO, IF YOU NEED IT · Creative · Marketing · Content, photo, video, social media and ads with our partners. Always quoted separately. |

### 4.5 Cómo trabajamos

| ES | EN |
|---|---|
| Cómo trabajamos | How we work |
| Primero entendemos tu operación, / después decidimos qué se construye. | First we understand how you operate, / then we decide what gets built. |
| 01 **Diagnóstico** — Una revisión rápida para ver qué conviene resolver. Si hace falta ir a fondo, se cotiza aparte. · *Te decimos qué te conviene* | 01 **Assessment** — A quick review to see what's worth solving. If it needs a deeper look, that's quoted separately. · *We tell you what fits best* |
| 02 **Propuesta** — Alcance, tiempos y costo por escrito. · *Solo lo que necesitas* | 02 **Proposal** — Scope, timeline and cost in writing. · *Only what you need* |
| 03 **Diseño** — Ves cómo va a funcionar antes de construir nada. · *Tú apruebas cada pantalla* | 03 **Design** — You see how it works before anything is built. · *You approve every screen* |
| 04 **Construcción** — Avanzamos por etapas y te mostramos cada avance. · *Un solo punto de contacto* | 04 **Build** — We work in stages and show you every step. · *One point of contact* |
| 05 **Lanzamiento y soporte** — Lo ponemos en marcha y preparamos a tu equipo. · *Todo documentado y tuyo* | 05 **Launch and support** — We launch it and get your team ready. · *Documented and all yours* |

### 4.6 Diagnóstico y contacto

| ES | EN |
|---|---|
| Primer paso | First step |
| Pide tu diagnóstico / sin costo. | Request your / free assessment. |
| Cuéntanos qué quieres resolver y te respondemos en 24 horas hábiles. | Tell us what you want to solve and we'll reply within 24 business hours. |
| LO QUE RECIBES: Una revisión de tu sitio y tus herramientas · Qué conviene hacer primero y por qué · Si hace falta ir a fondo, qué incluye y cuánto cuesta | WHAT YOU GET: A review of your website and tools · What to do first, and why · If it needs a deeper look, what's included and what it costs |
| ¿Prefieres hablar? Agenda una llamada | Prefer to talk? Book a call |
| Nombre (Nombre y apellido) · Correo (tu@correo.com) · Empresa o proyecto (Nombre de la empresa) · ¿Cómo te identificas? · ¿Qué necesitas? (Cuéntanos en un par de líneas qué quieres resolver.) · ¿Cómo prefieres que te contactemos? Correo / WhatsApp | Name (First and last name) · Email (you@email.com) · Company or project (Company name) · You are a… · What do you need? (Tell us in a couple of lines what you want to solve.) · How should we contact you? Email / WhatsApp |
| Acepto el aviso de privacidad y que muush me contacte sobre mi diagnóstico. | I accept the privacy notice and agree to be contacted by muush about my assessment. |
| Quiero mi diagnóstico | Get my assessment |
| Estados: Enviando… · Escribe tu nombre. · Escribe un correo como nombre@empresa.com · El envío se interrumpió. Tus datos siguen aquí: vuelve a intentarlo o escríbenos a support@muush.dev. · Intentar de nuevo · Recibimos tu solicitud. · Te respondemos en 24 horas hábiles por el medio que elegiste. Si prefieres adelantar, agenda una llamada. | States: Sending… · Enter your name. · Enter an email like name@company.com · Sending was interrupted. Your details are still here: try again or write to us at support@muush.dev. · Try again · We got your request. · We'll reply within 24 business hours through the channel you chose. If you'd like to move faster, book a call. |
| Móvil: Paso 1 de 2 · Tus datos · Continuar · Paso 2 de 2 · Tu negocio · ← Atrás | Mobile: extraer de `qUy14` en la feature 45 |

(El campo "Tu sitio web o redes (opcional)" del diseño no se construye, § 1.)

### 4.7 Footer

| ES | EN |
|---|---|
| muush.dev · Hablamos negocio y código. · Technology Solution Studio. | muush.dev · We speak business and code. · Technology Solution Studio. |
| NAVEGACIÓN: Servicios · Cómo trabajamos · Nosotros | NAVIGATION: Services · How we work · About |
| CONTACTO: Diagnóstico gratis · Agenda una llamada · support@muush.dev · WhatsApp | CONTACT: Free assessment · Book a call · support@muush.dev · WhatsApp |
| MUUSH: Trabaja con muush · Preguntas · Blog · próximamente | MUUSH: Work with muush · FAQ · Blog · coming soon |
| REDES: LinkedIn · Instagram · TikTok | SOCIAL: LinkedIn · Instagram · TikTok |
| © 2026 muush · Todos los derechos reservados · Aviso de privacidad · Términos y condiciones | © 2026 muush · All rights reserved · Privacy notice · Terms and conditions |

### 4.8 Nosotros

| ES | EN |
|---|---|
| Nosotros | About |
| El equipo se arma / alrededor del proyecto. | The team takes shape / around the project. |
| Reunimos al talento indicado para cada proyecto y le damos libertad de elegir en qué proyectos entra y desde dónde trabaja. Esa flexibilidad sostiene nuestro talent pool y nos permite entregar con una estructura ligera. | We bring together the right talent for each project and give them the freedom to choose which projects they join and where they work from. That flexibility sustains our talent pool and lets us deliver with a lean structure. |
| Cómo se arma · Quién entra / a tu proyecto. | How it comes together · Who joins / your project. |
| **Equipo base** · Siempre en tu proyecto · Estrategia, diseño e ingeniería, de principio a fin. | **Core team** · Always on your project · Strategy, design and engineering, from start to finish. |
| **Talent pool** · Cuando el proyecto lo pide · Especialistas que entran con el mismo estándar de entrega. | **Talent pool** · When the project calls for it · Specialists who join with the same delivery standard. |
| **Aliados** · Creativo y marketing · Estudios de confianza, coordinados por nosotros. | **Partners** · Creative and marketing · Trusted studios, coordinated by us. |
| Dónde estamos · Un talent pool que crece / por sector y por proyecto. · Todos trabajamos con las mismas reglas y el mismo estándar de entrega. | Where we are · A talent pool that grows / by industry and by project. · We all work under the same rules and the same delivery standard. |
| Trabaja con muush · Tú eliges en qué / proyectos entras. · Con quién y desde dónde, también. Si trabajas en tecnología, diseño o producción, cuéntanos qué haces y te buscamos cuando haya un proyecto para ti. | Work with muush · You choose which / projects you join. · Who you work with and where from, too. If you work in technology, design or production, tell us what you do and we'll reach out when there's a project for you. |
| ÁREAS QUE SUMAMOS: Ingeniería y desarrollo · Diseño de producto y UX · Creativo, contenido y marketing | AREAS WE BRING IN: Engineering and development · Product design and UX · Creative, content and marketing |
| Formulario: Nombre · Correo · Portafolio · Área y rol (Selecciona tu área y rol) · LinkedIn · CV (Adjunta tu CV en PDF · máximo 10 MB) · ¿Cómo prefieres que te contactemos? · Acepto el aviso de privacidad y que muush me contacte sobre mi aplicación. · Enviar aplicación | Form: Name · Email · Portfolio · Area and role (Select your area and role) · LinkedIn · CV (Attach your CV as a PDF · up to 10 MB) · How should we contact you? · I accept the privacy notice and agree to be contacted by muush about my application. · Send application |
| Estados: Elige tu área y rol. · Adjunta tu CV en PDF de hasta 10 MB. · El envío se interrumpió. Tus datos y tu CV siguen aquí: vuelve a intentarlo o escríbenos a support@muush.dev. · Recibimos tu aplicación. · Revisamos tu perfil y te escribimos cuando haya un proyecto que encaje contigo. · Volver al inicio | States: Choose your area and role. · Attach your CV as a PDF up to 10 MB. · Sending was interrupted. Your details and CV are still here: try again or write to us at support@muush.dev. · We got your application. · We'll review your profile and reach out when there's a project that fits you. · Back to home |

### 4.9 Preguntas, 404 y copy solo de móvil

| ES | EN |
|---|---|
| Preguntas: En construcción 🚧 · Diagnóstico gratis · Agenda una llamada | FAQ: Under construction 🚧 · Free assessment · Book a call |
| 404: Volvamos a un / lugar conocido. · Volver al inicio · Diagnóstico gratis | 404: Let's get you back / somewhere familiar. · Back to home · Free assessment |
| Móvil, mapa: pestañas América · Europa; leyenda extra "Estonia · pronto" | Extraer de `mJxKt` en la feature 44 |
| Móvil, footer: WhatsApp · Escríbenos → · Agenda una llamada · 30 minutos → · support@muush.dev · Correo → | Extraer de `mJxKt` en la feature 43 |

## 5 · Pendientes

- Páginas legales: diseño de Clau y texto legal (feature 48).
- Animación final de la línea de Cómo trabajamos: la define Clau con Roberto.
