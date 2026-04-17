'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applications', label: 'Candidature', icon: Briefcase },
  { href: '/profile', label: 'Profilo & CV', icon: FileText },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 space-y-1">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
            {active && <ChevronRight className="size-3 ml-auto opacity-60" />}
          </Link>
        )
      })}
    </nav>
  )
}

function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="pt-4 border-t border-border">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        onClick={handleSignOut}
      >
        <LogOut className="size-4" />
        Esci
      </Button>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-border bg-card px-3 py-4">
      <div className="flex items-center gap-2 px-3 py-2 mb-6">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
          <Briefcase className="size-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg tracking-tight">CareerOS</span>
      </div>
      <NavLinks />
      <SignOutButton />
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
      >
        <svg
          className="size-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>

      <Sheet open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col h-full px-3 py-4">
          <div className="flex items-center justify-between px-3 py-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase className="size-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight">CareerOS</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Chiudi menu"
            >
              <X className="size-4" />
            </Button>
          </div>

          <NavLinks onNavigate={() => setOpen(false)} />
          <SignOutButton />
        </div>
      </Sheet>
    </>
  )
}
