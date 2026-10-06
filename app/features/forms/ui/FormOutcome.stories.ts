import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FormOutcome from './FormOutcome.vue'

/**
 * The outcome panel both forms render. The copy below mirrors the approved
 * strings (`ui-map.md` §§ 7, 9; spec OA-2/OA-4); the forms receive it
 * translated through their content composables.
 */
const meta = {
  title: 'Forms/FormOutcome',
  component: FormOutcome,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FormOutcome>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    kind: 'success',
    message:
      'Listo, ya lo recibimos. Te respondemos por correo en menos de 24 horas hábiles.',
    errorFallback: 'support@muush.dev',
  },
}

export const SuccessWithCvNote: Story = {
  args: {
    kind: 'success',
    message:
      'Gracias, ya tenemos tu perfil. Te escribimos cuando haya un proyecto donde encajes.',
    note: 'Tu perfil llegó, pero no pudimos adjuntar tu CV. Si quieres, mándalo a support@muush.dev.',
    errorFallback: 'support@muush.dev',
  },
}

export const ServerError: Story = {
  args: {
    kind: 'server-error',
    message:
      'No pudimos enviarlo. Escríbenos a support@muush.dev o por WhatsApp y lo resolvemos.',
    errorFallback: 'support@muush.dev',
  },
}
