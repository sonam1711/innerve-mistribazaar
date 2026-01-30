import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe } from 'lucide-react'

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('EN')

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'HI', name: 'हिन्दी' },
    { code: 'MR', name: 'मराठी' },
    { code: 'GU', name: 'ગુજરાતી' },
  ]

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code)
    setIsDropdownOpen(false)
  }

  return (
    <header className="fixed w-full z-[1000] px-4 py-2 bg-[#1a120b]/80 backdrop-blur-md border-b border-amber-500/10">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        
        {/* Left Side Group */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <a href="#" className="logo">
            <img src="/logo.png" alt="MistriBazaar Logo" className="w-40 h-auto block" />
          </a>

          {/* Business/Work Nav Links */}
          <nav className="inline-flex gap-6 items-center">
            <a href="#" className="segmented-button group flex flex-col items-center justify-center gap-0.5 p-0 mt-[10%] text-xs font-semibold bg-gradient-to-br from-[#efd177] to-[#e2e0dc] bg-clip-text text-transparent no-underline transition-all duration-200 hover:text-[rgba(255,189,74,0.992)]" style={{ textShadow: '0 3px 10px rgba(245, 159, 11, 0.862)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 stroke-2 stroke-[#efd177] group-hover:stroke-[rgba(255,189,74,0.992)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 4V3c0-1.7-1.3-3-3-3H8C6.3 0 5 1.3 5 3v1H0v4c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3V4h-5ZM7 3c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v1H7V3Zm10 9c1.2 0 2.3-.5 3-1.4V15c0 1.7-1.3 3-3 3H3c-1.7 0-3-1.3-3-3v-4.4c.7.9 1.8 1.4 3 1.4h14Z" />
              </svg>
              <span>Business</span>
            </a>
            
            <a href="#" className="segmented-button group flex flex-col items-center justify-center gap-0.5 p-0 mt-[10%] text-xs font-semibold bg-gradient-to-br from-[#efd177] to-[#e2e0dc] bg-clip-text text-transparent no-underline transition-all duration-200 hover:text-[rgba(255,189,74,0.992)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 stroke-2 stroke-[#efd177] group-hover:stroke-[rgba(255,189,74,0.992)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 15c0 .66-.3 1.28-.84 1.7L19 19.86l-1.42 1.42c-.54.54-1.16.82-1.8.82s-1.26-.28-1.8-.82l-3.32-3.32c-.54-.54-.82-1.16-.82-1.8s.28-1.26.82-1.8l1.42-1.42L12.8 12 11.4 13.4l-1.4-1.4 1.4-1.4-1.4-1.4-1.4 1.4L6 7.6 1.4 3 3 1.4l5.4 5.6 1.4-1.4 1.4 1.4 1.4-1.4-1.4-1.4 1.4-1.4L18.7 10.3c.54.54.84 1.16.84 1.8s-.3 1.28-.84 1.8L16.2 16.2c.54.54 1.16.82 1.8.82s1.26-.28 1.8-.82l3.32-3.32c.54-.54.82-1.16.82-1.8z"/>
              </svg>
              <span>Work</span>
            </a>
          </nav>
        </div>

        {/* Right Side Group */}
        <div className="flex items-center gap-3">
          
          {/* Help Button */}
          <a href="#" className="flex items-center gap-1 px-3 py-2 rounded-lg text-amber-100 no-underline text-sm transition-all duration-200 hover:text-[rgba(255,189,74,0.992)]" style={{ textShadow: 'none' }}>
            <span>Help</span>
          </a>

          {/* Language Dropdown */}
          <div className="relative">
            <button 
              className="flex items-center px-3 py-2 rounded-lg bg-transparent border border-transparent cursor-pointer transition-all duration-200 text-amber-100 font-semibold hover:text-[rgba(255,189,74,0.992)]"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Globe className="w-5 h-5" />
              <span className="mx-1 uppercase text-sm">{selectedLanguage}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full right-0 z-10 bg-[#2d1a0a] border border-amber-500/30 rounded-lg shadow-lg min-w-[150px] mt-2 py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`block w-full text-left px-4 py-2 text-amber-100 text-sm transition-all duration-100 hover:bg-amber-500/10 ${
                      selectedLanguage === lang.code ? 'font-bold bg-amber-500/20' : ''
                    }`}
                    onClick={() => handleLanguageSelect(lang.code)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <button className="px-8 py-3 bg-amber-500 text-[#1a120b] rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] shadow-[0_4px_14px_0_rgba(245,158,11,0.3)]">
                Log in
              </button>
            </Link>
            <Link to="/signup">
              <button className="border border-amber-500/30 text-amber-200 px-8 py-3 rounded-full hover:bg-amber-500/10 transition-all font-bold text-sm">
                Sign up
              </button>
            </Link>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Header
