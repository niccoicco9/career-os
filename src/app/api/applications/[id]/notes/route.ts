import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ content: z.string().min(1) })

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }

  const application = await prisma.application.findFirst({
    where: { id, userId: user.id },
  })

  if (!application) {
    return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
  }

  const note = await prisma.note.create({
    data: { applicationId: id, content: parsed.data.content },
  })

  return NextResponse.json(note, { status: 201 })
}
