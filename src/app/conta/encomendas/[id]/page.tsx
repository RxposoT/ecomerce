import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  processing: 'Em processamento',
  shipped: 'Enviada',
  delivered: 'Entregue',
  cancelled: 'Cancelada',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*), order_status_history(*)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!order) notFound()

  const address = order.shipping_address as {
    street: string
    city: string
    state?: string
    zip: string
    country: string
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Encomenda {order.order_number}</h2>
        <Badge variant="outline">{statusLabels[order.status] || order.status}</Badge>
      </div>

      <div className="space-y-6">
        <div className="border border-border rounded-xl p-4">
          <h3 className="font-medium text-sm mb-3">Artigos</h3>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  {item.variant_name && (
                    <p className="text-muted-foreground text-xs">{item.variant_name}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Qty: {item.quantity} x {formatPrice(item.unit_price)}
                  </p>
                </div>
                <span className="font-medium">{formatPrice(item.total_price)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h3 className="font-medium text-sm mb-3">Morada de Envio</h3>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p>{address.street}</p>
            <p>{address.zip} {address.city}</p>
            {address.state && <p>{address.state}</p>}
            <p>{address.country}</p>
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h3 className="font-medium text-sm mb-3">Resumo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Portes</span>
              <span>{formatPrice(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA</span>
              <span>{formatPrice(order.tax_amount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {order.order_status_history && order.order_status_history.length > 0 && (
          <div className="border border-border rounded-xl p-4">
            <h3 className="font-medium text-sm mb-3">Histórico</h3>
            <div className="space-y-2">
              {order.order_status_history.map((history) => (
                <div key={history.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {history.from_status
                      ? `${statusLabels[history.from_status] || history.from_status} → ${statusLabels[history.to_status] || history.to_status}`
                      : statusLabels[history.to_status] || history.to_status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(history.created_at).toLocaleString('pt-PT')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
