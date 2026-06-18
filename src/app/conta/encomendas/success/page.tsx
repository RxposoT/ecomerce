import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function OrderSuccessPage() {
  return (
    <div>
      <div className="text-center py-12">
        <CheckCircle className="size-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Encomenda Confirmada!</h2>
        <p className="text-muted-foreground mb-6">
          Obrigado pela sua compra. Receberá um email com os detalhes da encomenda.
        </p>
        <Button asChild>
          <Link href="/conta/encomendas">Ver Encomendas</Link>
        </Button>
      </div>
    </div>
  )
}
