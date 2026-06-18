import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, ArrowRight, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  processing: 'Em processamento',
  shipped: 'Enviada',
  delivered: 'Entregue',
  cancelled: 'Cancelada',
}

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .eq('payment_status', 'paid')

  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('*')
    .lte('stock_quantity', 5)
    .eq('is_active', true)
    .order('stock_quantity')
    .limit(5)

  const stats = [
    { label: 'Receita Total', value: formatPrice(totalRevenue), icon: DollarSign, sub: `${totalOrders} encomendas` },
    { label: 'Encomendas', value: String(totalOrders ?? 0), icon: ShoppingBag, sub: `${pendingOrders ?? 0} pendentes` },
    { label: 'Produtos', value: String(totalProducts ?? 0), icon: Package, sub: `${lowStockProducts?.length ?? 0} com stock baixo` },
    { label: 'Clientes', value: String(totalUsers ?? 0), icon: Users, sub: 'utilizadores registados' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da tua loja</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-5 hover:border-border transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="size-9 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Icon className="size-4.5 text-primary" />
                </div>
                <TrendingUp className="size-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <div>
              <h2 className="font-semibold text-sm">Últimas Encomendas</h2>
              <p className="text-xs text-muted-foreground mt-0.5">As 5 encomendas mais recentes</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/encomendas">
                Ver todas <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="divide-y divide-border/50">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3.5 text-sm hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center text-xs font-mono text-muted-foreground">
                      {order.order_number?.slice(-4)}
                    </div>
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{order.profiles?.full_name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <ShoppingBag className="size-8 mx-auto mb-2 opacity-30" />
              <p>Nenhuma encomenda ainda</p>
            </div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <div>
              <h2 className="font-semibold text-sm">Stock Baixo</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Produtos com menos de 5 unidades</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/produtos">
                Gerir <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </div>
          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="divide-y divide-border/50">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between px-5 py-3.5 text-sm hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="size-4 text-destructive shrink-0" />
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="text-destructive font-medium tabular-nums">{product.stock_quantity} un.</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Package className="size-8 mx-auto mb-2 opacity-30" />
              <p>Stock normal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
