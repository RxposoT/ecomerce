import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Badge } from '@/components/ui/badge'

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  processing: 'Em processamento',
  shipped: 'Enviada',
  delivered: 'Entregue',
  cancelled: 'Cancelada',
}

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Encomendas</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium">Nº Encomenda</th>
                <th className="text-left p-4 font-medium">Cliente</th>
                <th className="text-right p-4 font-medium">Total</th>
                <th className="text-center p-4 font-medium">Estado</th>
                <th className="text-right p-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{order.order_number}</td>
                  <td className="p-4 text-muted-foreground">
                    {order.profiles?.full_name || 'N/A'}
                  </td>
                  <td className="p-4 text-right font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="outline">
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('pt-PT')}
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Nenhuma encomenda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
