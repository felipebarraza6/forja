import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getStudent, listWater, logWater } from '@/lib/api/forja'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const STUDENT_ID = 'stu-1'

export function AlumnoAgua() {
  const qc = useQueryClient()
  const student = useQuery({
    queryKey: ['student', STUDENT_ID],
    queryFn: () => getStudent(STUDENT_ID),
  })
  const water = useQuery({ queryKey: ['water', STUDENT_ID], queryFn: () => listWater(STUDENT_ID) })

  const add = useMutation({
    mutationFn: (ml: number) => logWater(STUDENT_ID, ml),
    onSuccess: async () => {
      toast.success('Agua registrada')
      await qc.invalidateQueries({ queryKey: ['water', STUDENT_ID] })
    },
  })

  const total = (water.data ?? []).reduce((acc, w) => acc + w.ml, 0)
  const target = student.data?.macros.water_ml ?? 2800
  const pct = Math.min(100, Math.round((total / target) * 100))

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Hidratación</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Agua</h1>
        <p className="mt-2 text-text-muted">Meta del día: {target.toLocaleString('es-CL')} ml</p>
      </div>

      <div className="surface p-6">
        <p className="font-display text-4xl font-semibold tabular">
          {total.toLocaleString('es-CL')}
          <span className="text-lg font-normal text-text-faint"> ml</span>
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg-sunken">
          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm text-text-muted">{pct}% de la meta</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[250, 500, 750].map((ml) => (
            <Button key={ml} variant="outline" onClick={() => add.mutate(ml)} disabled={add.isPending}>
              +{ml} ml
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
