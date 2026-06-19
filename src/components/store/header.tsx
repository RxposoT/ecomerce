'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getCartItemCount } from '@/lib/cart'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<{ email?: string | null; id: string; isAdmin?: boolean } | null>(null)

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
    <header className="border-b border-border/20 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="container-full flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-brand-orange-dark flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
            S
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">Sacola</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/produtos" className="relative py-1 hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all hover:after:w-full">
            Produtos
          </Link>
          {user && (
            <Link href="/conta/encomendas" className="relative py-1 hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all hover:after:w-full">
              Encomendas
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
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
            <Button variant="ghost" size="icon" asChild>
              <Link href="/conta" aria-label="A minha conta">
                <User className="size-[18px]" />
              </Link>
            </Button>
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
