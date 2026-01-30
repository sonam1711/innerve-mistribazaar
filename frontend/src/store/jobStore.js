/**
 * Job Store using Zustand
 * Manages job state
 */
import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

export const useJobStore = create((set, get) => ({
  jobs: [],
  currentJob: null,
  isLoading: false,
  filters: {
    status: '',
    job_type: '',
    radius: 50,
  },

  // Fetch jobs
  fetchJobs: async (filters = {}) => {
    set({ isLoading: true })
    try {
      const params = new URLSearchParams({ ...get().filters, ...filters })
      const response = await api.get(`/jobs/?${params}`)
      // Handle paginated response (results array) or direct array
      const jobsData = response.data.results || response.data
      set({ jobs: Array.isArray(jobsData) ? jobsData : [], isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to fetch jobs')
      console.error('Fetch jobs error:', error)
    }
  },

  // Fetch nearby jobs
  fetchNearbyJobs: async (radius = 50) => {
    set({ isLoading: true })
    try {
      const response = await api.get(`/jobs/nearby/?radius=${radius}`)
      // Handle both array response and object with results
      const jobsData = response.data.results || response.data
      set({ jobs: Array.isArray(jobsData) ? jobsData : [], isLoading: false })
      
      // Show message if user needs to update location
      if (response.data.message) {
        toast.info(response.data.message)
      }
    } catch (error) {
      set({ isLoading: false })
      toast.error(error.response?.data?.error || 'Failed to fetch nearby jobs')
    }
  },

  // Fetch single job
  fetchJob: async (id) => {
    set({ isLoading: true })
    try {
      const response = await api.get(`/jobs/${id}/`)
      set({ currentJob: response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to fetch job details')
    }
  },

  // Create job
  createJob: async (jobData) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/jobs/create/', jobData)
      set({ isLoading: false })
      toast.success('Job created successfully!')
      return response.data
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to create job')
      throw error
    }
  },

  // Update job status
  updateJobStatus: async (id, status) => {
    try {
      await api.patch(`/jobs/${id}/status/`, { status })
      toast.success('Job status updated')
      get().fetchJob(id)
    } catch (error) {
      toast.error('Failed to update job status')
    }
  },

  // Set filters
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } })
  },

  // Clear current job
  clearCurrentJob: () => {
    set({ currentJob: null })
  },
}))
