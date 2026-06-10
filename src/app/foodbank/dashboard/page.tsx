import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function FoodbankDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: foodbank } = await supabase
    .from('food_banks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: requests } = await supabase
    .from('food_requests')
    .select('*, food_request_items(*)')
    .eq('foodbank_id', foodbank?.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const pending = requests?.filter(r => r.status === 'pending').length ?? 0
  const processing = requests?.filter(r => r.status === 'processing').length ?? 0
  const delivered = requests?.filter(r => r.status === 'delivered').length ?? 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{foodbank?.name ?? 'Food Bank'}</h1>
          <p className="text-gray-500 mt-1">Fulfillment overview</p>
        </div>
        <Link href="/foodbank/requests">
          <Button>View all requests</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending', value: pending, icon: '🕐', color: 'text-yellow-600' },
          { label: 'Processing', value: processing, icon: '⚙️', color: 'text-blue-600' },
          { label: 'Delivered', value: delivered, icon: '✅', color: 'text-green-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!requests?.length ? (
            <p className="text-sm text-gray-400 text-center py-8">No requests assigned yet</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {req.food_request_items?.length ?? 0} items
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(req.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        req.status === 'delivered' ? 'success'
                        : req.status === 'pending' ? 'warning'
                        : 'info'
                      }
                    >
                      {req.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
