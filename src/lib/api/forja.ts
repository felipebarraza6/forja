import { apiList, apiRequest, isDemoSession } from './client'
import {
  DEMO_ALUMNOS,
  DEMO_CHECKINS,
  DEMO_MEALS,
  DEMO_RUTINAS,
  DEMO_RULES,
  DEMO_SERVICIOS,
  DEMO_THREADS,
  DEMO_WORKOUTS,
  demoAddSuscripcion,
  demoAddWater,
  demoGetMessages,
  demoGetWater,
  demoListSuscripciones,
  demoSendMessage,
} from './demo'
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

/** Capa de dominio Forja: usa API Yggdra cuando existe; si no, demo. */

export async function listAlumnos(): Promise<Alumno[]> {
  if (isDemoSession()) return DEMO_ALUMNOS
  try {
    // Reutiliza customers/clients como base de alumnos por branch.
    const clients = await apiList<{
      id: number
      name?: string
      full_name?: string
      email?: string
    }>('customers/clients/')
    if (!clients.length) return DEMO_ALUMNOS
    return clients.map((c, i) => ({
      id: c.id,
      name: c.full_name || c.name || `Alumno ${c.id}`,
      email: c.email || '',
      plan: 'Sin plan',
      status: 'activo' as const,
      adherence: 0,
      lastCheckIn: '—',
      macros: DEMO_ALUMNOS[i % DEMO_ALUMNOS.length].macros,
      waterGoalMl: 2500,
    }))
  } catch {
    return DEMO_ALUMNOS
  }
}

export async function listServicios(): Promise<Servicio[]> {
  if (isDemoSession()) return DEMO_SERVICIOS
  try {
    const services = await apiList<{
      id: number
      name: string
      description?: string
      price?: number
      is_active?: boolean
    }>('services/services/')
    if (!services.length) return DEMO_SERVICIOS
    return services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      priceClp: Number(s.price ?? 0),
      billing: 'mensual' as const,
      active: s.is_active !== false,
      alumnos: 0,
    }))
  } catch {
    return DEMO_SERVICIOS
  }
}

export async function listRutinas(): Promise<Rutina[]> {
  return DEMO_RUTINAS
}

export async function listCheckIns(): Promise<CheckIn[]> {
  return DEMO_CHECKINS
}

export async function listThreads(): Promise<ChatThread[]> {
  return DEMO_THREADS
}

export async function listMessages(threadId: number): Promise<ChatMessage[]> {
  return demoGetMessages(threadId)
}

export async function sendMessage(
  threadId: number,
  from: 'coach' | 'alumno',
  text: string,
): Promise<ChatMessage> {
  return demoSendMessage(threadId, from, text)
}

export async function listSuscripciones(): Promise<Suscripcion[]> {
  if (isDemoSession()) return demoListSuscripciones()
  try {
    const memberships = await apiList<{
      id: number
      client_name?: string
      client?: number
      service_name?: string
      service?: number
      status?: string
      start_date?: string
      end_date?: string
      price?: number
    }>('services/memberships/')
    if (!memberships.length) return demoListSuscripciones()
    return memberships.map((m) => ({
      id: m.id,
      alumnoId: m.client ?? 0,
      alumnoName: m.client_name || `Cliente ${m.client ?? ''}`,
      servicioId: m.service ?? 0,
      servicioName: m.service_name || 'Servicio',
      status: (m.status as Suscripcion['status']) || 'activa',
      startedAt: m.start_date || '',
      endsAt: m.end_date,
      amountClp: Number(m.price ?? 0),
    }))
  } catch {
    return demoListSuscripciones()
  }
}

export async function registerSuscripcionManual(
  input: Omit<Suscripcion, 'id'>,
): Promise<Suscripcion> {
  if (isDemoSession()) return demoAddSuscripcion(input)
  try {
    // Intento vía memberships; si falla, queda registro local demo.
    await apiRequest('services/memberships/', {
      method: 'POST',
      body: {
        client: input.alumnoId,
        service: input.servicioId,
        status: input.status,
        start_date: input.startedAt,
        end_date: input.endsAt,
        notes: input.notes,
      },
    })
    return { ...input, id: Date.now() }
  } catch {
    return demoAddSuscripcion(input)
  }
}

export async function listMeals(): Promise<MealLog[]> {
  return DEMO_MEALS
}

export async function listWorkouts(): Promise<WorkoutLog[]> {
  return DEMO_WORKOUTS
}

export async function listRules(): Promise<AdherenceRule[]> {
  return DEMO_RULES
}

export async function getWaterMl(): Promise<number> {
  return demoGetWater()
}

export async function addWaterMl(ml: number): Promise<number> {
  return demoAddWater(ml)
}

/** SSE placeholder: conecta cuando exista endpoint Forja en Yggdra. */
export function subscribeMessages(
  threadId: number,
  onMessage: (msg: ChatMessage) => void,
): () => void {
  if (typeof EventSource === 'undefined') return () => undefined
  // Endpoint propuesto: /api/forja/threads/{id}/events/
  const base = (import.meta.env.VITE_YGGDRA_API_BASE as string | undefined) ?? ''
  if (!base || isDemoSession()) {
    return () => undefined
  }
  try {
    const url = `${base.replace(/\/$/, '')}/forja/threads/${threadId}/events/`
    const es = new EventSource(url, { withCredentials: false })
    es.onmessage = (ev) => {
      try {
        onMessage(JSON.parse(ev.data) as ChatMessage)
      } catch {
        /* ignore malformed */
      }
    }
    return () => es.close()
  } catch {
    return () => undefined
  }
}
