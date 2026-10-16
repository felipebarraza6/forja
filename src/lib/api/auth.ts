import { pickForjaBranchId } from './branch'
import { ApiError, apiRequest, BRANCH_KEY, DEMO_KEY, SESSION_KEY, TOKEN_KEY } from './client'
import type { Branch, LoginResponse, Role, User } from './types'
import { demoLogin } from './demo'

export interface SessionState {
  token: string
  user: User
  role: Role
  branches: Branch[]
  branchId: number | null
  demo: boolean
}

export async function loginComplete(
  email: string,
  password: string,
  preferredRole?: Role,
): Promise<SessionState> {
  try {
    const res = await apiRequest<LoginResponse>('accounts/users/login_complete/', {
      method: 'POST',
      body: { email, password },
      auth: 'none',
      branch: 'none',
    })
    const apiRole = res.forja_role ?? res.user?.forja_role ?? null
    const role = apiRole ?? preferredRole ?? inferRole(res.user)
    const branches = res.branches ?? []
    const branchId = pickForjaBranch(branches)
    localStorage.removeItem(DEMO_KEY)
    return persistSession({
      token: res.token,
      user: { ...res.user, role },
      role,
      branches,
      branchId,
      demo: false,
    })
  } catch (err) {
    // Credenciales / validación: no caer a demo en silencio
    if (err instanceof ApiError && err.status && err.status >= 400 && err.status < 500) {
      throw err
    }
    // Red / 5xx → demo de respaldo
    const demo = demoLogin(email, preferredRole ?? 'coach')
    localStorage.setItem(DEMO_KEY, '1')
    return persistSession(demo)
  }
}

export function enterDemo(role: Role = 'coach'): SessionState {
  localStorage.setItem(DEMO_KEY, '1')
  return persistSession(demoLogin('coach@forja.demo', role))
}

export async function logoutRemote(): Promise<void> {
  try {
    await apiRequest('accounts/users/logout/', {
      method: 'POST',
      auth: 'required',
      branch: 'none',
    })
  } catch {
    /* offline / demo */
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(BRANCH_KEY)
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(DEMO_KEY)
}

export function readSession(): SessionState | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionState
  } catch {
    return null
  }
}

export function setBranch(branchId: number): void {
  localStorage.setItem(BRANCH_KEY, String(branchId))
  const session = readSession()
  if (session) {
    persistSession({ ...session, branchId })
  }
}

function persistSession(session: SessionState): SessionState {
  localStorage.setItem(TOKEN_KEY, session.token)
  if (session.branchId != null) {
    localStorage.setItem(BRANCH_KEY, String(session.branchId))
  } else {
    localStorage.removeItem(BRANCH_KEY)
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  if (session.demo) localStorage.setItem(DEMO_KEY, '1')
  else localStorage.removeItem(DEMO_KEY)
  return session
}

function inferRole(user: User): Role {
  if (user.role === 'coach' || user.role === 'alumno' || user.role === 'admin') {
    return user.role
  }
  return 'coach'
}

/** Prefiere la sucursal Forja (91) si viene en el login; si no, la primera. */
function pickForjaBranch(branches: Branch[]): number {
  return pickForjaBranchId(branches)
}
