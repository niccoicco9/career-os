'use server'

import Groq from 'groq-sdk'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { getApplication } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { config } from '@/lib/config'
import { AI_MODEL, AI_ANALYZE_MAX_TOKENS } from '@/lib/constants'
import { matchAnalysisSchema } from '@/lib/validators'
import type { MatchAnalysis } from '@/lib/validators'
import { ApplicationStatus } from '@/generated/prisma/enums'

const statusSchema = z.nativeEnum(ApplicationStatus)
const noteSchema = z.string().trim().min(1).max(5000)

const createApplicationSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().or(z.literal('')).optional(),
  matchAnalysis: matchAnalysisSchema.nullable().optional(),
})

type CreateApplicationInput = z.infer<typeof createApplicationSchema>

const jobDescriptionSchema = z.string().trim().min(50)

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const user = await requireUser()
  const parsedStatus = statusSchema.parse(status)

  const application = await getApplication(user.id, id)
  if (!application) throw new Error('Candidatura non trovata')

  await prisma.application.update({
    where: { id },
    data: { status: parsedStatus },
  })

  revalidatePath(`/applications/${id}`)
  revalidatePath('/applications')
  revalidatePath('/dashboard')
}

export async function deleteApplication(id: string) {
  const user = await requireUser()

  const application = await getApplication(user.id, id)
  if (!application) throw new Error('Candidatura non trovata')

  await prisma.application.delete({ where: { id } })

  revalidatePath('/applications')
  revalidatePath('/dashboard')
  redirect('/applications')
}

export async function createNote(applicationId: string, content: string) {
  const user = await requireUser()
  const parsedContent = noteSchema.parse(content)

  const application = await getApplication(user.id, applicationId)
  if (!application) throw new Error('Candidatura non trovata')

  const note = await prisma.note.create({
    data: { applicationId, content: parsedContent },
  })

  revalidatePath(`/applications/${applicationId}`)
  return note
}

export async function createApplication(input: CreateApplicationInput) {
  const user = await requireUser()
  const parsed = createApplicationSchema.parse(input)

  const resume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const jobPosting = await prisma.jobPosting.create({
    data: {
      title: parsed.title,
      company: parsed.company,
      description: parsed.description,
      url: parsed.url || null,
      skills: parsed.matchAnalysis?.jobSkills ?? [],
    },
  })

  const application = await prisma.application.create({
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

  revalidatePath('/applications')
  revalidatePath('/dashboard')
  redirect(`/applications/${application.id}`)
}

export async function analyzeJobMatch(jobDescription: string): Promise<MatchAnalysis> {
  const user = await requireUser()
  const parsedDescription = jobDescriptionSchema.parse(jobDescription)

  const resume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const resumeContext = resume?.extractedText
    ? `CV dell'utente:\n"""\n${resume.extractedText}\n"""`
    : 'Nessun CV caricato. Restituisci score 0 e suggerisci di caricare il CV.'

  const groq = new Groq({ apiKey: config.groqApiKey })
  const message = await groq.chat.completions.create({
    model: AI_MODEL,
    max_tokens: AI_ANALYZE_MAX_TOKENS,
    temperature: 0.2,
    response_format: { type: 'json_object' },
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

  const text = message.choices[0]?.message?.content ?? ''
  if (!text) throw new Error('Empty response from AI')
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) {
    console.error('[analyzeJobMatch] non-JSON AI response:', stripped.slice(0, 500))
    throw new Error('No JSON object in AI response')
  }
  return matchAnalysisSchema.parse(JSON.parse(stripped.slice(start, end + 1)))
}
