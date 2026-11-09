import { describe, expect, it } from 'vitest'
import {
  counterpartAnchor,
  nextTabIndex,
  topicIndexFromHash,
} from './topicHash'

const ES = ['diagnostico', 'precios', 'proceso', 'entrega', 'trabaja-con-muush']
const EN = ['assessment', 'pricing', 'process', 'delivery', 'work-with-muush']

describe('topicIndexFromHash', () => {
  it('should find the topic when the fragment names one, with or without its hash', () => {
    expect(topicIndexFromHash('#precios', ES)).toBe(1)
    expect(topicIndexFromHash('trabaja-con-muush', ES)).toBe(4)
    expect(topicIndexFromHash('#pricing', EN)).toBe(1)
  })

  it('should decode a percent-encoded fragment when it is read', () => {
    expect(topicIndexFromHash('#%70recios', ES)).toBe(1)
  })

  it('should name no topic when the fragment is empty, unknown or malformed', () => {
    expect(topicIndexFromHash('', ES)).toBeNull()
    expect(topicIndexFromHash('#', ES)).toBeNull()
    expect(topicIndexFromHash('#nada', ES)).toBeNull()
    expect(topicIndexFromHash('#pricing', ES)).toBeNull()
    expect(topicIndexFromHash('#%E0%A4%A', ES)).toBeNull()
  })
})

describe('nextTabIndex', () => {
  it('should move right and wrap from the last tab when ArrowRight is pressed', () => {
    expect(nextTabIndex(0, 'ArrowRight', 5)).toBe(1)
    expect(nextTabIndex(4, 'ArrowRight', 5)).toBe(0)
  })

  it('should move left and wrap from the first tab when ArrowLeft is pressed', () => {
    expect(nextTabIndex(3, 'ArrowLeft', 5)).toBe(2)
    expect(nextTabIndex(0, 'ArrowLeft', 5)).toBe(4)
  })

  it('should jump to the ends when Home or End is pressed', () => {
    expect(nextTabIndex(2, 'Home', 5)).toBe(0)
    expect(nextTabIndex(2, 'End', 5)).toBe(4)
  })

  it('should return null when any other key is pressed', () => {
    expect(nextTabIndex(2, 'Enter', 5)).toBeNull()
    expect(nextTabIndex(2, 'ArrowDown', 5)).toBeNull()
  })
})

describe('counterpartAnchor', () => {
  it('should give the same topic in the other locale when a topic is named', () => {
    expect(counterpartAnchor(1, EN)).toBe('pricing')
    expect(counterpartAnchor(4, EN)).toBe('work-with-muush')
    expect(counterpartAnchor(4, ES)).toBe('trabaja-con-muush')
  })

  it('should give no fragment when no topic is named', () => {
    expect(counterpartAnchor(null, EN)).toBeUndefined()
  })
})
