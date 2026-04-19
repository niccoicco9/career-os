import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { parseJsonResponse } from './ai'

const schema = z.object({ score: z.number(), skills: z.array(z.string()) })

describe('parseJsonResponse', () => {
  it('parses clean JSON', () => {
    const text = '{"score": 85, "skills": ["react"]}'
    expect(parseJsonResponse(text, schema, 'test')).toEqual({ score: 85, skills: ['react'] })
  })

  it('strips ```json markdown fences', () => {
    const text = '```json\n{"score": 70, "skills": []}\n```'
    expect(parseJsonResponse(text, schema, 'test')).toEqual({ score: 70, skills: [] })
  })

  it('strips trailing prose after JSON object', () => {
    const text = '{"score": 60, "skills": ["ts"]}\n\nHope this helps!'
    expect(parseJsonResponse(text, schema, 'test')).toEqual({ score: 60, skills: ['ts'] })
  })

  it('throws on non-JSON response', () => {
    expect(() => parseJsonResponse('no braces at all', schema, 'test')).toThrow(
      /No JSON object/
    )
  })

  it('throws on schema mismatch', () => {
    const text = '{"score": "not a number", "skills": []}'
    expect(() => parseJsonResponse(text, schema, 'test')).toThrow()
  })
})
