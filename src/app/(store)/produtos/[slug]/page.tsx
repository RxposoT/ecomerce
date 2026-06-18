import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { Star } from 'lucide-react'

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
          {p.product_images?.[0] ? (
            <img
              src={p.product_images[0].url}
              alt={p.product_images[0].alt_text || p.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-muted-foreground">Sem imagem</span>
          )}
        </div>

        <div>
          {p.categories && (
            <p className="text-sm text-muted-foreground mb-2">{p.categories.name}</p>
          )}
          <h1 className="text-3xl font-bold mb-2">{p.name}</h1>

          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviews.length})</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold">{formatPrice(p.price)}</span>
            {p.compare_price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(p.compare_price)}
              </span>
            )}
          </div>

          <div className="mb-6">
            {p.stock_quantity > 0 ? (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                Em Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">
                Esgotado
              </Badge>
            )}
          </div>

          {p.description && (
            <>
              <p className="text-muted-foreground mb-6 leading-relaxed">{p.description}</p>
              <Separator className="mb-6" />
            </>
          )}

          {p.product_variants && p.product_variants.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Variantes:</p>
              <div className="flex flex-wrap gap-2">
                {p.product_variants.filter((v: any) => v.is_active).map((variant: any) => (
                  <Badge key={variant.id} variant="outline" className="cursor-pointer hover:bg-muted">
                    {variant.name}
                    {variant.price_adjustment > 0 && ` (+${formatPrice(variant.price_adjustment)})`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <AddToCartButton productId={p.id} disabled={p.stock_quantity <= 0} />
        </div>
      </div>

      {reviews && reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Avaliações</h2>
          <div className="space-y-4 max-w-2xl">
            {reviews.map((review: any) => (
              <div key={review.id} className="border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
                {review.title && (
                  <h3 className="font-medium text-sm mb-1">{review.title}</h3>
                )}
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
