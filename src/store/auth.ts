import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Employee, Session } from '@/services/types'

type AuthState = {
  session: Session | null
  setSession: (session: Session) => void
  setEmployee: (employee: Employee) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      setEmployee: (employee) => set((s) => (s.session ? { session: { ...s.session, employee } } : s)),
      logout: () => set({ session: null }),
    }),
    { name: 'azone-auth' },
  ),
)
