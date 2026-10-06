# Contract: pages → sections → forms (the submitter seam)

## Barrel additions (`app/features/forms/index.ts`)

```ts
export type { ContactSubmitter, ApplicationSubmitter, SubmissionOutcome } from './data/submissionContract'
export { useContactSubmitter, useApplicationSubmitter } from './logic/useFormSubmission'
```

Nothing else new is exported. The API client, Turnstile composable, payload
builders and flows stay internal to `forms`.

## Prop changes

| Component | New prop | Type | Required |
|---|---|---|---|
| `forms/ui/ContactForm.vue` | `submitter` | `ContactSubmitter` | yes |
| `forms/ui/ApplicationForm.vue` | `submitter` | `ApplicationSubmitter` | yes |
| `landing/ui/ContactSection.vue` | `formSubmitter` | `ContactSubmitter` (type via `@/features/forms`) | yes, passed through |
| `about/ui/WorkWithMuushSection.vue` | `formSubmitter` | `ApplicationSubmitter` | yes, passed through |

`previewState` stays on both forms, Storybook-only; no page or section sets it
(asserted by test).

## Pages

```ts
// app/pages/index.vue
const contactSubmitter = useContactSubmitter()
// <ContactSection … :form-content="contactForm" :form-submitter="contactSubmitter" />

// app/pages/nosotros.vue
const applicationSubmitter = useApplicationSubmitter()
```

## Submitter behaviour guarantees

- `engage(host)` is idempotent; safe to call on every `focusin`. It starts the
  lazy script load and renders the widget into `host` once. Never runs during
  SSR (forms only call it from DOM event handlers).
- `submit(values)` never throws; every error path resolves to
  `{ kind: 'failure' }`. The form composable calls `engage(host)` right
  before `submit` as well as on `focusin`, so a submit without prior focus
  still has a widget; if `engage` was never called, the token request fails
  and `submit` resolves to `failure`.
- `submit` assumes client validation passed and the spam guard allowed it;
  the composable enforces both before calling.
