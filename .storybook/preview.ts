import type { Preview } from '@storybook/vue3-vite'
import '../app/assets/css/global.css'

/*
 * The site is dark end to end (Ink 500 background, see
 * docs/business/landing/content.md § Dirección visual), so `ink` is the
 * default background. `bone` is here because the brand system also defines
 * light surfaces — a component that only looks right on dark is a bug the
 * story should surface.
 */
const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        ink: { name: 'Ink 500', value: '#262626' },
        bone: { name: 'Bone 200', value: '#f2ebe7' },
        red: { name: 'Red 400', value: '#cf3147' },
      },
    },
    viewport: {
      options: {
        mobile: {
          name: 'Móvil (390)',
          styles: { width: '390px', height: '844px' },
        },
        desktop: {
          name: 'Escritorio (1440)',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'ink' },
  },
}

export default preview
