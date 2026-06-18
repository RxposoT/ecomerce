'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, Package, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getCartItemCount } from '@/lib/cart'
import { useEffect, useState } from 'react'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)

  useEffect(() => {
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
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Sacola
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/produtos" className="hover:text-primary/80 transition-colors">
            Produtos
          </Link>
          <Link href="/conta/encomendas" className="hover:text-primary/80 transition-colors">
            Encomendas
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/carrinho" aria-label="Carrinho">
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs size-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/conta" aria-label="A minha conta">
                  <User className="size-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sair">
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/auth" aria-label="Entrar">
                <User className="size-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
