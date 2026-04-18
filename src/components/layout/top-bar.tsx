import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MobileSidebar } from '@/components/layout/sidebar'
import { ThemeToggle } from '@/components/layout/theme-toggle'

interface TopBarProps {
  userEmail?: string
  userName?: string
}

export function TopBar({ userEmail, userName }: TopBarProps) {
  const initials = userName
    ? userName.slice(0, 2).toUpperCase()
    : userEmail?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50">
      <MobileSidebar />

      <div className="flex items-center gap-3 ml-auto">
        <ThemeToggle />
        <span className="text-sm text-muted-foreground hidden sm:block">
          {userName ?? userEmail}
        </span>
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
