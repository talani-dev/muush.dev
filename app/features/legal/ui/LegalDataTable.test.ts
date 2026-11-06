import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LegalDataTable from './LegalDataTable.vue'

const rows = [
  { where: 'Formulario de diagnóstico', data: 'Nombre, correo.' },
  { where: 'Al navegar el sitio', data: 'Dirección IP.' },
]

describe('LegalDataTable', () => {
  it('should label each row with its where cell', () => {
    const wrapper = mount(LegalDataTable, { props: { rows } })
    const headers = wrapper.findAll('th[scope="row"]')

    expect(headers.map(header => header.text())).toEqual([
      'Formulario de diagnóstico',
      'Al navegar el sitio',
    ])
    expect(wrapper.findAll('td').map(cell => cell.text())).toEqual([
      'Nombre, correo.',
      'Dirección IP.',
    ])
  })

  it('should stack rows as cards below md and become a table from md', () => {
    const row = mount(LegalDataTable, { props: { rows } }).find('tr')

    expect(row.classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'rounded-tarjeta',
        'bg-negro-900',
        'md:table-row',
        'md:bg-transparent',
      ])
    )
  })
})
