'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/stripe/client'
type Product = {
  id: string
  name: string
  slug: string
  price: number
  is_active: boolean
}

export function SearchCommand() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  async function handleSearch(query: string) {
    if (!query) {
      setProducts([])
      return
    }

    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${query}%`)
      .limit(8)

    if (data) setProducts(data)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full md:w-64 justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span>Procurar produtos...</span>
        <kbd className="ml-auto hidden md:inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Procurar produtos..."
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Produtos">
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.name}
                onSelect={() => {
                  setOpen(false)
                  router.push(`/produtos/${product.slug}`)
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{product.name}</span>
                  <span className="text-muted-foreground">{formatPrice(product.price)}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
