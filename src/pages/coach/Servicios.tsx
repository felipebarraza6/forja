import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { listServices, listSubscriptions, registerSubscription } from '@/lib/api/forja'
import { listStudents } from '@/lib/api/forja'
import { EmptyState } from '@/components/empty-state'
import { StaggerItem } from '@/components/page-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageSkeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function CoachServicios() {
  const qc = useQueryClient()
  const services = useQuery({ queryKey: ['services'], queryFn: listServices })
  const subs = useQuery({ queryKey: ['subs'], queryFn: () => listSubscriptions() })
  const students = useQuery({ queryKey: ['students'], queryFn: () => listStudents() })
  const [studentId, setStudentId] = useState('')
  const [planId, setPlanId] = useState('')
  const [note, setNote] = useState('Registro manual de suscripción')

  useEffect(() => {
    if (!studentId && students.data?.[0]) setStudentId(students.data[0].id)
  }, [students.data, studentId])

  useEffect(() => {
    if (!planId && services.data?.[0]) setPlanId(services.data[0].id)
  }, [services.data, planId])

  const create = useMutation({
    mutationFn: async () => {
      const student = students.data?.find((s) => s.id === studentId)
      const plan = services.data?.find((p) => p.id === planId)
      if (!student || !plan) throw new Error('Selecciona alumno y plan')
      return registerSubscription({
        student_id: student.id,
        student_name: student.full_name,
        plan_id: plan.id,
        plan_name: plan.name,
        amount_clp: plan.price_clp,
        status: 'pendiente',
        started_at: new Date().toISOString().slice(0, 10),
        note,
      })
    },
    onSuccess: async () => {
      toast.success('Suscripción registrada')
      await qc.invalidateQueries({ queryKey: ['subs'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (services.isLoading) return <PageSkeleton />

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Venta</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Servicios</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Planes vendibles del coach. Los pagos se registran manualmente hasta conectar cuotas/caja
          de Yggdra.
        </p>
      </div>

      {(services.data ?? []).length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Sin planes"
          description="Aún no hay servicios configurados para esta sucursal."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {(services.data ?? []).map((plan, i) => (
            <StaggerItem key={plan.id} index={i}>
              <div className="surface surface-interactive flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold">{plan.name}</h2>
                  <Badge variant={plan.active ? 'success' : 'secondary'}>
                    {plan.active ? 'activo' : 'off'}
                  </Badge>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                  {plan.description}
                </p>
                <p className="mt-4 font-display text-2xl font-semibold tabular">
                  ${plan.price_clp.toLocaleString('es-CL')}
                  <span className="ml-1 text-sm font-normal text-text-faint">/{plan.billing}</span>
                </p>
                <ul className="mt-3 space-y-1 text-sm text-text-muted">
                  {plan.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </div>
      )}

      <section className="surface p-5">
        <h2 className="font-display text-lg font-semibold">Registrar suscripción manual</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="student">Alumno</Label>
            <select
              id="student"
              className="flex h-10 w-full rounded-md border border-border bg-bg-raised px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              {(students.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <select
              id="plan"
              className="flex h-10 w-full rounded-md border border-border bg-bg-raised px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            >
              {(services.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="note">Nota</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <Button className="mt-4" onClick={() => create.mutate()} disabled={create.isPending}>
          Guardar registro
        </Button>
      </section>

      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Suscripciones</h2>
        {(subs.data ?? []).length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Sin suscripciones"
            description="Registra una suscripción manual para empezar el seguimiento de pagos."
            className="py-10"
          />
        ) : (
          <ul className="surface divide-y divide-border overflow-hidden">
            {(subs.data ?? []).map((sub) => (
              <li
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {sub.student_name} · {sub.plan_name}
                  </p>
                  <p className="text-xs text-text-faint">
                    desde {formatDate(sub.started_at)}
                    {sub.note ? ` · ${sub.note}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular text-sm font-semibold">
                    ${sub.amount_clp.toLocaleString('es-CL')}
                  </span>
                  <Badge
                    variant={
                      sub.status === 'activa'
                        ? 'success'
                        : sub.status === 'pendiente'
                          ? 'warn'
                          : 'secondary'
                    }
                  >
                    {sub.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
