import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, type Ref } from 'vue'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import { useDesktopLayout } from '@/shared/logic/useDesktopLayout'

/** Feature 44 · research R5, data-model § 3. */
let restore: () => void = () => undefined

function mountHost(desktop = false) {
  const media = installMatchMedia({ [DESKTOP_MEDIA_QUERY]: desktop })
  restore = media.restore
  let isDesktop: Readonly<Ref<boolean>> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        isDesktop = useDesktopLayout()
        return () => h('div')
      },
    })
  )
  if (!isDesktop) throw new Error('composable did not run')
  return { wrapper, isDesktop, query: media.query(DESKTOP_MEDIA_QUERY) }
}

afterEach(() => restore())

describe('useDesktopLayout', () => {
  it('should be false when the window is below lg', () => {
    const { isDesktop } = mountHost(false)

    expect(isDesktop.value).toBe(false)
  })

  it('should be true when the window is lg or wider at mount', () => {
    const { isDesktop } = mountHost(true)

    expect(isDesktop.value).toBe(true)
  })

  it('should follow the width live when it crosses lg after mount', () => {
    const { isDesktop, query } = mountHost(false)

    query.set(true)
    expect(isDesktop.value).toBe(true)
    query.set(false)
    expect(isDesktop.value).toBe(false)
  })

  it('should remove its listener when the host unmounts', () => {
    const { wrapper, query } = mountHost(false)
    expect(query.listeners.size).toBe(1)

    wrapper.unmount()

    expect(query.listeners.size).toBe(0)
  })
})
