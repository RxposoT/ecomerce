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
      <footer className="border-t border-border/30 bg-background">
        <div className="max-w-[90rem] mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  S
                </div>
                <span className="text-lg font-semibold tracking-tight">Sacola</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Compras simples, vida simples. O teu e-commerce de confiança com envio rápido para todo o país.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Loja</h4>
              <nav className="space-y-2.5">
                <Link href="/produtos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Produtos</Link>
                <Link href="/auth" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">A minha conta</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Ajuda</h4>
              <nav className="space-y-2.5">
                <span className="block text-sm text-muted-foreground">Envio e Devoluções</span>
                <span className="block text-sm text-muted-foreground">Política de Privacidade</span>
                <span className="block text-sm text-muted-foreground">Contacto</span>
              </nav>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Legal</h4>
              <nav className="space-y-2.5">
                <span className="block text-sm text-muted-foreground">Termos e Condições</span>
                <span className="block text-sm text-muted-foreground">Privacidade</span>
                <span className="block text-sm text-muted-foreground">Cookies</span>
              </nav>
            </div>
          </div>
          <div className="border-t border-border/20 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Sacola. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-foreground transition-colors cursor-pointer">Termos</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Privacidade</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
