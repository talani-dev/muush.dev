# Contracts: v2 form components and the home section (feature 45)

No component calls a Nuxt composable or holds copy; strings arrive as props
(`rules.md` § R23, Article VI). No `ui/` file calls `fetch`
(`tests/forms-config.test.ts`). Every component < 200 lines (Article V).
Paths are under `app/features/forms/ui/` unless stated.

## Backend contract

Unchanged: `docs/business/landing/form-api-contract.md` §§ 3–6 plus the
`whatsappDialCode` of feature 32. The bodies are built only by
`logic/submissionPayloads.ts`, which this feature does not touch. Never sent:
consent, website, honeypot, step.

## Public barrel (`forms/index.ts`)

Same names, now the v2 components: `ContactForm`, `ApplicationForm`,
`useContactForm(Content)`, `useApplicationForm(Content)`,
`useContactSubmitter`, `useApplicationSubmitter`, types. Nothing new
is exported; `ui/legacy/` never is.

## `ContactForm.vue` / `ApplicationForm.vue`

| Prop | Type | Notes |
|---|---|---|
| `content` | `ContactFormContent` / `ApplicationFormContent` | data-model § 3 |
| `submitter` | `ContactSubmitter` / `ApplicationSubmitter` | from the page |
| `previewState?` | `'invalid' \| 'sending' \| 'uploading' \| 'server-error' \| 'cv-upload-error' \| 'success'` | Storybook only (`uploading`, `cv-upload-error`: application only) |
| `previewStep?` | `1 \| 2` | Storybook only, stepped view |
| `initial?` | `Partial<…Values>` | Storybook / tests (prefilled states) |

Both compose `SteppedForm` and pass their fields into its slots. The website
field does not exist.

## `SteppedForm.vue`

Props: `stepTitles`, `progressTemplate`, `continueLabel`, `backLabel`,
`privacy: { label; requiredHint; accepted }`, `submit: { label; busy;
busyLabel }`, `notice?: { text slot }`, `success?: FormSuccess props`,
`state`, `isStepped`, `step`, `readonly`. Emits `continue`, `back`,
`update:accepted`, `submit`. Slots: `details`, `profile`, `channel`,
`notice`. Renders `<form novalidate>` inside `FormPanel`; the Turnstile host
`<div>` and `HoneypotField` stay inside the panel outside the swapped
content.

Order (R2): stepped → [progress] · group 1 (`details`, `channel`, Continuar) ·
group 2 (`profile`, privacy, notice, submit, Atrás). Single → `details` ·
`profile` · `channel` · privacy · notice · submit.

## Field parts

| Component | Props | Behaviour |
|---|---|---|
| `FormPanel.vue` | slot | `GlassSurface` panel: mobile radius 22, padding 20, flat Blanco 12 % edge, no shadow; from `md` the `panel` preset (28, 36, top-lit edge, shadow); fill `vidrio-fondo`, blur 30; width 100 % max 600 |
| `FieldBlock.vue` | `id`, `label`, `error?`, slot | label `for=id`, help line `id-error` (13 / 400 red) |
| `TextField.vue` | `id`, `label`, `modelValue`, `type?`, `placeholder?`, `error?`, `required?`, `readonly?`, `autocomplete?` | input in field anatomy; `aria-invalid`, `aria-describedby` |
| `TextareaField.vue` | same | 96 tall, padding 14 / 16 |
| `SelectField.vue` | `id`, `label`, `modelValue`, `placeholder`, `options?` \| `groups?`, `error?`, `required?`, `readonly?` | native select, chevron 16 Gris 400 |
| `SegmentedControl.vue` | `id`, `label`, `modelValue`, `options`, `readonly?` | `role="radiogroup"`, native radios, arrows |
| `ContactChannelField.vue` | preference, country, number, content, errors, readonly | SegmentedControl + `WhatsappField` |
| `WhatsappField.vue`, `DialCodeSelect.vue` | as today's | v2 anatomy; transition off under reduced motion |
| `CvField.vue` | `id`, `label`, `placeholder`, `modelValue`, `error?`, `readonly?` | emits `update:modelValue`, `reject` (via `classifyCvFile`) |
| `ConsentCheckbox.vue` | `id="privacy"`, `label`, `modelValue` | native checkbox 18 × 18 radius 5 Blanco 25 % stroke, red check when ticked; label 13 / 1.45 Gris 400 |
| `FormProgress.vue` | `label`, `step`, `total` | `aria-live="polite"` text + `aria-hidden` bar |
| `FormNotice.vue` | slot | `role="alert"`; red 12 % fill, red 40 % edge, radius 10, 8 px dot |
| `FormSuccess.vue` | `title`, `body`, `action` | `role="status"`, focus title on mount, tile + pinging dot, `GlassButton` |

## `PrimaryButton.vue` (additive, `app/shared/ui/`)

New props: `unavailable?: boolean` → `aria-disabled="true"`, 70 % opacity,
`cursor-not-allowed`, still focusable, click still fires (the form guard
decides); `describedBy?: string` → `aria-describedby`. Existing props and
classes untouched; its story gains an "Unavailable" case.

## `landing/ui/AssessmentSection.vue`

Props: `AssessmentContent` + `formContent: ContactFormContent` +
`formSubmitter: ContactSubmitter`. Root `<section id="diagnostico"
class="relative isolate">`, `ShaderBackground preset="assessment"`, `Pill`,
`Heading level=2 size="diagnostico"`, `ReceivesList`, `ContactForm`, call row
(`<a href={callHref}>` link 15 / 600 Blanco + `arrow-right` 16 Red muush).

`landing/ui/ReceivesList.vue`: `label`, `items`; `<ul>` with the caption as
its accessible name (`aria-labelledby`), each `<li>` a bubble (decorative,
`aria-hidden`) + text.

## Nosotros

`about/ui/WorkWithMuushSection.vue`: props unchanged; renders the v2
`ApplicationForm` from the barrel.
