import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { completeWorkout, getTrainingPlan, listWorkoutLogs } from '@/lib/api/forja'
import { useMyStudent } from '@/hooks/use-my-student'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  if (studentQ.isLoading) return <p className="text-text-muted">Cargando…</p>

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Entrenamiento</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Tu rutina</h1>
        <p className="mt-2 text-text-muted">Marca el día completado para alimentar la adherencia.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(plan.data?.days ?? []).map((day) => (
          <div key={day.id} className="surface flex flex-col p-4">
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
        ))}
      </div>

      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Historial</h2>
        <ul className="space-y-2">
          {(logs.data ?? []).map((w) => (
            <li key={w.id} className="surface flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{w.title}</p>
                {w.notes && <p className="text-sm text-text-muted">{w.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-faint">{formatDate(w.date)}</span>
                <Badge variant="success">hecho</Badge>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
