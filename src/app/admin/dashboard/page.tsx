import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/stripe/client'
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react'

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

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('*')
    .lte('stock_quantity', 5)
    .eq('is_active', true)
    .order('stock_quantity')
    .limit(5)

  const stats = [
    { label: 'Total Encomendas', value: totalOrders ?? 0, icon: ShoppingBag },
    { label: 'Produtos', value: totalProducts ?? 0, icon: Package },
    { label: 'Clientes', value: totalUsers ?? 0, icon: Users },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Últimas Encomendas</h2>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-muted-foreground text-xs">
                      {order.profiles?.full_name || 'N/A'}
                    </p>
                  </div>
                  <span className="font-medium">{formatPrice(order.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma encomenda</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Stock Baixo</h2>
          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-destructive font-medium">{product.stock_quantity} unidades</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Stock normal</p>
          )}
        </div>
      </div>
    </div>
  )
}
