import { NavLink, Outlet, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
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
  const links = session.role === 'alumno' ? alumnoLinks : coachLinks

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="font-display text-lg font-bold tracking-tight">
              Forja
            </NavLink>
            {session.demo && <Badge variant="warn">Demo</Badge>}
            {session.branches[0] && (
              <span className="hidden text-xs text-text-faint sm:inline">
                {session.branches[0].name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden text-sm text-text-muted md:inline">
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
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-raised hover:text-text',
                  isActive && 'bg-bg-raised text-text shadow-sm',
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <motion.main
          key={session.role}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="min-w-0"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
