import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userAPI } from '../utils/api'

interface User {
  id: number
  name: string
  phone: string
  role: 'CONSUMER' | 'CONTRACTOR' | 'TRADER' | 'MISTRI'
  latitude?: number
  longitude?: number
  language: string
  rating: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  login: (phone: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await userAPI.login(phone, password)
          const { user, tokens } = response.data

          localStorage.setItem('access_token', tokens.access)
          localStorage.setItem('refresh_token', tokens.refresh)

          set({ user, isAuthenticated: true, isLoading: false })
          return true
        } catch (error: any) {
          set({ isLoading: false })
          console.error('Login failed:', error)
          return false
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true })
        try {
          const response = await userAPI.register(userData)
          const { user, tokens } = response.data

          localStorage.setItem('access_token', tokens.access)
          localStorage.setItem('refresh_token', tokens.refresh)

          set({ user, isAuthenticated: true, isLoading: false })
          return true
        } catch (error: any) {
          set({ isLoading: false })
          console.error('Registration failed:', error)
          return false
        }
      },

      logout: () => {
        localStorage.clear()
        sessionStorage.clear()
        set({ user: null, isAuthenticated: false })
      },

      fetchProfile: async () => {
        try {
          const response = await userAPI.profile()
          set({ user: response.data, isAuthenticated: true })
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
