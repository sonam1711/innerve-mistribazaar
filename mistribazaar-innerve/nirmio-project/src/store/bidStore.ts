import { create } from 'zustand'
import { bidAPI, aiAPI } from '../utils/api'
import toast from 'react-hot-toast'

interface Bid {
  id: number
  job: number
  bidder: number
  bid_amount: number
  estimated_days: number
  message: string
  status: string
  created_at: string
  job_details?: any
  bidder_details?: any
}

interface BidState {
  bids: Bid[]
  jobBids: Bid[]
  recommendations: any
  isLoading: boolean
  fetchMyBids: () => Promise<void>
  fetchJobBids: (jobId: number) => Promise<void>
  createBid: (bidData: any) => Promise<Bid>
  acceptBid: (bidId: number) => Promise<boolean>
  rejectBid: (bidId: number) => Promise<boolean>
  withdrawBid: (bidId: number) => Promise<boolean>
  fetchRecommendations: (jobId: number) => Promise<void>
}

export const useBidStore = create<BidState>((set) => ({
  bids: [],
  jobBids: [],
  recommendations: null,
  isLoading: false,

  // Fetch user's bids
  fetchMyBids: async () => {
    set({ isLoading: true })
    try {
      const response = await bidAPI.getAllBids()
      set({ bids: response.data.results || response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to fetch bids')
    }
  },

  // Fetch bids for a job
  fetchJobBids: async (jobId: number) => {
    set({ isLoading: true })
    try {
      const response = await bidAPI.getBidsForJob(jobId)
      set({ jobBids: response.data.results || response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to fetch job bids')
    }
  },

  // Create bid
  createBid: async (bidData: any) => {
    set({ isLoading: true })
    try {
      const response = await bidAPI.createBid(bidData)
      set({ isLoading: false })
      toast.success('Bid submitted successfully!')
      return response.data
    } catch (error: any) {
      set({ isLoading: false })
      const errorMsg = error.response?.data?.error || 'Failed to submit bid'
      toast.error(errorMsg)
      throw error
    }
  },

  // Accept bid
  acceptBid: async (bidId: number) => {
    try {
      await bidAPI.acceptBid(bidId)
      toast.success('Bid accepted!')
      return true
    } catch (error) {
      toast.error('Failed to accept bid')
      return false
    }
  },

  // Reject bid
  rejectBid: async (bidId: number) => {
    try {
      await bidAPI.rejectBid(bidId)
      toast.success('Bid rejected')
      return true
    } catch (error) {
      toast.error('Failed to reject bid')
      return false
    }
  },

  // Withdraw bid
  withdrawBid: async (bidId: number) => {
    try {
      await bidAPI.withdrawBid(bidId)
      toast.success('Bid withdrawn')
      // Refresh bids after withdrawal
      const response = await bidAPI.getAllBids()
      set({ bids: response.data.results || response.data })
      return true
    } catch (error) {
      toast.error('Failed to withdraw bid')
      return false
    }
  },

  // Fetch AI recommendations
  fetchRecommendations: async (jobId: number) => {
    try {
      const response = await aiAPI.recommendBids(jobId)
      set({ recommendations: response.data })
    } catch (error) {
      console.error('Failed to fetch recommendations')
    }
  },
}))
