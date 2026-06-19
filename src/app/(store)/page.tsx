import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/stripe/client'
import { ProductCarousel } from '@/components/store/product-carousel'
import { ArrowRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(10)

  const { data: allProducts } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
    .limit(6)

  const totalProducts = allProducts?.length || 0

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-background to-background" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/[0.03] to-transparent" />
        <div className="container-full pt-section pb-[calc(var(--space-section)*1.5)] relative">
          <div className="max-w-2xl">
            <h1 className="display-xl mb-6 text-balance">
              Compras
              <br />
              <span className="text-primary">simples.</span>
              <br />
              Vida simples.
            </h1>
            <p className="body-large text-muted-foreground max-w-lg mb-10">
              Descobre produtos selecionados com os melhores preços. Envio rápido e gratuito para todo o país.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild className="rounded-full px-10 h-14 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
                <Link href="/produtos">
                  Explorar Produtos
                  <ArrowRight className="size-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/10 bg-muted/5">
        <div className="container-full py-stack">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: `${totalProducts}+`, label: 'Produtos' },
              { number: '24h', label: 'Entrega Rápida' },
              { number: '100%', label: 'Pagamento Seguro' },
              { number: '30 dias', label: 'Devolução Grátis' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="display-sm text-balance">{stat.number}</p>
                <p className="body-small text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <ProductCarousel
        products={featuredProducts || []}
        title="Produtos em Destaque"
        subtitle="Os preferidos dos nossos clientes"
      />

      {/* Categories Grid */}
      {categories && categories.length > 0 && (
        <section className="section bg-muted/20">
          <div className="container-full">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="display-sm">Categorias</h2>
                <p className="body-large text-muted-foreground mt-stack">Explora os nossos departamentos</p>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/produtos">
                  Todas as categorias <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category: any, i: number) => {
                const productCount = allProducts?.filter((p: any) => p.category_id === category.id).length || 0
                const gradientColors = [
                  'from-amber-500/20 to-orange-500/10',
                  'from-blue-500/20 to-indigo-500/10',
                  'from-emerald-500/20 to-teal-500/10',
                  'from-violet-500/20 to-purple-500/10',
                  'from-rose-500/20 to-pink-500/10',
                  'from-cyan-500/20 to-sky-500/10',
                ]
                return (
                  <Link
                    key={category.id}
                    href={`/produtos?categoria=${category.slug}`}
                    className="group relative flex flex-col items-center gap-3 p-8 rounded-2xl border border-border/20 bg-card hover:border-border/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[i % gradientColors.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative">
                      <div className="size-14 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all">
                        <span className="text-2xl font-heading font-bold text-primary">{category.name[0]}</span>
                      </div>
                    </div>
                    <div className="relative text-center">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{productCount} produtos</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Products Grid */}
      {allProducts && allProducts.length > 0 && (
        <section className="section">
          <div className="container-full">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="display-sm">Novidades</h2>
                <p className="body-large text-muted-foreground mt-stack">Os produtos mais recentes</p>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/produtos">
                  Ver tudo <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allProducts.slice(0, 10).map((product: any) => (
                <Link
                  key={product.id}
                  href={`/produtos/${product.slug}`}
                  className="group rounded-2xl border border-border/20 bg-card overflow-hidden hover:border-border/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="aspect-square bg-muted/20 flex items-center justify-center overflow-hidden">
                    {product.product_images?.[0] ? (
                      <img
                        src={product.product_images[0].url}
                        alt={product.product_images[0].alt_text || product.name}
                        className="object-cover w-full h-full group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center">
                          <span className="text-xl font-heading font-semibold text-muted-foreground/30">{product.name[0]}</span>
                        </div>
                        <span className="text-xs">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="text-sm font-medium leading-snug line-clamp-2">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-lg font-bold font-heading">{formatPrice(product.price)}</span>
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

      {/* Trust Section */}
      <section className="section bg-gradient-to-b from-background to-muted/20">
        <div className="container-full">
          <div className="text-center mb-12">
            <h2 className="display-sm">Porquê a Sacola?</h2>
            <p className="body-large text-muted-foreground max-w-md mx-auto mt-stack">
              Trabalhamos para te oferecer a melhor experiência de compra online.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Envio Rápido', desc: 'Entrega em 24h para todo o país. Grátis em encomendas acima de 50€.' },
              { icon: ShieldCheck, title: 'Pagamento Seguro', desc: 'Todos os pagamentos são processados de forma segura através da Stripe.' },
              { icon: RefreshCw, title: 'Devolução Grátis', desc: 'Não gostaste? Devolve em até 30 dias sem custos adicionais.' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="group p-8 md:p-10 rounded-2xl border border-border/20 bg-card hover:border-border/40 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary/10 group-hover:scale-105 transition-all">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground body-small">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-full">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/[0.08] via-background to-background border border-primary/10 p-12 md:p-20 text-center">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/[0.03] rounded-full blur-3xl" />
            <div className="relative max-w-xl mx-auto">
              <h2 className="display-sm text-balance mb-4">
                Pronto para começar?
              </h2>
              <p className="body-large text-muted-foreground mb-8">
                Regista-te e faz a tua primeira encomenda hoje.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" asChild className="rounded-full px-10 h-14 text-base shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                  <Link href="/auth">Criar Conta Grátis</Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="rounded-full px-10 h-14 text-base border-border/30">
                  <Link href="/produtos">Ver Produtos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
