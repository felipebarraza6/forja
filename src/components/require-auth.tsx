import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/lib/session'
import type { Role } from '@/lib/api/types'

export function RequireAuth({ roles }: { roles?: Role[] }) {
  const session = useSession((s) => s.session)
  const hydrated = useSession((s) => s.hydrated)
  const location = useLocation()

  if (!hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center text-text-muted">
        Cargando sesión…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(session.role)) {
    return <Navigate to={session.role === 'alumno' ? '/alumno' : '/coach'} replace />
  }

  return <Outlet />
}
