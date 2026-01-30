/**
 * Job Store using Zustand
 * Manages job listings and filtering
 */
import { create } from 'zustand'
import { jobAPI } from '../utils/api'

interface Job {
  id: number
  title: string
  description: string
  job_type: string
  status: string
  budget_min: number
  budget_max: number
  latitude: number
  longitude: number
  address: string
  created_at: string
  deadline?: string
  distance_km?: number
  bid_count?: number
  image_count?: number
  images?: any[]
  consumer?: number
  consumer_details?: any
}

interface JobState {
  jobs: Job[]
  currentJob: Job | null
  isLoading: boolean
  filters: {
    job_type: string
    status: string
    budget_min: string
    budget_max: string
    radius?: number
  }
  
  fetchJobs: (filters?: any) => Promise<void>
  fetchNearbyJobs: (latitude?: number, longitude?: number, radius?: number) => Promise<void>
  fetchMyJobs: () => Promise<void>
  fetchJob: (id: number) => Promise<void>
  fetchJobById: (id: number) => Promise<Job | null>
  createJob: (jobData: any) => Promise<any>
  updateJob: (id: number, jobData: any) => Promise<any>
  deleteJob: (id: number) => Promise<boolean>
  updateJobStatus: (id: number, status: string) => Promise<boolean>
  setFilters: (filters: any) => void
  clearFilters: () => void
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  currentJob: null,
  isLoading: false,
  filters: {
    job_type: '',
    status: '',
    budget_min: '',
    budget_max: '',
  },

  fetchJobs: async (filters = {}) => {
    set({ isLoading: true })
    try {
      const response = await jobAPI.getAllJobs(filters)
      set({ jobs: response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to fetch jobs')
    }
  },

  fetchNearbyJobs: async (latitude, longitude, radius = 50) => {
    set({ isLoading: true })
    try {
      const response = await jobAPI.getNearbyJobs({ latitude, longitude, radius })
      set({ jobs: response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to fetch nearby jobs')
    }
  },

  fetchMyJobs: async () => {
    set({ isLoading: true })
    try {
      const response = await jobAPI.getMyJobs()
      set({ jobs: response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to fetch your jobs')
    }
  },

  fetchJob: async (id: number) => {
    set({ isLoading: true })
    try {
      const response = await jobAPI.getJobById(id)
      set({ currentJob: response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to fetch job details')
    }
  },

  fetchJobById: async (id: number) => {
    set({ isLoading: true })
    try {
      const response = await jobAPI.getJobById(id)
      set({ currentJob: response.data, isLoading: false })
      return response.data
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to fetch job details')
      return null
    }
  },

  createJob: async (jobData: any) => {
    set({ isLoading: true })
    try {
      const response = await jobAPI.createJob(jobData)
      set({ isLoading: false })
      return response.data
    } catch (error: any) {
      set({ isLoading: false })
      console.error(error.response?.data?.error || 'Failed to create job')
      return null
    }
  },

  updateJob: async (id: number, jobData: any) => {
    set({ isLoading: true })
    try {
      const response = await jobAPI.updateJob(id, jobData)
      set({ isLoading: false })
      return response.data
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to update job')
      return null
    }
  },

  deleteJob: async (id: number) => {
    set({ isLoading: true })
    try {
      await jobAPI.deleteJob(id)
      set({ isLoading: false })
      const jobs = get().jobs.filter(job => job.id !== id)
      set({ jobs })
      return true
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to delete job')
      return false
    }
  },

  updateJobStatus: async (id: number, status: string) => {
    try {
      await jobAPI.updateJobStatus(id, status)
      get().fetchJobById(id)
      return true
    } catch (error) {
      console.error('Failed to update job status')
      return false
    }
  },

  setFilters: (filters: any) => {
    set({ filters })
  },

  clearFilters: () => {
    set({ 
      filters: {
        job_type: '',
        status: '',
        budget_min: '',
        budget_max: '',
      }
    })
  },
}))
