import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listAlumnos } from '@/lib/api/forja'
import type { Alumno } from '@/lib/api/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const statusLabel: Record<Alumno['status'], string> = {
  activo: 'Activo',
  pausado: 'Pausado',
  vencido: 'Vencido',
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])

  useEffect(() => {
    void listAlumnos().then(setAlumnos)
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Alumnos</h1>
        <p className="mt-1 text-text-muted">Gestiona el roster de tu branch / estudio.</p>
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border bg-bg-raised/50">
        {alumnos.map((a) => (
          <li key={a.id}>
            <Link
              to={`/coach/alumnos/${a.id}`}
              className="flex flex-col gap-3 px-4 py-4 transition hover:bg-bg-sunken/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{a.name}</p>
                  <Badge variant="secondary">{statusLabel[a.status]}</Badge>
                </div>
                <p className="text-sm text-text-muted">
                  {a.plan} · último check-in {a.lastCheckIn}
                </p>
              </div>
              <div className="w-full sm:w-40">
                <div className="mb-1 flex justify-between text-xs text-text-muted">
                  <span>Adherencia</span>
                  <span>{a.adherence}%</span>
                </div>
                <Progress value={a.adherence} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
