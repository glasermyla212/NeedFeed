'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const AMOUNTS = [10, 25, 50, 100]
const BUNDLES = [
  {
    id: 'family',
    name: 'Family Meal Bundle',
    amount: 35,
    icon: '🍽️',
    description: 'Proteins, vegetables, rice, and pasta for a family of 4',
    items: ['Chicken', 'Ground beef', 'Frozen vegetables', 'Rice', 'Pasta'],
  },
  {
    id: 'student',
    name: 'Student Essentials Bundle',
    amount: 20,
    icon: '🎒',
    description: 'Easy meals and shelf-stable foods for college students',
    items: ['Tuna', 'Peanut butter', 'Oatmeal', 'Pasta', 'Canned fruit'],
  },
  {
    id: 'baby',
    name: 'Baby Care Bundle',
    amount: 40,
    icon: '👶',
    description: 'Essential supplies for infants and toddlers',
    items: ['Diapers', 'Formula', 'Wipes', 'Baby food'],
  },
]

export default function DonatePage() {
  const router = useRouter()
  const [tab, setTab] = useState<'general' | 'bundle'>('general')
  const [amount, setAmount] = useState(25)
  const [customAmount, setCustomAmount] = useState('')
  const [type, setType] = useState<'one_time' | 'monthly'>('one_time')
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const finalAmount = customAmount ? parseInt(customAmount) : amount

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: finalAmount * 100,
        type,
        bundle_id: selectedBundle,
      }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Make a donation</h1>
      <p className="text-gray-500 mb-8">Every dollar helps a family in need</p>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['general', 'bundle'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize',
              tab === t
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t === 'general' ? 'General donation' : 'Food bundles'}
          </button>
        ))}
      </div>

      {tab === 'general' ? (
        <Card>
          <CardContent className="pt-6 flex flex-col gap-6">
            {/* Frequency */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Frequency</p>
              <div className="flex gap-3">
                {(['one_time', 'monthly'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      'flex-1 py-2 rounded-lg border text-sm font-medium transition-colors',
                      type === t
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {t === 'one_time' ? 'One-time' : 'Monthly'}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Amount</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount('') }}
                    className={cn(
                      'py-2 rounded-lg border text-sm font-medium transition-colors',
                      amount === a && !customAmount
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <Button onClick={handleCheckout} loading={loading} size="lg">
              Donate ${finalAmount} {type === 'monthly' ? '/ month' : ''}
            </Button>

            <p className="text-xs text-center text-gray-400">
              Secure payment via Stripe. A small platform fee helps keep NeedFeed running.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {BUNDLES.map((bundle) => (
            <Card
              key={bundle.id}
              className={cn(
                'cursor-pointer transition-all',
                selectedBundle === bundle.id ? 'border-green-500 shadow-md' : 'hover:border-gray-300'
              )}
              onClick={() => setSelectedBundle(bundle.id === selectedBundle ? null : bundle.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{bundle.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
                      <p className="text-sm text-gray-500">{bundle.description}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-700">${bundle.amount}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {bundle.items.map((item) => (
                    <span key={item} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {selectedBundle && (
            <Button onClick={handleCheckout} loading={loading} size="lg">
              Fund this bundle — ${BUNDLES.find(b => b.id === selectedBundle)?.amount}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
