import { Smartphone } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const DownloadApp = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1)

  return (
    <section ref={sectionRef} className="py-20 px-4 relative">
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
      
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className={`mb-8 flex justify-center transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="w-20 h-20 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        {/* Content */}
        <h2 className={`text-4xl lg:text-5xl font-black text-amber-100 mb-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Mobile App <span className="text-transparent bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text">Coming Soon</span>
        </h2>
        <p className={`text-amber-100/70 text-lg mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          We're working on native mobile apps for iOS and Android to give you an even better experience. Manage your projects, connect with professionals, and track orders - all from your pocket.
        </p>

        {/* Coming Soon Badge */}
        <div className={`inline-block bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/30 rounded-full px-8 py-4 mb-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-amber-400 font-bold">
            📱 For now, enjoy our fully responsive web platform on any device
          </p>
        </div>

        {/* Notify Me Button */}
        <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#1a120b] font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Notify Me When Available
          </button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/20 rounded-xl p-6">
            <h4 className="text-amber-100 font-bold mb-2">Instant Notifications</h4>
            <p className="text-amber-100/60 text-sm">Get real-time updates on quotes, bookings, and project status</p>
          </div>
          <div className="bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/20 rounded-xl p-6">
            <h4 className="text-amber-100 font-bold mb-2">Offline Access</h4>
            <p className="text-amber-100/60 text-sm">View saved projects and contacts even without internet</p>
          </div>
          <div className="bg-[#2d1a0a]/40 backdrop-blur-md border border-amber-500/20 rounded-xl p-6">
            <h4 className="text-amber-100 font-bold mb-2">Quick Actions</h4>
            <p className="text-amber-100/60 text-sm">Book services, order materials, and chat with one tap</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DownloadApp
