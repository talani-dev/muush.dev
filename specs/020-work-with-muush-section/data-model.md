# Data Model: Work with muush — the application form

## 1 · Application form fields (`app/features/forms/data/applicationFields.ts`)

Source of truth: `docs/business/landing/ui-map.md` § 9, plus this feature's
own resolved assumptions for the two gaps ui-map.md § 9 itself flags.

| id | kind | required | validation rule | notes |
|---|---|---|---|---|
| `name` | `text` | always | `length >= 2` | same rule as `contactFields.ts`'s `name` (`NAME_MIN_LENGTH`) |
| `email` | `email` | always | same pattern as `contactFields.ts`'s `email` | |
| `areaRole` | `select` (grouped) | always | one of the role ids nested under any area | six area headers are non-selectable group labels, never a valid value themselves |
| `portfolio` | `url` | never | well-formed URL when non-empty | `ui-map.md` § 9: no row marks it required |
| `linkedin` | `url` | never | well-formed URL when non-empty | same |
| `cv` | `file` | **CV_REQUIRED flag — see § 3** | `type === 'application/pdf'` and `size <= CV_MAX_BYTES` (5MB, proposed — `ui-map.md` § 9) | never read into `FormData`, never transmitted (spec FR-011) |
| `contactPreference` | `radio` | always | one of `email` \| `whatsapp` | default `email`, identical mechanism to `contactFields.ts` |
| `whatsapp` | `tel` | only when `contactPreference === 'whatsapp'` | `digits(value) === 10` for México, reused by symmetry from `contactFields.ts`'s `WHATSAPP_MX_DIGIT_COUNT` (`ui-map.md` § 9 says "mismo campo condicional", not a separate rule) | not rendered at all when `contactPreference === 'email'` |

```ts
export type ApplicationFieldId =
  | 'name' | 'email' | 'areaRole' | 'portfolio' | 'linkedin' | 'cv'
  | 'contactPreference' | 'whatsapp'

export type ContactPreference = 'email' | 'whatsapp'  // re-exported from contactFields.ts, not redeclared

export interface ApplicationFormValues {
  name: string
  email: string
  areaRole: string           // '' unless a role (not an area header) is picked
  portfolio: string          // '' is valid
  linkedin: string           // '' is valid
  cv: File | null            // never serialized, never sent
  contactPreference: ContactPreference
  whatsapp: string           // '' unless contactPreference === 'whatsapp'
}

export type ApplicationFormErrors = Partial<Record<ApplicationFieldId, string>>
```

## 2 · Área y rol catalog (`ROLE_CATALOG`)

Six area headers are CONFIRMED (`ui-map.md` § 9): IT, Product, Project
management, Sales, Marketing, Creative. The specific roles under each are
UNVERIFIED — not in `content.md`, not in `design-extract.md`, and the Notion
source `ui-map.md` defers to is inaccessible to this process (spec.md
Assumptions; plan.md D-6).

```ts
export type AreaId =
  | 'it' | 'product' | 'projectManagement' | 'sales' | 'marketing' | 'creative'

export interface RoleCatalogEntry {
  area: AreaId
  /**
   * ⚠️ UNVERIFIED placeholder — owner Clau. Each area ships exactly one
   * role id, `'placeholder'`, until the real per-area role list arrives.
   * Adding real roles is a data-only change to this array (plan.md D-6).
   */
  roleIds: string[]
}

export const ROLE_CATALOG: RoleCatalogEntry[] = [
  { area: 'it', roleIds: ['placeholder'] },
  { area: 'product', roleIds: ['placeholder'] },
  { area: 'projectManagement', roleIds: ['placeholder'] },
  { area: 'sales', roleIds: ['placeholder'] },
  { area: 'marketing', roleIds: ['placeholder'] },
  { area: 'creative', roleIds: ['placeholder'] },
]
```

`SelectField`'s new `groups` prop (plan.md D-4) is built from this catalog by
`useApplicationForm`/the content composable, mapping each `AreaId` to its
translated area label (`forms.application.fields.areaRole.areas.<id>`) and
each `roleIds` entry to its translated role label
(`forms.application.fields.areaRole.roles.<areaId>.<roleId>`).

## 3 · CV mandatory-ness (`CV_REQUIRED`, plan.md D-5)

```ts
/**
 * ⚠️ Open business decision — `docs/business/landing/decisions-open.md` #7,
 * owned by Roberto/Clau. Ships `false` (matching that document's own
 * recorded recommendation: "opcional, con portafolio/LinkedIn como
 * respaldo"). Consumed in exactly one place inside `validateApplicationForm`
 * — flipping it later is a one-line change, not a validation rewrite.
 */
export const CV_REQUIRED = false

/** `ui-map.md` § 9: "máximo 5MB propuesto" — a proposal, not a confirmed value. */
export const CV_MAX_BYTES = 5 * 1024 * 1024

export const CV_ACCEPTED_TYPE = 'application/pdf'
```

## 4 · Validation rules (`app/features/forms/logic/useApplicationForm.ts`)

Pure functions, one per field, composed by `validateApplicationForm(values): ApplicationFormErrors`
that:

1. Never validates `whatsapp` unless `values.contactPreference === 'whatsapp'`.
2. Validates `cv` for format/size whenever a file is present, regardless of
   `CV_REQUIRED`; validates its *absence* as an error only when
   `CV_REQUIRED === true`.
3. Never validates `portfolio`/`linkedin` when empty — well-formed-URL only
   applies to a non-empty value.
4. Returns errors in field order (`name`, `email`, `areaRole`, `portfolio`,
   `linkedin`, `cv`, `contactPreference`, `whatsapp`) so "focus first invalid
   field" is `Object.keys(errors)[0]`, the same mechanism
   `useContactForm.ts` already uses.
5. Runs with **no** `await`, no `fetch`, no `FormData` construction — every
   rule is synchronous property access on the `File` object or string
   arithmetic (spec FR-003, FR-011).

Error message **keys** come from `forms.application.fields.<id>.error<Kind>`,
e.g. `forms.application.fields.cv.errorFormat`,
`forms.application.fields.cv.errorSize`,
`forms.application.fields.areaRole.errorRequired`.

## 5 · Submit state (`useApplicationForm`'s return shape)

```ts
export type ApplicationSubmitState = 'idle' | 'invalid'
// 'sending' | 'success' | 'server-error' exist only as ApplicationForm's
// `previewState` prop — never produced by this composable (plan.md D-1,
// mirroring feature 16's D-2).

export interface UseApplicationFormReturn {
  values: Ref<ApplicationFormValues>
  errors: ComputedRef<ApplicationFormErrors>
  state: Ref<ApplicationSubmitState>
  firstInvalidFieldId: ComputedRef<ApplicationFieldId | undefined>
  onSubmit: (event: Event) => void
  onContactPreferenceChange: (value: ContactPreference) => void
  onCvChange: (file: File | null) => void
}
```

## 6 · `ApplicationForm.vue` props

```ts
interface Props {
  content: ApplicationFormContent   // already-translated field content
  previewState?: 'sending' | 'success' | 'server-error'  // Storybook-only
}
```

## 7 · `SelectField.vue`'s additive extension (plan.md D-4)

```ts
interface OptionGroup {
  label: string
  options: Option[]
}

interface Props {
  id: string
  label: string
  modelValue: string
  /** Existing flat shape — untouched, still used by ContactForm's `identity` field. */
  options?: Option[]
  /** NEW — when supplied, renders <optgroup> per group instead of flat <option>s. */
  groups?: OptionGroup[]
  placeholder: string
  error?: string
  required?: boolean
  readonly?: boolean
}
```

Exactly one of `options`/`groups` is supplied per call site; `ContactForm`'s
identity field keeps passing `options` with no code change.

## 8 · `FileField.vue` props

```ts
interface Props {
  id: string
  label: string
  /** The currently-selected file, or null. Presentational — no upload. */
  modelValue: File | null
  placeholder: string       // "Adjuntar CV · PDF" / "Attach CV · PDF"
  accept?: string           // defaults to 'application/pdf'
  error?: string
  required?: boolean
  readonly?: boolean
}
```

`FileField.vue` never constructs a `FormData`, never calls `fetch`/`XHR`,
never creates an object URL that outlives the component (plan.md D-1).

## 9 · Tokens

### 9.1 · Reused verbatim (no new declaration)

| Token | Value | Consumer |
|---|---|---|
| `--text-form-label` / `--text-input-value` | existing | every field, including `FileField`'s filename display |
| `--spacing-form-gap` | existing | the form's own field-to-field gap |
| `--spacing-field-y` / `-x` / `-label-gap` | existing | every field control |
| `--radius-control` | existing | every field control's corner radius |
| `--color-glow-red-400-60` + `--spacing-glow-1500-760` | existing (feature 16) | the section's `foco` glow |
| `--color-glow-wine-300-37` + `--spacing-glow-1000-560` | existing (feature 16) | the section's `wine` glow |
| `--color-glow-wine-400-28` + `--spacing-glow-900-520` | existing (feature 16) | the section's `cierre` glow |
| `--color-glass-dark` / `--color-glass-dark-line` | existing | the form's outer glass panel, unless this section's own contrast check (mirroring feature 16 plan.md D-3) requires the same darker `--color-glass-dark-contact`-style step — a task, not assumed here |
| `--duration-contact-whatsapp-toggle` | existing (feature 16) | reused verbatim for this section's own WhatsApp field transition — identical mechanism, no reason to duplicate the duration token |

### 9.2 · New — `@theme inline` (consumed as utilities)

| Token | Value | Derivation |
|---|---|---|
| `--spacing-work-left-w` | `clamp(…, 342px → 520px)` | Left block width, both frames |
| `--spacing-work-form-w` | `clamp(…, 342px → 660px)` | form width, both frames — same endpoints as `--contact-form-w` by design coincidence, independently declared per this repo's per-section token convention (no cross-section token reuse exists elsewhere for layout/spacing) |
| `--spacing-work-col-gap` | `6.25rem` (100px) | desktop only (`lg` and above): form `x700` − (left `x80` + left width `520`) = 100 |
| `--spacing-work-stack-gap` | `2rem` (32px) | mobile only (below `lg`): form `y290` − (left `y0` + left height `258`) = 32; NOT the generic `--spacing-form-gap` (14–16px) — a distinct, measured value, per plan.md's own note against silently substituting a smaller generic gap |
| `--spacing-work-top` | `clamp(…, 130px desktop → 0px mobile)` | this section's own top padding — the frame's own Left-block y-offset, taken directly (plan.md D-3); no bottom padding (next block, if any, owns that) |
| `--spacing-work-glow-foco-x` / `-y` | clamp, 2 endpoints per axis | red-400 60% 1500×760, converted section-relative (page-absolute centres: 1170,3030 desktop · 410,3130 mobile) |
| `--spacing-work-glow-wine-x` / `-y` | clamp, 2 endpoints per axis | wine-300 37% 1000×560 (1580,3240 · 480,3430) |
| `--spacing-work-glow-cierre-x` / `-y` | clamp, 2 endpoints per axis | wine-400 28% 900×520 (190,3350 · 80,3610) |

None of the nine glow-anchor/layout tokens may be named `--spacing-glow-*`
(§ R36) — they follow the `--spacing-work-*` pattern every prior section used
(`--spacing-contact-*`, `--spacing-about-hero-*`).

### 9.3 · New — `FileField`'s own recipe (design-extract.md § FormField, "upload" variant)

| Token | Value | Why not the shared field recipe |
|---|---|---|
| `--color-glass-upload` | `#FBF8F60A` (fill) | the upload control's own fill, distinct from the shared `bg-glass-bone` other fields use (`design-extract.md` § FormField: "fill `#FBF8F60A`, stroke `#FBF8F229`... + ícono `paperclip`") |
| `--color-glass-upload-line` | `#FBF8F229` (stroke) | same source |
| `--spacing-upload-y` / `-x` | `1rem` (16px) | "padding 16" per the same recipe, distinct from the other fields' 14/16 |
| `--spacing-upload-gap` | `0.625rem` (10px) | "gap 10" between the paperclip icon and the label text |

## 10 · i18n keys

### `forms.application.*` (field-level, sibling namespace to `forms.contact.*` — feature 16 plan.md D-4's own anticipation)

```
forms.application.fields.name.label
forms.application.fields.name.placeholder
forms.application.fields.name.errorRequired
forms.application.fields.email.label
forms.application.fields.email.placeholder
forms.application.fields.email.errorRequired
forms.application.fields.email.errorFormat
forms.application.fields.areaRole.label
forms.application.fields.areaRole.placeholder
forms.application.fields.areaRole.errorRequired
forms.application.fields.areaRole.areas.it
forms.application.fields.areaRole.areas.product
forms.application.fields.areaRole.areas.projectManagement
forms.application.fields.areaRole.areas.sales
forms.application.fields.areaRole.areas.marketing
forms.application.fields.areaRole.areas.creative
forms.application.fields.areaRole.roles.<areaId>.placeholder   # ⚠️ UNVERIFIED, owner Clau (§ 2)
forms.application.fields.portfolio.label
forms.application.fields.portfolio.placeholder
forms.application.fields.portfolio.errorFormat
forms.application.fields.linkedin.label
forms.application.fields.linkedin.placeholder
forms.application.fields.linkedin.errorFormat
forms.application.fields.cv.label
forms.application.fields.cv.placeholder
forms.application.fields.cv.errorFormat
forms.application.fields.cv.errorSize
forms.application.fields.cv.errorRequired          # only shown if CV_REQUIRED flips true
forms.application.fields.contactPreference.label
forms.application.fields.contactPreference.options.email
forms.application.fields.contactPreference.options.whatsapp
forms.application.fields.whatsapp.label
forms.application.fields.whatsapp.errorRequired
forms.application.fields.whatsapp.errorDigits
forms.application.submit                    # "Enviar" / "Submit" — reused string, own key per module isolation (Article III)
forms.application.sending                   # story only
forms.application.success.title             # ui-map.md § 9 copy, verbatim, ES/EN — approved
forms.application.error.title                # same shape as forms.contact.error.title, story only
forms.application.error.fallback
```

### `about.work.*` (section chrome)

```
about.work.eyebrow          # Pill text — approved copy pending final string choice (see spec.md)
about.work.headline         # "Tú eliges en qué proyectos entras, con quién y desde dónde." — approved, this session
about.work.body             # "Si trabajas en tecnología..." — approved, this session
```

`pages.about.work` (the placeholder key `nosotros.vue` currently reads for
its `#work` heading) is retired in the same change — its only consumer is
the placeholder `<section>` this feature replaces.
