import type { ZodTypeAny, z } from 'zod'

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
    console.error(`[${context}] non-JSON AI response:`, stripped.slice(0, 500))
    throw new Error('No JSON object in AI response')
  }
  return schema.parse(JSON.parse(stripped.slice(start, end + 1)))
}
