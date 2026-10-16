import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import {
  Droplets,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Users,
  Wallet,
  ClipboardCheck,
  Utensils,
} from 'lucide-react'
import { BrandMark } from '@/components/brand-logo'
import { PageMotion } from '@/components/page-motion'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/session'

const coachLinks = [
  { to: '/coach', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/coach/alumnos', label: 'Alumnos', icon: Users },
  { to: '/coach/servicios', label: 'Servicios', icon: Wallet },
  { to: '/coach/adherencia', label: 'Adherencia', icon: ClipboardCheck },
  { to: '/coach/mensajes', label: 'Mensajes', icon: MessageSquare },
]

const alumnoLinks = [
  { to: '/alumno', label: 'Mi plan', icon: LayoutDashboard, end: true },
  { to: '/alumno/entreno', label: 'Entreno', icon: Dumbbell },
  { to: '/alumno/nutricion', label: 'Nutrición', icon: Utensils },
  { to: '/alumno/agua', label: 'Agua', icon: Droplets },
  { to: '/alumno/mensajes', label: 'Mensajes', icon: MessageSquare },
]

export function AppShell() {
  const session = useSession((s) => s.session)!
  const logout = useSession((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const links = session.role === 'alumno' ? alumnoLinks : coachLinks

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <BrandMark size="sm" to="/" />
            {session.demo && <Badge variant="warn">Demo</Badge>}
            {session.branches[0] && (
              <span className="hidden truncate text-xs text-text-faint sm:inline">
                {session.branches[0].name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-1 hidden max-w-[160px] truncate text-sm text-text-muted lg:inline">
              {session.user.full_name ?? session.user.email}
            </span>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cerrar sesión"
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
            >
              <LogOut className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:py-6 md:grid-cols-[200px_1fr]">
        <nav
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0"
          aria-label="Principal"
        >
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-[background-color,color,box-shadow] duration-200 hover:bg-bg-raised hover:text-text',
                  isActive && 'bg-bg-raised text-text shadow-sm ring-1 ring-border/80',
                )
              }
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <PageMotion key={location.pathname} className="min-w-0 pb-8">
          <Outlet />
        </PageMotion>
      </div>
    </div>
  )
}
