import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBidStore } from '../store/bidStore'
import { useJobAcceptanceStore } from '../store/jobAcceptanceStore'
import { DollarSign, Clock, CheckCircle, XCircle, Briefcase } from 'lucide-react'

export default function BidsPage() {
  const { user } = useAuthStore()
  const { bids, isLoading: bidsLoading, fetchBids } = useBidStore()
  const { acceptances, isLoading: acceptancesLoading, fetchAcceptances } = useJobAcceptanceStore()
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending')

  useEffect(() => {
    if (user?.role === 'MISTRI') {
      fetchAcceptances()
    } else {
      fetchBids()
    }
  }, [user, fetchAcceptances, fetchBids])

  const isMistri = user?.role === 'MISTRI'
  const isLoading = isMistri ? acceptancesLoading : bidsLoading
  
  // For MISTRI: use acceptances, for others: use bids
  const rawItems = isMistri ? acceptances : bids
  const items = Array.isArray(rawItems) ? rawItems : []
  
  const pendingItems = items.filter(b => b.status === 'PENDING')
  const acceptedItems = items.filter(b => b.status === 'ACCEPTED')
  const rejectedItems = items.filter(b => b.status === 'REJECTED')

  // Get items for active tab
  const displayItems = activeTab === 'pending' ? pendingItems :
                       activeTab === 'accepted' ? acceptedItems :
                       rejectedItems

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isMistri ? 'My Jobs' : 'My Bids'}
        </h1>
        <p className="text-slate-400">
          {isMistri 
            ? 'Track your accepted and pending jobs'
            : 'Track your submitted bids and their status'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => setActiveTab('pending')}
          className={`card hover:border-yellow-500 transition cursor-pointer ${activeTab === 'pending' ? 'border-yellow-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingItems.length}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('accepted')}
          className={`card hover:border-green-500 transition cursor-pointer ${activeTab === 'accepted' ? 'border-green-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Accepted</p>
              <p className="text-2xl font-bold text-white">{acceptedItems.length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`card hover:border-red-500 transition cursor-pointer ${activeTab === 'rejected' ? 'border-red-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Rejected</p>
              <p className="text-2xl font-bold text-white">{rejectedItems.length}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </button>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">
            {activeTab === 'pending' && (isMistri 
              ? "No pending job responses"
              : "No pending bids")}
            {activeTab === 'accepted' && (isMistri 
              ? "No accepted jobs yet"
              : "No accepted bids yet")}
            {activeTab === 'rejected' && (isMistri 
              ? "No rejected job responses"
              : "No rejected bids")}
          </p>
          {activeTab === 'pending' && (
            <Link to="/jobs" className="btn-primary inline-block">
              Browse Available Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayItems.map((item) => (
            <div key={item.id} className="card hover:border-blue-600 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link
                    to={`/jobs/${item.job}`}
                    className="text-lg font-semibold text-white hover:text-blue-400 transition"
                  >
                    Job #{item.job}
                  </Link>
                  <p className="text-slate-400 text-sm mt-1">
                    {isMistri ? (item as any).note || 'No note' : (item as any).message}
                  </p>
                </div>
                <span className={`badge ${
                  item.status === 'PENDING' ? 'bg-yellow-900 text-yellow-300' :
                  item.status === 'ACCEPTED' ? 'bg-green-900 text-green-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                {!isMistri && (
                  <div className="flex items-center text-green-400">
                    <DollarSign className="w-5 h-5 mr-1" />
                    <span className="text-xl font-semibold">₹{(item as any).bid_amount.toLocaleString()}</span>
                  </div>
                )}
                <span className="text-sm text-slate-500">
                  {isMistri ? 'Responded' : 'Submitted'} {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
