import type { ApplicationStatus } from '@/generated/prisma/enums'

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
