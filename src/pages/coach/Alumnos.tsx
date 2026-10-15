import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { listStudents } from '@/lib/api/forja'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export function CoachAlumnos() {
  const { data = [], isLoading } = useQuery({ queryKey: ['students'], queryFn: listStudents })

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Gestión</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Alumnos</h1>
        <p className="mt-2 text-text-muted">Cada coach ve solo los alumnos de su sucursal/tenant.</p>
      </div>

      {isLoading ? (
        <p className="text-text-muted">Cargando…</p>
      ) : (
        <div className="surface overflow-hidden">
          <ul className="divide-y divide-border">
            {data.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/coach/alumnos/${s.id}`}
                  className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-bg-sunken/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{s.full_name}</p>
                    <p className="text-sm text-text-muted">
                      {s.email} · desde {formatDate(s.started_at)}
                    </p>
                    <p className="mt-1 text-sm text-text-faint">{s.goals}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{s.plan_name}</Badge>
                    <Badge
                      variant={
                        s.status === 'activo'
                          ? 'success'
                          : s.status === 'pausado'
                            ? 'warn'
                            : 'outline'
                      }
                    >
                      {s.status}
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
