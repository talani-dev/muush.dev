# Data model: Muush 1.0 forms (feature 45)

Values unchanged: `ContactFormValues`, `ApplicationFormValues`, field orders,
validation rules, `CV_MAX_BYTES` (5 242 880), `CV_REQUIRED` (false), the role
catalogue, the identity list, payload builders, submission flows, server
error maps. Everything below is additive or replaces UI content only.

## 1 · Step membership (`forms/data/formSteps.ts`)

```ts
export const FORM_STEPS_MEDIA_QUERY = '(max-width: 47.9375rem)' // below 768 px, handoff
export type FormStep = 1 | 2
export const FORM_STEP_COUNT = 2

export const CONTACT_STEP_FIELDS = {
  1: ['name', 'email', 'contactPreference', 'whatsappCountry', 'whatsapp'],
  2: ['company', 'identity', 'need'],
} as const satisfies Record<FormStep, readonly ContactFieldId[]>

export const APPLICATION_STEP_FIELDS = {
  1: ['name', 'email', 'contactPreference', 'whatsappCountry', 'whatsapp'],
  2: ['portfolio', 'areaRole', 'linkedin', 'cv'],
} as const satisfies Record<FormStep, readonly ApplicationFieldId[]>
```

The privacy checkbox belongs to step 2 and is not a field id (it is not a form
value). A unit test asserts each form's two lists partition its field order.

## 2 · Composables (additive)

```ts
// forms/logic/useFormSteps.ts
useFormSteps<F extends string>(options: {
  stepFields: Record<FormStep, readonly F[]>
  errors: ComputedRef<Partial<Record<F, string>>>
  panel: Readonly<Ref<HTMLElement | null>>
}): {
  isStepped: Readonly<Ref<boolean>>   // false on server and until mount
  step: Readonly<Ref<FormStep>>
  attemptedStep: Readonly<Ref<FormStep | null>>
  goNext(): void                      // validates step 1 (FR-005)
  goBack(): void                      // FR-006
  revealField(fieldId: F): void       // switches to the field's step (FR-007)
}

// forms/logic/useConsentGate.ts
useConsentGate(): {
  accepted: Ref<boolean>
  guard(handler: (event: Event) => Promise<void>): (event: Event) => Promise<void>
}

// forms/logic/cvFileCheck.ts (pure)
classifyCvFile(file: File): 'accepted' | 'format' | 'size'

// forms/logic/formSteps.ts (pure)
stepOfField(stepFields, fieldId): FormStep
firstErrorInStep(errors, fieldOrder, stepFields[step]): F | undefined
isErrorVisible(fieldId, { state, attemptedStep, stepFields }): boolean
```

`useFormSubmitState` options gain `revealField?: (fieldId: F) => void`;
`UseContactFormOptions` and `UseApplicationFormOptions` gain the same and pass
it through. Default: no-op (v1 forms unchanged).

## 3 · Content shapes (v2, final names)

`ContactFormContent` / `ApplicationFormContent` keep `fields` (each field:
`label`, optional `placeholder`, error strings by kind) and gain or replace:

```ts
interface FormChromeContent {
  steps: { progress: string /* "Paso {n} de {total} · {title}" */; titles: Record<FormStep, string> }
  continue: string
  back: string
  privacy: { label: string; requiredHint: string }
  submit: string
  sending: string
  retry: string                     // "Intentar de nuevo"
  error: { before: string; email: string; after: string } // text around the support link
  success: {
    title: string
    body: string
    action: { label: string; href?: string; to?: RouteLocationRaw }
  }
}
// ContactFormContent = { fields: … } & FormChromeContent
//   success.action.href = CALL_BOOKING_URL
//   fields.identity gains `placeholder`
// ApplicationFormContent = { fields: … } & FormChromeContent & {
//   uploading: string
//   cvUploadError: { message: string; submitWithoutCv: string }
// }  success.action.to = localePath('/')
```

Removed from the v2 shapes: `success.titleByChannel` (and the
`forms.contact.success.channel.*` keys), `error.title/fallback`,
`cvUploadError.retry`. The quarantined v1 components use
`LegacyContactFormContent` / `LegacyApplicationFormContent`
(`forms/data/legacy/legacyFormContent.ts`) and are fed only by fixtures.

`AssessmentContent` (`landing/data/assessmentContent.ts`):
`pill`, `headingFirst`, `headingSecond`, `body`, `receivesLabel`,
`receives: readonly [string, string, string]`, `callQuestion`, `callLink`,
`callHref` (= `CALL_BOOKING_URL`).

## 4 · i18n keys (both locales)

`/` in the approved copy is a line break; it becomes two keys.

### `landing.assessment.*` (replaces `landing.contact.*`)

| Key | ES | EN |
|---|---|---|
| pill | Primer paso | First step |
| headingFirst / headingSecond | Pide tu diagnóstico / sin costo. | Request your / free assessment. |
| body | Cuéntanos qué quieres resolver y te respondemos en 24 horas hábiles. | Tell us what you want to solve and we'll reply within 24 business hours. |
| receivesLabel | Lo que recibes | What you get |
| receives.review / first / deeper | Una revisión de tu sitio y tus herramientas · Qué conviene hacer primero y por qué · Si hace falta ir a fondo, qué incluye y cuánto cuesta | A review of your website and tools · What to do first, and why · If it needs a deeper look, what's included and what it costs |
| callQuestion / callLink | ¿Prefieres hablar? / Agenda una llamada | Prefer to talk? / Book a call |

`receivesLabel` is stored in sentence case and drawn uppercase (feature 44
rule in `landing-copy.test.ts`).

### `forms.contact.*`

| Key | ES | EN |
|---|---|---|
| fields.name.label / placeholder / errorRequired | Nombre / Nombre y apellido / Escribe tu nombre. | Name / First and last name / Enter your name. |
| fields.email.label / placeholder | Correo / tu@correo.com | Email / you@email.com |
| fields.email.errorRequired = errorFormat | Escribe un correo como nombre@empresa.com | Enter an email like name@company.com |
| fields.company.label / placeholder | Empresa o proyecto / Nombre de la empresa | Company or project / Company name |
| fields.identity.label / placeholder | ¿Cómo te identificas? / Selecciona una opción ⚠ new | You are a… / Select an option ⚠ new |
| fields.identity.errorRequired | Elige una opción. | Choose an option. |
| fields.identity.options.* | unchanged | unchanged |
| fields.need.label / placeholder | ¿Qué necesitas? / Cuéntanos en un par de líneas qué quieres resolver. | What do you need? / Tell us in a couple of lines what you want to solve. |
| fields.need.errorRequired / errorLength | Cuéntanos qué necesitas. / Cuéntanos un poco más. | Tell us what you need. / Tell us a bit more. |
| fields.contactPreference.label | ¿Cómo prefieres que te contactemos? | How should we contact you? |
| fields.contactPreference.options | Correo · WhatsApp | Email · WhatsApp |
| fields.whatsappCountry.* , fields.whatsapp.* | today's text, errors ending in "." | same |
| steps.progress | Paso {n} de {total} · {title} | Step {n} of {total} · {title} ⚠ leader to confirm vs `qUy14` |
| steps.titles.1 / 2 | Tus datos / Tu negocio | Your details / Your business ⚠ |
| continue / back | Continuar / ← Atrás | Continue / ← Back ⚠ |
| privacy.label | Acepto el aviso de privacidad y que muush me contacte sobre mi diagnóstico. | I accept the privacy notice and agree to be contacted by muush about my assessment. |
| privacy.requiredHint | Acepta el aviso de privacidad para enviar. ⚠ new | Accept the privacy notice to send. ⚠ new |
| submit / sending / retry | Quiero mi diagnóstico / Enviando… / Intentar de nuevo | Get my assessment / Sending… / Try again |
| error.before · email · after | El envío se interrumpió. Tus datos siguen aquí: vuelve a intentarlo o escríbenos a · support{'@'}muush.dev · . | Sending was interrupted. Your details are still here: try again or write to us at · support{'@'}muush.dev · . |
| success.title / body | Recibimos tu solicitud. / Te respondemos en 24 horas hábiles por el medio que elegiste. Si prefieres adelantar, agenda una llamada. | We got your request. / We'll reply within 24 business hours through the channel you chose. If you'd like to move faster, book a call. |
| success.action | Agenda una llamada | Book a call |

### `forms.application.*`

| Key | ES | EN |
|---|---|---|
| fields.name.* , fields.email.* | as `forms.contact` | as `forms.contact` |
| fields.portfolio.label / placeholder / errorFormat | Portafolio / https:// / Ingresa una URL válida. | Portfolio / https:// / Enter a valid URL. |
| fields.areaRole.label / placeholder / errorRequired | Área y rol / Selecciona tu área y rol / Elige tu área y rol. | Area and role / Select your area and role / Choose your area and role. |
| fields.areaRole.areas.* , roles.* | unchanged | unchanged |
| fields.linkedin.label / placeholder / errorFormat | LinkedIn / linkedin.com/in/… / Ingresa una URL válida. | LinkedIn / linkedin.com/in/… / Enter a valid URL. |
| fields.cv.label / placeholder | CV / Adjunta tu CV en PDF · máximo 5 MB (Q1) | CV / Attach your CV as a PDF · up to 5 MB (Q1) |
| fields.cv.errorFormat = errorSize | Adjunta tu CV en PDF de hasta 5 MB. (Q1) | Attach your CV as a PDF up to 5 MB. (Q1) |
| fields.cv.errorRequired | Adjunta tu CV. | Attach your CV. |
| fields.contactPreference.* , whatsapp* | as `forms.contact` | as `forms.contact` |
| steps.titles.1 / 2 | Tus datos / Tu perfil | Your details / Your profile ⚠ |
| privacy.label | Acepto el aviso de privacidad y que muush me contacte sobre mi aplicación. | I accept the privacy notice and agree to be contacted by muush about my application. |
| submit / uploading | Enviar aplicación / Subiendo CV… | Send application / Uploading CV… |
| error.before | El envío se interrumpió. Tus datos y tu CV siguen aquí: vuelve a intentarlo o escríbenos a | Sending was interrupted. Your details and CV are still here: try again or write to us at |
| cvUploadError.message / submitWithoutCv | today's text / Enviar sin CV | today's text / Submit without CV |
| success.title / body / action | Recibimos tu aplicación. / Revisamos tu perfil y te escribimos cuando haya un proyecto que encaje contigo. / Volver al inicio | We got your application. / We'll review your profile and reach out when there's a project that fits you. / Back to home |

`steps.progress`, `continue`, `back`, `privacy.requiredHint`, `sending`,
`retry` are shared wording; each form keeps its own key (forms namespaces stay
independent, feature 16 D-4) and a test asserts they are equal.

## 5 · Tokens (new, `app/assets/css/global.css`)

Reused as-is: `--carbon-800`, `--carbon-700`, `--gris-400`, `--blanco`,
`--red-muush-500`, `--texto-suave` (70 %), `--texto-tenue` (40 %), `--linea`
(12 %), `--blanco-8`, `--blanco-10`, `--blanco-25`, `--rojo-15`,
`--compromiso-icono`, `--borde-plano`, `--vidrio-*`, `--radio-pill`,
`--radio-panel` (28), `--radio-tarjeta` (22, mobile panel), `--radio-franja` (20, success tile), `--radio-campo` (12), `--spacing-panel` (36), `pulso`,
`text-rotulo` (11 / 600 / 1 px), `text-diagnostico`, `foco`.

New (names indicative; implementer keeps them unprefixed and grouped under a
"Feature 45 · forms" comment):

| Token | Value | Source |
|---|---|---|
| `--rojo-12`, `--rojo-40` | Red muush 12 % / 40 % (color-mix) | notice fill / stroke |
| `--blanco-20` | Blanco 20 % | success tile stroke, bar off segment |
| `--radio-campo-desktop` | 0.875rem (14) | desktop control radius |
| `--radio-segmento` | 0.5625rem (9) | mobile selected option |
| `--radio-aviso` | 0.625rem (10) | notice |
| `--radio-check` | 0.3125rem (5) | checkbox |
| control heights | 46 mobile / 50 desktop; textarea and CV box 96 | extract §§ 2, 4, 5 |
| control padding | 0 / 14 mobile, 0 / 16 desktop; textarea 14 / 16 | |
| field gaps | label→control 7 mobile, 8 desktop; panel gap 14 / 18; row gap 14 | |
| panel padding mobile | 1.25rem (20) | extract § 4 |
| panel max width | 37.5rem (600) | extract § 1 |
| segmented | container padding 4 / 5, gap 4 / 6; option padding 8/14 mobile, 9/20 desktop; dot 6 | extract §§ 2, 4 |
| checkbox | 18; privacy gap 12; text 13 / 1.45 | extract § 2 |
| progress | gap 10; segment 28 × 4, radius 2, gap 4 | extract § 4 |
| notice | padding 14 / 16, gap 12, text 14 / 1.45; dot 8 | extract § 3, handoff |
| success | tile 64, dot 14, title 32 / 500 Poppins, body 16 / 1.5 max 420 | extract § 3 |
| section | padding 120 / 80 / 140 / 80 desktop, 72 / 24 mobile; gap 72 / 24; left gap 26; body 18 / 1.55 → 16, max 500; receives gap 14, row gap 12, bubble 24, check 14, padding-top 8; call row gap 14 / 8, padding-top 18, text 15 | extract §§ 1, 4 |
| type | label 12 / 600 tracking 0.3 desktop, 12 / 400 mobile; value 15 desktop, 14 mobile; help 13 / 400 | extract §§ 2, 3, 4 |

Where a value is a size that varies between anchors, the token is a
`clamp()` between the 390 and 1440 values (Article VII fluid scale); the
anatomy switch (stroke, label weight, radius) is a `md:` swap.

Tokens retired with the v1 contact section (no reader left; grep before
deleting): `--contact-cols`, `--contact-col-gap`, `--contact-left-gap`,
`--contact-left-w`, `--contact-form-w`, `pt-contact-top`, the
`contact-glow-*` positions. `--work-*` tokens stay.

## 6 · State model (unchanged machine, extended view)

`SubmitState` stays `idle | invalid | uploading | sending | success |
server-error | cv-upload-error` (feature 031). The view adds `step` and
`attemptedStep` (R3) and `accepted` (R4); neither enters the values or the
payload.
