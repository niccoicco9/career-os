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
  currentStatus: string
}

const statuses: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
]

export function StatusSelect({ applicationId, currentStatus }: StatusSelectProps) {
  const [status, setStatus] = useState(currentStatus)

  async function handleChange(newStatus: string | null) {
    if (!newStatus) return
    const prev = status
    setStatus(newStatus)

    const res = await fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      setStatus(prev)
      toast.error('Errore aggiornamento stato')
    }
  }

  return (
    <Select value={status} onValueChange={handleChange}>
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
