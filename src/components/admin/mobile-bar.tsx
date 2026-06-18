'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, Tags, ArrowLeft, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/encomendas', label: 'Encomendas', icon: ShoppingBag },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
]

export function AdminMobileBar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
            S
          </div>
          <span className="text-xs font-semibold">Admin</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={handleSignOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex overflow-x-auto px-3 pb-2 gap-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="size-3.5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
