import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FaqRichText from './FaqRichText.vue'

/** Feature 51 · spec FR-007: plain runs and real links, no `v-html`. */
describe('FaqRichText', () => {
  it('should render text, a route link and a tracked mail link in order', () => {
    const wrapper = mount(FaqRichText, {
      props: {
        segments: [
          { kind: 'text', text: 'Lee el ' },
          { kind: 'link', text: 'Aviso de privacidad', href: '/es/privacidad' },
          { kind: 'text', text: ' o escribe a ' },
          {
            kind: 'email',
            text: 'support@muush.dev',
            href: 'mailto:support@muush.dev',
            trackAttrs: {
              'data-track': 'contact_click',
              'data-track-location': 'faq',
              'data-track-channel': 'email',
            },
          },
          { kind: 'text', text: '.' },
        ],
      },
    })
    const links = wrapper.findAll('a')

    expect(wrapper.element.tagName).toBe('P')
    expect(wrapper.text()).toBe(
      'Lee el Aviso de privacidad o escribe a support@muush.dev.'
    )
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/es/privacidad',
      'mailto:support@muush.dev',
    ])
    expect(links[1]?.attributes('data-track')).toBe('contact_click')
    expect(links[0]?.classes()).toEqual(
      expect.arrayContaining(['underline', 'foco'])
    )
  })
})
