import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogIn } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import OTPInput from '../components/OTPInput'
import { otpAPI } from '../utils/api'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, setUser, isLoading } = useAuthStore()
  const [step, setStep] = useState('phone') // 'phone', 'password', 'otp'
  const [loginMethod, setLoginMethod] = useState('password') // 'password' or 'otp'
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  })

  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (!formData.phone) {
      toast.error('Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      const response = await otpAPI.sendOTP(formData.phone, 'login')
      toast.success(response.data.message)
      // In development, show OTP
      if (response.data.otp) {
        toast.success(`OTP: ${response.data.otp}`, { duration: 10000 })
      }
      setStep('otp')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (otp) => {
    setLoading(true)
    try {
      const response = await otpAPI.verifyOTP(formData.phone, otp, 'login')
      
      // Save tokens and user data
      localStorage.setItem('access_token', response.data.tokens.access)
      localStorage.setItem('refresh_token', response.data.tokens.refresh)
      setUser(response.data.user)
      
      toast.success('Login successful')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    const success = await login(formData.phone, formData.password)
    if (success) {
      navigate('/dashboard')
    }
  }

  if (step === 'otp') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <OTPInput
              onVerify={handleVerifyOTP}
              phoneNumber={formData.phone}
              isLoading={loading}
            />
            
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="mt-4 w-full text-center text-gray-600 hover:text-gray-900"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Login to your Mistribazar account</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                loginMethod === 'password'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('otp')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                loginMethod === 'otp'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              OTP
            </button>
          </div>

          <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleSendOTP} className="space-y-6">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+91 1234567890"
                required
              />
            </div>

            {loginMethod === 'password' && (
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {(isLoading || loading) ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {loginMethod === 'password' ? 'Login' : 'Send OTP'}
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
