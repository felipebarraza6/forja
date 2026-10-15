import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { listAlumnos, listCheckIns, listSuscripciones, listThreads } from '@/lib/api/forja'
import type { Alumno, CheckIn, Suscripcion, ChatThread } from '@/lib/api/types'
import { DEMO_COACH } from '@/lib/api/demo'

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-bg-raised/70 px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-text-faint">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  )
}

export default function CoachDashboard() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [subs, setSubs] = useState<Suscripcion[]>([])
  const [threads, setThreads] = useState<ChatThread[]>([])

  useEffect(() => {
    void Promise.all([listAlumnos(), listCheckIns(), listSuscripciones(), listThreads()]).then(
      ([a, c, s, t]) => {
        setAlumnos(a)
        setCheckIns(c)
        setSubs(s)
        setThreads(t)
      },
    )
  }, [])

  const avg =
    alumnos.length > 0
      ? Math.round(alumnos.reduce((acc, a) => acc + a.adherence, 0) / alumnos.length)
      : 0

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-text-muted">{DEMO_COACH.studio}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Hola, {DEMO_COACH.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-text-muted">Resumen de tu estudio hoy.</p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Alumnos activos" value={alumnos.filter((a) => a.status === 'activo').length} />
        <Stat label="Adherencia media" value={`${avg}%`} />
        <Stat label="Suscripciones activas" value={subs.filter((s) => s.status === 'activa').length} />
        <Stat label="Mensajes sin leer" value={threads.reduce((n, t) => n + t.unread, 0)} />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Últimos check-ins</h2>
            <Link to="/coach/checkins" className="text-sm text-accent hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="space-y-2">
            {checkIns.slice(0, 4).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-raised/60 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{c.alumnoName}</p>
                  <p className="text-xs text-text-muted">{c.date}</p>
                </div>
                <p className="font-display text-lg font-semibold">{c.adherenceScore}%</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Conversaciones</h2>
            <Link to="/coach/mensajes" className="text-sm text-accent hover:underline">
              Abrir
            </Link>
          </div>
          <ul className="space-y-2">
            {threads.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-border bg-bg-raised/60 px-3 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{t.alumnoName}</p>
                  {t.unread > 0 && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-bg">
                      {t.unread}
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-text-muted">{t.lastMessage}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
