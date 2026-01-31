/**
 * Bid Store using Zustand
 * Manages bid state
 */
import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

export const useBidStore = create((set, get) => ({
  bids: [],
  jobBids: [],
  recommendations: null,
  isLoading: false,

  // Fetch user's bids
  fetchMyBids: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/bids/')
      set({ bids: response.data.results || response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to fetch bids')
    }
  },

  // Fetch bids for a job
  fetchJobBids: async (jobId) => {
    set({ isLoading: true })
    try {
      const response = await api.get(`/bids/job/${jobId}/`)
      set({ jobBids: response.data.results || response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to fetch job bids')
    }
  },

  // Create bid
  createBid: async (bidData) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/bids/create/', bidData)
      set({ isLoading: false })
      toast.success('Bid submitted successfully!')
      return response.data
    } catch (error) {
      set({ isLoading: false })
      const errorMsg = error.response?.data?.error || 'Failed to submit bid'
      toast.error(errorMsg)
      throw error
    }
  },

  // Accept bid
  acceptBid: async (bidId) => {
    try {
      await api.post(`/bids/${bidId}/accept/`)
      toast.success('Bid accepted!')
      return true
    } catch (error) {
      toast.error('Failed to accept bid')
      return false
    }
  },

  // Reject bid
  rejectBid: async (bidId) => {
    try {
      await api.post(`/bids/${bidId}/reject/`)
      toast.success('Bid rejected')
      return true
    } catch (error) {
      toast.error('Failed to reject bid')
      return false
    }
  },

  // Withdraw bid
  withdrawBid: async (bidId) => {
    try {
      await api.post(`/bids/${bidId}/withdraw/`)
      toast.success('Bid withdrawn')
      get().fetchMyBids()
      return true
    } catch (error) {
      toast.error('Failed to withdraw bid')
      return false
    }
  },

  // Get recommendations
  fetchRecommendations: async (jobId) => {
    set({ isLoading: true })
    try {
      const response = await api.get(`/ai/recommend/${jobId}/`)
      set({ recommendations: response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to fetch recommendations')
    }
  },

  // Clear recommendations
  clearRecommendations: () => {
    set({ recommendations: null })
  },
}))
