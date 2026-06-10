import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { RequestStatus } from '@/types'

const statusVariant: Record<RequestStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  processing: 'info',
  packed: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

export default async function RecipientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: requests } = await supabase
    .from('food_requests')
    .select('*, food_request_items(*)')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const activeRequest = requests?.find(r => r.status !== 'delivered' && r.status !== 'cancelled')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s your food assistance overview</p>
        </div>
        {!activeRequest && (
          <Link href="/recipient/request">
            <Button>New request</Button>
          </Link>
        )}
      </div>

      {activeRequest ? (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Active request</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  {activeRequest.food_request_items?.length ?? 0} items requested
                </p>
                <p className="text-sm text-gray-500 mt-1">Submitted {formatDate(activeRequest.created_at)}</p>
              </div>
              <Badge variant={statusVariant[activeRequest.status as RequestStatus]}>
                {activeRequest.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="pt-6 text-center py-12">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-600 font-medium">No active requests</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Create a request to get started</p>
            <Link href="/recipient/request">
              <Button>Request food assistance</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {requests && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-gray-100">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {req.food_request_items?.length ?? 0} items
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(req.created_at)}</p>
                  </div>
                  <Badge variant={statusVariant[req.status as RequestStatus]}>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
