# Data Model: CTA final y formulario de contacto

## 1 · Contact form fields (`app/features/forms/data/contactFields.ts`)

Source of truth: `docs/business/landing/ui-map.md` § 7.

| id | kind | required | validation rule | notes |
|---|---|---|---|---|
| `name` | `text` | always | `length >= 2` | |
| `email` | `email` | always | RFC-shaped pattern (`HTMLInputElement` native `type="email"` constraint plus a same-shape JS check for the no-native-validation code path) | |
| `company` | `text` | never | none (free text) | `ui-map.md`: "Libre" |
| `identity` | `select` | always | one of 5 option ids | options: `company`, `independent`, `startup`, `creator`, `other` (`content.md`) |
| `need` | `textarea` | always | `length >= 10` | |
| `contactPreference` | `radio` | always | one of `email` \| `whatsapp` | default `email` |
| `whatsapp` | `tel` | only when `contactPreference === 'whatsapp'` | `digits(value) === 10` when `country === 'mx'` (the only country this feature ships — spec A-03) | not rendered at all when `contactPreference === 'email'` (FR-010) |

```ts
export type ContactFieldId =
  | 'name' | 'email' | 'company' | 'identity' | 'need'
  | 'contactPreference' | 'whatsapp'

export type IdentityOption =
  | 'company' | 'independent' | 'startup' | 'creator' | 'other'
  // NOT 'restaurant' — see spec.md A-02

export type ContactPreference = 'email' | 'whatsapp'

export interface ContactFormValues {
  name: string
  email: string
  company: string
  identity: IdentityOption | ''
  need: string
  contactPreference: ContactPreference
  whatsapp: string   // '' unless contactPreference === 'whatsapp'
}

export type ContactFormErrors = Partial<Record<ContactFieldId, string>>
```

## 2 · Validation rules (`app/features/forms/logic/useContactForm.ts`)

Pure functions, one per field, composed by a `validate(values): ContactFormErrors`
that:

1. Never validates `whatsapp` unless `values.contactPreference === 'whatsapp'`.
2. Returns errors in field order (`name`, `email`, `company`, `identity`,
   `need`, `contactPreference`, `whatsapp`) so "focus first invalid field" is
   `Object.keys(errors)[0]` without a separate ordering step.
3. Runs with **no** `await`, no `fetch` — every rule is synchronous string/
   regex/length arithmetic (FR-008, FR-014).

Error message **keys** (not literals) come from `forms.contact.fields.<id>.error<Kind>`,
e.g. `forms.contact.fields.name.errorRequired`,
`forms.contact.fields.email.errorFormat`,
`forms.contact.fields.whatsapp.errorDigits`.

## 3 · Submit state (`useContactForm`'s return shape)

```ts
export type ContactSubmitState = 'idle' | 'invalid'
// 'sending' | 'success' | 'server-error' exist only as ContactForm's
// `previewState` prop — never produced by this composable (plan.md D-2).

export interface UseContactFormReturn {
  values: Ref<ContactFormValues>
  errors: ComputedRef<ContactFormErrors>
  state: Ref<ContactSubmitState>
  firstInvalidFieldId: ComputedRef<ContactFieldId | undefined>
  onSubmit: (event: Event) => void   // preventDefault, validate, set state, focus
  onContactPreferenceChange: (value: ContactPreference) => void
  // resets values.whatsapp = '' when switching away from 'whatsapp' — FR-011
}
```

## 4 · `ContactForm.vue` props

```ts
interface Props {
  /** Already-translated field content: labels, placeholders, options, messages. */
  content: ContactFormContent
  /**
   * Storybook-only. The shipped page never sets this — grep-provable, one
   * prop name in one file (plan.md D-2). Absent → the component renders
   * whatever `useContactForm`'s real `state` computes (`idle` | `invalid`).
   */
  previewState?: 'sending' | 'success' | 'server-error'
}
```

## 5 · Tokens

### 5.1 · Reused verbatim (no new declaration)

| Token | Value | Consumer |
|---|---|---|
| `--text-form-label` | 12px/500, ls 0.042em | every field's `<label>` |
| `--text-input-value` | 15px | every field's control text |
| `--spacing-form-gap` | clamp 14→16 | the form's own field-to-field gap |
| `--spacing-glass-dark` | clamp | `GlassPanel variant="dark"`'s padding |
| `--spacing-btn-submit-x` | clamp | `BotonPrimario variant="submit"` |
| `--radius-control` | 12px (0.75rem) | every field control's corner radius |
| `--radius-icon` | 10px | the select's chevron wrapper, if boxed |

### 5.2 · New — `@theme inline` (consumed as utilities)

| Token | Value | Derivation |
|---|---|---|
| `--spacing-contact-form-w` | `clamp(21.375rem, …, 41.25rem)` | 342 → 660, the two frame widths |
| `--spacing-contact-left-w` | `clamp(21.375rem, …, ??)` desktop width **UNVERIFIED** — leader's brief gives only the mobile left-block width (342×231); the desktop left-block width is implied by `1440 − 80×2 − 660 − gap`, not separately confirmed. Flagged in tasks.md as a leader-confirm item before implementation. | |
| `--spacing-contact-glow-foco-x` / `-y` | clamp, 2 endpoints | red-400 60% 1500-760, converted section-relative per rules.md §§ R29/R48 |
| `--spacing-contact-glow-wine-x` / `-y` | clamp, 2 endpoints | wine-300 37% 1000-560 |
| `--spacing-contact-glow-cierre-x` / `-y` | clamp, 2 endpoints | wine-400 28% 900-520 |
| `--spacing-contact-whatsapp-h` | the WhatsApp field's mounted height, for the enter/leave transition's `max-height` | measured from `TextField`'s own rendered height once built (a component-internal value, not a design measurement) |

None of the six glow-anchor tokens may be named `--spacing-glow-*` (§ R36) —
they follow the `--spacing-contact-*` pattern every prior section used
(`--spacing-hero-glow-*`, `--spacing-purpose-glow-*`).

### 5.3 · New — `:root` (consumed by hand-written CSS)

| Token | Value | Why `:root` and not `@theme` |
|---|---|---|
| `--duration-contact-whatsapp-toggle` | seeded near the site's existing fade durations (`--duration-purpose-reveal` precedent), owner Clau, ⚠️ open value | Tailwind v4 has no `transition-duration` theme namespace (`findings.md` § R52); read by a `<style scoped>` in the WhatsApp field's wrapper |
| `--color-glass-dark-contact` | `--dark-glass` at a **higher** opacity than 65%, raised until 4.5:1 clears against `--text-input-value` in the worst-case glow overlap — exact ratio computed and recorded as a task, not asserted here | a derived contrast fix, consumed by one component's own class, not the shared `GlassPanel` recipe (plan.md D-3) |

## 6 · i18n keys

### `forms.contact.*` (field-level, shared vocabulary with feature 20's future `forms.application.*`)

```
forms.contact.fields.name.label
forms.contact.fields.name.errorRequired
forms.contact.fields.email.label
forms.contact.fields.email.errorRequired
forms.contact.fields.email.errorFormat
forms.contact.fields.company.label
forms.contact.fields.identity.label
forms.contact.fields.identity.errorRequired
forms.contact.fields.identity.options.company
forms.contact.fields.identity.options.independent
forms.contact.fields.identity.options.startup
forms.contact.fields.identity.options.creator
forms.contact.fields.identity.options.other
forms.contact.fields.need.label
forms.contact.fields.need.errorRequired
forms.contact.fields.need.errorLength
forms.contact.fields.contactPreference.label
forms.contact.fields.contactPreference.options.email
forms.contact.fields.contactPreference.options.whatsapp
forms.contact.fields.whatsapp.label
forms.contact.fields.whatsapp.errorRequired
forms.contact.fields.whatsapp.errorDigits
forms.contact.submit                     # "Enviar" / "Submit"
forms.contact.sending                    # "Enviando…" / "Sending…" — story only
forms.contact.success.title              # ui-map.md § 7 copy, verbatim, ES/EN
forms.contact.error.title                # ui-map.md § 7 copy, verbatim, ES/EN
forms.contact.error.fallback             # the support@muush.dev alternate route
```

### `landing.contact.*` (section chrome)

```
landing.contact.eyebrow          # "Contacto"
landing.contact.heading          # "Cuéntanos tu proyecto." — placeholder pending Roberto/Clau (spec A-01)
landing.contact.body             # placeholder pending Roberto/Clau (spec A-01)
landing.contact.ctaSecondary     # "Agenda una llamada" — reuses the approved string
```

`landing.contact.ctaSecondary` intentionally duplicates the Hero's own
`landing.hero.ctaSecondary` value; both are approved copy for the same
button in two places, matching the precedent
`specs/013-purpose-section/spec.md` set for `what.copy` / `hero.subhead`
(report the duplication, don't collapse the keys).
