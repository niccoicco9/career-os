'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/status'

const ALL = '__all__'
const SEARCH_DEBOUNCE_MS = 250

export function ApplicationsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const status = searchParams.get('status') ?? ''
  const urlQ = searchParams.get('q') ?? ''
  const [q, setQ] = useState(urlQ)
  const [lastUrlQ, setLastUrlQ] = useState(urlQ)

  if (urlQ !== lastUrlQ) {
    setLastUrlQ(urlQ)
    setQ(urlQ)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function commit(key: 'status' | 'q', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  function onSearchChange(value: string) {
    setQ(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => commit('q', value), SEARCH_DEBOUNCE_MS)
  }

  function reset() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setQ('')
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }

  const hasFilters = status || q

  return (
    <div className="flex flex-col sm:flex-row gap-2" aria-busy={pending}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cerca per ruolo o azienda…"
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={status || ALL}
        onValueChange={(v) => commit('status', !v || v === ALL ? '' : v)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Tutti gli stati" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tutti gli stati</SelectItem>
          {STATUS_ORDER.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button type="button" variant="ghost" size="icon" onClick={reset} aria-label="Reset filtri">
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
