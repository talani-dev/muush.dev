import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { nextRegion, useMapRegion } from '@/shared/logic/useMapRegion'

/** Feature 44 · FR-011, research R5, data-model § 3. */
describe('nextRegion', () => {
  it('should move right and wrap when ArrowRight is pressed', () => {
    expect(nextRegion('america', 'ArrowRight')).toBe('europe')
    expect(nextRegion('europe', 'ArrowRight')).toBe('america')
  })

  it('should move left and wrap when ArrowLeft is pressed', () => {
    expect(nextRegion('europe', 'ArrowLeft')).toBe('america')
    expect(nextRegion('america', 'ArrowLeft')).toBe('europe')
  })

  it('should jump to the ends when Home or End is pressed', () => {
    expect(nextRegion('europe', 'Home')).toBe('america')
    expect(nextRegion('america', 'End')).toBe('europe')
  })

  it('should ignore any other key when pressed', () => {
    for (const key of ['Enter', ' ', 'Tab', 'ArrowDown', 'a']) {
      expect(nextRegion('america', key), key).toBeNull()
    }
  })
})

function tabList() {
  const list = document.createElement('div')
  for (const name of ['america', 'europe']) {
    const tab = document.createElement('button')
    tab.dataset.region = name
    list.append(tab)
  }
  document.body.append(list)
  return list
}

function press(
  list: HTMLElement,
  key: string,
  onKeydown: (e: KeyboardEvent) => void
) {
  const event = new KeyboardEvent('keydown', { key, cancelable: true })
  list.addEventListener('keydown', onKeydown, { once: true })
  list.dispatchEvent(event)
  return event
}

describe('useMapRegion', () => {
  it('should start on America when no region is given', () => {
    expect(useMapRegion().region.value).toBe('america')
  })

  it('should select a region when asked', () => {
    const { region, select } = useMapRegion()

    select('europe')

    expect(region.value).toBe('europe')
  })

  it('should select and focus the next tab when an arrow key is pressed on the list', async () => {
    const list = tabList()
    const { region, onKeydown } = useMapRegion()

    const event = press(list, 'ArrowRight', onKeydown)
    await nextTick()

    expect(region.value).toBe('europe')
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(
      list.querySelector('[data-region="europe"]')
    )
    list.remove()
  })

  it('should leave other keys alone when pressed on the list', () => {
    const list = tabList()
    const { region, onKeydown } = useMapRegion()

    const event = press(list, 'Tab', onKeydown)

    expect(region.value).toBe('america')
    expect(event.defaultPrevented).toBe(false)
    list.remove()
  })
})
