import { describe, expect, it } from 'vitest'
import { getLangFromUrl, useTranslations } from '@/i18n/utils'

describe('getLangFromUrl', () => {
  it('returns "es" for an /es/ path', () => {
    expect(getLangFromUrl(new URL('https://muush.dev/es/'))).toBe('es')
  })

  it('returns "en" for an /en/ path', () => {
    expect(getLangFromUrl(new URL('https://muush.dev/en/about'))).toBe('en')
  })

  it('falls back to the default locale for an unknown path', () => {
    expect(getLangFromUrl(new URL('https://muush.dev/'))).toBe('es')
    expect(getLangFromUrl(new URL('https://muush.dev/fr/'))).toBe('es')
  })
})

describe('useTranslations', () => {
  it('returns the string for the requested locale', () => {
    const t = useTranslations('en')
    expect(t('site.title')).toBe('muush · EN')
  })

  it('falls back to the default locale when the key is missing', () => {
    const t = useTranslations('es')
    expect(t('site.title')).toBe('muush · ES')
  })
})
