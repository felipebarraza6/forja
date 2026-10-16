import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardCheck } from 'lucide-react'
import { listAdherenceRules, toggleAdherenceRule } from '@/lib/api/forja'
import { adherenceMetricLabel } from '@/lib/api/labels'
import { EmptyState } from '@/components/empty-state'
import { PageSkeleton } from '@/components/ui/skeleton'
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

  if (rules.isLoading) return <PageSkeleton rows={4} />

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Seguimiento</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Adherencia</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Reglas configurables (mismo espíritu que 90 Días): entrenos, comidas, agua y check-ins.
        </p>
      </div>

      {(rules.data ?? []).length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Sin reglas"
          description="Cuando existan reglas de adherencia podrás activarlas o pausarlas aquí."
        />
      ) : (
        <ul className="space-y-3">
          {(rules.data ?? []).map((rule) => (
            <li
              key={rule.id}
              className="surface flex items-start justify-between gap-4 p-4 transition-colors duration-200"
            >
              <div className="min-w-0">
                <p className="font-medium">{rule.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">{rule.description}</p>
                <p className="mt-2 text-xs text-text-faint">
                  Meta: {rule.target_per_week}/{adherenceMetricLabel(rule.metric)} por semana
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
      )}
    </div>
  )
}
