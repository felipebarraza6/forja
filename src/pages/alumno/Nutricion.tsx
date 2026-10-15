import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createMeal, getStudent, listMeals } from '@/lib/api/forja'
import type { MealLog } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const STUDENT_ID = 'stu-1'

export function AlumnoNutricion() {
  const qc = useQueryClient()
  const student = useQuery({
    queryKey: ['student', STUDENT_ID],
    queryFn: () => getStudent(STUDENT_ID),
  })
  const meals = useQuery({ queryKey: ['meals', STUDENT_ID], queryFn: () => listMeals(STUDENT_ID) })
  const [meal, setMeal] = useState<MealLog['meal']>('once')
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState(300)
  const [protein, setProtein] = useState(20)

  const add = useMutation({
    mutationFn: () =>
      createMeal({
        student_id: STUDENT_ID,
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
      await qc.invalidateQueries({ queryKey: ['meals', STUDENT_ID] })
    },
  })

  const macros = student.data?.macros

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Nutrición</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Comidas y macros</h1>
        <p className="mt-2 text-text-muted">
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
          add.mutate()
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="meal">Comida</Label>
          <select
            id="meal"
            className="flex h-10 w-full rounded-md border border-border bg-bg-raised px-3 text-sm"
            value={meal}
            onChange={(e) => setMeal(e.target.value as MealLog['meal'])}
          >
            {['desayuno', 'almuerzo', 'once', 'cena', 'snack'].map((m) => (
              <option key={m} value={m}>
                {m}
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
          <Button type="submit" disabled={add.isPending}>
            Registrar comida
          </Button>
        </div>
      </form>

      <ul className="space-y-2">
        {(meals.data ?? []).map((m) => (
          <li key={m.id} className="surface flex items-start justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium capitalize">{m.meal}</p>
              <p className="text-sm text-text-muted">{m.description}</p>
            </div>
            <p className="tabular text-sm text-text-muted">{m.calories} kcal</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
