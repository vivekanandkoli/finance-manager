import { redirect } from 'next/navigation'
import { getUser, getProfile } from '@/lib/supabase/server'
import Sidebar from '@/components/shared/Sidebar'
import CommandPalette from '@/components/shared/CommandPalette'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
  const user = isPlaceholder ? null : await getUser()
  if (!user && !isPlaceholder) redirect('/login')

  const profile = isPlaceholder ? null : await getProfile()

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />

      {/* Main content area */}
      <main
        className="flex-1 min-h-screen overflow-x-hidden md:ml-[260px]"
      >
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {children}
        </div>
      </main>

      <CommandPalette />
    </div>
  )
}
