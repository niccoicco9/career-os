import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MatchScoreCard } from '@/components/features/match-score-card'
import { NotesSection } from '@/components/features/notes-section'
import { StatusSelect } from '@/components/features/status-select'
import { DeleteApplicationButton } from '@/components/features/delete-application-button'
import { STATUS_LABELS, STATUS_COLORS, type MatchAnalysis } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Building2, ExternalLink } from 'lucide-react'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const application = await prisma.application.findFirst({
    where: { id, userId: session!.user.id },
    include: { jobPosting: true, resume: true, notes: { orderBy: { createdAt: 'desc' } } },
  })

  if (!application) notFound()

  const { jobPosting, notes } = application
  const analysis = application.matchAnalysis as MatchAnalysis | null

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{jobPosting.title}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5" />
              {jobPosting.company}
            </span>
            {application.appliedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {format(new Date(application.appliedAt), 'd MMM yyyy', { locale: it })}
              </span>
            )}
            {jobPosting.url && (
              <a
                href={jobPosting.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Annuncio
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusSelect applicationId={application.id} currentStatus={application.status} />
          <DeleteApplicationButton
            applicationId={application.id}
            applicationTitle={jobPosting.title}
          />
        </div>
      </div>

      {analysis && <MatchScoreCard analysis={analysis} />}

      {!analysis && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nessuna analisi disponibile. Crea una nuova candidatura con la descrizione
            dell&apos;annuncio per ottenere lo score.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descrizione annuncio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {jobPosting.description}
          </p>
        </CardContent>
      </Card>

      <NotesSection applicationId={application.id} initialNotes={notes} />
    </div>
  )
}
