import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { ArrowLeft, UserRound } from 'lucide-react'
import {
  getStudent,
  getTrainingPlan,
  listCheckIns,
  listMeals,
  listWorkoutLogs,
} from '@/lib/api/forja'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'

export function CoachAlumnoDetail() {
  const { id = '' } = useParams()
  const student = useQuery({ queryKey: ['student', id], queryFn: () => getStudent(id) })
  const plan = useQuery({ queryKey: ['training', id], queryFn: () => getTrainingPlan(id) })
  const meals = useQuery({ queryKey: ['meals', id], queryFn: () => listMeals(id) })
  const workouts = useQuery({ queryKey: ['workouts', id], queryFn: () => listWorkoutLogs(id) })
  const checkIns = useQuery({ queryKey: ['checkins', id], queryFn: () => listCheckIns(id) })

  if (student.isLoading) return <PageSkeleton />
  if (!student.data) {
    return (
      <EmptyState
        icon={UserRound}
        title="No se encontró el alumno"
        description="Puede que el enlace sea incorrecto o ya no esté disponible."
        action={
          <Button asChild variant="outline">
            <Link to="/coach/alumnos">Volver a alumnos</Link>
          </Button>
        }
      />
    )
  }

  const s = student.data

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link to="/coach/alumnos">
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            Alumnos
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight">{s.full_name}</h1>
            <p className="mt-1 text-text-muted">
              {s.email} · {s.plan_name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">{s.adherence_pct}% adherencia</Badge>
            <Badge variant="secondary">{s.status}</Badge>
          </div>
        </div>
        <p className="mt-3 text-sm text-text-muted">Objetivo: {s.goals}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Calorías', s.macros.calories],
          ['Proteína', `${s.macros.protein_g} g`],
          ['Carbos', `${s.macros.carbs_g} g`],
          ['Agua', `${s.macros.water_ml} ml`],
        ].map(([label, value]) => (
          <div key={label} className="surface p-3">
            <p className="text-xs text-text-faint">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular">{value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="rutina">
        <TabsList>
          <TabsTrigger value="rutina">Rutina</TabsTrigger>
          <TabsTrigger value="nutricion">Nutrición</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins</TabsTrigger>
        </TabsList>

        <TabsContent value="rutina" className="space-y-4">
          {plan.data ? (
            <>
              <h2 className="font-display text-lg font-semibold">
                {plan.data.title}{' '}
                <span className="text-sm font-normal text-text-muted">
                  · {plan.data.weeks} semanas
                </span>
              </h2>
              <div className="grid gap-3 md:grid-cols-3">
                {plan.data.days.map((day) => (
                  <div key={day.id} className="surface p-4">
                    <p className="eyebrow">{day.day_label}</p>
                    <p className="mt-1 font-medium">{day.focus}</p>
                    <ul className="mt-3 space-y-2 text-sm text-text-muted">
                      {day.exercises.map((ex) => (
                        <li key={ex.name}>
                          {ex.name} — {ex.sets}×{ex.reps}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-text-muted">Registros recientes</h3>
                {(workouts.data ?? []).length === 0 ? (
                  <p className="text-sm text-text-faint">Sin entrenos registrados.</p>
                ) : (
                  <ul className="space-y-2">
                    {(workouts.data ?? []).map((w) => (
                      <li key={w.id} className="flex justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate">
                          {w.title}
                          {w.notes ? ` — ${w.notes}` : ''}
                        </span>
                        <span className="shrink-0 text-text-faint">{formatDate(w.date)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p className="text-text-muted">Sin plan de entrenamiento asignado.</p>
          )}
        </TabsContent>

        <TabsContent value="nutricion">
          <ul className="space-y-3">
            {(meals.data ?? []).map((m) => (
              <li key={m.id} className="surface flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium capitalize">{m.meal}</p>
                  <p className="text-sm text-text-muted">{m.description}</p>
                </div>
                <div className="shrink-0 text-right text-sm tabular text-text-muted">
                  <p>{m.calories} kcal</p>
                  <p className="text-xs">
                    P{m.protein_g} C{m.carbs_g} G{m.fat_g}
                  </p>
                </div>
              </li>
            ))}
            {!meals.data?.length && <p className="text-text-muted">Sin comidas registradas.</p>}
          </ul>
        </TabsContent>

        <TabsContent value="checkins">
          <ul className="space-y-3">
            {(checkIns.data ?? []).map((c) => (
              <li key={c.id} className="surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{formatDate(c.date)}</p>
                  <Badge variant={c.adherence_ok ? 'success' : 'warn'}>
                    {c.adherence_ok ? 'ok' : 'revisar'}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-text-muted">
                  Energía {c.energy}/5
                  {c.weight_kg != null ? ` · ${c.weight_kg} kg` : ''}
                  {c.sleep_hours != null ? ` · sueño ${c.sleep_hours}h` : ''}
                </p>
                {c.notes && <p className="mt-1 text-sm">{c.notes}</p>}
              </li>
            ))}
            {!checkIns.data?.length && (
              <p className="text-text-muted">Sin check-ins registrados.</p>
            )}
          </ul>
        </TabsContent>
      </Tabs>

      <Button asChild>
        <Link to="/coach/mensajes">Abrir mensajes</Link>
      </Button>
    </div>
  )
}
