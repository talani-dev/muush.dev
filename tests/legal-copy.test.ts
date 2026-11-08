import { describe, expect, it } from 'vitest'
import { CONSENT_COPY } from '@/features/legal/data/legalFixtures.testing'
import { messageAt } from '@/features/legal/data/localeKeys.testing'

/**
 * Feature 48 · the legal text is Roberto's (2026-11-05), transcribed from
 * the `.pen`; no agent writes or rewords it. The only edits allowed are the
 * four placeholder substitutions of pen-extract-48 § 2, asserted here in
 * both locales. Read from disk (rules.md § R27).
 */
type Locale = 'es' | 'en'

function stringsUnder(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (value === null || typeof value !== 'object') return []
  return Object.values(value).flatMap(stringsUnder)
}

const SUBSTITUTIONS: Record<Locale, [string, string][]> = {
  es: [
    ['legal.privacy.updated', 'Última actualización: 7 de noviembre de 2026'],
    ['legal.terms.updated', 'Última actualización: 5 de noviembre de 2026'],
    [
      'legal.privacy.sections.sharing.items.providers',
      'Amazon SES (envío de correos)',
    ],
    /* Feature 49 rewrote the two lines below (copy-drafts A9, A10); the
       substitutions they once carried still hold in the new text. */
    [
      'legal.privacy.sections.retention.items.browsing',
      'de píxeles: hasta 14 meses.',
    ],
    [
      'legal.privacy.sections.cookies.body',
      'Analítica, con Google Analytics, para medir visitas',
    ],
  ],
  en: [
    ['legal.privacy.updated', 'Last updated: November 7, 2026'],
    ['legal.terms.updated', 'Last updated: November 5, 2026'],
    [
      'legal.privacy.sections.sharing.items.providers',
      'Amazon SES (email delivery)',
    ],
    [
      'legal.privacy.sections.retention.items.browsing',
      'pixel data: up to 14 months.',
    ],
    [
      'legal.privacy.sections.cookies.body',
      'Analytics, with Google Analytics, to measure visits',
    ],
  ],
}

describe('legal copy (feature 48)', () => {
  for (const locale of ['es', 'en'] as const) {
    it(`should leave no .pen placeholder in the ${locale} legal text`, () => {
      const strings = [
        ...stringsUnder(messageAt(locale, 'legal')),
        ...stringsUnder(messageAt(locale, 'consent')),
      ]

      expect(strings.length).toBeGreaterThan(100)
      expect(strings.filter(text => /\[|\]/.test(text))).toEqual([])
    })

    it(`should apply the four pen-extract-48 § 2 substitutions in ${locale}`, () => {
      for (const [key, expected] of SUBSTITUTIONS[locale]) {
        expect(String(messageAt(locale, key)), key).toContain(expected)
      }
    })

    it(`should escape every at sign for vue-i18n in ${locale}`, () => {
      const raw = stringsUnder(messageAt(locale, 'legal'))

      expect(
        raw.filter(text => /@/.test(text.replaceAll("{'@'}", '')))
      ).toEqual([])
    })

    it(`should match the consent fixtures to the ${locale} locale file`, () => {
      const copy = CONSENT_COPY[locale]

      expect(copy.banner.title).toBe(messageAt(locale, 'consent.banner.title'))
      expect(copy.banner.body).toBe(messageAt(locale, 'consent.banner.body'))
      expect(copy.actions.save).toBe(messageAt(locale, 'consent.actions.save'))
      expect(copy.preferences.intro.link).toBe(
        messageAt(locale, 'consent.preferences.intro.link')
      )
      expect(copy.categories.map(category => category.detail)).toEqual([
        messageAt(locale, 'consent.categories.necessary.detail'),
        messageAt(locale, 'consent.categories.analytics.detail'),
        messageAt(locale, 'consent.categories.advertising.detail'),
      ])
      expect(copy.categories.map(category => category.name)).toEqual([
        messageAt(locale, 'consent.categories.necessary.name'),
        messageAt(locale, 'consent.categories.analytics.name'),
        messageAt(locale, 'consent.categories.advertising.name'),
      ])
    })
  }

  it('should keep the Spanish note slot equal to the English note, never shown in Spanish', () => {
    /* The `.pen` draws "Courtesy translation…" on the English frames only;
       the Spanish key exists for parity and `resolveLegalPage` omits it. */
    expect(messageAt('es', 'legal.translationNote')).toBe(
      messageAt('en', 'legal.translationNote')
    )
  })

  it('should read the intro link words inside the preferences sentence', () => {
    expect(
      [
        messageAt('es', 'consent.preferences.intro.before'),
        messageAt('es', 'consent.preferences.intro.link'),
        messageAt('es', 'consent.preferences.intro.after'),
      ].join('')
    ).toBe(
      'Elige qué cookies aceptas. Puedes cambiar tu elección cuando quieras. Lee más en nuestro aviso de privacidad.'
    )
  })
})

/**
 * Feature 49 · the privacy notice and consent copy Roberto approved on
 * 2026-11-07 (specs/049-consented-tracking/copy-drafts.md §§ A2–A11, B1–B4),
 * copied literally. A1 (the "Última actualización" date) is filled in at
 * the merge, on the day Roberto approves it, so it is not asserted here.
 */
const APPROVED_49: Record<Locale, [string, string][]> = {
  es: [
    [
      'legal.privacy.sections.purposes.additionalIntro',
      'También usamos tus datos para dos finalidades adicionales, que no son necesarias para atender tu solicitud y que solo aplican si las aceptas en el aviso de cookies:',
    ],
    [
      'legal.privacy.sections.purposes.additionalItems.analytics',
      'Medir el uso del sitio: usamos Google Analytics para saber cuántas personas nos visitan, cómo llegan, qué secciones leen y en qué paso de los formularios se detienen. No le enviamos tu nombre, tu correo, tu teléfono ni lo que escribes en los formularios.',
    ],
    [
      'legal.privacy.sections.purposes.additionalItems.advertising',
      'Medir y mostrar publicidad: usamos Meta Pixel para saber cómo funcionan nuestros anuncios y mostrar anuncios de muush a personas que visitaron el sitio. Si pides un diagnóstico, también le enviamos a Meta tu correo y, si elegiste WhatsApp, tu teléfono, para saber si tu solicitud llegó por un anuncio. Antes de salir de tu navegador, el píxel los convierte en un código irreversible (hash), así que Meta no recibe el dato tal cual.',
    ],
    [
      'legal.privacy.sections.purposes.objection',
      'Puedes oponerte a estas finalidades en cualquier momento, como se explica en Cookies y píxeles. Fuera del correo y el teléfono que se mencionan arriba, no usamos para medición ni publicidad lo que escribes en los formularios, y nunca tu CV ni tu aplicación a Trabaja con muush.',
    ],
    [
      'legal.privacy.sections.sharing.items.meta',
      'Meta Platforms, que recibe datos de navegación a través de su píxel para medir y mostrar anuncios y, si aceptaste la publicidad y pides un diagnóstico, tu correo y tu teléfono convertidos en hash.',
    ],
    [
      'legal.privacy.sections.sharing.items.google',
      'Google, que recibe datos de navegación a través de Google Analytics para medir el uso del sitio, solo si aceptaste la analítica.',
    ],
    [
      'legal.privacy.sections.sharing.transfers',
      'Salvo lo que se indica sobre Meta y Google, no hacemos transferencias de datos que requieran tu consentimiento.',
    ],
    [
      'legal.privacy.sections.retention.items.browsing',
      'Datos de navegación, de analítica y de píxeles: hasta 14 meses.',
    ],
    [
      'legal.privacy.sections.cookies.body',
      'muush.dev usa cookies técnicas necesarias para que el sitio funcione, por ejemplo para recordar tu idioma y tu elección de cookies. Las demás se dividen en dos categorías que aceptas por separado: Analítica, con Google Analytics, para medir visitas (cookies _ga y _ga_*, que duran hasta 14 meses), y Publicidad, con Meta Pixel, para medir y mostrar anuncios (cookie _fbp, que dura 90 días). Estas tecnologías recaban tu dirección IP, navegador, páginas visitadas e identificadores de cookies.',
    ],
    [
      'legal.privacy.sections.cookies.choices',
      'Puedes aceptarlas o rechazarlas en el aviso de cookies del sitio y cambiar tu elección aquí en cualquier momento. Tu elección dura 12 meses; después te la volvemos a pedir. Si retiras tu permiso, dejamos de usarlas y borramos sus cookies de muush.dev. También puedes desactivarlas desde la configuración de tu navegador o en las preferencias de anuncios de tu cuenta de Meta.',
    ],
    [
      'consent.banner.body',
      'Las técnicas hacen que el sitio funcione. Con tu permiso, también usamos Google Analytics para medir las visitas y Meta Pixel para medir y mostrar nuestros anuncios. Puedes elegir qué aceptas.',
    ],
    ['consent.categories.analytics.name', 'Analítica'],
    [
      'consent.categories.analytics.detail',
      'Google Analytics nos dice cuántas personas visitan el sitio y qué secciones leen, sin tu nombre ni tus datos de contacto.',
    ],
    [
      'consent.categories.advertising.detail',
      'Meta Pixel nos permite medir nuestros anuncios y mostrarlos a quienes visitaron el sitio. Si pides un diagnóstico, Meta recibe tu correo y tu teléfono en forma codificada.',
    ],
  ],
  en: [
    [
      'legal.privacy.sections.purposes.additionalIntro',
      "We also use your data for two additional purposes, which we don't need to handle your request and which only apply if you accept them in the cookie notice:",
    ],
    [
      'legal.privacy.sections.purposes.additionalItems.analytics',
      "Measuring how the site is used: we use Google Analytics to see how many people visit, how they find us, which sections they read and at which step of the forms they stop. We don't send it your name, email, phone or anything you write in the forms.",
    ],
    [
      'legal.privacy.sections.purposes.additionalItems.advertising',
      'Measuring and showing advertising: we use Meta Pixel to see how our ads perform and to show muush ads to people who visited the site. If you request an assessment, we also send Meta your email and, if you chose WhatsApp, your phone number, to learn whether your request came from an ad. Before they leave your browser, the pixel turns them into an irreversible code (a hash), so Meta does not receive them as typed.',
    ],
    [
      'legal.privacy.sections.purposes.objection',
      "You can object to these purposes at any time, as explained in Cookies and pixels. Apart from the email and phone mentioned above, we don't use what you write in the forms for measurement or advertising, and never your CV or your Work with muush application.",
    ],
    [
      'legal.privacy.sections.sharing.items.meta',
      'Meta Platforms, which receives browsing data through its pixel to measure and show ads and, if you accepted advertising and request an assessment, your email and phone number as a hash.',
    ],
    [
      'legal.privacy.sections.sharing.items.google',
      'Google, which receives browsing data through Google Analytics to measure how the site is used, only if you accepted analytics.',
    ],
    [
      'legal.privacy.sections.sharing.transfers',
      "Except for what is stated about Meta and Google, we don't make any data transfers that require your consent.",
    ],
    [
      'legal.privacy.sections.retention.items.browsing',
      'Browsing, analytics and pixel data: up to 14 months.',
    ],
    [
      'legal.privacy.sections.cookies.body',
      'muush.dev uses the technical cookies it needs to work, for example to remember your language and your cookie choice. The rest fall into two categories you accept separately: Analytics, with Google Analytics, to measure visits (the _ga and _ga_* cookies, which last up to 14 months), and Advertising, with Meta Pixel, to measure and show ads (the _fbp cookie, which lasts 90 days). These technologies collect your IP address, browser, pages visited and cookie identifiers.',
    ],
    [
      'legal.privacy.sections.cookies.choices',
      "You can accept or decline them in the site's cookie notice and change your choice here at any time. Your choice lasts 12 months; after that we ask again. If you withdraw your permission, we stop using them and delete their cookies from muush.dev. You can also turn them off in your browser settings or in your Meta account's ad preferences.",
    ],
    [
      'consent.banner.body',
      'Technical cookies keep the site working. With your permission, we also use Google Analytics to measure visits and Meta Pixel to measure and show our ads. You can choose what you accept.',
    ],
    ['consent.categories.analytics.name', 'Analytics'],
    [
      'consent.categories.analytics.detail',
      'Google Analytics tells us how many people visit the site and which sections they read, without your name or contact details.',
    ],
    [
      'consent.categories.advertising.detail',
      'Meta Pixel lets us measure our ads and show them to people who visited the site. If you request an assessment, Meta receives your email and phone number in encoded form.',
    ],
  ],
}

describe('legal and consent copy (feature 49)', () => {
  for (const locale of ['es', 'en'] as const) {
    it(`should carry the approved ${locale} text of copy-drafts §§ A–B literally`, () => {
      for (const [key, expected] of APPROVED_49[locale]) {
        expect(messageAt(locale, key), key).toBe(expected)
      }
    })
  }
})
