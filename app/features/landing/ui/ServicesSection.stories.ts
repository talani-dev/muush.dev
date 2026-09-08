import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ServicesSection from './ServicesSection.vue'

/**
 * `03 Servicios`, the landing's third section. Switch the viewport control
 * between *Móvil (390)* and *Escritorio (1440)* — these are two compositions,
 * not one layout rescaled:
 *
 * - **Escritorio** — five always-visible nodes scattered by hand, joined by
 *   four thin connector lines, with a Delivery-closing line beneath them. No
 *   hover state exists here at all.
 * - **Móvil** — a vertical timeline against a spine. The lyrics dimming effect
 *   is scroll-driven and needs a live `IntersectionObserver`, so it is not
 *   reviewable from a static story — every item renders at full strength
 *   here, which is also the no-JS/reduced-motion state (`ui-map.md` § 10).
 *
 * ⚠️ **The five names read identically in both locale stories.** `services.md`
 * keeps the area names in English on purpose, but Roberto's 2026-09-08
 * instruction for this feature asks that they eventually translate — pending
 * the actual Spanish names (⚠️ O-01), the English string ships as the
 * placeholder for both.
 *
 * Every prop below is a **fixture**. The component calls no Nuxt composable,
 * so it renders here with no i18n instance and no Nuxt runtime
 * (`docs/business/rules.md` § R23).
 */
const meta = {
  title: 'Landing/ServicesSection',
  component: ServicesSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ServicesSection>

export default meta
type Story = StoryObj<typeof meta>

const spanish = {
  eyebrow: 'Servicios',
  deliveryLabel: 'Delivery',
  deliveryCopy:
    'Y una capacidad que atraviesa las cinco: llevamos el proyecto de principio a fin, con alcance, tiempos, calidad y lanzamiento a nuestro cargo.',
  nodes: [
    {
      id: 'consulting' as const,
      index: 0 as const,
      name: 'Technology Consulting & Strategy',
      brief:
        'Diagnosticamos tu situación real, diseñamos la solución y te decimos qué conviene hacer, incluso cuando la respuesta es hacer menos.',
    },
    {
      id: 'software' as const,
      index: 1 as const,
      name: 'Software & Digital Solutions',
      brief:
        'Plataformas, sistemas internos, portales e integraciones construidos alrededor de cómo opera tu negocio, no al revés.',
    },
    {
      id: 'cloud' as const,
      index: 2 as const,
      name: 'Cloud, Infrastructure & DevOps',
      brief:
        'Lo que sostiene todo una vez que está en producción: infraestructura, despliegues automatizados, monitoreo y seguridad.',
    },
    {
      id: 'automation' as const,
      index: 3 as const,
      name: 'Automation, Data & AI',
      brief:
        'Automatizamos lo repetitivo y convertimos tus datos en decisiones. AI donde sume, no solamente donde suene bien.',
    },
    {
      id: 'product' as const,
      index: 4 as const,
      name: 'Product, UI/UX & Experience',
      brief:
        'Convertimos tecnología compleja en algo que se usa sin manual. Producto y experiencia, de investigación a prototipo.',
    },
  ],
}

const english = {
  ...spanish,
  eyebrow: 'Services',
  deliveryCopy:
    'And one capability runs through all five: we carry the project from start to finish, including scope, timelines, quality and launch.',
  nodes: spanish.nodes.map(node => ({
    ...node,
    brief:
      node.id === 'consulting'
        ? "We diagnose your actual situation, design the solution, and tell you what's worth doing, even when the answer is to do less."
        : node.id === 'software'
          ? 'Platforms, internal systems, portals, and integrations built around how your business actually works, not the other way around.'
          : node.id === 'cloud'
            ? "What holds everything up once it's live: infrastructure, automated deploys, monitoring and security."
            : node.id === 'automation'
              ? 'We automate the repetitive and turn your data into decisions. AI where it adds value, not where it sounds good.'
              : 'We turn complex technology into something people use without a manual. Product and experience, from research to prototype.',
  })),
}

export const Spanish: Story = {
  args: spanish,
  globals: { viewport: { value: 'desktop' } },
}

export const English: Story = {
  args: english,
  globals: { viewport: { value: 'desktop' } },
}

/** Below `lg`: the vertical timeline, all five items at full strength. */
export const Mobile: Story = {
  args: spanish,
  globals: { viewport: { value: 'mobile' } },
}

export const MobileEnglish: Story = {
  args: english,
  globals: { viewport: { value: 'mobile' } },
}
