import type { Application, JobPosting, Note, Resume } from '@/generated/prisma/client'
export type { ApplicationStatus } from '@/generated/prisma/enums'
export type { MatchAnalysis } from '@/lib/validators'

export type ApplicationWithRelations = Application & {
  jobPosting: JobPosting
  resume: Resume | null
  notes: Note[]
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
