import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Heading from '@/shared/ui/Heading.vue'

/**
 * The Muush 1.0 two-tone heading (feature 42, FR-014). At "Móvil (390)" /
 * "Escritorio (1440)": hero 34 / 96 px, sección 28 / 56, proceso 28 / 52,
 * diagnóstico 34 / 64, página 32 / 64 (Nosotros hero) and estado 34 / 88
 * (Preguntas, feature 46), with no tracking at 390 and ≈ −0.035 em at 1440
 * (pen extract §§ 4, 8; pen extract-46 § 6). Copy from
 * `docs/business/muush-1.0.md` § 4.
 */
const meta = {
  title: 'Shared/UI/Heading',
  component: Heading,
  globals: { backgrounds: { value: 'negro' } },
  decorators: [() => ({ template: '<div class="p-gutter"><story /></div>' })],
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const hero = {
  es: {
    first: 'Hablamos negocio',
    second: 'y código.',
    size: 'hero',
    level: 1,
  },
  en: {
    first: 'We speak business',
    second: 'and code.',
    size: 'hero',
    level: 1,
  },
} as const
const seccion = {
  es: { first: 'Lo que hacemos', second: 'por tu negocio.', size: 'seccion' },
  en: { first: 'What we do', second: 'for your business.', size: 'seccion' },
} as const
const proceso = {
  es: {
    first: 'Primero entendemos tu operación,',
    second: 'después decidimos qué se construye.',
    size: 'proceso',
  },
  en: {
    first: 'First we understand how you operate,',
    second: 'then we decide what gets built.',
    size: 'proceso',
  },
} as const
const diagnostico = {
  es: {
    first: 'Pide tu diagnóstico',
    second: 'sin costo.',
    size: 'diagnostico',
  },
  en: {
    first: 'Request your',
    second: 'free assessment.',
    size: 'diagnostico',
  },
} as const

export const HeroEsMobile390: Story = { args: hero.es, globals: mobile }
export const HeroEsDesktop1440: Story = { args: hero.es, globals: desktop }
export const HeroEnMobile390: Story = { args: hero.en, globals: mobile }
export const HeroEnDesktop1440: Story = { args: hero.en, globals: desktop }

export const SeccionEsMobile390: Story = { args: seccion.es, globals: mobile }
export const SeccionEsDesktop1440: Story = {
  args: seccion.es,
  globals: desktop,
}
export const SeccionEnMobile390: Story = { args: seccion.en, globals: mobile }
export const SeccionEnDesktop1440: Story = {
  args: seccion.en,
  globals: desktop,
}

export const ProcesoEsMobile390: Story = { args: proceso.es, globals: mobile }
export const ProcesoEsDesktop1440: Story = {
  args: proceso.es,
  globals: desktop,
}
export const ProcesoEnMobile390: Story = { args: proceso.en, globals: mobile }
export const ProcesoEnDesktop1440: Story = {
  args: proceso.en,
  globals: desktop,
}

export const DiagnosticoEsMobile390: Story = {
  args: diagnostico.es,
  globals: mobile,
}
export const DiagnosticoEsDesktop1440: Story = {
  args: diagnostico.es,
  globals: desktop,
}
export const DiagnosticoEnMobile390: Story = {
  args: diagnostico.en,
  globals: mobile,
}
export const DiagnosticoEnDesktop1440: Story = {
  args: diagnostico.en,
  globals: desktop,
}

const pagina = {
  es: {
    first: 'El equipo se arma',
    second: 'alrededor del proyecto.',
    size: 'pagina',
    level: 1,
  },
  en: {
    first: 'The team takes shape',
    second: 'around the project.',
    size: 'pagina',
    level: 1,
  },
} as const
const estado = {
  es: { first: 'En construcción 🚧', size: 'estado', level: 1 },
  en: { first: 'Under construction 🚧', size: 'estado', level: 1 },
} as const

export const PaginaEsMobile390: Story = { args: pagina.es, globals: mobile }
export const PaginaEsDesktop1440: Story = { args: pagina.es, globals: desktop }
export const PaginaEnMobile390: Story = { args: pagina.en, globals: mobile }
export const PaginaEnDesktop1440: Story = { args: pagina.en, globals: desktop }

export const EstadoEsMobile390: Story = { args: estado.es, globals: mobile }
export const EstadoEsDesktop1440: Story = { args: estado.es, globals: desktop }
export const EstadoEnMobile390: Story = { args: estado.en, globals: mobile }
export const EstadoEnDesktop1440: Story = { args: estado.en, globals: desktop }

/** A one-line heading: line 1 only. */
export const OneLine: Story = { args: { first: 'Qué es muush' } }
