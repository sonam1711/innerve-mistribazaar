import { create } from 'zustand'
import { jobAPI } from '../utils/api'

interface Job {
  id: number
  title: string
  description: string
  category: string
  job_type: string
  budget_min: number
  budget_max: number
  status: string
  latitude: number
  longitude: number
  consumer: any
  created_at: string
}

interface JobState {
  jobs: Job[]
  currentJob: Job | null
  isLoading: boolean
  
  fetchJobs: (params?: any) => Promise<void>
  fetchJob: (id: number) => Promise<void>
  createJob: (jobData: any) => Promise<Job | null>
  updateJobStatus: (id: number, status: string) => Promise<void>
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  currentJob: null,
  isLoading: false,

  fetchJobs: async (params?: any) => {
    set({ isLoading: true })
    try {
      const response = await jobAPI.list(params)
      set({ jobs: response.data.results || response.data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      set({ isLoading: false })
    }
  },

  fetchJob: async (id: number) => {
    set({ isLoading: true })
    try {
      const response = await jobAPI.detail(id)
      set({ currentJob: response.data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch job:', error)
      set({ isLoading: false })
    }
  },

  createJob: async (jobData: any) => {
    set({ isLoading: true })
    try {
      console.log('Creating job with data:', jobData)
      const response = await jobAPI.create(jobData)
      console.log('Job created successfully:', response.data)
      const newJob = response.data
      
      // Update state immediately for real-time UI
      const currentJobs = get().jobs || []
      set({
        jobs: [newJob, ...currentJobs],
        currentJob: newJob,
        isLoading: false,
      })
      
      return newJob
    } catch (error: any) {
      console.error('Failed to create job:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', JSON.stringify(error.response?.data, null, 2))
      set({ isLoading: false })
      return null
    }
  },

  updateJobStatus: async (id: number, status: string) => {
    try {
      await jobAPI.update(id, { status })
      
      // Update jobs list
      const updatedJobs = get().jobs.map(job =>
        job.id === id ? { ...job, status } : job
      )
      set({ jobs: updatedJobs })
      
      // Update current job if it matches
      if (get().currentJob?.id === id) {
        set({ currentJob: { ...get().currentJob!, status } })
      }
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  },
}))
