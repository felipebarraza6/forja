import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { listAlumnos, listCheckIns } from '@/lib/api/forja'
import type { Alumno, CheckIn } from '@/lib/api/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export default function AlumnoDetailPage() {
  const { id } = useParams()
  const [alumno, setAlumno] = useState<Alumno | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])

  useEffect(() => {
    void Promise.all([listAlumnos(), listCheckIns()]).then(([alumnos, checks]) => {
      const found = alumnos.find((a) => String(a.id) === id) ?? null
      setAlumno(found)
      setCheckIns(checks.filter((c) => String(c.alumnoId) === id))
    })
  }, [id])

  if (!alumno) {
    return <p className="text-text-muted">Cargando alumno…</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/coach/alumnos" className="text-sm text-accent hover:underline">
          ← Alumnos
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{alumno.name}</h1>
        <p className="text-text-muted">
          {alumno.email} · {alumno.plan}
        </p>
      </div>

      <section className="rounded-xl border border-border bg-bg-raised/60 p-4">
        <h2 className="font-display text-lg font-semibold">Macros objetivo</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Proteína', `${alumno.macros.protein} g`],
            ['Carbos', `${alumno.macros.carbs} g`],
            ['Grasas', `${alumno.macros.fat} g`],
            ['Kcal', alumno.macros.kcal],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-bg-sunken/70 px-3 py-3">
              <p className="text-xs text-text-faint">{label}</p>
              <p className="font-display text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-text-muted">
            <span>Adherencia</span>
            <span>{alumno.adherence}%</span>
          </div>
          <Progress value={alumno.adherence} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Check-ins recientes</h2>
          <Button asChild size="sm" variant="outline">
            <Link to="/coach/mensajes">Mensajear</Link>
          </Button>
        </div>
        <ul className="space-y-2">
          {checkIns.map((c) => (
            <li key={c.id} className="rounded-lg border border-border px-3 py-3 text-sm">
              <div className="flex justify-between">
                <span>{c.date}</span>
                <span className="font-medium">{c.adherenceScore}%</span>
              </div>
              <p className="mt-1 text-text-muted">
                Entreno {c.workoutDone ? '✓' : '✗'} · {c.mealsLogged} comidas · {c.waterMl} ml
              </p>
              {c.note && <p className="mt-1 text-text-muted">{c.note}</p>}
            </li>
          ))}
          {checkIns.length === 0 && (
            <p className="text-sm text-text-muted">Sin check-ins aún.</p>
          )}
        </ul>
      </section>
    </div>
  )
}
