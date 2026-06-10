import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-green-50 to-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span>🌱</span> Food assistance, reimagined
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Getting food help should be as easy as<br />
            <span className="text-green-600">ordering groceries online</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            NeedFeed connects people who need food support with donors and local food banks — with dignity, choice, and convenience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=recipient">
              <Button size="lg">I need food assistance</Button>
            </Link>
            <Link href="/auth/signup?role=donor">
              <Button size="lg" variant="secondary">I want to donate</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">How NeedFeed works</h2>
          <p className="text-center text-gray-500 mb-16">Three groups, one platform</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🛒',
                title: 'Recipients request',
                description: 'Build a grocery-style food request from home. Set priorities, dietary needs, and let your local food bank fulfill it.',
              },
              {
                icon: '💚',
                title: 'Donors fund it',
                description: 'Donate once or monthly, sponsor a family anonymously, or fund a pre-built food bundle. See your real impact.',
              },
              {
                icon: '📦',
                title: 'Food banks fulfill',
                description: 'Partner food banks receive requests, match their inventory, and handle delivery — we handle the coordination.',
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-700 py-16 px-4">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center text-white">
          {[
            { value: '42M', label: 'Americans face food insecurity' },
            { value: '40%', label: 'Of food in the US goes to waste' },
            { value: '$1', label: 'Can provide up to 2 meals' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-green-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to make a difference?</h2>
          <p className="text-gray-600 mb-8">Join NeedFeed and be part of building a better food assistance system.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">Create an account</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary">Sign in</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-4 text-center text-sm text-gray-400">
        © 2025 NeedFeed. Making food assistance dignified and accessible.
      </footer>
    </div>
  )
}
