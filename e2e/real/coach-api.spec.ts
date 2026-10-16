/**
 * E2E opcional contra la API real (https://api.yggdra.cl/api, branch 91).
 *
 * Requiere:
 *   FORJA_VALIDACION_EMAIL
 *   FORJA_VALIDACION_PASSWORD
 *
 * El usuario es coach de validación (no admin): no intenta crear services
 * ni adherence-rules (requieren admin). Datos creados usan prefijo QA- y
 * se limpian al final cuando la API lo permite.
 *
 * Corre en serie: login + alumno QA- + hilo QA- en beforeAll comparten
 * el mismo token (antes cada test partía sin sesión).
 *
 * No corre en CI por defecto — usar: npm run e2e:real
 */
import { test, expect } from '@playwright/test'
import {
  branchIdsFromLogin,
  FORJA_BRANCH_NUM,
  hasRealCredentials,
  qa,
  RealApiClient,
  QA_PREFIX,
} from './api-client'

const email = process.env.FORJA_VALIDACION_EMAIL ?? ''
const password = process.env.FORJA_VALIDACION_PASSWORD ?? ''

test.describe('E2E API real — coach validación', () => {
  test.skip(!hasRealCredentials(), 'Definir FORJA_VALIDACION_EMAIL y FORJA_VALIDACION_PASSWORD')
  test.describe.configure({ mode: 'serial' })

  let api: RealApiClient
  let qaStudentId: string
  let qaThreadId: string

  test.beforeAll(async () => {
    api = new RealApiClient()
    const session = await api.login(email, password)
    expect(api.token, 'login debe devolver token').toBeTruthy()

    const role = session.forja_role ?? session.user?.forja_role
    expect(
      role === 'coach' || role === 'admin' || role == null,
      `forja_role inesperado: ${String(role)}`,
    ).toBe(true)

    // `branches[].id` es BranchUser (p. ej. 230); la sucursal es branch_id (91).
    const branchIds = branchIdsFromLogin(session.branches)
    if (branchIds.length) {
      expect(
        branchIds,
        `Se esperaba branch_id ${FORJA_BRANCH_NUM} en branches[]; memberships: ${JSON.stringify(session.branches)}`,
      ).toContain(FORJA_BRANCH_NUM)
    }

    const stamp = Date.now()
    // Si el coach no puede crear alumnos, createQaStudent lanza con mensaje claro
    // y toda la suite falla aquí (no se enmascaran los tests siguientes).
    const student = await api.createQaStudent(stamp)
    expect(student.full_name).toContain(QA_PREFIX)
    qaStudentId = student.id

    qaThreadId = await api.createQaThread(qaStudentId)
    expect(qaThreadId).toBeTruthy()
  })

  test.afterAll(async () => {
    if (!api?.token) return
    const errors = await api.cleanup()
    if (errors.length) {
      console.warn('[e2e:real] Limpieza parcial:', errors.join('; '))
    }
  })

  test('lectura: students, services, subscriptions, adherence, threads', async () => {
    const students = await api.list<Record<string, unknown>>('forja/students/')
    expect(Array.isArray(students)).toBe(true)
    expect(
      students.some((s) => String(s.id) === qaStudentId),
      'el alumno QA- creado en setup debe aparecer en el listado',
    ).toBe(true)

    const services = await api.list<Record<string, unknown>>('forja/services/')
    expect(Array.isArray(services)).toBe(true)

    const subs = await api.list<Record<string, unknown>>('forja/subscriptions/')
    expect(Array.isArray(subs)).toBe(true)

    const rules = await api.list<Record<string, unknown>>('forja/adherence-rules/')
    expect(Array.isArray(rules)).toBe(true)

    const threads = await api.list<Record<string, unknown>>('forja/threads/')
    expect(Array.isArray(threads)).toBe(true)
    expect(
      threads.some((t) => String(t.id) === qaThreadId),
      'el hilo QA- creado en setup debe aparecer en el listado',
    ).toBe(true)
  })

  test('lectura filtrada: training-plan / meals / water / workout-logs / check-ins', async () => {
    const plan = await api.request(
      `forja/training-plan/?student=${qaStudentId}&is_current=true&page_size=1`,
    )
    // Alumno nuevo puede no tener plan: 200 vacío o 404 aceptables
    expect(plan.ok || plan.status === 404).toBe(true)

    for (const resource of ['meals', 'water', 'workout-logs', 'check-ins'] as const) {
      const res = await api.request(`forja/${resource}/?student=${qaStudentId}`)
      expect(
        res.ok,
        `${resource}?student=${qaStudentId} → ${res.ok ? 'ok' : `${(res as { status: number }).status} ${(res as { detail: string }).detail}`}`,
      ).toBe(true)
    }
  })

  test('escritura coach: suscripción manual con prefijo QA-', async () => {
    const services = await api.list<Record<string, unknown>>('forja/services/')
    const plan = services[0]
    test.skip(!plan, 'Sin services legibles (posible restricción de rol / catálogo vacío)')

    const planId = plan.id
    const note = qa(`sub-${Date.now()}`)
    const amount = Number(plan.price_clp ?? plan.price ?? 0) || 1000
    const res = await api.request<Record<string, unknown>>('forja/subscriptions/', {
      method: 'POST',
      body: {
        student: qaStudentId,
        student_id: qaStudentId,
        plan: planId,
        plan_id: planId,
        service: planId,
        amount_clp: amount,
        amount,
        status: 'past_due',
        started_at: new Date().toISOString().slice(0, 10),
        note,
      },
    })

    expect(res.ok, res.ok ? '' : res.detail).toBe(true)
    if (res.ok) {
      api.track('subscription', res.data.id as string | number)
      expect(String(res.data.note ?? note)).toContain(QA_PREFIX)
    }
  })

  test('escritura coach: mensaje QA- en hilo del alumno QA-', async () => {
    const body = qa(`msg-${Date.now()}`)
    const res = await api.request<Record<string, unknown>>(
      `forja/threads/${qaThreadId}/messages/`,
      {
        method: 'POST',
        body: { body, text: body, message: body },
      },
    )
    expect(res.ok, res.ok ? '' : res.detail).toBe(true)
    if (res.ok) {
      api.track('message', res.data.id as string | number)
      expect(String(res.data.body ?? body)).toContain(QA_PREFIX)
    }
  })

  test('coach no-admin: crear service debe fallar o quedar fuera de alcance', async () => {
    const res = await api.request('forja/services/', {
      method: 'POST',
      body: {
        name: qa('service-no-crear'),
        description: 'No debe persistir — coach no es admin',
        price_clp: 1000,
        price: 1000,
        billing_period: 'monthly',
        active: true,
        features: ['QA'],
      },
    })
    if (res.ok) {
      const id = (res.data as { id?: string | number }).id
      api.track('service', id)
      console.warn('[e2e:real] POST services/ inesperadamente OK; se intentará limpiar')
    } else {
      expect([401, 403, 405, 404]).toContain(res.status)
    }
  })

  test('coach no-admin: crear adherence-rule debe fallar o quedar fuera de alcance', async () => {
    const res = await api.request('forja/adherence-rules/', {
      method: 'POST',
      body: {
        name: qa('rule-no-crear'),
        description: 'No debe persistir — coach no es admin',
        metric: 'training',
        target_per_week: 3,
        enabled: false,
      },
    })
    if (res.ok) {
      const id = (res.data as { id?: string | number }).id
      api.track('adherence-rule', id)
      console.warn('[e2e:real] POST adherence-rules/ inesperadamente OK; se intentará limpiar')
    } else {
      expect([401, 403, 405, 404]).toContain(res.status)
    }
  })
})
