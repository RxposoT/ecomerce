import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="border-t border-border/10 bg-muted/5 pb-16 md:pb-0">
      <div className="container-full">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10 pt-section pb-block">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-brand-orange-dark flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shadow-sm">
                S
              </div>
              <span className="font-heading text-lg font-semibold tracking-tight">Sacola</span>
            </Link>
            <p className="body-small text-muted-foreground max-w-xs leading-relaxed mb-6">
              Compras simples, vida simples. O teu e-commerce de confiança com envio rápido para todo o país.
            </p>
            <div className="flex items-center gap-3">
              {['Instagram', 'Facebook', 'TikTok'].map((social) => (
                <span
                  key={social}
                  className="size-9 rounded-xl bg-muted/50 flex items-center justify-center text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  {social[0]}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="label-small text-muted-foreground mb-4">Loja</h4>
            <nav className="space-y-2.5">
              <Link href="/produtos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Todos os Produtos</Link>
              <Link href="/produtos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Novidades</Link>
              <Link href="/produtos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Promoções</Link>
            </nav>
          </div>

          <div>
            <h4 className="label-small text-muted-foreground mb-4">A minha Conta</h4>
            <nav className="space-y-2.5">
              <Link href="/conta" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Perfil</Link>
              <Link href="/conta/encomendas" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Encomendas</Link>
              <Link href="/conta/moradas" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Moradas</Link>
            </nav>
          </div>

          <div>
            <h4 className="label-small text-muted-foreground mb-4">Ajuda</h4>
            <nav className="space-y-2.5">
              <span className="block text-sm text-muted-foreground cursor-default">Envio e Entregas</span>
              <span className="block text-sm text-muted-foreground cursor-default">Devoluções</span>
              <span className="block text-sm text-muted-foreground cursor-default">FAQ</span>
              <span className="block text-sm text-muted-foreground cursor-default">Contacto</span>
            </nav>
          </div>

          <div>
            <h4 className="label-small text-muted-foreground mb-4">Legal</h4>
            <nav className="space-y-2.5">
              <span className="block text-sm text-muted-foreground cursor-default">Termos e Condições</span>
              <span className="block text-sm text-muted-foreground cursor-default">Política de Privacidade</span>
              <span className="block text-sm text-muted-foreground cursor-default">Política de Cookies</span>
            </nav>
          </div>
        </div>

        <div className="border-t border-border/10 py-stack flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sacola. Todos os direitos reservados.</p>
          <p className="text-xs">Feito em Portugal 🇵🇹</p>
        </div>
      </div>
    </footer>
  )
}
