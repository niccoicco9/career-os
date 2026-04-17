'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import type { Note } from '@/generated/prisma/client'
import { Plus, Loader2 } from 'lucide-react'

interface NotesSectionProps {
  applicationId: string
  initialNotes: Note[]
}

export function NotesSection({ applicationId, initialNotes }: NotesSectionProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function addNote() {
    if (!text.trim()) return
    setSaving(true)

    const res = await fetch(`/api/applications/${applicationId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim() }),
    })

    if (!res.ok) {
      toast.error('Errore salvataggio nota')
    } else {
      const note = await res.json()
      setNotes([note, ...notes])
      setText('')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Note</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Aggiungi una nota (es. impressioni dal colloquio, follow-up da fare...)"
            value={text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            className="min-h-20 resize-none"
          />
        </div>
        <Button
          onClick={addNote}
          disabled={!text.trim() || saving}
          size="sm"
        >
          {saving ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Plus className="size-4 mr-2" />
          )}
          Aggiungi nota
        </Button>

        {notes.length > 0 && (
          <div className="space-y-3 pt-2">
            {notes.map((note) => (
              <div key={note.id} className="text-sm p-3 rounded-md bg-muted/50 space-y-1">
                <p>{note.content}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                    locale: it,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nessuna nota. Aggiungi osservazioni, follow-up o appunti dai colloqui.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
