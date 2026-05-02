import { cookies } from 'next/headers'
import PasswordGate from '@/components/PasswordGate'
import KanbanBoard from '@/components/KanbanBoard'
import { getTasks, getTeamMembers } from '@/lib/cosmic'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('auth_token')?.value === 'authenticated'

  if (!isAuthenticated) {
    return <PasswordGate />
  }

  const [tasks, teamMembers] = await Promise.all([getTasks(), getTeamMembers()])

  return (
    <main className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="border-b border-brand-border bg-brand-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Cosmic Tasks
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="hidden sm:inline">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </span>
            <form action="/api/auth" method="POST">
              <input type="hidden" name="action" value="logout" />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-brand-card border border-brand-border text-slate-300 hover:text-white hover:border-brand-accent transition-all text-xs"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Board */}
      <KanbanBoard initialTasks={tasks} teamMembers={teamMembers} />
    </main>
  )
}
