'use client'

import { Menu } from 'lucide-react'
import { useMobileNav } from '@/context/MobileNavContext'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

/** Opens the slide-out nav on small screens. Hidden from lg up (sidebar is always visible). */
export default function MobileMenuButton({ className }: Props) {
  const { openMobileNav } = useMobileNav()

  return (
    <button
      type="button"
      onClick={openMobileNav}
      className={cn(
        'inline-flex shrink-0 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden',
        className
      )}
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  )
}
