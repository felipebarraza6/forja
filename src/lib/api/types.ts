export type Role = 'coach' | 'alumno' | 'admin'

export interface Paginated<T> {
  count?: number
  next?: string | null
  previous?: string | null
  results: T[]
}

export interface Branch {
  id: number
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
}

export interface LoginResponse {
  token: string
  user: User
  branches?: Branch[]
  /** Rol de producto Forja; si falta se infiere o se elige en login demo. */
  forja_role?: Role
}

export interface ServicePlan {
  id: string
  name: string
  description: string
  price_clp: number
  billing: 'mensual' | 'anual' | 'unico'
  active: boolean
  features: string[]
}

export interface Student {
  id: string
  full_name: string
  email: string
  plan_id: string
  plan_name: string
  status: 'activo' | 'pausado' | 'vencido' | 'invitado'
  adherence_pct: number
  started_at: string
  goals: string
  macros: MacroTargets
}

export interface MacroTargets {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  water_ml: number
}

export interface WorkoutExercise {
  name: string
  sets: number
  reps: string
  rest_sec: number
  notes?: string
}

export interface WorkoutDay {
  id: string
  day_label: string
  focus: string
  exercises: WorkoutExercise[]
}

export interface TrainingPlan {
  id: string
  student_id: string
  title: string
  weeks: number
  days: WorkoutDay[]
}

export interface MealLog {
  id: string
  student_id: string
  date: string
  meal: 'desayuno' | 'almuerzo' | 'once' | 'cena' | 'snack'
  description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
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

export interface AdherenceRule {
  id: string
  name: string
  description: string
  metric: 'entrenos' | 'comidas' | 'agua' | 'checkins'
  target_per_week: number
  enabled: boolean
}

export interface ChatMessage {
  id: string
  thread_id: string
  sender: 'coach' | 'alumno'
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

export interface SubscriptionRecord {
  id: string
  student_id: string
  student_name: string
  plan_id: string
  plan_name: string
  amount_clp: number
  status: 'activa' | 'pendiente' | 'cancelada'
  started_at: string
  next_billing_at?: string
  note?: string
}
