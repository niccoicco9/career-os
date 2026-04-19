import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, TrendingUp, Trophy, Star } from 'lucide-react'

interface KpiCardsProps {
  kpi: {
    total: number
    interviews: number
    offers: number
    avgScore: number
    responseRate: number
  }
}

export function KpiCards({ kpi }: KpiCardsProps) {
  const cards = [
    {
      title: 'Candidature totali',
      value: kpi.total,
      icon: Briefcase,
      description: 'in pipeline',
    },
    {
      title: 'Tasso di risposta',
      value: `${kpi.responseRate}%`,
      icon: TrendingUp,
      description: `${kpi.interviews} colloqui ottenuti`,
    },
    {
      title: 'Offerte ricevute',
      value: kpi.offers,
      icon: Trophy,
      description: kpi.offers === 1 ? 'offerta attiva' : 'offerte attive',
    },
    {
      title: 'Score medio',
      value: kpi.avgScore > 0 ? `${kpi.avgScore}/100` : '—',
      icon: Star,
      description: 'compatibilità media CV',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ title, value, icon: Icon, description }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
