import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function DonorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .eq('donor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const totalDonated = donations?.reduce((sum, d) => sum + d.amount, 0) ?? 0
  const totalDonations = donations?.length ?? 0
  const mealsProvided = Math.floor(totalDonated / 100 * 2)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'} 💚
        </h1>
        <p className="text-gray-500 mt-1">Thank you for your generosity</p>
      </div>

      {/* Impact stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total donated', value: formatCurrency(totalDonated), icon: '💵' },
          { label: 'Donations made', value: totalDonations.toString(), icon: '🎁' },
          { label: 'Meals provided', value: `~${mealsProvided}`, icon: '🍽️' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="text-3xl mb-3">💚</div>
            <h3 className="font-semibold text-gray-900 mb-1">Make a donation</h3>
            <p className="text-sm text-gray-500 mb-4">Give a one-time or monthly donation to the general fund</p>
            <Link href="/donor/donate">
              <Button className="w-full">Donate now</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-3">👨‍👩‍👧</div>
            <h3 className="font-semibold text-gray-900 mb-1">Sponsor a family</h3>
            <p className="text-sm text-gray-500 mb-4">Fund a specific household&apos;s food request directly</p>
            <Link href="/donor/sponsor">
              <Button variant="secondary" className="w-full">Browse families</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent donations */}
      {donations && donations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-gray-100">
              {donations.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(d.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(d.created_at)}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                    {d.type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
