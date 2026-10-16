import { API_BASE, apiList, apiRequest, isDemoMode, qs, withDemoFallback } from './client'
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
  StreamTokenResponse,
  Student,
  StudentMacrosPatch,
  SubscriptionRecord,
  TrainingPlan,
  WaterLog,
  WeeklyAdherence,
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

export async function listStudents(filters?: {
  status?: string
  service?: string
}): Promise<Student[]> {
  const { data } = await withDemoFallback(
    () =>
      listNormalized(
        `${PREFIX}/students/${qs({ status: filters?.status, service: filters?.service })}`,
        normalizeStudent,
      ),
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

/** PATCH /forja/students/{id}/macros/ */
export async function patchStudentMacros(
  id: string,
  macros: StudentMacrosPatch,
): Promise<Student> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(`${PREFIX}/students/${id}/macros/`, {
        method: 'PATCH',
        body: macros,
      })
      return normalizeStudent(asRecord(raw))
    },
    () => {
      const s = demoStudents.find((d) => d.id === id) ?? demoStudents[0]
      return {
        ...s,
        goals: macros.goal ?? s.goals,
        macros: {
          calories: macros.calories_target ?? s.macros.calories,
          protein_g: macros.protein_target ?? s.macros.protein_g,
          carbs_g: macros.carbs_target ?? s.macros.carbs_g,
          fat_g: macros.fats_target ?? s.macros.fat_g,
          water_ml: macros.water_target_ml ?? s.macros.water_ml,
        },
      }
    },
  )
  return data
}

/** PATCH /forja/students/{id}/status/ */
export async function patchStudentStatus(id: string, status: string): Promise<Student> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(`${PREFIX}/students/${id}/status/`, {
        method: 'PATCH',
        body: { status },
      })
      return normalizeStudent(asRecord(raw))
    },
    () => {
      const s = demoStudents.find((d) => d.id === id) ?? demoStudents[0]
      return { ...s, status: status as Student['status'] }
    },
  )
  return data
}

/**
 * Plan vigente del alumno.
 * GET /forja/training-plan/?student=<id>&is_current=true → lista paginada, results[0].
 */
export async function getTrainingPlan(studentId: string): Promise<TrainingPlan | null> {
  const { data } = await withDemoFallback(
    async () => {
      const path = `${PREFIX}/training-plan/${qs({
        student: studentId,
        is_current: 'true',
        page_size: 1,
      })}`
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

export async function listMeals(
  studentId: string,
  filters?: { logged_on?: string; meal_type?: string },
): Promise<MealLog[]> {
  const { data } = await withDemoFallback(
    () =>
      listNormalized(
        `${PREFIX}/meals/${qs({
          student: studentId,
          logged_on: filters?.logged_on,
          meal_type: filters?.meal_type,
        })}`,
        normalizeMeal,
      ),
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
          logged_on: payload.date,
          meal_type: payload.meal,
          description: payload.description,
          calories: payload.calories,
          protein: payload.protein_g,
          carbs: payload.carbs_g,
          fats: payload.fat_g,
          notes: payload.notes,
        },
      })
      return normalizeMeal(asRecord(raw))
    },
    () => addMeal(payload),
  )
  return data
}

export async function listWater(
  studentId: string,
  filters?: { logged_on?: string },
): Promise<WaterLog[]> {
  const { data } = await withDemoFallback(
    () =>
      listNormalized(
        `${PREFIX}/water/${qs({ student: studentId, logged_on: filters?.logged_on })}`,
        normalizeWater,
      ),
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
          ml,
          logged_on: new Date().toISOString().slice(0, 10),
        },
      })
      return normalizeWater(asRecord(raw))
    },
    () => addWater(studentId, ml),
  )
  return data
}

export async function listWorkoutLogs(
  studentId: string,
  filters?: { performed_on?: string; completed?: boolean },
): Promise<WorkoutLog[]> {
  const { data } = await withDemoFallback(
    () =>
      listNormalized(
        `${PREFIX}/workout-logs/${qs({
          student: studentId,
          performed_on: filters?.performed_on,
          completed:
            filters?.completed === undefined ? undefined : filters.completed ? 'true' : 'false',
        })}`,
        normalizeWorkoutLog,
      ),
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
          performed_on: payload.date,
          workout_day: payload.workout_day_id,
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

export async function listCheckIns(
  studentId?: string,
  filters?: { checked_on?: string },
): Promise<CheckIn[]> {
  const { data } = await withDemoFallback(
    () =>
      listNormalized(
        `${PREFIX}/check-ins/${qs({
          student: studentId,
          checked_on: filters?.checked_on,
        })}`,
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

/** GET /forja/students/{id}/adherence/weekly/?week_start= */
export async function getStudentWeeklyAdherence(
  studentId: string,
  weekStart: string,
): Promise<WeeklyAdherence> {
  const { data } = await withDemoFallback(
    async () => {
      const raw = await apiRequest<Record<string, unknown>>(
        `${PREFIX}/students/${studentId}/adherence/weekly/${qs({ week_start: weekStart })}`,
      )
      return {
        student_id: studentId,
        week_start: weekStart,
        raw: asRecord(raw),
      }
    },
    () => ({ student_id: studentId, week_start: weekStart, raw: { demo: true } }),
  )
  return data
}

/** GET /forja/adherence/weekly/ (vista coach). */
export async function getWeeklyAdherence(weekStart?: string): Promise<WeeklyAdherence[]> {
  const { data } = await withDemoFallback(
    async () => {
      const rows = await apiList<Record<string, unknown>>(
        `${PREFIX}/adherence/weekly/${qs({ week_start: weekStart })}`,
      )
      return rows.map((r) => {
        const rec = asRecord(r)
        return {
          student_id: idStrSafe(rec.student_id ?? rec.student),
          week_start: String(rec.week_start ?? weekStart ?? ''),
          raw: rec,
        }
      })
    },
    () => [],
  )
  return data
}

function idStrSafe(value: unknown): string {
  return value == null ? '' : String(value)
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
          body: { body },
        },
      )
      return normalizeMessage(asRecord(raw))
    },
    () => pushMessage(threadId, sender, body),
  )
  return data
}

async function fetchStreamToken(threadId: string): Promise<StreamTokenResponse> {
  return apiRequest<StreamTokenResponse>(`${PREFIX}/threads/${threadId}/stream-token/`, {
    method: 'POST',
    body: {},
  })
}

/**
 * SSE de hilos (contrato Yggdra):
 * 1) POST /forja/threads/{id}/stream-token/ → {stream_token, expires_in, stream_path}
 * 2) EventSource(stream_path?stream_token=…&after_id=…)
 * Renueva el token antes de expires_in (120s).
 */
export function subscribeThreadEvents(
  threadId: string,
  onMessage: (msg: ChatMessage) => void,
): () => void {
  if (isDemoMode()) {
    const timer = window.setInterval(() => {}, 15_000)
    return () => window.clearInterval(timer)
  }

  let closed = false
  let es: EventSource | null = null
  let renewTimer = 0
  let lastId: string | undefined

  const cleanupEs = () => {
    if (es) {
      es.close()
      es = null
    }
    if (renewTimer) {
      window.clearTimeout(renewTimer)
      renewTimer = 0
    }
  }

  const connect = async () => {
    if (closed) return
    try {
      const tokenRes = await fetchStreamToken(threadId)
      if (closed) return

      const basePath = (tokenRes.stream_path || `/${PREFIX}/threads/${threadId}/events/`).replace(
        /^\//,
        '',
      )
      // stream_path puede venir como /api/forja/… o forja/…
      const path = basePath.replace(/^api\//, '')
      const url = `${API_BASE.replace(/\/$/, '')}/${path}${qs({
        stream_token: tokenRes.stream_token,
        after_id: lastId,
      })}`

      cleanupEs()
      es = new EventSource(url)

      es.onmessage = (ev) => {
        try {
          const msg = normalizeMessage(asRecord(JSON.parse(ev.data)))
          if (msg.id) lastId = msg.id
          onMessage(msg)
        } catch {
          /* ignore malformed */
        }
      }

      es.onerror = () => {
        // EventSource reintenta solo; si el token expiró, reconectamos con uno nuevo.
        cleanupEs()
        if (!closed) {
          renewTimer = window.setTimeout(() => {
            void connect()
          }, 2_000)
        }
      }

      const renewMs = Math.max(5_000, (tokenRes.expires_in ?? 120) * 1000 - 15_000)
      renewTimer = window.setTimeout(() => {
        cleanupEs()
        void connect()
      }, renewMs)
    } catch {
      if (!closed) {
        renewTimer = window.setTimeout(() => {
          void connect()
        }, 5_000)
      }
    }
  }

  void connect()

  return () => {
    closed = true
    cleanupEs()
  }
}

export async function listSubscriptions(filters?: {
  service?: string
  status?: string
}): Promise<SubscriptionRecord[]> {
  const { data } = await withDemoFallback(
    () =>
      listNormalized(
        `${PREFIX}/subscriptions/${qs({ service: filters?.service, status: filters?.status })}`,
        normalizeSubscription,
      ),
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
          service: payload.plan_id,
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
