import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { BackgroundPresetName } from '@/shared/data/backgroundPresets'
import GlassButton from '@/shared/ui/GlassButton.vue'
import Heading from '@/shared/ui/Heading.vue'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'

/**
 * The Muush 1.0 animated backgrounds (feature 42, FR-018…FR-026), one story
 * per preset, each in a host section that follows the contract: the section
 * is `relative isolate`, the background is its first child, the content is
 * `relative z-10`.
 *
 * What to check (quickstart § 8): frames stop when the story is scrolled
 * away or the tab is hidden; with "Emulate prefers-reduced-motion: reduce"
 * and a reload, one still frame; with WebGL or JavaScript disabled, the
 * poster; below 768 px `canvas.width` equals its CSS width, at 1440 on a 2×
 * screen 1.5× it; clicks reach the content and the accessibility tree shows
 * nothing for the background.
 *
 * Copy is approved copy (`docs/business/muush-1.0.md` § 4).
 */
const meta = {
  title: 'Shared/UI/ShaderBackground',
  component: ShaderBackground,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShaderBackground>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The section presets. The mobile menu's (feature 43) is a full-screen
 * layer, not a section, and is reviewed in `Shell/MobileMenu`.
 */
type SectionPreset = Exclude<BackgroundPresetName, 'mobileMenu'>

/*
 * Section heights of the handoff README (hero 1000, Nosotros hero 820,
 * Preguntas 1100, 404 760 px), as rem. Story frame only: each section owns
 * its real height in features 44–46. `100svh` for the uses the README does
 * not size.
 */
const SECTION_HEIGHT: Record<SectionPreset, string> = {
  homeHero: '62.5rem',
  howWeWork: '100svh',
  assessment: '100svh',
  aboutHero: '51.25rem',
  workWithUs: '100svh',
  faq: '68.75rem',
  notFound: '47.5rem',
}

interface SectionCopy {
  first: string
  second?: string
  primary: string
  secondary: string
}

const COPY: Record<SectionPreset, SectionCopy> = {
  homeHero: {
    first: 'Hablamos negocio',
    second: 'y código.',
    primary: 'Diagnóstico gratis',
    secondary: 'Cómo trabajamos',
  },
  howWeWork: {
    first: 'Primero entendemos tu operación,',
    second: 'después decidimos qué se construye.',
    primary: 'Diagnóstico gratis',
    secondary: 'Cómo trabajamos',
  },
  assessment: {
    first: 'Pide tu diagnóstico',
    second: 'sin costo.',
    primary: 'Quiero mi diagnóstico',
    secondary: 'Agenda una llamada',
  },
  aboutHero: {
    first: 'El equipo se arma',
    second: 'alrededor del proyecto.',
    primary: 'Diagnóstico gratis',
    secondary: 'Cómo trabajamos',
  },
  workWithUs: {
    first: 'Tú eliges en qué',
    second: 'proyectos entras.',
    primary: 'Enviar aplicación',
    secondary: 'Volver al inicio',
  },
  faq: {
    first: 'En construcción 🚧',
    primary: 'Diagnóstico gratis',
    secondary: 'Agenda una llamada',
  },
  notFound: {
    first: 'Volvamos a un',
    second: 'lugar conocido.',
    primary: 'Diagnóstico gratis',
    secondary: 'Volver al inicio',
  },
}

const HOME_HERO_EN: SectionCopy = {
  first: 'We speak business',
  second: 'and code.',
  primary: 'Free assessment',
  secondary: 'How we work',
}

const SECTION = `
  <section class="relative isolate flex items-center justify-center px-gutter" :style="{ height }">
    <ShaderBackground :preset="preset" />
    <div class="relative z-10 flex flex-col items-center gap-gutter text-center">
      <Heading :first="copy.first" :second="copy.second" size="hero" :level="1" />
      <div class="flex flex-wrap justify-center gap-boton-gap">
        <PrimaryButton :label="copy.primary" />
        <GlassButton :label="copy.secondary" />
      </div>
    </div>
  </section>`

const components = {
  ShaderBackground,
  Heading,
  PrimaryButton,
  GlassButton,
}

function section(preset: SectionPreset, copy = COPY[preset]): Story {
  return {
    args: { preset },
    render: () => ({
      components,
      setup: () => ({ preset, copy, height: SECTION_HEIGHT[preset] }),
      template: SECTION,
    }),
  }
}

export const HomeHero = section('homeHero')
export const HomeHeroEn = section('homeHero', HOME_HERO_EN)
export const HowWeWork = section('howWeWork')
export const Assessment = section('assessment')
export const AboutHero = section('aboutHero')
export const WorkWithUs = section('workWithUs')
export const Faq = section('faq')
export const NotFound = section('notFound')

export const HomeHeroMobile390: Story = {
  ...section('homeHero'),
  globals: { viewport: { value: 'mobile' } },
}
export const HomeHeroDesktop1440: Story = {
  ...section('homeHero', HOME_HERO_EN),
  globals: { viewport: { value: 'desktop' } },
}
export const HowWeWorkMobile390: Story = {
  ...section('howWeWork'),
  globals: { viewport: { value: 'mobile' } },
}
export const HowWeWorkDesktop1440: Story = {
  ...section('howWeWork'),
  globals: { viewport: { value: 'desktop' } },
}

/**
 * Three backgrounds stacked: whatever is more than 100 px outside the view
 * stops drawing while the one in view keeps going (each pauses on its own
 * visibility). Three, because two sections this tall never leave the
 * 100 px look-ahead at a desktop height.
 */
export const ScrollAway: Story = {
  args: { preset: 'homeHero' },
  render: () => ({
    components,
    setup: () => ({
      sections: [
        {
          preset: 'homeHero',
          copy: COPY.homeHero,
          height: SECTION_HEIGHT.homeHero,
        },
        {
          preset: 'howWeWork',
          copy: COPY.howWeWork,
          height: SECTION_HEIGHT.howWeWork,
        },
        {
          preset: 'assessment',
          copy: COPY.assessment,
          height: SECTION_HEIGHT.assessment,
        },
      ],
    }),
    template: `
      <div>
        <template v-for="item in sections" :key="item.preset">
          <section class="relative isolate flex items-center justify-center px-gutter" :style="{ height: item.height }">
            <ShaderBackground :preset="item.preset" />
            <div class="relative z-10">
              <Heading :first="item.copy.first" :second="item.copy.second" size="seccion" />
            </div>
          </section>
        </template>
      </div>`,
  }),
}
