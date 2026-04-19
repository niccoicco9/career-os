'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('dashboard.boundary', { err: error, digest: error.digest })
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'
  const detail = isDev ? error.message : error.digest

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-sm font-medium">Qualcosa è andato storto.</p>
      {detail && (
        <p className="text-xs text-muted-foreground max-w-sm font-mono break-all">{detail}</p>
      )}
      <Button size="sm" variant="outline" onClick={reset}>
        Riprova
      </Button>
    </div>
  )
}
