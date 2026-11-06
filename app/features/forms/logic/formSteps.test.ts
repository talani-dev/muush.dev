import { describe, expect, it } from 'vitest'
import { CONTACT_FIELD_ORDER } from '@/features/forms/data/contactFields'
import { CONTACT_STEP_FIELDS } from '@/features/forms/data/formSteps'
import { firstErrorInStep, isErrorVisible, stepOfField } from './formSteps'

const stepFields = CONTACT_STEP_FIELDS

describe('stepOfField', () => {
  it('should place name, email and the channel in step 1 when asked', () => {
    expect(stepOfField(stepFields, 'name')).toBe(1)
    expect(stepOfField(stepFields, 'email')).toBe(1)
    expect(stepOfField(stepFields, 'whatsapp')).toBe(1)
  })

  it('should place the form’s own fields in step 2 when asked', () => {
    expect(stepOfField(stepFields, 'company')).toBe(2)
    expect(stepOfField(stepFields, 'need')).toBe(2)
  })
})

describe('firstErrorInStep', () => {
  it('should return the first erroneous field of the step in form order when several fail', () => {
    const errors = { need: 'x', email: 'x', name: 'x', identity: 'x' }
    expect(firstErrorInStep(errors, CONTACT_FIELD_ORDER, stepFields[1])).toBe(
      'name'
    )
    expect(firstErrorInStep(errors, CONTACT_FIELD_ORDER, stepFields[2])).toBe(
      'identity'
    )
  })

  it('should return undefined when the step has no error', () => {
    expect(
      firstErrorInStep({ need: 'x' }, CONTACT_FIELD_ORDER, stepFields[1])
    ).toBeUndefined()
  })
})

describe('isErrorVisible', () => {
  it('should hide every error when the form is idle and no step was attempted', () => {
    for (const field of CONTACT_FIELD_ORDER) {
      expect(
        isErrorVisible(field, {
          state: 'idle',
          attemptedStep: null,
          stepFields,
        })
      ).toBe(false)
    }
  })

  it('should show every error when a submit found the form invalid', () => {
    for (const field of CONTACT_FIELD_ORDER) {
      expect(
        isErrorVisible(field, {
          state: 'invalid',
          attemptedStep: null,
          stepFields,
        })
      ).toBe(true)
    }
  })

  it('should show only step-1 errors when Continuar found step 1 invalid', () => {
    const visibility = { state: 'idle', attemptedStep: 1, stepFields } as const
    expect(isErrorVisible('name', visibility)).toBe(true)
    expect(isErrorVisible('email', visibility)).toBe(true)
    expect(isErrorVisible('need', visibility)).toBe(false)
    expect(isErrorVisible('company', visibility)).toBe(false)
  })
})
