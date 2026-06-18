import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CartContent } from '@/components/store/cart-content'
import { redirect } from 'next/navigation'

export default async function CartPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let cart = null

  if (user) {
    const { data } = await supabase
      .from('carts')
      .select('*, cart_items(*, products(*), product_variants(*))')
      .eq('user_id', user.id)
      .maybeSingle()

    cart = data
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho</h1>
      <CartContent cart={cart} />
    </div>
  )
}
