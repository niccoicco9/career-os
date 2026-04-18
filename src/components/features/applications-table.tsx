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
import type { ApplicationWithRelations } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/status'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ApplicationsTableProps {
  applications: ApplicationWithRelations[]
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
            <TableHead className="text-right">Aggiunta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Link
                  href={`/applications/${app.id}`}
                  className="font-medium hover:text-primary transition-colors"
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
                      app.matchScore >= 70
                        ? 'text-green-600 dark:text-green-400'
                        : app.matchScore >= 50
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {app.matchScore}/100
                  </span>
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
