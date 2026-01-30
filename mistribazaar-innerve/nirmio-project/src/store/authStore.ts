/**
 * Authentication Store using Zustand
 * Manages user state and authentication for Mistribazar backend
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userAPI, otpAPI } from '../utils/api'

interface User {
  id: number
  name: string
  phone: string
  role: 'CONSUMER' | 'MASON' | 'TRADER'
  latitude?: number
  longitude?: number
  language: string
  rating: number
  created_at?: string
}

interface Tokens {
  access: string
  refresh: string
}

interface AuthState {
  user: User | null
  tokens: Tokens | null
  isLoading: boolean
  
  login: (phone: string, password: string) => Promise<boolean>
  loginWithOTP: (phone: string, otp: string) => Promise<boolean>
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (userData: User) => void
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isLoading: false,

      // Login with password
      login: async (phone: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await userAPI.login(phone, password)
          const { user, tokens } = response.data

          // Store tokens
          localStorage.setItem('access_token', tokens.access)
          localStorage.setItem('refresh_token', tokens.refresh)

          set({ user, tokens, isLoading: false })
          return true
        } catch (error: any) {
          set({ isLoading: false })
          console.error('Login failed:', error.response?.data?.error || 'Login failed')
          return false
        }
      },

      // Login with OTP
      loginWithOTP: async (phone: string, otp: string) => {
        set({ isLoading: true })
        try {
          const response = await otpAPI.verifyOTP(phone, otp, 'login')
          const { user, tokens } = response.data

          localStorage.setItem('access_token', tokens.access)
          localStorage.setItem('refresh_token', tokens.refresh)

          set({ user, tokens, isLoading: false })
          return true
        } catch (error: any) {
          set({ isLoading: false })
          console.error('OTP verification failed:', error.response?.data?.error || 'OTP verification failed')
          return false
        }
      },

      // Register
      register: async (userData: any) => {
        set({ isLoading: true })
        try {
          const response = await userAPI.register(userData)
          const { user, tokens } = response.data

          localStorage.setItem('access_token', tokens.access)
          localStorage.setItem('refresh_token', tokens.refresh)

          set({ user, tokens, isLoading: false })
          return { success: true }
        } catch (error: any) {
          set({ isLoading: false })
          const errorData = error.response?.data
          console.error('Registration failed:', errorData)
          
          // Extract meaningful error message
          let errorMessage = 'Registration failed'
          if (errorData) {
            // Backend returns field-specific errors
            if (errorData.phone) errorMessage = errorData.phone[0]
            else if (errorData.password) errorMessage = errorData.password[0]
            else if (errorData.password2) errorMessage = errorData.password2[0]
            else if (errorData.name) errorMessage = errorData.name[0]
            else if (errorData.error) errorMessage = errorData.error
            else if (typeof errorData === 'string') errorMessage = errorData
          }
          
          return { success: false, error: errorMessage }
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, tokens: null })
      },

      // Update user profile
      updateUser: (userData: User) => {
        set({ user: userData })
      },

      // Fetch current user profile
      fetchProfile: async () => {
        try {
          const response = await userAPI.getProfile()
          set({ user: response.data })
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
    }
  )
)
