import { z } from 'zod'

export const matchAnalysisSchema = z.object({
  score: z.number().int().min(0).max(100),
  matchingSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  explanation: z.string().default(''),
  suggestion: z.string().default(''),
})

export type MatchAnalysis = z.infer<typeof matchAnalysisSchema>
