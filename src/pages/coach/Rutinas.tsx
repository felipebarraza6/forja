import { useEffect, useState } from 'react'
import { listRutinas } from '@/lib/api/forja'
import type { Rutina } from '@/lib/api/types'

export default function RutinasPage() {
  const [rutinas, setRutinas] = useState<Rutina[]>([])

  useEffect(() => {
    void listRutinas().then(setRutinas)
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Rutinas</h1>
        <p className="mt-1 text-text-muted">Plantillas de entrenamiento asignables a alumnos.</p>
      </div>

      <div className="space-y-4">
        {rutinas.map((r) => (
          <article key={r.id} className="rounded-xl border border-border bg-bg-raised/60 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl font-semibold">{r.name}</h2>
              <p className="text-sm text-text-muted">
                {r.daysPerWeek} días/sem · {r.focus}
              </p>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {r.exercises.map((ex) => (
                <li key={ex.name} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{ex.name}</p>
                    {ex.notes && <p className="text-xs text-text-muted">{ex.notes}</p>}
                  </div>
                  <span className="text-text-muted">{ex.sets}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
