import { useState } from 'react'
import { aiAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { Calculator, Loader } from 'lucide-react'

export default function BudgetEstimatorPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [estimate, setEstimate] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    work_type: 'NEW_CONSTRUCTION',
    area: '',
    quality: 'STANDARD',
    city_tier: '1',
    urgency: 'NORMAL',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await aiAPI.budgetEstimate({
        step: 1,
        data: {
          ...formData,
          area: Number(formData.area),
        },
      })
      
      setEstimate(response.data)
      toast.success('Budget estimated successfully!')
    } catch (error: any) {
      console.error('Budget estimation failed:', error)
      toast.error('Failed to estimate budget. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Budget Estimator</h1>
        <p className="text-slate-400">Get AI-powered cost estimates for your construction project</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Calculator className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-white">Project Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Work Type
              </label>
              <select
                name="work_type"
                value={formData.work_type}
                onChange={handleChange}
                className="input"
              >
                <option value="NEW_CONSTRUCTION">New Construction</option>
                <option value="RENOVATION">Renovation</option>
                <option value="REPAIR">Repair</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Area (sq. ft.)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Enter area in square feet"
                className="input"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quality Level
              </label>
              <select
                name="quality"
                value={formData.quality}
                onChange={handleChange}
                className="input"
              >
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                City Tier
              </label>
              <select
                name="city_tier"
                value={formData.city_tier}
                onChange={handleChange}
                className="input"
              >
                <option value="1">Tier 1 (Metro Cities)</option>
                <option value="2">Tier 2 Cities</option>
                <option value="3">Tier 3 Cities</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Urgency
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="input"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Estimate Budget'
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Estimated Cost</h2>
          
          {!estimate ? (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Fill in the details to get your estimate</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg">
                <p className="text-blue-200 text-sm mb-2">Total Estimated Cost</p>
                <p className="text-4xl font-bold text-white">
                  ₹{estimate.total_cost?.toLocaleString() || 'N/A'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Material Cost</span>
                  <span className="text-white font-medium">
                    ₹{estimate.material_cost?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Labor Cost</span>
                  <span className="text-white font-medium">
                    ₹{estimate.labor_cost?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Miscellaneous</span>
                  <span className="text-white font-medium">
                    ₹{estimate.misc_cost?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-900 border border-yellow-700 p-4 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  <strong>Note:</strong> This is an AI-generated estimate. Actual costs may vary 
                  based on specific requirements, market conditions, and location.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
