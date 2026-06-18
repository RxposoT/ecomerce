import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Package, CreditCard, MapPin, Clock, ChevronRight } from 'lucide-react'

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  processing: 'Em processamento',
  shipped: 'Enviada',
  delivered: 'Entregue',
  cancelled: 'Cancelada',
}

const statusColors: Record<string, string> = {
  pending: 'text-amber-600 border-amber-200 bg-amber-50',
  confirmed: 'text-blue-600 border-blue-200 bg-blue-50',
  processing: 'text-purple-600 border-purple-200 bg-purple-50',
  shipped: 'text-indigo-600 border-indigo-200 bg-indigo-50',
  delivered: 'text-emerald-600 border-emerald-200 bg-emerald-50',
  cancelled: 'text-red-600 border-red-200 bg-red-50',
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

  const address = order.shipping_address as any
  const items = order.order_items || []
  const history = order.order_status_history || []

  return (
    <div>
      <Link
        href="/conta/encomendas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Voltar às encomendas
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold tracking-tight">Encomenda {order.order_number}</h1>
            <Badge variant="outline" className={`rounded-full text-xs ${statusColors[order.status] || ''}`}>
              {statusLabels[order.status] || order.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {new Date(order.created_at).toLocaleDateString('pt-PT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/30 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Artigos ({items.length})</h2>
              </div>
            </div>
            <div className="divide-y divide-border/10">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-5">
                  <div className="size-16 rounded-xl bg-muted/20 flex items-center justify-center shrink-0 border border-border/30">
                    <span className="text-lg font-bold text-muted-foreground/30">
                      {item.product_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.variant_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.quantity} x {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="bg-card border border-border/30 rounded-2xl p-6">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Histórico de Estado
              </h2>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/50" />
                {history.map((h: any, i: number) => (
                  <div key={h.id} className="relative">
                    <div className={`absolute -left-[21px] top-1 size-3 rounded-full border-2 ${
                      i === 0 ? 'bg-primary border-primary' : 'bg-background border-border'
                    }`} />
                    <p className="text-sm font-medium">
                      {h.from_status
                        ? `${statusLabels[h.from_status] || h.from_status} → ${statusLabels[h.to_status] || h.to_status}`
                        : statusLabels[h.to_status] || h.to_status}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(h.created_at).toLocaleString('pt-PT')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              Morada de Envio
            </h2>
            <div className="text-sm space-y-1">
              <p>{address.street}</p>
              <p>{address.zip} {address.city}</p>
              {address.state && <p>{address.state}</p>}
              <p>{address.country}</p>
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <CreditCard className="size-4 text-muted-foreground" />
              Resumo
            </h2>
            <div className="space-y-3 text-sm">
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
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
