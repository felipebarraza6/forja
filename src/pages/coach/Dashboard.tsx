import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { ClipboardList, MessageSquare, Users } from 'lucide-react'
import { listCheckIns, listStudents, listSubscriptions, listThreads } from '@/lib/api/forja'
import { EmptyState } from '@/components/empty-state'
import { StaggerItem } from '@/components/page-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/skeleton'
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

  if (students.isLoading && checkIns.isLoading) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Coach</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Panel</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Resumen de tus alumnos, adherencia y mensajes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Alumnos activos', value: activos },
          { label: 'Adherencia media', value: `${avgAdherence}%` },
          { label: 'Mensajes sin leer', value: unread },
          { label: 'Pagos pendientes', value: pendingPay },
        ].map((kpi, i) => (
          <StaggerItem key={kpi.label} index={i}>
            <div className="surface p-4">
              <p className="text-xs text-text-faint">{kpi.label}</p>
              <p className="mt-2 font-display text-3xl font-semibold tabular">{kpi.value}</p>
            </div>
          </StaggerItem>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">Alumnos</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/coach/alumnos">Ver todos</Link>
            </Button>
          </div>
          {(students.data ?? []).length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin alumnos aún"
              description="Cuando tengas alumnos asignados aparecerán aquí."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link to="/coach/alumnos">Ir a alumnos</Link>
                </Button>
              }
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="space-y-3">
              {(students.data ?? []).slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/coach/alumnos/${s.id}`}
                      className="font-medium transition-colors hover:text-accent hover:underline"
                    >
                      {s.full_name}
                    </Link>
                    <p className="truncate text-xs text-text-faint">{s.plan_name}</p>
                  </div>
                  <Badge
                    variant={
                      s.status === 'activo'
                        ? 'success'
                        : s.status === 'pausado'
                          ? 'warn'
                          : 'secondary'
                    }
                  >
                    {s.adherence_pct}%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">Últimos check-ins</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/coach/adherencia">Reglas</Link>
            </Button>
          </div>
          {(checkIns.data ?? []).length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Sin check-ins"
              description="Los registros de tus alumnos se listarán aquí."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="space-y-3">
              {(checkIns.data ?? []).map((c) => {
                const student = students.data?.find((s) => s.id === c.student_id)
                return (
                  <li key={c.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
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
          )}
        </section>
      </div>

      {unread > 0 && (
        <div className="surface flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-4 text-accent" strokeWidth={1.75} />
            <p className="text-sm text-text-muted">
              Tienes <span className="font-medium text-text">{unread}</span> mensajes sin leer.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/coach/mensajes">Abrir mensajes</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
