import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Utensils } from 'lucide-react'
import { createMeal, listMeals } from '@/lib/api/forja'
import { MEAL_TYPE_LABELS, mealTypeLabel } from '@/lib/api/labels'
import { useMyStudent } from '@/hooks/use-my-student'
import { MEAL_TYPES, type MealLog } from '@/lib/api/types'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageSkeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function AlumnoNutricion() {
  const studentQ = useMyStudent()
  const id = studentQ.data?.id ?? ''
  const qc = useQueryClient()
  const meals = useQuery({
    queryKey: ['meals', id],
    queryFn: () => listMeals(id),
    enabled: !!id,
  })
  const [meal, setMeal] = useState<MealLog['meal']>('snack')
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState(300)
  const [protein, setProtein] = useState(20)

  const add = useMutation({
    mutationFn: () =>
      createMeal({
        student_id: id,
        date: new Date().toISOString().slice(0, 10),
        meal,
        description: description || 'Comida registrada',
        calories,
        protein_g: protein,
        carbs_g: Math.round(calories * 0.45) / 4,
        fat_g: Math.round(calories * 0.25) / 9,
      }),
    onSuccess: async () => {
      setDescription('')
      toast.success('Comida registrada')
      await qc.invalidateQueries({ queryKey: ['meals', id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const macros = studentQ.data?.macros

  if (studentQ.isLoading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Nutrición</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Comidas y macros</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Meta diaria:{' '}
          {macros
            ? `${macros.calories} kcal · P ${macros.protein_g}g · C ${macros.carbs_g}g · G ${macros.fat_g}g`
            : '—'}
        </p>
      </div>

      <form
        className="surface grid gap-4 p-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!id) return
          add.mutate()
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="meal">Comida</Label>
          <select
            id="meal"
            className="flex h-10 w-full rounded-md border border-border bg-bg-raised px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            value={meal}
            onChange={(e) => setMeal(e.target.value as MealLog['meal'])}
          >
            {MEAL_TYPES.map((m) => (
              <option key={m} value={m}>
                {MEAL_TYPE_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="kcal">Calorías</Label>
          <Input
            id="kcal"
            type="number"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="desc">Descripción</Label>
          <Input
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. batido de proteína y fruta"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prot">Proteína (g)</Label>
          <Input
            id="prot"
            type="number"
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={add.isPending || !id} className="w-full sm:w-auto">
            Registrar comida
          </Button>
        </div>
      </form>

      {(meals.data ?? []).length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="Sin comidas hoy"
          description="Registra tu primera comida para ver el progreso de macros."
          className="py-10"
        />
      ) : (
        <ul className="space-y-2">
          {(meals.data ?? []).map((m) => (
            <li key={m.id} className="surface flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">{mealTypeLabel(m.meal)}</p>
                <p className="text-sm text-text-muted">{m.description}</p>
              </div>
              <p className="shrink-0 tabular text-sm text-text-muted">{m.calories} kcal</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
