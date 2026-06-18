import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Package, Clock, ChevronRight } from 'lucide-react'

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  processing: 'Em processamento',
  shipped: 'Enviada',
  delivered: 'Entregue',
  cancelled: 'Cancelada',
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
        <h2 className="text-xl font-bold tracking-tight mb-6">As minhas Encomendas</h2>
        <div className="text-center py-16 bg-card border border-border/30 rounded-2xl">
          <div className="size-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Package className="size-6 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold mb-1">Nenhuma encomenda</h3>
          <p className="text-sm text-muted-foreground mb-6">Ainda não fizeste nenhuma encomenda.</p>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Explorar produtos
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight mb-6">
        As minhas Encomendas
        <span className="text-sm font-normal text-muted-foreground ml-2">({orders.length})</span>
      </h2>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/conta/encomendas/${order.id}`}
            className="group block bg-card border border-border/30 rounded-2xl p-5 hover:border-border/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  #{order.order_number?.slice(-4)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{order.order_number}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatPrice(order.total)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs rounded-full px-2.5 ${
                    order.status === 'delivered' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                    order.status === 'cancelled' ? 'border-red-200 bg-red-50 text-red-700' :
                    order.status === 'shipped' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                    'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {statusLabels[order.status] || order.status}
                </Badge>
                {order.order_items && (
                  <span className="text-xs text-muted-foreground">
                    {order.order_items.length} artigo{order.order_items.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
