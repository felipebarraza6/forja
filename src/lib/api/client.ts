import type { Paginated } from './types'

export const API_BASE: string =
  (import.meta.env.VITE_YGGDRA_API_BASE as string | undefined) ??
  'https://api.yggdra.cl/api'

export const TOKEN_KEY = 'forja.token'
export const BRANCH_KEY = 'forja.branch_id'
export const ROLE_KEY = 'forja.role'
export const DEMO_KEY = 'forja.demo'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getBranchId(): string | null {
  return localStorage.getItem(BRANCH_KEY)
}

export function getRole(): 'coach' | 'alumno' | null {
  const role = localStorage.getItem(ROLE_KEY)
  return role === 'coach' || role === 'alumno' ? role : null
}

export function isDemoSession(): boolean {
  return localStorage.getItem(DEMO_KEY) === '1' || getToken() === 'demo-token'
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(BRANCH_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(DEMO_KEY)
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
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, timeoutMs = 30_000 } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = getToken()
  const branchId = getBranchId()
  if (token && token !== 'demo-token') headers.Authorization = `Token ${token}`
  if (branchId) headers['X-Branch-ID'] = branchId
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const url = `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    if (!res.ok) throw new ApiError(`API ${res.status} ${res.statusText}`, res.status)
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

export interface LoginResponse {
  token: string
  user?: { id: number; email: string; full_name?: string; first_name?: string; last_name?: string }
  branches?: { id: number; name: string; commune?: string; region?: string }[]
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('accounts/users/login_complete/', {
    method: 'POST',
    body: { email, password },
  })
}

export async function probeApi(): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    await fetch(`${API_BASE.replace(/\/$/, '')}/schema/contract/`, {
      signal: controller.signal,
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}
