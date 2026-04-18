import { getApiUser } from '@/lib/auth'
import { getApplication } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ content: z.string().min(1) })

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getApiUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }

  const application = await getApplication(user.id, id)
  if (!application) {
    return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
  }

  const note = await prisma.note.create({
    data: { applicationId: id, content: parsed.data.content },
  })

  return NextResponse.json(note, { status: 201 })
}
