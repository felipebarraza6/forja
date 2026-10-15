import type {
  AdherenceRule,
  Alumno,
  ChatMessage,
  ChatThread,
  CheckIn,
  MealLog,
  Rutina,
  Servicio,
  Suscripcion,
  WorkoutLog,
} from './types'

export const DEMO_COACH = {
  id: 1,
  name: 'Martín Silva',
  email: 'coach@forja.demo',
  studio: 'Forja Studio Providencia',
}

export const DEMO_ALUMNOS: Alumno[] = [
  {
    id: 101,
    name: 'Camila Rojas',
    email: 'camila@forja.demo',
    plan: 'Mensual fuerza',
    status: 'activo',
    adherence: 86,
    lastCheckIn: '2026-10-14',
    macros: { protein: 130, carbs: 180, fat: 55, kcal: 2100 },
    waterGoalMl: 2800,
  },
  {
    id: 102,
    name: 'Diego Núñez',
    email: 'diego@forja.demo',
    plan: 'Programa 12 semanas',
    status: 'activo',
    adherence: 72,
    lastCheckIn: '2026-10-13',
    macros: { protein: 160, carbs: 220, fat: 60, kcal: 2500 },
    waterGoalMl: 3200,
  },
  {
    id: 103,
    name: 'Valentina Pérez',
    email: 'vale@forja.demo',
    plan: 'Mensual híbrido',
    status: 'pausado',
    adherence: 54,
    lastCheckIn: '2026-10-08',
    macros: { protein: 110, carbs: 150, fat: 50, kcal: 1850 },
    waterGoalMl: 2500,
  },
]

export const DEMO_SERVICIOS: Servicio[] = [
  {
    id: 1,
    name: 'Coaching mensual',
    description: 'Plan de entrenamiento + nutrición + check-ins semanales.',
    priceClp: 89000,
    billing: 'mensual',
    active: true,
    alumnos: 18,
  },
  {
    id: 2,
    name: 'Programa 12 semanas',
    description: 'Transformación con rutinas periodizadas y macros ajustados.',
    priceClp: 249000,
    billing: 'programa',
    active: true,
    alumnos: 7,
  },
  {
    id: 3,
    name: 'Sesión online',
    description: 'Videollamada de técnica y feedback puntual.',
    priceClp: 25000,
    billing: 'sesion',
    active: true,
    alumnos: 0,
  },
]

export const DEMO_RUTINAS: Rutina[] = [
  {
    id: 1,
    name: 'Full body A',
    daysPerWeek: 3,
    focus: 'Fuerza base',
    exercises: [
      { name: 'Sentadilla goblet', sets: '4×8', notes: 'Tempo 3-1-1' },
      { name: 'Press banca DB', sets: '4×10' },
      { name: 'Remo con mancuerna', sets: '3×12' },
      { name: 'Plancha', sets: '3×40s' },
    ],
  },
  {
    id: 2,
    name: 'Push / Pull / Legs',
    daysPerWeek: 4,
    focus: 'Hipertrofia',
    exercises: [
      { name: 'Press militar', sets: '4×8' },
      { name: 'Dominadas asistidas', sets: '4×6-8' },
      { name: 'Peso muerto rumano', sets: '3×10' },
    ],
  },
]

export const DEMO_CHECKINS: CheckIn[] = [
  {
    id: 1,
    alumnoId: 101,
    alumnoName: 'Camila Rojas',
    date: '2026-10-14',
    workoutDone: true,
    mealsLogged: 4,
    waterMl: 2600,
    note: 'Dormí bien, energía alta.',
    adherenceScore: 92,
  },
  {
    id: 2,
    alumnoId: 102,
    alumnoName: 'Diego Núñez',
    date: '2026-10-13',
    workoutDone: true,
    mealsLogged: 3,
    waterMl: 2100,
    note: 'Faltó merienda.',
    adherenceScore: 78,
  },
  {
    id: 3,
    alumnoId: 103,
    alumnoName: 'Valentina Pérez',
    date: '2026-10-08',
    workoutDone: false,
    mealsLogged: 2,
    waterMl: 1400,
    adherenceScore: 41,
  },
]

export const DEMO_THREADS: ChatThread[] = [
  {
    id: 1,
    alumnoId: 101,
    alumnoName: 'Camila Rojas',
    unread: 1,
    lastMessage: '¿Cambio el press por máquina esta semana?',
    lastAt: '2026-10-14T18:22:00',
  },
  {
    id: 2,
    alumnoId: 102,
    alumnoName: 'Diego Núñez',
    unread: 0,
    lastMessage: 'Listo el check-in de ayer.',
    lastAt: '2026-10-13T21:05:00',
  },
]

export const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    threadId: 1,
    from: 'alumno',
    text: 'Hola Martín, ¿cambio el press por máquina esta semana?',
    at: '2026-10-14T18:22:00',
  },
  {
    id: 2,
    threadId: 1,
    from: 'coach',
    text: 'Sí, usa prensa de pecho y mantén el volumen.',
    at: '2026-10-14T18:40:00',
  },
  {
    id: 3,
    threadId: 2,
    from: 'alumno',
    text: 'Listo el check-in de ayer.',
    at: '2026-10-13T21:05:00',
  },
]

export const DEMO_SUSCRIPCIONES: Suscripcion[] = [
  {
    id: 1,
    alumnoId: 101,
    alumnoName: 'Camila Rojas',
    servicioId: 1,
    servicioName: 'Coaching mensual',
    status: 'activa',
    startedAt: '2026-09-01',
    endsAt: '2026-11-01',
    amountClp: 89000,
    notes: 'Transferencia registrada manualmente.',
  },
  {
    id: 2,
    alumnoId: 102,
    alumnoName: 'Diego Núñez',
    servicioId: 2,
    servicioName: 'Programa 12 semanas',
    status: 'activa',
    startedAt: '2026-08-15',
    endsAt: '2026-11-07',
    amountClp: 249000,
  },
  {
    id: 3,
    alumnoId: 103,
    alumnoName: 'Valentina Pérez',
    servicioId: 1,
    servicioName: 'Coaching mensual',
    status: 'pendiente',
    startedAt: '2026-10-01',
    amountClp: 89000,
    notes: 'Esperando comprobante.',
  },
]

export const DEMO_MEALS: MealLog[] = [
  { id: 1, date: '2026-10-14', name: 'Desayuno', protein: 35, carbs: 45, fat: 12, kcal: 430 },
  { id: 2, date: '2026-10-14', name: 'Almuerzo', protein: 45, carbs: 60, fat: 18, kcal: 580 },
  { id: 3, date: '2026-10-14', name: 'Cena', protein: 40, carbs: 40, fat: 15, kcal: 460 },
]

export const DEMO_WORKOUTS: WorkoutLog[] = [
  { id: 1, date: '2026-10-14', name: 'Full body A', completed: true, durationMin: 52 },
  { id: 2, date: '2026-10-12', name: 'Full body B', completed: true, durationMin: 48 },
  { id: 3, date: '2026-10-10', name: 'Full body A', completed: false, durationMin: 0 },
]

export const DEMO_RULES: AdherenceRule[] = [
  {
    id: 1,
    name: 'Entrenamiento del día',
    description: 'Marcar la sesión planificada como completada.',
    weight: 40,
    enabled: true,
  },
  {
    id: 2,
    name: 'Comidas registradas',
    description: 'Al menos 3 comidas con macros.',
    weight: 35,
    enabled: true,
  },
  {
    id: 3,
    name: 'Agua diaria',
    description: 'Cumplir ≥80% de la meta de hidratación.',
    weight: 25,
    enabled: true,
  },
]

let messagesStore = [...DEMO_MESSAGES]
let waterStore = 1850
let suscripcionesStore = [...DEMO_SUSCRIPCIONES]

export function demoGetMessages(threadId: number): ChatMessage[] {
  return messagesStore.filter((m) => m.threadId === threadId)
}

export function demoSendMessage(threadId: number, from: 'coach' | 'alumno', text: string): ChatMessage {
  const msg: ChatMessage = {
    id: Date.now(),
    threadId,
    from,
    text,
    at: new Date().toISOString(),
  }
  messagesStore = [...messagesStore, msg]
  return msg
}

export function demoGetWater(): number {
  return waterStore
}

export function demoAddWater(ml: number): number {
  waterStore += ml
  return waterStore
}

export function demoAddSuscripcion(input: Omit<Suscripcion, 'id'>): Suscripcion {
  const item: Suscripcion = { ...input, id: Date.now() }
  suscripcionesStore = [item, ...suscripcionesStore]
  return item
}

export function demoListSuscripciones(): Suscripcion[] {
  return suscripcionesStore
}
