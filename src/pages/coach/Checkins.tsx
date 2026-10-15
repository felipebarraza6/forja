import { useEffect, useState } from 'react'
import { listCheckIns, listRules } from '@/lib/api/forja'
import type { AdherenceRule, CheckIn } from '@/lib/api/types'
import { Switch } from '@/components/ui/switch'

export default function CheckinsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [rules, setRules] = useState<AdherenceRule[]>([])

  useEffect(() => {
    void Promise.all([listCheckIns(), listRules()]).then(([c, r]) => {
      setCheckIns(c)
      setRules(r)
    })
  }, [])

  const toggleRule = (id: number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Check-ins</h1>
        <p className="mt-1 text-text-muted">
          Adherencia diaria y reglas configurables (patrón 90 Días).
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Reglas de adherencia</h2>
        <ul className="space-y-2">
          {rules.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg-raised/60 px-4 py-3"
            >
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-text-muted">
                  {r.description} · peso {r.weight}%
                </p>
              </div>
              <Switch checked={r.enabled} onCheckedChange={() => toggleRule(r.id)} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Registros recientes</h2>
        <ul className="space-y-2">
          {checkIns.map((c) => (
            <li key={c.id} className="rounded-xl border border-border bg-bg-raised/50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{c.alumnoName}</p>
                  <p className="text-xs text-text-muted">{c.date}</p>
                </div>
                <p className="font-display text-xl font-semibold">{c.adherenceScore}%</p>
              </div>
              <p className="mt-2 text-sm text-text-muted">
                Entreno {c.workoutDone ? 'completado' : 'pendiente'} · {c.mealsLogged} comidas ·{' '}
                {c.waterMl} ml agua
              </p>
              {c.note && <p className="mt-1 text-sm">{c.note}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
