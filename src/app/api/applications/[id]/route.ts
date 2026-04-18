import { getApiUser } from '@/lib/auth'
import { getApplication } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED']).optional(),
  followUpDate: z.string().datetime().nullable().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getApiUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }

  const application = await getApplication(user.id, id)
  if (!application) {
    return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
  }

  const updated = await prisma.application.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getApiUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const application = await getApplication(user.id, id)
  if (!application) {
    return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
  }

  await prisma.application.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
