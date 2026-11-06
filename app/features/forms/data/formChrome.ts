import type { FormStep } from '@/features/forms/data/formSteps'

/**
 * The copy every v2 form carries around its own fields (feature 45,
 * data-model § 3): the step progress, Continuar / Atrás, the privacy
 * consent, the submit and its busy and retry labels, the "Error al enviar"
 * notice and the "Enviado" stack. Already translated; resolved by each
 * form's content composable from its own namespace (forms namespaces stay
 * independent, feature 16 D-4).
 */
export interface FormSuccessAction {
  label: string
  /** An external destination (the call-booking page). */
  href?: string
  /** An internal route (the home of the current locale). */
  to?: string
}

/**
 * The consent sentence around its "aviso de privacidad" link (feature 48):
 * the link opens the privacy page in a new tab, so a half-filled form is
 * not lost (pen-extract-48 § 4).
 */
export interface ConsentLabel {
  before: string
  link: string
  after: string
  /** The privacy page in the current locale. */
  href: string
}

export interface FormChromeContent {
  /** "Paso 1 de 2 · Tus datos", one per step, already interpolated. */
  progress: Record<FormStep, string>
  continue: string
  back: string
  privacy: {
    label: ConsentLabel
    /** Screen-reader-only reason the submit is unavailable (Roberto
     * 2026-11-02). */
    requiredHint: string
  }
  submit: string
  sending: string
  retry: string
  /** The notice text around its `mailto:` link. */
  error: { before: string; email: string; href: string; after: string }
  success: { title: string; body: string; action: FormSuccessAction }
}
