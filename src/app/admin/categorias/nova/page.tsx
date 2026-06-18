import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/admin/category-form'

export default async function NewCategoryPage() {
  const supabase = await createServerSupabaseClient()

  const { data: categories } = (await supabase
    .from('categories')
    .select('*')
    .order('name')) as unknown as { data: any[] | null }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Nova Categoria</h1>
      <CategoryForm parentCategories={categories || []} />
    </div>
  )
}
