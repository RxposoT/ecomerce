<p align="center">
  <h1 align="center">Sacola</h1>
  <p align="center"><strong>Compras simples, vida simples.</strong></p>
  <p align="center">Um e-commerce português moderno, rápido e de confiança.</p>
</p>

<br>

## O problema

Comprar online em Portugal implica escolher entre grandes marketplaces internacionais — impessoais e sem alma — ou lojas locais sem presença digital. A Sacola nasceu para preencher esse vazio.

## A solução

Uma plataforma de e-commerce moderna construída do zero com:

- **Next.js 16** — performance, SEO, React Server Components
- **Supabase** — base de dados PostgreSQL, autenticação, RLS
- **Stripe** — pagamentos seguros
- **Tailwind CSS v4 + shadcn/ui** — design system limpo e responsivo

## Funcionalidades

### Loja Pública
- Página inicial com produtos em destaque e categorias
- Listagem de produtos com filtro por categoria
- Página de detalhe do produto (imagens, variantes, preço)
- Pesquisa rápida (cmd/ctrl+k)
- Carrinho de compras persistente
- Checkout com Stripe

### Autenticação e Conta
- Registo e login (email + password)
- Perfil do utilizador
- Histórico de encomendas com detalhes
- Gestão de moradas de envio
- Notificações (toast)

### Painel de Administração
- Dashboard com estatísticas (encomendas, receita, stock baixo)
- Gestão de produtos (CRUD com formulário completo)
- Gestão de categorias (hierárquicas)
- Gestão de encomendas (estados, histórico)
- Lista de clientes

### Segurança
- Row Level Security (RLS) no Supabase
- Função `is_admin()` com SECURITY DEFINER
- Webhooks Stripe assinados
- Admin client com service_role key para operações internas

## Começar

### Pré-requisitos

- Node.js 18+
- Uma conta [Supabase](https://supabase.com)
- Uma conta [Stripe](https://stripe.com)

### Setup

```bash
# clonar
git clone https://github.com/RxposoT/ecomerce.git
cd ecomerce

# instalar dependências
npm install

# configurar variáveis de ambiente
cp .env.example .env.local
```

Preenche `.env.local` com as tuas chaves (ver [env.example](.env.example)).

```bash
# correr em desenvolvimento
npm run dev

# build de produção
npm run build
npm run start
```

### Base de Dados

As migrations SQL estão em `supabase/migrations/`. Executar no SQL Editor do Supabase por ordem:

1. `001_schema.sql` — tabelas, índices, triggers
2. `002_rls.sql` — políticas RLS
3. `003_fix_rls_recursion.sql` — correção de recursão

### Tornar um utilizador admin

```sql
UPDATE profiles SET is_admin = true WHERE id = '<auth-user-id>';
```

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2.9 (Turbopack) |
| UI | Tailwind CSS v4 + shadcn/ui + @base-ui/react |
| Base de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Pagamentos | Stripe |
| Deployment | Vercel (recomendado) |
