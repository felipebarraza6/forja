import { useEffect, useState } from 'react'
import { DEMO_ALUMNOS } from '@/lib/api/demo'
import { addWaterMl, getWaterMl } from '@/lib/api/forja'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

const QUICK = [250, 500, 750]

export default function AlumnoAguaPage() {
  const me = DEMO_ALUMNOS[0]
  const [water, setWater] = useState(0)

  useEffect(() => {
    void getWaterMl().then(setWater)
  }, [])

  const pct = Math.min(100, Math.round((water / me.waterGoalMl) * 100))

  const add = async (ml: number) => {
    const next = await addWaterMl(ml)
    setWater(next)
    toast.success(`+${ml} ml`)
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Agua</h1>
        <p className="text-text-muted">Meta diaria {me.waterGoalMl} ml</p>
      </div>

      <div className="rounded-xl border border-border bg-bg-raised/60 p-6 text-center">
        <p className="font-display text-4xl font-semibold">{water}</p>
        <p className="text-sm text-text-muted">ml registrados</p>
        <Progress className="mt-4" value={pct} />
        <p className="mt-2 text-xs text-text-faint">{pct}% de la meta</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {QUICK.map((ml) => (
          <Button key={ml} variant="outline" onClick={() => void add(ml)}>
            +{ml}
          </Button>
        ))}
      </div>
    </div>
  )
}
