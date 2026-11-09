import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { ApplicationForm } from '@/features/forms'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import ReceivesList from '@/shared/ui/ReceivesList.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import {
  APPLICATION_FORM_COPY,
  STORY_APPLICATION_SUBMITTER,
  WORK_COPY,
} from './aboutFixtures.testing'
import WorkWithMuushSection from './WorkWithMuushSection.vue'

/** Feature 46 · US2, FR-020…FR-026; pen extract-46 §§ 1.4, 2. */
vi.mock('@/shared/logic/useShaderCanvas', () => ({
  useShaderCanvas: () => ({ isReady: ref(false), isFallback: ref(false) }),
}))

function render(locale: 'es' | 'en' = 'es') {
  return mount(WorkWithMuushSection, {
    props: {
      ...WORK_COPY[locale],
      formContent: APPLICATION_FORM_COPY[locale],
      formSubmitter: STORY_APPLICATION_SUBMITTER,
    },
  })
}

describe('WorkWithMuushSection', () => {
  it('should carry the trabaja-con-muush anchor', () => {
    const wrapper = render()

    expect(wrapper.attributes('id')).toBe('trabaja-con-muush')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['relative', 'isolate'])
    )
    expect(wrapper.findComponent(ShaderBackground).props('preset')).toBe(
      'workWithUs'
    )
  })

  it('should render the areas list with three rows', () => {
    const list = render('en').findComponent(ReceivesList)

    expect(list.props('label')).toBe('Areas we bring in')
    expect(list.props('items')).toEqual([
      'Engineering and development',
      'Product design and UX',
      'Creative, content and marketing',
    ])
    expect(list.findAll('li')).toHaveLength(3)
  })

  it('should pass formContent and formSubmitter to ApplicationForm untouched', () => {
    const form = render().findComponent(ApplicationForm)

    expect(form.props('content')).toEqual(APPLICATION_FORM_COPY.es)
    expect(form.props('submitter')).toEqual(STORY_APPLICATION_SUBMITTER)
  })

  it('should render no call row', () => {
    const wrapper = render()

    expect(wrapper.text()).not.toContain('Agenda una llamada')
    /* The consent's "aviso de privacidad" opens in a new tab (feature 48);
       no other link does. */
    expect(
      wrapper
        .findAll('a[target="_blank"]')
        .filter(link => !link.element.closest('label'))
    ).toHaveLength(0)
  })

  it('should title the left column with the diagnostico-size h2 and its pill', () => {
    const wrapper = render('en')
    const pill = wrapper.findComponent(Pill)

    expect(pill.props('label')).toBe('Work with muush')
    expect(pill.classes()).toContain('pill-aire')
    expect(wrapper.findComponent(Heading).props()).toMatchObject({
      level: 2,
      size: 'diagnostico',
      first: 'You choose which',
      second: 'projects you join.',
    })
    expect(wrapper.find('h1').exists()).toBe(false)
  })

  it('should stack pill, heading, body, list and form in that DOM order', () => {
    const html = render().html()
    const positions = [
      'Trabaja con muush',
      'Tú eliges en qué',
      'Con quién y desde dónde',
      'Áreas que sumamos',
      'Enviar aplicación',
    ].map(text => html.indexOf(text))

    expect(positions.every(position => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('should share the diagnóstico grid and the section framing when rendered', () => {
    const wrapper = render()

    /* Round 3: the jump lands on the section's own top edge. */
    expect(wrapper.find('section').classes()).toEqual(
      expect.arrayContaining(['min-h-seccion-alto', '-scroll-mt-cabecera'])
    )
    expect(wrapper.find('section > .z-10').classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'flex-1',
        'flex-col',
        'justify-center',
        'pt-seccion-arriba',
        'pb-seccion-aire',
        'px-gutter',
        'lg:px-gutter-desktop',
      ])
    )
    expect(wrapper.find('section > .z-10 > div').classes()).toEqual(
      expect.arrayContaining([
        'grid',
        'lg:grid-cols-diagnostico',
        'gap-y-diagnostico-gap',
        'lg:gap-x-diagnostico-gap',
        'lg:items-center',
      ])
    )
  })

  it('should mark its root for section timing when rendered', () => {
    /* Feature 49 · `section_view` (tracking plan § 5). */
    expect(render().attributes('data-track-section')).toBe('work_with_us')
  })
})
