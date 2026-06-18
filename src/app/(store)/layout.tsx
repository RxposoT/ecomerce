import { Header } from '@/components/store/header'
import Link from 'next/link'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="size-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                  S
                </div>
                <span className="font-semibold tracking-tight">Sacola</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Compras simples, vida simples. O teu e-commerce de confiança com envio rápido para todo o país.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Loja</h4>
              <nav className="space-y-2">
                <Link href="/produtos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Produtos</Link>
                <Link href="/auth" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">A minha conta</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Ajuda</h4>
              <nav className="space-y-2">
                <span className="block text-sm text-muted-foreground">Envio e Devoluções</span>
                <span className="block text-sm text-muted-foreground">Política de Privacidade</span>
                <span className="block text-sm text-muted-foreground">Contacto</span>
              </nav>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Sacola. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
