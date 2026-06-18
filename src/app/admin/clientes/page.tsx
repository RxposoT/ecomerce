'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Shield, ShieldOff, Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function AdminClientsPage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function loadProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setProfiles(data || [])
    setLoading(false)
  }

  useEffect(() => { loadProfiles() }, [])

  async function toggleAdmin(userId: string, currentStatus: boolean) {
    setTogglingId(userId)
    const { error } = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isAdmin: !currentStatus }),
    }).then(r => r.json())

    if (error) {
      toast.error(error)
    } else {
      toast.success(currentStatus ? 'Admin removido' : 'Admin atribuído')
      loadProfiles()
    }
    setTogglingId(null)
  }

  const filtered = profiles.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.id?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profiles.length} {profiles.length === 1 ? 'utilizador' : 'utilizadores'} registados
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nome</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Admin</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Registo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile) => (
                <tr key={profile.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-medium">{profile.full_name || <span className="text-muted-foreground italic">Sem nome</span>}</td>
                  <td className="p-4 text-muted-foreground font-mono text-xs">{profile.id.slice(0, 12)}...</td>
                  <td className="p-4">
                    <Button
                      variant={profile.is_admin ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleAdmin(profile.id, profile.is_admin)}
                      disabled={togglingId === profile.id}
                    >
                      {togglingId === profile.id ? (
                        <Loader2 className="size-3 animate-spin mr-1" />
                      ) : profile.is_admin ? (
                        <Shield className="size-3 mr-1" />
                      ) : (
                        <ShieldOff className="size-3 mr-1" />
                      )}
                      {profile.is_admin ? 'Admin' : 'Tornar Admin'}
                    </Button>
                  </td>
                  <td className="p-4 text-right text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString('pt-PT')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Nenhum utilizador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
