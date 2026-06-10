import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { count: totalUsers },
    { count: totalRequests },
    { count: totalDonations },
    { count: pendingOrgs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('food_requests').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('*', { count: 'exact', head: true }),
    supabase.from('food_banks').select('*', { count: 'exact', head: true }).eq('approved', false),
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin dashboard</h1>
      <p className="text-gray-500 mb-8">Platform-wide overview</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total users', value: totalUsers ?? 0, icon: '👥' },
          { label: 'Food requests', value: totalRequests ?? 0, icon: '🛒' },
          { label: 'Donations', value: totalDonations ?? 0, icon: '💚' },
          { label: 'Pending orgs', value: pendingOrgs ?? 0, icon: '🏢', alert: (pendingOrgs ?? 0) > 0 },
        ].map((stat) => (
          <Card key={stat.label} className={stat.alert ? 'border-yellow-300' : ''}>
            <CardContent className="pt-6">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
