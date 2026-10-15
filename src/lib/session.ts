import { create } from 'zustand'
import {
  clearSession,
  enterDemo,
  loginComplete,
  logoutRemote,
  readSession,
  setBranch,
  type SessionState,
} from './api/auth'
import type { Role } from './api/types'

interface SessionStore {
  session: SessionState | null
  hydrated: boolean
  hydrate: () => void
  login: (email: string, password: string, role?: Role) => Promise<void>
  demo: (role?: Role) => void
  logout: () => Promise<void>
  selectBranch: (branchId: number) => void
}

export const useSession = create<SessionStore>((set, get) => ({
  session: null,
  hydrated: false,
  hydrate: () => {
    set({ session: readSession(), hydrated: true })
  },
  login: async (email, password, role) => {
    const session = await loginComplete(email, password, role)
    set({ session })
  },
  demo: (role = 'coach') => {
    set({ session: enterDemo(role) })
  },
  logout: async () => {
    if (!get().session?.demo) {
      await logoutRemote()
    }
    clearSession()
    set({ session: null })
  },
  selectBranch: (branchId) => {
    setBranch(branchId)
    const current = get().session
    if (current) set({ session: { ...current, branchId } })
  },
}))
