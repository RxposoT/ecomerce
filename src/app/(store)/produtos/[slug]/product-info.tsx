'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/stripe/client'
import { addToCart } from '@/lib/cart'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Variant {
  id: string
  name: string
  price_modifier: number | null
  is_active: boolean
}

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
}

interface ProductInfoProps {
  product: {
    id: string
    name: string
    description: string | null
    price: number
    compare_price: number | null
    stock_quantity: number
    categories: { slug: string; name: string } | null
    product_variants: Variant[]
  }
  reviews: Review[]
  avgRating: number
}

export function ProductInfo({ product, reviews, avgRating }: ProductInfoProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  const p = product
  const inStock = p.stock_quantity > 0
  const activeVariants = p.product_variants?.filter((v: Variant) => v.is_active) || []

  async function handleAddToCart() {
    setLoading(true)
    try {
      await addToCart(p.id, quantity, selectedVariant)
      toast.success('Adicionado ao carrinho!')
      router.refresh()
    } catch {
      toast.error('Erro ao adicionar ao carrinho')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Category + Name */}
      <div>
        {p.categories && (
          <a
            href={`/produtos?categoria=${p.categories.slug}`}
            className="label-small text-primary font-semibold hover:opacity-80 transition-opacity mb-3 inline-block"
          >
            {p.categories.name}
          </a>
        )}
        <h1 className="display-md mb-4">{p.name}</h1>
      </div>

      {/* Rating */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2.5">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={cn('size-4', i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-border')}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-muted-foreground font-medium">{avgRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({reviews.length} avaliações)</span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-bold tracking-tight">{formatPrice(p.price)}</span>
        {p.compare_price && (
          <>
            <span className="text-xl text-muted-foreground line-through">
              {formatPrice(p.compare_price)}
            </span>
            <Badge variant="secondary" className="text-xs rounded-full px-3">
              -{Math.round((1 - p.price / p.compare_price) * 100)}%
            </Badge>
          </>
        )}
      </div>

      {/* Stock */}
      <div>
        {inStock ? (
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/30 rounded-full px-4 py-1.5 text-sm font-medium">
            Em Stock — {p.stock_quantity} unidades
          </Badge>
        ) : (
          <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10 rounded-full px-4 py-1.5 text-sm font-medium">
            Esgotado
          </Badge>
        )}
      </div>

      {/* Variants */}
      {activeVariants.length > 0 && (
        <div>
          <p className="label-small text-muted-foreground mb-3">
            {activeVariants.length === 1 ? 'Variante' : 'Variantes'}
          </p>
          <div className="flex flex-wrap gap-2">
            {activeVariants.map((v) => {
              const selected = selectedVariant === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(selected ? undefined : v.id)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                  )}
                >
                  {v.name}
                  {v.price_modifier && v.price_modifier !== 0 ? (
                    <span className="ml-1 text-xs opacity-70">
                      ({v.price_modifier > 0 ? '+' : ''}{formatPrice(v.price_modifier)})
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-border/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="size-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-30"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>
          <span className="w-12 text-center text-sm font-medium tabular-nums">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(99, quantity + 1))}
            disabled={quantity >= 99}
            className="size-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-30"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
            </svg>
          </button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!inStock || loading}
          size="lg"
          className="flex-1 h-11 rounded-xl"
        >
          {loading ? (
            <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          )}
          {inStock ? 'Adicionar ao Carrinho' : 'Esgotado'}
        </Button>
      </div>

      {/* Description */}
      {p.description && (
        <div className="border-t border-border/30 pt-8">
          <h3 className="label-small text-muted-foreground mb-3">Descrição</h3>
          <p className="text-muted-foreground leading-relaxed">{p.description}</p>
        </div>
      )}

      {/* Shipping info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: 'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12', label: 'Envio 24h' },
          { icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z', label: 'Pagamento Seguro' },
          { icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-6.75-1.5H18m-9.75 0H3.375a1.125 1.125 0 0 1-1.125-1.125V5.625c0-.621.504-1.125 1.125-1.125h15.75c.621 0 1.125.504 1.125 1.125v4.5m-7.5 0h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75h-3.75a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75Zm0 0V6m-7.5 3h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75Z', label: 'Devolução Grátis' },
        ].map((item) => (
          <div key={item.label} className="text-center p-4 rounded-2xl bg-muted/15 border border-border/30">
            <svg className="size-5 text-primary mx-auto mb-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
