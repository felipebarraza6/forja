import { useEffect, useState } from 'react'
import { listWorkouts } from '@/lib/api/forja'
import type { WorkoutLog } from '@/lib/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AlumnoEntrenamientoPage() {
  const [items, setItems] = useState<WorkoutLog[]>([])

  useEffect(() => {
    void listWorkouts().then(setItems)
  }, [])

  const markDone = (id: number) => {
    setItems((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, completed: true, durationMin: w.durationMin || 45 } : w,
      ),
    )
    toast.success('Entrenamiento registrado')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Entrenamiento</h1>
        <p className="text-text-muted">Registra tus sesiones completadas.</p>
      </div>

      <ul className="space-y-2">
        {items.map((w) => (
          <li
            key={w.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-bg-raised/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{w.name}</p>
                <Badge variant={w.completed ? 'secondary' : 'outline'}>
                  {w.completed ? 'Hecho' : 'Pendiente'}
                </Badge>
              </div>
              <p className="text-sm text-text-muted">
                {w.date}
                {w.completed ? ` · ${w.durationMin} min` : ''}
              </p>
            </div>
            {!w.completed && (
              <Button size="sm" onClick={() => markDone(w.id)}>
                Marcar hecho
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
