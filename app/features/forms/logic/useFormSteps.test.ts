import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import type { ContactFieldId } from '@/features/forms/data/contactFields'
import {
  CONTACT_STEP_FIELDS,
  FORM_STEPS_MEDIA_QUERY,
} from '@/features/forms/data/formSteps'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import { REDUCED_MOTION_QUERY } from '@/shared/logic/useReducedMotion'
import { type UseFormStepsReturn, useFormSteps } from './useFormSteps'

/** Feature 45 · research R2–R3, data-model § 2. */
let restore: () => void = () => undefined

afterEach(() => {
  restore()
  document.body.replaceChildren()
})

function mountHost({ stepped = true, reduced = false } = {}) {
  const media = installMatchMedia({
    [FORM_STEPS_MEDIA_QUERY]: stepped,
    [REDUCED_MOTION_QUERY]: reduced,
  })
  restore = media.restore
  const errors = ref<Partial<Record<ContactFieldId, string>>>({})
  const scrollIntoView = vi.fn()
  let steps: UseFormStepsReturn<ContactFieldId> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        const panel = ref<HTMLElement | null>(null)
        steps = useFormSteps({
          stepFields: CONTACT_STEP_FIELDS,
          panel,
        })
        return () =>
          h(
            'div',
            {
              ref: (element: unknown) => {
                const host = element as HTMLElement | null
                if (host) host.scrollIntoView = scrollIntoView
                panel.value = host
              },
            },
            ['name', 'email', 'company', 'need'].map(id => h('input', { id }))
          )
      },
    }),
    { attachTo: document.body }
  )
  if (!steps) throw new Error('composable did not run')
  const next = () => steps?.goNext(errors.value)
  return {
    wrapper,
    steps,
    next,
    errors,
    scrollIntoView,
    query: media.query(FORM_STEPS_MEDIA_QUERY),
  }
}

describe('useFormSteps · the view', () => {
  it('should be stepped below 768 px and single from 768 px when mounted', () => {
    expect(mountHost({ stepped: true }).steps.isStepped.value).toBe(true)
    restore()
    expect(mountHost({ stepped: false }).steps.isStepped.value).toBe(false)
  })

  it('should follow the width live and keep the current step when it crosses 768 px', async () => {
    const { steps, next, query } = mountHost()
    await next()

    query.set(false)
    expect(steps.isStepped.value).toBe(false)
    query.set(true)
    expect(steps.isStepped.value).toBe(true)
    expect(steps.step.value).toBe(2)
  })

  it('should remove its listener when the host unmounts', () => {
    const { wrapper, query } = mountHost()
    expect(query.listeners.size).toBe(1)

    wrapper.unmount()

    expect(query.listeners.size).toBe(0)
  })
})

describe('useFormSteps · Continuar and Atrás', () => {
  it('should stay on step 1, mark the attempt and focus the first error when step 1 is invalid', async () => {
    const { steps, next, errors } = mountHost()
    errors.value = { email: 'x', name: 'x', need: 'x' }

    await next()
    await flushPromises()

    expect(steps.step.value).toBe(1)
    expect(steps.attemptedStep.value).toBe(1)
    expect(document.activeElement?.id).toBe('name')
  })

  it('should show step 2, focus its first field and bring the panel into view when step 1 is valid', async () => {
    const { steps, next, errors, scrollIntoView } = mountHost()
    errors.value = { need: 'x' }

    await next()

    expect(steps.step.value).toBe(2)
    expect(steps.attemptedStep.value).toBeNull()
    expect(document.activeElement?.id).toBe('company')
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'smooth',
    })
  })

  it('should scroll with behavior auto when the visitor reduces motion', async () => {
    const { next, scrollIntoView } = mountHost({ reduced: true })

    await next()

    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'auto',
    })
  })

  it('should return to step 1 without validating when going back', async () => {
    const { steps, next, errors } = mountHost()
    await next()
    errors.value = { name: 'x', company: 'x' }

    await steps.goBack()

    expect(steps.step.value).toBe(1)
    expect(steps.attemptedStep.value).toBeNull()
    expect(document.activeElement?.id).toBe('name')
  })
})

describe('useFormSteps · revealing a field', () => {
  it('should switch to the field’s step when stepped', async () => {
    const { steps, next } = mountHost()
    await next()

    steps.revealField('email')

    expect(steps.step.value).toBe(1)
  })

  it('should leave the step alone when the view is single', () => {
    const { steps } = mountHost({ stepped: false })

    steps.revealField('need')

    expect(steps.step.value).toBe(1)
  })
})
