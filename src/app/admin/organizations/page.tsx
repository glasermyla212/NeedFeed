import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ApproveButton } from './approve-button'

export default async function AdminOrganizationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: orgs } = await supabase
    .from('food_banks')
    .select('*')
    .order('approved', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Organizations ({orgs?.length ?? 0})</h1>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Location</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orgs?.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{org.name}</td>
                  <td className="px-6 py-3 text-gray-500">{org.city}, {org.state}</td>
                  <td className="px-6 py-3">
                    <Badge variant={org.approved ? 'success' : 'warning'}>
                      {org.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    {!org.approved && <ApproveButton orgId={org.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
