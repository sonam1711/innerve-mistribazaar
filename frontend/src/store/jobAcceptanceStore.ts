import { create } from 'zustand'
import { jobAcceptanceAPI, type JobAcceptance } from '../utils/jobAcceptanceAPI'
import toast from 'react-hot-toast'

interface JobAcceptanceState {
  acceptances: JobAcceptance[]
  isLoading: boolean
  
  fetchAcceptances: () => Promise<void>
  fetchJobAcceptances: (jobId: number) => Promise<void>
  acceptJob: (jobId: number, message?: string) => Promise<boolean>
  rejectJob: (jobId: number, message?: string) => Promise<boolean>
}

export const useJobAcceptanceStore = create<JobAcceptanceState>((set) => ({
  acceptances: [],
  isLoading: false,

  fetchAcceptances: async () => {
    set({ isLoading: true })
    try {
      const response = await jobAcceptanceAPI.list()
      set({ acceptances: response.data, isLoading: false })
    } catch (error: any) {
      console.error('Failed to fetch job acceptances:', error)
      set({ isLoading: false })
      toast.error(error.response?.data?.error || 'Failed to fetch job acceptances')
    }
  },

  fetchJobAcceptances: async (jobId: number) => {
    set({ isLoading: true })
    try {
      const response = await jobAcceptanceAPI.getByJob(jobId)
      set({ acceptances: response.data, isLoading: false })
    } catch (error: any) {
      console.error('Failed to fetch job acceptances:', error)
      set({ isLoading: false })
    }
  },

  acceptJob: async (jobId: number, message?: string) => {
    try {
      await jobAcceptanceAPI.create({
        job: jobId,
        status: 'ACCEPTED',
        note: message,
      })
      toast.success('Job accepted successfully!')
      // Refresh the acceptances list to show the new acceptance
      const response = await jobAcceptanceAPI.list()
      set({ acceptances: response.data })
      return true
    } catch (error: any) {
      console.error('Failed to accept job:', error)
      console.error('Error response:', error.response?.data)
      console.error('Full error data:', JSON.stringify(error.response?.data, null, 2))
      
      // Extract error message from various possible formats
      const errorData = error.response?.data
      let errorMsg = 'Failed to accept job'
      
      if (errorData?.non_field_errors && errorData.non_field_errors.length > 0) {
        errorMsg = errorData.non_field_errors[0]
        console.error('Validation error:', errorMsg)
      } else if (errorData?.error) {
        errorMsg = errorData.error
      } else if (errorData?.detail) {
        errorMsg = errorData.detail
      } else if (typeof errorData === 'string') {
        errorMsg = errorData
      }
      
      toast.error(errorMsg)
      return false
    }
  },

  rejectJob: async (jobId: number, message?: string) => {
    try {
      await jobAcceptanceAPI.create({
        job: jobId,
        status: 'REJECTED',
        note: message,
      })
      toast.success('Job rejected')
      // Refresh the acceptances list to show the new rejection
      const response = await jobAcceptanceAPI.list()
      set({ acceptances: response.data })
      return true
    } catch (error: any) {
      console.error('Failed to reject job:', error)
      toast.error(error.response?.data?.error || 'Failed to reject job')
      return false
    }
  },
}))
