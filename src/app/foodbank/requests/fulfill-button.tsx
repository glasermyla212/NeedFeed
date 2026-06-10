'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { RequestStatus } from '@/types'

const nextStatus: Record<string, RequestStatus> = {
  pending: 'processing',
  processing: 'packed',
  packed: 'delivered',
}

const buttonLabel: Record<string, string> = {
  pending: 'Start processing',
  processing: 'Mark as packed',
  packed: 'Mark as delivered',
}

export function FulfillButton({ requestId, currentStatus }: { requestId: string; currentStatus: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function advance() {
    setLoading(true)
    await supabase
      .from('food_requests')
      .update({ status: nextStatus[currentStatus] })
      .eq('id', requestId)
    router.refresh()
    setLoading(false)
  }

  if (!nextStatus[currentStatus]) return null

  return (
    <Button size="sm" onClick={advance} loading={loading}>
      {buttonLabel[currentStatus]}
    </Button>
  )
}
