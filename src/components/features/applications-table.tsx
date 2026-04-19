import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ApplicationListItem } from '@/types'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  SCORE_TEXT_COLORS,
  scoreTone,
} from '@/lib/status'
import { formatDistanceToNow, differenceInCalendarDays, format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'

function followUpLabel(date: Date) {
  const days = differenceInCalendarDays(date, new Date())
  if (days < 0) return { text: 'Follow-up scaduto', tone: 'destructive' as const }
  if (days === 0) return { text: 'Follow-up oggi', tone: 'warning' as const }
  if (days <= 7) return { text: `Follow-up tra ${days}g`, tone: 'warning' as const }
  return { text: format(date, 'd MMM', { locale: it }), tone: 'muted' as const }
}

const followUpClasses = {
  destructive: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300',
  muted: 'bg-muted text-muted-foreground',
}

interface ApplicationsTableProps {
  applications: ApplicationListItem[]
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ruolo</TableHead>
            <TableHead>Azienda</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Follow-up</TableHead>
            <TableHead className="text-right">Aggiunta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} className="relative hover:bg-muted/50 focus-within:bg-muted/50">
              <TableCell>
                <Link
                  href={`/applications/${app.id}`}
                  className="font-medium transition-colors hover:text-primary after:absolute after:inset-0 after:content-['']"
                >
                  {app.jobPosting.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {app.jobPosting.company}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn('text-xs', STATUS_COLORS[app.status as keyof typeof STATUS_COLORS])}
                >
                  {STATUS_LABELS[app.status as keyof typeof STATUS_LABELS]}
                </Badge>
              </TableCell>
              <TableCell>
                {app.matchScore != null ? (
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      SCORE_TEXT_COLORS[scoreTone(app.matchScore)]
                    )}
                  >
                    {app.matchScore}/100
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {app.followUpDate ? (
                  (() => {
                    const { text, tone } = followUpLabel(new Date(app.followUpDate))
                    return (
                      <Badge
                        variant="secondary"
                        className={cn('text-xs gap-1', followUpClasses[tone])}
                      >
                        <CalendarClock className="size-3" />
                        {text}
                      </Badge>
                    )
                  })()
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(app.createdAt), {
                  addSuffix: true,
                  locale: it,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
