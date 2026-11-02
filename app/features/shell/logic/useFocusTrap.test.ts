import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useFocusTrap } from './useFocusTrap'

/**
 * Feature 43 · spec FR-020, SC-004, contract § 8. happy-dom does not move
 * focus on Tab by itself, so each case places focus, dispatches the key and
 * reads where the trap sent it (or that it let the browser handle it).
 */
const mounted: Array<{ unmount: () => void }> = []

function mountTrap(isActive = ref(true)) {
  const wrapper = mount(
    defineComponent({
      setup() {
        const root = ref<HTMLElement | null>(null)
        useFocusTrap(root, () => isActive.value)
        return () =>
          h('div', { ref: root }, [
            h('button', { id: 'first' }, 'Cerrar'),
            h('a', { id: 'middle', href: '/es' }, 'Servicios'),
            h('a', { id: 'last', href: '/es/nosotros' }, 'Nosotros'),
          ])
      },
    }),
    { attachTo: document.body }
  )
  mounted.push(wrapper)
  const byId = (id: string) => wrapper.find(`#${id}`).element as HTMLElement
  return { byId, unmount: () => wrapper.unmount() }
}

function pressTab(shiftKey = false): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  })
  document.activeElement?.dispatchEvent(event)
  return event
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
})

describe('useFocusTrap', () => {
  it('should send focus to the first control when Tab leaves the last one', () => {
    const { byId } = mountTrap()
    byId('last').focus()

    const event = pressTab()

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(byId('first'))
  })

  it('should send focus to the last control when Shift+Tab leaves the first one', () => {
    const { byId } = mountTrap()
    byId('first').focus()

    pressTab(true)

    expect(document.activeElement).toBe(byId('last'))
  })

  it('should leave Tab to the browser when focus is between the ends', () => {
    const { byId } = mountTrap()
    byId('middle').focus()

    expect(pressTab().defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(byId('middle'))
  })

  it('should pull focus back inside when it is outside the container', () => {
    const { byId } = mountTrap()
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()

    pressTab()

    expect(document.activeElement).toBe(byId('first'))
    outside.remove()
  })

  it('should do nothing when it is not active', () => {
    const { byId } = mountTrap(ref(false))
    byId('last').focus()

    expect(pressTab().defaultPrevented).toBe(false)
  })

  it('should stop listening when its scope is disposed', () => {
    const { byId, unmount } = mountTrap()
    const first = byId('first')
    byId('last').focus()
    unmount()

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).not.toBe(first)
  })
})
