import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { ApplicationsTable } from '@/components/features/applications-table'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { jobPosting: true, resume: true, notes: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidature</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {applications.length} candidature in pipeline
          </p>
        </div>
        <Link href="/applications/new" className={buttonVariants()}>
          <Plus className="size-4 mr-2" />
          Nuova candidatura
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg py-24 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Nessuna candidatura ancora. Aggiungine una per iniziare!
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
  )
}
