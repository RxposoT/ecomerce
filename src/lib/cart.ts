import { createClient } from '@/lib/supabase/client'
import type { CartWithItems } from '@/types/database'

export async function getOrCreateCart(): Promise<CartWithItems | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    let { data: cart } = await supabase
      .from('carts')
      .select('*, cart_items(*, products(*), product_variants(*))')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('*, cart_items(*, products(*), product_variants(*))')
        .single()

      cart = newCart
    }

    return cart
  }

  let sessionId = localStorage.getItem('cart_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('cart_session_id', sessionId)
  }

  const { data: cart } = await supabase
    .from('carts')
    .select('*, cart_items(*, products(*), product_variants(*))')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (!cart) {
    const { data: newCart } = await supabase
      .from('carts')
      .insert({ session_id: sessionId })
      .select('*, cart_items(*, products(*), product_variants(*))')
      .single()

    return newCart
  }

  return cart
}

export async function addToCart(productId: string, quantity: number, variantId?: string) {
  const supabase = createClient()
  const cart = await getOrCreateCart()
  if (!cart) throw new Error('Could not get or create cart')

  const { data: product } = await supabase
    .from('products')
    .select('price')
    .eq('id', productId)
    .single()

  if (!product) throw new Error('Product not found')

  const unitPrice = product.price

  const existingItem = cart.cart_items.find(
    item => item.product_id === productId && item.variant_id === (variantId || null)
  )

  if (existingItem) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id: productId,
        variant_id: variantId || null,
        quantity,
        unit_price: unitPrice,
      })

    if (error) throw error
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = createClient()

  if (quantity <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
    return
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)

  if (error) throw error
}

export async function removeFromCart(itemId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}

export async function getCartItemCount(): Promise<number> {
  const cart = await getOrCreateCart()
  if (!cart) return 0
  return cart.cart_items.reduce((sum, item) => sum + item.quantity, 0)
}
