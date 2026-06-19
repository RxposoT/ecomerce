import { AuthForm } from '@/components/store/auth-form'

export default function AuthPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="size-14 rounded-[20px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-2xl font-heading">S</span>
          </div>
          <h1 className="display-sm">Sacola</h1>
          <p className="text-muted-foreground mt-2">
            Moda que abraça o teu estilo
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border/40 bg-card p-8 shadow-sm">
          <AuthForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Ao continuares, aceitas os nossos{' '}
          <a href="#" className="underline hover:text-foreground">Termos</a>
          {' '}e{' '}
          <a href="#" className="underline hover:text-foreground">Privacidade</a>
        </p>
      </div>
    </div>
  )
}
