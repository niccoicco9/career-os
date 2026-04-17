import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { KpiCards } from '@/components/features/kpi-cards'
import { ApplicationsTable } from '@/components/features/applications-table'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [applications, dbUser] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      include: { jobPosting: true, resume: true, notes: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.user.findUnique({ where: { id: user.id } }),
  ])

  const total = await prisma.application.count({ where: { userId: user.id } })
  const interviews = await prisma.application.count({
    where: { userId: user.id, status: { in: ['INTERVIEW', 'OFFER'] } },
  })
  const offers = await prisma.application.count({
    where: { userId: user.id, status: 'OFFER' },
  })
  const avgScore = await prisma.application.aggregate({
    where: { userId: user.id, matchScore: { not: null } },
    _avg: { matchScore: true },
  })

  const kpi = {
    total,
    interviews,
    offers,
    avgScore: Math.round(avgScore._avg.matchScore ?? 0),
    responseRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Benvenuto{dbUser?.name ? `, ${dbUser.name}` : ''}. Ecco il riepilogo della tua ricerca.
          </p>
        </div>
        <Link href="/applications/new" className={buttonVariants()}>
          <Plus className="size-4 mr-2" />
          Nuova candidatura
        </Link>
      </div>

      <KpiCards kpi={kpi} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Candidature recenti</h2>
          <Link href="/applications" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Vedi tutte →
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg py-16 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Nessuna candidatura ancora. Inizia aggiungendone una!
            </p>
            <Link href="/applications/new" className={buttonVariants()}>
              <Plus className="size-4 mr-2" />
              Aggiungi candidatura
            </Link>
          </div>
        ) : (
          <ApplicationsTable applications={applications} />
        )}
      </div>
    </div>
  )
}
