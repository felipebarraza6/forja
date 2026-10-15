import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { listAlumnos, listServicios, listSuscripciones, registerSuscripcionManual } from '@/lib/api/forja'
import type { Alumno, Servicio, Suscripcion } from '@/lib/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function formatClp(n: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

const statusVariant: Record<Suscripcion['status'], 'secondary' | 'outline' | 'destructive'> = {
  activa: 'secondary',
  pendiente: 'outline',
  vencida: 'destructive',
  cancelada: 'outline',
}

export default function SuscripcionesPage() {
  const [items, setItems] = useState<Suscripcion[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [alumnoId, setAlumnoId] = useState('')
  const [servicioId, setServicioId] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = () => void listSuscripciones().then(setItems)

  useEffect(() => {
    void Promise.all([listSuscripciones(), listAlumnos(), listServicios()]).then(
      ([subs, als, svcs]) => {
        setItems(subs)
        setAlumnos(als)
        setServicios(svcs)
        setAlumnoId(String(als[0]?.id ?? ''))
        setServicioId(String(svcs[0]?.id ?? ''))
      },
    )
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const alumno = alumnos.find((a) => String(a.id) === alumnoId)
    const servicio = servicios.find((s) => String(s.id) === servicioId)
    if (!alumno || !servicio) return
    setSaving(true)
    try {
      await registerSuscripcionManual({
        alumnoId: alumno.id,
        alumnoName: alumno.name,
        servicioId: servicio.id,
        servicioName: servicio.name,
        status: 'activa',
        startedAt: new Date().toISOString().slice(0, 10),
        amountClp: servicio.priceClp,
        notes: notes || 'Registro manual de suscripción',
      })
      setNotes('')
      reload()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Suscripciones</h1>
        <p className="mt-1 text-text-muted">
          Venta / acceso al coaching. Por ahora registro manual; se conectará a memberships o cuotas
          Yggdra.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-xl border border-border bg-bg-raised/50 p-4 sm:grid-cols-2"
      >
        <div className="space-y-2">
          <Label htmlFor="alumno">Alumno</Label>
          <select
            id="alumno"
            className="flex h-9 w-full rounded-md border border-border bg-bg px-3 text-sm"
            value={alumnoId}
            onChange={(e) => setAlumnoId(e.target.value)}
          >
            {alumnos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="servicio">Servicio</Label>
          <select
            id="servicio"
            className="flex h-9 w-full rounded-md border border-border bg-bg px-3 text-sm"
            value={servicioId}
            onChange={(e) => setServicioId(e.target.value)}
          >
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {formatClp(s.priceClp)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Nota / comprobante</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Transferencia Bancolombia 14/10"
          />
        </div>
        <Button type="submit" disabled={saving} className="sm:col-span-2 sm:w-fit">
          {saving ? 'Guardando…' : 'Registrar suscripción'}
        </Button>
      </form>

      <ul className="space-y-2">
        {items.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-bg-raised/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{s.alumnoName}</p>
                <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
              </div>
              <p className="text-sm text-text-muted">
                {s.servicioName} · desde {s.startedAt}
                {s.endsAt ? ` · hasta ${s.endsAt}` : ''}
              </p>
              {s.notes && <p className="text-xs text-text-faint">{s.notes}</p>}
            </div>
            <p className="font-display text-lg font-semibold">{formatClp(s.amountClp)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
