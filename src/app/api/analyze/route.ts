import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ jobDescription: z.string().min(50) })

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function extractJson(text: string) {
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  return JSON.parse(stripped)
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
    }

    const { jobDescription } = parsed.data

    const resume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    const resumeContext = resume?.extractedText
      ? `CV dell'utente:\n${resume.extractedText}`
      : 'Nessun CV caricato. Restituisci score 0 e suggerisci di caricare il CV.'

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    const result = await model.generateContent(
      `Sei un career coach esperto. Analizza la compatibilità tra questo CV e questa job description.

${resumeContext}

Job Description:
${jobDescription}

Rispondi SOLO con un oggetto JSON valido (nessun markdown, niente prima o dopo):
{
  "score": <numero 0-100>,
  "matchingSkills": [<skill presenti nel CV e richieste dal ruolo, max 6>],
  "missingSkills": [<skill richieste ma assenti nel CV, max 5>],
  "explanation": "<spiegazione breve del punteggio, max 2 frasi>",
  "suggestion": "<un suggerimento operativo concreto, max 1 frase>"
}`
    )

    const text = result.response.text()
    const analysis = extractJson(text)
    return NextResponse.json(analysis)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
