import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function SponsorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: requests } = await supabase
    .from('food_requests')
    .select('id, notes, food_request_items(*), recipient_profiles(anonymous_label, household_size, num_children)')
    .eq('status', 'pending')
    .limit(12)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sponsor a family</h1>
      <p className="text-gray-500 mb-8">
        Fund a specific household&apos;s food request. All profiles are anonymous to protect dignity and privacy.
      </p>

      {!requests?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-gray-600 font-medium">All current requests are funded!</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon or make a general donation.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => {
            const profile = Array.isArray(req.recipient_profiles) ? req.recipient_profiles[0] : req.recipient_profiles
            const items = req.food_request_items ?? []
            const essentialCount = items.filter((i: { priority: string }) => i.priority === 'essential').length

            return (
              <Card key={req.id} className="flex flex-col">
                <CardContent className="pt-6 flex flex-col flex-1">
                  <div className="text-3xl mb-3">👨‍👩‍👧</div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {profile?.anonymous_label ?? `Household of ${profile?.household_size ?? '?'}`}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Requesting {items.length} items
                    {essentialCount > 0 && `, ${essentialCount} essential`}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {items.slice(0, 4).map((item: { id: string; name: string; priority: string }) => (
                      <span key={item.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {item.name}
                      </span>
                    ))}
                    {items.length > 4 && (
                      <span className="text-xs text-gray-400">+{items.length - 4} more</span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <form action="/api/stripe/sponsor" method="POST">
                      <input type="hidden" name="request_id" value={req.id} />
                      <Button type="submit" className="w-full">Sponsor this family</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
