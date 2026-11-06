import { describe, expect, it } from 'vitest'
import { CV_MAX_BYTES } from '@/features/forms/data/applicationFields'
import { classifyCvFile } from './cvFileCheck'

/** A `File` of an exact size without allocating it. */
function fileOf(type: string, size: number): File {
  const file = new File(['x'], 'cv', { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('classifyCvFile', () => {
  it('should refuse the format when the file is not a PDF', () => {
    expect(classifyCvFile(fileOf('text/plain', 10))).toBe('format')
    expect(classifyCvFile(fileOf('image/png', 10))).toBe('format')
  })

  it('should refuse the size when a PDF is one byte over 5 MiB', () => {
    expect(CV_MAX_BYTES).toBe(5_242_880)
    expect(classifyCvFile(fileOf('application/pdf', 5_242_881))).toBe('size')
  })

  it('should accept a PDF when it is exactly 5 MiB', () => {
    expect(classifyCvFile(fileOf('application/pdf', 5_242_880))).toBe(
      'accepted'
    )
  })

  it('should report the format first when a non-PDF is also too large', () => {
    expect(classifyCvFile(fileOf('text/plain', 9_000_000))).toBe('format')
  })
})
