import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/stripe/client'
import { ArrowRight, Sparkles, Truck, ShieldCheck, RefreshCw } from 'lucide-react'

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm text-sm text-muted-foreground mb-8">
            <Sparkles className="size-3.5 text-primary" />
            <span>O teu novo mercado online</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Compras simples,
            <br />
            <span className="text-primary">vida simples.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            Descobre os melhores produtos com os melhores preços. Envio rápido para todo o país.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild className="rounded-full px-8 h-12 text-base">
              <Link href="/produtos">
                Ver Produtos
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full px-8 h-12 text-base">
              <Link href="/produtos">Categorias</Link>
            </Button>
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Categorias</h2>
                <p className="text-sm text-muted-foreground mt-1">Explora os nossos departamentos</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/produtos">
                  Ver todas <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/produtos?categoria=${category.slug}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/50 hover:border-primary/20 hover:bg-primary/[0.02] transition-all"
                >
                  <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="text-lg font-semibold text-primary">{category.name[0]}</span>
                  </div>
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
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Produtos em Destaque</h2>
                <p className="text-sm text-muted-foreground mt-1">Os preferidos dos nossos clientes</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/produtos">
                  Ver todos <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts?.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/produtos/${product.slug}`}
                  className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-border transition-all"
                >
                  <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
                    {product.product_images?.[0] ? (
                      <img
                        src={product.product_images[0].url}
                        alt={product.product_images[0].alt_text || product.name}
                        className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center">
                          <span className="text-lg font-semibold text-muted-foreground/50">{product.name[0]}</span>
                        </div>
                        <span className="text-xs">Sem imagem</span>
                      </div>
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

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Envio Rápido', desc: 'Entrega em 24h para todo o país' },
              { icon: ShieldCheck, title: 'Pagamento Seguro', desc: 'Pagamentos protegidos com Stripe' },
              { icon: RefreshCw, title: 'Devolução Grátis', desc: 'Devolução em 30 dias sem custos' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="text-center p-8 rounded-2xl border border-border/50 hover:bg-muted/10 transition-colors">
                  <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
