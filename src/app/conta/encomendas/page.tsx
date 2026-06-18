import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Package } from 'lucide-react'

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  processing: 'Em processamento',
  shipped: 'Enviada',
  delivered: 'Entregue',
  cancelled: 'Cancelada',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-6">As minhas Encomendas</h2>
        <div className="text-center py-12 border border-border rounded-xl">
          <Package className="size-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhuma encomenda encontrada.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">As minhas Encomendas</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/conta/encomendas/${order.id}`}
            className="block border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm">{order.order_number}</span>
              <Badge
                variant="outline"
                className={statusColors[order.status] || ''}
              >
                {statusLabels[order.status] || order.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('pt-PT')}
              </span>
              <span className="font-semibold">{formatPrice(order.total)}</span>
            </div>
            {order.order_items && (
              <p className="text-xs text-muted-foreground mt-2">
                {order.order_items.length} artigo{order.order_items.length !== 1 ? 's' : ''}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
