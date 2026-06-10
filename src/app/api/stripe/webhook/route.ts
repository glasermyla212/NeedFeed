import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { donor_id, type, bundle_id } = session.metadata ?? {}

    const supabase = await createClient()
    await supabase.from('donations').insert({
      donor_id,
      amount: session.amount_total,
      type,
      bundle_id: bundle_id || null,
      stripe_payment_id: session.id,
    })
  }

  return NextResponse.json({ received: true })
}
