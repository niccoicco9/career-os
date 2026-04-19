'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Sparkles } from 'lucide-react'
import { MatchScoreCard } from '../../_components/match-score-card'
import type { MatchAnalysis } from '@/types'
import {
  analyzeJobMatch,
  createApplication,
} from '@/app/(dashboard)/applications/actions'

const schema = z.object({
  title: z.string().min(2, 'Inserisci il titolo del ruolo'),
  company: z.string().min(1, "Inserisci l'azienda"),
  description: z.string().min(50, "Incolla la descrizione dell'annuncio (min. 50 caratteri)"),
  url: z.string().url('URL non valido').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export function NewApplicationForm() {
  const router = useRouter()
  const [analyzing, startAnalyzing] = useTransition()
  const [saving, startSaving] = useTransition()
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  function analyzeMatch() {
    const { description } = getValues()
    if (!description || description.length < 50) {
      toast.error("Incolla prima la descrizione dell'annuncio")
      return
    }

    startAnalyzing(async () => {
      try {
        const data = await analyzeJobMatch(description)
        setMatchAnalysis(data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore durante l'analisi")
      }
    })
  }

  function onSubmit(data: FormData) {
    startSaving(async () => {
      try {
        const { id } = await createApplication({ ...data, matchAnalysis })
        router.push(`/applications/${id}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Errore durante il salvataggio')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dettagli annuncio</CardTitle>
          <CardDescription>Inserisci le informazioni del ruolo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Ruolo *</Label>
              <Input id="title" placeholder="Senior Frontend Developer" {...register('title')} />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Azienda *</Label>
              <Input id="company" placeholder="Acme Corp" {...register('company')} />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url">URL annuncio (opzionale)</Label>
            <Input id="url" type="url" placeholder="https://..." {...register('url')} />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrizione annuncio *</Label>
            <Textarea
              id="description"
              placeholder="Incolla qui la job description completa..."
              className="min-h-40 resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {matchAnalysis && <MatchScoreCard analysis={matchAnalysis} />}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={analyzeMatch}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Analisi in corso…
            </>
          ) : (
            <>
              <Sparkles className="size-4 mr-2" />
              {matchAnalysis ? 'Ri-analizza' : 'Analizza compatibilità'}
            </>
          )}
        </Button>

        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Salvataggio…
            </>
          ) : (
            'Salva candidatura'
          )}
        </Button>
      </div>
    </form>
  )
}
