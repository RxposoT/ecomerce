import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/stripe/client'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(8)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
    .limit(6)

  return (
    <div>
      <section className="bg-gradient-to-b from-primary/5 to-background py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Bem-vindo à Sacola
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Descubra os melhores produtos com os melhores preços. Envio rápido para todo o país.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/produtos">
                Ver Produtos
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/produtos">
                Categorias
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/produtos?categoria=${category.slug}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Produtos em Destaque</h2>
              <Button variant="ghost" asChild>
                <Link href="/produtos">
                  Ver Todos <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/produtos/${product.slug}`}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {product.product_images?.[0] ? (
                      <img
                        src={product.product_images[0].url}
                        alt={product.product_images[0].alt_text || product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">Sem imagem</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                      {product.compare_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.compare_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Envio Rápido', desc: 'Entrega em 24h para todo o país' },
              { title: 'Pagamento Seguro', desc: 'Pagamentos protegidos com Stripe' },
              { title: 'Devolução Grátis', desc: 'Devolução em 30 dias sem custos' },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-xl border border-border">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
