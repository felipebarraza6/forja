import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getTrainingPlan, listMeals, listWater, listWorkoutLogs } from '@/lib/api/forja'
import { useMyStudent } from '@/hooks/use-my-student'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
    return <p className="text-text-muted">Cargando tu plan…</p>
  }

  if (studentQ.isError) {
    return (
      <p className="text-danger">
        {studentQ.error instanceof Error ? studentQ.error.message : 'No se pudo cargar el alumno'}
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Alumno</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">
          Hola{s ? `, ${s.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-2 text-text-muted">
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
        <div className="surface p-4">
          <p className="text-xs text-text-faint">Calorías hoy</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular">
            {kcalToday}
            <span className="text-sm font-normal text-text-faint">
              {' '}
              / {s?.macros.calories ?? '—'}
            </span>
          </p>
        </div>
        <div className="surface p-4">
          <p className="text-xs text-text-faint">Agua hoy</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular">
            {waterToday}
            <span className="text-sm font-normal text-text-faint">
              {' '}
              / {s?.macros.water_ml ?? '—'} ml
            </span>
          </p>
        </div>
        <div className="surface p-4">
          <p className="text-xs text-text-faint">Entrenos registrados</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular">
            {workouts.data?.length ?? 0}
          </p>
        </div>
      </div>

      <section className="surface p-5">
        <div className="mb-3 flex items-center justify-between">
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
              <div key={d.id} className="rounded-lg border border-border bg-bg-sunken/40 p-3">
                <p className="eyebrow">{d.day_label}</p>
                <p className="mt-1 font-medium">{d.focus}</p>
                <p className="mt-2 text-xs text-text-faint">{d.exercises.length} ejercicios</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted">Aún no tienes un plan asignado.</p>
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
