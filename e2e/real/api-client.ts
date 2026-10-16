/** Cliente mínimo para E2E contra la API real Yggdra (branch Forja 91). */

export const API_BASE = process.env.VITE_YGGDRA_API_BASE ?? 'https://api.yggdra.cl/api'
export const BRANCH_ID = '91'
export const FORJA_BRANCH_NUM = 91
export const QA_PREFIX = 'QA-'

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; detail: string }

/** Membership BranchUser: `id` es el vínculo; la sucursal es `branch_id`. */
export interface LoginBranch {
  id: number
  branch_id?: number
  branch?: number | { id?: number }
  name?: string
  commune?: string
  region?: string
}

export interface LoginSession {
  token: string
  user: { email?: string; full_name?: string; forja_role?: string | null }
  forja_role?: string | null
  branches?: LoginBranch[]
}

export function branchIdsFromLogin(branches: LoginBranch[] | undefined): number[] {
  if (!branches?.length) return []
  return branches
    .map((b) => {
      if (typeof b.branch_id === 'number') return b.branch_id
      if (typeof b.branch === 'number') return b.branch
      if (b.branch && typeof b.branch === 'object' && typeof b.branch.id === 'number') {
        return b.branch.id
      }
      // No usar b.id: es el BranchUser, no la sucursal.
      return undefined
    })
    .filter((id): id is number => typeof id === 'number')
}

export class RealApiClient {
  token = ''
  created: { kind: string; id: string }[] = []

  track(kind: string, id: string | number | undefined | null) {
    if (id == null || id === '') return
    this.created.push({ kind, id: String(id) })
  }

  async login(email: string, password: string): Promise<LoginSession> {
    const res = await this.request<LoginSession>('accounts/users/login_complete/', {
      method: 'POST',
      body: { email, password },
      auth: false,
    })
    if (!res.ok) throw new Error(`Login falló (${res.status}): ${res.detail}`)
    this.token = res.data.token
    return res.data
  }

  async request<T>(
    path: string,
    opts: { method?: string; body?: unknown; auth?: boolean } = {},
  ): Promise<ApiResult<T>> {
    const { method = 'GET', body, auth = true } = opts
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (auth) {
      if (!this.token) throw new Error('Sin token: llama login() antes')
      headers.Authorization = `Token ${this.token}`
      headers['X-Branch-ID'] = BRANCH_ID
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    const url = `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (res.status === 204) {
      return { ok: true, status: 204, data: undefined as T }
    }

    let data: unknown = null
    const text = await res.text()
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { detail: text }
      }
    }

    if (!res.ok) {
      const detail =
        typeof data === 'object' && data && 'detail' in data
          ? typeof (data as { detail: unknown }).detail === 'string'
            ? String((data as { detail: unknown }).detail)
            : JSON.stringify((data as { detail: unknown }).detail)
          : text || res.statusText
      return { ok: false, status: res.status, detail }
    }
    return { ok: true, status: res.status, data: data as T }
  }

  async list<T>(path: string): Promise<T[]> {
    const res = await this.request<{ results?: T[] } | T[]>(path)
    if (!res.ok) throw new Error(`${path} → ${res.status}: ${res.detail}`)
    return Array.isArray(res.data) ? res.data : (res.data.results ?? [])
  }

  /**
   * Crea alumno QA- para la suite. Si el coach no tiene permiso, lanza Error
   * con mensaje claro (no silenciar).
   */
  async createQaStudent(stamp: number): Promise<{ id: string; full_name: string }> {
    const full_name = qa(`Alumno ${stamp}`)
    const res = await this.request<Record<string, unknown>>('forja/students/', {
      method: 'POST',
      body: {
        email: `qa.forja.${stamp}@example.com`,
        full_name,
        goals: qa('objetivo-validacion'),
        status: 'invitado',
      },
    })
    if (!res.ok) {
      throw new Error(
        `El coach de validación no puede crear alumnos (POST /forja/students/ → ${res.status}): ${res.detail}. ` +
          `Sin alumno QA- no se pueden ejercitar lecturas filtradas, suscripción ni mensajes. ` +
          `Pedir a Yggdra permiso de alta para el coach o un alumno seed en branch 91.`,
      )
    }
    const id = String(res.data.id)
    this.track('student', id)
    return { id, full_name: String(res.data.full_name ?? full_name) }
  }

  /** Abre hilo con el alumno QA-. Prueba varios shapes de body. */
  async createQaThread(studentId: string): Promise<string> {
    const attempts: unknown[] = [
      { student: studentId },
      { student_id: studentId },
      { student: Number(studentId) || studentId },
    ]
    let lastDetail = ''
    for (const body of attempts) {
      const res = await this.request<Record<string, unknown>>('forja/threads/', {
        method: 'POST',
        body,
      })
      if (res.ok) {
        const id = String(res.data.id)
        this.track('thread', id)
        return id
      }
      lastDetail = `${res.status}: ${res.detail}`
      if (res.status !== 400 && res.status !== 422) break
    }
    throw new Error(
      `No se pudo crear hilo QA- para alumno ${studentId} (POST /forja/threads/ → ${lastDetail}).`,
    )
  }

  /** Limpia recursos creados (LIFO). Ignora 404/403/405. */
  async cleanup() {
    const errors: string[] = []
    for (const item of [...this.created].reverse()) {
      const path = this.deletePath(item.kind, item.id)
      if (!path) continue
      const res = await this.request(path, { method: 'DELETE' })
      if (res.ok || res.status === 404 || res.status === 405) continue

      if (item.kind === 'subscription') {
        const patch = await this.request(`forja/subscriptions/${item.id}/`, {
          method: 'PATCH',
          body: { status: 'cancelada', note: `${QA_PREFIX}cleanup` },
        })
        if (!patch.ok && patch.status !== 404) {
          errors.push(`${item.kind}/${item.id}: ${res.status}/${patch.status}`)
        }
        continue
      }

      if (item.kind === 'student') {
        // Preferir endpoint de status si existe; si no, PATCH genérico
        const statusPatch = await this.request(`forja/students/${item.id}/status/`, {
          method: 'PATCH',
          body: { status: 'pausado' },
        })
        if (statusPatch.ok || statusPatch.status === 404) {
          if (!statusPatch.ok) {
            const patch = await this.request(`forja/students/${item.id}/`, {
              method: 'PATCH',
              body: { status: 'pausado', goals: `${QA_PREFIX}cleanup` },
            })
            if (!patch.ok && patch.status !== 404) {
              errors.push(`${item.kind}/${item.id}: ${res.status}/${patch.status}`)
            }
          }
          continue
        }
        errors.push(`${item.kind}/${item.id}: DELETE ${res.status} ${res.detail}`)
        continue
      }

      errors.push(`${item.kind}/${item.id}: DELETE ${res.status} ${res.detail}`)
    }
    this.created = []
    return errors
  }

  private deletePath(kind: string, id: string): string | null {
    switch (kind) {
      case 'subscription':
        return `forja/subscriptions/${id}/`
      case 'student':
        return `forja/students/${id}/`
      case 'thread':
        return `forja/threads/${id}/`
      case 'meal':
        return `forja/meals/${id}/`
      case 'water':
        return `forja/water/${id}/`
      case 'workout-log':
        return `forja/workout-logs/${id}/`
      case 'check-in':
        return `forja/check-ins/${id}/`
      case 'service':
        return `forja/services/${id}/`
      case 'adherence-rule':
        return `forja/adherence-rules/${id}/`
      case 'message':
        return null
      default:
        return null
    }
  }
}

export function qa(label: string): string {
  return `${QA_PREFIX}${label}`
}

export function hasRealCredentials(): boolean {
  return Boolean(process.env.FORJA_VALIDACION_EMAIL && process.env.FORJA_VALIDACION_PASSWORD)
}
