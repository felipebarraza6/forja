import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { DEMO_ALUMNOS } from '@/lib/api/demo'
import { getWaterMl, listMeals, listWorkouts } from '@/lib/api/forja'
import type { MealLog, WorkoutLog } from '@/lib/api/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export default function AlumnoDashboard() {
  const me = DEMO_ALUMNOS[0]
  const [water, setWater] = useState(0)
  const [meals, setMeals] = useState<MealLog[]>([])
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])

  useEffect(() => {
    void Promise.all([getWaterMl(), listMeals(), listWorkouts()]).then(([w, m, wo]) => {
      setWater(w)
      setMeals(m)
      setWorkouts(wo)
    })
  }, [])

  const waterPct = Math.min(100, Math.round((water / me.waterGoalMl) * 100))
  const todayWorkout = workouts[0]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Hola, {me.name.split(' ')[0]}</h1>
        <p className="text-text-muted">Tu día de entrenamiento y nutrición.</p>
      </div>

      <section className="rounded-xl border border-border bg-bg-raised/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-faint">Entreno de hoy</p>
            <p className="font-display text-xl font-semibold">
              {todayWorkout?.name ?? 'Sin sesión'}
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/alumno/entrenamiento">Registrar</Link>
          </Button>
        </div>
        <p className="mt-2 text-sm text-text-muted">
          {todayWorkout?.completed ? 'Completado' : 'Pendiente'} · plan {me.plan}
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-xl border border-border bg-bg-raised/60 p-4">
          <p className="text-xs uppercase tracking-wide text-text-faint">Agua</p>
          <p className="font-display text-2xl font-semibold">
            {water} / {me.waterGoalMl} ml
          </p>
          <Progress className="mt-3" value={waterPct} />
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/alumno/agua">Sumar agua</Link>
          </Button>
        </section>
        <section className="rounded-xl border border-border bg-bg-raised/60 p-4">
          <p className="text-xs uppercase tracking-wide text-text-faint">Comidas hoy</p>
          <p className="font-display text-2xl font-semibold">{meals.length}</p>
          <p className="mt-1 text-sm text-text-muted">
            {meals.reduce((n, m) => n + m.kcal, 0)} kcal registradas
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/alumno/comidas">Ver comidas</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
