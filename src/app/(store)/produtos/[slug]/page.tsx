import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { Star, Package, Truck, ShieldCheck } from 'lucide-react'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*), categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const p = product as any

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', p.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <div className="aspect-square bg-muted/30 rounded-2xl overflow-hidden flex items-center justify-center border border-border/50">
          {p.product_images?.[0] ? (
            <img
              src={p.product_images[0].url}
              alt={p.product_images[0].alt_text || p.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Package className="size-12 opacity-30" />
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {p.categories && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
              {p.categories.name}
            </p>
          )}
          <h1 className="text-3xl font-bold tracking-tight mb-3">{p.name}</h1>

          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length} avaliações)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold tracking-tight">{formatPrice(p.price)}</span>
            {p.compare_price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(p.compare_price)}
              </span>
            )}
            {p.compare_price && (
              <Badge variant="secondary" className="text-xs">
                -{Math.round((1 - p.price / p.compare_price) * 100)}%
              </Badge>
            )}
          </div>

          <div className="mb-6">
            {p.stock_quantity > 0 ? (
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50 rounded-full px-3">
                Em Stock — {p.stock_quantity} unidades
              </Badge>
            ) : (
              <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10 rounded-full px-3">
                Esgotado
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Truck, label: 'Envio 24h' },
              { icon: ShieldCheck, label: 'Pagamento Seguro' },
              { icon: Package, label: 'Devolução Grátis' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border/50">
                  <Icon className="size-4 text-primary mx-auto mb-1" />
                  <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
                </div>
              )
            })}
          </div>

          {p.description && (
            <>
              <p className="text-muted-foreground leading-relaxed mb-8">{p.description}</p>
            </>
          )}

          {p.product_variants && p.product_variants.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Variantes:</p>
              <div className="flex flex-wrap gap-2">
                {p.product_variants.filter((v: any) => v.is_active).map((variant: any) => (
                  <Badge key={variant.id} variant="outline" className="cursor-pointer hover:bg-muted rounded-full px-3 py-1.5">
                    {variant.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-border/50">
            <AddToCartButton productId={p.id} disabled={p.stock_quantity <= 0} />
          </div>
        </div>
      </div>

      {reviews && reviews.length > 0 && (
        <section className="mt-20">
          <Separator className="mb-10" />
          <div className="flex items-center gap-6 mb-10">
            <h2 className="text-2xl font-bold tracking-tight">Avaliações</h2>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">{avgRating.toFixed(1)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {reviews.map((review: any) => (
              <div key={review.id} className="border border-border/50 rounded-2xl p-5 hover:border-border transition-colors">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
                {review.title && (
                  <h3 className="font-medium text-sm mb-1">{review.title}</h3>
                )}
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
