import type { Paginated } from './types'
import { FORJA_BRANCH_ID } from './config'

export const API_BASE: string =
  (import.meta.env.VITE_YGGDRA_API_BASE as string | undefined) ??
  (import.meta.env.DEV
    ? 'https://api-staging.yggdra.cl/api'
    : 'https://api.yggdra.cl/api')

export const TOKEN_KEY = 'forja.token'
export const BRANCH_KEY = 'forja.branch_id'
export const SESSION_KEY = 'forja.session'
export const DEMO_KEY = 'forja.demo'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getBranchId(): string | null {
  return localStorage.getItem(BRANCH_KEY) ?? String(FORJA_BRANCH_ID)
}

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_KEY) === '1'
}

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  timeoutMs?: number
  auth?: 'auto' | 'required' | 'none'
  branch?: 'auto' | 'none'
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    timeoutMs = 30_000,
    auth = 'auto',
    branch = 'auto',
  } = opts

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = getToken()
  const branchId = getBranchId()

  if (auth === 'required' && !token) {
    clearTimeout(timer)
    throw new ApiError('Sesión requerida', 401)
  }
  if (auth !== 'none' && token) headers.Authorization = `Token ${token}`
  if (branch === 'auto' && branchId) headers['X-Branch-ID'] = branchId
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const url = `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!res.ok) {
      let detail = `API ${res.status} ${res.statusText}`
      try {
        const data = (await res.json()) as {
          detail?: string | Record<string, unknown>
          error?: string
        }
        if (typeof data.detail === 'string') detail = data.detail
        else if (data.error) detail = data.error
        else if (data.detail && typeof data.detail === 'object') {
          detail = JSON.stringify(data.detail)
        }
      } catch {
        /* ignore */
      }
      // Token inválido/expirado: limpiar sesión local (no en login sin auth).
      if (res.status === 401 && auth !== 'none') {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(SESSION_KEY)
        localStorage.removeItem(DEMO_KEY)
      }
      throw new ApiError(detail, res.status)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Tiempo de espera agotado', 408)
    }
    throw new ApiError(err instanceof Error ? err.message : 'Error de red', 0)
  } finally {
    clearTimeout(timer)
  }
}

export function apiList<T>(path: string): Promise<T[]> {
  return apiRequest<Paginated<T> | T[]>(path).then((data) =>
    Array.isArray(data) ? data : (data.results ?? []),
  )
}

function isNetworkOrOffline(err: unknown): boolean {
  if (!(err instanceof ApiError)) return true
  // 0 = fallo de red; 408 timeout; 5xx servidor caído
  return err.status === 0 || err.status === 408 || (err.status != null && err.status >= 500)
}

/**
 * API real primero. Demo solo si:
 * - ya estamos en modo demo, o
 * - la API no es alcanzable (red / 5xx).
 * Errores 4xx de negocio se propagan (no se enmascaran con demo).
 */
export async function withDemoFallback<T>(
  live: () => Promise<T>,
  demo: () => T | Promise<T>,
): Promise<{ data: T; demo: boolean }> {
  if (isDemoMode()) {
    return { data: await demo(), demo: true }
  }
  try {
    return { data: await live(), demo: false }
  } catch (err) {
    if (isNetworkOrOffline(err)) {
      return { data: await demo(), demo: true }
    }
    throw err
  }
}

export function qs(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}
