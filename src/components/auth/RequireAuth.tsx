import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { getRole, getToken } from '@/lib/api/client'
import type { UserRole } from '@/lib/api/types'

export default function RequireAuth({
  role,
  children,
}: {
  role?: UserRole
  children: ReactNode
}) {
  const location = useLocation()
  const token = getToken()
  const current = getRole()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && current && current !== role) {
    return <Navigate to={current === 'coach' ? '/coach' : '/alumno'} replace />
  }

  return children
}
