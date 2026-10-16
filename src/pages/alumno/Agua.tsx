import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Droplets } from 'lucide-react'
import { listWater, logWater } from '@/lib/api/forja'
import { useMyStudent } from '@/hooks/use-my-student'
import { PageSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AlumnoAgua() {
  const studentQ = useMyStudent()
  const id = studentQ.data?.id ?? ''
  const qc = useQueryClient()
  const water = useQuery({
    queryKey: ['water', id],
    queryFn: () => listWater(id),
    enabled: !!id,
  })

  const add = useMutation({
    mutationFn: (ml: number) => logWater(id, ml),
    onSuccess: async () => {
      toast.success('Agua registrada')
      await qc.invalidateQueries({ queryKey: ['water', id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const total = (water.data ?? []).reduce((acc, w) => acc + w.ml, 0)
  const target = studentQ.data?.macros.water_ml ?? 2800
  const pct = Math.min(100, Math.round((total / target) * 100))

  if (studentQ.isLoading) return <PageSkeleton rows={2} />

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Hidratación</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Agua</h1>
        <p className="mt-2 text-text-muted">Meta del día: {target.toLocaleString('es-CL')} ml</p>
      </div>

      <div className="surface p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3 text-accent">
          <div className="flex size-10 items-center justify-center rounded-full bg-accent-dim">
            <Droplets className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="text-sm text-text-muted">Progreso de hoy</p>
        </div>
        <p className="font-display text-4xl font-semibold tabular sm:text-5xl">
          {total.toLocaleString('es-CL')}
          <span className="text-lg font-normal text-text-faint"> ml</span>
        </p>
        <div
          className="mt-5 h-2.5 overflow-hidden rounded-full bg-bg-sunken"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso de hidratación"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-text-muted">{pct}% de la meta</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {[250, 500, 750].map((ml) => (
            <Button
              key={ml}
              variant="outline"
              onClick={() => add.mutate(ml)}
              disabled={add.isPending || !id}
            >
              +{ml} ml
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
