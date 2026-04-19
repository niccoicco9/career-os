import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import {
  getDashboardUser,
  getDashboardKpi,
  getDashboardRecent,
  getStatusBreakdown,
} from '@/lib/data'
import { ApplicationsTable } from '@/components/features/applications-table'
import { KpiCards } from './_components/kpi-cards'
import { StatusFunnel } from './_components/status-funnel'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

async function DashboardKpi({ userId }: { userId: string }) {
  const kpi = await getDashboardKpi(userId)
  return <KpiCards kpi={kpi} />
}

async function DashboardFunnel({ userId }: { userId: string }) {
  const breakdown = await getStatusBreakdown(userId)
  return <StatusFunnel breakdown={breakdown} />
}

async function DashboardRecent({ userId }: { userId: string }) {
  const applications = await getDashboardRecent(userId)
  if (applications.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg py-16 text-center">
        <p className="text-muted-foreground text-sm mb-4">
          Nessuna candidatura ancora. Inizia aggiungendone una!
        </p>
        <Link href="/applications/new" className={buttonVariants()}>
          <Plus className="size-4 mr-2" />
          Aggiungi candidatura
        </Link>
      </div>
    )
  }
  return <ApplicationsTable applications={applications} />
}

async function DashboardHeader({ userId }: { userId: string }) {
  const dbUser = await getDashboardUser(userId)
  return (
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
  )
}

export default async function DashboardPage() {
  const user = await requireUser()

  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="flex items-center justify-between">
          <div className="space-y-2"><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-64" /></div>
          <Skeleton className="h-9 w-36" />
        </div>
      }>
        <DashboardHeader userId={user.id} />
      </Suspense>

      <Suspense fallback={
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      }>
        <DashboardKpi userId={user.id} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-72 rounded-xl" />}>
        <DashboardFunnel userId={user.id} />
      </Suspense>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Candidature recenti</h2>
          <Link href="/applications" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Vedi tutte →
          </Link>
        </div>
        <Suspense fallback={
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        }>
          <DashboardRecent userId={user.id} />
        </Suspense>
      </div>
    </div>
  )
}
