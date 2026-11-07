# Feature 49 · Copy drafts for Roberto's gate

> **Every line in this file is DRAFT pending Roberto's approval.** Written by the
> spec author on 2026-11-07 under Roberto's authorization of 2026-11-06 (feature
> 49 description, "TEXTO LEGAL"). Nothing here ships until Roberto approves it;
> the implementer then copies the approved text **literally** into
> `i18n/locales/{es,en}.json` (and `public/llms.txt`). After closing, the leader
> reports every changed string to Roberto so Clau can carry it into the `.pen`
> (rules.md § R32). Recommended, not blocking: a person with legal knowledge
> reviews the full notice.
>
> Tone follows the current notice and banner: second person, short sentences,
> Mexican Spanish, no dashes as pauses, "muush" in lowercase.
>
> Keys are the current ones from `i18n/locales/*.json`. **NEW** marks a key
> that does not exist yet (the page model in `app/features/legal/data/privacyNotice.ts`
> gains the matching block entry). Anything not listed here stays as it is.

---

## A · Privacy notice (`legal.privacy.*`)

There is no separate cookie table in the notice: the cookie details live in the
"Cookies y píxeles" paragraphs (A9, A10). The "Qué datos recabamos" table stays
accurate (the browsing row already lists cookie identifiers and on-site
actions; the assessment row already lists email and WhatsApp number), so it
does not change.

### A1 · `updated` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | Última actualización: 5 de noviembre de 2026 | Last updated: November 5, 2026 |
| After (DRAFT) | Última actualización: [fecha de publicación de la feature 49] | Last updated: [feature 49 publication date] |

The date is filled in with the day Roberto approves the merge to master.

### A2 · `sections.purposes.additionalIntro` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | También usamos datos de navegación para una finalidad adicional, que no es necesaria para atender tu solicitud: | We also use browsing data for one additional purpose, which we don't need to handle your request: |
| After (DRAFT) | También usamos tus datos para dos finalidades adicionales, que no son necesarias para atender tu solicitud y que solo aplican si las aceptas en el aviso de cookies: | We also use your data for two additional purposes, which we don't need to handle your request and which only apply if you accept them in the cookie notice: |

Why: there are now two secondary purposes (measurement and advertising), and
advertising now also uses form data (A4), not only browsing data.

### A3 · `sections.purposes.additionalItems.analytics` — NEW — APPROVED (Roberto, 2026-11-07)

Placed **before** the advertising item.

| | ES | EN |
|---|---|---|
| Before | (does not exist) | (does not exist) |
| After (DRAFT) | Medir el uso del sitio: usamos Google Analytics para saber cuántas personas nos visitan, cómo llegan, qué secciones leen y en qué paso de los formularios se detienen. No le enviamos tu nombre, tu correo, tu teléfono ni lo que escribes en los formularios. | Measuring how the site is used: we use Google Analytics to see how many people visit, how they find us, which sections they read and at which step of the forms they stop. We don't send it your name, email, phone or anything you write in the forms. |

### A4 · `sections.purposes.additionalItems.advertising` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | Medir y mostrar publicidad: usamos píxeles, como Meta Pixel, para saber cómo funcionan nuestros anuncios y mostrar anuncios de muush a personas que visitaron el sitio. | Measuring and showing advertising: we use pixels, such as Meta Pixel, to see how our ads perform and to show muush ads to people who visited the site. |
| After (DRAFT) | Medir y mostrar publicidad: usamos Meta Pixel para saber cómo funcionan nuestros anuncios y mostrar anuncios de muush a personas que visitaron el sitio. Si pides un diagnóstico, también le enviamos a Meta tu correo y, si elegiste WhatsApp, tu teléfono, para saber si tu solicitud llegó por un anuncio. Antes de salir de tu navegador, el píxel los convierte en un código irreversible (hash), así que Meta no recibe el dato tal cual. | Measuring and showing advertising: we use Meta Pixel to see how our ads perform and to show muush ads to people who visited the site. If you request an assessment, we also send Meta your email and, if you chose WhatsApp, your phone number, to learn whether your request came from an ad. Before they leave your browser, the pixel turns them into an irreversible code (a hash), so Meta does not receive them as typed. |

Why: covers Meta advanced matching (feature 49, Roberto 2026-11-06). "píxeles,
como Meta Pixel" becomes "Meta Pixel": it is the only pixel the site uses.

### A5 · `sections.purposes.objection` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | Puedes oponerte a esta finalidad en cualquier momento, como se explica en Cookies y píxeles. No usamos para publicidad lo que escribes en los formularios ni tu CV. | You can object to this purpose at any time, as explained in Cookies and pixels. We don't use what you write in the forms or your CV for advertising. |
| After (DRAFT) | Puedes oponerte a estas finalidades en cualquier momento, como se explica en Cookies y píxeles. Fuera del correo y el teléfono que se mencionan arriba, no usamos para medición ni publicidad lo que escribes en los formularios, y nunca tu CV ni tu aplicación a Trabaja con muush. | You can object to these purposes at any time, as explained in Cookies and pixels. Apart from the email and phone mentioned above, we don't use what you write in the forms for measurement or advertising, and never your CV or your Work with muush application. |

Why: the old second sentence becomes false once advanced matching ships.

### A6 · `sections.sharing.items.meta` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | Meta Platforms, que recibe datos de navegación a través de su píxel para medir y mostrar anuncios. | Meta Platforms, which receives browsing data through its pixel to measure and show ads. |
| After (DRAFT) | Meta Platforms, que recibe datos de navegación a través de su píxel para medir y mostrar anuncios y, si aceptaste la publicidad y pides un diagnóstico, tu correo y tu teléfono convertidos en hash. | Meta Platforms, which receives browsing data through its pixel to measure and show ads and, if you accepted advertising and request an assessment, your email and phone number as a hash. |

### A7 · `sections.sharing.items.google` — NEW — APPROVED (Roberto, 2026-11-07)

Placed right after the Meta item.

| | ES | EN |
|---|---|---|
| Before | (does not exist) | (does not exist) |
| After (DRAFT) | Google, que recibe datos de navegación a través de Google Analytics para medir el uso del sitio, solo si aceptaste la analítica. | Google, which receives browsing data through Google Analytics to measure how the site is used, only if you accepted analytics. |

### A8 · `sections.sharing.transfers` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | Salvo lo que se indica sobre Meta, no hacemos transferencias de datos que requieran tu consentimiento. | Except for what is stated about Meta, we don't make any data transfers that require your consent. |
| After (DRAFT) | Salvo lo que se indica sobre Meta y Google, no hacemos transferencias de datos que requieran tu consentimiento. | Except for what is stated about Meta and Google, we don't make any data transfers that require your consent. |

Decided (Roberto, 2026-11-07): Google Analytics is treated as a transfer
(needs consent), the conservative reading. It is consent-gated in the site
either way.

### A9 · `sections.retention.items.browsing` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | Datos de navegación y de píxeles: hasta 14 meses. | Browsing and pixel data: up to 14 months. |
| After (DRAFT) | Datos de navegación, de analítica y de píxeles: hasta 14 meses. | Browsing, analytics and pixel data: up to 14 months. |

### A10 · `sections.cookies.body` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | muush.dev usa cookies técnicas necesarias para que el sitio funcione, por ejemplo para recordar tu idioma. Si las aceptas, también usa Meta Pixel y Google Analytics para medir visitas y anuncios. Estas tecnologías recaban tu dirección IP, navegador, páginas visitadas e identificadores de cookies. | muush.dev uses the technical cookies it needs to work, for example to remember your language. If you accept them, it also uses Meta Pixel and Google Analytics to measure visits and ads. These technologies collect your IP address, browser, pages visited and cookie identifiers. |
| After (DRAFT) | muush.dev usa cookies técnicas necesarias para que el sitio funcione, por ejemplo para recordar tu idioma y tu elección de cookies. Las demás se dividen en dos categorías que aceptas por separado: Analítica, con Google Analytics, para medir visitas (cookies _ga y _ga_*, que duran hasta 14 meses), y Publicidad, con Meta Pixel, para medir y mostrar anuncios (cookie _fbp, que dura 90 días). Estas tecnologías recaban tu dirección IP, navegador, páginas visitadas e identificadores de cookies. | muush.dev uses the technical cookies it needs to work, for example to remember your language and your cookie choice. The rest fall into two categories you accept separately: Analytics, with Google Analytics, to measure visits (the _ga and _ga_* cookies, which last up to 14 months), and Advertising, with Meta Pixel, to measure and show ads (the _fbp cookie, which lasts 90 days). These technologies collect your IP address, browser, pages visited and cookie identifiers. |

### A11 · `sections.cookies.choices` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | Puedes aceptarlas o rechazarlas en el aviso de cookies del sitio y cambiar tu elección aquí en cualquier momento. También puedes desactivarlas desde la configuración de tu navegador o en las preferencias de anuncios de tu cuenta de Meta. | You can accept or decline them in the site's cookie notice and change your choice here at any time. You can also turn them off in your browser settings or in your Meta account's ad preferences. |
| After (DRAFT) | Puedes aceptarlas o rechazarlas en el aviso de cookies del sitio y cambiar tu elección aquí en cualquier momento. Tu elección dura 12 meses; después te la volvemos a pedir. Si retiras tu permiso, dejamos de usarlas y borramos sus cookies de muush.dev. También puedes desactivarlas desde la configuración de tu navegador o en las preferencias de anuncios de tu cuenta de Meta. | You can accept or decline them in the site's cookie notice and change your choice here at any time. Your choice lasts 12 months; after that we ask again. If you withdraw your permission, we stop using them and delete their cookies from muush.dev. You can also turn them off in your browser settings or in your Meta account's ad preferences. |

Unchanged: every other `legal.privacy.*` key, including the data table, the
controller, ARCO, withdrawal, changes and authority sections.

---

## B · Banner and preferences dialog (`consent.*`)

### B1 · `banner.body` — APPROVED (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | Las técnicas hacen que el sitio funcione. Con tu permiso, también usamos un píxel para medir y mostrar nuestros anuncios. Puedes elegir qué aceptas. | Technical cookies keep the site working. With your permission, we also use a pixel to measure and show our ads. You can choose what you accept. |
| After (DRAFT) | Las técnicas hacen que el sitio funcione. Con tu permiso, también usamos Google Analytics para medir las visitas y Meta Pixel para medir y mostrar nuestros anuncios. Puedes elegir qué aceptas. | Technical cookies keep the site working. With your permission, we also use Google Analytics to measure visits and Meta Pixel to measure and show our ads. You can choose what you accept. |

### B2 · `categories.analytics.name` — NEW — APPROVED (Roberto, 2026-11-07)

| ES | EN |
|---|---|
| Analítica | Analytics |

### B3 · `categories.analytics.detail` — NEW — APPROVED (Roberto, 2026-11-07)

| ES | EN |
|---|---|
| Google Analytics nos dice cuántas personas visitan el sitio y qué secciones leen, sin tu nombre ni tus datos de contacto. | Google Analytics tells us how many people visit the site and which sections they read, without your name or contact details. |

### B4 · `categories.advertising.detail` — APPROVED with change (Roberto, 2026-11-07)

| | ES | EN |
|---|---|---|
| Before | Meta Pixel nos permite medir nuestros anuncios y mostrarlos a quienes visitaron el sitio. | Meta Pixel lets us measure our ads and show them to people who visited the site. |
| After (APPROVED) | Meta Pixel nos permite medir nuestros anuncios y mostrarlos a quienes visitaron el sitio. Si pides un diagnóstico, Meta recibe tu correo y tu teléfono en forma codificada. | Meta Pixel lets us measure our ads and show them to people who visited the site. If you request an assessment, Meta receives your email and phone number in encoded form. |

Roberto chose "en forma codificada" over "convertidos en hash" (plain words in
the dialog; the notice, A4, explains the hash).

Why recommended: the switch is where the visitor consents to advanced matching;
naming it there, not only in the notice, makes the consent informed. If Roberto
prefers the row unchanged, B4 is dropped and the notice (A4, A6) carries it alone.

Unchanged: `banner.title`, `banner.customize`, `actions.*`, `preferences.*`,
`categories.necessary.*`, `categories.alwaysOn`, `categories.advertising.name`.

Order of the rows in the dialog: Necesarias → Analítica → Publicidad
(Necessary → Analytics → Advertising), from least to most invasive.

---

## C · `llms.txt` (served at `https://muush.dev/llms.txt`) — APPROVED (Roberto, 2026-11-07)

The whole file below is DRAFT. Written in English (the site default locale) with
both languages' pages linked. Every sentence restates copy already published
on the site (`muush-1.0.md` § 4); no personal contact data. The 10 URLs are
exactly the sitemap's.

```markdown
# muush

> muush is a Technology Solution Studio. We design and build the digital solutions your business uses every day. We speak business and code.

A core team and trusted partners, shaped by what your project needs. Strategy, design and engineering work together from day one; when the project calls for it, partners held to the same standard join, wherever they are. We work with clients in any country. The site is available in English and Spanish.

What we do:

- Technology strategy: a clear diagnosis and a plan for what to do, and in what order, before you invest.
- Software, web and cloud: websites, systems, portals and apps, with the cloud they run on and your tools connected.
- Automation, data and AI: processes that run themselves, data that turns into decisions, and AI where it truly helps.
- Product design and UX: screens so clear your team uses them without a manual.
- Also, through partners and always quoted separately: creative and marketing (content, photo, video, social media and ads).

How we work: first we understand how you operate, then we decide what gets built. 01 Assessment, 02 Proposal, 03 Design, 04 Build, 05 Launch and support. The first step is a free assessment, answered within 24 business hours.

Contact: support@muush.dev, or request the free assessment from the Home page.

## Pages (English)

- [Home](https://muush.dev/en): what muush does, services, how we work and the free assessment request.
- [About](https://muush.dev/en/about): how the team comes together around each project, where we are, and how to join the talent pool.
- [FAQ](https://muush.dev/en/faq): frequently asked questions (under construction).

## Páginas (español)

- [Inicio](https://muush.dev/es): qué hace muush, servicios, cómo trabajamos y la solicitud de diagnóstico gratis.
- [Nosotros](https://muush.dev/es/nosotros): cómo se arma el equipo alrededor de cada proyecto, dónde estamos y cómo sumarte al talent pool.
- [Preguntas](https://muush.dev/es/preguntas): preguntas frecuentes (en construcción).

## Optional

- [Privacy notice](https://muush.dev/en/privacy): how muush handles personal data.
- [Terms and conditions](https://muush.dev/en/terms): terms of use of the site.
- [Aviso de privacidad](https://muush.dev/es/privacidad): cómo trata muush los datos personales.
- [Términos y condiciones](https://muush.dev/es/terminos): términos de uso del sitio.
```

Notes for the gate:

- `## Optional` is the llmstxt.org section an assistant may skip when it needs a
  shorter context; the legal pages go there.
- `support@muush.dev` added at Roberto's request (2026-11-07): it is already
  published on every page; no other contact data (no phone, no WhatsApp).

---

## D · Assessment form website field (`forms.contact.fields.website.*`) — APPROVED (Roberto, 2026-11-07, from the .pen)

Values extracted from the `.pen` by the leader on 2026-11-07 (feature 49
scope item 8). Not drafted by the spec author; copied literally.

| Key | ES | EN |
|---|---|---|
| `forms.contact.fields.website.label` — NEW | Tu sitio web o redes (opcional) | Your website or social media (optional) |
| `forms.contact.fields.website.placeholder` — NEW | https:// | https:// |

No error key: the field has no error message (spec FR-062, FR-064; plan Q6).
The privacy notice already lists this datum; no § A change.
