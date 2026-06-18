import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Button } from '@/components/ui/button'

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

    if (category) {
      categoryId = (category as any).id
    }
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Produtos</h1>

      <div className="flex gap-8">
        {categories && categories.length > 0 && (
          <aside className="hidden lg:block w-64 shrink-0">
            <h2 className="font-semibold mb-4">Categorias</h2>
            <nav className="space-y-2">
              <Link
                href="/produtos"
                className={`block text-sm py-1.5 px-3 rounded-md transition-colors ${
                  !categorySlug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                }`}
              >
                Todas
              </Link>
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/produtos?categoria=${cat.slug}`}
                  className={`block text-sm py-1.5 px-3 rounded-md transition-colors ${
                    categorySlug === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        <div className="flex-1">
          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => (
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
                    <p className="text-xs text-muted-foreground mb-1">
                      {product.categories?.name}
                    </p>
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
            <div className="text-center py-16">
              <p className="text-muted-foreground">Nenhum produto encontrado.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/produtos">Ver todos os produtos</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
