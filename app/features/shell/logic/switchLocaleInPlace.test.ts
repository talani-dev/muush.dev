import { describe, expect, it, vi } from 'vitest'
import {
  switchLocaleInPlace,
  switchLocaleWithFallback,
} from './switchLocaleInPlace'

function deps(initial: string) {
  const order: string[] = []
  const locale = {
    _value: initial,
    get value() {
      return this._value
    },
    set value(next: string) {
      order.push(`set:${next}`)
      this._value = next
    },
  }
  const loadLocaleMessages = vi.fn(async (target: string) => {
    order.push(`load:${target}`)
  })
  return { locale, loadLocaleMessages, order }
}

describe('switchLocaleInPlace', () => {
  it('should load the messages before assigning the locale when switching', async () => {
    const { locale, loadLocaleMessages, order } = deps('en')

    await switchLocaleInPlace('es', { locale, loadLocaleMessages })

    expect(order).toEqual(['load:es', 'set:es'])
    expect(locale.value).toBe('es')
  })

  it('should switch back to English when the page is in Spanish', async () => {
    const { locale, loadLocaleMessages } = deps('es')

    await switchLocaleInPlace('en', { locale, loadLocaleMessages })

    expect(loadLocaleMessages).toHaveBeenCalledWith('en')
    expect(locale.value).toBe('en')
  })

  it('should do nothing when the target is already the active locale', async () => {
    const { locale, loadLocaleMessages, order } = deps('es')

    await switchLocaleInPlace('es', { locale, loadLocaleMessages })

    expect(loadLocaleMessages).not.toHaveBeenCalled()
    expect(order).toEqual([])
  })

  it('should keep the locale when the messages fail to load', async () => {
    const { locale } = deps('en')
    const loadLocaleMessages = vi.fn(async () => {
      throw new Error('offline')
    })

    await expect(
      switchLocaleInPlace('es', { locale, loadLocaleMessages })
    ).rejects.toThrow('offline')
    expect(locale.value).toBe('en')
  })
})

describe('switchLocaleWithFallback', () => {
  it('should switch in place without the fallback when the messages load', async () => {
    const { locale, loadLocaleMessages } = deps('en')
    const fallback = vi.fn()

    await switchLocaleWithFallback(
      'es',
      { locale, loadLocaleMessages },
      fallback
    )

    expect(locale.value).toBe('es')
    expect(fallback).not.toHaveBeenCalled()
  })

  it('should call the fallback and keep the locale when the messages fail to load', async () => {
    const { locale } = deps('en')
    const loadLocaleMessages = vi.fn(async () => {
      throw new Error('offline')
    })
    const fallback = vi.fn()

    await expect(
      switchLocaleWithFallback('es', { locale, loadLocaleMessages }, fallback)
    ).resolves.toBeUndefined()

    expect(fallback).toHaveBeenCalledOnce()
    expect(locale.value).toBe('en')
  })
})
