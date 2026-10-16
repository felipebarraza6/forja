import type {
  AdherenceMetric,
  AdherenceRule,
  ChatMessage,
  ChatThread,
  CheckIn,
  MacroTargets,
  MealLog,
  MealType,
  MessageAuthorRole,
  ServiceBillingPeriod,
  ServiceBillingUi,
  ServicePlan,
  Student,
  StudentStatus,
  SubscriptionRecord,
  SubscriptionStatus,
  TrainingPlan,
  WaterLog,
  WorkoutDay,
  WorkoutExercise,
  WorkoutLog,
} from './types'
import {
  ADHERENCE_METRICS,
  MEAL_TYPES,
  STUDENT_STATUSES,
  SUBSCRIPTION_STATUSES,
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

function bool(value: unknown, fallback = false): boolean {
  if (value == null) return fallback
  return Boolean(value)
}

/** Student.status API: invited|active|paused|finished|cancelled. Acepta aliases ES legacy. */
const STUDENT_STATUS_ALIASES: Record<string, StudentStatus> = {
  invited: 'invited',
  invitado: 'invited',
  active: 'active',
  activo: 'active',
  paused: 'paused',
  pausado: 'paused',
  finished: 'finished',
  finalizado: 'finished',
  vencido: 'finished',
  cancelled: 'cancelled',
  cancelado: 'cancelled',
  cancelada: 'cancelled',
}

export function normalizeStudentStatus(value: unknown): StudentStatus {
  const s = str(value, 'invited').toLowerCase()
  if (STUDENT_STATUS_ALIASES[s]) return STUDENT_STATUS_ALIASES[s]
  return (STUDENT_STATUSES as readonly string[]).includes(s) ? (s as StudentStatus) : 'invited'
}

/** Meal.meal_type: breakfast|lunch|dinner|snack|other. */
const MEAL_ALIASES: Record<string, MealType> = {
  breakfast: 'breakfast',
  desayuno: 'breakfast',
  lunch: 'lunch',
  almuerzo: 'lunch',
  dinner: 'dinner',
  cena: 'dinner',
  snack: 'snack',
  once: 'snack',
  other: 'other',
  otro: 'other',
}

export function normalizeMealType(value: unknown): MealType {
  const s = str(value, 'snack').toLowerCase()
  if (MEAL_ALIASES[s]) return MEAL_ALIASES[s]
  return (MEAL_TYPES as readonly string[]).includes(s) ? (s as MealType) : 'other'
}

/** AdherenceRule.metric: training|water|macros|check_in. */
const METRIC_ALIASES: Record<string, AdherenceMetric> = {
  training: 'training',
  entrenos: 'training',
  entreno: 'training',
  water: 'water',
  agua: 'water',
  macros: 'macros',
  comidas: 'macros',
  check_in: 'check_in',
  checkin: 'check_in',
  checkins: 'check_in',
  'check-in': 'check_in',
}

export function normalizeAdherenceMetric(value: unknown): AdherenceMetric {
  const s = str(value, 'training').toLowerCase()
  if (METRIC_ALIASES[s]) return METRIC_ALIASES[s]
  return (ADHERENCE_METRICS as readonly string[]).includes(s)
    ? (s as AdherenceMetric)
    : 'training'
}

/** Subscription.status: active|past_due|cancelled|trial. */
const SUB_STATUS_ALIASES: Record<string, SubscriptionStatus> = {
  active: 'active',
  activa: 'active',
  past_due: 'past_due',
  past_due_: 'past_due',
  pendiente: 'past_due',
  vencida: 'past_due',
  cancelled: 'cancelled',
  cancelada: 'cancelled',
  cancelado: 'cancelled',
  trial: 'trial',
  prueba: 'trial',
}

export function normalizeSubscriptionStatus(value: unknown): SubscriptionStatus {
  const s = str(value, 'trial').toLowerCase()
  if (SUB_STATUS_ALIASES[s]) return SUB_STATUS_ALIASES[s]
  return (SUBSCRIPTION_STATUSES as readonly string[]).includes(s)
    ? (s as SubscriptionStatus)
    : 'trial'
}

export function normalizeAuthorRole(value: unknown): MessageAuthorRole {
  const s = str(value, 'alumno').toLowerCase()
  if (s === 'coach' || s === 'trainer') return 'coach'
  if (s === 'admin') return 'admin'
  return 'alumno'
}

/** Macros viven en el alumno (calories_target, protein_target, …). */
function macrosOf(raw: Record<string, unknown>): MacroTargets {
  const nested =
    raw.macros && typeof raw.macros === 'object'
      ? (raw.macros as Record<string, unknown>)
      : null
  const m = nested ?? raw
  return {
    calories: num(m.calories_target ?? m.calories ?? m.kcal, 0),
    protein_g: num(m.protein_target ?? m.protein_g ?? m.protein, 0),
    carbs_g: num(m.carbs_target ?? m.carbs_g ?? m.carbs ?? m.carbohydrates, 0),
    fat_g: num(m.fats_target ?? m.fat_g ?? m.fat ?? m.fats, 0),
    water_ml: num(m.water_target_ml ?? m.water_ml ?? m.water, 0),
  }
}

const BILLING_UI: Record<string, ServiceBillingUi> = {
  monthly: 'mensual',
  mensual: 'mensual',
  quarterly: 'trimestral',
  trimestral: 'trimestral',
  yearly: 'anual',
  anual: 'anual',
  one_time: 'unico',
  unico: 'unico',
  único: 'unico',
}

const BILLING_API: Record<string, ServiceBillingPeriod> = {
  monthly: 'monthly',
  mensual: 'monthly',
  quarterly: 'quarterly',
  trimestral: 'quarterly',
  yearly: 'yearly',
  anual: 'yearly',
  one_time: 'one_time',
  unico: 'one_time',
  único: 'one_time',
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
    status: normalizeStudentStatus(raw.status),
    adherence_pct: num(raw.adherence_pct ?? raw.adherence, 0),
    started_at: str(raw.started_at ?? raw.created_at).slice(0, 10),
    goals: str(raw.goal ?? raw.goals),
    macros: macrosOf(raw),
    sessions_per_week:
      raw.sessions_per_week != null ? num(raw.sessions_per_week) : undefined,
    height_cm: raw.height_cm != null ? num(raw.height_cm) : undefined,
    weight_kg: raw.weight_kg != null ? num(raw.weight_kg) : undefined,
  }
}

export function normalizeService(raw: Record<string, unknown>): ServicePlan {
  const billingRaw = str(raw.billing_period ?? raw.billing ?? raw.billing_cycle, 'monthly')
  const billing_period = BILLING_API[billingRaw] ?? 'monthly'
  const billing = BILLING_UI[billingRaw] ?? 'mensual'

  const includes_nutrition = bool(raw.includes_nutrition)
  const includes_training = bool(raw.includes_training, true)

  const features = Array.isArray(raw.features)
    ? raw.features.map(String)
    : typeof raw.features === 'string'
      ? [raw.features]
      : [
          ...(includes_training ? ['Entrenamiento'] : []),
          ...(includes_nutrition ? ['Nutrición'] : []),
        ]

  return {
    id: idStr(raw.id),
    name: str(raw.name),
    description: str(raw.description),
    price_clp: num(raw.price ?? raw.price_clp ?? raw.amount_clp),
    billing,
    billing_period,
    duration_weeks: raw.duration_weeks != null ? num(raw.duration_weeks) : null,
    includes_nutrition,
    includes_training,
    active: bool(raw.active ?? raw.is_active, true),
    features,
  }
}

function weeksBetween(from: string | null, to: string | null): number {
  if (!from || !to) return 0
  const a = new Date(from).getTime()
  const b = new Date(to).getTime()
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0
  return Math.max(1, Math.round((b - a) / (7 * 24 * 60 * 60 * 1000)))
}

function normalizeExercise(raw: Record<string, unknown>): WorkoutExercise {
  return {
    id: raw.id != null ? idStr(raw.id) : undefined,
    name: str(raw.name),
    sets: num(raw.sets, 3),
    reps: str(raw.reps, '8-10'),
    rest_sec: num(raw.rest_seconds ?? raw.rest_sec ?? raw.rest, 60),
    position: raw.position != null ? num(raw.position) : undefined,
    tempo: raw.tempo != null ? str(raw.tempo) : undefined,
    load_kg: raw.load_kg != null ? num(raw.load_kg) : undefined,
    notes: raw.notes != null ? str(raw.notes) : undefined,
    video_url: raw.video_url != null ? str(raw.video_url) : undefined,
  }
}

function normalizeDay(raw: Record<string, unknown>): WorkoutDay {
  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises.map((e) => normalizeExercise(e as Record<string, unknown>))
    : []
  const name = str(raw.name ?? raw.day_label ?? raw.label, 'Día')
  const notes = raw.notes != null ? str(raw.notes) : ''
  return {
    id: idStr(raw.id),
    day_label: name,
    focus: str(raw.focus ?? raw.title ?? notes, notes || name),
    weekday: raw.weekday != null ? num(raw.weekday) : null,
    position: raw.position != null ? num(raw.position) : undefined,
    notes: notes || undefined,
    exercises,
  }
}

export function normalizeTrainingPlan(raw: Record<string, unknown>): TrainingPlan {
  const days = Array.isArray(raw.days)
    ? raw.days.map((d) => normalizeDay(d as Record<string, unknown>))
    : Array.isArray(raw.workout_days)
      ? raw.workout_days.map((d) => normalizeDay(d as Record<string, unknown>))
      : []
  const effective_from =
    raw.effective_from != null ? str(raw.effective_from).slice(0, 10) : null
  const effective_to =
    raw.effective_to != null ? str(raw.effective_to).slice(0, 10) : null
  const weeks =
    num(raw.weeks, 0) ||
    weeksBetween(effective_from, effective_to) ||
    0

  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    title: str(raw.title ?? raw.name, 'Plan'),
    notes: str(raw.notes),
    effective_from,
    effective_to,
    is_current: bool(raw.is_current, true),
    weeks,
    days,
  }
}

export function normalizeMeal(raw: Record<string, unknown>): MealLog {
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    date: str(raw.logged_on ?? raw.date).slice(0, 10),
    meal: normalizeMealType(raw.meal_type ?? raw.meal),
    description: str(raw.description ?? raw.name),
    calories: num(raw.calories ?? raw.kcal),
    protein_g: num(raw.protein ?? raw.protein_g),
    carbs_g: num(raw.carbs ?? raw.carbs_g),
    fat_g: num(raw.fats ?? raw.fat_g ?? raw.fat),
    notes: raw.notes != null ? str(raw.notes) : undefined,
  }
}

export function normalizeWater(raw: Record<string, unknown>): WaterLog {
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    date: str(raw.logged_on ?? raw.date).slice(0, 10),
    ml: num(raw.ml ?? raw.amount_ml ?? raw.amount),
  }
}

export function normalizeWorkoutLog(raw: Record<string, unknown>): WorkoutLog {
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    date: str(raw.performed_on ?? raw.date).slice(0, 10),
    workout_day_id: idStr(raw.workout_day_id ?? raw.workout_day ?? raw.day_id),
    title: str(raw.title ?? raw.name),
    completed: bool(raw.completed ?? raw.is_completed, true),
    notes: raw.notes != null ? str(raw.notes) : undefined,
  }
}

export function normalizeCheckIn(raw: Record<string, unknown>): CheckIn {
  const energy = Math.min(5, Math.max(1, Math.round(num(raw.energy, 3)))) as CheckIn['energy']
  return {
    id: idStr(raw.id),
    student_id: idStr(raw.student_id ?? raw.student),
    date: str(raw.checked_on ?? raw.date).slice(0, 10),
    weight_kg: raw.weight_kg != null ? num(raw.weight_kg) : undefined,
    energy,
    sleep_hours: raw.sleep_hours != null ? num(raw.sleep_hours) : undefined,
    notes: raw.notes != null ? str(raw.notes) : undefined,
    adherence_ok: bool(raw.adherence_ok ?? raw.ok, true),
  }
}

export function normalizeRule(raw: Record<string, unknown>): AdherenceRule {
  return {
    id: idStr(raw.id),
    name: str(raw.name),
    description: str(raw.description),
    metric: normalizeAdherenceMetric(raw.metric),
    target_per_week: num(raw.target_per_week ?? raw.target, 1),
    enabled: bool(raw.enabled ?? raw.is_active, true),
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
  return {
    id: idStr(raw.id),
    thread_id: idStr(raw.thread_id ?? raw.thread),
    sender: normalizeAuthorRole(raw.author_role ?? raw.sender ?? raw.role),
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
    amount_clp: num(raw.amount_clp ?? raw.amount ?? raw.price ?? raw.price_clp),
    status: normalizeSubscriptionStatus(raw.status),
    started_at: str(raw.started_at ?? raw.created_at).slice(0, 10),
    next_billing_at: raw.next_billing_at != null ? str(raw.next_billing_at).slice(0, 10) : undefined,
    note: raw.note != null ? str(raw.note) : undefined,
  }
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}
