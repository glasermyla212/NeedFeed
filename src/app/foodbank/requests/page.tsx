import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { FulfillButton } from './fulfill-button'

export default async function FoodbankRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: foodbank } = await supabase
    .from('food_banks')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: requests } = await supabase
    .from('food_requests')
    .select('*, food_request_items(*)')
    .eq('foodbank_id', foodbank?.id)
    .order('created_at', { ascending: false })

  const statusOrder = ['pending', 'processing', 'packed', 'delivered', 'cancelled']
  const sorted = [...(requests ?? [])].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  )

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All requests</h1>

      {!sorted.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-500">No requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((req) => (
            <Card key={req.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Request — {formatDate(req.created_at)}
                  </CardTitle>
                  <Badge
                    variant={
                      req.status === 'delivered' ? 'success'
                      : req.status === 'pending' ? 'warning'
                      : req.status === 'cancelled' ? 'danger'
                      : 'info'
                    }
                  >
                    {req.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {req.food_request_items?.map((item: { id: string; name: string; quantity: number; priority: string; fulfilled: boolean }) => (
                    <span
                      key={item.id}
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.priority === 'essential'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'important'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.name} ×{item.quantity}
                    </span>
                  ))}
                </div>
                {req.notes && (
                  <p className="text-sm text-gray-500 italic mb-4">&ldquo;{req.notes}&rdquo;</p>
                )}
                {req.status !== 'delivered' && req.status !== 'cancelled' && (
                  <FulfillButton requestId={req.id} currentStatus={req.status} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
