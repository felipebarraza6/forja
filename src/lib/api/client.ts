import type { Paginated } from './types'

export const API_BASE: string =
  (import.meta.env.VITE_YGGDRA_API_BASE as string | undefined) ??
  'https://api.yggdra.cl/api'

export const TOKEN_KEY = 'forja.token'
export const BRANCH_KEY = 'forja.branch_id'
export const SESSION_KEY = 'forja.session'
export const DEMO_KEY = 'forja.demo'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getBranchId(): string | null {
  return localStorage.getItem(BRANCH_KEY)
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
        const data = (await res.json()) as { detail?: string; error?: string }
        detail = data.detail ?? data.error ?? detail
      } catch {
        /* ignore */
      }
      throw new ApiError(detail, res.status)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export function apiList<T>(path: string): Promise<T[]> {
  return apiRequest<Paginated<T> | T[]>(path).then((data) =>
    Array.isArray(data) ? data : (data.results ?? []),
  )
}

/** Intenta la API real; si falla, usa el fallback (modo demo / offline). */
export async function withDemoFallback<T>(
  live: () => Promise<T>,
  demo: () => T | Promise<T>,
): Promise<{ data: T; demo: boolean }> {
  if (isDemoMode()) {
    return { data: await demo(), demo: true }
  }
  try {
    return { data: await live(), demo: false }
  } catch {
    return { data: await demo(), demo: true }
  }
}
