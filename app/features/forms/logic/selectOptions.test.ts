import { describe, expect, it } from 'vitest'
import { ROLE_CATALOG } from '@/features/forms/data/applicationFields'
import { toAreaRoleGroups, toFieldOptions } from './selectOptions'

describe('toFieldOptions', () => {
  it('should keep the label map insertion order when building options', () => {
    expect(toFieldOptions({ email: 'Correo', whatsapp: 'WhatsApp' })).toEqual([
      { value: 'email', label: 'Correo' },
      { value: 'whatsapp', label: 'WhatsApp' },
    ])
  })
})

describe('toAreaRoleGroups', () => {
  const areaRole = {
    label: 'Área y rol',
    placeholder: 'Elige un rol',
    areas: {
      it: 'IT',
      product: 'Product',
      projectManagement: 'Project management',
      sales: 'Sales',
      marketing: 'Marketing',
      creative: 'Creative',
    },
    roles: { it: { backend: 'Backend' } } as Record<
      string,
      Record<string, string>
    >,
  } as Parameters<typeof toAreaRoleGroups>[0]

  it('should build one group per area with qualified option values', () => {
    const groups = toAreaRoleGroups(areaRole)

    expect(groups.map(group => group.label)).toEqual(
      Object.values(areaRole.areas)
    )
    expect(groups[0]?.options[0]).toEqual({
      value: 'it:backend',
      label: 'Backend',
    })
    expect(groups.flatMap(group => group.options)).toHaveLength(
      ROLE_CATALOG.flatMap(entry => entry.roleIds).length
    )
  })

  it('should fall back to the role id when a role label is missing', () => {
    const sales = toAreaRoleGroups(areaRole).find(
      group => group.label === 'Sales'
    )

    expect(sales?.options[0]).toEqual({ value: 'sales:sales', label: 'sales' })
  })
})
