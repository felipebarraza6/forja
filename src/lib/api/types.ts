export type Role = 'coach' | 'alumno' | 'admin'

export interface Paginated<T> {
  count?: number
  next?: string | null
  previous?: string | null
  results: T[]
}

/**
 * Membership de login_complete: `id` es el BranchUser (vínculo),
 * `branch_id` es la sucursal real (p. ej. 91 Forja).
 */
export interface Branch {
  id: number
  /** PK de la sucursal (X-Branch-ID). Preferir sobre `id`. */
  branch_id?: number
  branch?: number | { id?: number; name?: string }
  name: string
  commune?: string
  region?: string
}

export interface User {
  id: number
  email: string
  full_name?: string
  first_name?: string
  last_name?: string
  role?: Role
  /** Rol Forja en el objeto user (login_complete). */
  forja_role?: Role | null
}

export interface LoginResponse {
  token: string
  user: User
  branches?: Branch[]
  /** Rol Forja en la raíz de login_complete. */
  forja_role?: Role | null
}

/** billing_period API (Service.billing_period). */
export type ServiceBillingPeriod = 'monthly' | 'quarterly' | 'yearly' | 'one_time'

/** @deprecated Preferir billing_period + BILLING_PERIOD_LABELS. */
export type ServiceBillingUi = 'mensual' | 'trimestral' | 'anual' | 'unico'

export interface ServicePlan {
  id: string
  name: string
  description: string
  price_clp: number
  /** Etiqueta UI derivada (es). */
  billing: ServiceBillingUi
  billing_period: ServiceBillingPeriod
  duration_weeks: number | null
  includes_nutrition: boolean
  includes_training: boolean
  active: boolean
  /** Derivado de includes_* para la UI actual. */
  features: string[]
}

/**
 * Student.status (API, inglés). Etiquetas ES en labels.ts.
 * Default API: invited.
 */
export const STUDENT_STATUSES = [
  'invited',
  'active',
  'paused',
  'finished',
  'cancelled',
] as const
export type StudentStatus = (typeof STUDENT_STATUSES)[number]

export interface Student {
  id: string
  full_name: string
  email: string
  plan_id: string
  plan_name: string
  status: StudentStatus
  adherence_pct: number
  started_at: string
  goals: string
  macros: MacroTargets
  sessions_per_week?: number
  height_cm?: number
  weight_kg?: number
}

export interface MacroTargets {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  water_ml: number
}

/** Payload PATCH /forja/students/{id}/macros/ */
export interface StudentMacrosPatch {
  calories_target?: number
  protein_target?: number
  carbs_target?: number
  fats_target?: number
  water_target_ml?: number
  sessions_per_week?: number
  height_cm?: number
  weight_kg?: number
  goal?: string
}

export interface WorkoutExercise {
  id?: string
  name: string
  sets: number
  reps: string
  rest_sec: number
  position?: number
  tempo?: string
  load_kg?: number
  notes?: string
  video_url?: string
}

export interface WorkoutDay {
  id: string
  day_label: string
  focus: string
  weekday?: number | null
  position?: number
  notes?: string
  exercises: WorkoutExercise[]
}

export interface TrainingPlan {
  id: string
  student_id: string
  title: string
  notes: string
  effective_from: string | null
  effective_to: string | null
  is_current: boolean
  /** Estimado desde effective_* o 0 si no aplica. */
  weeks: number
  days: WorkoutDay[]
}

/** Meal.meal_type (API). */
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'other'] as const
export type MealType = (typeof MEAL_TYPES)[number]

export interface MealLog {
  id: string
  student_id: string
  date: string
  meal: MealType
  description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  notes?: string
}

export interface WaterLog {
  id: string
  student_id: string
  date: string
  ml: number
}

export interface WorkoutLog {
  id: string
  student_id: string
  date: string
  workout_day_id: string
  title: string
  completed: boolean
  notes?: string
}

export interface CheckIn {
  id: string
  student_id: string
  date: string
  weight_kg?: number
  energy: 1 | 2 | 3 | 4 | 5
  sleep_hours?: number
  notes?: string
  adherence_ok: boolean
}

/** AdherenceRule.metric (API). */
export const ADHERENCE_METRICS = ['training', 'water', 'macros', 'check_in'] as const
export type AdherenceMetric = (typeof ADHERENCE_METRICS)[number]

export interface AdherenceRule {
  id: string
  name: string
  description: string
  metric: AdherenceMetric
  target_per_week: number
  enabled: boolean
}

export interface WeeklyAdherence {
  student_id: string
  week_start: string
  raw?: Record<string, unknown>
}

/** Message.author_role (API). */
export type MessageAuthorRole = 'coach' | 'alumno' | 'admin'

export interface ChatMessage {
  id: string
  thread_id: string
  sender: MessageAuthorRole
  body: string
  created_at: string
}

export interface ChatThread {
  id: string
  student_id: string
  student_name: string
  unread: number
  last_message?: string
  updated_at: string
}

export interface StreamTokenResponse {
  stream_token: string
  expires_in: number
  stream_path: string
}

/** Subscription.status (API). */
export const SUBSCRIPTION_STATUSES = ['active', 'past_due', 'cancelled', 'trial'] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export interface SubscriptionRecord {
  id: string
  student_id: string
  student_name: string
  plan_id: string
  plan_name: string
  amount_clp: number
  status: SubscriptionStatus
  started_at: string
  next_billing_at?: string
  note?: string
}
