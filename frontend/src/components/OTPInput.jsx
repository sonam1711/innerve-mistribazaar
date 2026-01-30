import { useState } from 'react'
import { Shield } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import { otpAPI } from '../utils/api'
import toast from 'react-hot-toast'

const OTPInput = ({ onVerify, phoneNumber, isLoading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Take only last digit
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }

    // Auto-submit when all filled
    if (index === 5 && value) {
      const otpCode = newOtp.join('')
      if (otpCode.length === 6) {
        onVerify(otpCode)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('')
    while (newOtp.length < 6) newOtp.push('')
    setOtp(newOtp)

    // Focus last filled input or first empty
    const focusIndex = Math.min(pastedData.length, 5)
    const input = document.getElementById(`otp-${focusIndex}`)
    if (input) input.focus()

    if (pastedData.length === 6) {
      onVerify(pastedData)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setResendCooldown(30)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    try {
      const response = await otpAPI.resendOTP(phoneNumber, 'login')
      toast.success(response.data.message)
      // In development, show OTP
      if (response.data.otp) {
        toast.success(`OTP: ${response.data.otp}`, { duration: 10000 })
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP')
      setResendCooldown(0)
      clearInterval(interval)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Your Phone</h3>
        <p className="text-gray-600">
          We've sent a 6-digit code to<br />
          <span className="font-semibold">{phoneNumber}</span>
        </p>
      </div>

      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:outline-none transition-colors"
            disabled={isLoading}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onVerify(otp.join(''))}
        disabled={isLoading || otp.some((d) => !d)}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? <LoadingSpinner size="sm" text="" /> : 'Verify OTP'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
        </button>
      </div>
    </div>
  )
}

export default OTPInput
