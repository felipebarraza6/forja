import { NavLink, Outlet, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import {
  Activity,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Salad,
  Users,
  Wallet,
  Droplets,
  ClipboardCheck,
  Package,
} from 'lucide-react'
import { clearSession, getRole, isDemoSession } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import ThemeToggle from './ThemeToggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const coachNav = [
  { to: '/coach', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/coach/alumnos', label: 'Alumnos', icon: Users },
  { to: '/coach/servicios', label: 'Servicios', icon: Package },
  { to: '/coach/rutinas', label: 'Rutinas', icon: Dumbbell },
  { to: '/coach/nutricion', label: 'Nutrición', icon: Salad },
  { to: '/coach/checkins', label: 'Check-ins', icon: ClipboardCheck },
  { to: '/coach/mensajes', label: 'Mensajes', icon: MessageSquare },
  { to: '/coach/suscripciones', label: 'Suscripciones', icon: Wallet },
]

const alumnoNav = [
  { to: '/alumno', label: 'Hoy', icon: LayoutDashboard, end: true },
  { to: '/alumno/plan', label: 'Mi plan', icon: Activity },
  { to: '/alumno/entrenamiento', label: 'Entreno', icon: Dumbbell },
  { to: '/alumno/comidas', label: 'Comidas', icon: Salad },
  { to: '/alumno/agua', label: 'Agua', icon: Droplets },
  { to: '/alumno/mensajes', label: 'Coach', icon: MessageSquare },
]

export default function AppShell() {
  const role = getRole() ?? 'coach'
  const nav = role === 'coach' ? coachNav : alumnoNav
  const navigate = useNavigate()

  const logout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-border bg-bg-raised/80 backdrop-blur lg:flex lg:flex-col">
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">Forja</p>
            <p className="text-xs text-text-muted capitalize">{role}</p>
          </div>
          {isDemoSession() && (
            <Badge variant="secondary" className="text-[10px]">
              Demo
            </Badge>
          )}
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted transition hover:bg-bg-sunken hover:text-text',
                  isActive && 'bg-bg-sunken font-medium text-text',
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-border px-3 py-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="size-4" />
            Salir
          </Button>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-semibold">Forja</p>
            {isDemoSession() && (
              <Badge variant="secondary" className="text-[10px]">
                Demo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Cerrar sesión">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 px-4 py-5 sm:px-6 lg:px-8"
        >
          <Outlet />
        </motion.main>

        <nav className="sticky bottom-0 z-20 grid grid-cols-4 gap-1 border-t border-border bg-bg-raised/95 px-2 py-2 backdrop-blur lg:hidden">
          {nav.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[10px] text-text-muted',
                  isActive && 'bg-bg-sunken text-text',
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
