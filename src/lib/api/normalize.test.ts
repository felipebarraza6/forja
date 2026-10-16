import { describe, expect, it } from 'vitest'
import { normalizeStudent, normalizeTrainingPlan } from './normalize'

describe('normalize', () => {
  it('normaliza student con plan anidado e id numérico', () => {
    const s = normalizeStudent({
      id: 7,
      full_name: 'Ana',
      email: 'ana@test.cl',
      plan: { id: 3, name: 'Elite' },
      status: 'activo',
      adherence_pct: 90,
      started_at: '2026-01-01T00:00:00Z',
      goals: 'Fuerza',
      macros: { calories: 2000, protein_g: 120, carbs_g: 200, fat_g: 60, water_ml: 2500 },
    })
    expect(s.id).toBe('7')
    expect(s.plan_id).toBe('3')
    expect(s.plan_name).toBe('Elite')
    expect(s.macros.protein_g).toBe(120)
  })

  it('normaliza training plan con days', () => {
    const p = normalizeTrainingPlan({
      id: 1,
      student: 7,
      title: 'Bloque',
      weeks: 4,
      days: [{ id: 2, day_label: 'A', focus: 'Push', exercises: [{ name: 'Press', sets: 3, reps: '8' }] }],
    })
    expect(p.student_id).toBe('7')
    expect(p.days).toHaveLength(1)
    expect(p.days[0]?.exercises[0]?.name).toBe('Press')
  })
})
