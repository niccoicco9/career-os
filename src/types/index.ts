import type { Application, JobPosting, Note, Resume } from '@/generated/prisma/client'
export type { ApplicationStatus } from '@/generated/prisma/enums'

export type ApplicationWithRelations = Application & {
  jobPosting: JobPosting
  resume: Resume | null
  notes: Note[]
}

export type MatchAnalysis = {
  score: number
  matchingSkills: string[]
  missingSkills: string[]
  explanation: string
  suggestion: string
}

export type ResumeAnalysis = {
  skills: string[]
  experience: string[]
  education: string[]
  summary: string
}

export type JobAnalysis = {
  title: string
  company: string
  skills: string[]
  seniority: string
  location: string
  summary: string
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: 'Salvata',
  APPLIED: 'Candidata',
  SCREENING: 'Screening',
  INTERVIEW: 'Colloquio',
  OFFER: 'Offerta',
  REJECTED: 'Rifiutata',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SAVED: 'bg-slate-100 text-slate-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  SCREENING: 'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  OFFER: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}
