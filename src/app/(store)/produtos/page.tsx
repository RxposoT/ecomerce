import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { ProductsFilter, ProductsSort } from './products-client'
import { QuickAddButton } from './quick-add-button'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const supabase = await createServerSupabaseClient()
  const params = await searchParams
  const categorySlug = typeof params.categoria === 'string' ? params.categoria : null
  const sortBy = typeof params.sort === 'string' ? params.sort : 'newest'

  let categoryId: string | null = null

  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (category) categoryId = (category as any).id
  }

  let { data: products } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const filteredProducts = categoryId
    ? (products as any[])?.filter((p: any) => p.category_id === categoryId)
    : (products as any[])

  switch (sortBy) {
    case 'price-asc':
      filteredProducts?.sort((a: any, b: any) => a.price - b.price)
      break
    case 'price-desc':
      filteredProducts?.sort((a: any, b: any) => b.price - a.price)
      break
    case 'name':
      filteredProducts?.sort((a: any, b: any) => a.name.localeCompare(b.name))
      break
    default:
      break
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const selectedCategoryName = categorySlug
    ? categories?.find((c: any) => c.slug === categorySlug)?.name
    : null

  const allCount = (products as any[])?.length ?? 0
  const filteredCount = filteredProducts?.length ?? 0

  return (
    <div className="container-full section">
      {/* Header */}
      <div className="mb-12">
        {selectedCategoryName ? (
          <div>
            <Link href="/produtos" className="label-small text-muted-foreground hover:text-foreground transition-colors mb-2 inline-block">
              ← Todos os produtos
            </Link>
            <h1 className="display-md mt-2">{selectedCategoryName}</h1>
            <p className="text-muted-foreground mt-2">{filteredCount} produtos</p>
          </div>
        ) : (
          <div>
            <h1 className="display-md">Produtos</h1>
            <p className="text-muted-foreground mt-2 text-lg">{filteredCount} produtos disponíveis</p>
          </div>
        )}
      </div>

      <div className="flex gap-10">
        {/* Sidebar Filters */}
        {categories && categories.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="label-small text-muted-foreground mb-4">Categorias</h3>
                <nav className="space-y-0.5">
                  <Link
                    href="/produtos"
                    className={`flex items-center justify-between text-sm py-2.5 px-4 rounded-xl transition-all ${
                      !categorySlug
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <span>Todos</span>
                    <span className="text-xs tabular-nums opacity-60">{allCount}</span>
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
            </div>
          </aside>
        )}

        {/* Product Area */}
        <div className="flex-1 min-w-0">
          {filteredProducts && filteredProducts.length > 0 ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {filteredCount} {filteredCount === 1 ? 'produto' : 'produtos'}
                  </p>
                  <ProductsFilter
                    categories={categories as any[] || []}
                    currentCategory={categorySlug}
                    allCount={allCount}
                  />
                </div>
                <ProductsSort currentSort={sortBy} categorySlug={categorySlug} />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {filteredProducts.map((product: any) => (
                  <div key={product.id} className="group relative">
                    <Link
                      href={`/produtos/${product.slug}`}
                      className="block rounded-2xl border border-border/30 bg-card overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-border/60 transition-all duration-300"
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
                          <p className="label-small text-muted-foreground mb-1.5">
                            {product.categories.name}
                          </p>
                        )}
                        <h3 className="text-sm font-medium leading-snug line-clamp-2">{product.name}</h3>
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

                    {/* Quick Add */}
                    {product.stock_quantity > 0 && (
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <QuickAddButton productId={product.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-24">
              <div className="size-20 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-5">
                <svg className="size-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mt-1 mb-6">Tenta limpar o filtro de categoria</p>
              <Link href="/produtos" className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/80 h-9 px-5 text-sm font-medium transition-all">
                Ver todos os produtos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
