import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '@devvai/devv-code-backend'

interface User {
  uid: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: async () => {
        await auth.logout()
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
