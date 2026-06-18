import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/store/checkout-form'
import type { CartWithItems } from '@/types/database'

export default async function CheckoutPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: raw } = await supabase
    .from('carts')
    .select('*, cart_items(*, products(*), product_variants(*))')
    .eq('user_id', user.id)
    .maybeSingle()

  const cart = raw as CartWithItems | null

  if (!cart || cart.cart_items.length === 0) {
    redirect('/carrinho')
  }

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)

  const subtotal = cart.cart_items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Finalizar Encomenda</h1>
      <CheckoutForm
        cart={cart}
        subtotal={subtotal}
        addresses={addresses || []}
      />
    </div>
  )
}
