import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Button } from '@/components/ui/button'
import { ArrowRight, Filter, Grid3X3, List } from 'lucide-react'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createServerSupabaseClient()
  const params = await searchParams
  const categorySlug = typeof params.categoria === 'string' ? params.categoria : null

  let categoryId: string | null = null

  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (category) categoryId = (category as any).id
  }

  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const filteredProducts = categoryId
    ? (products as any[])?.filter((p: any) => p.category_id === categoryId)
    : (products as any[])

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const selectedCategoryName = categorySlug
    ? categories?.find((c: any) => c.slug === categorySlug)?.name
    : null

  return (
    <div className="max-w-[90rem] mx-auto px-6 py-12 md:py-16">
      {/* Header */}
      <div className="mb-12">
        {selectedCategoryName ? (
          <div>
            <Link href="/produtos" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 inline-block">
              ← Todos os produtos
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">{selectedCategoryName}</h1>
            <p className="text-muted-foreground mt-2">{filteredProducts?.length ?? 0} produtos</p>
          </div>
        ) : (
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground mt-2 text-lg">{filteredProducts?.length ?? 0} produtos disponíveis</p>
          </div>
        )}
      </div>

      <div className="flex gap-10">
        {/* Sidebar Filters */}
        {categories && categories.length > 0 && (
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Categorias</h3>
              <nav className="space-y-0.5">
                <Link
                  href="/produtos"
                  className={`flex items-center justify-between text-sm py-2.5 px-4 rounded-xl transition-all ${
                    !categorySlug
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <span>Todos os produtos</span>
                  <span className="text-xs tabular-nums opacity-60">{products?.length ?? 0}</span>
                </Link>
                {categories.map((cat: any) => {
                  const count = (products as any[])?.filter((p: any) => p.category_id === cat.id).length || 0
                  return (
                    <Link
                      key={cat.id}
                      href={`/produtos?categoria=${cat.slug}`}
                      className={`flex items-center justify-between text-sm py-2.5 px-4 rounded-xl transition-all ${
                        categorySlug === cat.slug
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs tabular-nums opacity-60">{count}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {filteredProducts && filteredProducts.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {filteredProducts.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/produtos/${product.slug}`}
                    className="group rounded-2xl border border-border/30 bg-card overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-border/60 transition-all duration-300"
                  >
                    <div className="aspect-[4/5] bg-muted/20 flex items-center justify-center overflow-hidden">
                      {product.product_images?.[0] ? (
                        <img
                          src={product.product_images[0].url}
                          alt={product.product_images[0].alt_text || product.name}
                          className="object-cover w-full h-full group-hover:scale-[1.04] transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center">
                            <span className="text-xl font-semibold text-muted-foreground/30">{product.name[0]}</span>
                          </div>
                          <span className="text-xs">Sem imagem</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 md:p-5">
                      {product.categories?.name && (
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">
                          {product.categories.name}
                        </p>
                      )}
                      <h3 className="font-medium text-sm leading-snug line-clamp-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mt-3">
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
            </>
          ) : (
            <div className="text-center py-24">
              <div className="size-20 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-5">
                <Filter className="size-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mt-1 mb-6">Tenta limpar o filtro de categoria</p>
              <Button className="rounded-full" asChild>
                <Link href="/produtos">Ver todos os produtos</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
