import { NextResponse } from 'next/server'
import { createStripeClient } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const stripe = createStripeClient()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        const { data: order } = await adminClient
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_intent_id: session.payment_intent as string,
          })
          .eq('stripe_session_id', session.id)
          .select()
          .single()

        if (order && session.metadata?.cart_id) {
          await adminClient
            .from('cart_items')
            .delete()
            .eq('cart_id', session.metadata.cart_id)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object

        await adminClient
          .from('orders')
          .update({ status: 'cancelled', payment_status: 'expired' })
          .eq('stripe_session_id', session.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
