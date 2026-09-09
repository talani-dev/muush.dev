import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ContactFormContent } from '@/features/forms'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import ContactSection from './ContactSection.vue'

/**
 * `06 CTA final`, the landing's last section. Switch the viewport control
 * between *Móvil (390)* and *Escritorio (1440)* to see the one place this
 * section's mobile order is not a rescale of desktop: the alternate route
 * moves from inside the left column (desktop) to below the form (mobile).
 *
 * Every prop is a fixture. The component calls no Nuxt composable, which is
 * why it renders here with no router, no i18n instance and no Nuxt runtime
 * (`docs/business/rules.md` § R23).
 */
const meta = {
  title: 'Landing/ContactSection',
  component: ContactSection,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ContactSection>

export default meta
type Story = StoryObj<typeof meta>

const spanishForm: ContactFormContent = {
  fields: {
    name: { label: 'Nombre', errorRequired: 'Escribe tu nombre' },
    email: {
      label: 'Correo',
      errorRequired: 'Escribe tu correo',
      errorFormat: 'Formato de correo inválido',
    },
    company: { label: 'Empresa o proyecto' },
    identity: {
      label: '¿Cómo te identificas?',
      errorRequired: 'Elige una opción',
      options: {
        realEstate: 'Bienes raíces/inmobiliaria',
        creator: 'Creador de contenido/marca personal',
        company: 'Empresa pública o privada',
        independent: 'Emprendedor o persona física',
        startup: 'Startup',
        other: 'Otro',
      },
    },
    need: {
      label: '¿Qué necesitas?',
      errorRequired: 'Cuéntanos qué necesitas',
      errorLength: 'Cuéntanos un poco más',
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
      'Listo, ya lo recibimos. Te respondemos por correo en menos de 24 horas hábiles.',
  },
  error: {
    title:
      'No pudimos enviarlo. Escríbenos a support@muush.dev o por WhatsApp y lo resolvemos.',
    fallback: 'support@muush.dev',
  },
}

const spanish = {
  eyebrow: 'Contacto',
  heading: 'Cuéntanos tu proyecto.',
  body: 'Déjanos lo básico y te respondemos por donde prefieras. Si ya sabes qué necesitas, agenda una llamada directo con el equipo.',
  ctaSecondary: 'Agenda una llamada',
  altQuestion: '¿Ya sabes qué necesitas?',
  callHref: CALL_BOOKING_URL,
  formContent: spanishForm,
}

export const Desktop: Story = {
  args: spanish,
  globals: { viewport: { value: 'desktop' } },
}

export const Mobile: Story = {
  args: spanish,
  globals: { viewport: { value: 'mobile' } },
}
