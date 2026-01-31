// API endpoints for MISTRI job acceptance workflow
import api from './api'

export interface JobAcceptance {
  id: number
  job: number
  mistri: any
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  note?: string
  created_at: string
}

export const jobAcceptanceAPI = {
  // List all job acceptances for a mistri
  list: () => api.get<JobAcceptance[]>('/bids/acceptances/'),
  
  // Get job acceptances for a specific job
  getByJob: (jobId: number) => api.get<JobAcceptance[]>(`/bids/acceptances/?job=${jobId}`),
  
  // Create a new job acceptance (mistri accepts/rejects a job)
  create: (data: { job: number; status: 'ACCEPTED' | 'REJECTED'; note?: string }) => 
    api.post<JobAcceptance>('/bids/acceptances/create/', data),
  
  // Update a job acceptance status
  update: (id: number, data: { status: 'ACCEPTED' | 'REJECTED'; note?: string }) => 
    api.patch<JobAcceptance>(`/bids/acceptances/${id}/`, data),
}
