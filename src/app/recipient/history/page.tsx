import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { RequestStatus } from '@/types'

const statusVariant: Record<RequestStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  processing: 'info',
  packed: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: requests } = await supabase
    .from('food_requests')
    .select('*, food_request_items(*)')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Request history</h1>

      {!requests?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500">No requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {req.food_request_items?.length ?? 0} items requested
                  </CardTitle>
                  <Badge variant={statusVariant[req.status as RequestStatus]}>
                    {req.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{formatDate(req.created_at)}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {req.food_request_items?.map((item: { id: string; name: string; quantity: number; priority: string }) => (
                    <span key={item.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {item.name} ×{item.quantity}
                    </span>
                  ))}
                </div>
                {req.notes && (
                  <p className="text-sm text-gray-500 mt-3 italic">&ldquo;{req.notes}&rdquo;</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
