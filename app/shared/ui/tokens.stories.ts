import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * The vocabulary the eight primitives are written in: the four colour ramps
 * and the fluid type roles that live in app/assets/css/global.css.
 *
 * This file is deliberately lowercase — Article VIII reserves PascalCase for
 * components, and this is not one. It sits under `Foundations/` rather than
 * `Shared/UI/` for the same reason.
 *
 * Every swatch is a `bg-*` utility and every specimen a `text-*` role, so a
 * swatch that renders wrong is a token that is wrong, not a story that is
 * wrong. Nothing here adds or overrides a token.
 */
const meta = {
  title: 'Foundations/Design tokens',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Swatch {
  name: string
  className: string
}

/*
 * Complete class names, never `bg-${ramp}-${step}`: Tailwind reads source
 * text, so a concatenated name is a utility the stylesheet never emits.
 */
const ramps: { ramp: string; steps: Swatch[] }[] = [
  {
    ramp: 'bone · fondo',
    steps: [
      { name: 'bone-100', className: 'bg-bone-100' },
      { name: 'bone-200', className: 'bg-bone-200' },
      { name: 'bone-300', className: 'bg-bone-300' },
      { name: 'bone-400', className: 'bg-bone-400' },
      { name: 'bone-500', className: 'bg-bone-500' },
    ],
  },
  {
    ramp: 'ink · texto y estructura',
    steps: [
      { name: 'ink-100', className: 'bg-ink-100' },
      { name: 'ink-200', className: 'bg-ink-200' },
      { name: 'ink-300', className: 'bg-ink-300' },
      { name: 'ink-400', className: 'bg-ink-400' },
      { name: 'ink-500', className: 'bg-ink-500' },
    ],
  },
  {
    ramp: 'red · acento',
    steps: [
      { name: 'red-100', className: 'bg-red-100' },
      { name: 'red-200', className: 'bg-red-200' },
      { name: 'red-300', className: 'bg-red-300' },
      { name: 'red-400', className: 'bg-red-400' },
      { name: 'red-500', className: 'bg-red-500' },
    ],
  },
  {
    ramp: 'wine · estructura',
    steps: [
      { name: 'wine-100', className: 'bg-wine-100' },
      { name: 'wine-200', className: 'bg-wine-200' },
      { name: 'wine-300', className: 'bg-wine-300' },
      { name: 'wine-400', className: 'bg-wine-400' },
      { name: 'wine-500', className: 'bg-wine-500' },
    ],
  },
]

/** One line per fluid role, captioned with the class an author would write. */
const typeRoles: { className: string; specimen: string }[] = [
  { className: 'text-display', specimen: 'hablamos negocio y código' },
  { className: 'text-h1', specimen: 'hablamos negocio y código' },
  { className: 'text-h2', specimen: 'hablamos negocio y código' },
  { className: 'text-h2-alt', specimen: 'hablamos negocio y código' },
  { className: 'text-h3', specimen: 'hablamos negocio y código' },
  { className: 'text-h3-alt', specimen: 'hablamos negocio y código' },
  { className: 'text-lead', specimen: 'hablamos negocio y código' },
  { className: 'text-copy', specimen: 'hablamos negocio y código' },
  { className: 'text-body-lg', specimen: 'hablamos negocio y código' },
  { className: 'text-body', specimen: 'hablamos negocio y código' },
  { className: 'text-body-sm', specimen: 'hablamos negocio y código' },
  { className: 'text-service-name', specimen: 'Software & Digital Solutions' },
  {
    className: 'text-service-brief',
    specimen: 'Plataformas, sistemas internos, portales e integraciones.',
  },
  { className: 'text-form-label', specimen: 'Correo' },
  { className: 'text-input-value', specimen: 'support@muush.dev' },
  { className: 'text-pill', specimen: 'Technology solution studio' },
  { className: 'text-meta', specimen: 'Próximamente' },
  { className: 'text-wordmark', specimen: 'muush.dev' },
  { className: 'text-button', specimen: 'Cuéntanos tu proyecto' },
  { className: 'text-button-sm', specimen: 'Cuéntanos tu proyecto' },
  { className: 'text-link', specimen: 'Agenda una llamada →' },
  { className: 'text-link-lg', specimen: 'Agenda una llamada →' },
]

export const ColourRamps: Story = {
  render: () => ({
    setup: () => ({ ramps }),
    template: `
      <div class="flex flex-col gap-8 font-instrument text-bone-100">
        <section v-for="{ ramp, steps } in ramps" :key="ramp">
          <h2 class="text-service-name pb-3">{{ ramp }}</h2>
          <div class="flex flex-wrap gap-4">
            <figure v-for="step in steps" :key="step.name" class="w-28">
              <div :class="['h-16 w-full rounded-icon', step.className]"></div>
              <figcaption class="text-meta text-bone-300 pt-2">
                {{ step.name }}
              </figcaption>
            </figure>
          </div>
        </section>
      </div>
    `,
  }),
}

/**
 * Every role below interpolates between the design's only two frames, 390
 * and 1440. Move the viewport control between Móvil (390) and Escritorio
 * (1440): the specimens resize with no breakpoint anywhere.
 */
export const TypeScale: Story = {
  render: () => ({
    setup: () => ({ typeRoles }),
    template: `
      <div class="flex flex-col gap-6 font-instrument text-bone-100">
        <figure v-for="role in typeRoles" :key="role.className">
          <figcaption class="text-meta text-bone-300">
            {{ role.className }}
          </figcaption>
          <p :class="role.className">{{ role.specimen }}</p>
        </figure>
      </div>
    `,
  }),
}
