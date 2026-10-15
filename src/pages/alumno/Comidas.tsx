import { useEffect, useState } from 'react'
import { DEMO_ALUMNOS } from '@/lib/api/demo'
import { listMeals } from '@/lib/api/forja'
import type { MealLog } from '@/lib/api/types'

export default function AlumnoComidasPage() {
  const me = DEMO_ALUMNOS[0]
  const [meals, setMeals] = useState<MealLog[]>([])

  useEffect(() => {
    void listMeals().then(setMeals)
  }, [])

  const totals = meals.reduce(
    (acc, m) => ({
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      kcal: acc.kcal + m.kcal,
    }),
    { protein: 0, carbs: 0, fat: 0, kcal: 0 },
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Comidas</h1>
        <p className="text-text-muted">
          Meta: {me.macros.protein}P / {me.macros.carbs}C / {me.macros.fat}G · {me.macros.kcal} kcal
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['P', totals.protein, me.macros.protein],
          ['C', totals.carbs, me.macros.carbs],
          ['G', totals.fat, me.macros.fat],
          ['Kcal', totals.kcal, me.macros.kcal],
        ].map(([label, cur, goal]) => (
          <div key={String(label)} className="rounded-xl border border-border bg-bg-raised/50 px-3 py-3">
            <p className="text-xs text-text-faint">{label}</p>
            <p className="font-display text-lg font-semibold">
              {cur}
              <span className="text-sm font-normal text-text-muted"> / {goal}</span>
            </p>
          </div>
        ))}
      </div>

      <ul className="space-y-2">
        {meals.map((m) => (
          <li key={m.id} className="rounded-xl border border-border bg-bg-raised/50 px-4 py-3">
            <div className="flex justify-between gap-2">
              <p className="font-medium">{m.name}</p>
              <p className="text-sm text-text-muted">{m.kcal} kcal</p>
            </div>
            <p className="text-sm text-text-muted">
              {m.protein}P · {m.carbs}C · {m.fat}G
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
