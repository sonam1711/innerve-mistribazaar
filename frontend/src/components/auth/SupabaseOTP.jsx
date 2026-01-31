import { useState } from 'react'
import { Shield, Phone, ArrowRight } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const SupabaseOTP = ({ onLoginSuccess }) => {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSendOTP = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Auto-prepend +91 if missing
        let formattedPhone = phoneNumber.trim()
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone
        }

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            })
            if (error) throw error

            setOtpSent(true)
            toast.success('OTP sent successfully!')
        } catch (error) {
            toast.error(error.message || 'Failed to send OTP')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        let formattedPhone = phoneNumber.trim()
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone
        }

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms',
            })
            if (error) throw error

            if (data.session) {
                toast.success('Logged in successfully!')
                onLoginSuccess(data.session)
            }
        } catch (error) {
            toast.error(error.message || 'Invalid OTP')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {otpSent ? 'Enter Validation Code' : 'Verify Your Phone'}
                </h3>
                <p className="text-gray-600">
                    {otpSent
                        ? `We've sent a code to ${phoneNumber}`
                        : 'We need to verify your phone number to continue'}
                </p>
            </div>

            {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">🇮🇳 +91</span>
                            <input
                                type="tel"
                                value={phoneNumber.replace(/^\+91/, '')}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="9876543210"
                                className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner size="sm" text="" /> : (
                            <>
                                Send OTP <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary"
                    >
                        {isLoading ? <LoadingSpinner size="sm" text="" /> : 'Verify & Login'}
                    </button>
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Change phone number
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default SupabaseOTP
