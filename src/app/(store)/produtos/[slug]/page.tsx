import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from './product-gallery'
import { ProductInfo } from './product-info'

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

  // Related products
  const { data: related } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*)')
    .eq('is_active', true)
    .eq('category_id', p.category_id)
    .neq('id', p.id)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div className="container-full section">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
        <a href="/" className="hover:text-foreground transition-colors">Início</a>
        <span className="opacity-40">/</span>
        <a href="/produtos" className="hover:text-foreground transition-colors">Produtos</a>
        {p.categories && (
          <>
            <span className="opacity-40">/</span>
            <a href={`/produtos?categoria=${p.categories.slug}`} className="hover:text-foreground transition-colors">
              {p.categories.name}
            </a>
          </>
        )}
        <span className="opacity-40">/</span>
        <span className="text-foreground font-medium truncate">{p.name}</span>
      </nav>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={p.product_images || []} productName={p.name} />

        {/* Info */}
        <ProductInfo
          product={p}
          reviews={reviews || []}
          avgRating={avgRating}
        />
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="mt-24">
          <div className="border-t border-border/30 pt-12">
            <div className="flex items-start gap-8 mb-12">
              <div>
                <h2 className="display-sm">Avaliações</h2>
                <p className="text-muted-foreground mt-2">O que os nossos clientes dizem</p>
              </div>
              <div className="flex items-center gap-3 bg-muted/20 rounded-2xl px-6 py-4 border border-border/30">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`size-5 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
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
                      <svg
                        key={i}
                        className={`size-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
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
          </div>
        </section>
      )}

      {/* Related Products */}
      {related && related.length > 0 && (
        <section className="mt-24">
          <div className="border-t border-border/30 pt-12">
            <h2 className="display-sm mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {related.map((r: any) => (
                <a
                  key={r.id}
                  href={`/produtos/${r.slug}`}
                  className="group rounded-2xl border border-border/30 bg-card overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-border/60 transition-all duration-300"
                >
                  <div className="aspect-[4/5] bg-muted/20 flex items-center justify-center overflow-hidden">
                    {r.product_images?.[0] ? (
                      <img
                        src={r.product_images[0].url}
                        alt={r.product_images[0].alt_text || r.name}
                        className="object-cover w-full h-full group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <span className="text-xl font-semibold text-muted-foreground/30">{r.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium line-clamp-1">{r.name}</h3>
                    <span className="text-base font-bold mt-1 block">{formatPrice(r.price)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
