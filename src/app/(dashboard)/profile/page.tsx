import { requireUser } from '@/lib/auth'
import { getProfile } from '@/lib/data'
import { ResumeUpload } from '@/components/features/resume-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { FileText, User } from 'lucide-react'

export default async function ProfilePage() {
  const user = await requireUser()
  const [dbUser, resume] = await getProfile(user.id)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profilo & CV</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Il tuo CV viene usato per calcolare il match score con gli annunci.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="size-4" />
            Informazioni account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          {dbUser?.name && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nome</span>
              <span>{dbUser.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            Il tuo CV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{resume.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      Caricato il {format(new Date(resume.createdAt), 'd MMM yyyy', { locale: it })}
                    </p>
                  </div>
                </div>
              </div>

              {resume.skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Skill estratte dal CV</p>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Vuoi aggiornare il CV? Carica una nuova versione qui sotto.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nessun CV caricato. Carica il tuo CV per ottenere lo score di compatibilità
              con gli annunci.
            </p>
          )}

          <ResumeUpload />
        </CardContent>
      </Card>
    </div>
  )
}
