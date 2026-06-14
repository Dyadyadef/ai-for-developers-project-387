import { Link, NavLink, Outlet } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOwner } from '@/api/hooks'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  )

export function AppLayout() {
  const { data: owner } = useOwner()

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span>{owner?.displayName ?? 'Календарь звонков'}</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Запись
            </NavLink>
            <NavLink to="/admin/event-types" className={navLinkClass}>
              Админ
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export function AdminLayout() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-4">
        <NavLink to="/admin/event-types" className={navLinkClass}>
          Типы событий
        </NavLink>
        <NavLink to="/admin/bookings" className={navLinkClass}>
          Предстоящие встречи
        </NavLink>
      </div>
      <Outlet />
    </div>
  )
}
