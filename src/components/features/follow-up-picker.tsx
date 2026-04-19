'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CalendarClock, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateFollowUpDate } from '@/app/(dashboard)/applications/actions'

interface FollowUpPickerProps {
  applicationId: string
  initialDate: Date | null
}

function toInputValue(date: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function FollowUpPicker({ applicationId, initialDate }: FollowUpPickerProps) {
  const [value, setValue] = useState(() => toInputValue(initialDate))
  const [pending, startTransition] = useTransition()

  function save(next: string) {
    const prev = value
    setValue(next)
    startTransition(async () => {
      try {
        await updateFollowUpDate(applicationId, next || null)
        toast.success(next ? 'Promemoria impostato' : 'Promemoria rimosso')
      } catch {
        setValue(prev)
        toast.error('Errore aggiornamento promemoria')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <CalendarClock className="size-4 text-muted-foreground shrink-0" />
      <Input
        type="date"
        value={value}
        onChange={(e) => save(e.target.value)}
        disabled={pending}
        className="w-auto"
        aria-label="Data promemoria follow-up"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => save('')}
          disabled={pending}
          aria-label="Rimuovi promemoria"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
