import { describe, expect, it } from 'vitest'
import { APPLICATION_FIELD_ORDER } from './applicationFields'
import { CONTACT_FIELD_ORDER } from './contactFields'
import { APPLICATION_STEP_FIELDS, CONTACT_STEP_FIELDS } from './formSteps'

describe('form steps · membership (data-model § 1)', () => {
  const cases = [
    ['contact', CONTACT_STEP_FIELDS, CONTACT_FIELD_ORDER],
    ['application', APPLICATION_STEP_FIELDS, APPLICATION_FIELD_ORDER],
  ] as const

  for (const [form, steps, order] of cases) {
    it(`should partition the ${form} field order exactly when both steps are joined`, () => {
      const joined: string[] = [...steps[1], ...steps[2]]
      expect([...joined].sort()).toEqual([...order].sort())
      expect(new Set(joined).size).toBe(joined.length)
    })

    it(`should open the ${form} form with name, email and the contact channel when step 1 is read`, () => {
      expect(steps[1]).toEqual([
        'name',
        'email',
        'contactPreference',
        'whatsappCountry',
        'whatsapp',
      ])
    })
  }
})
