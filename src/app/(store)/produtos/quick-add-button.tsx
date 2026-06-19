'use client'

import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/cart'
import { toast } from 'sonner'

export function QuickAddButton({ productId }: { productId: string }) {
  const router = useRouter()

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await addToCart(productId, 1)
      toast.success('Adicionado ao carrinho!')
      router.refresh()
    } catch {
      toast.error('Erro ao adicionar')
    }
  }

  return (
    <button
      onClick={handleQuickAdd}
      className="w-full h-9 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg backdrop-blur-sm flex items-center justify-center gap-2"
    >
      <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
      Adicionar
    </button>
  )
}
