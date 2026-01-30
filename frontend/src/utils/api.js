/**
 * API Configuration
 * Centralized axios instance with interceptors
 */
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Supabase handles session persistence in localStorage
    // The key format is usually `sb-<project-ref>-auth-token`
    // But we also manually simplified it in authStore to 'access_token'
    const token = localStorage.getItem('access_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Simple error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// OTP API functions
export const otpAPI = {
  sendOTP: (phone, purpose = 'login') =>
    api.post('/users/send-otp/', { phone, purpose }),

  verifyOTP: (phone, otp, purpose = 'login') =>
    api.post('/users/verify-otp/', { phone, otp, purpose }),

  resendOTP: (phone, purpose = 'login') =>
    api.post('/users/resend-otp/', { phone, purpose }),
}

export default api
