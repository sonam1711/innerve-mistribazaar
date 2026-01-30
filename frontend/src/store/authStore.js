/**
 * Authentication Store using Zustand
 * Manages user state and authentication
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import api from '../utils/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,

      // Initialize session
      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          set({ session, user: session.user })
          localStorage.setItem('access_token', session.access_token)
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user || null })
          if (session) {
            localStorage.setItem('access_token', session.access_token)
          } else {
            localStorage.removeItem('access_token')
          }
        })
      },

      // Login/Register is handled by SupabaseOTP component mostly
      // This is for setting the session manually if needed
      setSession: (session) => {
        set({ session, user: session.user })
        localStorage.setItem('access_token', session.access_token)
      },

      // Logout
      logout: async () => {
        set({ isLoading: true })
        await supabase.auth.signOut()
        localStorage.removeItem('access_token')
        set({ user: null, session: null, isLoading: false })
        toast.success('Logged out successfully')
      },

      // Update user profile (custom backend)
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
)
