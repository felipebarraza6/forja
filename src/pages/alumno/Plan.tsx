import { DEMO_ALUMNOS, DEMO_RUTINAS } from '@/lib/api/demo'
import { Progress } from '@/components/ui/progress'

export default function AlumnoPlanPage() {
  const me = DEMO_ALUMNOS[0]
  const rutina = DEMO_RUTINAS[0]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Mi plan</h1>
        <p className="text-text-muted">{me.plan}</p>
      </div>

      <section className="rounded-xl border border-border bg-bg-raised/60 p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span>Adherencia</span>
          <span className="font-medium">{me.adherence}%</span>
        </div>
        <Progress value={me.adherence} />
      </section>

      <section className="rounded-xl border border-border bg-bg-raised/60 p-4">
        <h2 className="font-display text-lg font-semibold">Macros</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['Proteína', `${me.macros.protein}g`],
            ['Carbos', `${me.macros.carbs}g`],
            ['Grasas', `${me.macros.fat}g`],
            ['Kcal', me.macros.kcal],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-bg-sunken/70 px-3 py-3">
              <p className="text-xs text-text-faint">{k}</p>
              <p className="font-display text-lg font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-bg-raised/60 p-4">
        <h2 className="font-display text-lg font-semibold">{rutina.name}</h2>
        <p className="text-sm text-text-muted">
          {rutina.daysPerWeek} días · {rutina.focus}
        </p>
        <ul className="mt-3 divide-y divide-border">
          {rutina.exercises.map((ex) => (
            <li key={ex.name} className="flex justify-between py-2 text-sm">
              <span>{ex.name}</span>
              <span className="text-text-muted">{ex.sets}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
