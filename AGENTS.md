<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git Workflow
- `main`: produção. Só recebe merges de `dev`. Vercel faz auto-deploy.
- `dev`: integração. Branches de funcionalidade são merged aqui.
- `feat/*`: branches de funcionalidade criadas a partir de `dev`.

Sempre criar branches a partir de `dev`, nunca de `main`.

# Environments
- Local (`npm run dev`): usa `.env.local` → Supabase dev
- Preview (branch `dev` na Vercel): Supabase dev
- Produção (branch `main` na Vercel): Supabase prod

Env vars: `.env.prod` tem credenciais de produção (gitignored, backup local).
