'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'

interface ResumeUploadProps {
  userId: string
}

export function ResumeUpload({ userId }: ResumeUploadProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Carica un file PDF')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Il file deve essere inferiore a 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Errore upload')
      }

      if (data.aiError) {
        toast.warning('CV salvato, ma l\'analisi AI ha fallito: ' + data.aiError)
      } else {
        toast.success('CV caricato e analizzato!')
      }

      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore durante il caricamento')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Caricamento e analisi…
          </>
        ) : (
          <>
            <Upload className="size-4 mr-2" />
            Carica CV (PDF)
          </>
        )}
      </Button>
    </div>
  )
}
