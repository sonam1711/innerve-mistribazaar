import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Phone } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { otpAPI } from '../utils/api'
import toast, { Toaster } from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login, loginWithOTP, isLoading } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    setOtpLoading(true)
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`
      const response = await otpAPI.sendOTP(formattedPhone, 'login')
      
      // In development, OTP is returned in response
      if (response.data.otp) {
        toast.success(`OTP sent! Dev OTP: ${response.data.otp}`)
      } else {
        toast.success('OTP sent to your phone!')
      }
      
      setOtpSent(true)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`
    const success = await loginWithOTP(formattedPhone, otp)
    
    if (success) {
      toast.success('Login successful!')
      navigate('/')
    } else {
      toast.error('Invalid OTP or login failed')
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phone || !password) {
      toast.error('Please enter phone and password')
      return
    }

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`
    const success = await login(formattedPhone, password)
    
    if (success) {
      toast.success('Login successful!')
      navigate('/')
    } else {
      toast.error('Invalid phone or password')
    }
  }

  const handleSubmit = loginMethod === 'otp' ? (otpSent ? handleOTPLogin : handleSendOTP) : handlePasswordLogin

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <Toaster position="top-right" />
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251, 191, 36, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Radial Gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(
            circle at center, 
            rgba(120, 66, 18, 0.4) 0%, 
            #1a120b 85%
          )`
        }}
      />

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Nirmio Logo" className="w-40 h-auto mx-auto mb-6" />
          <h1 className="text-4xl font-black text-amber-100 mb-2">
            Welcome <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">Back</span>
          </h1>
          <p className="text-amber-100/70">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Method Toggle */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password')
                  setOtpSent(false)
                  setOtp('')
                }}
                className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  loginMethod === 'password'
                    ? 'bg-amber-500/20 border border-amber-500/60 text-amber-100'
                    : 'bg-[#1a120b]/60 border border-amber-500/30 text-amber-100/60'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp')
                  setPassword('')
                }}
                className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  loginMethod === 'otp'
                    ? 'bg-amber-500/20 border border-amber-500/60 text-amber-100'
                    : 'bg-[#1a120b]/60 border border-amber-500/30 text-amber-100/60'
                }`}
              >
                OTP
              </button>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg pl-12 pr-4 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="+91 or 10-digit number"
                  required
                  disabled={otpSent && loginMethod === 'otp'}
                />
              </div>
            </div>

            {/* Password or OTP Field */}
            {loginMethod === 'password' ? (
              <div>
                <label htmlFor="password" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg pl-12 pr-12 py-3 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : otpSent ? (
              <div>
                <label htmlFor="otp" className="block text-amber-100/80 mb-2 text-sm font-semibold">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 text-center text-2xl tracking-widest placeholder-amber-100/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp('')
                  }}
                  className="text-amber-400 hover:text-amber-300 text-sm mt-2 transition-colors"
                >
                  Change phone number
                </button>
              </div>
            ) : null}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-amber-500/30 bg-[#1a120b]/60 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-amber-100/70 text-sm ml-2">Remember me</span>
              </label>
              <a href="#" className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otpLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || otpLoading ? 'Please wait...' : (
                loginMethod === 'otp' ? (otpSent ? 'Verify OTP' : 'Send OTP') : 'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-500/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#2d1a0a]/40 text-amber-100/60">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-[#1a120b]/60 border border-amber-500/30 rounded-lg py-3 text-amber-100 hover:bg-[#1a120b]/80 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-semibold">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#1a120b]/60 border border-amber-500/30 rounded-lg py-3 text-amber-100 hover:bg-[#1a120b]/80 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-semibold">Facebook</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-amber-100/70">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
