'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, Tags, LogOut, ArrowLeft } from 'lucide-react'
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

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-56 border-r border-border/50 bg-background hidden lg:flex flex-col">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="size-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            S
          </div>
          <div>
            <span className="font-semibold text-sm">Sacola</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Admin</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" />
          Voltar à loja
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
      </nav>

      <div className="p-3 border-t border-border/50">
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
          <LogOut className="size-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
