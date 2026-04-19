import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MatchAnalysis } from '@/types'
import {
  SCORE_TEXT_COLORS,
  SCORE_BADGE_COLORS,
  SCORE_LABELS,
  scoreTone,
} from '@/lib/status'

interface MatchScoreCardProps {
  analysis: MatchAnalysis
}

export function MatchScoreCard({ analysis }: MatchScoreCardProps) {
  const tone = scoreTone(analysis.score)

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Analisi compatibilità</CardTitle>
          <div className="flex items-center gap-2">
            <span className={cn('text-3xl font-bold', SCORE_TEXT_COLORS[tone])}>
              {analysis.score}
            </span>
            <span className="text-muted-foreground text-sm">/100</span>
          </div>
        </div>
        <Progress value={analysis.score} className="h-2" />
        <Badge variant="secondary" className={cn('w-fit text-xs', SCORE_BADGE_COLORS[tone])}>
          {SCORE_LABELS[tone]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{analysis.explanation}</p>

        {analysis.matchingSkills.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <CheckCircle className="size-4 text-green-500" />
              Skill già presenti
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.matchingSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.missingSkills.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <XCircle className="size-4 text-red-500" />
              Skill mancanti
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.missingSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-md bg-background border border-border">
          <Lightbulb className="size-4 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-sm">{analysis.suggestion}</p>
        </div>
      </CardContent>
    </Card>
  )
}
