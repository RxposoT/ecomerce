import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Button } from '@/components/ui/button'
import { ArrowRight, Filter } from 'lucide-react'

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <p className="text-muted-foreground mt-1.5">
          {categorySlug
            ? `Filtrando por categoria`
            : `${filteredProducts?.length ?? 0} produtos disponíveis`}
        </p>
      </div>

      <div className="flex gap-8">
        {categories && categories.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Categorias</h3>
              <nav className="space-y-1">
                <Link
                  href="/produtos"
                  className={`flex items-center justify-between text-sm py-2 px-3 rounded-lg transition-colors ${
                    !categorySlug ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span>Todas</span>
                  <span className="text-xs text-muted-foreground">({products?.length ?? 0})</span>
                </Link>
                {categories.map((cat: any) => {
                  const count = (products as any[])?.filter((p: any) => p.category_id === cat.id).length || 0
                  return (
                    <Link
                      key={cat.id}
                      href={`/produtos?categoria=${cat.slug}`}
                      className={`flex items-center justify-between text-sm py-2 px-3 rounded-lg transition-colors ${
                        categorySlug === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-muted-foreground">({count})</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>
        )}

        <div className="flex-1">
          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product: any) => (
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
                    {product.categories?.name && (
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                        {product.categories.name}
                      </p>
                    )}
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
          ) : (
            <div className="text-center py-20">
              <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Filter className="size-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Tenta limpar o filtro de categoria</p>
              <Button variant="outline" className="mt-6 rounded-full" asChild>
                <Link href="/produtos">Ver todos os produtos</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
