import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useFaqTopics } from './useFaqTopics'

/** Feature 51 · spec FR-010…FR-013 (OQ-6 = A, OQ-7 = A). */
const ANCHORS = ['diagnostico', 'precios', 'proceso', 'entrega', 'trabaja']

function setup() {
  const onSelect = vi.fn()
  let api: ReturnType<typeof useFaqTopics> | undefined
  const Harness = defineComponent({
    setup() {
      api = useFaqTopics({ anchors: () => ANCHORS, idPrefix: 'faq', onSelect })
      return () =>
        h(
          'div',
          ANCHORS.map(anchor =>
            h('button', { id: `faq-tab-${anchor}`, type: 'button' })
          )
        )
    },
  })
  const wrapper = mount(Harness, { attachTo: document.body })
  if (!api) throw new Error('not set up')
  return { wrapper, onSelect, topics: api }
}

function key(name: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: name, cancelable: true })
}

beforeEach(() => {
  window.history.replaceState(null, '', '/es/preguntas')
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useFaqTopics', () => {
  it('should select topic 01 and name none when there is no fragment', () => {
    const { topics } = setup()

    expect(topics.selected.value).toBe(0)
    expect(topics.named.value).toBeNull()
  })

  it('should select the topic the fragment names when mounted', () => {
    window.history.replaceState(null, '', '/es/preguntas#precios')

    const { topics, onSelect } = setup()

    expect(topics.selected.value).toBe(1)
    expect(topics.named.value).toBe(1)
    expect(onSelect).toHaveBeenCalled()
  })

  it('should select topic 01 when the fragment names no topic', () => {
    window.history.replaceState(null, '', '/es/preguntas#nada')

    const { topics } = setup()

    expect(topics.selected.value).toBe(0)
    expect(topics.named.value).toBeNull()
  })

  it('should not rewrite the URL when the fragment selects on mount', () => {
    window.history.replaceState(null, '', '/es/preguntas#nada')
    const spy = vi.spyOn(window.history, 'replaceState')

    setup()

    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('should replace the fragment without a new history entry when the visitor selects', () => {
    window.history.replaceState({ router: 'state' }, '', '/es/preguntas')
    const { topics, onSelect } = setup()
    const length = window.history.length
    onSelect.mockClear()

    topics.select(3)

    expect(window.location.hash).toBe('#entrega')
    expect(window.history.length).toBe(length)
    expect(window.history.state).toEqual({ router: 'state' })
    expect(topics.selected.value).toBe(3)
    expect(topics.named.value).toBe(3)
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('should move, wrap and focus the tab when an arrow key is pressed', async () => {
    const { topics } = setup()
    const event = key('ArrowLeft')

    topics.onKeydown(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(topics.selected.value).toBe(4)
    expect(document.activeElement?.id).toBe('faq-tab-trabaja')
  })

  it('should jump to the ends when Home or End is pressed', () => {
    const { topics } = setup()

    topics.onKeydown(key('End'))
    expect(topics.selected.value).toBe(4)
    topics.onKeydown(key('Home'))
    expect(topics.selected.value).toBe(0)
  })

  it('should leave any other key to the browser', () => {
    const { topics } = setup()
    const event = key('Enter')

    topics.onKeydown(event)

    expect(event.defaultPrevented).toBe(false)
    expect(topics.selected.value).toBe(0)
  })

  it('should select the topic the router fragment names once the router restores it', async () => {
    /* A direct load: Nuxt hydrates at the payload path (no fragment) and
       restores the fragment through the router afterwards. */
    const routeHash = ref('')
    const onSelect = vi.fn()
    let api: ReturnType<typeof useFaqTopics> | undefined
    mount(
      defineComponent({
        setup() {
          api = useFaqTopics({
            anchors: () => ANCHORS,
            idPrefix: 'faq',
            onSelect,
            hash: () => routeHash.value,
          })
          return () => h('div')
        },
      })
    )
    expect(api?.selected.value).toBe(0)

    routeHash.value = '#entrega'
    await nextTick()

    expect(api?.selected.value).toBe(3)
    expect(api?.named.value).toBe(3)
  })

  it('should follow a fragment change made outside the tabs', async () => {
    const { topics } = setup()

    window.location.hash = '#proceso'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()

    expect(topics.selected.value).toBe(2)
  })
})
