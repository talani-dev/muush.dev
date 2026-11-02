import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NotFoundRings from './NotFoundRings.vue'

describe('NotFoundRings', () => {
  it('should be hidden from assistive technology when rendered', () => {
    expect(mount(NotFoundRings).attributes('aria-hidden')).toBe('true')
  })

  it('should render three rings when rendered', () => {
    expect(mount(NotFoundRings).findAll('span')).toHaveLength(3)
  })

  it('should not intercept pointer events when rendered', () => {
    expect(mount(NotFoundRings).classes()).toContain('pointer-events-none')
  })

  it('should carry no text when rendered', () => {
    expect(mount(NotFoundRings).text()).toBe('')
  })
})
