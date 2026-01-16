/**
 * Authentication Store using Zustand
 * Manages user state and authentication
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isLoading: false,

      // Login
      login: async (phone, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/users/login/', { phone, password })
          const { user, tokens } = response.data

          // Store tokens
          localStorage.setItem('access_token', tokens.access)
          localStorage.setItem('refresh_token', tokens.refresh)

          set({ user, tokens, isLoading: false })
          toast.success('Login successful!')
          return true
        } catch (error) {
          set({ isLoading: false })
          toast.error(error.response?.data?.error || 'Login failed')
          return false
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/users/register/', userData)
          const { user, tokens } = response.data

          // Store tokens
          localStorage.setItem('access_token', tokens.access)
          localStorage.setItem('refresh_token', tokens.refresh)

          set({ user, tokens, isLoading: false })
          toast.success('Registration successful!')
          return true
        } catch (error) {
          set({ isLoading: false })
          const errorMsg = error.response?.data?.error || 'Registration failed'
          toast.error(errorMsg)
          return false
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, tokens: null })
        toast.success('Logged out successfully')
      },

      // Update user profile
      updateUser: (userData) => {
        set({ user: userData })
      },

      // Fetch current user profile
      fetchProfile: async () => {
        try {
          const response = await api.get('/users/profile/')
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
