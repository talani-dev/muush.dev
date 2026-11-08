import type { CookieConsentCopy } from '@/features/legal/data/cookieCategories'
import type { LegalPageContent } from '@/features/legal/data/types'

/**
 * Test and Storybook fixtures for the legal module (feature 48): every
 * string resolved as `resolveLegalPage` / `useCookieConsentContent` resolve
 * it, from the locale files. Generated, never edited by hand:
 * `logic/resolveLegalPage.test.ts` (the pages) and `tests/legal-copy.test.ts`
 * (the consent copy) fail if a locale string changes and this file does
 * not. Not collected by Vitest (`*.test.ts` only) and imported by no
 * application code. It lives in `data/`, not `ui/`, so a `logic/` test may
 * import it without running against Article II's direction.
 */
export type LegalFixtureLocale = 'es' | 'en'

export const LEGAL_PAGES: Record<
  'privacy' | 'terms',
  Record<LegalFixtureLocale, LegalPageContent>
> = {
  privacy: {
    es: {
      headingFirst: 'Aviso de',
      headingSecond: 'privacidad.',
      updated: 'Última actualización: 7 de noviembre de 2026',
      onThisPage: 'En esta página',
      sections: [
        {
          id: 'controller',
          nav: 'Quién es responsable de tus datos',
          title: 'Quién es responsable de tus datos',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Roberto Mirón Nájera, persona física que opera bajo el nombre comercial muush ("muush" o "nosotros"), con domicilio en Del Puente #11, San Bartolo Ameyalco, Álvaro Obregón, C.P. 01800, Ciudad de México, México, es responsable del tratamiento de tus datos personales. Para cualquier tema de privacidad, escríbenos a support@muush.dev.',
            },
          ],
        },
        {
          id: 'data',
          nav: 'Qué datos recabamos',
          title: 'Qué datos recabamos',
          blocks: [
            {
              kind: 'table',
              rows: [
                {
                  where: 'Formulario de diagnóstico',
                  data: 'Nombre, correo, empresa o proyecto, cómo te identificas, tu sitio web o redes, qué necesitas, medio de contacto preferido y, si eliges WhatsApp, tu número.',
                },
                {
                  where: 'Formulario Trabaja con muush',
                  data: 'Nombre, correo, área y rol, enlace a tu portafolio, enlace a LinkedIn, CV en PDF, medio de contacto preferido y, si eliges WhatsApp, tu número.',
                },
                {
                  where: 'Al agendar una llamada',
                  data: 'Nombre, correo y el horario que elijas, a través de Cal.com.',
                },
                {
                  where: 'Al navegar el sitio',
                  data: 'Dirección IP, navegador, páginas visitadas, identificadores de cookies y acciones dentro del sitio.',
                },
              ],
            },
            {
              kind: 'paragraph',
              text: 'No te pedimos datos personales sensibles. Un CV puede incluirlos sin que los pidamos, por ejemplo estado de salud, creencias religiosas o afiliación sindical. Te pedimos no incluirlos. Si vienen en tu CV, los tratamos solo para evaluar tu perfil y con tu consentimiento expreso, que das al marcar la casilla del formulario.',
            },
          ],
        },
        {
          id: 'purposes',
          nav: 'Para qué los usamos',
          title: 'Para qué los usamos',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Usamos tus datos para estas finalidades, necesarias para atender lo que nos pediste:',
            },
            {
              kind: 'bullets',
              items: [
                'Si pediste un diagnóstico: responder a tu solicitud, contactarte por el medio que elegiste, preparar tu diagnóstico y una propuesta y, si trabajamos juntos, administrar la relación comercial y facturar.',
                'Si aplicaste a Trabaja con muush: evaluar tu perfil con tu consentimiento expreso, contactarte para una entrevista e invitarte a proyectos que encajen contigo durante el tiempo que conservamos tu CV.',
                'En ambos casos: enviarte el correo automático que confirma que recibimos tu información.',
              ],
            },
            {
              kind: 'paragraph',
              text: 'También usamos tus datos para dos finalidades adicionales, que no son necesarias para atender tu solicitud y que solo aplican si las aceptas en el aviso de cookies:',
            },
            {
              kind: 'bullets',
              items: [
                'Medir el uso del sitio: usamos Google Analytics para saber cuántas personas nos visitan, cómo llegan, qué secciones leen y en qué paso de los formularios se detienen. No le enviamos tu nombre, tu correo, tu teléfono ni lo que escribes en los formularios.',
                'Medir y mostrar publicidad: usamos Meta Pixel para saber cómo funcionan nuestros anuncios y mostrar anuncios de muush a personas que visitaron el sitio. Si pides un diagnóstico, también le enviamos a Meta tu correo y, si elegiste WhatsApp, tu teléfono, para saber si tu solicitud llegó por un anuncio. Antes de salir de tu navegador, el píxel los convierte en un código irreversible (hash), así que Meta no recibe el dato tal cual.',
              ],
            },
            {
              kind: 'paragraph',
              text: 'Puedes oponerte a estas finalidades en cualquier momento, como se explica en Cookies y píxeles. Fuera del correo y el teléfono que se mencionan arriba, no usamos para medición ni publicidad lo que escribes en los formularios, y nunca tu CV ni tu aplicación a Trabaja con muush.',
            },
          ],
        },
        {
          id: 'sharing',
          nav: 'Con quién los compartimos',
          title: 'Con quién los compartimos',
          blocks: [
            {
              kind: 'paragraph',
              text: 'No vendemos tus datos. Solo los compartimos con:',
            },
            {
              kind: 'bullets',
              items: [
                'Los proveedores que nos ayudan a operar: Amazon Web Services (alojamiento del sitio), Amazon SES (envío de correos), Google Drive (almacenamiento de CV), Notion (registro de solicitudes y aplicaciones) y Cal.com (agenda de llamadas). Tratan tus datos por cuenta nuestra, con nuestras instrucciones y bajo confidencialidad. Algunos tienen sus servidores fuera de México.',
                'Meta Platforms, que recibe datos de navegación a través de su píxel para medir y mostrar anuncios y, si aceptaste la publicidad y pides un diagnóstico, tu correo y tu teléfono convertidos en hash.',
                'Google, que recibe datos de navegación a través de Google Analytics para medir el uso del sitio, solo si aceptaste la analítica.',
                'Los colaboradores de muush que participen en tu proyecto, solo con los datos necesarios y bajo acuerdo de confidencialidad. Algunos pueden estar fuera de México.',
                'Las autoridades, cuando una ley nos lo exija.',
              ],
            },
            {
              kind: 'paragraph',
              text: 'Tu perfil y tu CV del talent pool se quedan en muush: no los compartimos con aliados ni con otras empresas.',
            },
            {
              kind: 'paragraph',
              text: 'Salvo lo que se indica sobre Meta y Google, no hacemos transferencias de datos que requieran tu consentimiento.',
            },
          ],
        },
        {
          id: 'retention',
          nav: 'Cuánto tiempo los guardamos',
          title: 'Cuánto tiempo los guardamos',
          blocks: [
            {
              kind: 'bullets',
              items: [
                'Tu CV y tu perfil del talent pool: 1 año desde que los recibimos. Al terminar ese plazo los borramos.',
                'Solicitudes de diagnóstico que no avanzan: 12 meses desde el último contacto.',
                'Clientes: mientras dure la relación y después, el plazo que piden las leyes fiscales.',
                'Datos de navegación, de analítica y de píxeles: hasta 14 meses.',
              ],
            },
            {
              kind: 'paragraph',
              text: 'Puedes pedirnos que los borremos antes en cualquier momento.',
            },
          ],
        },
        {
          id: 'rights',
          nav: 'Tus derechos ARCO',
          title: 'Tus derechos ARCO',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Tienes derecho a acceder a tus datos, rectificarlos o actualizarlos, cancelarlos u oponerte a su uso. También puedes oponerte a decisiones tomadas solo de forma automatizada; hoy no tomamos ninguna así.',
            },
            {
              kind: 'paragraph',
              text: 'Para ejercerlos, escribe a support@muush.dev con el asunto "Derechos ARCO" e incluye:',
            },
            {
              kind: 'steps',
              items: [
                'Tu nombre y el correo donde quieres recibir la respuesta.',
                'Una copia de tu identificación oficial. Si te representa alguien, también su identificación y el documento que lo acredita.',
                'Qué datos son y qué derecho quieres ejercer. Si es una rectificación, el dato correcto.',
                'Cualquier documento que nos ayude a ubicar tus datos.',
              ],
            },
            {
              kind: 'paragraph',
              text: 'Te respondemos en un máximo de 20 días hábiles. Si tu solicitud procede, la hacemos efectiva dentro de los 15 días hábiles siguientes. Es gratuito.',
            },
          ],
        },
        {
          id: 'withdrawal',
          nav: 'Revocar tu consentimiento',
          title: 'Cómo revocar tu consentimiento o limitar el uso de tus datos',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Escríbenos a support@muush.dev con el asunto "Revocación de consentimiento" o "Limitar uso de mis datos", con los mismos datos que para los derechos ARCO. Ten en cuenta que, sin tus datos, quizá no podamos seguir atendiendo tu solicitud o tu aplicación.',
            },
          ],
        },
        {
          id: 'cookies',
          nav: 'Cookies y píxeles',
          title: 'Cookies y píxeles',
          blocks: [
            {
              kind: 'paragraph',
              text: 'muush.dev usa cookies técnicas necesarias para que el sitio funcione, por ejemplo para recordar tu idioma y tu elección de cookies. Las demás se dividen en dos categorías que aceptas por separado: Analítica, con Google Analytics, para medir visitas (cookies _ga y _ga_*, que duran hasta 14 meses), y Publicidad, con Meta Pixel, para medir y mostrar anuncios (cookie _fbp, que dura 90 días). Estas tecnologías recaban tu dirección IP, navegador, páginas visitadas e identificadores de cookies.',
            },
            {
              kind: 'paragraph',
              text: 'Puedes aceptarlas o rechazarlas en el aviso de cookies del sitio y cambiar tu elección aquí en cualquier momento. Tu elección dura 12 meses; después te la volvemos a pedir. Si retiras tu permiso, dejamos de usarlas y borramos sus cookies de muush.dev. También puedes desactivarlas desde la configuración de tu navegador o en las preferencias de anuncios de tu cuenta de Meta.',
            },
            {
              kind: 'preferences',
              label: 'Cambiar mis preferencias',
            },
          ],
        },
        {
          id: 'changes',
          nav: 'Cambios a este aviso',
          title: 'Cambios a este aviso',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Publicamos cualquier cambio en esta página, con su fecha de actualización arriba. Si un cambio requiere tu consentimiento, te lo pedimos por correo.',
            },
          ],
        },
        {
          id: 'authority',
          nav: 'Autoridad',
          title: 'Autoridad',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Si crees que tu derecho a la protección de datos fue vulnerado, puedes acudir a la Secretaría Anticorrupción y Buen Gobierno, la autoridad en la materia desde marzo de 2025.',
            },
          ],
        },
      ],
    },
    en: {
      headingFirst: 'Privacy',
      headingSecond: 'notice.',
      updated: 'Last updated: November 7, 2026',
      translationNote:
        'Courtesy translation. If it differs from the Spanish version, the Spanish version prevails.',
      onThisPage: 'On this page',
      sections: [
        {
          id: 'controller',
          nav: 'Who is responsible for your data',
          title: 'Who is responsible for your data',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Roberto Mirón Nájera, an individual operating under the trade name muush ("muush" or "we"), located at Del Puente #11, San Bartolo Ameyalco, Álvaro Obregón, 01800, Mexico City, Mexico, is responsible for processing your personal data. For any privacy matter, write to support@muush.dev.',
            },
          ],
        },
        {
          id: 'data',
          nav: 'What data we collect',
          title: 'What data we collect',
          blocks: [
            {
              kind: 'table',
              rows: [
                {
                  where: 'Assessment form',
                  data: 'Name, email, company or project, how you identify, your website or social media, what you need, preferred contact method and, if you choose WhatsApp, your number.',
                },
                {
                  where: 'Work with muush form',
                  data: 'Name, email, area and role, portfolio link, LinkedIn link, CV in PDF, preferred contact method and, if you choose WhatsApp, your number.',
                },
                {
                  where: 'When you book a call',
                  data: 'Name, email and the time you choose, through Cal.com.',
                },
                {
                  where: 'While browsing the site',
                  data: 'IP address, browser, pages visited, cookie identifiers and actions on the site.',
                },
              ],
            },
            {
              kind: 'paragraph',
              text: "We don't ask for sensitive personal data. A CV may include it without us asking, such as health status, religious beliefs or union membership. Please leave it out. If your CV includes it, we use it only to evaluate your profile and with your express consent, which you give by ticking the box on the form.",
            },
          ],
        },
        {
          id: 'purposes',
          nav: 'What we use it for',
          title: 'What we use it for',
          blocks: [
            {
              kind: 'paragraph',
              text: 'We use your data for these purposes, which we need to handle what you asked for:',
            },
            {
              kind: 'bullets',
              items: [
                'If you requested an assessment: to answer your request, contact you the way you chose, prepare your assessment and a proposal and, if we work together, manage the business relationship and invoicing.',
                'If you applied through Work with muush: to evaluate your profile with your express consent, contact you for an interview and invite you to projects that fit for as long as we keep your CV.',
                'In both cases: to send you the automatic email confirming we received your information.',
              ],
            },
            {
              kind: 'paragraph',
              text: "We also use your data for two additional purposes, which we don't need to handle your request and which only apply if you accept them in the cookie notice:",
            },
            {
              kind: 'bullets',
              items: [
                "Measuring how the site is used: we use Google Analytics to see how many people visit, how they find us, which sections they read and at which step of the forms they stop. We don't send it your name, email, phone or anything you write in the forms.",
                'Measuring and showing advertising: we use Meta Pixel to see how our ads perform and to show muush ads to people who visited the site. If you request an assessment, we also send Meta your email and, if you chose WhatsApp, your phone number, to learn whether your request came from an ad. Before they leave your browser, the pixel turns them into an irreversible code (a hash), so Meta does not receive them as typed.',
              ],
            },
            {
              kind: 'paragraph',
              text: "You can object to these purposes at any time, as explained in Cookies and pixels. Apart from the email and phone mentioned above, we don't use what you write in the forms for measurement or advertising, and never your CV or your Work with muush application.",
            },
          ],
        },
        {
          id: 'sharing',
          nav: 'Who we share it with',
          title: 'Who we share it with',
          blocks: [
            {
              kind: 'paragraph',
              text: "We don't sell your data. We only share it with:",
            },
            {
              kind: 'bullets',
              items: [
                'The providers that help us operate: Amazon Web Services (site hosting), Amazon SES (email delivery), Google Drive (CV storage), Notion (records of requests and applications) and Cal.com (call scheduling). They process your data on our behalf, under our instructions and under confidentiality. Some have servers outside Mexico.',
                'Meta Platforms, which receives browsing data through its pixel to measure and show ads and, if you accepted advertising and request an assessment, your email and phone number as a hash.',
                'Google, which receives browsing data through Google Analytics to measure how the site is used, only if you accepted analytics.',
                'muush collaborators working on your project, only the data they need and under a confidentiality agreement. Some may be outside Mexico.',
                'Authorities, when a law requires it.',
              ],
            },
            {
              kind: 'paragraph',
              text: "Your talent pool profile and CV stay at muush: we don't share them with partners or other companies.",
            },
            {
              kind: 'paragraph',
              text: "Except for what is stated about Meta and Google, we don't make any data transfers that require your consent.",
            },
          ],
        },
        {
          id: 'retention',
          nav: 'How long we keep it',
          title: 'How long we keep it',
          blocks: [
            {
              kind: 'bullets',
              items: [
                'Your CV and talent pool profile: 1 year from when we receive them. When that period ends, we delete them.',
                "Assessment requests that don't move forward: 12 months from the last contact.",
                'Clients: for the length of the relationship and, after that, the period required by tax law.',
                'Browsing, analytics and pixel data: up to 14 months.',
              ],
            },
            {
              kind: 'paragraph',
              text: 'You can ask us to delete it sooner at any time.',
            },
          ],
        },
        {
          id: 'rights',
          nav: 'Your rights',
          title: 'Your rights',
          blocks: [
            {
              kind: 'paragraph',
              text: "You have the right to access, rectify or update, cancel or object to the use of your data (known in Mexico as ARCO rights). You can also object to decisions made solely by automated means; we don't make any today.",
            },
            {
              kind: 'paragraph',
              text: 'To exercise them, email support@muush.dev with the subject "ARCO rights" and include:',
            },
            {
              kind: 'steps',
              items: [
                'Your name and the email where you want our reply.',
                'A copy of your official ID. If someone represents you, their ID and the document that proves it.',
                'Which data and which right you want to exercise. For a correction, the correct data.',
                'Any document that helps us find your data.',
              ],
            },
            {
              kind: 'paragraph',
              text: "We reply within 20 business days at most. If your request is valid, we carry it out within the following 15 business days. It's free.",
            },
          ],
        },
        {
          id: 'withdrawal',
          nav: 'Withdraw your consent',
          title: 'How to withdraw consent or limit the use of your data',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Email support@muush.dev with the subject "Withdraw consent" or "Limit use of my data", with the same details as for ARCO rights. Without your data, we may not be able to keep handling your request or your application.',
            },
          ],
        },
        {
          id: 'cookies',
          nav: 'Cookies and pixels',
          title: 'Cookies and pixels',
          blocks: [
            {
              kind: 'paragraph',
              text: 'muush.dev uses the technical cookies it needs to work, for example to remember your language and your cookie choice. The rest fall into two categories you accept separately: Analytics, with Google Analytics, to measure visits (the _ga and _ga_* cookies, which last up to 14 months), and Advertising, with Meta Pixel, to measure and show ads (the _fbp cookie, which lasts 90 days). These technologies collect your IP address, browser, pages visited and cookie identifiers.',
            },
            {
              kind: 'paragraph',
              text: "You can accept or decline them in the site's cookie notice and change your choice here at any time. Your choice lasts 12 months; after that we ask again. If you withdraw your permission, we stop using them and delete their cookies from muush.dev. You can also turn them off in your browser settings or in your Meta account's ad preferences.",
            },
            {
              kind: 'preferences',
              label: 'Change my preferences',
            },
          ],
        },
        {
          id: 'changes',
          nav: 'Changes to this notice',
          title: 'Changes to this notice',
          blocks: [
            {
              kind: 'paragraph',
              text: "We publish any change on this page, with its update date at the top. If a change requires your consent, we'll ask for it by email.",
            },
          ],
        },
        {
          id: 'authority',
          nav: 'Authority',
          title: 'Authority',
          blocks: [
            {
              kind: 'paragraph',
              text: "If you believe your data protection rights were violated, you can go to Mexico's Secretaría Anticorrupción y Buen Gobierno, the data protection authority since March 2025.",
            },
          ],
        },
      ],
    },
  },
  terms: {
    es: {
      headingFirst: 'Términos y',
      headingSecond: 'condiciones.',
      updated: 'Última actualización: 5 de noviembre de 2026',
      onThisPage: 'En esta página',
      sections: [
        {
          id: 'whoWeAre',
          nav: 'Quiénes somos',
          title: 'Quiénes somos',
          blocks: [
            {
              kind: 'paragraph',
              text: 'muush.dev es el sitio de Roberto Mirón Nájera, persona física que opera bajo el nombre comercial muush ("muush" o "nosotros"), con domicilio en Del Puente #11, San Bartolo Ameyalco, Álvaro Obregón, C.P. 01800, Ciudad de México, México. Puedes escribirnos a support@muush.dev o por WhatsApp al +52 56 3906 0739.',
            },
          ],
        },
        {
          id: 'usingTheSite',
          nav: 'Al usar este sitio',
          title: 'Al usar este sitio',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Estos términos aplican a tu uso de muush.dev. Al navegar el sitio o enviar un formulario, los aceptas. Si no estás de acuerdo con ellos, te pedimos no usar el sitio.',
            },
          ],
        },
        {
          id: 'whatYouFind',
          nav: 'Qué encuentras aquí',
          title: 'Qué encuentras aquí',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Información sobre nuestros servicios, formularios para pedir un diagnóstico o aplicar a nuestro talent pool, y enlaces para escribirnos o agendar una llamada. En este sitio no se venden productos ni se hacen pagos.',
            },
          ],
        },
        {
          id: 'assessment',
          nav: 'Diagnóstico gratis',
          title: 'Diagnóstico gratis',
          blocks: [
            {
              kind: 'bullets',
              items: [
                'Incluye una revisión de tu sitio y tus herramientas, qué conviene hacer primero y por qué. Si hace falta ir a fondo, te decimos qué incluye y cuánto cuesta, y eso se cotiza aparte.',
                'No tiene costo y no te obliga a contratar nada.',
                'Te respondemos en 24 horas hábiles por el medio que elegiste.',
                'Es una orientación general basada en lo que nos compartes. Las decisiones sobre tu negocio son tuyas, y el diagnóstico no sustituye una asesoría legal, fiscal o financiera.',
              ],
            },
          ],
        },
        {
          id: 'projects',
          nav: 'Proyectos y propuestas',
          title: 'Proyectos y propuestas',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Lo que aparece en este sitio es informativo y no es una oferta obligatoria. Cada proyecto se rige por su propuesta aceptada y su contrato firmado, que mandan sobre lo que diga este sitio.',
            },
          ],
        },
        {
          id: 'workWithUs',
          nav: 'Trabaja con muush',
          title: 'Trabaja con muush',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Aplicar a nuestro talent pool no crea una relación laboral y no garantiza que participes en un proyecto. Cada colaboración se acuerda por escrito antes de empezar, con alcance, tiempos y pago claros. Al aplicar, confirmas que la información que envías es verídica y que puedes compartirla.',
            },
          ],
        },
        {
          id: 'properUse',
          nav: 'Uso correcto del sitio',
          title: 'Uso correcto del sitio',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Usa el sitio de forma lícita y con datos verídicos. Te pedimos no suplantar a otra persona, no intentar entrar a áreas que no son públicas, no afectar el funcionamiento del sitio, no introducir código malicioso y no extraer su contenido de forma automatizada.',
            },
          ],
        },
        {
          id: 'intellectualProperty',
          nav: 'Propiedad intelectual',
          title: 'Propiedad intelectual',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Los textos, el diseño, los logos, las animaciones y el código de este sitio pertenecen a muush o a sus titulares, y los protege la ley. Puedes verlos y compartir enlaces al sitio. Para cualquier otro uso, pídenos permiso por escrito.',
            },
            {
              kind: 'paragraph',
              text: 'Lo que nos envías sigue siendo tuyo. Nos permites usarlo solo para atender tu solicitud o tu aplicación.',
            },
          ],
        },
        {
          id: 'thirdParties',
          nav: 'Sitios de terceros',
          title: 'Sitios de terceros',
          blocks: [
            {
              kind: 'paragraph',
              text: 'El sitio enlaza a servicios de terceros como Cal.com, WhatsApp, LinkedIn e Instagram. Cada uno tiene sus propios términos y avisos, y muush no los controla.',
            },
          ],
        },
        {
          id: 'availability',
          nav: 'Disponibilidad y responsabilidad',
          title: 'Disponibilidad y responsabilidad',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Procuramos que el sitio esté disponible y que su información esté al día. Puede cambiar o interrumpirse, por ejemplo por mantenimiento.',
            },
            {
              kind: 'paragraph',
              text: 'En la medida que la ley lo permite, muush no responde por daños indirectos derivados del uso del sitio o de decisiones tomadas solo con su contenido. Nada de esto limita los derechos que la ley te da como consumidor.',
            },
          ],
        },
        {
          id: 'privacy',
          nav: 'Privacidad y cookies',
          title: 'Privacidad y cookies',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Tratamos tus datos como explica nuestro aviso de privacidad, donde también puedes cambiar tus preferencias de cookies.',
            },
          ],
        },
        {
          id: 'changes',
          nav: 'Cambios a estos términos',
          title: 'Cambios a estos términos',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Publicamos cualquier cambio en esta página, con su fecha de actualización arriba. Los cambios aplican desde que se publican.',
            },
          ],
        },
        {
          id: 'governingLaw',
          nav: 'Ley aplicable',
          title: 'Ley aplicable',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Estos términos se rigen por las leyes de México. Cualquier controversia se resuelve ante los tribunales de la Ciudad de México. Si eres consumidor, también puedes acudir a la Procuraduría Federal del Consumidor.',
            },
          ],
        },
        {
          id: 'contact',
          nav: 'Contacto',
          title: 'Contacto',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Para cualquier duda sobre estos términos, escríbenos a support@muush.dev.',
            },
          ],
        },
      ],
    },
    en: {
      headingFirst: 'Terms and',
      headingSecond: 'conditions.',
      updated: 'Last updated: November 5, 2026',
      translationNote:
        'Courtesy translation. If it differs from the Spanish version, the Spanish version prevails.',
      onThisPage: 'On this page',
      sections: [
        {
          id: 'whoWeAre',
          nav: 'Who we are',
          title: 'Who we are',
          blocks: [
            {
              kind: 'paragraph',
              text: 'muush.dev is the website of Roberto Mirón Nájera, an individual operating under the trade name muush ("muush" or "we"), located at Del Puente #11, San Bartolo Ameyalco, Álvaro Obregón, 01800, Mexico City, Mexico. You can reach us at support@muush.dev or on WhatsApp at +52 56 3906 0739.',
            },
          ],
        },
        {
          id: 'usingTheSite',
          nav: 'Using this site',
          title: 'Using this site',
          blocks: [
            {
              kind: 'paragraph',
              text: "These terms apply to your use of muush.dev. By browsing the site or sending a form, you accept them. If you don't agree with them, please don't use the site.",
            },
          ],
        },
        {
          id: 'whatYouFind',
          nav: "What you'll find here",
          title: "What you'll find here",
          blocks: [
            {
              kind: 'paragraph',
              text: "Information about our services, forms to request an assessment or apply to our talent pool, and links to write to us or book a call. This site doesn't sell products or take payments.",
            },
          ],
        },
        {
          id: 'assessment',
          nav: 'Free assessment',
          title: 'Free assessment',
          blocks: [
            {
              kind: 'bullets',
              items: [
                'It includes a review of your website and tools, what to do first and why. If you need to go deeper, we tell you what it includes and what it costs, and that is quoted separately.',
                "It's free and doesn't commit you to hiring us.",
                'We reply within 24 business hours through the channel you chose.',
                "It's general guidance based on what you share with us. Decisions about your business are yours, and the assessment doesn't replace legal, tax or financial advice.",
              ],
            },
          ],
        },
        {
          id: 'projects',
          nav: 'Projects and proposals',
          title: 'Projects and proposals',
          blocks: [
            {
              kind: 'paragraph',
              text: "The content of this site is informational and isn't a binding offer. Each project is governed by its accepted proposal and signed contract, which prevail over anything on this site.",
            },
          ],
        },
        {
          id: 'workWithUs',
          nav: 'Work with muush',
          title: 'Work with muush',
          blocks: [
            {
              kind: 'paragraph',
              text: "Applying to our talent pool doesn't create an employment relationship or guarantee that you'll join a project. Every collaboration is agreed in writing before it starts, with clear scope, timing and pay. By applying, you confirm that the information you send is true and that you're allowed to share it.",
            },
          ],
        },
        {
          id: 'properUse',
          nav: 'Proper use of the site',
          title: 'Proper use of the site',
          blocks: [
            {
              kind: 'paragraph',
              text: "Use the site lawfully and with truthful information. Please don't impersonate anyone, try to access non-public areas, disrupt the site, introduce malicious code or extract its content automatically.",
            },
          ],
        },
        {
          id: 'intellectualProperty',
          nav: 'Intellectual property',
          title: 'Intellectual property',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The text, design, logos, animations and code on this site belong to muush or their respective owners and are protected by law. You can view them and share links to the site. For any other use, ask us for written permission.',
            },
            {
              kind: 'paragraph',
              text: 'What you send us remains yours. You allow us to use it only to handle your request or application.',
            },
          ],
        },
        {
          id: 'thirdParties',
          nav: 'Third-party sites',
          title: 'Third-party sites',
          blocks: [
            {
              kind: 'paragraph',
              text: "The site links to third-party services such as Cal.com, WhatsApp, LinkedIn and Instagram. Each has its own terms and notices, and muush doesn't control them.",
            },
          ],
        },
        {
          id: 'availability',
          nav: 'Availability and liability',
          title: 'Availability and liability',
          blocks: [
            {
              kind: 'paragraph',
              text: 'We work to keep the site available and its information up to date. It may change or be interrupted, for example for maintenance.',
            },
            {
              kind: 'paragraph',
              text: "To the extent the law allows, muush isn't liable for indirect damages arising from use of the site or from decisions based only on its content. None of this limits the rights the law gives you as a consumer.",
            },
          ],
        },
        {
          id: 'privacy',
          nav: 'Privacy and cookies',
          title: 'Privacy and cookies',
          blocks: [
            {
              kind: 'paragraph',
              text: 'We handle your data as explained in our privacy notice, where you can also change your cookie preferences.',
            },
          ],
        },
        {
          id: 'changes',
          nav: 'Changes to these terms',
          title: 'Changes to these terms',
          blocks: [
            {
              kind: 'paragraph',
              text: 'We publish any change on this page, with its update date at the top. Changes apply from the moment they are published.',
            },
          ],
        },
        {
          id: 'governingLaw',
          nav: 'Governing law',
          title: 'Governing law',
          blocks: [
            {
              kind: 'paragraph',
              text: "These terms are governed by the laws of Mexico. Any dispute is resolved before the courts of Mexico City. If you're a consumer, you can also go to Mexico's Federal Consumer Protection Agency (Profeco).",
            },
          ],
        },
        {
          id: 'contact',
          nav: 'Contact',
          title: 'Contact',
          blocks: [
            {
              kind: 'paragraph',
              text: 'For any question about these terms, write to support@muush.dev.',
            },
          ],
        },
      ],
    },
  },
}

export const CONSENT_COPY: Record<LegalFixtureLocale, CookieConsentCopy> = {
  es: {
    banner: {
      title: 'Usamos cookies',
      body: 'Las técnicas hacen que el sitio funcione. Con tu permiso, también usamos Google Analytics para medir las visitas y Meta Pixel para medir y mostrar nuestros anuncios. Puedes elegir qué aceptas.',
      customize: 'Personalizar',
    },
    actions: {
      rejectAll: 'Rechazar todo',
      acceptAll: 'Aceptar todo',
      save: 'Guardar mi elección',
    },
    preferences: {
      title: 'Tus preferencias de cookies',
      close: 'Cerrar',
      intro: {
        before:
          'Elige qué cookies aceptas. Puedes cambiar tu elección cuando quieras. Lee más en nuestro ',
        link: 'aviso de privacidad',
        after: '.',
        href: '/es/privacidad',
      },
    },
    alwaysOn: 'Siempre activas',
    categories: [
      {
        id: 'necessary',
        name: 'Necesarias',
        detail:
          'Hacen que el sitio funcione, por ejemplo al recordar tu idioma.',
        required: true,
      },
      {
        id: 'analytics',
        name: 'Analítica',
        detail:
          'Google Analytics nos dice cuántas personas visitan el sitio y qué secciones leen, sin tu nombre ni tus datos de contacto.',
        required: false,
      },
      {
        id: 'advertising',
        name: 'Publicidad',
        detail:
          'Meta Pixel nos permite medir nuestros anuncios y mostrarlos a quienes visitaron el sitio. Si pides un diagnóstico, Meta recibe tu correo y tu teléfono en forma codificada.',
        required: false,
      },
    ],
  },
  en: {
    banner: {
      title: 'We use cookies',
      body: 'Technical cookies keep the site working. With your permission, we also use Google Analytics to measure visits and Meta Pixel to measure and show our ads. You can choose what you accept.',
      customize: 'Customize',
    },
    actions: {
      rejectAll: 'Decline all',
      acceptAll: 'Accept all',
      save: 'Save my choice',
    },
    preferences: {
      title: 'Your cookie preferences',
      close: 'Close',
      intro: {
        before:
          'Choose which cookies you accept. You can change your choice at any time. Read more in our ',
        link: 'privacy notice',
        after: '.',
        href: '/en/privacy',
      },
    },
    alwaysOn: 'Always on',
    categories: [
      {
        id: 'necessary',
        name: 'Necessary',
        detail:
          'They keep the site working, for example by remembering your language.',
        required: true,
      },
      {
        id: 'analytics',
        name: 'Analytics',
        detail:
          'Google Analytics tells us how many people visit the site and which sections they read, without your name or contact details.',
        required: false,
      },
      {
        id: 'advertising',
        name: 'Advertising',
        detail:
          'Meta Pixel lets us measure our ads and show them to people who visited the site. If you request an assessment, Meta receives your email and phone number in encoded form.',
        required: false,
      },
    ],
  },
}
