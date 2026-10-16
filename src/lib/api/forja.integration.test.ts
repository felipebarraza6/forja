/**
 * Pruebas de integración contra el contrato real de /api/forja/
 * documentado en docs/contract-gaps.md.
 *
 * No usan producción ni crean usuarios coach: mockean fetch con
 * formas de respuesta coherentes con el contrato (snake_case, top-level
 * + filtro ?student=, 401-shaped auth en vivo).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_KEY, TOKEN_KEY, BRANCH_KEY } from './client'

const API = 'https://api.yggdra.cl/api'

type MockCall = { url: string; method: string; body?: unknown; headers: HeadersInit }

function installFetchMock(handler: (call: MockCall) => unknown) {
  const calls: MockCall[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = (init?.method ?? 'GET').toUpperCase()
    const headers = init?.headers ?? {}
    let body: unknown
    if (init?.body) {
      try {
        body = JSON.parse(String(init.body))
      } catch {
        body = init.body
      }
    }
    const call: MockCall = { url, method, body, headers }
    calls.push(call)
    const payload = handler(call)
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return { calls, fetchMock }
}

describe('contrato /api/forja/ (mocks)', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(TOKEN_KEY, 'test-token')
    localStorage.setItem(BRANCH_KEY, '91')
    localStorage.removeItem(DEMO_KEY)
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('lista alumnos en GET /forja/students/ con Token y X-Branch-ID', async () => {
    const { calls } = installFetchMock(() => ({
      results: [
        {
          id: 1,
          full_name: 'Ana Demo',
          email: 'ana@test.cl',
          plan: { id: 3, name: 'Elite' },
          status: 'activo',
          adherence_pct: 88,
          started_at: '2026-01-01',
          goals: 'Fuerza',
          macros: { calories: 2000, protein_g: 120, carbs_g: 200, fat_g: 60, water_ml: 2500 },
        },
      ],
    }))

    const { listStudents } = await import('./forja')
    const students = await listStudents()

    expect(students).toHaveLength(1)
    expect(students[0]?.id).toBe('1')
    expect(students[0]?.plan_name).toBe('Elite')
    expect(calls[0]?.url).toBe(`${API}/forja/students/`)
    expect(calls[0]?.method).toBe('GET')
    const headers = new Headers(calls[0]?.headers)
    expect(headers.get('Authorization')).toBe('Token test-token')
    expect(headers.get('X-Branch-ID')).toBe('91')
  })

  it('students/me/ para rol alumno', async () => {
    installFetchMock(() => ({
      id: 9,
      full_name: 'Camila',
      email: 'c@a.cl',
      plan_id: 2,
      plan_name: 'Base',
      status: 'activo',
      adherence_pct: 70,
      started_at: '2026-02-01',
      goals: 'Recomp',
      macros: { calories: 2100, protein_g: 140, carbs_g: 200, fat_g: 65, water_ml: 2800 },
    }))

    const { getMyStudent } = await import('./forja')
    const me = await getMyStudent()
    expect(me?.id).toBe('9')
  })

  it('training-plan con filtro ?student= (top-level, no anidado)', async () => {
    const { calls } = installFetchMock(() => ({
      results: [
        {
          id: 10,
          student: 1,
          title: 'Bloque',
          weeks: 4,
          days: [
            {
              id: 1,
              day_label: 'A',
              focus: 'Push',
              exercises: [{ name: 'Press', sets: 3, reps: '8', rest_sec: 90 }],
            },
          ],
        },
      ],
    }))

    const { getTrainingPlan } = await import('./forja')
    const plan = await getTrainingPlan('1')
    expect(plan?.title).toBe('Bloque')
    expect(calls[0]?.url).toBe(`${API}/forja/training-plan/?student=1`)
  })

  it('meals, water, workout-logs y check-ins usan ?student=', async () => {
    const { calls } = installFetchMock((call) => {
      if (call.url.includes('/meals/')) {
        return {
          results: [
            {
              id: 1,
              student: 1,
              date: '2026-10-16',
              meal: 'desayuno',
              description: 'Avena',
              calories: 400,
              protein_g: 20,
              carbs_g: 50,
              fat_g: 10,
            },
          ],
        }
      }
      if (call.url.includes('/water/')) {
        return { results: [{ id: 1, student: 1, date: '2026-10-16', ml: 500 }] }
      }
      if (call.url.includes('/workout-logs/')) {
        return {
          results: [
            {
              id: 1,
              student: 1,
              date: '2026-10-16',
              workout_day: 2,
              title: 'Día A',
              completed: true,
            },
          ],
        }
      }
      if (call.url.includes('/check-ins/')) {
        return {
          results: [
            {
              id: 1,
              student: 1,
              date: '2026-10-16',
              weight_kg: 70,
              energy: 4,
              sleep_hours: 7,
              adherence_ok: true,
            },
          ],
        }
      }
      return { results: [] }
    })

    const { listMeals, listWater, listWorkoutLogs, listCheckIns } = await import('./forja')
    expect((await listMeals('1'))[0]?.description).toBe('Avena')
    expect((await listWater('1'))[0]?.ml).toBe(500)
    expect((await listWorkoutLogs('1'))[0]?.title).toBe('Día A')
    expect((await listCheckIns('1'))[0]?.energy).toBe(4)

    const urls = calls.map((c) => c.url)
    expect(urls).toContain(`${API}/forja/meals/?student=1`)
    expect(urls).toContain(`${API}/forja/water/?student=1`)
    expect(urls).toContain(`${API}/forja/workout-logs/?student=1`)
    expect(urls).toContain(`${API}/forja/check-ins/?student=1`)
  })

  it('POST meals, water, workout-logs y messages', async () => {
    const { calls } = installFetchMock((call) => {
      if (call.url.includes('/meals/') && call.method === 'POST') {
        return {
          id: 99,
          student: 1,
          date: '2026-10-16',
          meal: 'cena',
          description: 'Pollo',
          calories: 500,
          protein_g: 40,
          carbs_g: 30,
          fat_g: 15,
        }
      }
      if (call.url.includes('/water/') && call.method === 'POST') {
        return { id: 98, student: 1, date: '2026-10-16', ml: 250 }
      }
      if (call.url.includes('/workout-logs/') && call.method === 'POST') {
        return {
          id: 97,
          student: 1,
          date: '2026-10-16',
          workout_day_id: 'wd-a',
          title: 'Día A — Empuje',
          completed: true,
        }
      }
      if (call.url.includes('/messages/') && call.method === 'POST') {
        return {
          id: 96,
          thread: 5,
          sender: 'coach',
          body: 'Hola',
          created_at: '2026-10-16T12:00:00Z',
        }
      }
      return {}
    })

    const { createMeal, logWater, completeWorkout, sendMessage } = await import('./forja')
    await createMeal({
      student_id: '1',
      date: '2026-10-16',
      meal: 'cena',
      description: 'Pollo',
      calories: 500,
      protein_g: 40,
      carbs_g: 30,
      fat_g: 15,
    })
    await logWater('1', 250)
    await completeWorkout({
      student_id: '1',
      date: '2026-10-16',
      workout_day_id: 'wd-a',
      title: 'Día A — Empuje',
      completed: true,
    })
    await sendMessage('5', 'Hola', 'coach')

    expect(calls.some((c) => c.method === 'POST' && c.url.endsWith('/forja/meals/'))).toBe(true)
    expect(calls.some((c) => c.method === 'POST' && c.url.endsWith('/forja/water/'))).toBe(true)
    expect(calls.some((c) => c.method === 'POST' && c.url.endsWith('/forja/workout-logs/'))).toBe(
      true,
    )
    expect(
      calls.some((c) => c.method === 'POST' && c.url.endsWith('/forja/threads/5/messages/')),
    ).toBe(true)
  })

  it('services, adherence toggle, threads y subscriptions', async () => {
    const { calls } = installFetchMock((call) => {
      if (call.url.includes('/services/')) {
        return {
          results: [
            {
              id: 1,
              name: 'Forja Base',
              description: 'Plan base',
              price_clp: 89000,
              billing: 'mensual',
              is_active: true,
              features: ['Chat'],
            },
          ],
        }
      }
      if (call.url.includes('/toggle/')) return {}
      if (call.url.includes('/adherence-rules/')) {
        return {
          results: [
            {
              id: 1,
              name: 'Entrenos',
              description: '3/sem',
              metric: 'entrenos',
              target_per_week: 3,
              enabled: true,
            },
          ],
        }
      }
      if (call.url.includes('/threads/') && !call.url.includes('/messages')) {
        return {
          results: [
            {
              id: 5,
              student: 1,
              student_name: 'Ana',
              unread: 1,
              last_message: 'Hola',
              updated_at: '2026-10-16T10:00:00Z',
            },
          ],
        }
      }
      if (call.url.includes('/subscriptions/') && call.method === 'GET') {
        return {
          results: [
            {
              id: 1,
              student: 1,
              student_name: 'Ana',
              plan: 1,
              plan_name: 'Base',
              amount_clp: 89000,
              status: 'activa',
              started_at: '2026-01-01',
            },
          ],
        }
      }
      if (call.url.includes('/subscriptions/') && call.method === 'POST') {
        return {
          id: 2,
          student: 1,
          student_name: 'Ana',
          plan_id: 1,
          plan_name: 'Base',
          amount_clp: 89000,
          status: 'pendiente',
          started_at: '2026-10-16',
          note: 'manual',
        }
      }
      return { results: [] }
    })

    const {
      listServices,
      listAdherenceRules,
      toggleAdherenceRule,
      listThreads,
      listSubscriptions,
      registerSubscription,
    } = await import('./forja')

    expect((await listServices())[0]?.name).toBe('Forja Base')
    expect((await listAdherenceRules())[0]?.metric).toBe('entrenos')
    await toggleAdherenceRule('1')
    expect((await listThreads())[0]?.id).toBe('5')
    expect((await listSubscriptions())[0]?.amount_clp).toBe(89000)
    await registerSubscription({
      student_id: '1',
      student_name: 'Ana',
      plan_id: '1',
      plan_name: 'Base',
      amount_clp: 89000,
      status: 'pendiente',
      started_at: '2026-10-16',
      note: 'manual',
    })

    expect(calls.some((c) => c.url.endsWith('/forja/services/'))).toBe(true)
    expect(calls.some((c) => c.url.endsWith('/forja/adherence-rules/1/toggle/') && c.method === 'POST')).toBe(
      true,
    )
    expect(calls.some((c) => c.url.endsWith('/forja/threads/'))).toBe(true)
    expect(calls.some((c) => c.method === 'POST' && c.url.endsWith('/forja/subscriptions/'))).toBe(
      true,
    )
  })

  it('en modo demo no llama a la API y usa datos locales', async () => {
    localStorage.setItem(DEMO_KEY, '1')
    const { fetchMock } = installFetchMock(() => {
      throw new Error('no debería llamar API en demo')
    })

    const { listStudents, listServices } = await import('./forja')
    const students = await listStudents()
    const services = await listServices()
    expect(students.length).toBeGreaterThan(0)
    expect(services[0]?.name).toMatch(/Forja/)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('modo demo — dominio completo', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(DEMO_KEY, '1')
    localStorage.setItem(TOKEN_KEY, 'demo-token-forja')
    vi.resetModules()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('cubre lecturas y escrituras del flujo coach/alumno', async () => {
    const forja = await import('./forja')

    expect(await forja.listStudents()).toHaveLength(3)
    expect(await forja.getTrainingPlan('stu-1')).not.toBeNull()
    expect((await forja.listMeals('stu-1')).length).toBeGreaterThan(0)
    expect((await forja.listWater('stu-1')).length).toBeGreaterThan(0)
    expect((await forja.listWorkoutLogs('stu-1')).length).toBeGreaterThan(0)
    expect((await forja.listCheckIns()).length).toBeGreaterThan(0)
    expect((await forja.listAdherenceRules()).length).toBeGreaterThan(0)
    expect((await forja.listThreads()).length).toBeGreaterThan(0)
    expect((await forja.listMessages('th-1')).length).toBeGreaterThan(0)
    expect((await forja.listServices()).length).toBeGreaterThan(0)
    expect((await forja.listSubscriptions()).length).toBeGreaterThan(0)

    const meal = await forja.createMeal({
      student_id: 'stu-1',
      date: '2026-10-16',
      meal: 'snack',
      description: 'Integración',
      calories: 200,
      protein_g: 15,
      carbs_g: 20,
      fat_g: 5,
    })
    expect(meal.id).toBeTruthy()

    const water = await forja.logWater('stu-1', 250)
    expect(water.ml).toBe(250)

    const workout = await forja.completeWorkout({
      student_id: 'stu-1',
      date: '2026-10-16',
      workout_day_id: 'wd-b',
      title: 'Día B — Tirón',
      completed: true,
    })
    expect(workout.completed).toBe(true)

    const msg = await forja.sendMessage('th-1', 'Integración OK', 'coach')
    expect(msg.body).toBe('Integración OK')

    const rules = await forja.toggleAdherenceRule('rule-1')
    expect(rules.find((r) => r.id === 'rule-1')).toBeTruthy()

    const sub = await forja.registerSubscription({
      student_id: 'stu-3',
      student_name: 'Valentina Pérez',
      plan_id: 'plan-base',
      plan_name: 'Forja Base',
      amount_clp: 89000,
      status: 'pendiente',
      started_at: '2026-10-16',
      note: 'test',
    })
    expect(sub.student_id).toBe('stu-3')
  })
})
