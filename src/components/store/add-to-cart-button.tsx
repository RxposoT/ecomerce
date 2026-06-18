'use client'

import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/lib/cart'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  productId: string
  variantId?: string
  disabled?: boolean
}

export function AddToCartButton({ productId, variantId, disabled }: AddToCartButtonProps) {
  const router = useRouter()

  async function handleAddToCart() {
    try {
      await addToCart(productId, 1, variantId)
      toast.success('Adicionado ao carrinho!')
      router.refresh()
    } catch {
      toast.error('Erro ao adicionar ao carrinho')
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled}
      className="w-full md:w-auto"
    >
      <ShoppingCart className="size-4" />
      {disabled ? 'Esgotado' : 'Adicionar ao Carrinho'}
    </Button>
  )
}
