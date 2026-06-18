import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminCustomersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Clientes</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">Nome</th>
              <th className="text-left p-4 font-medium">ID</th>
              <th className="text-left p-4 font-medium">Telefone</th>
              <th className="text-right p-4 font-medium">Registo</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => (
              <tr key={profile.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{profile.full_name || 'N/A'}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">{profile.id.slice(0, 8)}...</td>
                <td className="p-4 text-muted-foreground">{profile.phone || '-'}</td>
                <td className="p-4 text-right text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString('pt-PT')}
                </td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
