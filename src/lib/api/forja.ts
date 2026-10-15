import { apiList, apiRequest, withDemoFallback } from './client'
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

export async function listServices(): Promise<ServicePlan[]> {
  const { data } = await withDemoFallback(
    () => apiList<ServicePlan>(`${PREFIX}/services/`),
    () => demoPlans,
  )
  return data
}

export async function listStudents(): Promise<Student[]> {
  const { data } = await withDemoFallback(
    () => apiList<Student>(`${PREFIX}/students/`),
    () => demoStudents,
  )
  return data
}

export async function getStudent(id: string): Promise<Student | undefined> {
  const { data } = await withDemoFallback(
    () => apiRequest<Student>(`${PREFIX}/students/${id}/`),
    () => demoStudents.find((s) => s.id === id),
  )
  return data
}

export async function getTrainingPlan(studentId: string): Promise<TrainingPlan | null> {
  const { data } = await withDemoFallback(
    () => apiRequest<TrainingPlan>(`${PREFIX}/students/${studentId}/training-plan/`),
    () => (demoTraining.student_id === studentId || studentId === 'stu-1' ? demoTraining : null),
  )
  return data
}

export async function listMeals(studentId: string): Promise<MealLog[]> {
  const { data } = await withDemoFallback(
    () => apiList<MealLog>(`${PREFIX}/students/${studentId}/meals/`),
    () => demoMeals.filter((m) => m.student_id === studentId),
  )
  return data
}

export async function createMeal(payload: Omit<MealLog, 'id'>): Promise<MealLog> {
  const { data } = await withDemoFallback(
    () =>
      apiRequest<MealLog>(`${PREFIX}/students/${payload.student_id}/meals/`, {
        method: 'POST',
        body: payload,
      }),
    () => addMeal(payload),
  )
  return data
}

export async function listWater(studentId: string): Promise<WaterLog[]> {
  const { data } = await withDemoFallback(
    () => apiList<WaterLog>(`${PREFIX}/students/${studentId}/water/`),
    () => demoWater.filter((w) => w.student_id === studentId),
  )
  return data
}

export async function logWater(studentId: string, ml: number): Promise<WaterLog> {
  const { data } = await withDemoFallback(
    () =>
      apiRequest<WaterLog>(`${PREFIX}/students/${studentId}/water/`, {
        method: 'POST',
        body: { ml },
      }),
    () => addWater(studentId, ml),
  )
  return data
}

export async function listWorkoutLogs(studentId: string): Promise<WorkoutLog[]> {
  const { data } = await withDemoFallback(
    () => apiList<WorkoutLog>(`${PREFIX}/students/${studentId}/workout-logs/`),
    () => demoWorkouts.filter((w) => w.student_id === studentId),
  )
  return data
}

export async function completeWorkout(payload: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> {
  const { data } = await withDemoFallback(
    () =>
      apiRequest<WorkoutLog>(`${PREFIX}/students/${payload.student_id}/workout-logs/`, {
        method: 'POST',
        body: payload,
      }),
    () => addWorkoutLog(payload),
  )
  return data
}

export async function listCheckIns(studentId?: string): Promise<CheckIn[]> {
  const { data } = await withDemoFallback(
    () =>
      apiList<CheckIn>(
        studentId ? `${PREFIX}/students/${studentId}/check-ins/` : `${PREFIX}/check-ins/`,
      ),
    () => (studentId ? demoCheckIns.filter((c) => c.student_id === studentId) : demoCheckIns),
  )
  return data
}

export async function listAdherenceRules(): Promise<AdherenceRule[]> {
  const { data } = await withDemoFallback(
    () => apiList<AdherenceRule>(`${PREFIX}/adherence-rules/`),
    () => demoRules,
  )
  return data
}

export async function toggleAdherenceRule(id: string): Promise<AdherenceRule[]> {
  const { data } = await withDemoFallback(
    async () => {
      await apiRequest(`${PREFIX}/adherence-rules/${id}/toggle/`, { method: 'POST' })
      return apiList<AdherenceRule>(`${PREFIX}/adherence-rules/`)
    },
    () => toggleRule(id),
  )
  return data
}

export async function listThreads(): Promise<ChatThread[]> {
  const { data } = await withDemoFallback(
    () => apiList<ChatThread>(`${PREFIX}/threads/`),
    () => demoThreads,
  )
  return data
}

export async function listMessages(threadId: string): Promise<ChatMessage[]> {
  const { data } = await withDemoFallback(
    () => apiList<ChatMessage>(`${PREFIX}/threads/${threadId}/messages/`),
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
    () =>
      apiRequest<ChatMessage>(`${PREFIX}/threads/${threadId}/messages/`, {
        method: 'POST',
        body: { body },
      }),
    () => pushMessage(threadId, sender, body),
  )
  return data
}

/**
 * SSE de mensajería (mismo patrón que 90 Días / apps hermanas).
 * En demo emite un evento local periódico; en live apunta a /forja/threads/:id/events/.
 */
export function subscribeThreadEvents(
  threadId: string,
  onMessage: (msg: ChatMessage) => void,
): () => void {
  const base = (import.meta.env.VITE_YGGDRA_API_BASE as string | undefined) ?? 'https://api.yggdra.cl/api'
  const token = localStorage.getItem('forja.token')
  const branch = localStorage.getItem('forja.branch_id')
  const demo = localStorage.getItem('forja.demo') === '1'

  if (demo || !token) {
    const timer = window.setInterval(() => {
      /* heartbeat demo — sin spam de mensajes */
    }, 15_000)
    return () => window.clearInterval(timer)
  }

  const url = new URL(`${base.replace(/\/$/, '')}/${PREFIX}/threads/${threadId}/events/`)
  if (branch) url.searchParams.set('branch_id', branch)

  const es = new EventSource(url.toString())
  es.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data) as ChatMessage
      onMessage(msg)
    } catch {
      /* ignore malformed */
    }
  }
  return () => es.close()
}

export async function listSubscriptions(): Promise<SubscriptionRecord[]> {
  const { data } = await withDemoFallback(
    () => apiList<SubscriptionRecord>(`${PREFIX}/subscriptions/`),
    () => demoSubs,
  )
  return data
}

export async function registerSubscription(
  payload: Omit<SubscriptionRecord, 'id'>,
): Promise<SubscriptionRecord> {
  const { data } = await withDemoFallback(
    () =>
      apiRequest<SubscriptionRecord>(`${PREFIX}/subscriptions/`, {
        method: 'POST',
        body: payload,
      }),
    () => addSubscription(payload),
  )
  return data
}
