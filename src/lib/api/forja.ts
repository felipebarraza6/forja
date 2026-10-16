import { API_BASE, apiList, apiRequest, getBranchId, getToken, isDemoMode, qs, withDemoFallback } from './client'
import {
  addMeal,
  addSubscription,
  addWater,
  addWorkoutLog,
  demoCheckIns,
  demoMeals,
  demoPlans,
  demoRules,
  demoStudents,
  demoSubs,
  demoThreads,
  demoTraining,
  demoMessages,
  demoWater,
  demoWorkouts,
  pushMessage,
  toggleRule,
} from './demo'
import {
  asRecord,
  normalizeCheckIn,
  normalizeMeal,
  normalizeMessage,
  normalizeRule,
  normalizeService,
  normalizeStudent,
  normalizeSubscription,
  normalizeThread,
  normalizeTrainingPlan,
  normalizeWater,
  normalizeWorkoutLog,
} from './normalize'
import type {
  AdherenceRule,
  ChatMessage,
  ChatThread,
  CheckIn,
  MealLog,
  ServicePlan,
  Student,
  SubscriptionRecord,
  TrainingPlan,
  WaterLog,
  WorkoutLog,
} from './types'

const PREFIX = 'forja'

async function listNormalized<T>(
  path: string,
  normalize: (raw: Record<string, unknown>) => T,
): Promise<T[]> {
  const rows = await apiList<Record<string, unknown>>(path)
  return rows.map((r) => normalize(asRecord(r)))
}

export async function listServices(): Promise<ServicePlan[]> {
  const { data } = await withDemoFallback(
    () => listNormalized(`${PREFIX}/services/`, normalizeService),
    () => demoPlans,
  )
  return data
}

export async function listStudents(): Promise<Student[]> {
  const { data } = await withDemoFallback(
    () => listNormalized(`${PREFIX}/students/`, normalizeStudent),
    () => demoStudents,
  )
  return data
}

/** Alumno autenticado: GET /forja/students/me/ */
export async function getMyStudent(): Promise<Student | undefined> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(`${PREFIX}/students/me/`)
      return normalizeStudent(asRecord(raw))
    },
    () => demoStudents[0],
  )
  return data
}

export async function getStudent(id: string): Promise<Student | undefined> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(`${PREFIX}/students/${id}/`)
      return normalizeStudent(asRecord(raw))
    },
    () => demoStudents.find((s) => s.id === id),
  )
  return data
}

/**
 * Plan de entrenamiento del alumno.
 * API real: GET /forja/training-plan/?student=<id> (lista o detalle).
 */
export async function getTrainingPlan(studentId: string): Promise<TrainingPlan | null> {
  const { data } = await withDemoFallback(
    async () => {
      const path = `${PREFIX}/training-plan/${qs({ student: studentId })}`
      const raw = await apiRequest<Record<string, unknown> | Record<string, unknown>[]>(path)
      if (Array.isArray(raw)) {
        const first = raw[0]
        return first ? normalizeTrainingPlan(asRecord(first)) : null
      }
      if (raw && typeof raw === 'object' && Array.isArray((raw as { results?: unknown }).results)) {
        const results = (raw as { results: Record<string, unknown>[] }).results
        return results[0] ? normalizeTrainingPlan(asRecord(results[0])) : null
      }
      return normalizeTrainingPlan(asRecord(raw))
    },
    () => (demoTraining.student_id === studentId || studentId === 'stu-1' ? demoTraining : null),
  )
  return data
}

export async function listMeals(studentId: string): Promise<MealLog[]> {
  const { data } = await withDemoFallback(
    () => listNormalized(`${PREFIX}/meals/${qs({ student: studentId })}`, normalizeMeal),
    () => demoMeals.filter((m) => m.student_id === studentId),
  )
  return data
}

export async function createMeal(payload: Omit<MealLog, 'id'>): Promise<MealLog> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(`${PREFIX}/meals/`, {
        method: 'POST',
        body: {
          student: payload.student_id,
          student_id: payload.student_id,
          date: payload.date,
          meal: payload.meal,
          description: payload.description,
          calories: payload.calories,
          protein_g: payload.protein_g,
          carbs_g: payload.carbs_g,
          fat_g: payload.fat_g,
        },
      })
      return normalizeMeal(asRecord(raw))
    },
    () => addMeal(payload),
  )
  return data
}

export async function listWater(studentId: string): Promise<WaterLog[]> {
  const { data } = await withDemoFallback(
    () => listNormalized(`${PREFIX}/water/${qs({ student: studentId })}`, normalizeWater),
    () => demoWater.filter((w) => w.student_id === studentId),
  )
  return data
}

export async function logWater(studentId: string, ml: number): Promise<WaterLog> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(`${PREFIX}/water/`, {
        method: 'POST',
        body: {
          student: studentId,
          student_id: studentId,
          ml,
          date: new Date().toISOString().slice(0, 10),
        },
      })
      return normalizeWater(asRecord(raw))
    },
    () => addWater(studentId, ml),
  )
  return data
}

export async function listWorkoutLogs(studentId: string): Promise<WorkoutLog[]> {
  const { data } = await withDemoFallback(
    () =>
      listNormalized(`${PREFIX}/workout-logs/${qs({ student: studentId })}`, normalizeWorkoutLog),
    () => demoWorkouts.filter((w) => w.student_id === studentId),
  )
  return data
}

export async function completeWorkout(payload: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(`${PREFIX}/workout-logs/`, {
        method: 'POST',
        body: {
          student: payload.student_id,
          student_id: payload.student_id,
          date: payload.date,
          workout_day: payload.workout_day_id,
          workout_day_id: payload.workout_day_id,
          title: payload.title,
          completed: payload.completed,
          notes: payload.notes,
        },
      })
      return normalizeWorkoutLog(asRecord(raw))
    },
    () => addWorkoutLog(payload),
  )
  return data
}

export async function listCheckIns(studentId?: string): Promise<CheckIn[]> {
  const { data } = await withDemoFallback(
    () =>
      listNormalized(
        `${PREFIX}/check-ins/${qs({ student: studentId })}`,
        normalizeCheckIn,
      ),
    () => (studentId ? demoCheckIns.filter((c) => c.student_id === studentId) : demoCheckIns),
  )
  return data
}

export async function listAdherenceRules(): Promise<AdherenceRule[]> {
  const { data } = await withDemoFallback(
    () => listNormalized(`${PREFIX}/adherence-rules/`, normalizeRule),
    () => demoRules,
  )
  return data
}

export async function toggleAdherenceRule(id: string): Promise<AdherenceRule[]> {
  const { data } = await withDemoFallback(
    async () => {
      await apiRequest(`${PREFIX}/adherence-rules/${id}/toggle/`, { method: 'POST' })
      return listNormalized(`${PREFIX}/adherence-rules/`, normalizeRule)
    },
    () => toggleRule(id),
  )
  return data
}

export async function listThreads(): Promise<ChatThread[]> {
  const { data } = await withDemoFallback(
    () => listNormalized(`${PREFIX}/threads/`, normalizeThread),
    () => demoThreads,
  )
  return data
}

export async function listMessages(threadId: string): Promise<ChatMessage[]> {
  const { data } = await withDemoFallback(
    () => listNormalized(`${PREFIX}/threads/${threadId}/messages/`, normalizeMessage),
    () => demoMessages[threadId] ?? [],
  )
  return data
}

export async function sendMessage(
  threadId: string,
  body: string,
  sender: 'coach' | 'alumno',
): Promise<ChatMessage> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(
        `${PREFIX}/threads/${threadId}/messages/`,
        {
          method: 'POST',
          body: { body, text: body, message: body },
        },
      )
      return normalizeMessage(asRecord(raw))
    },
    () => pushMessage(threadId, sender, body),
  )
  return data
}

/**
 * SSE de hilos. EventSource no permite Authorization → usamos fetch+stream
 * con Token + X-Branch-ID. Si el backend exige otro esquema (query token),
 * documentarlo en docs/contract-gaps.md.
 */
export function subscribeThreadEvents(
  threadId: string,
  onMessage: (msg: ChatMessage) => void,
): () => void {
  if (isDemoMode()) {
    const timer = window.setInterval(() => {}, 15_000)
    return () => window.clearInterval(timer)
  }

  const token = getToken()
  const branch = getBranchId()
  if (!token) return () => {}

  const url = `${API_BASE.replace(/\/$/, '')}/${PREFIX}/threads/${threadId}/events/`
  const controller = new AbortController()

  void (async () => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Token ${token}`,
          ...(branch ? { 'X-Branch-ID': branch } : {}),
        },
        signal: controller.signal,
      })
      if (!res.ok || !res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const dataLine = part
            .split('\n')
            .find((l) => l.startsWith('data:'))
          if (!dataLine) continue
          const json = dataLine.replace(/^data:\s?/, '')
          try {
            onMessage(normalizeMessage(asRecord(JSON.parse(json))))
          } catch {
            /* ignore malformed */
          }
        }
      }
    } catch {
      /* aborted / network */
    }
  })()

  return () => controller.abort()
}

export async function listSubscriptions(): Promise<SubscriptionRecord[]> {
  const { data } = await withDemoFallback(
    () => listNormalized(`${PREFIX}/subscriptions/`, normalizeSubscription),
    () => demoSubs,
  )
  return data
}

export async function registerSubscription(
  payload: Omit<SubscriptionRecord, 'id'>,
): Promise<SubscriptionRecord> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(`${PREFIX}/subscriptions/`, {
        method: 'POST',
        body: {
          student: payload.student_id,
          student_id: payload.student_id,
          plan: payload.plan_id,
          plan_id: payload.plan_id,
          amount_clp: payload.amount_clp,
          status: payload.status,
          started_at: payload.started_at,
          note: payload.note,
        },
      })
      return normalizeSubscription(asRecord(raw))
    },
    () => addSubscription(payload),
  )
  return data
}
