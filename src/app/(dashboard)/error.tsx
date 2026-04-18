'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-sm font-medium">Qualcosa è andato storto.</p>
      <p className="text-xs text-muted-foreground max-w-sm">{error.message}</p>
      <Button size="sm" variant="outline" onClick={reset}>
        Riprova
      </Button>
    </div>
  )
}
