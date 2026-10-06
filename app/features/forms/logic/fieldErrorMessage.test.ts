import { describe, expect, it } from 'vitest'
import { fieldErrorMessage } from './fieldErrorMessage'

const email = {
  label: 'Correo',
  errorRequired: 'Escribe tu correo',
  errorFormat: 'Correo inválido',
}

describe('fieldErrorMessage', () => {
  it('should return the message named by the last key segment when it exists', () => {
    expect(
      fieldErrorMessage('forms.contact.fields.email.errorFormat', email)
    ).toBe('Correo inválido')
  })

  it('should return undefined when there is no error key', () => {
    expect(fieldErrorMessage(undefined, email)).toBeUndefined()
  })

  it('should return undefined when the field has no message of that kind', () => {
    expect(
      fieldErrorMessage('forms.contact.fields.email.errorDigits', email)
    ).toBeUndefined()
  })

  it('should never return a non-string property such as an options map', () => {
    expect(
      fieldErrorMessage('forms.contact.fields.identity.options', {
        options: { a: 'b' },
      })
    ).toBeUndefined()
  })
})
