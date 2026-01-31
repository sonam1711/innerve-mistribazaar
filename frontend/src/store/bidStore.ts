import { create } from 'zustand'
import { bidAPI } from '../utils/api'

interface Bid {
  id: number
  job: number
  bidder: any
  bid_amount: number
  estimated_days?: number
  message: string
  status: string
  created_at: string
}

interface BidState {
  bids: Bid[]
  isLoading: boolean
  
  fetchBids: () => Promise<void>
  fetchJobBids: (jobId: number) => Promise<void>
  createBid: (bidData: any) => Promise<boolean>
  acceptBid: (bidId: number) => Promise<void>
  rejectBid: (bidId: number) => Promise<void>
}

export const useBidStore = create<BidState>((set, get) => ({
  bids: [],
  isLoading: false,

  fetchBids: async () => {
    set({ isLoading: true })
    try {
      const response = await bidAPI.list()
      set({ bids: response.data.results || response.data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch bids:', error)
      set({ isLoading: false })
    }
  },

  fetchJobBids: async (jobId: number) => {
    set({ isLoading: true })
    try {
      const response = await bidAPI.jobBids(jobId)
      set({ bids: response.data.results || response.data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch job bids:', error)
      set({ isLoading: false })
    }
  },

  createBid: async (bidData: any) => {
    set({ isLoading: true })
    try {
      const response = await bidAPI.create(bidData)
      const newBid = response.data
      
      // Update state immediately for real-time UI
      const currentBids = get().bids || []
      set({
        bids: [newBid, ...currentBids],
        isLoading: false,
      })
      
      return true
    } catch (error: any) {
      console.error('Failed to create bid:', error)
      console.error('Error response:', error.response?.data)
      set({ isLoading: false })
      return false
    }
  },

  acceptBid: async (bidId: number) => {
    try {
      await bidAPI.accept(bidId)
      const updatedBids = get().bids.map(bid =>
        bid.id === bidId ? { ...bid, status: 'ACCEPTED' } : bid
      )
      set({ bids: updatedBids })
    } catch (error) {
      console.error('Failed to accept bid:', error)
    }
  },

  rejectBid: async (bidId: number) => {
    try {
      await bidAPI.reject(bidId)
      const updatedBids = get().bids.map(bid =>
        bid.id === bidId ? { ...bid, status: 'REJECTED' } : bid
      )
      set({ bids: updatedBids })
    } catch (error) {
      console.error('Failed to reject bid:', error)
    }
  },
}))
