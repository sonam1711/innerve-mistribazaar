import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ArrowRight, Hammer, Users, TrendingUp, Sparkles } from 'lucide-react'

const HomePage = () => {
  const { user } = useAuthStore()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Connect with Trusted Construction Professionals
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Find skilled masons, get competitive bids, and visualize your dream space with AI-powered tools.
            </p>
            <div className="flex gap-4">
              {!user ? (
                <>
                  <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition">
                    Login
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Mistribazar?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Professionals</h3>
              <p className="text-gray-600">
                Connect with verified masons and traders in your area with transparent ratings and reviews.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Competitive Bidding</h3>
              <p className="text-gray-600">
                Get multiple bids on your project and choose the best value for your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Tools</h3>
              <p className="text-gray-600">
                Use our budget estimator and room visualizer to plan your project with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Post Your Project</h3>
              <p className="text-gray-600">
                Describe your construction or renovation needs with photos and budget.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Receive Bids</h3>
              <p className="text-gray-600">
                Get competitive bids from verified professionals in your area.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Compare & Choose</h3>
              <p className="text-gray-600">
                Review ratings, prices, and AI recommendations to make your decision.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Complete & Rate</h3>
              <p className="text-gray-600">
                Work gets done, and you rate the professional to help others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of satisfied customers and professionals on Mistribazar.
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center">
            Sign Up Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container-custom">
          <div className="text-center">
            <h3 className="text-white text-xl font-bold mb-2">Mistribazar</h3>
            <p className="mb-4">Connecting construction professionals with customers</p>
            <p className="text-sm">© 2026 Mistribazar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
