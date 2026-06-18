'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, MapPin, ArrowLeft, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/conta', label: 'Perfil', icon: User },
  { href: '/conta/encomendas', label: 'Encomendas', icon: Package },
  { href: '/conta/moradas', label: 'Moradas', icon: MapPin },
]

export function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="lg:w-48 shrink-0 space-y-1">
      <Link
        href="/"
        className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="size-3.5" />
        Voltar à loja
      </Link>

      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all w-full"
      >
        <LogOut className="size-4" />
        Sair
      </button>
    </div>
  )
}
