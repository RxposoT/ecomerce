'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, MapPin, Trash2, Loader2 } from 'lucide-react'
import type { Database } from '@/types/database'

type Address = Database['public']['Tables']['addresses']['Row']

interface AddressListProps {
  addresses: Address[]
}

export function AddressList({ addresses }: AddressListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    label: 'Principal',
    street: '',
    city: '',
    state: '',
    zip: '',
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('addresses').insert({
        user_id: (await supabase.auth.getUser()).data.user!.id,
        ...form,
        country: 'Portugal',
      })

      if (error) throw error
      toast.success('Morada adicionada!')
      setShowForm(false)
      setForm({ label: 'Principal', street: '', city: '', state: '', zip: '' })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar morada')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id)
      if (error) throw error
      toast.success('Morada removida')
      router.refresh()
    } catch {
      toast.error('Erro ao remover morada')
    }
  }

  if (addresses.length === 0 && !showForm) {
    return (
      <div className="text-center py-12 border border-border rounded-xl">
        <MapPin className="size-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Nenhuma morada registada.</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          Adicionar Morada
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="flex items-start justify-between gap-4 border border-border rounded-xl p-4"
        >
          <div className="text-sm">
            <p className="font-medium">{addr.label}</p>
            <p className="text-muted-foreground">{addr.street}</p>
            <p className="text-muted-foreground">
              {addr.zip} {addr.city}
              {addr.state ? `, ${addr.state}` : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => handleDelete(addr.id)}
            className="text-destructive shrink-0"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="border border-border rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Designação</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => setForm(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Morada</Label>
            <Input
              id="street"
              value={form.street}
              onChange={(e) => setForm(prev => ({ ...prev, street: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Código Postal</Label>
              <Input
                id="zip"
                value={form.zip}
                onChange={(e) => setForm(prev => ({ ...prev, zip: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          Adicionar Morada
        </Button>
      )}
    </div>
  )
}
