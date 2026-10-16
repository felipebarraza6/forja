import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Dumbbell } from 'lucide-react'
import { getTrainingPlan, listMeals, listWater, listWorkoutLogs } from '@/lib/api/forja'
import { useMyStudent } from '@/hooks/use-my-student'
import { EmptyState } from '@/components/empty-state'
import { StaggerItem } from '@/components/page-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/skeleton'

export function AlumnoDashboard() {
  const studentQ = useMyStudent()
  const id = studentQ.data?.id ?? ''

  const plan = useQuery({
    queryKey: ['training', id],
    queryFn: () => getTrainingPlan(id),
    enabled: !!id,
  })
  const meals = useQuery({
    queryKey: ['meals', id],
    queryFn: () => listMeals(id),
    enabled: !!id,
  })
  const water = useQuery({
    queryKey: ['water', id],
    queryFn: () => listWater(id),
    enabled: !!id,
  })
  const workouts = useQuery({
    queryKey: ['workouts', id],
    queryFn: () => listWorkoutLogs(id),
    enabled: !!id,
  })

  const s = studentQ.data
  const waterToday = (water.data ?? []).reduce((acc, w) => acc + w.ml, 0)
  const kcalToday = (meals.data ?? []).reduce((acc, m) => acc + m.calories, 0)

  if (studentQ.isLoading) {
    return <PageSkeleton />
  }

  if (studentQ.isError) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No se pudo cargar tu plan"
        description={
          studentQ.error instanceof Error
            ? studentQ.error.message
            : 'Revisa tu conexión e inténtalo de nuevo.'
        }
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Alumno</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">
          Hola{s ? `, ${s.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Tu plan, registros del día y acceso rápido al chat con tu coach.
        </p>
      </div>

      {s && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{s.plan_name}</Badge>
          <Badge variant="success">{s.adherence_pct}% adherencia</Badge>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Calorías hoy',
            value: kcalToday,
            suffix: `/ ${s?.macros.calories ?? '—'}`,
          },
          {
            label: 'Agua hoy',
            value: waterToday,
            suffix: `/ ${s?.macros.water_ml ?? '—'} ml`,
          },
          {
            label: 'Entrenos registrados',
            value: workouts.data?.length ?? 0,
            suffix: null,
          },
        ].map((kpi, i) => (
          <StaggerItem key={kpi.label} index={i}>
            <div className="surface p-4">
              <p className="text-xs text-text-faint">{kpi.label}</p>
              <p className="mt-2 font-display text-3xl font-semibold tabular">
                {kpi.value}
                {kpi.suffix != null && (
                  <span className="text-sm font-normal text-text-faint"> {kpi.suffix}</span>
                )}
              </p>
            </div>
          </StaggerItem>
        ))}
      </div>

      <section className="surface p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">
            {plan.data?.title ?? 'Plan de entrenamiento'}
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/alumno/entreno">Registrar</Link>
          </Button>
        </div>
        {plan.data ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {plan.data.days.map((d) => (
              <div
                key={d.id}
                className="rounded-lg border border-border bg-bg-sunken/40 p-3 transition-colors duration-200 hover:border-border-strong"
              >
                <p className="eyebrow">{d.day_label}</p>
                <p className="mt-1 font-medium">{d.focus}</p>
                <p className="mt-2 text-xs text-text-faint">{d.exercises.length} ejercicios</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Dumbbell}
            title="Sin plan asignado"
            description="Tu coach aún no te ha asignado una rutina."
            className="border-0 bg-transparent py-8"
          />
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/alumno/nutricion">Registrar comida</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/alumno/mensajes">Hablar con el coach</Link>
        </Button>
      </div>
    </div>
  )
}
