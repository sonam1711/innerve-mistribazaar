import { create } from 'zustand'
import { ratingAPI, type Rating } from '../utils/ratingAPI'
import toast from 'react-hot-toast'

interface RatingState {
  ratings: Rating[]
  isLoading: boolean
  
  fetchJobRatings: (jobId: number) => Promise<void>
  fetchUserRatings: (userId: number) => Promise<void>
  createRating: (data: { job: number; ratee: number; rating: number; review?: string }) => Promise<boolean>
}

export const useRatingStore = create<RatingState>((set) => ({
  ratings: [],
  isLoading: false,

  fetchJobRatings: async (jobId: number) => {
    set({ isLoading: true })
    try {
      const response = await ratingAPI.getJobRatings(jobId)
      set({ ratings: response.data, isLoading: false })
    } catch (error: any) {
      console.error('Failed to fetch job ratings:', error)
      set({ isLoading: false })
    }
  },

  fetchUserRatings: async (userId: number) => {
    set({ isLoading: true })
    try {
      const response = await ratingAPI.getUserRatings(userId)
      set({ ratings: response.data, isLoading: false })
    } catch (error: any) {
      console.error('Failed to fetch user ratings:', error)
      set({ isLoading: false })
    }
  },

  createRating: async (data) => {
    try {
      await ratingAPI.create(data)
      toast.success('Rating submitted successfully!')
      return true
    } catch (error: any) {
      console.error('Failed to create rating:', error)
      toast.error(error.response?.data?.error || 'Failed to submit rating')
      return false
    }
  },
}))
