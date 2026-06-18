import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createStripeClient } from '@/lib/stripe/client'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { cartId, address } = await request.json()

    const adminClient = createAdminClient()
    const { data: cart, error: cartError } = await adminClient
      .from('carts')
      .select('*, cart_items(*, products(*))')
      .eq('id', cartId)
      .eq('user_id', user.id)
      .single()

    if (cartError || !cart) {
      return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 404 })
    }

    if (cart.cart_items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
    }

    const subtotal = cart.cart_items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    )
    const shipping = subtotal >= 50 ? 0 : 4.99
    const tax = subtotal * 0.23
    const total = Math.round((subtotal + shipping + tax) * 100)

    const stripe = createStripeClient()

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email || undefined,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/conta/encomendas?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho?canceled=true`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['PT'],
      },
      line_items: cart.cart_items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.products?.name || 'Produto',
            images: item.products?.product_images?.[0]?.url
              ? [item.products.product_images[0].url]
              : [],
          },
          unit_amount: Math.round(item.unit_price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: {
        cart_id: cart.id,
        user_id: user.id,
      },
    })

    const { error: orderError } = await adminClient
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        subtotal,
        shipping_cost: shipping,
        tax_amount: tax,
        discount_amount: 0,
        total: (subtotal + shipping + tax),
        shipping_address: address,
        stripe_session_id: session.id,
        payment_status: 'unpaid',
      })

    if (orderError) {
      return NextResponse.json({ error: 'Erro ao criar encomenda' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
