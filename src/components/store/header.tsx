'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Sun, Moon, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] size-[18px] rounded-full flex items-center justify-center font-medium animate-in zoom-in-150 duration-300">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <User className="size-[18px]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>A minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/conta')}>
                    <User className="size-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/conta/encomendas')}>
                    <Package className="size-4" />
                    Encomendas
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
