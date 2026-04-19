'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ApplicationStatus } from '@/types'
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/status'
import { updateApplicationStatus } from '@/app/(dashboard)/applications/actions'

interface StatusSelectProps {
  applicationId: string
  currentStatus: ApplicationStatus
}

export function StatusSelect({ applicationId, currentStatus }: StatusSelectProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus)
  const [pending, startTransition] = useTransition()

  function handleChange(next: string | null) {
    if (!next) return
    const prev = status
    const nextStatus = next as ApplicationStatus
    setStatus(nextStatus)
    startTransition(async () => {
      try {
        await updateApplicationStatus(applicationId, nextStatus)
        toast.success('Stato aggiornato')
      } catch {
        setStatus(prev)
        toast.error('Errore aggiornamento stato')
      }
    })
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
