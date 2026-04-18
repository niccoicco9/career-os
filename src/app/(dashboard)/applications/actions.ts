'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { getApplication } from '@/lib/data'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@/generated/prisma/enums'

const statusSchema = z.nativeEnum(ApplicationStatus)
const noteSchema = z.string().trim().min(1).max(5000)

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
