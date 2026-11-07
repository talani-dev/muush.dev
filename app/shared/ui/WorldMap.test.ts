import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import MapPin from '@/shared/ui/MapPin.vue'
import { MAP_COPY } from '@/shared/ui/mapFixtures.testing'
import WorldMap from '@/shared/ui/WorldMap.vue'

/** Feature 44 · FR-007…FR-012, FR-011a; research R3–R6. */
let restore: () => void = () => undefined

function render(desktop = false, locale: 'es' | 'en' = 'es') {
  restore = installMatchMedia({ [DESKTOP_MEDIA_QUERY]: desktop }).restore
  const copy = MAP_COPY[locale]
  return mount(WorldMap, {
    attachTo: document.body,
    props: {
      regions: copy.regions,
      regionsLabel: copy.regionsLabel,
      groups: copy.groups,
      cityNames: copy.cityNames,
      idPrefix: 'mapa',
    },
  })
}

function hiddenCities(wrapper: ReturnType<typeof render>) {
  return wrapper
    .findAll('ul.sr-only li li')
    .filter(item => !item.classes().includes('max-lg:hidden'))
    .map(item => item.text())
}

afterEach(() => restore())

describe('WorldMap', () => {
  it('should inline the dots silently and place the nine pins when rendered', () => {
    const wrapper = render()
    const dots = wrapper.find('.mapa-puntos')

    expect(dots.attributes('aria-hidden')).toBe('true')
    expect(dots.find('svg').attributes('viewBox')).toBe('0 0 1408 470')
    expect(dots.classes()).toContain('text-mapa-punto')
    expect(wrapper.findAllComponents(MapPin)).toHaveLength(9)
  })

  it('should show America in a tab panel when rendered below lg', () => {
    const wrapper = render()
    const panel = wrapper.find('[data-mapa]')
    const selected = wrapper.find('[aria-selected="true"]')

    expect(selected.text()).toBe('América')
    expect(panel.attributes('role')).toBe('tabpanel')
    expect(panel.attributes('aria-labelledby')).toBe('mapa-tab-america')
    expect(panel.attributes('id')).toBe('mapa-panel')
    expect(panel.attributes('style')).toContain('--mapa-ancho: 494.03')
  })

  it('should zoom into Europe when its tab is chosen', async () => {
    const wrapper = render()
    const before = wrapper.find('[data-mapa]').attributes('style')

    await wrapper.findAll('[role="tab"]')[1]?.trigger('click')
    const panel = wrapper.find('[data-mapa]')

    expect(panel.attributes('style')).not.toBe(before)
    expect(panel.attributes('style')).toContain('--mapa-ancho: 741.05')
    expect(panel.attributes('aria-labelledby')).toBe('mapa-tab-europe')
  })

  it('should move selection and focus with the arrow keys when the tabs have focus', async () => {
    const wrapper = render()
    const list = wrapper.find('[role="tablist"]')

    await list.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(wrapper.find('[aria-selected="true"]').text()).toBe('Europa')
    expect(document.activeElement?.textContent?.trim()).toBe('Europa')
    wrapper.unmount()
  })

  it('should expose only the selected region cities below lg when listed', async () => {
    const wrapper = render()

    expect(hiddenCities(wrapper)).toEqual([
      'CDMX',
      'Puebla',
      'Mérida',
      'NYC',
      'San Francisco',
      'Los Ángeles',
    ])
    await wrapper.findAll('[role="tab"]')[1]?.trigger('click')
    expect(hiddenCities(wrapper)).toEqual(['Dublín', 'Ámsterdam', 'Estonia'])
  })

  it('should group the hidden cities under the legend labels when listed', () => {
    const groups = render(false, 'en').findAll('ul.sr-only > li')

    expect(groups.map(group => group.text().split(/\s+/)[0])).toEqual([
      'Team',
      'Partners',
      'Estonia',
    ])
    expect(groups[1]?.classes()).toContain('max-lg:hidden')
  })

  it('should drop the tab panel role when the desktop layout applies', async () => {
    const wrapper = render(true)
    await nextTick()
    const panel = wrapper.find('[data-mapa]')

    expect(panel.attributes('role')).toBeUndefined()
    expect(panel.attributes('aria-labelledby')).toBeUndefined()
    expect(panel.attributes('tabindex')).toBeUndefined()
    expect(panel.classes()).toEqual(
      expect.arrayContaining(['lg:aspect-mapa', 'lg:opacity-(--mapa-opacidad)'])
    )
  })

  it('should animate the zoom with the slow token and never under reduced motion when rendered', () => {
    expect(render().find('[data-lienzo]').classes()).toEqual(
      expect.arrayContaining([
        'max-lg:duration-(--lento)',
        'max-lg:ease-muush',
        'motion-reduce:transition-none',
        'max-lg:transition-[left,top,width]',
      ])
    )
  })

  it('should give the canvas no transition timing from lg when rendered', () => {
    /* Review-50 finding 3: a bare duration transitions `all` on desktop. */
    const classes = render().find('[data-lienzo]').classes()

    expect(classes).not.toContain('duration-(--lento)')
    expect(classes).not.toContain('ease-muush')
  })

  it('should lay the canvas out at its zoomed size instead of scaling it when below lg', () => {
    /* Feature 50: a `scale` transform magnifies a bitmap rasterized at the
       unscaled size, which blurred the dots on iPhone. */
    const canvas = render().find('[data-lienzo]')

    expect(canvas.classes()).toEqual(
      expect.arrayContaining([
        'max-lg:w-(--mapa-ancho)',
        'max-lg:left-(--mapa-x)',
        'max-lg:top-(--mapa-y)',
      ])
    )
    expect(canvas.classes().some(name => /scale|translate/.test(name))).toBe(
      false
    )
  })
})
