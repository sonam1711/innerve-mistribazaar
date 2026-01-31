import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useJobStore } from '../store/jobStore'
import toast from 'react-hot-toast'
import { Plus, MapPin } from 'lucide-react'
import { getCurrentLocation, type Coordinates } from '../utils/location'

export default function CreateJobPage() {
  const { user } = useAuthStore()
  const { createJob, isLoading } = useJobStore()
  const navigate = useNavigate()
  const [detectingLocation, setDetectingLocation] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'PROJECT',
    job_type: 'CONSTRUCTION',
    budget_min: '',
    budget_max: '',
    address: '',
    latitude: user?.latitude || 28.6139,
    longitude: user?.longitude || 77.2090,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // If category changes, reset job_type to appropriate default
    if (name === 'category') {
      const defaultJobType = value === 'PROJECT' ? 'CONSTRUCTION' : 'REPAIR'
      setFormData(prev => ({ ...prev, category: value, job_type: defaultJobType }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleDetectLocation = async () => {
    setDetectingLocation(true)
    try {
      const coords: Coordinates = await getCurrentLocation()
      setFormData(prev => ({
        ...prev,
        latitude: Number(coords.latitude.toFixed(6)),
        longitude: Number(coords.longitude.toFixed(6)),
      }))
      toast.success(`Location detected: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to detect location')
    } finally {
      setDetectingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (Number(formData.budget_min) >= Number(formData.budget_max)) {
      toast.error('Maximum budget must be greater than minimum budget')
      return
    }

    // Round coordinates to 6 decimal places to match backend DecimalField(max_digits=9, decimal_places=6)
    const jobData = {
      ...formData,
      budget_min: Number(formData.budget_min),
      budget_max: Number(formData.budget_max),
      latitude: Number(Number(formData.latitude).toFixed(6)),
      longitude: Number(Number(formData.longitude).toFixed(6)),
    }

    console.log('Submitting job data:', JSON.stringify(jobData, null, 2))

    const newJob = await createJob(jobData)

    if (newJob) {
      toast.success('Job created successfully!')
      navigate(`/jobs/${newJob.id}`)
    } else {
      toast.error('Failed to create job. Please check console for details.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Post a New Job</h1>
        <p className="text-slate-400">Fill in the details for your construction project</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., House Construction in Delhi"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project requirements, timeline, and expectations..."
              rows={5}
              className="input resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="PROJECT">Project (Construction)</option>
                <option value="JOB">Job (Repair/Maintenance)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Job Type *
              </label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="input"
                required
              >
                {formData.category === 'PROJECT' ? (
                  <>
                    <option value="CONSTRUCTION">Construction</option>
                    <option value="RENOVATION">Renovation</option>
                  </>
                ) : (
                  <>
                    <option value="REPAIR">Repair</option>
                    <option value="PAINTING">Painting</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="TILING">Tiling</option>
                    <option value="OTHER">Other</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Complete address with landmarks"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location Coordinates
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                className="input flex-1"
                step="0.000001"
                required
              />
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                className="input flex-1"
                step="0.000001"
                required
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              >
                <MapPin className="w-5 h-5" />
                {detectingLocation ? 'Detecting...' : 'Detect GPS'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Click "Detect GPS" to use your current location
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Minimum Budget (₹) *
              </label>
              <input
                type="number"
                name="budget_min"
                value={formData.budget_min}
                onChange={handleChange}
                placeholder="50000"
                className="input"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Maximum Budget (₹) *
              </label>
              <input
                type="number"
                name="budget_max"
                value={formData.budget_max}
                onChange={handleChange}
                placeholder="100000"
                className="input"
                required
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {isLoading ? 'Creating...' : 'Create Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
