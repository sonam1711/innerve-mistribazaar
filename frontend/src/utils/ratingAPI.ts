// Rating system API endpoints
import api from './api'

export interface Rating {
  id: number
  job: number
  rater: any
  ratee: any
  rating: number
  review?: string
  created_at: string
}

export const ratingAPI = {
  // Create a new rating
  create: (data: { job: number; ratee: number; rating: number; review?: string }) => 
    api.post<Rating>('/ratings/', data),
  
  // Get ratings for a specific job
  getJobRatings: (jobId: number) => api.get<Rating[]>(`/ratings/?job=${jobId}`),
  
  // Get ratings for a user (as ratee)
  getUserRatings: (userId: number) => api.get<Rating[]>(`/ratings/?ratee=${userId}`),
  
  // Get ratings given by a user (as rater)
  getGivenRatings: (userId: number) => api.get<Rating[]>(`/ratings/?rater=${userId}`),
}
