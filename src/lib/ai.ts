import type { ZodTypeAny, z } from 'zod'
import { logger } from './logger'

export function parseJsonResponse<T extends ZodTypeAny>(
  text: string,
  schema: T,
  context: string
): z.infer<T> {
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) {
    logger.error('ai.response.non_json', { context, preview: stripped.slice(0, 500) })
    throw new Error('No JSON object in AI response')
  }
  return schema.parse(JSON.parse(stripped.slice(start, end + 1)))
}
