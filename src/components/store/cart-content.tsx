'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/stripe/client'
import { updateCartItemQuantity, removeFromCart } from '@/lib/cart'
import { toast } from 'sonner'
import type { CartWithItems } from '@/types/database'

interface CartContentProps {
  cart: CartWithItems | null
}

export function CartContent({ cart }: CartContentProps) {
  const router = useRouter()

  if (!cart || cart.cart_items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-6">O seu carrinho está vazio.</p>
        <Button asChild>
          <Link href="/produtos">Ver Produtos</Link>
        </Button>
      </div>
    )
  }

  const subtotal = cart.cart_items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    try {
      await updateCartItemQuantity(itemId, quantity)
      router.refresh()
    } catch {
      toast.error('Erro ao atualizar quantidade')
    }
  }

  async function handleRemove(itemId: string) {
    try {
      await removeFromCart(itemId)
      toast.success('Item removido do carrinho')
      router.refresh()
    } catch {
      toast.error('Erro ao remover item')
    }
  }

  return (
    <div className="space-y-4">
      {cart.cart_items.map((item) => (
        <div key={item.id} className="flex gap-4 border border-border rounded-xl p-4">
          <div className="size-20 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {item.products?.product_images?.[0] ? (
              <img
                src={item.products.product_images[0].url}
                alt={item.products.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xs text-muted-foreground">Sem img</span>
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
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="size-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="size-3" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleRemove(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      ))}

      <Separator className="my-6" />

      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Subtotal</span>
        <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
      </div>

      <Button className="w-full mt-4" size="lg" asChild>
        <Link href="/checkout">Finalizar Encomenda</Link>
      </Button>
    </div>
  )
}
