'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ItemPriority } from '@/types'

const FOOD_CATEGORIES = [
  {
    name: 'Proteins',
    icon: '🥩',
    items: ['Chicken', 'Ground beef', 'Tuna', 'Beans', 'Peanut butter'],
  },
  {
    name: 'Vegetables',
    icon: '🥦',
    items: ['Frozen vegetables', 'Canned vegetables', 'Fresh produce'],
  },
  {
    name: 'Fruits',
    icon: '🍎',
    items: ['Fresh fruit', 'Canned fruit'],
  },
  {
    name: 'Grains',
    icon: '🌾',
    items: ['Rice', 'Pasta', 'Bread', 'Oatmeal'],
  },
  {
    name: 'Dairy',
    icon: '🥛',
    items: ['Milk', 'Cheese', 'Yogurt'],
  },
  {
    name: 'Household Essentials',
    icon: '🧻',
    items: ['Toilet paper', 'Soap', 'Toothpaste', 'Diapers'],
  },
]

interface CartItem {
  name: string
  category: string
  quantity: number
  priority: ItemPriority
}

const priorityColors: Record<ItemPriority, string> = {
  essential: 'bg-red-100 text-red-700 border-red-200',
  important: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  preferred: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function NewRequestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addItem(name: string, category: string) {
    if (cart.find((i) => i.name === name)) return
    setCart((prev) => [...prev, { name, category, quantity: 1, priority: 'important' }])
  }

  function removeItem(name: string) {
    setCart((prev) => prev.filter((i) => i.name !== name))
  }

  function updateItem(name: string, field: keyof CartItem, value: string | number) {
    setCart((prev) => prev.map((i) => (i.name === name ? { ...i, [field]: value } : i)))
  }

  async function handleSubmit() {
    if (cart.length === 0) {
      setError('Please add at least one item.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: request, error: reqError } = await supabase
      .from('food_requests')
      .insert({ recipient_id: user.id, status: 'pending', notes })
      .select()
      .single()

    if (reqError || !request) {
      setError(reqError?.message ?? 'Failed to create request')
      setLoading(false)
      return
    }

    const { error: itemsError } = await supabase.from('food_request_items').insert(
      cart.map((item) => ({
        request_id: request.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        priority: item.priority,
        fulfilled: false,
      }))
    )

    if (itemsError) {
      setError(itemsError.message)
      setLoading(false)
      return
    }

    router.push('/recipient/dashboard')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Request food assistance</h1>
        <p className="text-gray-500 mt-1">Select items you need. Set priorities to help with fulfillment.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Food categories */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {FOOD_CATEGORIES.map((cat) => (
            <Card key={cat.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{cat.icon}</span> {cat.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => {
                    const inCart = cart.find((i) => i.name === item)
                    return (
                      <button
                        key={item}
                        onClick={() => inCart ? removeItem(item) : addItem(item, cat.name)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                          inCart
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                        )}
                      >
                        {inCart ? '✓ ' : '+ '}{item}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Your request ({cart.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No items added yet</p>
              ) : (
                <div className="flex flex-col gap-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.name} className="flex flex-col gap-1 p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <button
                          onClick={() => removeItem(item.name)}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.name, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-14 text-xs border border-gray-200 rounded px-2 py-1"
                        />
                        <select
                          value={item.priority}
                          onChange={(e) => updateItem(item.name, 'priority', e.target.value)}
                          className={cn('text-xs border rounded px-2 py-1 font-medium', priorityColors[item.priority])}
                        >
                          <option value="essential">Essential</option>
                          <option value="important">Important</option>
                          <option value="preferred">Preferred</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                placeholder="Any notes or special requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

              <Button
                className="w-full"
                onClick={handleSubmit}
                loading={loading}
                disabled={cart.length === 0}
              >
                Submit request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
