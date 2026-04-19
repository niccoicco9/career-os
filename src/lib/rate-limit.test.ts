import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows calls up to the limit', () => {
    const key = `test:${Math.random()}`
    for (let i = 0; i < 3; i++) {
      expect(() => checkRateLimit(key, 3, 1000)).not.toThrow()
    }
  })

  it('throws when the limit is exceeded within the window', () => {
    const key = `test:${Math.random()}`
    checkRateLimit(key, 2, 1000)
    checkRateLimit(key, 2, 1000)
    expect(() => checkRateLimit(key, 2, 1000)).toThrow(/Troppe richieste/)
  })

  it('allows new calls once the window expires', () => {
    const key = `test:${Math.random()}`
    checkRateLimit(key, 1, 1000)
    expect(() => checkRateLimit(key, 1, 1000)).toThrow()

    vi.advanceTimersByTime(1001)
    expect(() => checkRateLimit(key, 1, 1000)).not.toThrow()
  })

  it('scopes rate limit per key', () => {
    checkRateLimit('user:a', 1, 1000)
    expect(() => checkRateLimit('user:b', 1, 1000)).not.toThrow()
  })
})
