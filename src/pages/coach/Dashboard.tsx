import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { listCheckIns, listStudents, listSubscriptions, listThreads } from '@/lib/api/forja'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export function CoachDashboard() {
  const students = useQuery({ queryKey: ['students'], queryFn: () => listStudents() })
  const threads = useQuery({ queryKey: ['threads'], queryFn: listThreads })
  const checkIns = useQuery({ queryKey: ['checkins'], queryFn: () => listCheckIns() })
  const subs = useQuery({ queryKey: ['subs'], queryFn: () => listSubscriptions() })

  const activos = students.data?.filter((s) => s.status === 'activo').length ?? 0
  const unread = threads.data?.reduce((acc, t) => acc + t.unread, 0) ?? 0
  const pendingPay = subs.data?.filter((s) => s.status === 'pendiente').length ?? 0
  const avgAdherence = students.data?.length
    ? Math.round(
        students.data.reduce((acc, s) => acc + s.adherence_pct, 0) / students.data.length,
      )
    : 0

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Coach</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Panel</h1>
        <p className="mt-2 text-text-muted">Resumen de tus alumnos, adherencia y mensajes.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Alumnos activos', value: activos },
          { label: 'Adherencia media', value: `${avgAdherence}%` },
          { label: 'Mensajes sin leer', value: unread },
          { label: 'Pagos pendientes', value: pendingPay },
        ].map((kpi) => (
          <div key={kpi.label} className="surface p-4">
            <p className="text-xs text-text-faint">{kpi.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tabular">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Alumnos</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/coach/alumnos">Ver todos</Link>
            </Button>
          </div>
          <ul className="space-y-3">
            {(students.data ?? []).slice(0, 4).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3">
                <div>
                  <Link to={`/coach/alumnos/${s.id}`} className="font-medium hover:underline">
                    {s.full_name}
                  </Link>
                  <p className="text-xs text-text-faint">{s.plan_name}</p>
                </div>
                <Badge
                  variant={
                    s.status === 'activo' ? 'success' : s.status === 'pausado' ? 'warn' : 'secondary'
                  }
                >
                  {s.adherence_pct}%
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Últimos check-ins</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/coach/adherencia">Reglas</Link>
            </Button>
          </div>
          <ul className="space-y-3">
            {(checkIns.data ?? []).map((c) => {
              const student = students.data?.find((s) => s.id === c.student_id)
              return (
                <li key={c.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{student?.full_name ?? c.student_id}</p>
                    <p className="text-xs text-text-muted">
                      {formatDate(c.date)}
                      {c.weight_kg != null ? ` · ${c.weight_kg} kg` : ''}
                      {c.notes ? ` · ${c.notes}` : ''}
                    </p>
                  </div>
                  <Badge variant={c.adherence_ok ? 'success' : 'warn'}>
                    energía {c.energy}/5
                  </Badge>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
