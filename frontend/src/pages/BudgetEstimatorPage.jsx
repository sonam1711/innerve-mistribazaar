import { useState } from 'react'
import api from '../utils/api'
import { Sparkles, ArrowRight, ArrowLeft, Calculator } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const BudgetEstimatorPage = () => {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [estimate, setEstimate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const startFlow = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/ai/budget/conversation/')
      setCurrentQuestion(response.data)
      setStep(1)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const handleAnswer = async (answer) => {
    const newData = { ...data, [currentQuestion.field]: answer }
    setData(newData)

    setIsLoading(true)
    try {
      const response = await api.post('/ai/budget/conversation/', {
        step: currentQuestion.next_step,
        data: newData
      })

      if (response.data.status === 'complete') {
        setEstimate(response.data.estimate)
        setCurrentQuestion(null)
      } else {
        setCurrentQuestion(response.data)
        setStep(step + 1)
      }
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const resetFlow = () => {
    setStep(1)
    setData({})
    setCurrentQuestion(null)
    setEstimate(null)
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Budget Estimator</h1>
          <p className="text-gray-600">Get an instant budget estimate for your construction project</p>
        </div>

        {!currentQuestion && !estimate && (
          <div className="card text-center py-12">
            <Calculator className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Ready to estimate your budget?</h3>
            <p className="text-gray-600 mb-6">
              Answer a few quick questions and get a detailed budget breakdown instantly
            </p>
            <button onClick={startFlow} className="btn-primary inline-flex items-center">
              Start Estimation
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {isLoading && <LoadingSpinner text="Processing..." />}

        {currentQuestion && !isLoading && (
          <div className="card">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Question {step} of 5</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary-600 rounded-full transition-all"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-6">{currentQuestion.question}</h2>

            {currentQuestion.input_type === 'number' ? (
              <div className="space-y-4">
                <input
                  type="number"
                  className="input-field text-lg"
                  placeholder="Enter value..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handleAnswer(e.target.value)
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={(e) => {
                    const input = e.target.parentElement.querySelector('input')
                    if (input.value) handleAnswer(input.value)
                  }}
                  className="btn-primary w-full"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition text-left"
                  >
                    <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
                  </button>
                ))}
              </div>
            )}

            {step > 1 && (
              <button
                onClick={() => {
                  setStep(step - 1)
                  // Handle going back logic
                }}
                className="mt-6 flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            )}
          </div>
        )}

        {estimate && !isLoading && (
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
              <h2 className="text-2xl font-bold text-primary-900 mb-4">Your Budget Estimate</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-primary-700 mb-1">Minimum Budget</p>
                  <p className="text-3xl font-bold text-primary-900">₹{estimate.budget_min?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-700 mb-1">Maximum Budget</p>
                  <p className="text-3xl font-bold text-primary-900">₹{estimate.budget_max?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Base Rate per sq ft</span>
                  <span className="font-semibold">₹{estimate.breakdown?.base_rate_per_sqft?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Total Area</span>
                  <span className="font-semibold">{estimate.breakdown?.total_area_sqft} sq ft</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Base Cost</span>
                  <span className="font-semibold">₹{estimate.breakdown?.base_cost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">City Multiplier</span>
                  <span className="font-semibold">{estimate.breakdown?.city_multiplier}x</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Urgency Multiplier</span>
                  <span className="font-semibold">{estimate.breakdown?.urgency_multiplier}x</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {estimate.required_skills?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Estimated Duration</h3>
              <p className="text-3xl font-bold text-gray-900">{estimate.estimated_duration_days} days</p>
            </div>

            <div className="card bg-blue-50 border-2 border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Disclaimer:</strong> {estimate.disclaimer}
              </p>
            </div>

            <button onClick={resetFlow} className="w-full btn-primary">
              Start New Estimation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetEstimatorPage
