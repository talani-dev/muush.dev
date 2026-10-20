import { describe, expect, it } from 'vitest'
import {
  NOT_FOUND_COPY_KEYS,
  NOT_FOUND_ROBOTS,
} from '@/features/shell/data/notFound'
import { notFoundSeoMeta } from './useNotFoundDocument'

describe('notFoundSeoMeta', () => {
  it('should resolve the title on every read so it follows an in-place locale switch', () => {
    /* feature 39: the toggle switches this page without navigating. */
    const titles: Record<string, string> = {
      es: 'Página no encontrada · muush',
      en: 'Page not found · muush',
    }
    let active = 'es'
    const t = (key: string) =>
      key === NOT_FOUND_COPY_KEYS.documentTitle ? (titles[active] ?? key) : key

    const meta = notFoundSeoMeta(t)

    expect(typeof meta.title).toBe('function')
    expect(meta.title()).toBe(titles.es)
    active = 'en'
    expect(meta.title()).toBe(titles.en)
  })

  it('should keep the page out of the index', () => {
    expect(notFoundSeoMeta(key => key).robots).toBe(NOT_FOUND_ROBOTS)
  })
})
