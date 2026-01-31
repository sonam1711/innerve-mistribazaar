import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        })
        const { access } = response.data
        localStorage.setItem('access_token', access)
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// User API
export const userAPI = {
  register: (userData: any) => api.post('/users/register/', userData),
  login: (phone: string, password: string) => api.post('/users/login/', { phone, password }),
  profile: () => api.get('/users/profile/'),
  updateProfile: (data: any) => api.patch('/users/profile/', data),
}

// Job API
export const jobAPI = {
  list: (params?: any) => api.get('/jobs/', { params }),
  create: (jobData: any) => api.post('/jobs/create/', jobData),
  detail: (id: number) => api.get(`/jobs/${id}/`),
  update: (id: number, data: any) => api.patch(`/jobs/${id}/`, data),
  delete: (id: number) => api.delete(`/jobs/${id}/`),
  nearby: (params: any) => api.get('/jobs/nearby/', { params }),
}

// Bid API
export const bidAPI = {
  list: () => api.get('/bids/'),
  create: (bidData: any) => api.post('/bids/create/', bidData),
  jobBids: (jobId: number) => api.get(`/bids/job/${jobId}/`),
  accept: (bidId: number) => api.post(`/bids/${bidId}/accept/`),
  reject: (bidId: number) => api.post(`/bids/${bidId}/reject/`),
}

// AI API
export const aiAPI = {
  budgetEstimate: (data: any) => api.post('/ai/budget/conversation/', data),
  houseDesign: (data: any) => api.post('/ai/house-design/conversation/', data),
  generate3D: (data: any) => api.post('/ai/3d-house/generate/', data),
  recommend: (jobId: number) => api.get(`/ai/recommend/${jobId}/`),
}

export default api
