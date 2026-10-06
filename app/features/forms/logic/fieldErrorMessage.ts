/**
 * An error key (`forms.<form>.fields.<field>.<kind>`) → the already-translated
 * message for that kind, read off the field's own content. One function for
 * both forms (Constitution Article VIII); it was duplicated as `errorFor()` in
 * `ContactForm.vue` and `ApplicationForm.vue` until feature 029.
 *
 * Server field errors resolve through the same path: they carry the same
 * keys as the client ones (`serverFieldErrors.ts`), so no new copy exists.
 */
export function fieldErrorMessage(
  errorKey: string | undefined,
  fieldContent: object
): string | undefined {
  if (!errorKey) return undefined
  const kind = errorKey.split('.').pop() ?? ''
  const message: unknown = (fieldContent as Record<string, unknown>)[kind]
  return typeof message === 'string' ? message : undefined
}
