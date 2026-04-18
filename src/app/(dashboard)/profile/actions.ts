'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'
import Groq from 'groq-sdk'
import {
  AI_MODEL,
  AI_RESUME_MAX_TOKENS,
  AI_ANALYSIS_TIMEOUT_MS,
  PDF_TEXT_MAX_CHARS,
  PDF_MAX_SIZE_BYTES,
} from '@/lib/constants'

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

function parseAiAnalysis(text: string): AiAnalysis {
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) {
    console.error('[uploadResume] non-JSON AI response:', stripped.slice(0, 500))
    throw new Error('No JSON object in AI response')
  }
  return aiAnalysisSchema.parse(JSON.parse(stripped.slice(start, end + 1)))
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
  const groq = new Groq({ apiKey: config.groqApiKey })
  const message = await groq.chat.completions.create({
    model: AI_MODEL,
    max_tokens: AI_RESUME_MAX_TOKENS,
    temperature: 0.1,
    response_format: { type: 'json_object' },
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
  const text = message.choices[0]?.message?.content ?? ''
  if (!text) throw new Error('Empty response from AI')
  return parseAiAnalysis(text)
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

  const file = formData.get('file')
  if (!(file instanceof File) || file.type !== 'application/pdf') {
    throw new Error('File PDF richiesto')
  }
  if (file.size > PDF_MAX_SIZE_BYTES) {
    throw new Error('File troppo grande (max 5MB)')
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const supabase = await createClient()
  const fileName = `${user.id}/${Date.now()}-${file.name}`
  const { error: uploadError, data: uploadData } = await supabase.storage
    .from('resumes')
    .upload(fileName, buffer, { contentType: 'application/pdf', upsert: false })
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
    console.error('[uploadResume] AI analysis failed:', aiError)
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name ?? null,
    },
  })

  await prisma.resume.create({
    data: {
      userId: user.id,
      fileUrl: uploadData.path,
      fileName: file.name,
      extractedText: analysis.extractedText || null,
      skills: analysis.skills,
      rawAnalysis: analysis as object,
    },
  })

  revalidatePath('/profile')
  return { aiError }
}
