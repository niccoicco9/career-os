import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { STATUS_LABELS, STATUS_COLORS, STATUS_BAR_COLORS, STATUS_ORDER } from '@/lib/status'
import type { ApplicationStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusFunnelProps {
  breakdown: Record<ApplicationStatus, number>
}

export function StatusFunnel({ breakdown }: StatusFunnelProps) {
  const max = Math.max(...Object.values(breakdown), 1)
  const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline per stato</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nessuna candidatura ancora.
          </p>
        ) : (
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = breakdown[status]
              const widthPct = (count / max) * 100
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={cn(
                        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
                        STATUS_COLORS[status]
                      )}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-muted-foreground tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', STATUS_BAR_COLORS[status])}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
