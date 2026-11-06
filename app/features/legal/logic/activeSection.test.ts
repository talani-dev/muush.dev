import { describe, expect, it } from 'vitest'
import { pickActiveSection } from './activeSection'

const SECTIONS = [
  { id: 'a', top: 300 },
  { id: 'b', top: 900 },
  { id: 'c', top: 1500 },
]

describe('pickActiveSection', () => {
  it('should mark the first section before any reaches the line', () => {
    expect(pickActiveSection(SECTIONS, 200, false)).toBe('a')
  })

  it('should mark the last section whose top crossed the line', () => {
    expect(pickActiveSection(SECTIONS, 1000, false)).toBe('b')
  })

  it('should mark the last section at the bottom of the page', () => {
    expect(pickActiveSection(SECTIONS, 200, true)).toBe('c')
  })

  it('should mark nothing when there are no sections', () => {
    expect(pickActiveSection([], 200, false)).toBeNull()
  })
})
