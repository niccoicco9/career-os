'use client'

import { useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { PDF_MAX_SIZE_BYTES } from '@/lib/constants'
import { uploadResume } from '@/app/(dashboard)/profile/actions'

export function ResumeUpload() {
  const [uploading, startUpload] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Carica un file PDF')
      return
    }

    if (file.size > PDF_MAX_SIZE_BYTES) {
      toast.error('Il file deve essere inferiore a 5MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    startUpload(async () => {
      try {
        const { aiError } = await uploadResume(formData)
        if (aiError) {
          toast.warning("CV salvato, ma l'analisi AI ha fallito: " + aiError)
        } else {
          toast.success('CV caricato e analizzato!')
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Errore durante il caricamento')
      } finally {
        if (inputRef.current) inputRef.current.value = ''
      }
    })
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
