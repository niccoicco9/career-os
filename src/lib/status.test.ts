import { describe, expect, it } from 'vitest'
import { scoreTone } from './status'

describe('scoreTone', () => {
  it('returns high for scores >= 70', () => {
    expect(scoreTone(100)).toBe('high')
    expect(scoreTone(70)).toBe('high')
  })

  it('returns medium for scores 50-69', () => {
    expect(scoreTone(69)).toBe('medium')
    expect(scoreTone(50)).toBe('medium')
  })

  it('returns low for scores < 50', () => {
    expect(scoreTone(49)).toBe('low')
    expect(scoreTone(0)).toBe('low')
  })
})
