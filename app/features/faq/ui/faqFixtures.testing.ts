import type { ResolvedFaqContent } from '@/features/faq/data/types'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'

/**
 * Feature 51 · what `useFaqContent` hands `FaqSection`, for the component
 * tests and the stories (which run without Nuxt, rules.md § R23). The copy
 * is the locale files' (`faq.*`, verbatim from the handoff JSON), resolved
 * the way `resolveFaqContent` resolves it; `tests/faq-copy.test.ts` and
 * `logic/useFaqContent.test.ts` hold the real files to the approved JSON.
 */
const EMAIL = {
  kind: 'email',
  text: 'support@muush.dev',
  href: 'mailto:support@muush.dev',
  trackAttrs: {
    'data-track': 'contact_click',
    'data-track-location': 'faq',
    'data-track-channel': 'email',
  },
} as const

const BUTTON_TRACK = {
  'data-track': 'book_call_click',
  'data-track-location': 'faq',
}

export const FAQ_CONTENT: Record<'es' | 'en', ResolvedFaqContent> = {
  es: {
    pill: 'Preguntas',
    heading: { first: 'Preguntas', second: 'frecuentes.' },
    subtitle: 'Respuestas claras antes de tu diagnóstico.',
    tabsLabel: 'Temas',
    topics: [
      {
        anchor: 'diagnostico',
        trackingId: 'assessment',
        number: '01',
        title: 'Diagnóstico y cómo empezar',
        questions: [
          {
            id: 'faq-t1-q1',
            number: 1,
            question: '¿Qué es el diagnóstico gratis y qué recibo?',
            answer: [
              {
                kind: 'text',
                text: 'Una revisión rápida de tu sitio y tus herramientas para ver qué conviene resolver. Te respondemos en 24 horas hábiles con tres hallazgos, el tamaño de proyecto que probablemente necesitas y el siguiente paso. Es gratis y sin compromiso.',
              },
            ],
            answerText:
              'Una revisión rápida de tu sitio y tus herramientas para ver qué conviene resolver. Te respondemos en 24 horas hábiles con tres hallazgos, el tamaño de proyecto que probablemente necesitas y el siguiente paso. Es gratis y sin compromiso.',
          },
          {
            id: 'faq-t1-q2',
            number: 2,
            question: '¿Qué no incluye el diagnóstico?',
            answer: [
              {
                kind: 'text',
                text: 'El diagnóstico te dice qué conviene hacer primero y por qué. El precio y el alcance llegan después, en la propuesta, porque dependen de lo que decidamos juntos. Trabajamos con lo que se ve desde fuera y con lo que nos cuentes, así que no necesitamos accesos a tus sistemas. Si hace falta ir a fondo, te decimos qué incluye esa revisión y cuánto cuesta.',
              },
            ],
            answerText:
              'El diagnóstico te dice qué conviene hacer primero y por qué. El precio y el alcance llegan después, en la propuesta, porque dependen de lo que decidamos juntos. Trabajamos con lo que se ve desde fuera y con lo que nos cuentes, así que no necesitamos accesos a tus sistemas. Si hace falta ir a fondo, te decimos qué incluye esa revisión y cuánto cuesta.',
          },
          {
            id: 'faq-t1-q3',
            number: 3,
            question: '¿Qué pasa después del diagnóstico?',
            answer: [
              {
                kind: 'text',
                text: 'Si quieres avanzar, agendamos una llamada de 30 minutos para entender tu operación. Después te enviamos una propuesta por escrito en 5 días hábiles, con alcance, tiempos y costo. El proyecto arranca cuando firmamos el contrato y el acuerdo de confidencialidad, y recibimos el anticipo.',
              },
            ],
            answerText:
              'Si quieres avanzar, agendamos una llamada de 30 minutos para entender tu operación. Después te enviamos una propuesta por escrito en 5 días hábiles, con alcance, tiempos y costo. El proyecto arranca cuando firmamos el contrato y el acuerdo de confidencialidad, y recibimos el anticipo.',
          },
          {
            id: 'faq-t1-q4',
            number: 4,
            question:
              '¿Necesito saber de tecnología para trabajar con ustedes?',
            answer: [
              {
                kind: 'text',
                text: 'No. Tú nos cuentas cómo opera tu negocio y nosotros lo traducimos a la solución técnica. Te explicamos cada decisión en palabras claras y tú apruebas cada pantalla.',
              },
            ],
            answerText:
              'No. Tú nos cuentas cómo opera tu negocio y nosotros lo traducimos a la solución técnica. Te explicamos cada decisión en palabras claras y tú apruebas cada pantalla.',
          },
          {
            id: 'faq-t1-q5',
            number: 5,
            question: '¿Con qué tipo de negocios trabajan?',
            answer: [
              {
                kind: 'text',
                text: 'Nos enfocamos en resolver lo que tu negocio necesita, venga del sector que venga. Trabajamos con empresas, inmobiliarias, hoteles, escuelas, distribuidores, startups, emprendedores y marcas personales, y con cualquier negocio que tenga un proceso que quiera resolver o mejorar con tecnología.',
              },
            ],
            answerText:
              'Nos enfocamos en resolver lo que tu negocio necesita, venga del sector que venga. Trabajamos con empresas, inmobiliarias, hoteles, escuelas, distribuidores, startups, emprendedores y marcas personales, y con cualquier negocio que tenga un proceso que quiera resolver o mejorar con tecnología.',
          },
        ],
      },
      {
        anchor: 'precios',
        trackingId: 'pricing',
        number: '02',
        title: 'Precios y pagos',
        questions: [
          {
            id: 'faq-t2-q6',
            number: 6,
            question: '¿Cuánto cuesta un proyecto?',
            answer: [
              {
                kind: 'text',
                text: 'Depende de lo que tu negocio necesita. No vendemos paquetes fijos: cotizamos solo lo que necesitas. Si algo técnico requiere un servicio que no tenías pensado, te lo sugerimos con sus pros y contras, y tú decides. El costo va por escrito en la propuesta, antes de empezar.',
              },
            ],
            answerText:
              'Depende de lo que tu negocio necesita. No vendemos paquetes fijos: cotizamos solo lo que necesitas. Si algo técnico requiere un servicio que no tenías pensado, te lo sugerimos con sus pros y contras, y tú decides. El costo va por escrito en la propuesta, antes de empezar.',
          },
          {
            id: 'faq-t2-q7',
            number: 7,
            question: '¿Cómo se paga un proyecto?',
            answer: [
              {
                kind: 'text',
                text: 'Con un anticipo al arrancar y el resto según lo que acordemos en la propuesta.',
              },
            ],
            answerText:
              'Con un anticipo al arrancar y el resto según lo que acordemos en la propuesta.',
          },
          {
            id: 'faq-t2-q8',
            number: 8,
            question: '¿Qué pasa si mi presupuesto no alcanza?',
            answer: [
              {
                kind: 'text',
                text: 'Ajustamos el alcance y cuidamos la calidad. Podemos empezar por lo que más impacto tiene y dividir el proyecto en fases, para que avances sin pagarlo todo de una vez.',
              },
            ],
            answerText:
              'Ajustamos el alcance y cuidamos la calidad. Podemos empezar por lo que más impacto tiene y dividir el proyecto en fases, para que avances sin pagarlo todo de una vez.',
          },
          {
            id: 'faq-t2-q9',
            number: 9,
            question: '¿Qué costos van aparte?',
            answer: [
              {
                kind: 'text',
                text: 'El hosting, el dominio, las licencias y el uso de herramientas de IA o de automatización los contratas tú directamente, para que las cuentas siempre sean tuyas. Si incluyes marketing, la pauta también se paga directo a las plataformas, con un presupuesto que acordamos juntos. Todo esto aparece en la propuesta.',
              },
            ],
            answerText:
              'El hosting, el dominio, las licencias y el uso de herramientas de IA o de automatización los contratas tú directamente, para que las cuentas siempre sean tuyas. Si incluyes marketing, la pauta también se paga directo a las plataformas, con un presupuesto que acordamos juntos. Todo esto aparece en la propuesta.',
          },
          {
            id: 'faq-t2-q10',
            number: 10,
            question: '¿Qué servicios se cotizan aparte?',
            answer: [
              {
                kind: 'text',
                text: 'El soporte después del lanzamiento, el contenido creativo (foto, video y piezas gráficas) y el marketing. Son opcionales: los sumas solo si tu negocio los necesita, y cada uno se cotiza por separado del proyecto.',
              },
            ],
            answerText:
              'El soporte después del lanzamiento, el contenido creativo (foto, video y piezas gráficas) y el marketing. Son opcionales: los sumas solo si tu negocio los necesita, y cada uno se cotiza por separado del proyecto.',
          },
        ],
      },
      {
        anchor: 'proceso',
        trackingId: 'process',
        number: '03',
        title: 'Proceso y tiempos',
        questions: [
          {
            id: 'faq-t3-q11',
            number: 11,
            question: '¿Cuánto tarda un proyecto?',
            answer: [
              {
                kind: 'text',
                text: 'Depende del alcance. El tiempo de cada etapa va por escrito en la propuesta, y si algo lo mueve, te avisamos con anticipación.',
              },
            ],
            answerText:
              'Depende del alcance. El tiempo de cada etapa va por escrito en la propuesta, y si algo lo mueve, te avisamos con anticipación.',
          },
          {
            id: 'faq-t3-q12',
            number: 12,
            question: '¿Cómo sé cómo va mi proyecto?',
            answer: [
              {
                kind: 'text',
                text: 'Nuestro equipo te acompaña de principio a fin. Un project manager lleva tu proyecto día a día y es tu punto de contacto para avances, entregas y dudas. Un account manager te asesora desde el diagnóstico y la propuesta, y cuida tu cuenta cuando necesites algo nuevo. Trabajamos por etapas, en cada una ves el avance, y nada pasa a la siguiente sin tu aprobación.',
              },
            ],
            answerText:
              'Nuestro equipo te acompaña de principio a fin. Un project manager lleva tu proyecto día a día y es tu punto de contacto para avances, entregas y dudas. Un account manager te asesora desde el diagnóstico y la propuesta, y cuida tu cuenta cuando necesites algo nuevo. Trabajamos por etapas, en cada una ves el avance, y nada pasa a la siguiente sin tu aprobación.',
          },
          {
            id: 'faq-t3-q13',
            number: 13,
            question: '¿Puedo pedir cambios a mitad del proyecto?',
            answer: [
              {
                kind: 'text',
                text: 'Sí. Por eso apruebas cada pantalla antes de construirla: al principio, los cambios cuestan menos. Si un cambio sale del alcance acordado, te decimos cuánto suma en tiempo y costo antes de hacerlo, y tú decides.',
              },
            ],
            answerText:
              'Sí. Por eso apruebas cada pantalla antes de construirla: al principio, los cambios cuestan menos. Si un cambio sale del alcance acordado, te decimos cuánto suma en tiempo y costo antes de hacerlo, y tú decides.',
          },
          {
            id: 'faq-t3-q14',
            number: 14,
            question: '¿Trabajan con clientes fuera de su ciudad o de México?',
            answer: [
              {
                kind: 'text',
                text: 'Sí. Trabajamos de forma remota con clientes en cualquier país, con un equipo en México, Estados Unidos y Europa. Facturamos y cotizamos en la moneda que acordemos.',
              },
            ],
            answerText:
              'Sí. Trabajamos de forma remota con clientes en cualquier país, con un equipo en México, Estados Unidos y Europa. Facturamos y cotizamos en la moneda que acordemos.',
          },
        ],
      },
      {
        anchor: 'entrega',
        trackingId: 'delivery',
        number: '04',
        title: 'Entrega, propiedad y soporte',
        questions: [
          {
            id: 'faq-t4-q15',
            number: 15,
            question: '¿De quién es lo que construyen?',
            answer: [
              {
                kind: 'text',
                text: 'Tuyo. Te entregamos todo documentado, y las cuentas donde vive tu sistema están a tu nombre desde el inicio, para que nunca dependas de una sola persona.',
              },
            ],
            answerText:
              'Tuyo. Te entregamos todo documentado, y las cuentas donde vive tu sistema están a tu nombre desde el inicio, para que nunca dependas de una sola persona.',
          },
          {
            id: 'faq-t4-q16',
            number: 16,
            question: '¿Qué pasa después del lanzamiento?',
            answer: [
              {
                kind: 'text',
                text: 'Lanzamos contigo y capacitamos a tu equipo para usarlo. Si quieres que sigamos cuidándolo, el soporte se cotiza aparte.',
              },
            ],
            answerText:
              'Lanzamos contigo y capacitamos a tu equipo para usarlo. Si quieres que sigamos cuidándolo, el soporte se cotiza aparte.',
          },
          {
            id: 'faq-t4-q17',
            number: 17,
            question:
              '¿Firman acuerdo de confidencialidad? ¿Cómo cuidan mi información?',
            answer: [
              {
                kind: 'text',
                text: 'Sí. Firmamos un acuerdo de confidencialidad antes de que compartas información interna. Entramos a tus sistemas solo con el acceso necesario, y tratamos tus datos como lo explica nuestro ',
              },
              {
                kind: 'link',
                text: 'Aviso de privacidad',
                href: '/es/privacidad',
              },
              { kind: 'text', text: '.' },
            ],
            answerText:
              'Sí. Firmamos un acuerdo de confidencialidad antes de que compartas información interna. Entramos a tus sistemas solo con el acceso necesario, y tratamos tus datos como lo explica nuestro Aviso de privacidad.',
          },
        ],
      },
      {
        anchor: 'trabaja-con-muush',
        trackingId: 'work_with_muush',
        number: '05',
        title: 'Trabaja con muush',
        questions: [
          {
            id: 'faq-t5-q18',
            number: 18,
            question: '¿Cómo me sumo al talent pool?',
            answer: [
              { kind: 'text', text: 'Llena el formulario de la página ' },
              {
                kind: 'link',
                text: 'Nosotros',
                href: '/es/nosotros#trabaja-con-muush',
              },
              {
                kind: 'text',
                text: ' con tu área, tu portafolio y tu CV. Revisamos tu perfil y te sumamos al talent pool por sector y por proyecto.',
              },
            ],
            answerText:
              'Llena el formulario de la página Nosotros con tu área, tu portafolio y tu CV. Revisamos tu perfil y te sumamos al talent pool por sector y por proyecto.',
          },
          {
            id: 'faq-t5-q19',
            number: 19,
            question: '¿Cuándo me van a contactar?',
            answer: [
              {
                kind: 'text',
                text: 'Cuando haya un proyecto que encaje contigo; la fecha depende de los proyectos que entren. Guardamos tu CV durante un año. Si quieres que lo borremos antes, escríbenos a ',
              },
              EMAIL,
              { kind: 'text', text: '.' },
            ],
            answerText:
              'Cuando haya un proyecto que encaje contigo; la fecha depende de los proyectos que entren. Guardamos tu CV durante un año. Si quieres que lo borremos antes, escríbenos a support@muush.dev.',
          },
          {
            id: 'faq-t5-q20',
            number: 20,
            question:
              '¿Tengo que trabajar de tiempo completo o desde un lugar fijo?',
            answer: [
              {
                kind: 'text',
                text: 'No. Tú eliges en qué proyectos entras, con quién y desde dónde. Todos trabajamos con las mismas reglas y el mismo estándar de entrega.',
              },
            ],
            answerText:
              'No. Tú eliges en qué proyectos entras, con quién y desde dónde. Todos trabajamos con las mismas reglas y el mismo estándar de entrega.',
          },
        ],
      },
    ],
    card: {
      title: '¿Tienes otra pregunta?',
      text: [
        { kind: 'text', text: 'Escríbenos a ' },
        EMAIL,
        { kind: 'text', text: ' o agenda una llamada de 30 minutos.' },
      ],
      button: {
        label: 'Agenda una llamada',
        href: CALL_BOOKING_URL,
        trackAttrs: BUTTON_TRACK,
      },
    },
  },
  en: {
    pill: 'FAQ',
    heading: { first: 'Frequently asked', second: 'questions.' },
    subtitle: 'Clear answers before your assessment.',
    tabsLabel: 'Topics',
    topics: [
      {
        anchor: 'assessment',
        trackingId: 'assessment',
        number: '01',
        title: 'Assessment and getting started',
        questions: [
          {
            id: 'faq-t1-q1',
            number: 1,
            question: 'What is the free assessment and what do I get?',
            answer: [
              {
                kind: 'text',
                text: "A quick review of your website and tools to see what's worth solving. Within 24 business hours we send you three findings, the size of project you most likely need and the next step. It's free, with no commitment.",
              },
            ],
            answerText:
              "A quick review of your website and tools to see what's worth solving. Within 24 business hours we send you three findings, the size of project you most likely need and the next step. It's free, with no commitment.",
          },
          {
            id: 'faq-t1-q2',
            number: 2,
            question: 'What does the assessment not include?',
            answer: [
              {
                kind: 'text',
                text: "The assessment tells you what to do first and why. Price and scope come later, in the proposal, because they depend on what we decide together. We work with what's visible from the outside and what you tell us, so we don't need access to your systems. If a deeper review is needed, we tell you what it includes and what it costs.",
              },
            ],
            answerText:
              "The assessment tells you what to do first and why. Price and scope come later, in the proposal, because they depend on what we decide together. We work with what's visible from the outside and what you tell us, so we don't need access to your systems. If a deeper review is needed, we tell you what it includes and what it costs.",
          },
          {
            id: 'faq-t1-q3',
            number: 3,
            question: 'What happens after the assessment?',
            answer: [
              {
                kind: 'text',
                text: 'If you want to move forward, we book a 30-minute call to understand how you operate. Then we send you a written proposal within 5 business days, with scope, timeline and cost. The project starts once we sign the contract and the confidentiality agreement, and receive the deposit.',
              },
            ],
            answerText:
              'If you want to move forward, we book a 30-minute call to understand how you operate. Then we send you a written proposal within 5 business days, with scope, timeline and cost. The project starts once we sign the contract and the confidentiality agreement, and receive the deposit.',
          },
          {
            id: 'faq-t1-q4',
            number: 4,
            question: 'Do I need to know about technology to work with you?',
            answer: [
              {
                kind: 'text',
                text: 'No. You tell us how your business works and we translate it into the technical solution. We explain every decision in plain words, and you approve every screen.',
              },
            ],
            answerText:
              'No. You tell us how your business works and we translate it into the technical solution. We explain every decision in plain words, and you approve every screen.',
          },
          {
            id: 'faq-t1-q5',
            number: 5,
            question: 'What kind of businesses do you work with?',
            answer: [
              {
                kind: 'text',
                text: 'We focus on solving what your business needs, whatever industry it comes from. We work with companies, real estate firms, hotels, schools, distributors, startups, entrepreneurs and personal brands, and with any business that has a process it wants to solve or improve with technology.',
              },
            ],
            answerText:
              'We focus on solving what your business needs, whatever industry it comes from. We work with companies, real estate firms, hotels, schools, distributors, startups, entrepreneurs and personal brands, and with any business that has a process it wants to solve or improve with technology.',
          },
        ],
      },
      {
        anchor: 'pricing',
        trackingId: 'pricing',
        number: '02',
        title: 'Pricing and payments',
        questions: [
          {
            id: 'faq-t2-q6',
            number: 6,
            question: 'How much does a project cost?',
            answer: [
              {
                kind: 'text',
                text: "It depends on what your business needs. We don't sell fixed packages: we quote only what you need. If something technical requires a service you hadn't planned for, we suggest it with its pros and cons, and you decide. The cost is in writing in the proposal, before we start.",
              },
            ],
            answerText:
              "It depends on what your business needs. We don't sell fixed packages: we quote only what you need. If something technical requires a service you hadn't planned for, we suggest it with its pros and cons, and you decide. The cost is in writing in the proposal, before we start.",
          },
          {
            id: 'faq-t2-q7',
            number: 7,
            question: 'How do I pay for a project?',
            answer: [
              {
                kind: 'text',
                text: 'With a deposit to get started and the rest as agreed in the proposal.',
              },
            ],
            answerText:
              'With a deposit to get started and the rest as agreed in the proposal.',
          },
          {
            id: 'faq-t2-q8',
            number: 8,
            question: "What if my budget doesn't cover everything?",
            answer: [
              {
                kind: 'text',
                text: 'We adjust the scope and protect the quality. We can start with what has the most impact and split the project into phases, so you move forward without paying for everything at once.',
              },
            ],
            answerText:
              'We adjust the scope and protect the quality. We can start with what has the most impact and split the project into phases, so you move forward without paying for everything at once.',
          },
          {
            id: 'faq-t2-q9',
            number: 9,
            question: 'Which costs are separate?',
            answer: [
              {
                kind: 'text',
                text: 'Hosting, your domain, licenses and the usage of AI or automation tools are contracted directly by you, so the accounts are always yours. If you add marketing, ad spend is also paid directly to the platforms, with a budget we agree on together. All of this is listed in the proposal.',
              },
            ],
            answerText:
              'Hosting, your domain, licenses and the usage of AI or automation tools are contracted directly by you, so the accounts are always yours. If you add marketing, ad spend is also paid directly to the platforms, with a budget we agree on together. All of this is listed in the proposal.',
          },
          {
            id: 'faq-t2-q10',
            number: 10,
            question: 'Which services are quoted separately?',
            answer: [
              {
                kind: 'text',
                text: "Support after launch, creative content (photo, video and graphic pieces) and marketing. They're optional: you add them only if your business needs them, and each one is quoted separately from the project.",
              },
            ],
            answerText:
              "Support after launch, creative content (photo, video and graphic pieces) and marketing. They're optional: you add them only if your business needs them, and each one is quoted separately from the project.",
          },
        ],
      },
      {
        anchor: 'process',
        trackingId: 'process',
        number: '03',
        title: 'Process and timeline',
        questions: [
          {
            id: 'faq-t3-q11',
            number: 11,
            question: 'How long does a project take?',
            answer: [
              {
                kind: 'text',
                text: 'It depends on the scope. The timeline for each stage is in writing in the proposal, and if anything changes it, we let you know in advance.',
              },
            ],
            answerText:
              'It depends on the scope. The timeline for each stage is in writing in the proposal, and if anything changes it, we let you know in advance.',
          },
          {
            id: 'faq-t3-q12',
            number: 12,
            question: 'How do I know how my project is going?',
            answer: [
              {
                kind: 'text',
                text: 'Our team is with you from start to finish. A project manager runs your project day to day and is your point of contact for progress, deliveries and questions. An account manager advises you from the assessment and proposal onward, and looks after your account whenever you need something new. We work in stages, you see the progress in each one, and nothing moves forward without your approval.',
              },
            ],
            answerText:
              'Our team is with you from start to finish. A project manager runs your project day to day and is your point of contact for progress, deliveries and questions. An account manager advises you from the assessment and proposal onward, and looks after your account whenever you need something new. We work in stages, you see the progress in each one, and nothing moves forward without your approval.',
          },
          {
            id: 'faq-t3-q13',
            number: 13,
            question: 'Can I ask for changes during the project?',
            answer: [
              {
                kind: 'text',
                text: "Yes. That's why you approve every screen before we build it: early on, changes cost less. If a change goes beyond the agreed scope, we tell you how much time and cost it adds before doing it, and you decide.",
              },
            ],
            answerText:
              "Yes. That's why you approve every screen before we build it: early on, changes cost less. If a change goes beyond the agreed scope, we tell you how much time and cost it adds before doing it, and you decide.",
          },
          {
            id: 'faq-t3-q14',
            number: 14,
            question: 'Do you work with clients outside your city or Mexico?',
            answer: [
              {
                kind: 'text',
                text: 'Yes. We work remotely with clients in any country, with a team in Mexico, the United States and Europe. We invoice and quote in the currency we agree on.',
              },
            ],
            answerText:
              'Yes. We work remotely with clients in any country, with a team in Mexico, the United States and Europe. We invoice and quote in the currency we agree on.',
          },
        ],
      },
      {
        anchor: 'delivery',
        trackingId: 'delivery',
        number: '04',
        title: 'Delivery, ownership and support',
        questions: [
          {
            id: 'faq-t4-q15',
            number: 15,
            question: 'Who owns what you build?',
            answer: [
              {
                kind: 'text',
                text: 'You do. We hand everything over documented, and the accounts your system runs on are in your name from day one, so you never depend on a single person.',
              },
            ],
            answerText:
              'You do. We hand everything over documented, and the accounts your system runs on are in your name from day one, so you never depend on a single person.',
          },
          {
            id: 'faq-t4-q16',
            number: 16,
            question: 'What happens after launch?',
            answer: [
              {
                kind: 'text',
                text: 'We launch with you and train your team to use it. If you want us to keep taking care of it, support is quoted separately.',
              },
            ],
            answerText:
              'We launch with you and train your team to use it. If you want us to keep taking care of it, support is quoted separately.',
          },
          {
            id: 'faq-t4-q17',
            number: 17,
            question:
              'Do you sign a confidentiality agreement? How do you protect my information?',
            answer: [
              {
                kind: 'text',
                text: 'Yes. We sign a confidentiality agreement before you share any internal information. We access your systems with only the access we need, and we handle your data as described in our ',
              },
              { kind: 'link', text: 'Privacy notice', href: '/en/privacy' },
              { kind: 'text', text: '.' },
            ],
            answerText:
              'Yes. We sign a confidentiality agreement before you share any internal information. We access your systems with only the access we need, and we handle your data as described in our Privacy notice.',
          },
        ],
      },
      {
        anchor: 'work-with-muush',
        trackingId: 'work_with_muush',
        number: '05',
        title: 'Work with muush',
        questions: [
          {
            id: 'faq-t5-q18',
            number: 18,
            question: 'How do I join the talent pool?',
            answer: [
              { kind: 'text', text: 'Fill out the form on the ' },
              {
                kind: 'link',
                text: 'About',
                href: '/en/about#trabaja-con-muush',
              },
              {
                kind: 'text',
                text: ' page with your area, portfolio and CV. We review your profile and add you to the talent pool by industry and by project.',
              },
            ],
            answerText:
              'Fill out the form on the About page with your area, portfolio and CV. We review your profile and add you to the talent pool by industry and by project.',
          },
          {
            id: 'faq-t5-q19',
            number: 19,
            question: 'When will you contact me?',
            answer: [
              {
                kind: 'text',
                text: "When there's a project that fits you; the timing depends on the projects that come in. We keep your CV for one year. If you'd like us to delete it sooner, write to ",
              },
              EMAIL,
              { kind: 'text', text: '.' },
            ],
            answerText:
              "When there's a project that fits you; the timing depends on the projects that come in. We keep your CV for one year. If you'd like us to delete it sooner, write to support@muush.dev.",
          },
          {
            id: 'faq-t5-q20',
            number: 20,
            question: 'Do I have to work full time or from a set location?',
            answer: [
              {
                kind: 'text',
                text: 'No. You choose which projects you join, who you work with and where you work from. We all work by the same rules and the same delivery standard.',
              },
            ],
            answerText:
              'No. You choose which projects you join, who you work with and where you work from. We all work by the same rules and the same delivery standard.',
          },
        ],
      },
    ],
    card: {
      title: 'Have another question?',
      text: [
        { kind: 'text', text: 'Write to ' },
        EMAIL,
        { kind: 'text', text: ' or book a 30-minute call.' },
      ],
      button: {
        label: 'Book a call',
        href: CALL_BOOKING_URL,
        trackAttrs: BUTTON_TRACK,
      },
    },
  },
}
