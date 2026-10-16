import { describe, expect, it } from 'vitest'
import {
  normalizeAdherenceMetric,
  normalizeAuthorRole,
  normalizeMeal,
  normalizeMealType,
  normalizeService,
  normalizeStudent,
  normalizeStudentStatus,
  normalizeSubscriptionStatus,
  normalizeTrainingPlan,
  normalizeWater,
  normalizeWorkoutLog,
} from './normalize'

describe('normalize', () => {
  it('normaliza Student.status API EN (+ aliases ES legacy)', () => {
    expect(normalizeStudentStatus('invited')).toBe('invited')
    expect(normalizeStudentStatus('active')).toBe('active')
    expect(normalizeStudentStatus('paused')).toBe('paused')
    expect(normalizeStudentStatus('finished')).toBe('finished')
    expect(normalizeStudentStatus('cancelled')).toBe('cancelled')
    expect(normalizeStudentStatus('invitado')).toBe('invited')
    expect(normalizeStudentStatus('activo')).toBe('active')
    expect(normalizeStudentStatus('pausado')).toBe('paused')
    expect(normalizeStudent({ id: 1, status: 'active' }).status).toBe('active')
  })

  it('normaliza meal_type, metric y subscription status', () => {
    expect(normalizeMealType('breakfast')).toBe('breakfast')
    expect(normalizeMealType('desayuno')).toBe('breakfast')
    expect(normalizeMealType('once')).toBe('snack')
    expect(normalizeAdherenceMetric('training')).toBe('training')
    expect(normalizeAdherenceMetric('entrenos')).toBe('training')
    expect(normalizeAdherenceMetric('checkins')).toBe('check_in')
    expect(normalizeSubscriptionStatus('active')).toBe('active')
    expect(normalizeSubscriptionStatus('pendiente')).toBe('past_due')
    expect(normalizeSubscriptionStatus('activa')).toBe('active')
    expect(normalizeAuthorRole('coach')).toBe('coach')
    expect(normalizeAuthorRole('admin')).toBe('admin')
  })

  it('normaliza student con macros target_* y service anidado', () => {
    const s = normalizeStudent({
      id: 7,
      full_name: 'Ana',
      email: 'ana@test.cl',
      service: { id: 3, name: 'Elite' },
      status: 'active',
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
    expect(s.status).toBe('active')
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
      duration_weeks: 4,
      includes_nutrition: false,
      includes_training: true,
      is_active: true,
    })
    expect(p.price_clp).toBe(89000)
    expect(p.billing_period).toBe('monthly')
    expect(p.billing).toBe('mensual')
    expect(p.includes_training).toBe(true)
    expect(p.features).toContain('Entrenamiento')
  })

  it('normaliza training plan con days.name/weekday y rest_seconds', () => {
    const p = normalizeTrainingPlan({
      id: 1,
      student: 7,
      title: 'Bloque',
      notes: 'n',
      effective_from: '2026-01-01',
      effective_to: '2026-02-01',
      is_current: true,
      days: [
        {
          id: 2,
          name: 'A',
          weekday: 1,
          focus: 'Push',
          exercises: [{ name: 'Press', sets: 3, reps: '8', rest_seconds: 90 }],
        },
      ],
    })
    expect(p.student_id).toBe('7')
    expect(p.is_current).toBe(true)
    expect(p.days).toHaveLength(1)
    expect(p.days[0]?.day_label).toBe('A')
    expect(p.days[0]?.exercises[0]?.rest_sec).toBe(90)
  })

  it('normaliza meal/water/workout con campos canónicos', () => {
    const meal = normalizeMeal({
      id: 1,
      student: 7,
      logged_on: '2026-10-16',
      meal_type: 'lunch',
      description: 'Pollo',
      calories: 500,
      protein: 40,
      carbs: 30,
      fats: 15,
    })
    expect(meal.date).toBe('2026-10-16')
    expect(meal.meal).toBe('lunch')
    expect(meal.protein_g).toBe(40)
    expect(meal.fat_g).toBe(15)

    const water = normalizeWater({ id: 2, student: 7, logged_on: '2026-10-16', ml: 500 })
    expect(water.date).toBe('2026-10-16')
    expect(water.ml).toBe(500)

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
