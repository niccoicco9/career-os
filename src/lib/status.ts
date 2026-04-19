import type { ApplicationStatus } from '@/generated/prisma/enums'

export const STATUS_ORDER: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: 'Salvata',
  APPLIED: 'Candidata',
  SCREENING: 'Screening',
  INTERVIEW: 'Colloquio',
  OFFER: 'Offerta',
  REJECTED: 'Rifiutata',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SAVED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  APPLIED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  SCREENING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300',
  INTERVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  OFFER: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
}

export const STATUS_BAR_COLORS: Record<ApplicationStatus, string> = {
  SAVED: 'bg-slate-400 dark:bg-slate-600',
  APPLIED: 'bg-blue-500 dark:bg-blue-500',
  SCREENING: 'bg-yellow-500 dark:bg-yellow-500',
  INTERVIEW: 'bg-purple-500 dark:bg-purple-500',
  OFFER: 'bg-green-500 dark:bg-green-500',
  REJECTED: 'bg-red-500 dark:bg-red-500',
}

export type ScoreTone = 'high' | 'medium' | 'low'

export function scoreTone(score: number): ScoreTone {
  if (score >= 70) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

export const SCORE_TEXT_COLORS: Record<ScoreTone, string> = {
  high: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-red-600 dark:text-red-400',
}

export const SCORE_BADGE_COLORS: Record<ScoreTone, string> = {
  high: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300',
  low: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
}

export const SCORE_LABELS: Record<ScoreTone, string> = {
  high: 'Ottimo match',
  medium: 'Match discreto',
  low: 'Match basso',
}
