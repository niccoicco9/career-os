import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().optional().or(z.literal('')),
  matchScore: z.number().int().min(0).max(100).nullable().optional(),
  matchAnalysis: z.any().optional(),
})

export async function POST(request: Request) {
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

  const { title, company, description, url, matchScore, matchAnalysis } = parsed.data

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name ?? null,
    },
  })

  const resume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const jobPosting = await prisma.jobPosting.create({
    data: {
      title,
      company,
      description,
      url: url || null,
      skills: matchAnalysis?.matchingSkills ?? [],
    },
  })

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      jobPostingId: jobPosting.id,
      resumeId: resume?.id ?? null,
      status: 'APPLIED',
      matchScore: matchScore ?? null,
      matchAnalysis: matchAnalysis ?? null,
      appliedAt: new Date(),
    },
  })

  return NextResponse.json({ id: application.id }, { status: 201 })
}
