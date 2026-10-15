import { useEffect, useState } from 'react'
import { listServicios } from '@/lib/api/forja'
import type { Servicio } from '@/lib/api/types'
import { Badge } from '@/components/ui/badge'

const billingLabel: Record<Servicio['billing'], string> = {
  mensual: 'Mensual',
  programa: 'Programa',
  sesion: 'Por sesión',
}

function formatClp(n: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([])

  useEffect(() => {
    void listServicios().then(setServicios)
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Servicios</h1>
        <p className="mt-1 text-text-muted">
          Planes vendibles del coach. Se mapean a <code className="text-xs">services/services</code>{' '}
          de Yggdra cuando exista branch Forja.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {servicios.map((s) => (
          <article
            key={s.id}
            className="flex flex-col rounded-xl border border-border bg-bg-raised/60 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">{s.name}</h2>
              <Badge variant={s.active ? 'secondary' : 'outline'}>
                {s.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="mt-2 flex-1 text-sm text-text-muted">{s.description}</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="font-display text-2xl font-semibold">{formatClp(s.priceClp)}</p>
                <p className="text-xs text-text-faint">{billingLabel[s.billing]}</p>
              </div>
              <p className="text-xs text-text-muted">{s.alumnos} alumnos</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
