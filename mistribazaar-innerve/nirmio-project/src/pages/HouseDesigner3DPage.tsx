import { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import { Download, Home, ArrowLeft, ArrowRight, Check, Copy } from 'lucide-react'

interface HouseFormData {
  plot_length: number | string
  plot_width: number | string
  num_floors: number
  num_bedrooms: number
  num_bathrooms: number
  kitchen_type: string
  living_areas: string[]
  outdoor_spaces: string[]
  parking_spaces: number
  architectural_style: string
  special_features: string[]
  roof_type: string
  additional_requirements: string
}

interface GeneratedScript {
  success: boolean
  script: string
  filename: string
  download_url: string
  message: string
}

const HouseDesigner3DPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null)
  
  // Form data for all 12 questions
  const [formData, setFormData] = useState<HouseFormData>({
    plot_length: '',
    plot_width: '',
    num_floors: 1,
    num_bedrooms: 2,
    num_bathrooms: 1,
    kitchen_type: '',
    living_areas: [],
    outdoor_spaces: [],
    parking_spaces: 0,
    architectural_style: '',
    special_features: [],
    roof_type: '',
    additional_requirements: ''
  })

  const totalSteps = 12

  // Update form data
  const updateFormData = (field: keyof HouseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle multi-select (checkboxes)
  const toggleArrayValue = (field: 'living_areas' | 'outdoor_spaces' | 'special_features', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  // Navigate between steps
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Validate current step
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return Number(formData.plot_length) > 0 && Number(formData.plot_width) > 0
      case 2:
        return formData.num_floors > 0
      case 3:
        return formData.num_bedrooms > 0
      case 4:
        return formData.num_bathrooms > 0
      case 5:
        return formData.kitchen_type.trim() !== ''
      case 6:
        return formData.living_areas.length > 0
      case 7:
        return true // outdoor spaces optional
      case 8:
        return true // parking optional
      case 9:
        return formData.architectural_style !== ''
      case 10:
        return true // special features optional
      case 11:
        return formData.roof_type !== ''
      case 12:
        return true // additional requirements optional
      default:
        return true
    }
  }

  // Submit form and generate 3D model
  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      const response = await api.post<GeneratedScript>('/ai/3d-house/generate/', formData)
      
      if (response.data.success) {
        setGeneratedScript(response.data)
        toast.success('3D house model script generated successfully!')
      } else {
        toast.error('Failed to generate 3D model')
      }
    } catch (error: any) {
      console.error('Error generating 3D model:', error)
      toast.error(error.response?.data?.error || 'Failed to generate 3D model')
    } finally {
      setLoading(false)
    }
  }

  // Download the generated script
  const handleDownload = () => {
    if (generatedScript) {
      window.open(`${api.defaults.baseURL}${generatedScript.download_url}`, '_blank')
    }
  }

  // Copy script to clipboard
  const copyToClipboard = () => {
    if (generatedScript) {
      navigator.clipboard.writeText(generatedScript.script)
      toast.success('Script copied to clipboard!')
    }
  }

  // Render question based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Plot Dimensions</h3>
            <p className="text-gray-600">Enter the dimensions of your plot in meters</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Length (meters)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.plot_length}
                  onChange={(e) => updateFormData('plot_length', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Width (meters)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.plot_width}
                  onChange={(e) => updateFormData('plot_width', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 15"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Number of Floors</h3>
            <p className="text-gray-600">How many floors do you want in your house?</p>
            <div className="flex gap-4 flex-wrap">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => updateFormData('num_floors', num)}
                  className={`px-6 py-3 rounded-lg border-2 transition ${
                    formData.num_floors === num
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {num} Floor{num > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Bedrooms</h3>
            <p className="text-gray-600">How many bedrooms do you need?</p>
            <div className="flex gap-4 flex-wrap">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => updateFormData('num_bedrooms', num)}
                  className={`px-6 py-3 rounded-lg border-2 transition ${
                    formData.num_bedrooms === num
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {num} BHK
                </button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Bathrooms</h3>
            <p className="text-gray-600">How many bathrooms do you need?</p>
            <div className="flex gap-4 flex-wrap">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => updateFormData('num_bathrooms', num)}
                  className={`px-6 py-3 rounded-lg border-2 transition ${
                    formData.num_bathrooms === num
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Kitchen Type</h3>
            <p className="text-gray-600">What type of kitchen do you prefer?</p>
            <div className="grid grid-cols-1 gap-3">
              {['Modern open kitchen', 'Traditional closed kitchen', 'Island kitchen', 'L-shaped kitchen', 'U-shaped kitchen'].map(type => (
                <button
                  key={type}
                  onClick={() => updateFormData('kitchen_type', type)}
                  className={`px-6 py-3 rounded-lg border-2 text-left transition ${
                    formData.kitchen_type === type
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Living Areas</h3>
            <p className="text-gray-600">Select the living areas you want (multiple selection allowed)</p>
            <div className="grid grid-cols-2 gap-3">
              {['Living room', 'Dining room', 'Family room', 'Study room', 'Prayer room', 'Home theater'].map(area => (
                <label
                  key={area}
                  className={`px-4 py-3 rounded-lg border-2 cursor-pointer transition flex items-center ${
                    formData.living_areas.includes(area)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.living_areas.includes(area)}
                    onChange={() => toggleArrayValue('living_areas', area)}
                    className="mr-2"
                  />
                  {area}
                </label>
              ))}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Outdoor Spaces</h3>
            <p className="text-gray-600">Select outdoor spaces (multiple selection allowed, optional)</p>
            <div className="grid grid-cols-2 gap-3">
              {['Balcony', 'Terrace', 'Garden', 'Courtyard', 'Patio', 'Swimming pool'].map(space => (
                <label
                  key={space}
                  className={`px-4 py-3 rounded-lg border-2 cursor-pointer transition flex items-center ${
                    formData.outdoor_spaces.includes(space)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.outdoor_spaces.includes(space)}
                    onChange={() => toggleArrayValue('outdoor_spaces', space)}
                    className="mr-2"
                  />
                  {space}
                </label>
              ))}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Parking Spaces</h3>
            <p className="text-gray-600">How many parking spaces do you need?</p>
            <div className="flex gap-4 flex-wrap">
              {[0, 1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => updateFormData('parking_spaces', num)}
                  className={`px-6 py-3 rounded-lg border-2 transition ${
                    formData.parking_spaces === num
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {num === 0 ? 'None' : num}
                </button>
              ))}
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Architectural Style</h3>
            <p className="text-gray-600">Choose your preferred architectural style</p>
            <div className="grid grid-cols-1 gap-3">
              {['Modern', 'Contemporary', 'Traditional Indian', 'Colonial', 'Mediterranean', 'Minimalist', 'Farmhouse'].map(style => (
                <button
                  key={style}
                  onClick={() => updateFormData('architectural_style', style)}
                  className={`px-6 py-3 rounded-lg border-2 text-left transition ${
                    formData.architectural_style === style
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Special Features</h3>
            <p className="text-gray-600">Select special features (optional, multiple selection allowed)</p>
            <div className="grid grid-cols-2 gap-3">
              {['Solar panels', 'Rainwater harvesting', 'Smart home system', 'Home automation', 'Green building', 'Earthquake resistant', 'Energy efficient'].map(feature => (
                <label
                  key={feature}
                  className={`px-4 py-3 rounded-lg border-2 cursor-pointer transition flex items-center ${
                    formData.special_features.includes(feature)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.special_features.includes(feature)}
                    onChange={() => toggleArrayValue('special_features', feature)}
                    className="mr-2"
                  />
                  {feature}
                </label>
              ))}
            </div>
          </div>
        )

      case 11:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Roof Type</h3>
            <p className="text-gray-600">Choose your preferred roof type</p>
            <div className="grid grid-cols-1 gap-3">
              {['Flat', 'Sloped/Gable', 'Hip roof', 'Terrace', 'Green roof'].map(type => (
                <button
                  key={type}
                  onClick={() => updateFormData('roof_type', type)}
                  className={`px-6 py-3 rounded-lg border-2 text-left transition ${
                    formData.roof_type === type
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )

      case 12:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Additional Requirements</h3>
            <p className="text-gray-600">Any additional requirements or special considerations? (Optional)</p>
            <textarea
              value={formData.additional_requirements}
              onChange={(e) => updateFormData('additional_requirements', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              placeholder="e.g., Vastu compliant layout, wheelchair accessible, natural lighting throughout, etc."
            />
          </div>
        )

      default:
        return null
    }
  }

  // Show generated script result
  if (generatedScript) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">3D House Model Generated!</h1>
              <button
                onClick={() => {
                  setGeneratedScript(null)
                  setCurrentStep(1)
                }}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Create New Design
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  Your Blender Python script has been generated successfully!
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">How to use this script:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Download the script file using the button below</li>
                  <li>Open Blender (version 3.0 or higher recommended)</li>
                  <li>Go to Scripting workspace in Blender</li>
                  <li>Open the downloaded .py file or paste the script</li>
                  <li>Click "Run Script" to generate your 3D house model</li>
                </ol>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md hover:shadow-lg"
                >
                  <Download size={20} />
                  Download Script
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <Copy size={20} />
                  Copy to Clipboard
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Script Preview:</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-96 text-sm font-mono">
                  {generatedScript.script}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Home size={32} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">3D House Designer</h1>
              <p className="text-gray-600">Answer 12 questions to generate your Blender 3D model</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="font-medium">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Content */}
          <div className="mb-8 min-h-[320px]">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm hover:shadow'
              }`}
            >
              <ArrowLeft size={20} />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                  isStepValid()
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !isStepValid()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                  loading || !isStepValid()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Generate 3D Model
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HouseDesigner3DPage
