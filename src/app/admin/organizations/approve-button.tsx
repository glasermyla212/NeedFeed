'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function ApproveButton({ orgId }: { orgId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function approve() {
    setLoading(true)
    await supabase.from('food_banks').update({ approved: true }).eq('id', orgId)
    router.refresh()
    setLoading(false)
  }

  return (
    <Button size="sm" onClick={approve} loading={loading}>
      Approve
    </Button>
  )
}
