import {
  type ApplicationFormContent,
  ROLE_CATALOG,
} from '@/features/forms/data/applicationFields'

/**
 * Translated label maps → the `{ value, label }` lists the select and radio
 * fields render. Both forms built these inline until feature 029; they moved
 * here to keep the two form components under Article V's 200 lines and the
 * logic in one place (Article VIII).
 */
export interface FieldOption {
  value: string
  label: string
}

/** Insertion order of `labels` is the render order. */
export function toFieldOptions(labels: Record<string, string>): FieldOption[] {
  return Object.entries(labels).map(([value, label]) => ({ value, label }))
}

/**
 * "Área y rol": one group per area, options valued `${area}:${roleId}` —
 * unique across groups, since `sales` is both an area and a role. The payload
 * builder turns the value back into the bare role id (research R7).
 */
export function toAreaRoleGroups(
  areaRole: ApplicationFormContent['fields']['areaRole']
): { label: string; options: FieldOption[] }[] {
  return ROLE_CATALOG.map(({ area, roleIds }) => ({
    label: areaRole.areas[area],
    options: roleIds.map(roleId => ({
      value: `${area}:${roleId}`,
      label: areaRole.roles[area]?.[roleId] ?? roleId,
    })),
  }))
}
