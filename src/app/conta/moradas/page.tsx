import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AddressList } from '@/components/store/address-list'

export default async function AddressesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at')

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">As minhas Moradas</h2>
      <AddressList addresses={addresses || []} />
    </div>
  )
}
