import { Sidebar } from '@/components/layout/sidebar'

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="donor" />
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}
