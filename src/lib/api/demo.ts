import type {
  AdherenceRule,
  ChatMessage,
  ChatThread,
  CheckIn,
  MealLog,
  Role,
  ServicePlan,
  Student,
  SubscriptionRecord,
  TrainingPlan,
  WaterLog,
  WorkoutLog,
} from './types'
import type { SessionState } from './auth'

const today = () => new Date().toISOString().slice(0, 10)

export const demoPlans: ServicePlan[] = [
  {
    id: 'plan-base',
    name: 'Forja Base',
    description: 'Plan de entrenamiento + seguimiento semanal.',
    price_clp: 89000,
    billing: 'mensual',
    billing_period: 'monthly',
    duration_weeks: 4,
    includes_nutrition: false,
    includes_training: true,
    active: true,
    features: ['Entrenamiento'],
  },
  {
    id: 'plan-elite',
    name: 'Forja Elite',
    description: 'Entrenamiento, nutrición y macros con revisión continua.',
    price_clp: 149000,
    billing: 'mensual',
    billing_period: 'monthly',
    duration_weeks: 12,
    includes_nutrition: true,
    includes_training: true,
    active: true,
    features: ['Entrenamiento', 'Nutrición'],
  },
  {
    id: 'plan-eval',
    name: 'Evaluación inicial',
    description: 'Sesión única de diagnóstico y propuesta de plan.',
    price_clp: 45000,
    billing: 'unico',
    billing_period: 'one_time',
    duration_weeks: 1,
    includes_nutrition: false,
    includes_training: true,
    active: true,
    features: ['Entrenamiento'],
  },
]

export const demoStudents: Student[] = [
  {
    id: 'stu-1',
    full_name: 'Camila Rojas',
    email: 'camila@alumno.demo',
    plan_id: 'plan-elite',
    plan_name: 'Forja Elite',
    status: 'active',
    adherence_pct: 86,
    started_at: '2026-08-12',
    goals: 'Recomposición y fuerza base',
    macros: { calories: 2100, protein_g: 140, carbs_g: 200, fat_g: 65, water_ml: 2800 },
  },
  {
    id: 'stu-2',
    full_name: 'Diego Muñoz',
    email: 'diego@alumno.demo',
    plan_id: 'plan-base',
    plan_name: 'Forja Base',
    status: 'active',
    adherence_pct: 72,
    started_at: '2026-09-01',
    goals: 'Hipertrofia upper body',
    macros: { calories: 2800, protein_g: 170, carbs_g: 320, fat_g: 80, water_ml: 3200 },
  },
  {
    id: 'stu-3',
    full_name: 'Valentina Pérez',
    email: 'vale@alumno.demo',
    plan_id: 'plan-elite',
    plan_name: 'Forja Elite',
    status: 'paused',
    adherence_pct: 41,
    started_at: '2026-06-20',
    goals: 'Preparación running 10k',
    macros: { calories: 2300, protein_g: 120, carbs_g: 280, fat_g: 70, water_ml: 2500 },
  },
]

export const demoTraining: TrainingPlan = {
  id: 'tp-1',
  student_id: 'stu-1',
  title: 'Bloque fuerza — 6 semanas',
  notes: 'Priorizar técnica en sentadilla.',
  effective_from: '2026-09-01',
  effective_to: '2026-10-13',
  is_current: true,
  weeks: 6,
  days: [
    {
      id: 'wd-a',
      day_label: 'Día A',
      focus: 'Empuje',
      weekday: 1,
      position: 1,
      exercises: [
        { name: 'Press banca', sets: 4, reps: '6-8', rest_sec: 120 },
        { name: 'Press militar', sets: 3, reps: '8-10', rest_sec: 90 },
        { name: 'Fondos', sets: 3, reps: '10-12', rest_sec: 75 },
      ],
    },
    {
      id: 'wd-b',
      day_label: 'Día B',
      focus: 'Tirón',
      weekday: 3,
      position: 2,
      exercises: [
        { name: 'Dominadas', sets: 4, reps: 'AMRAP', rest_sec: 120 },
        { name: 'Remo con barra', sets: 4, reps: '8-10', rest_sec: 90 },
        { name: 'Face pull', sets: 3, reps: '12-15', rest_sec: 60 },
      ],
    },
    {
      id: 'wd-c',
      day_label: 'Día C',
      focus: 'Pierna',
      weekday: 5,
      position: 3,
      exercises: [
        { name: 'Sentadilla', sets: 4, reps: '5-8', rest_sec: 150 },
        { name: 'Peso muerto rumano', sets: 3, reps: '8-10', rest_sec: 120 },
        { name: 'Zancadas', sets: 3, reps: '10/pierna', rest_sec: 75 },
      ],
    },
  ],
}

export let demoMeals: MealLog[] = [
  {
    id: 'meal-1',
    student_id: 'stu-1',
    date: today(),
    meal: 'breakfast',
    description: 'Avena, yogurt griego y berries',
    calories: 420,
    protein_g: 28,
    carbs_g: 52,
    fat_g: 12,
  },
  {
    id: 'meal-2',
    student_id: 'stu-1',
    date: today(),
    meal: 'lunch',
    description: 'Pollo, arroz y ensalada',
    calories: 650,
    protein_g: 48,
    carbs_g: 70,
    fat_g: 18,
  },
]

export let demoWater: WaterLog[] = [
  { id: 'wat-1', student_id: 'stu-1', date: today(), ml: 1500 },
]

export let demoWorkouts: WorkoutLog[] = [
  {
    id: 'wo-1',
    student_id: 'stu-1',
    date: today(),
    workout_day_id: 'wd-a',
    title: 'Día A — Empuje',
    completed: true,
    notes: 'Buen press, última serie pesada',
  },
]

export const demoCheckIns: CheckIn[] = [
  {
    id: 'ci-1',
    student_id: 'stu-1',
    date: '2026-10-08',
    weight_kg: 62.4,
    energy: 4,
    sleep_hours: 7.5,
    notes: 'Semana estable',
    adherence_ok: true,
  },
  {
    id: 'ci-2',
    student_id: 'stu-2',
    date: '2026-10-10',
    weight_kg: 81.1,
    energy: 3,
    sleep_hours: 6,
    notes: 'Poco sueño entre semana',
    adherence_ok: false,
  },
]

export let demoRules: AdherenceRule[] = [
  {
    id: 'rule-1',
    name: 'Entrenos semanales',
    description: 'Completar al menos 3 sesiones registradas.',
    metric: 'training',
    target_per_week: 3,
    enabled: true,
  },
  {
    id: 'rule-2',
    name: 'Registro de comidas',
    description: 'Registrar al menos 4 comidas al día en promedio.',
    metric: 'macros',
    target_per_week: 28,
    enabled: true,
  },
  {
    id: 'rule-3',
    name: 'Hidratación',
    description: 'Alcanzar la meta de agua 5 de 7 días.',
    metric: 'water',
    target_per_week: 5,
    enabled: true,
  },
]

export const demoThreads: ChatThread[] = [
  {
    id: 'th-1',
    student_id: 'stu-1',
    student_name: 'Camila Rojas',
    unread: 1,
    last_message: '¿Cambiamos el press militar por mancuernas?',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'th-2',
    student_id: 'stu-2',
    student_name: 'Diego Muñoz',
    unread: 0,
    last_message: 'Listo el check-in de hoy',
    updated_at: new Date(Date.now() - 3600_000).toISOString(),
  },
]

export const demoMessages: Record<string, ChatMessage[]> = {
  'th-1': [
    {
      id: 'm1',
      thread_id: 'th-1',
      sender: 'alumno',
      body: 'Hola coach, el hombro quedó un poco cargado.',
      created_at: new Date(Date.now() - 7200_000).toISOString(),
    },
    {
      id: 'm2',
      thread_id: 'th-1',
      sender: 'coach',
      body: 'Bajemos un poco el volumen del press militar esta semana.',
      created_at: new Date(Date.now() - 5400_000).toISOString(),
    },
    {
      id: 'm3',
      thread_id: 'th-1',
      sender: 'alumno',
      body: '¿Cambiamos el press militar por mancuernas?',
      created_at: new Date(Date.now() - 600_000).toISOString(),
    },
  ],
  'th-2': [
    {
      id: 'm4',
      thread_id: 'th-2',
      sender: 'alumno',
      body: 'Listo el check-in de hoy',
      created_at: new Date(Date.now() - 3600_000).toISOString(),
    },
  ],
}

export let demoSubs: SubscriptionRecord[] = [
  {
    id: 'sub-1',
    student_id: 'stu-1',
    student_name: 'Camila Rojas',
    plan_id: 'plan-elite',
    plan_name: 'Forja Elite',
    amount_clp: 149000,
    status: 'active',
    started_at: '2026-08-12',
    next_billing_at: '2026-11-12',
    note: 'Transferencia mensuales',
  },
  {
    id: 'sub-2',
    student_id: 'stu-2',
    student_name: 'Diego Muñoz',
    plan_id: 'plan-base',
    plan_name: 'Forja Base',
    amount_clp: 89000,
    status: 'past_due',
    started_at: '2026-09-01',
    note: 'Pendiente comprobante octubre',
  },
]

export function demoLogin(email: string, role: Role): SessionState {
  const isAlumno = role === 'alumno' || email.includes('alumno')
  return {
    token: 'demo-token-forja',
    user: {
      id: isAlumno ? 2 : 1,
      email: isAlumno ? 'camila@alumno.demo' : email || 'coach@forja.demo',
      full_name: isAlumno ? 'Camila Rojas' : 'Martín Coach',
      role: isAlumno ? 'alumno' : 'coach',
    },
    role: isAlumno ? 'alumno' : role === 'admin' ? 'coach' : role,
    branches: [{ id: 901, name: 'Forja — Studio Norte', commune: 'Providencia', region: 'RM' }],
    branchId: 901,
    demo: true,
  }
}

export function pushMessage(threadId: string, sender: 'coach' | 'alumno', body: string): ChatMessage {
  const msg: ChatMessage = {
    id: `m-${Date.now()}`,
    thread_id: threadId,
    sender,
    body,
    created_at: new Date().toISOString(),
  }
  demoMessages[threadId] = [...(demoMessages[threadId] ?? []), msg]
  const thread = demoThreads.find((t) => t.id === threadId)
  if (thread) {
    thread.last_message = body
    thread.updated_at = msg.created_at
    if (sender === 'alumno') thread.unread += 1
  }
  return msg
}

export function addMeal(partial: Omit<MealLog, 'id'>): MealLog {
  const meal: MealLog = { ...partial, id: `meal-${Date.now()}` }
  demoMeals = [meal, ...demoMeals]
  return meal
}

export function addWater(studentId: string, ml: number): WaterLog {
  const log: WaterLog = {
    id: `wat-${Date.now()}`,
    student_id: studentId,
    date: today(),
    ml,
  }
  demoWater = [log, ...demoWater]
  return log
}

export function addWorkoutLog(partial: Omit<WorkoutLog, 'id'>): WorkoutLog {
  const log: WorkoutLog = { ...partial, id: `wo-${Date.now()}` }
  demoWorkouts = [log, ...demoWorkouts]
  return log
}

export function addSubscription(partial: Omit<SubscriptionRecord, 'id'>): SubscriptionRecord {
  const sub: SubscriptionRecord = { ...partial, id: `sub-${Date.now()}` }
  demoSubs = [sub, ...demoSubs]
  return sub
}

export function toggleRule(id: string): AdherenceRule[] {
  demoRules = demoRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
  return demoRules
}
