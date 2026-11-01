import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * The Muush 1.0 vocabulary (feature 42): the `--*` palette, the two-tone
 * heading scale, the running-text sizes, the radii and the blurs, each shown
 * through its utility class. A swatch that renders wrong is a token that is
 * wrong, not a story that is wrong; nothing here adds or overrides a token.
 *
 * Compare against `docs/harness/progress/pen-extract-42.md` §§ 1 and 4: the
 * hero sample must measure 34 px at "Móvil (390)" and 96 px at
 * "Escritorio (1440)".
 *
 * Lowercase file name on purpose, like `tokens.stories.ts`: this is not a
 * component (Article VIII). Complete class names only, never concatenated:
 * Tailwind reads source text.
 */
const meta = {
  title: 'Foundations/Tokens',
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Swatch {
  name: string
  token: string
  className: string
}

const palette: { group: string; swatches: Swatch[] }[] = [
  {
    group: 'Base neutra',
    swatches: [
      {
        name: 'Negro 950',
        token: '--negro-950',
        className: 'bg-negro-950',
      },
      {
        name: 'Negro 900',
        token: '--negro-900',
        className: 'bg-negro-900',
      },
      {
        name: 'Carbón 800',
        token: '--carbon-800',
        className: 'bg-carbon-800',
      },
      {
        name: 'Carbón 700',
        token: '--carbon-700',
        className: 'bg-carbon-700',
      },
      { name: 'Gris 400', token: '--gris-400', className: 'bg-gris-400' },
      { name: 'Blanco', token: '--blanco', className: 'bg-blanco' },
    ],
  },
  {
    group: 'Brasa',
    swatches: [
      {
        name: 'Red muush 500',
        token: '--red-muush-500',
        className: 'bg-red-muush-500',
      },
      {
        name: 'Crimson 600',
        token: '--crimson-600',
        className: 'bg-crimson-600',
      },
      {
        name: 'Oxblood 800',
        token: '--oxblood-800',
        className: 'bg-oxblood-800',
      },
      {
        name: 'Coral 300',
        token: '--coral-300',
        className: 'bg-coral-300',
      },
      {
        name: 'Arena 300',
        token: '--arena-300',
        className: 'bg-arena-300',
      },
    ],
  },
  {
    group: 'Acero',
    swatches: [
      {
        name: 'Acero 200',
        token: '--acero-200',
        className: 'bg-acero-200',
      },
      {
        name: 'Acero 400',
        token: '--acero-400',
        className: 'bg-acero-400',
      },
      {
        name: 'Acero 800',
        token: '--acero-800',
        className: 'bg-acero-800',
      },
    ],
  },
  {
    group: 'Texto con opacidad',
    swatches: [
      {
        name: 'Texto suave 70 %',
        token: '--texto-suave',
        className: 'bg-texto-suave',
      },
      {
        name: 'Texto tenue 40 %',
        token: '--texto-tenue',
        className: 'bg-texto-tenue',
      },
      { name: 'Línea 12 %', token: '--linea', className: 'bg-linea' },
      {
        name: 'Línea fuerte 20 %',
        token: '--linea-fuerte',
        className: 'bg-linea-fuerte',
      },
    ],
  },
]

const headings = [
  { name: 'hero · 34 → 96', className: 'text-hero' },
  { name: 'sección · 28 → 56', className: 'text-seccion' },
  { name: 'proceso · 28 → 52', className: 'text-proceso' },
  { name: 'diagnóstico · 34 → 64', className: 'text-diagnostico' },
  { name: 'servicio · 24', className: 'text-servicio' },
]

const texts = [
  {
    name: 'subtítulo · 17 → 20 / 1.5',
    className: 'text-subtitulo text-texto-suave',
  },
  { name: 'cuerpo · 17 / 1.55', className: 'text-cuerpo text-gris-400' },
  { name: 'p · 15', className: 'text-p text-blanco' },
  { name: 'p chico · 13', className: 'text-p-chico text-blanco' },
  { name: 'etiqueta · 12', className: 'text-etiqueta text-gris-400' },
]

const radii = [
  { name: 'control · 12', className: 'rounded-control' },
  { name: 'tarjeta · 22', className: 'rounded-tarjeta' },
  { name: 'servicio · 24', className: 'rounded-servicio' },
  { name: 'tile · 28', className: 'rounded-tile' },
  { name: 'pill · 999', className: 'rounded-pill' },
]

const template = `
  <div class="flex flex-col gap-panel p-gutter font-texto text-blanco">
    <section v-for="group in palette" :key="group.group">
      <p class="text-etiqueta text-gris-400">{{ group.group }}</p>
      <div class="mt-pill-y flex flex-wrap gap-boton-gap">
        <figure v-for="swatch in group.swatches" :key="swatch.token">
          <div :class="['size-control rounded-control borde-luz borde-linea relative', swatch.className]" />
          <figcaption class="text-etiqueta">{{ swatch.name }}<br /><code class="text-gris-400">{{ swatch.token }}</code></figcaption>
        </figure>
      </div>
    </section>

    <section class="flex flex-col gap-boton-gap">
      <p class="text-etiqueta text-gris-400">Titulares · Poppins 500</p>
      <div v-for="heading in headings" :key="heading.name">
        <p class="text-etiqueta text-gris-400">{{ heading.name }}</p>
        <p :class="['font-titulo', heading.className]">
          <span class="block text-blanco">{{ copy.first }}</span>
          <span class="block text-gris-400">{{ copy.second }}</span>
        </p>
      </div>
    </section>

    <section class="flex flex-col gap-boton-gap">
      <p class="text-etiqueta text-gris-400">Texto · Instrument Sans</p>
      <div v-for="text in texts" :key="text.name">
        <p class="text-etiqueta text-gris-400">{{ text.name }}</p>
        <p :class="text.className">{{ copy.body }}</p>
      </div>
    </section>

    <section>
      <p class="text-etiqueta text-gris-400">Radios</p>
      <div class="mt-pill-y flex flex-wrap gap-boton-gap">
        <div v-for="radius in radii" :key="radius.name"
          :class="['relative borde-luz borde-tarjeta bg-negro-900 p-franja-y text-etiqueta', radius.className]">
          {{ radius.name }}
        </div>
      </div>
    </section>

    <section>
      <p class="text-etiqueta text-gris-400">Blur · pill 16 · botón 20 · vidrio 30</p>
      <div class="relative mt-pill-y flex gap-boton-gap">
        <div class="relative bg-pill-fondo backdrop-blur-pill p-franja-y rounded-control text-etiqueta">pill</div>
        <div class="relative bg-btn2-fondo backdrop-blur-boton p-franja-y rounded-control text-etiqueta">botón</div>
        <div class="relative bg-vidrio-fondo backdrop-blur-vidrio p-franja-y rounded-control text-etiqueta">vidrio</div>
      </div>
    </section>
  </div>
`

/** Approved copy, `docs/business/muush-1.0.md` § 4.2. */
const ES = {
  first: 'Hablamos negocio',
  second: 'y código.',
  body: 'Diseñamos y construimos las soluciones digitales que tu negocio usa todos los días.',
}
const EN = {
  first: 'We speak business',
  second: 'and code.',
  body: 'We design and build the digital solutions your business uses every day.',
}

function renderWith(copy: typeof ES) {
  return () => ({
    setup: () => ({ palette, headings, texts, radii, copy }),
    template,
  })
}

export const Es: Story = { render: renderWith(ES) }

export const En: Story = { render: renderWith(EN) }

export const Mobile390: Story = {
  render: renderWith(ES),
  globals: { viewport: { value: 'mobile' } },
}

export const Desktop1440: Story = {
  render: renderWith(ES),
  globals: { viewport: { value: 'desktop' } },
}
