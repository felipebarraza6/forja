import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dumbbell } from 'lucide-react'
import { completeWorkout, getTrainingPlan, listWorkoutLogs } from '@/lib/api/forja'
import { useMyStudent } from '@/hooks/use-my-student'
import { EmptyState } from '@/components/empty-state'
import { StaggerItem } from '@/components/page-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageSkeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function AlumnoEntreno() {
  const studentQ = useMyStudent()
  const id = studentQ.data?.id ?? ''
  const qc = useQueryClient()
  const plan = useQuery({
    queryKey: ['training', id],
    queryFn: () => getTrainingPlan(id),
    enabled: !!id,
  })
  const logs = useQuery({
    queryKey: ['workouts', id],
    queryFn: () => listWorkoutLogs(id),
    enabled: !!id,
  })

  const complete = useMutation({
    mutationFn: (dayId: string) => {
      const day = plan.data?.days.find((d) => d.id === dayId)
      return completeWorkout({
        student_id: id,
        date: new Date().toISOString().slice(0, 10),
        workout_day_id: dayId,
        title: day ? `${day.day_label} — ${day.focus}` : dayId,
        completed: true,
      })
    },
    onSuccess: async () => {
      toast.success('Entreno registrado')
      await qc.invalidateQueries({ queryKey: ['workouts', id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (studentQ.isLoading || (id && plan.isLoading)) return <PageSkeleton />

  const days = plan.data?.days ?? []

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Entrenamiento</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Tu rutina</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Marca el día completado para alimentar la adherencia.
        </p>
      </div>

      {days.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Sin rutina asignada"
          description="Cuando tu coach publique un plan, los días de entrenamiento aparecerán aquí."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {days.map((day, i) => (
            <StaggerItem key={day.id} index={i} className="h-full">
              <div className="surface flex h-full flex-col p-4">
                <p className="eyebrow">{day.day_label}</p>
                <h2 className="mt-1 font-display text-lg font-semibold">{day.focus}</h2>
                <ul className="mt-3 flex-1 space-y-2 text-sm text-text-muted">
                  {day.exercises.map((ex) => (
                    <li key={ex.name}>
                      {ex.name}
                      <span className="text-text-faint">
                        {' '}
                        · {ex.sets}×{ex.reps}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => complete.mutate(day.id)}
                  disabled={complete.isPending || !id}
                >
                  Marcar completado
                </Button>
              </div>
            </StaggerItem>
          ))}
        </div>
      )}

      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Historial</h2>
        {(logs.data ?? []).length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="Sin entrenos registrados"
            description="Marca un día como completado para verlo en el historial."
            className="py-10"
          />
        ) : (
          <ul className="space-y-2">
            {(logs.data ?? []).map((w) => (
              <li key={w.id} className="surface flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{w.title}</p>
                  {w.notes && <p className="text-sm text-text-muted">{w.notes}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-text-faint">{formatDate(w.date)}</span>
                  <Badge variant="success">hecho</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
