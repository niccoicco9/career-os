import { getApiUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { config } from '@/lib/config'
import { AI_MODEL, AI_ANALYZE_MAX_TOKENS } from '@/lib/constants'
import { matchAnalysisSchema } from '@/lib/validators'

const groq = new Groq({ apiKey: config.groqApiKey })

const requestSchema = z.object({ jobDescription: z.string().min(50) })

function parseMatch(text: string) {
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) {
    console.error('[analyze/route] non-JSON AI response:', stripped.slice(0, 500))
    throw new Error('No JSON object in AI response')
  }
  const json = JSON.parse(stripped.slice(start, end + 1))
  return matchAnalysisSchema.parse(json)
}

export async function POST(request: Request) {
  try {
    const user = await getApiUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
    }

    const resume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    const resumeContext = resume?.extractedText
      ? `CV dell'utente:\n"""\n${resume.extractedText}\n"""`
      : 'Nessun CV caricato. Restituisci score 0 e suggerisci di caricare il CV.'

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
${parsed.data.jobDescription}
"""

Restituisci un oggetto JSON con esattamente questo schema:
{
  "score": <numero intero 0-100>,
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
    const analysis = parseMatch(text)
    return NextResponse.json(analysis)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto'
    console.error('[analyze/route] failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
