import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import SupabaseOTP from '../components/auth/SupabaseOTP'
import { useAuthStore } from '../store/authStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()

  const handleLoginSuccess = async (session) => {
    // Store Supabase session
    await setSession(session)

    // Navigate to dashboard
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Login to your Mistribazar account</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <SupabaseOTP onLoginSuccess={handleLoginSuccess} />

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
