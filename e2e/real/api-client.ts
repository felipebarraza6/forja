/** Cliente mínimo para E2E contra la API real Yggdra (branch Forja 91). */

export const API_BASE = process.env.VITE_YGGDRA_API_BASE ?? 'https://api.yggdra.cl/api'
export const BRANCH_ID = '91'
export const QA_PREFIX = 'QA-'

export type ApiResult<T> = { ok: true; status: number; data: T } | { ok: false; status: number; detail: string }

export class RealApiClient {
  token = ''
  created: { kind: string; id: string }[] = []

  track(kind: string, id: string | number | undefined | null) {
    if (id == null || id === '') return
    this.created.push({ kind, id: String(id) })
  }

  async login(email: string, password: string) {
    const res = await this.request<{
      token: string
      user: { email?: string; full_name?: string }
      forja_role?: string
      branches?: { id: number; name: string }[]
    }>('accounts/users/login_complete/', {
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
          ? String((data as { detail: unknown }).detail)
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

  /** Limpia recursos creados (LIFO). Ignora 404/403. */
  async cleanup() {
    const errors: string[] = []
    for (const item of [...this.created].reverse()) {
      const path = this.deletePath(item.kind, item.id)
      if (!path) continue
      const res = await this.request(path, { method: 'DELETE' })
      if (!res.ok && res.status !== 404 && res.status !== 405) {
        // Intento soft: marcar cancelada / inactiva
        if (item.kind === 'subscription') {
          const patch = await this.request(`forja/subscriptions/${item.id}/`, {
            method: 'PATCH',
            body: { status: 'cancelada', note: `${QA_PREFIX}cleanup` },
          })
          if (!patch.ok && patch.status !== 404) {
            errors.push(`${item.kind}/${item.id}: ${res.status}/${patch.status}`)
          }
        } else if (item.kind === 'student') {
          const patch = await this.request(`forja/students/${item.id}/`, {
            method: 'PATCH',
            body: { status: 'pausado', goals: `${QA_PREFIX}cleanup` },
          })
          if (!patch.ok && patch.status !== 404) {
            errors.push(`${item.kind}/${item.id}: ${res.status}/${patch.status}`)
          }
        } else {
          errors.push(`${item.kind}/${item.id}: DELETE ${res.status} ${res.detail}`)
        }
      }
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
        return null // mensajes suelen ser inmutables
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
