'use client'

import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Sheet({ open, onClose, children, className }: SheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-lg',
          'transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  )
}
