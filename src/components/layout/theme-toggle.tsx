'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ORDER = ['light', 'dark', 'system'] as const
const LABELS: Record<(typeof ORDER)[number], string> = {
  light: 'Tema chiaro',
  dark: 'Tema scuro',
  system: 'Tema di sistema',
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" aria-hidden className="opacity-0" />
  }

  const current = (theme ?? 'system') as (typeof ORDER)[number]
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]
  const Icon = current === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`${LABELS[current]} — clicca per ${LABELS[next].toLowerCase()}`}
      title={LABELS[current]}
    >
      <Icon className="size-4" />
    </Button>
  )
}
