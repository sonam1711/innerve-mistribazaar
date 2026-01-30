import { useState, useEffect } from 'react'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const SupabaseEmailAuth = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('')
    const [emailSent, setEmailSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Listen for auth state changes (when user clicks magic link)
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                toast.success('Email verified successfully!')
                onLoginSuccess(session)
            }
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [onLoginSuccess])

    const handleSendMagicLink = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    emailRedirectTo: import.meta.env.VITE_APP_URL || window.location.origin,
                }
            })
            if (error) throw error

            setEmailSent(true)
            toast.success('Verification link sent! Check your email.')
        } catch (error) {
            toast.error(error.message || 'Failed to send verification link')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {emailSent ? 'Check Your Email' : 'Verify Your Email'}
                </h3>
                <p className="text-gray-600">
                    {emailSent
                        ? `We've sent a verification link to ${email}`
                        : 'Enter your email to receive a verification link'}
                </p>
            </div>

            {!emailSent ? (
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner size="sm" text="" /> : (
                            <>
                                Send Verification Link <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-green-800 font-medium mb-1">
                                    Verification link sent!
                                </p>
                                <p className="text-sm text-green-700">
                                    Click the link in your email to continue. This page will automatically redirect once verified.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Didn't receive the email?
                        </p>
                        <button
                            type="button"
                            onClick={() => setEmailSent(false)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Try a different email
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SupabaseEmailAuth
