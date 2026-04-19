'use server'

import { Mistral } from '@mistralai/mistralai'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { getApplication } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { config } from '@/lib/config'
import { AI_MODEL, AI_ANALYZE_MAX_TOKENS, AI_RATE_LIMIT, AI_RATE_WINDOW_MS } from '@/lib/constants'
import { checkRateLimit } from '@/lib/rate-limit'
import { parseJsonResponse } from '@/lib/ai'
import { matchAnalysisSchema } from '@/lib/validators'
import type { MatchAnalysis } from '@/lib/validators'
import { ApplicationStatus } from '@/generated/prisma/enums'

const statusSchema = z.nativeEnum(ApplicationStatus)
const noteSchema = z.string().trim().min(1).max(5000)

const httpUrlSchema = z
  .string()
  .url()
  .max(2000)
  .refine((u) => /^https?:\/\//i.test(u), { message: 'URL deve iniziare con http(s)://' })

const createApplicationSchema = z.object({
  title: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  url: httpUrlSchema.or(z.literal('')).optional(),
  matchAnalysis: matchAnalysisSchema.nullable(),
})

type CreateApplicationInput = z.infer<typeof createApplicationSchema>

const jobDescriptionSchema = z.string().trim().min(50).max(10000)

async function requireOwnedApplication(id: string) {
  const user = await requireUser()
  const application = await getApplication(user.id, id)
  if (!application) throw new Error('Candidatura non trovata')
  return { user, application }
}

export async function updateFollowUpDate(id: string, date: string | null) {
  await requireOwnedApplication(id)

  let followUpDate: Date | null = null
  if (date) {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) throw new Error('Data non valida')
    followUpDate = parsed
  }

  await prisma.application.update({
    where: { id },
    data: { followUpDate },
  })

  revalidatePath(`/applications/${id}`)
  revalidatePath('/applications')
  revalidatePath('/dashboard')
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const parsedStatus = statusSchema.parse(status)
  await requireOwnedApplication(id)

  await prisma.application.update({
    where: { id },
    data: { status: parsedStatus },
  })

  revalidatePath(`/applications/${id}`)
  revalidatePath('/applications')
  revalidatePath('/dashboard')
}

export async function deleteApplication(id: string) {
  const { application } = await requireOwnedApplication(id)

  await prisma.$transaction(async (tx) => {
    await tx.application.delete({ where: { id } })
    const remaining = await tx.application.count({
      where: { jobPostingId: application.jobPostingId },
    })
    if (remaining === 0) {
      await tx.jobPosting.delete({ where: { id: application.jobPostingId } })
    }
  })

  revalidatePath('/applications')
  revalidatePath('/dashboard')
}

export async function createNote(applicationId: string, content: string) {
  const parsedContent = noteSchema.parse(content)
  await requireOwnedApplication(applicationId)

  const note = await prisma.note.create({
    data: { applicationId, content: parsedContent },
  })

  revalidatePath(`/applications/${applicationId}`)
  return note
}

export async function createApplication(input: CreateApplicationInput): Promise<{ id: string }> {
  const user = await requireUser()
  const parsed = createApplicationSchema.parse(input)

  const resume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })

  const application = await prisma.$transaction(async (tx) => {
    const jobPosting = await tx.jobPosting.create({
      data: {
        title: parsed.title,
        company: parsed.company,
        description: parsed.description,
        url: parsed.url || null,
        skills: parsed.matchAnalysis?.jobSkills ?? [],
      },
    })
    return tx.application.create({
      data: {
        userId: user.id,
        jobPostingId: jobPosting.id,
        resumeId: resume?.id ?? null,
        status: 'APPLIED',
        matchScore: parsed.matchAnalysis?.score ?? null,
        matchAnalysis: parsed.matchAnalysis ?? Prisma.JsonNull,
        appliedAt: new Date(),
      },
    })
  })

  revalidatePath('/applications')
  revalidatePath('/dashboard')
  return { id: application.id }
}

export async function analyzeJobMatch(jobDescription: string): Promise<MatchAnalysis> {
  const user = await requireUser()
  checkRateLimit(`ai:analyze:${user.id}`, AI_RATE_LIMIT, AI_RATE_WINDOW_MS)
  const parsedDescription = jobDescriptionSchema.parse(jobDescription)

  const resume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const resumeContext = resume?.extractedText
    ? `CV dell'utente:\n"""\n${resume.extractedText}\n"""`
    : 'Nessun CV caricato. Restituisci score 0 e suggerisci di caricare il CV.'

  const client = new Mistral({ apiKey: config.mistralApiKey })
  const response = await client.chat.complete({
    model: AI_MODEL,
    temperature: 0.2,
    maxTokens: AI_ANALYZE_MAX_TOKENS,
    responseFormat: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Sei un career coach esperto e rispondi sempre in formato JSON. Valuti la compatibilità CV/job description basandoti SOLO sui contenuti forniti. Non inventare skill non presenti nel CV.',
      },
      {
        role: 'user',
        content: `${resumeContext}

Job Description:
"""
${parsedDescription}
"""

Restituisci un oggetto JSON con esattamente questo schema:
{
  "score": <numero intero 0-100>,
  "jobSkills": [<tutte le skill tecniche e strumenti richiesti dal ruolo estratti dalla JD, max 10>],
  "matchingSkills": [<skill realmente presenti nel CV e richieste dal ruolo, max 6>],
  "missingSkills": [<skill richieste dal ruolo ma assenti nel CV, max 5>],
  "explanation": "<spiegazione del punteggio basata sui fatti, max 2 frasi>",
  "suggestion": "<un suggerimento operativo concreto, max 1 frase>"
}`,
      },
    ],
  })

  const raw = response.choices?.[0]?.message?.content
  const text = typeof raw === 'string' ? raw : ''
  if (!text) throw new Error('Empty response from AI')
  return parseJsonResponse(text, matchAnalysisSchema, 'analyzeJobMatch')
}
