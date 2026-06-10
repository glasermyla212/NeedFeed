import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, type, bundle_id } = await req.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: type === 'monthly' ? 'subscription' : 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: bundle_id ? `NeedFeed Food Bundle` : 'NeedFeed Donation',
            description: 'Supporting food assistance in your community',
          },
          ...(type === 'monthly'
            ? { recurring: { interval: 'month' }, unit_amount: amount }
            : { unit_amount: amount }),
        },
        quantity: 1,
      },
    ],
    metadata: {
      donor_id: user.id,
      type,
      bundle_id: bundle_id ?? '',
    },
    success_url: `${appUrl}/donor/dashboard?success=1`,
    cancel_url: `${appUrl}/donor/donate`,
  })

  return NextResponse.json({ url: session.url })
}
