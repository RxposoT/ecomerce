import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/stripe/client'
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: featured } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(6)

  const { data: recent } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: categories } = await supabase
    .from('categories')
    .select('*, products(id)')
    .eq('is_active', true)
    .order('sort_order')
    .limit(6)

  const totalProducts = recent?.length || 0

  return (
    <div>
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-background to-background" />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-brand-teal/[0.03] blur-3xl" />
        <div className="container-full pt-[calc(var(--space-section)*1.5)] pb-section relative">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-6 rounded-full px-4 py-1 text-xs border-primary/20 text-primary bg-primary/[0.03] font-medium">
              <Sparkles className="size-3 mr-1.5" />
              Novo marketplace em Portugal
            </Badge>
            <h1 className="display-xl mb-6 text-balance">
              Compras
              <br />
              <span className="text-primary">simples.</span>
              <br />
              Vida simples.
            </h1>
            <p className="body-large text-muted-foreground max-w-lg mb-10">
              Descobre produtos selecionados com os melhores preços.
              Envio rápido e gratuito para todo o país.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="rounded-full px-10 h-14 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
                <Link href="/produtos">
                  Explorar Produtos
                  <ArrowRight className="size-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats inline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-section pt-section border-t border-border/5">
            {[
              { number: `${totalProducts}+`, label: 'Produtos disponíveis' },
              { number: '24h', label: 'Entrega Rápida' },
              { number: '100%', label: 'Pagamento Seguro' },
              { number: '30 dias', label: 'Devolução Grátis' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-balance">{stat.number}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FEATURED (editorial grid) ───────────── */}
      {featured && featured.length > 0 && (
        <section className="section bg-muted/10">
          <div className="container-full">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="display-sm">Em Destaque</h2>
                <p className="body-large text-muted-foreground mt-stack">Os preferidos dos nossos clientes</p>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/produtos">
                  Ver tudo <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.slice(0, 5).map((product: any, i: number) => {
                const isHero = i === 0
                return (
                  <Link
                    key={product.id}
                    href={`/produtos/${product.slug}`}
                    className={`group relative rounded-2xl border border-border/10 bg-card overflow-hidden hover:border-border/30 hover:-translate-y-0.5 transition-all duration-300 ${
                      isHero ? 'md:col-span-2 md:row-span-2' : ''
                    }`}
                  >
                    <div className={`bg-muted/10 flex items-center justify-center overflow-hidden ${
                      isHero ? 'aspect-[4/3] md:aspect-[4/3]' : 'aspect-square'
                    }`}>
                      {product.product_images?.[0] ? (
                        <img
                          src={product.product_images[0].url}
                          alt={product.product_images[0].alt_text || product.name}
                          className="object-cover w-full h-full group-hover:scale-[1.04] transition-transform duration-700"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <div className="size-14 rounded-full bg-muted/20 flex items-center justify-center">
                            <span className="text-2xl font-heading font-semibold text-muted-foreground/20">{product.name[0]}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={isHero ? 'p-5 md:p-6' : 'p-4'}>
                      <h3 className={`font-medium leading-snug line-clamp-2 ${isHero ? 'text-base md:text-lg' : 'text-sm'}`}>
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className={`font-bold font-heading ${isHero ? 'text-xl' : 'text-base'}`}>
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ───────────── CATEGORIES ───────────── */}
      {categories && categories.length > 0 && (
        <section className="section">
          <div className="container-full">
            <div className="flex items-end justify-between mb-10">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((category: any) => {
                const count = (category as any).products?.length || 0
                return (
                  <Link
                    key={category.id}
                    href={`/produtos?categoria=${category.slug}`}
                    className="group flex flex-col items-center gap-3 p-6 md:p-8 rounded-2xl border border-border/10 bg-muted/10 hover:bg-primary/[0.04] hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="size-14 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all">
                      <span className="text-xl font-heading font-bold text-primary">{category.name[0]}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                      {count > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">{count} produto{count !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ───────────── VALUES (horizontal editorial) ───────────── */}
      <section className="section border-y border-border/5 bg-muted/[0.02]">
        <div className="container-full">
          <div className="text-center mb-10">
            <h2 className="display-sm">Feito para ti</h2>
            <p className="body-large text-muted-foreground max-w-md mx-auto mt-stack">
              Trabalhamos para te oferecer a melhor experiência de compra online.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 max-w-3xl mx-auto">
            {[
              { icon: Truck, title: 'Envio em 24h', desc: 'Grátis em encomendas acima de 50€.' },
              { icon: ShieldCheck, title: 'Pagamento Seguro', desc: 'Processado via Stripe.' },
              { icon: RefreshCw, title: '30 dias para devolver', desc: 'Sem custos adicionais.' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex items-start gap-4 flex-1">
                  <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───────────── ALL PRODUCTS ───────────── */}
      {recent && recent.length > 0 && (
        <section className="section">
          <div className="container-full">
            <div className="flex items-end justify-between mb-10">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recent.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/produtos/${product.slug}`}
                  className="group rounded-2xl border border-border/10 bg-card overflow-hidden hover:border-border/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="aspect-square bg-muted/10 flex items-center justify-center overflow-hidden">
                    {product.product_images?.[0] ? (
                      <img
                        src={product.product_images[0].url}
                        alt={product.product_images[0].alt_text || product.name}
                        className="object-cover w-full h-full group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center text-muted-foreground/20">
                        <span className="text-3xl font-heading font-bold">{product.name[0]}</span>
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

      {/* ───────────── CTA ───────────── */}
      <section className="section bg-gradient-to-b from-background to-muted/20">
        <div className="container-full">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/[0.06] via-background to-background border border-primary/10 p-12 md:p-20 text-center">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/[0.03] rounded-full blur-3xl" />
            <div className="relative max-w-lg mx-auto">
              <h2 className="display-sm text-balance mb-4">
                Pronto para começar?
              </h2>
              <p className="body-large text-muted-foreground mb-8">
                Regista-te e faz a tua primeira encomenda hoje.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" asChild className="rounded-full px-10 h-14 text-base shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                  <Link href="/auth">Criar Conta Grátis</Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="rounded-full px-10 h-14 text-base border-border/20">
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
