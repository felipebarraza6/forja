export interface Paginated<T> {
  count?: number
  next?: string | null
  previous?: string | null
  results?: T[]
}

export type UserRole = 'coach' | 'alumno'

export interface Branch {
  id: number
  name: string
  commune?: string
  region?: string
}

export interface Alumno {
  id: number
  name: string
  email: string
  plan: string
  status: 'activo' | 'pausado' | 'vencido'
  adherence: number
  lastCheckIn: string
  macros: { protein: number; carbs: number; fat: number; kcal: number }
  waterGoalMl: number
}

export interface Servicio {
  id: number
  name: string
  description: string
  priceClp: number
  billing: 'mensual' | 'programa' | 'sesion'
  active: boolean
  alumnos: number
}

export interface Rutina {
  id: number
  name: string
  daysPerWeek: number
  focus: string
  exercises: { name: string; sets: string; notes?: string }[]
}

export interface CheckIn {
  id: number
  alumnoId: number
  alumnoName: string
  date: string
  workoutDone: boolean
  mealsLogged: number
  waterMl: number
  note?: string
  adherenceScore: number
}

export interface ChatMessage {
  id: number
  threadId: number
  from: 'coach' | 'alumno'
  text: string
  at: string
}

export interface ChatThread {
  id: number
  alumnoId: number
  alumnoName: string
  unread: number
  lastMessage: string
  lastAt: string
}

export interface Suscripcion {
  id: number
  alumnoId: number
  alumnoName: string
  servicioId: number
  servicioName: string
  status: 'activa' | 'pendiente' | 'vencida' | 'cancelada'
  startedAt: string
  endsAt?: string
  amountClp: number
  notes?: string
}

export interface MealLog {
  id: number
  date: string
  name: string
  protein: number
  carbs: number
  fat: number
  kcal: number
}

export interface WorkoutLog {
  id: number
  date: string
  name: string
  completed: boolean
  durationMin: number
}

export interface AdherenceRule {
  id: number
  name: string
  description: string
  weight: number
  enabled: boolean
}
