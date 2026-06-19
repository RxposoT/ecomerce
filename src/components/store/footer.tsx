import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background">
      <div className="container-full py-section">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm">
                S
              </div>
              <span className="font-heading text-lg font-semibold tracking-tight">Sacola</span>
            </div>
            <p className="body-small text-muted-foreground max-w-xs">
              Compras simples, vida simples. O teu e-commerce de confiança com envio rápido para todo o país.
            </p>
          </div>

          <div>
            <h4 className="label-small text-muted-foreground mb-4">Loja</h4>
            <nav className="space-y-2.5">
              <Link href="/produtos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Produtos</Link>
              <Link href="/conta" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">A minha conta</Link>
            </nav>
          </div>

          <div>
            <h4 className="label-small text-muted-foreground mb-4">Ajuda</h4>
            <nav className="space-y-2.5">
              <span className="block text-sm text-muted-foreground cursor-default">Envio e Devoluções</span>
              <span className="block text-sm text-muted-foreground cursor-default">Política de Privacidade</span>
              <span className="block text-sm text-muted-foreground cursor-default">Contacto</span>
            </nav>
          </div>

          <div>
            <h4 className="label-small text-muted-foreground mb-4">Legal</h4>
            <nav className="space-y-2.5">
              <span className="block text-sm text-muted-foreground cursor-default">Termos e Condições</span>
              <span className="block text-sm text-muted-foreground cursor-default">Privacidade</span>
              <span className="block text-sm text-muted-foreground cursor-default">Cookies</span>
            </nav>
          </div>
        </div>

        <div className="border-t border-border/20 mt-section pt-stack flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sacola. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
