import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ApplicationFormContent } from '@/features/forms'
import WorkWithMuushSection from './WorkWithMuushSection.vue'

/**
 * `Work with muush`, the About page's second section. Switch the viewport
 * control between *Móvil (390)* and *Escritorio (1440)* to see the layout
 * reflow between the stacked mobile flow and the two-column desktop grid —
 * the same mechanism `Landing/ContactSection`'s story demonstrates.
 *
 * Every prop is a fixture. The component calls no Nuxt composable, which is
 * why it renders here with no router, no i18n instance and no Nuxt runtime
 * (`docs/business/rules.md` § R23).
 */
const meta = {
  title: 'About/WorkWithMuushSection',
  component: WorkWithMuushSection,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WorkWithMuushSection>

export default meta
type Story = StoryObj<typeof meta>

const areas = {
  it: 'IT',
  product: 'Product',
  projectManagement: 'Project management',
  sales: 'Sales',
  marketing: 'Marketing',
  creative: 'Creative',
}

const roles = {
  it: { placeholder: 'Rol por confirmar' },
  product: { placeholder: 'Rol por confirmar' },
  projectManagement: { placeholder: 'Rol por confirmar' },
  sales: { placeholder: 'Rol por confirmar' },
  marketing: { placeholder: 'Rol por confirmar' },
  creative: { placeholder: 'Rol por confirmar' },
}

const spanishForm: ApplicationFormContent = {
  fields: {
    name: { label: 'Nombre', errorRequired: 'Escribe tu nombre' },
    email: {
      label: 'Correo',
      errorRequired: 'Escribe tu correo',
      errorFormat: 'Formato de correo inválido',
    },
    areaRole: {
      label: 'Área y rol',
      placeholder: 'Área y rol',
      errorRequired: 'Elige un área y un rol',
      areas,
      roles,
    },
    portfolio: {
      label: 'Portafolio',
      placeholder: 'https://tu-portafolio.com',
      errorFormat: 'Ingresa una URL válida',
    },
    linkedin: {
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/in/tu-usuario',
      errorFormat: 'Ingresa una URL válida',
    },
    cv: {
      label: 'CV',
      placeholder: 'Adjuntar CV · PDF',
      errorFormat: 'Solo se aceptan archivos PDF',
      errorSize: 'El archivo debe pesar máximo 5MB',
    },
    contactPreference: {
      label: '¿Cómo prefieres que te contactemos?',
      options: { email: 'Correo', whatsapp: 'WhatsApp' },
    },
    whatsapp: {
      label: 'Número de WhatsApp',
      errorRequired: 'Escribe tu número',
      errorDigits: 'Deben ser 10 dígitos',
    },
  },
  submit: 'Enviar',
  sending: 'Enviando…',
  success: {
    title:
      'Gracias, ya tenemos tu perfil. Te escribimos cuando haya un proyecto donde encajes.',
  },
  error: {
    title:
      'No pudimos enviarlo. Escríbenos a support@muush.dev o por WhatsApp y lo resolvemos.',
    fallback: 'support@muush.dev',
  },
}

const englishForm: ApplicationFormContent = {
  ...spanishForm,
  fields: {
    ...spanishForm.fields,
    name: { label: 'Name', errorRequired: 'Enter your name' },
    contactPreference: {
      label: 'How do you prefer we contact you?',
      options: { email: 'Email', whatsapp: 'WhatsApp' },
    },
  },
  submit: 'Send',
  sending: 'Sending…',
  success: {
    title:
      "Thanks, we've got your profile. We'll reach out when there's a project that fits.",
  },
}

const spanish = {
  eyebrow: 'Work with muush',
  headline: 'Tú eliges en qué proyectos entras, con quién y desde dónde.',
  body: 'Si trabajas en tecnología, diseño o producción y quieres sumarte a nuestro talent pool, cuéntanos qué haces.',
  formContent: spanishForm,
}

const english = {
  eyebrow: 'Work with muush',
  headline:
    'You choose which projects you join, who you work with, and where from.',
  body: 'If you work in technology, design or production and want to join our talent pool, tell us what you do.',
  formContent: englishForm,
}

export const Desktop: Story = {
  args: spanish,
  globals: { viewport: { value: 'desktop' } },
}

export const Mobile: Story = {
  args: spanish,
  globals: { viewport: { value: 'mobile' } },
}

export const DesktopEnglish: Story = {
  args: english,
  globals: { viewport: { value: 'desktop' } },
}

export const MobileEnglish: Story = {
  args: english,
  globals: { viewport: { value: 'mobile' } },
}
