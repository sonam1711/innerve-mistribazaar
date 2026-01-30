import { useState } from 'react'
import { aiAPI } from '../utils/api'
import { Sparkles, ArrowRight, Calculator } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

interface Question {
  question: string
  field: string
  input_type: string
  options?: string[]
  next_step: number
}

interface Estimate {
  total_budget: number
  breakdown: Record<string, number>
  recommendations: string[]
}

const BudgetEstimatorPage = () => {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Record<string, any>>({})
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const startFlow = async () => {
    setIsLoading(true)
    try {
      const response = await aiAPI.getBudgetQuestion()
      setCurrentQuestion(response.data)
      setStep(1)
    } catch (error) {
      console.error('Failed to start flow')
    }
    setIsLoading(false)
  }

  const handleAnswer = async (answer: any) => {
    if (!currentQuestion) return
    
    const newData = { ...data, [currentQuestion.field]: answer }
    setData(newData)

    setIsLoading(true)
    try {
      const response = await aiAPI.budgetEstimate({
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
    } catch (error) {
      console.error('Failed to process answer')
    }
    setIsLoading(false)
  }

  const resetFlow = () => {
    setStep(0)
    setData({})
    setCurrentQuestion(null)
    setEstimate(null)
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251, 191, 36, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full mb-4 border border-amber-500/30">
            <Sparkles className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-4xl font-black text-amber-100 mb-2">AI Budget Estimator</h1>
          <p className="text-amber-100/70">Get an instant budget estimate for your construction project</p>
        </div>

        {!currentQuestion && !estimate && (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-12 text-center">
            <Calculator className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-amber-100 mb-4">Ready to estimate your budget?</h3>
            <p className="text-amber-100/70 mb-6">
              Answer a few quick questions and get a detailed budget breakdown instantly
            </p>
            <button 
              onClick={startFlow} 
              className="inline-flex items-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-8 py-4 rounded-full text-[#1a120b] font-bold transition-all"
            >
              Start Estimation
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <LoadingSpinner text="Processing..." />
          </div>
        )}

        {currentQuestion && !isLoading && (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-amber-100/70">Question {step} of 5</span>
              </div>
              <div className="h-2 bg-[#1a120b]/60 rounded-full">
                <div
                  className="h-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-amber-100 mb-6">{currentQuestion.question}</h2>

            {currentQuestion.input_type === 'number' ? (
              <div className="space-y-4">
                <input
                  type="number"
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 text-lg focus:border-amber-500 focus:outline-none"
                  placeholder="Enter value..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                      handleAnswer((e.target as HTMLInputElement).value)
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input')
                    if (input?.value) handleAnswer(input.value)
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all"
                >
                  Continue
                </button>
              </div>
            ) : currentQuestion.input_type === 'select' && currentQuestion.options ? (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className="bg-[#1a120b]/60 border border-amber-500/30 hover:border-amber-500/50 hover:bg-[#1a120b]/80 px-6 py-4 rounded-xl text-amber-100 font-semibold transition-all"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
                  rows={4}
                  placeholder="Type your answer..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && (e.target as HTMLTextAreaElement).value) {
                      e.preventDefault()
                      handleAnswer((e.target as HTMLTextAreaElement).value)
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={(e) => {
                    const textarea = (e.target as HTMLElement).parentElement?.querySelector('textarea')
                    if (textarea?.value) handleAnswer(textarea.value)
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {estimate && (
          <div className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-amber-100 mb-6 text-center">
              Your Estimated Budget
            </h2>

            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl p-8 mb-6 text-center">
              <p className="text-amber-100/70 text-sm mb-2">Total Budget</p>
              <p className="text-5xl font-black text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">
                ₹{estimate.total_budget?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-amber-100 mb-4">Budget Breakdown</h3>
              <div className="space-y-3">
                {estimate.breakdown && Object.entries(estimate.breakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-[#1a120b]/40 rounded-lg p-4">
                    <span className="text-amber-100/70 capitalize">{key.replace('_', ' ')}</span>
                    <span className="font-semibold text-amber-100">₹{(value as number)?.toLocaleString() || '0'}</span>
                  </div>
                ))}
              </div>
            </div>

            {estimate.recommendations && estimate.recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-amber-100 mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {estimate.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-amber-100/70">
                      <span className="text-amber-400 mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={resetFlow}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all"
            >
              Start New Estimation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetEstimatorPage
