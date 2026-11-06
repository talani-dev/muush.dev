/**
 * Resolved copy of the two check lists for the shared catalogue and tests
 * (features 45–46): the home's "Lo que recibes" (`muush-1.0.md` § 4.6) and
 * Nosotros' "Áreas que sumamos" (§ 4.8), verbatim. Stored here, not taken
 * from a feature's fixtures, because `app/shared/` imports no feature.
 * Fixtures only; the app never imports this file.
 */
export interface ReceivesListCopy {
  label: string
  items: readonly string[]
}

export const RECEIVES_LISTS: Record<
  'receives' | 'areas',
  Record<'es' | 'en', ReceivesListCopy>
> = {
  receives: {
    es: {
      label: 'Lo que recibes',
      items: [
        'Una revisión de tu sitio y tus herramientas',
        'Qué conviene hacer primero y por qué',
        'Si hace falta ir a fondo, qué incluye y cuánto cuesta',
      ],
    },
    en: {
      label: 'What you get',
      items: [
        'A review of your website and tools',
        'What to do first, and why',
        "If it needs a deeper look, what's included and what it costs",
      ],
    },
  },
  areas: {
    es: {
      label: 'Áreas que sumamos',
      items: [
        'Ingeniería y desarrollo',
        'Diseño de producto y UX',
        'Creativo, contenido y marketing',
      ],
    },
    en: {
      label: 'Areas we bring in',
      items: [
        'Engineering and development',
        'Product design and UX',
        'Creative, content and marketing',
      ],
    },
  },
}
