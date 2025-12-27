'use client'

import { useState } from 'react'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AuthButton from '@/app/components/AuthButton'

interface NavigationProps {
  onLogoClick?: () => void
}

export default function Navigation({ onLogoClick }: NavigationProps) {
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Execute manual state reset callback
    if (onLogoClick) {
      onLogoClick()
    }
    // Close mobile menu if open
    setMobileMenuOpen(false)
    // Navigate to home
    router.push('/')
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/70 dark:bg-dark-800/70 backdrop-blur-md border-b border-gray-200 dark:border-dark-700 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 flex justify-between items-center">
        <div className="flex items-center gap-8">
          {/* Logo - Larger and more prominent */}
          <button onClick={handleLogoClick} className="flex items-center hover:opacity-80 transition bg-none border-none p-0 cursor-pointer flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 transition-all duration-100 active:scale-95 flex items-center justify-center">
              <Image
                src={theme === 'light' ? '/lightmode.png' : '/darkmode.png'}
                alt="Logo"
                width={160}
                height={160}
                priority
                className="w-full h-full object-contain"
              />
            </div>
          </button>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`relative px-6 py-2.5 font-medium transition-all duration-300 ease-out rounded-full ${pathname === '/'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-gray-100/50 dark:hover:bg-white/10 hover:backdrop-blur-sm'
                }`}
            >
              Home
              {pathname === '/' && (
                <span className="absolute bottom-1.5 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 animate-fade-in" />
              )}
            </Link>
            <Link
              href="/search"
              className={`relative px-6 py-2.5 font-medium transition-all duration-300 ease-out rounded-full ${pathname === '/search'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-gray-100/50 dark:hover:bg-white/10 hover:backdrop-blur-sm'
                }`}
            >
              Search
              {pathname === '/search' && (
                <span className="absolute bottom-1.5 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 animate-fade-in" />
              )}
            </Link>
            <Link
              href="/insights"
              className={`relative px-6 py-2.5 font-medium transition-all duration-300 ease-out rounded-full ${pathname === '/insights'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-gray-100/50 dark:hover:bg-white/10 hover:backdrop-blur-sm'
                }`}
            >
              Insights
              {pathname === '/insights' && (
                <span className="absolute bottom-1.5 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 animate-fade-in" />
              )}
            </Link>
            <Link
              href="/bookmarks"
              className={`relative px-6 py-2.5 font-medium transition-all duration-300 ease-out rounded-full ${pathname === '/bookmarks'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-gray-100/50 dark:hover:bg-white/10 hover:backdrop-blur-sm'
                }`}
            >
              Bookmarks
              {pathname === '/bookmarks' && (
                <span className="absolute bottom-1.5 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 animate-fade-in" />
              )}
            </Link>

            <Link
              href="/about"
              className={`relative px-6 py-2.5 font-medium transition-all duration-300 ease-out rounded-full ${pathname === '/about'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-gray-100/50 dark:hover:bg-white/10 hover:backdrop-blur-sm'
                }`}
            >
              About
              {pathname === '/about' && (
                <span className="absolute bottom-1.5 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 animate-fade-in" />
              )}
            </Link>
          </div>
        </div>

        {/* Right Side - Auth and Theme */}
        <div className="hidden md:flex items-center gap-4">
          <AuthButton />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600 transition-all duration-100 active:scale-95"
            title="Toggle dark mode"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Controls - Theme Toggle and Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600 transition-all duration-100 active:scale-95"
            title="Toggle dark mode"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
              </svg>
            )}
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600 transition-all duration-100 active:scale-95"
            title="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 animate-slide-down">
          <div className="max-w-7xl mx-auto px-3 py-4 sm:px-4 lg:px-8 space-y-3">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`w-full px-4 py-3 font-medium transition-all duration-200 border-l-4 ${pathname === '/'
                ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
                }`}
            >
              <span className="font-medium">Home</span>
            </Link>
            <Link
              href="/search"
              onClick={closeMobileMenu}
              className={`w-full px-4 py-3 font-medium transition-all duration-200 border-l-4 ${pathname === '/search'
                ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
                }`}
            >
              <span className="font-medium">Search</span>
            </Link>
            <Link
              href="/insights"
              onClick={closeMobileMenu}
              className={`w-full px-4 py-3 font-medium transition-all duration-200 border-l-4 ${pathname === '/insights'
                ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
                }`}
            >
              <span className="font-medium">Insights</span>
            </Link>
            <Link
              href="/bookmarks"
              onClick={closeMobileMenu}
              className={`w-full px-4 py-3 font-medium transition-all duration-200 border-l-4 ${pathname === '/bookmarks'
                ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
                }`}
            >
              <span className="font-medium">Bookmarks</span>
            </Link>
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className={`w-full px-4 py-3 font-medium transition-all duration-200 border-l-4 ${pathname === '/about'
                ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
                }`}
            >
              <span className="font-medium">About</span>
            </Link>

            <div className="px-4 py-2">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
