'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

const navItems: Record<UserRole, { href: string; label: string; icon: string }[]> = {
  recipient: [
    { href: '/recipient/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/recipient/request', label: 'New Request', icon: '🛒' },
    { href: '/recipient/history', label: 'History', icon: '📋' },
  ],
  donor: [
    { href: '/donor/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/donor/donate', label: 'Donate', icon: '💚' },
    { href: '/donor/sponsor', label: 'Sponsor a Family', icon: '👨‍👩‍👧' },
  ],
  foodbank: [
    { href: '/foodbank/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/foodbank/requests', label: 'Requests', icon: '📦' },
    { href: '/foodbank/inventory', label: 'Inventory', icon: '🗃️' },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/organizations', label: 'Organizations', icon: '🏢' },
  ],
}

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const items = navItems[role]

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col py-6 px-3">
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
