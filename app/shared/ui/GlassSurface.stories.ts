import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GlassSurface from '@/shared/ui/GlassSurface.vue'

/**
 * The Muush 1.0 glass family (feature 42, FR-010). Compare each preset with
 * its row in `docs/harness/progress/pen-extract-42.md` § 3: form panel
 * (radius 28, blur 30, long shadow, padding 36), service card (opaque,
 * radius 24, clips) and the "También" strip (radius 20, blur 20, flat edge).
 *
 * Sample copy is the approved copy of `docs/business/muush-1.0.md` §§ 4.4
 * and 4.6; the surface itself carries none.
 */
const meta = {
  title: 'Shared/UI/GlassSurface',
  component: GlassSurface,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof GlassSurface>

export default meta
type Story = StoryObj<typeof meta>

const COPY = {
  es: {
    fields: ['Nombre y apellido', 'tu@correo.com', 'Nombre de la empresa'],
    service: 'Estrategia tecnológica',
    serviceBody:
      'Un diagnóstico claro y un plan de qué hacer y en qué orden, antes de invertir.',
    strip: 'TAMBIÉN, SI LO NECESITAS',
    stripBody:
      'Contenido, foto, video, redes y anuncios con nuestros aliados. Siempre se cotiza aparte.',
  },
  en: {
    fields: ['First and last name', 'you@email.com', 'Company name'],
    service: 'Technology strategy',
    serviceBody:
      'A clear diagnosis and a plan for what to do, and in what order, before you invest.',
    strip: 'ALSO, IF YOU NEED IT',
    stripBody:
      'Content, photo, video, social media and ads with our partners. Always quoted separately.',
  },
}

type Copy = (typeof COPY)['es']

const PANEL = `
  <GlassSurface preset="panel" class="flex flex-col gap-boton-gap font-texto">
    <p v-for="field in copy.fields" :key="field"
      class="rounded-campo bg-carbon-800 px-boton-movil-x py-boton-movil-y text-p text-texto-tenue">
      {{ field }}
    </p>
  </GlassSurface>`

const SERVICE = `
  <GlassSurface preset="servicio" as="article" class="font-texto">
    <div class="p-gutter">
      <h3 class="font-titulo text-servicio text-blanco">{{ copy.service }}</h3>
      <p class="mt-pill-y text-p text-gris-400">{{ copy.serviceBody }}</p>
    </div>
  </GlassSurface>`

const STRIP = `
  <GlassSurface preset="franja" class="font-texto">
    <p class="text-etiqueta text-gris-400">{{ copy.strip }}</p>
    <p class="mt-pill-y text-p text-texto-suave">{{ copy.stripBody }}</p>
  </GlassSurface>`

function single(template: string, copy: Copy) {
  return () => ({
    components: { GlassSurface },
    setup: () => ({ copy }),
    template: `<div class="max-w-contenido p-gutter">${template}</div>`,
  })
}

/** The three presets side by side on the Negro 950 canvas. */
function sideBySide(copy: Copy) {
  return () => ({
    components: { GlassSurface },
    setup: () => ({ copy }),
    template: `
      <div class="grid gap-gutter p-gutter lg:grid-cols-3">
        ${PANEL}${SERVICE}${STRIP}
      </div>`,
  })
}

export const PanelEs: Story = { render: single(PANEL, COPY.es) }
export const PanelEn: Story = { render: single(PANEL, COPY.en) }
export const ServicioEs: Story = { render: single(SERVICE, COPY.es) }
export const ServicioEn: Story = { render: single(SERVICE, COPY.en) }
export const FranjaEs: Story = { render: single(STRIP, COPY.es) }
export const FranjaEn: Story = { render: single(STRIP, COPY.en) }
export const SideBySide: Story = { render: sideBySide(COPY.es) }

export const Mobile390: Story = {
  render: sideBySide(COPY.es),
  globals: { viewport: { value: 'mobile' } },
}

export const Desktop1440: Story = {
  render: sideBySide(COPY.en),
  globals: { viewport: { value: 'desktop' } },
}
