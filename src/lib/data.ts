import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from './prisma'
import { Prisma } from '@/generated/prisma/client'
import type { ApplicationStatus } from '@/generated/prisma/enums'

const applicationListSelect = {
  id: true,
  status: true,
  matchScore: true,
  followUpDate: true,
  createdAt: true,
  jobPosting: { select: { id: true, title: true, company: true } },
} satisfies Prisma.ApplicationSelect

export type ApplicationListItem = Prisma.ApplicationGetPayload<{
  select: typeof applicationListSelect
}>

export const getDashboardUser = cache(async (userId: string) => {
  return prisma.user.findUnique({ where: { id: userId } })
})

export const getDashboardKpi = cache(async (userId: string) => {
  const [total, interviews, offers, avgScore] = await Promise.all([
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
    total,
    interviews,
    offers,
    avgScore: Math.round(avgScore._avg.matchScore ?? 0),
    responseRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
  }
})

export const getStatusBreakdown = cache(async (userId: string) => {
  const rows = await prisma.application.groupBy({
    by: ['status'],
    where: { userId },
    _count: { _all: true },
  })
  const map = new Map(rows.map((r) => [r.status, r._count._all]))
  return {
    SAVED: map.get('SAVED') ?? 0,
    APPLIED: map.get('APPLIED') ?? 0,
    SCREENING: map.get('SCREENING') ?? 0,
    INTERVIEW: map.get('INTERVIEW') ?? 0,
    OFFER: map.get('OFFER') ?? 0,
    REJECTED: map.get('REJECTED') ?? 0,
  } satisfies Record<ApplicationStatus, number>
})

export const getDashboardRecent = cache(async (userId: string) => {
  return prisma.application.findMany({
    where: { userId },
    select: applicationListSelect,
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
})

export const getApplications = cache(
  async (
    userId: string,
    filters: { status?: ApplicationStatus; q?: string } = {}
  ) => {
    const where: Prisma.ApplicationWhereInput = { userId }
    if (filters.status) where.status = filters.status
    if (filters.q) {
      where.jobPosting = {
        OR: [
          { title: { contains: filters.q, mode: 'insensitive' } },
          { company: { contains: filters.q, mode: 'insensitive' } },
        ],
      }
    }
    return prisma.application.findMany({
      where,
      select: applicationListSelect,
      orderBy: { createdAt: 'desc' },
    })
  }
)

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
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })
})

export async function requireApplication(userId: string, id: string) {
  const application = await getApplication(userId, id)
  if (!application) notFound()
  return application
}
