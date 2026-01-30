/**
 * Authentication Store using Zustand
 * Manages user state and authentication with Supabase
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import api from '../utils/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null, // Backend profile data (name, role, etc.)
      isLoading: false,

      // Initialize session
      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          set({ session, user: session.user })
          localStorage.setItem('access_token', session.access_token)

          // Fetch backend profile
          try {
            const { data } = await api.get('/users/profile/')
            set({ profile: data })
          } catch (error) {
            console.error('Failed to fetch profile:', error)
          }
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user || null })
          if (session) {
            localStorage.setItem('access_token', session.access_token)
          } else {
            localStorage.removeItem('access_token')
            set({ profile: null })
          }
        })
      },

      // Set session and fetch profile
      setSession: async (session) => {
        set({ session, user: session.user })
        localStorage.setItem('access_token', session.access_token)

        // Fetch backend profile
        try {
          const { data } = await api.get('/users/profile/')
          set({ profile: data })
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true })
        await supabase.auth.signOut()
        localStorage.removeItem('access_token')
        set({ user: null, session: null, profile: null, isLoading: false })
        toast.success('Logged out successfully')
      },

      // Update profile
      updateProfile: (profileData) => {
        set({ profile: { ...get().profile, ...profileData } })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        profile: state.profile
      }),
    }
  )
)
