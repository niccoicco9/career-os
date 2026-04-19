import { requireUser } from '@/lib/auth'
import { getApplications } from '@/lib/data'
import { ApplicationsTable } from '@/components/features/applications-table'
import { ApplicationsFilters } from '@/components/features/applications-filters'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/status'
import type { ApplicationStatus } from '@/types'

function parseStatus(value: string | string[] | undefined): ApplicationStatus | undefined {
  const v = Array.isArray(value) ? value[0] : value
  if (!v) return undefined
  return v in STATUS_LABELS ? (v as ApplicationStatus) : undefined
}

function parseQuery(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  const trimmed = v?.trim()
  return trimmed ? trimmed.slice(0, 100) : undefined
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await requireUser()
  const params = await searchParams
  const status = parseStatus(params.status)
  const q = parseQuery(params.q)
  const applications = await getApplications(user.id, { status, q })
  const hasFilters = Boolean(status || q)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidature</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {applications.length}{' '}
            {hasFilters ? 'risultati con i filtri attivi' : 'candidature in pipeline'}
          </p>
        </div>
        <Link href="/applications/new" className={buttonVariants()}>
          <Plus className="size-4 mr-2" />
          Nuova candidatura
        </Link>
      </div>

      <ApplicationsFilters />

      {applications.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg py-24 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            {hasFilters
              ? 'Nessun risultato per i filtri selezionati.'
              : 'Nessuna candidatura ancora. Aggiungine una per iniziare!'}
          </p>
          {!hasFilters && (
            <Link href="/applications/new" className={buttonVariants()}>
              <Plus className="size-4 mr-2" />
              Aggiungi candidatura
            </Link>
          )}
        </div>
      ) : (
        <ApplicationsTable applications={applications} />
      )}
    </div>
  )
}
