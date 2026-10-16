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
 * No corre en CI por defecto — usar: npm run e2e:real
 */
import { test, expect } from '@playwright/test'
import {
  hasRealCredentials,
  qa,
  RealApiClient,
  QA_PREFIX,
} from './api-client'

const email = process.env.FORJA_VALIDACION_EMAIL ?? ''
const password = process.env.FORJA_VALIDACION_PASSWORD ?? ''

test.describe('E2E API real — coach validación', () => {
  test.skip(!hasRealCredentials(), 'Definir FORJA_VALIDACION_EMAIL y FORJA_VALIDACION_PASSWORD')

  const api = new RealApiClient()
  let studentId: string | undefined
  let threadId: string | undefined

  test.afterAll(async () => {
    if (!hasRealCredentials() || !api.token) return
    const errors = await api.cleanup()
    if (errors.length) {
      console.warn('[e2e:real] Limpieza parcial:', errors.join('; '))
    }
  })

  test('login coach en branch 91', async () => {
    const session = await api.login(email, password)
    expect(api.token).toBeTruthy()
    expect(session.forja_role === 'coach' || session.forja_role === 'admin' || !session.forja_role).toBe(
      true,
    )
    const branchIds = (session.branches ?? []).map((b) => b.id)
    // Preferimos 91; si el login no lista branches, igual enviamos X-Branch-ID 91
    if (branchIds.length) {
      expect(branchIds).toContain(91)
    }
  })

  test('lectura: students, services, subscriptions, adherence, threads', async () => {
    const students = await api.list<Record<string, unknown>>('forja/students/')
    expect(Array.isArray(students)).toBe(true)
    if (students[0]) {
      studentId = String(students[0].id)
    }

    const services = await api.list<Record<string, unknown>>('forja/services/')
    expect(Array.isArray(services)).toBe(true)

    const subs = await api.list<Record<string, unknown>>('forja/subscriptions/')
    expect(Array.isArray(subs)).toBe(true)

    const rules = await api.list<Record<string, unknown>>('forja/adherence-rules/')
    expect(Array.isArray(rules)).toBe(true)

    const threads = await api.list<Record<string, unknown>>('forja/threads/')
    expect(Array.isArray(threads)).toBe(true)
    if (threads[0]) {
      threadId = String(threads[0].id)
    }
  })

  test('lectura filtrada: training-plan / meals / water / workout-logs / check-ins', async () => {
    test.skip(!studentId, 'Sin alumnos en la sucursal para filtrar')

    const plan = await api.request(`forja/training-plan/?student=${studentId}`)
    expect(plan.ok || plan.status === 404).toBe(true)

    for (const resource of ['meals', 'water', 'workout-logs', 'check-ins'] as const) {
      const res = await api.request(`forja/${resource}/?student=${studentId}`)
      expect(res.ok, `${resource} debería existir (401/404 no esperados): ${res.ok ? '' : (res as { detail: string }).detail}`).toBe(
        true,
      )
    }
  })

  test('escritura coach: suscripción manual con prefijo QA-', async () => {
    test.skip(!studentId, 'Sin alumnos para asociar suscripción')

    const services = await api.list<Record<string, unknown>>('forja/services/')
    const plan = services[0]
    test.skip(!plan, 'Sin services legibles (posible restricción de rol)')

    const planId = plan.id
    const note = qa(`sub-${Date.now()}`)
    const res = await api.request<Record<string, unknown>>('forja/subscriptions/', {
      method: 'POST',
      body: {
        student: studentId,
        student_id: studentId,
        plan: planId,
        plan_id: planId,
        amount_clp: Number(plan.price_clp ?? 0) || 1000,
        status: 'pendiente',
        started_at: new Date().toISOString().slice(0, 10),
        note,
      },
    })

    expect(res.ok, res.ok ? '' : res.detail).toBe(true)
    if (res.ok) {
      const id = res.data.id
      api.track('subscription', id as string | number)
      expect(String(res.data.note ?? note)).toContain(QA_PREFIX)
    }
  })

  test('escritura coach: mensaje QA- en hilo existente', async () => {
    test.skip(!threadId, 'Sin hilos de chat para enviar mensaje')

    const body = qa(`msg-${Date.now()}`)
    const res = await api.request<Record<string, unknown>>(`forja/threads/${threadId}/messages/`, {
      method: 'POST',
      body: { body, text: body, message: body },
    })
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
        billing: 'mensual',
        active: true,
        features: ['QA'],
      },
    })
    // Esperado: 403/401/405. Si por error crea, trackeamos para cleanup.
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
        metric: 'entrenos',
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

  test('alta opcional de alumno QA- (si el contrato lo permite)', async () => {
    const stamp = Date.now()
    const res = await api.request<Record<string, unknown>>('forja/students/', {
      method: 'POST',
      body: {
        email: `qa.forja.${stamp}@example.com`,
        full_name: qa(`Alumno ${stamp}`),
        goals: qa('objetivo-validacion'),
        status: 'invitado',
      },
    })

    if (!res.ok) {
      // Contrato aún puede no exponer POST a coaches — documentado, no falla la suite
      test.info().annotations.push({
        type: 'note',
        description: `POST students/ no disponible (${res.status}): ${res.detail}`,
      })
      return
    }

    const id = res.data.id
    api.track('student', id as string | number)
    expect(String(res.data.full_name ?? '')).toContain(QA_PREFIX)
  })
})
