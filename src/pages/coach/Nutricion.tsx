import { useEffect, useState } from 'react'
import { listAlumnos } from '@/lib/api/forja'
import type { Alumno } from '@/lib/api/types'

export default function NutricionPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])

  useEffect(() => {
    void listAlumnos().then(setAlumnos)
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Nutrición</h1>
        <p className="mt-1 text-text-muted">Macros y meta de agua por alumno.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-bg-sunken/80 text-xs uppercase tracking-wide text-text-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Alumno</th>
              <th className="px-4 py-3 font-medium">P</th>
              <th className="px-4 py-3 font-medium">C</th>
              <th className="px-4 py-3 font-medium">G</th>
              <th className="px-4 py-3 font-medium">Kcal</th>
              <th className="px-4 py-3 font-medium">Agua</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-bg-raised/40">
            {alumnos.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3">{a.macros.protein}g</td>
                <td className="px-4 py-3">{a.macros.carbs}g</td>
                <td className="px-4 py-3">{a.macros.fat}g</td>
                <td className="px-4 py-3">{a.macros.kcal}</td>
                <td className="px-4 py-3">{a.waterGoalMl} ml</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
