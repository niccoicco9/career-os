export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
          <Briefcase className="size-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg">CareerOS</span>
      </Link>
      {children}
    </div>
  )
}
