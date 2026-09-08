import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FileField from './FileField.vue'

/**
 * The CV upload control (feature 020). `Default`/`FileAttached`/`WrongFormat`/
 * `Oversized`/`ReadOnly` cover the states `data-model.md` § 8 and plan.md D-1
 * name: a real, presentational control with no upload destination.
 * `WrongFormat` and `Oversized` are shown via the `error` prop directly
 * (the rejection itself is a runtime `change` event this catalogue cannot
 * script without the interactions addon) — the same shape `SelectField`'s
 * `WithError` story already uses.
 */
const meta = {
  title: 'Forms/FileField',
  component: FileField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FileField>

export default meta
type Story = StoryObj<typeof meta>

const base = {
  id: 'cv',
  label: 'CV',
  placeholder: 'Adjuntar CV · PDF',
}

export const Default: Story = {
  args: { ...base, modelValue: null },
}

export const FileAttached: Story = {
  args: {
    ...base,
    modelValue: new File(['%PDF-1.4'], 'ana-cv.pdf', {
      type: 'application/pdf',
    }),
  },
}

export const WrongFormat: Story = {
  args: {
    ...base,
    modelValue: null,
    error: 'Solo se aceptan archivos PDF',
  },
}

export const Oversized: Story = {
  args: {
    ...base,
    modelValue: null,
    error: 'El archivo debe pesar máximo 5MB',
  },
}

export const ReadOnly: Story = {
  args: {
    ...base,
    modelValue: new File(['%PDF-1.4'], 'ana-cv.pdf', {
      type: 'application/pdf',
    }),
    readonly: true,
  },
}
