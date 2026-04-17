import { NewApplicationForm } from '@/components/features/new-application-form'

export default function NewApplicationPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuova candidatura</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Aggiungi un annuncio di lavoro e analizza la compatibilità con il tuo CV.
        </p>
      </div>
      <NewApplicationForm />
    </div>
  )
}
