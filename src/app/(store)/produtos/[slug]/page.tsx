import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { Star, Package, Truck, ShieldCheck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

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
    <div className="max-w-[90rem] mx-auto px-6 py-10">
      <Link href="/produtos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ChevronLeft className="size-4" />
        Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="aspect-[4/5] bg-muted/20 rounded-3xl overflow-hidden flex items-center justify-center border border-border/30">
          {p.product_images?.[0] ? (
            <img
              src={p.product_images[0].url}
              alt={p.product_images[0].alt_text || p.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Package className="size-16 opacity-20" />
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {p.categories && (
            <Link
              href={`/produtos?categoria=${p.categories.slug}`}
              className="text-xs uppercase tracking-widest text-primary font-semibold hover:opacity-80 transition-opacity mb-3"
            >
              {p.categories.name}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">{p.name}</h1>

          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({reviews.length} avaliações)</span>
            </div>
          )}

          <div className="flex items-baseline gap-4 mb-8">
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

          <div className="mb-8">
            {p.stock_quantity > 0 ? (
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50 rounded-full px-4 py-1.5 text-sm font-medium">
                Em Stock — {p.stock_quantity} unidades
              </Badge>
            ) : (
              <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10 rounded-full px-4 py-1.5 text-sm font-medium">
                Esgotado
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { icon: Truck, label: 'Envio 24h' },
              { icon: ShieldCheck, label: 'Pagamento Seguro' },
              { icon: Package, label: 'Devolução Grátis' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="text-center p-4 rounded-2xl bg-muted/15 border border-border/30">
                  <Icon className="size-5 text-primary mx-auto mb-1.5" />
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</span>
                </div>
              )
            })}
          </div>

          {p.description && (
            <div className="mb-10">
              <p className="text-muted-foreground leading-relaxed text-base">{p.description}</p>
            </div>
          )}

          {p.product_variants && p.product_variants.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-semibold mb-3">Variantes:</p>
              <div className="flex flex-wrap gap-2">
                {p.product_variants.filter((v: any) => v.is_active).map((variant: any) => (
                  <Badge key={variant.id} variant="outline" className="cursor-pointer hover:bg-muted rounded-full px-4 py-2 text-sm border-border/50">
                    {variant.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-border/30">
            <AddToCartButton productId={p.id} disabled={p.stock_quantity <= 0} />
          </div>
        </div>
      </div>

      {reviews && reviews.length > 0 && (
        <section className="mt-24">
          <Separator className="mb-12" />
          <div className="flex items-start gap-8 mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Avaliações</h2>
              <p className="text-muted-foreground mt-2">O que os nossos clientes dizem</p>
            </div>
            <div className="flex items-center gap-3 bg-muted/20 rounded-2xl px-6 py-4 border border-border/30">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                  />
                ))}
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground ml-1">/ 5</span>
                <p className="text-xs text-muted-foreground">{reviews.length} avaliações</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            {reviews.map((review: any) => (
              <div key={review.id} className="border border-border/30 rounded-2xl p-6 hover:border-border/60 hover:shadow-sm transition-all">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                    />
                  ))}
                </div>
                {review.title && (
                  <h3 className="font-semibold text-sm mb-1.5">{review.title}</h3>
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
