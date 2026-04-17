import { Suspense } from 'react'
import { LoginForm } from './login-form'
import { Skeleton } from '@/components/ui/skeleton'

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full max-w-sm h-80" />}>
      <LoginForm />
    </Suspense>
  )
}
