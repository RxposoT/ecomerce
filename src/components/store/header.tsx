'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, Sun, Moon, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getCartItemCount } from '@/lib/cart'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { SearchCommand } from './search-command'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ email: u.email, id: u.id })
    })
    getCartItemCount().then(setCartCount)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b border-border/10 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="container-full flex items-center justify-between h-16 gap-4">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-brand-orange-dark flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
            S
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight hidden sm:inline">Sacola</span>
        </Link>

        <div className="flex-1 hidden md:flex items-center justify-center">
          <SearchCommand />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Alternar tema"
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </Button>
          )}

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/carrinho" aria-label="Carrinho">
              <ShoppingCart className="size-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] size-[18px] rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu de conta"
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="size-[18px]" />
              </Button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">A minha conta</p>
                    <div className="h-px bg-border my-1" />
                    <Link
                      href="/conta"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <User className="size-4" />
                      Perfil
                    </Link>
                    <Link
                      href="/conta/encomendas"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Package className="size-4" />
                      Encomendas
                    </Link>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => { setMenuOpen(false); handleSignOut() }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg w-full text-left text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button variant="default" size="sm" asChild className="rounded-full px-5">
              <Link href="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
