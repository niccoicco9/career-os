import Link from 'next/link'
import { ArrowRight, BarChart3, Brain, CheckCircle, Briefcase } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Briefcase,
    title: 'Pipeline candidature',
    description:
      'Traccia ogni candidatura da "Salvata" a "Offerta" con stati chiari e note integrate.',
  },
  {
    icon: Brain,
    title: 'Score di compatibilità AI',
    description:
      "Carica il CV, incolla l'annuncio: ottieni uno score 0-100 e le 3-5 skill mancanti in 10 secondi.",
  },
  {
    icon: BarChart3,
    title: 'Analytics personali',
    description:
      'Tasso di risposta, tasso di colloquio, pipeline funnel. Dati reali per migliorare la strategia.',
  },
]

const steps = [
  'Entra o usa il demo account',
  'Carica il tuo CV in PDF',
  "Incolla un annuncio di lavoro",
  'Vedi lo score di match e i gap',
  'Salva in pipeline e traccia i progressi',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center">
              <Briefcase className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">CareerOS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Accedi
            </Link>
            <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
              Inizia gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <Badge variant="secondary" className="mb-6">
          MVP — in sviluppo attivo
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          La tua dashboard intelligente
          <br />
          per la ricerca lavoro
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Gestisci candidature, analizza la compatibilità con gli annunci e
          scopri esattamente cosa manca nel tuo CV — tutto in un posto.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
            Inizia adesso <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link href="/login?demo=true" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Prova la demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-2xl font-bold text-center mb-12">
          Tutto quello che ti serve, niente di più
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="space-y-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-2xl font-bold text-center mb-12">
          Dal CV all&apos;offerta in meno di 2 minuti
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex sm:flex-col items-center gap-3 flex-1">
              <div className="size-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-muted-foreground text-center sm:text-center">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-border text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto a iniziare?</h2>
        <p className="text-muted-foreground mb-8">
          Account gratuito. Nessuna carta di credito.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
            Crea account <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link href="/login?demo=true" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Entra con demo
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          {['Gratis per sempre', 'Nessuna card richiesta', 'Demo pronta'].map(
            (item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="size-4 text-green-500" />
                {item}
              </div>
            )
          )}
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        CareerOS — Costruito con Next.js, Supabase e Groq (Llama 3.1)
      </footer>
    </div>
  )
}
