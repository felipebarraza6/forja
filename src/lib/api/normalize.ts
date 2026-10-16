import type {
  AdherenceRule,
  ChatMessage,
  ChatThread,
  CheckIn,
  MacroTargets,
  MealLog,
  ServicePlan,
  Student,
  SubscriptionRecord,
  TrainingPlan,
  WaterLog,
  WorkoutDay,
  WorkoutExercise,
  WorkoutLog,
} from './types'

/** IDs de UI siempre string; la API suele devolver number. */
export function idStr(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  return String(value)
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function str(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value)
}

function macrosOf(raw: Record<string, unknown>): MacroTargets {
  const m = (raw.macros ?? raw) as Record<string, unknown>
  return {
    calories: num(m.calories ?? m.kcal, 0),
    protein_g: num(m.protein_g ?? m.protein, 0),
    carbs_g: num(m.carbs_g ?? m.carbs ?? m.carbohydrates, 0),
    fat_g: num(m.fat_g ?? m.fat, 0),
    water_ml: num(m.water_ml ?? m.water, 0),
  }
}

export function normalizeStudent(raw: Record<string, unknown>): Student {
  const plan =
    raw.plan && typeof raw.plan === 'object'
      ? (raw.plan as Record<string, unknown>)
      : raw.service && typeof raw.service === 'object'
        ? (raw.service as Record<string, unknown>)
        : null

  const planId = idStr(raw.plan_id ?? raw.service_id ?? plan?.id)
  const planName = str(raw.plan_name ?? raw.service_name ?? plan?.name, 'Sin plan')

  return {
    id: idStr(raw.id),
    full_name: str(raw.full_name ?? raw.name, 'Sin nombre'),
    email: str(raw.email),
    plan_id: planId,
    plan_name: planName,
    status: (str(raw.status, 'activo') as Student['status']) || 'activo',
    adherence_pct: num(raw.adherence_pct ?? raw.adherence, 0),
    started_at: str(raw.started_at ?? raw.created_at).slice(0, 10),
    goals: str(raw.goals ?? raw.goal),
    macros: macrosOf(raw),
  }
}

export function normalizeService(raw: Record<string, unknown>): ServicePlan {
  const features = Array.isArray(raw.features)
    ? raw.features.map(String)
    : typeof raw.features === 'string'
      ? [raw.features]
      : []
  const billingRaw = str(raw.billing ?? raw.billing_cycle, 'mensual')
  const billing = (['mensual', 'anual', 'unico'].includes(billingRaw)
    ? billingRaw
    : 'mensual') as ServicePlan['billing']

  return {
    id: idStr(raw.id),
    name: str(raw.name),
    description: str(raw.description),
    price_clp: num(raw.price_clp ?? raw.price ?? raw.amount_clp),
    billing,
    active: Boolean(raw.active ?? raw.is_active ?? true),
    features,
  }
}

function normalizeExercise(raw: Record<string, unknown>): WorkoutExercise {
  return {
    name: str(raw.name),
    sets: num(raw.sets, 3),
    reps: str(raw.reps, '8-10'),
    rest_sec: num(raw.rest_sec ?? raw.rest, 60),
    notes: raw.notes != null ? str(raw.notes) : undefined,
  }
}

function normalizeDay(raw: Record<string, unknown>): WorkoutDay {
  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises.map((e) => normalizeExercise(e as Record<string, unknown>))
    : []
  return {
    id: idStr(raw.id),
    day_label: str(raw.day_label ?? raw.label ?? raw.name, 'Día'),
    focus: str(raw.focus ?? raw.title),
    exercises,
  }
}

export function normalizeTrainingPlan(raw: Record<string, unknown>): TrainingPlan {
  const days = Array.isArray(raw.days)
    ? raw.days.map((d) => normalizeDay(d as Record<string, unknown>))
    : Array.isArray(raw.workout_days)
      ? raw.workout_days.map((d) => normalizeDay(d as Record<string, unknown>))
      : []
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    title: str(raw.title ?? raw.name, 'Plan'),
    weeks: num(raw.weeks, 4),
    days,
  }
}

export function normalizeMeal(raw: Record<string, unknown>): MealLog {
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    date: str(raw.date).slice(0, 10),
    meal: (str(raw.meal, 'snack') as MealLog['meal']) || 'snack',
    description: str(raw.description ?? raw.name),
    calories: num(raw.calories ?? raw.kcal),
    protein_g: num(raw.protein_g ?? raw.protein),
    carbs_g: num(raw.carbs_g ?? raw.carbs),
    fat_g: num(raw.fat_g ?? raw.fat),
  }
}

export function normalizeWater(raw: Record<string, unknown>): WaterLog {
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    date: str(raw.date).slice(0, 10),
    ml: num(raw.ml ?? raw.amount_ml ?? raw.amount),
  }
}

export function normalizeWorkoutLog(raw: Record<string, unknown>): WorkoutLog {
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    date: str(raw.date).slice(0, 10),
    workout_day_id: idStr(raw.workout_day_id ?? raw.workout_day ?? raw.day_id),
    title: str(raw.title ?? raw.name),
    completed: Boolean(raw.completed ?? raw.is_completed ?? true),
    notes: raw.notes != null ? str(raw.notes) : undefined,
  }
}

export function normalizeCheckIn(raw: Record<string, unknown>): CheckIn {
  const energy = Math.min(5, Math.max(1, Math.round(num(raw.energy, 3)))) as CheckIn['energy']
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    date: str(raw.date).slice(0, 10),
    weight_kg: raw.weight_kg != null ? num(raw.weight_kg) : undefined,
    energy,
    sleep_hours: raw.sleep_hours != null ? num(raw.sleep_hours) : undefined,
    notes: raw.notes != null ? str(raw.notes) : undefined,
    adherence_ok: Boolean(raw.adherence_ok ?? raw.ok ?? true),
  }
}

export function normalizeRule(raw: Record<string, unknown>): AdherenceRule {
  return {
    id: idStr(raw.id),
    name: str(raw.name),
    description: str(raw.description),
    metric: (str(raw.metric, 'entrenos') as AdherenceRule['metric']) || 'entrenos',
    target_per_week: num(raw.target_per_week ?? raw.target, 1),
    enabled: Boolean(raw.enabled ?? raw.is_active ?? true),
  }
}

export function normalizeThread(raw: Record<string, unknown>): ChatThread {
  const student =
    raw.student && typeof raw.student === 'object'
      ? (raw.student as Record<string, unknown>)
      : null
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? student?.id),
    student_name: str(raw.student_name ?? student?.full_name ?? student?.name, 'Alumno'),
    unread: num(raw.unread ?? raw.unread_count),
    last_message: raw.last_message != null ? str(raw.last_message) : undefined,
    updated_at: str(raw.updated_at ?? raw.modified_at ?? new Date().toISOString()),
  }
}

export function normalizeMessage(raw: Record<string, unknown>): ChatMessage {
  const senderRaw = str(raw.sender ?? raw.role, 'alumno')
  const sender: ChatMessage['sender'] =
    senderRaw === 'coach' || senderRaw === 'trainer' ? 'coach' : 'alumno'
  return {
    id: idStr(raw.id),
    thread_id: idStr(raw.thread_id ?? raw.thread),
    sender,
    body: str(raw.body ?? raw.text ?? raw.message),
    created_at: str(raw.created_at ?? raw.timestamp ?? new Date().toISOString()),
  }
}

export function normalizeSubscription(raw: Record<string, unknown>): SubscriptionRecord {
  const student =
    raw.student && typeof raw.student === 'object'
      ? (raw.student as Record<string, unknown>)
      : null
  const plan =
    raw.plan && typeof raw.plan === 'object'
      ? (raw.plan as Record<string, unknown>)
      : raw.service && typeof raw.service === 'object'
        ? (raw.service as Record<string, unknown>)
        : null
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? student?.id),
    student_name: str(raw.student_name ?? student?.full_name ?? student?.name),
    plan_id: idStr(raw.plan_id ?? raw.service_id ?? plan?.id),
    plan_name: str(raw.plan_name ?? raw.service_name ?? plan?.name),
    amount_clp: num(raw.amount_clp ?? raw.amount ?? raw.price_clp),
    status: (str(raw.status, 'pendiente') as SubscriptionRecord['status']) || 'pendiente',
    started_at: str(raw.started_at ?? raw.created_at).slice(0, 10),
    next_billing_at: raw.next_billing_at != null ? str(raw.next_billing_at).slice(0, 10) : undefined,
    note: raw.note != null ? str(raw.note) : undefined,
  }
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}
