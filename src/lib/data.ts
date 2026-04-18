import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from './prisma'

export const getDashboardData = cache(async (userId: string) => {
  const [applications, dbUser, total, interviews, offers, avgScore] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      include: { jobPosting: true, resume: true, notes: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.application.count({ where: { userId } }),
    prisma.application.count({
      where: { userId, status: { in: ['INTERVIEW', 'OFFER'] } },
    }),
    prisma.application.count({ where: { userId, status: 'OFFER' } }),
    prisma.application.aggregate({
      where: { userId, matchScore: { not: null } },
      _avg: { matchScore: true },
    }),
  ])
  return {
    applications,
    dbUser,
    kpi: {
      total,
      interviews,
      offers,
      avgScore: Math.round(avgScore._avg.matchScore ?? 0),
      responseRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
    },
  }
})

export const getApplications = cache(async (userId: string) => {
  return prisma.application.findMany({
    where: { userId },
    include: { jobPosting: true, resume: true, notes: true },
    orderBy: { createdAt: 'desc' },
  })
})

export const getProfile = cache(async (userId: string) => {
  return Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])
})

export const getApplication = cache(async (userId: string, id: string) => {
  return prisma.application.findFirst({
    where: { id, userId },
    include: {
      jobPosting: true,
      resume: true,
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })
})

export async function requireApplication(userId: string, id: string) {
  const application = await getApplication(userId, id)
  if (!application) notFound()
  return application
}
