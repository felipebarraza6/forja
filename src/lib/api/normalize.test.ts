import { describe, expect, it } from 'vitest'
import {
  normalizeMeal,
  normalizeService,
  normalizeStudent,
  normalizeStudentStatus,
  normalizeTrainingPlan,
  normalizeWater,
  normalizeWorkoutLog,
} from './normalize'

describe('normalize', () => {
  it('mapea status invitado (inválido en API) a activo', () => {
    expect(normalizeStudentStatus('invitado')).toBe('activo')
    expect(normalizeStudentStatus('pausado')).toBe('pausado')
    expect(normalizeStudentStatus('vencido')).toBe('vencido')
    expect(normalizeStudent({ id: 1, status: 'invitado' }).status).toBe('activo')
  })

  it('normaliza student con macros target_* y service anidado', () => {
    const s = normalizeStudent({
      id: 7,
      full_name: 'Ana',
      email: 'ana@test.cl',
      service: { id: 3, name: 'Elite' },
      status: 'activo',
      adherence_pct: 90,
      started_at: '2026-01-01T00:00:00Z',
      goal: 'Fuerza',
      calories_target: 2000,
      protein_target: 120,
      carbs_target: 200,
      fats_target: 60,
      water_target_ml: 2500,
      sessions_per_week: 4,
    })
    expect(s.id).toBe('7')
    expect(s.plan_id).toBe('3')
    expect(s.plan_name).toBe('Elite')
    expect(s.goals).toBe('Fuerza')
    expect(s.macros.protein_g).toBe(120)
    expect(s.macros.water_ml).toBe(2500)
    expect(s.sessions_per_week).toBe(4)
  })

  it('normaliza service con billing_period y includes_*', () => {
    const p = normalizeService({
      id: 1,
      name: 'Base',
      description: 'Plan',
      price: 89000,
      billing_period: 'monthly',
      duration_weeks: 8,
      includes_nutrition: true,
      includes_training: true,
    })
    expect(p.price_clp).toBe(89000)
    expect(p.billing).toBe('mensual')
    expect(p.billing_period).toBe('monthly')
    expect(p.features).toEqual(['Entrenamiento', 'Nutrición'])
  })

  it('normaliza training plan canónico (days.name, rest_seconds)', () => {
    const p = normalizeTrainingPlan({
      id: 1,
      student: 7,
      title: 'Bloque',
      notes: 'Notas',
      effective_from: '2026-01-01',
      effective_to: '2026-01-29',
      is_current: true,
      days: [
        {
          id: 2,
          name: 'A',
          weekday: 1,
          position: 1,
          notes: 'Push',
          exercises: [
            {
              id: 9,
              name: 'Press',
              position: 1,
              sets: 3,
              reps: '8',
              rest_seconds: 90,
              load_kg: 40,
            },
          ],
        },
      ],
    })
    expect(p.student_id).toBe('7')
    expect(p.is_current).toBe(true)
    expect(p.weeks).toBe(4)
    expect(p.days).toHaveLength(1)
    expect(p.days[0]?.day_label).toBe('A')
    expect(p.days[0]?.focus).toBe('Push')
    expect(p.days[0]?.exercises[0]?.rest_sec).toBe(90)
    expect(p.days[0]?.exercises[0]?.load_kg).toBe(40)
  })

  it('normaliza meal/water/workout con campos de fecha canónicos', () => {
    const meal = normalizeMeal({
      id: 1,
      student: 7,
      logged_on: '2026-10-16',
      meal_type: 'almuerzo',
      description: 'Pollo',
      calories: 600,
      protein: 40,
      carbs: 50,
      fats: 20,
    })
    expect(meal.date).toBe('2026-10-16')
    expect(meal.meal).toBe('almuerzo')
    expect(meal.protein_g).toBe(40)
    expect(meal.fat_g).toBe(20)

    const water = normalizeWater({ id: 2, student: 7, logged_on: '2026-10-16', ml: 500 })
    expect(water.date).toBe('2026-10-16')

    const wo = normalizeWorkoutLog({
      id: 3,
      student: 7,
      performed_on: '2026-10-16',
      workout_day: 2,
      title: 'A',
      completed: true,
    })
    expect(wo.date).toBe('2026-10-16')
    expect(wo.workout_day_id).toBe('2')
  })
})
