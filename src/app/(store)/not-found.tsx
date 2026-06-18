import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">Página não encontrada.</p>
      <Button asChild>
        <Link href="/">Voltar à Loja</Link>
      </Button>
    </div>
  )
}
