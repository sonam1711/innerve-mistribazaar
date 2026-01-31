import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import { useBidStore } from '../store/bidStore'
import { useJobAcceptanceStore } from '../store/jobAcceptanceStore'
import toast from 'react-hot-toast'
import { DollarSign, Calendar, User, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { currentJob, fetchJob, isLoading } = useJobStore()
  const { bids, fetchJobBids, createBid } = useBidStore()
  const { acceptJob, rejectJob } = useJobAcceptanceStore()
  const navigate = useNavigate()

  const [bidAmount, setBidAmount] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [isSubmittingBid, setIsSubmittingBid] = useState(false)
  const [acceptanceMessage, setAcceptanceMessage] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchJob(Number(id))
      fetchJobBids(Number(id))
    }
  }, [id])

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingBid(true)

    const success = await createBid({
      job: Number(id),
      bid_amount: Number(bidAmount),
      estimated_days: Number(estimatedDays),
      message: bidMessage,
    })

    setIsSubmittingBid(false)

    if (success) {
      toast.success('Bid submitted successfully!')
      setBidAmount('')
      setEstimatedDays('')
      setBidMessage('')
      fetchJobBids(Number(id))
    } else {
      // Check if the job is JOB category (not PROJECT)
      if (currentJob?.category === 'JOB') {
        toast.error('This is a small repair job that does not accept bids. Only direct acceptance by workers.')
      } else {
        toast.error('Failed to submit bid. You may have already bid on this job or the job is no longer open.')
      }
    }
  }

  const handleAcceptJob = async () => {
    setIsAccepting(true)
    const success = await acceptJob(Number(id), acceptanceMessage)
    setIsAccepting(false)
    if (success) {
      setAcceptanceMessage('')
      navigate('/bids')
    }
  }

  const handleRejectJob = async () => {
    setIsAccepting(true)
    const success = await rejectJob(Number(id), acceptanceMessage || 'Not available')
    setIsAccepting(false)
    if (success) {
      navigate('/bids')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!currentJob) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-slate-400">Job not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-white">{currentJob.title}</h1>
              <span className={`badge ${
                currentJob.status === 'OPEN' ? 'badge-open' :
                currentJob.status === 'IN_PROGRESS' ? 'badge-in-progress' :
                'badge-completed'
              }`}>
                {currentJob.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-slate-300">
                <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Budget Range</p>
                  <p className="font-medium">
                    ₹{currentJob.budget_min.toLocaleString()} - ₹{currentJob.budget_max.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-slate-300">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Posted</p>
                  <p className="font-medium">{new Date(currentJob.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
              <p className="text-slate-300 whitespace-pre-line">{currentJob.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Category</p>
                <p className="text-white font-medium">{currentJob.category}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Job Type</p>
                <p className="text-white font-medium">{currentJob.job_type}</p>
              </div>
            </div>
          </div>

          {/* Bids Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">
              Bids ({bids.length})
            </h2>

            {bids.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No bids yet</p>
            ) : (
              <div className="space-y-3">
                {bids.map((bid) => (
                  <div key={bid.id} className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-slate-400 mr-2" />
                        <span className="font-medium text-white">{bid.bidder.name}</span>
                      </div>
                      <span className="text-green-400 font-semibold">
                        ₹{bid.bid_amount.toLocaleString()}
                      </span>
                    </div>
                    {bid.estimated_days && (
                      <p className="text-slate-400 text-sm mb-1">
                        Estimated: {bid.estimated_days} days
                      </p>
                    )}
                    <p className="text-slate-300 text-sm">{bid.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Submitted {new Date(bid.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Submit Bid Form (for CONTRACTOR/TRADER on PROJECT category jobs only) */}
          {(user?.role === 'CONTRACTOR' || user?.role === 'TRADER') && 
           currentJob.status === 'OPEN' && 
           currentJob.category === 'PROJECT' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Submit Your Bid</h2>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bid Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter your bid amount"
                    className="input"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Estimated Days *
                  </label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    placeholder="How many days to complete?"
                    className="input"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    placeholder="Describe your approach and timeline..."
                    rows={4}
                    className="input resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBid}
                  className="w-full btn-primary"
                >
                  {isSubmittingBid ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            </div>
          )}

          {/* MISTRI Job Acceptance (for MISTRI only) */}
          {user?.role === 'MISTRI' && currentJob.status === 'OPEN' && currentJob.category === 'JOB' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Accept This Job?</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={acceptanceMessage}
                    onChange={(e) => setAcceptanceMessage(e.target.value)}
                    placeholder="Add a message for the job poster..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAcceptJob}
                    disabled={isAccepting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isAccepting ? 'Processing...' : 'Accept Job'}
                  </button>
                  <button
                    onClick={handleRejectJob}
                    disabled={isAccepting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    {isAccepting ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Job Poster Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Posted By</h2>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">{currentJob.consumer?.name || 'Loading...'}</p>
                <p className="text-sm text-slate-400">{currentJob.consumer?.phone || ''}</p>
              </div>
            </div>
            <div className="flex items-center text-yellow-400">
              <span className="mr-1">★</span>
              <span>{currentJob.consumer?.rating || 0} Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
