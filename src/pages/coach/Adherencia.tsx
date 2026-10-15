import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listAdherenceRules, toggleAdherenceRule } from '@/lib/api/forja'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export function CoachAdherencia() {
  const qc = useQueryClient()
  const rules = useQuery({ queryKey: ['rules'], queryFn: listAdherenceRules })
  const toggle = useMutation({
    mutationFn: toggleAdherenceRule,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['rules'] })
      toast.success('Regla actualizada')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Seguimiento</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Adherencia</h1>
        <p className="mt-2 text-text-muted">
          Reglas configurables (mismo espíritu que 90 Días): entrenos, comidas, agua y check-ins.
        </p>
      </div>

      <ul className="space-y-3">
        {(rules.data ?? []).map((rule) => (
          <li key={rule.id} className="surface flex items-start justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{rule.name}</p>
              <p className="mt-1 text-sm text-text-muted">{rule.description}</p>
              <p className="mt-2 text-xs text-text-faint">
                Meta: {rule.target_per_week}/{rule.metric} por semana
              </p>
            </div>
            <Switch
              checked={rule.enabled}
              onCheckedChange={() => toggle.mutate(rule.id)}
              aria-label={`Activar ${rule.name}`}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
