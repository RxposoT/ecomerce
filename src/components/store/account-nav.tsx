'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, MapPin, LayoutDashboard } from 'lucide-react'

const navItems = [
  { href: '/conta', label: 'Perfil', icon: User },
  { href: '/conta/encomendas', label: 'Encomendas', icon: Package },
  { href: '/conta/moradas', label: 'Moradas', icon: MapPin },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:w-48 shrink-0 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
