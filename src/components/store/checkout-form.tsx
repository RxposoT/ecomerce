'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/stripe/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { CartWithItems, Database } from '@/types/database'

type Address = Database['public']['Tables']['addresses']['Row']

interface CheckoutFormProps {
  cart: CartWithItems
  subtotal: number
  addresses: Address[]
}

export function CheckoutForm({ cart, subtotal, addresses }: CheckoutFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>(
    addresses.find(a => a.is_default)?.id || addresses[0]?.id || ''
  )
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0)
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    label: 'Principal',
  })

  const shipping = subtotal >= 50 ? 0 : 4.99
  const tax = subtotal * 0.23
  const total = subtotal + shipping + tax

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let addressId = selectedAddress

      if (showNewAddress) {
        const { data: addr, error: addrError } = await supabase
          .from('addresses')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user!.id,
            ...newAddress,
            country: 'Portugal',
          })
          .select()
          .single()

        if (addrError) throw addrError
        addressId = addr.id
      }

      const address = showNewAddress
        ? newAddress
        : addresses.find(a => a.id === addressId)

      if (!address) throw new Error('Endereço não encontrado')

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          address: {
            street: address.street,
            city: address.city,
            state: address.state || '',
            zip: address.zip,
            country: 'Portugal',
            label: address.label,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Erro no checkout')

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar encomenda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Morada de Envio</h2>

        {addresses.length > 0 && !showNewAddress && (
          <div className="space-y-2 mb-4">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAddress === addr.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddress === addr.id}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="mt-0.5"
                />
                <div className="text-sm">
                  <p className="font-medium">{addr.label}</p>
                  <p className="text-muted-foreground">{addr.street}</p>
                  <p className="text-muted-foreground">
                    {addr.zip} {addr.city}
                    {addr.state ? `, ${addr.state}` : ''}
                  </p>
                </div>
              </label>
            ))}
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setShowNewAddress(true)}
            >
              + Nova morada
            </Button>
          </div>
        )}

        {showNewAddress && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Morada</Label>
              <Input
                id="street"
                placeholder="Rua, nº, porta"
                value={newAddress.street}
                onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Lisboa"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Código Postal</Label>
                <Input
                  id="zip"
                  placeholder="1000-001"
                  value={newAddress.zip}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, zip: e.target.value }))}
                  required
                />
              </div>
            </div>
            {addresses.length > 0 && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setShowNewAddress(false)}
              >
                Usar morada existente
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Resumo da Encomenda</h2>
        <div className="space-y-2 text-sm">
          {cart.cart_items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.products?.name} x{item.quantity}
              </span>
              <span>{formatPrice(item.unit_price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Portes</span>
            <span>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">IVA (23%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Pagar {formatPrice(total)}
      </Button>
    </form>
  )
}
