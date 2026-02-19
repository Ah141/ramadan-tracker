'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSession } from '@/lib/session'

export default function Navbar() {
  const pathname = usePathname()
  const [name, setName] = useState('')

  useEffect(() => {
    const s = getSession()
    if (s) setName(s.name)
  }, [])

  const links = [
    { href: '/dashboard',   icon: '☑️', label: 'عاداتي' },
    { href: '/leaderboard', icon: '🏆', label: 'الترتيب' },
    { href: '/profile',     icon: '👤', label: 'حسابي' },
  ]

  return (
    <nav style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
      <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
        🌙 {name}
      </span>
      <div className="flex gap-1">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: pathname === l.href ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: pathname === l.href ? 'var(--gold)' : 'var(--muted)',
              fontWeight: pathname === l.href ? '700' : '400',
            }}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
