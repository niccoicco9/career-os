import { createClient } from '@/lib/supabase/server'
import { getApiUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { config } from '@/lib/config'
import {
  AI_MODEL,
  AI_RESUME_MAX_TOKENS,
  AI_ANALYSIS_TIMEOUT_MS,
  PDF_TEXT_MAX_CHARS,
  PDF_MAX_SIZE_BYTES,
} from '@/lib/constants'

const groq = new Groq({ apiKey: config.groqApiKey })

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
    console.error('[resume/route] non-JSON AI response:', stripped.slice(0, 500))
    throw new Error('No JSON object in AI response')
  }
  const json = JSON.parse(stripped.slice(start, end + 1))
  return aiAnalysisSchema.parse(json)
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

export async function POST(request: Request) {
  try {
    const user = await getApiUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const supabase = await createClient()
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File) || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File PDF richiesto' }, { status: 400 })
    }
    if (file.size > PDF_MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File troppo grande (max 5MB)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('resumes')
      .upload(fileName, buffer, { contentType: 'application/pdf', upsert: false })
    if (uploadError) {
      return NextResponse.json(
        { error: 'Errore upload: ' + uploadError.message },
        { status: 500 }
      )
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
      console.error('[resume/route] AI analysis failed:', aiError)
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

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileUrl: uploadData.path,
        fileName: file.name,
        extractedText: analysis.extractedText || null,
        skills: analysis.skills,
        rawAnalysis: analysis as object,
      },
    })

    return NextResponse.json({ id: resume.id, aiError }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto'
    console.error('[resume/route] fatal:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
