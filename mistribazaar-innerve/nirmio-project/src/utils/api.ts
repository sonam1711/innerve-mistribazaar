/**
 * API Configuration
 * Centralized axios instance with interceptors for Mistribazar backend
 */
import axios from 'axios'

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

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem('access_token', access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// OTP API functions
export const otpAPI = {
  sendOTP: (phone: string, purpose = 'login') => 
    api.post('/users/send-otp/', { phone, purpose }),
  
  verifyOTP: (phone: string, otp: string, purpose = 'login') => 
    api.post('/users/verify-otp/', { phone, otp, purpose }),
  
  resendOTP: (phone: string, purpose = 'login') => 
    api.post('/users/resend-otp/', { phone, purpose }),
}

// User API
export const userAPI = {
  register: (userData: any) => api.post('/users/register/', userData),
  login: (phone: string, password: string) => api.post('/users/login/', { phone, password }),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data: any) => api.put('/users/profile/', data),
}

// Job API
export const jobAPI = {
  getAllJobs: (params?: any) => api.get('/jobs/', { params }),
  getJobById: (id: number) => api.get(`/jobs/${id}/`),
  createJob: (data: any) => api.post('/jobs/create/', data),
  updateJob: (id: number, data: any) => api.put(`/jobs/${id}/`, data),
  deleteJob: (id: number) => api.delete(`/jobs/${id}/`),
  getMyJobs: () => api.get('/jobs/my-jobs/'),
  getNearbyJobs: (params?: any) => api.get('/jobs/nearby/', { params }),
  updateJobStatus: (id: number, status: string) => api.patch(`/jobs/${id}/status/`, { status }),
}

// Bid API
export const bidAPI = {
  getAllBids: () => api.get('/bids/'),
  createBid: (data: any) => api.post('/bids/create/', data),
  getBidById: (id: number) => api.get(`/bids/${id}/`),
  getBidsForJob: (jobId: number) => api.get(`/bids/job/${jobId}/`),
  acceptBid: (id: number) => api.post(`/bids/${id}/accept/`),
  rejectBid: (id: number) => api.post(`/bids/${id}/reject/`),
  withdrawBid: (id: number) => api.post(`/bids/${id}/withdraw/`),
}

// Rating API
export const ratingAPI = {
  createRating: (data: any) => api.post('/ratings/create/', data),
  getRatingsForUser: (userId: number) => api.get(`/ratings/user/${userId}/`),
}

// AI API
export const aiAPI = {
  budgetEstimate: (data: any) => api.post('/ai/budget/conversation/', data),
  getBudgetQuestion: () => api.get('/ai/budget/conversation/'),
  recommendBids: (jobId: number) => api.get(`/ai/recommend/${jobId}/`),
  visualizeRoom: (data: any) => api.post('/ai/visualize/', data),
  houseDesign: () => api.get('/ai/house-design/'),
  houseDesignConversation: (data: any) => api.post('/ai/house-design/', data),
}

export default api
