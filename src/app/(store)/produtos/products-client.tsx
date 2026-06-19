'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sortOptions = [
  { value: 'newest', label: 'Novidades' },
  { value: 'price-asc', label: 'Preço: Menor para Maior' },
  { value: 'price-desc', label: 'Preço: Maior para Menor' },
  { value: 'name', label: 'Nome A-Z' },
]

export function ProductsSort({
  currentSort,
  categorySlug,
}: {
  currentSort: string
  categorySlug: string | null
}) {
  const router = useRouter()

  function handleSort(value: string) {
    const base = categorySlug ? `/produtos?categoria=${categorySlug}` : '/produtos'
    const separator = categorySlug ? '&' : '?'
    router.push(`${base}${separator}sort=${value}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground hidden sm:block">Ordenar:</label>
      <select
        value={currentSort}
        onChange={(e) => handleSort(e.target.value)}
        className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 appearance-none cursor-pointer"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function ProductsFilter({
  categories,
  currentCategory,
  allCount,
}: {
  categories: { id: string; slug: string; name: string }[]
  currentCategory: string | null
  allCount: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden rounded-full"
        onClick={() => setOpen(true)}
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
        </svg>
        Filtrar
      </Button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className={cn(
            'absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-background border-r border-border shadow-xl p-6',
            'animate-in slide-in-from-left'
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold">Categorias</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-0.5">
              <Link
                href="/produtos"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center justify-between text-sm py-2.5 px-4 rounded-xl transition-all',
                  !currentCategory
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                )}
              >
                <span>Todos</span>
                <span className="text-xs tabular-nums opacity-60">{allCount}</span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/produtos?categoria=${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between text-sm py-2.5 px-4 rounded-xl transition-all',
                    currentCategory === cat.slug
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  )}
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
