'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, User, Phone, Save } from 'lucide-react'

interface ProfileFormProps {
  profile: any
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone: phone || null })
        .eq('id', profile.id)

      if (error) throw error
      toast.success('Perfil atualizado!')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg">
      <div className="bg-card border border-border/30 rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <h3 className="font-semibold text-sm">Informação Pessoal</h3>
          <p className="text-xs text-muted-foreground mt-1">Atualiza os teus dados</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Nome Completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="O teu nome"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+351 900 000 000"
              className="pl-9"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading} className="rounded-full">
            {loading && <Loader2 className="size-4 animate-spin mr-2" />}
            <Save className="size-4 mr-2" />
            Guardar Alterações
          </Button>
        </div>
      </div>
    </form>
  )
}
