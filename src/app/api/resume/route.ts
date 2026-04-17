import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

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

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File PDF richiesto' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('resumes')
      .upload(fileName, buffer, { contentType: 'application/pdf', upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: 'Errore upload: ' + uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(uploadData.path)

    const base64 = buffer.toString('base64')

    let analysis = {
      extractedText: '',
      skills: [] as string[],
      experience: [] as string[],
      education: [] as string[],
      summary: '',
    }
    let aiError: string | null = null

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
      const result = await model.generateContent([
        {
          inlineData: { data: base64, mimeType: 'application/pdf' },
        },
        `Analizza questo CV e restituisci SOLO un oggetto JSON valido (nessun markdown, niente prima o dopo):
{
  "extractedText": "<testo principale del CV, max 1500 caratteri>",
  "skills": [<lista skill tecniche e soft skill, max 20, stringhe brevi>],
  "experience": [<ruoli lavorativi principali, max 5, formato "Ruolo - Azienda (anno)">],
  "education": [<titoli di studio, max 3>],
  "summary": "<riassunto professionale in 2 frasi>"
}`,
      ])
      const text = result.response.text()
      if (text) analysis = extractJson(text)
    } catch (err) {
      aiError = err instanceof Error ? err.message : 'Errore analisi AI'
      console.error('[resume/route] AI analysis failed:', aiError)
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id, email: user.email!, name: user.user_metadata?.full_name ?? null },
    })

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileUrl: urlData.publicUrl,
        fileName: file.name,
        extractedText: analysis.extractedText || null,
        skills: analysis.skills ?? [],
        rawAnalysis: analysis as object,
      },
    })

    return NextResponse.json({ id: resume.id, aiError }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
