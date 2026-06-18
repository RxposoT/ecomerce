import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

export default async function AdminProductsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus className="size-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium">Produto</th>
                <th className="text-left p-4 font-medium">Categoria</th>
                <th className="text-right p-4 font-medium">Preço</th>
                <th className="text-right p-4 font-medium">Stock</th>
                <th className="text-center p-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/admin/produtos/${product.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {product.categories?.name || '-'}
                  </td>
                  <td className="p-4 text-right font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="p-4 text-right">
                    <span className={product.stock_quantity <= product.min_stock_threshold ? 'text-destructive font-medium' : ''}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
