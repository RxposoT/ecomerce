'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/stripe/client'
import { updateCartItemQuantity, removeFromCart } from '@/lib/cart'
import { toast } from 'sonner'
import { useState } from 'react'

interface CartContentProps {
  cart: any
}

export function CartContent({ cart }: CartContentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpdate(itemId: string, quantity: number) {
    if (quantity < 1) return
    setLoading(itemId)
    await updateCartItemQuantity(itemId, quantity)
    toast.success('Carrinho atualizado')
    router.refresh()
    setLoading(null)
  }

  async function handleRemove(itemId: string) {
    setLoading(itemId)
    await removeFromCart(itemId)
    toast.success('Item removido')
    router.refresh()
    setLoading(null)
  }

  if (!cart || cart.cart_items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="size-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="size-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">O teu carrinho está vazio</p>
        <p className="text-sm text-muted-foreground mt-1">Adiciona produtos para continuar</p>
        <Button className="mt-6 rounded-full" asChild>
          <Link href="/produtos">Ver Produtos</Link>
        </Button>
      </div>
    )
  }

  const subtotal = cart.cart_items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
  const shipping = subtotal >= 50 ? 0 : 4.99
  const tax = subtotal * 0.23
  const total = subtotal + shipping + tax

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <div className="divide-y divide-border/50 border border-border/50 rounded-2xl overflow-hidden">
          {cart.cart_items.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-5">
              <div className="size-20 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                {item.products?.product_images?.[0] ? (
                  <img src={item.products.product_images[0].url} alt="" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-muted-foreground text-xs">{item.products?.name?.[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/produtos/${item.products?.slug}`}
                  className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                >
                  {item.products?.name}
                </Link>
                {item.product_variants && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.product_variants.name}</p>
                )}
                <p className="text-sm font-semibold mt-1">{formatPrice(item.unit_price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || loading === item.id}
                      className="size-7 flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-30"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-medium tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      disabled={loading === item.id}
                      className="size-7 flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-30"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={loading === item.id}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold">{formatPrice(item.unit_price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" asChild className="mt-4">
          <Link href="/produtos">
            <ArrowLeft className="size-4 mr-1" />
            Continuar a comprar
          </Link>
        </Button>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-card border border-border/50 rounded-2xl p-6 sticky top-24">
          <h3 className="font-semibold text-sm mb-4">Resumo da Encomenda</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Portes</span>
              <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Grátis</span> : formatPrice(shipping)}</span>
            </div>
            {subtotal < 50 && (
              <p className="text-xs text-muted-foreground">Grátis para encomendas acima de 50€</p>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA (23%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button className="w-full mt-6 rounded-full h-11" asChild>
            <Link href="/checkout">Finalizar Encomenda</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
