import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminCategoriesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: categories } = (await supabase
    .from('categories')
    .select('*, categories!parent_id(name)')
    .order('sort_order')) as unknown as { data: any[] | null }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button asChild>
          <Link href="/admin/categorias/nova">
            <Plus className="size-4" />
            Nova Categoria
          </Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">Nome</th>
              <th className="text-left p-4 font-medium">Slug</th>
              <th className="text-left p-4 font-medium">Categoria Pai</th>
              <th className="text-right p-4 font-medium">Ordem</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat) => (
              <tr key={cat.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4 text-muted-foreground">{cat.slug}</td>
                <td className="p-4 text-muted-foreground">
                  {cat.categories?.name || '-'}
                </td>
                <td className="p-4 text-right">{cat.sort_order}</td>
              </tr>
            ))}
            {(!categories || categories.length === 0) && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Nenhuma categoria encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
