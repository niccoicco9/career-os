'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_LABELS, type ApplicationStatus } from '@/types'

interface StatusSelectProps {
  applicationId: string
  currentStatus: ApplicationStatus
}

const statuses = Object.keys(STATUS_LABELS) as ApplicationStatus[]

export function StatusSelect({ applicationId, currentStatus }: StatusSelectProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus)
  const [pending, setPending] = useState(false)

  async function handleChange(next: string | null) {
    if (!next) return
    const prev = status
    setStatus(next as ApplicationStatus)
    setPending(true)

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })

      if (!res.ok) {
        setStatus(prev)
        toast.error('Errore aggiornamento stato')
      }
    } catch {
      setStatus(prev)
      toast.error('Errore aggiornamento stato')
    } finally {
      setPending(false)
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
