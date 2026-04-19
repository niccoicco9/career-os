'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'
import { Mistral } from '@mistralai/mistralai'
import {
  AI_MODEL,
  AI_RESUME_MAX_TOKENS,
  AI_ANALYSIS_TIMEOUT_MS,
  PDF_TEXT_MAX_CHARS,
  PDF_MAX_SIZE_BYTES,
  RESUME_RATE_LIMIT,
  RESUME_RATE_WINDOW_MS,
} from '@/lib/constants'
import { checkRateLimit } from '@/lib/rate-limit'
import { parseJsonResponse } from '@/lib/ai'
import { logger } from '@/lib/logger'

const aiAnalysisSchema = z.object({
  skills: z.array(z.string()).default([]),
  experience: z.array(z.string()).default([]),
  education: z.array(z.string()).default([]),
  summary: z.string().default(''),
})

type AiAnalysis = z.infer<typeof aiAnalysisSchema>
type Analysis = AiAnalysis & { extractedText: string }

const EMPTY_ANALYSIS: Analysis = {
  extractedText: '',
  skills: [],
  experience: [],
  education: [],
  summary: '',
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return result.text
  } finally {
    await parser.destroy().catch(() => {})
  }
}

async function analyzeWithAI(pdfText: string): Promise<AiAnalysis> {
  const client = new Mistral({ apiKey: config.mistralApiKey })
  const response = await client.chat.complete({
    model: AI_MODEL,
    temperature: 0.1,
    maxTokens: AI_RESUME_MAX_TOKENS,
    responseFormat: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Sei un assistente che estrae informazioni da CV e risponde sempre in formato JSON. Basati SOLO sul testo del CV fornito. Non inventare skill, esperienze o titoli non presenti. Non normalizzare i nomi delle skill (se nel CV c\'è "JavaScript" non scrivere "Java").',
      },
      {
        role: 'user',
        content: `Estrai le informazioni dal seguente CV e restituisci un oggetto JSON con esattamente questo schema:
{
  "skills": [<skill tecniche e soft skill realmente presenti, max 15, stringhe brevi>],
  "experience": [<ruoli lavorativi nel formato "Ruolo - Azienda (periodo)", max 4>],
  "education": [<titoli di studio con istituzione, max 3>],
  "summary": "<riassunto professionale fattuale in 2 frasi brevi, basato solo sul CV>"
}

Testo del CV:
"""
${pdfText}
"""`,
      },
    ],
  })
  const raw = response.choices?.[0]?.message?.content
  const text = typeof raw === 'string' ? raw : ''
  if (!text) throw new Error('Empty response from AI')
  return parseJsonResponse(text, aiAnalysisSchema, 'uploadResume')
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
    ),
  ])
}

export async function uploadResume(formData: FormData): Promise<{ aiError: string | null }> {
  const user = await requireUser()
  checkRateLimit(`resume:upload:${user.id}`, RESUME_RATE_LIMIT, RESUME_RATE_WINDOW_MS)

  const file = formData.get('file')
  if (!(file instanceof File) || file.type !== 'application/pdf') {
    throw new Error('File PDF richiesto')
  }
  if (file.size > PDF_MAX_SIZE_BYTES) {
    throw new Error('File troppo grande (max 5MB)')
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const safeName = file.name.replace(/[^\w.\-]/g, '_').slice(-100) || 'resume.pdf'

  const supabase = await createClient()
  const storagePath = `${user.id}/${Date.now()}-${safeName}`
  const { error: uploadError, data: uploadData } = await supabase.storage
    .from('resumes')
    .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: false })
  if (uploadError) {
    throw new Error('Errore upload: ' + uploadError.message)
  }

  let analysis: Analysis = EMPTY_ANALYSIS
  let aiError: string | null = null

  try {
    const pdfText = (await extractPdfText(buffer)).slice(0, PDF_TEXT_MAX_CHARS).trim()
    if (!pdfText) throw new Error('PDF vuoto o non leggibile')
    const ai = await withTimeout(analyzeWithAI(pdfText), AI_ANALYSIS_TIMEOUT_MS, 'AI analysis')
    analysis = { ...ai, extractedText: pdfText }
  } catch (err) {
    aiError = err instanceof Error ? err.message : 'Errore analisi AI'
    logger.error('uploadResume.ai_analysis_failed', { userId: user.id, err })
  }

  const previousResumes = await prisma.$transaction(async (tx) => {
    const previous = await tx.resume.findMany({
      where: { userId: user.id },
      select: { id: true, fileUrl: true },
    })
    await tx.resume.create({
      data: {
        userId: user.id,
        fileUrl: uploadData.path,
        fileName: file.name,
        extractedText: analysis.extractedText || null,
        skills: analysis.skills,
        rawAnalysis: analysis as object,
      },
    })
    if (previous.length > 0) {
      await tx.resume.deleteMany({
        where: { id: { in: previous.map((r) => r.id) } },
      })
    }
    return previous
  })

  if (previousResumes.length > 0) {
    const { error: removeError } = await supabase.storage
      .from('resumes')
      .remove(previousResumes.map((r) => r.fileUrl))
    if (removeError) {
      logger.error('uploadResume.storage_cleanup_failed', {
        userId: user.id,
        message: removeError.message,
      })
    }
  }

  revalidatePath('/profile')
  return { aiError }
}
