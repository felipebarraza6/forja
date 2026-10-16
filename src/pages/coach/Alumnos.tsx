import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Users } from 'lucide-react'
import { listStudents } from '@/lib/api/forja'
import { studentStatusBadgeVariant, studentStatusLabel } from '@/lib/api/labels'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { PageSkeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'

export function CoachAlumnos() {
  const { data = [], isLoading } = useQuery({ queryKey: ['students'], queryFn: () => listStudents() })

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Gestión</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Alumnos</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Cada coach ve solo los alumnos de su sucursal/tenant.
        </p>
      </div>

      {isLoading ? (
        <PageSkeleton rows={4} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay alumnos"
          description="Cuando se asignen alumnos a tu sucursal aparecerán en esta lista."
        />
      ) : (
        <div className="surface overflow-hidden">
          <ul className="divide-y divide-border">
            {data.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/coach/alumnos/${s.id}`}
                  className="flex flex-col gap-2 px-4 py-4 transition-colors duration-200 hover:bg-bg-sunken/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{s.full_name}</p>
                    <p className="text-sm text-text-muted">
                      {s.email} · desde {formatDate(s.started_at)}
                    </p>
                    <p className="mt-1 text-sm text-text-faint">{s.goals}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{s.plan_name}</Badge>
                    <Badge variant={studentStatusBadgeVariant(s.status)}>
                      {studentStatusLabel(s.status)}
                    </Badge>
                    <span className="tabular text-sm font-semibold">{s.adherence_pct}%</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
