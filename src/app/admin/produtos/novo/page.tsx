import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProductPage() {
  const supabase = await createServerSupabaseClient()

  const { data: categories } = (await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')) as unknown as { data: any[] | null }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Novo Produto</h1>
      <ProductForm categories={categories || []} />
    </div>
  )
}
