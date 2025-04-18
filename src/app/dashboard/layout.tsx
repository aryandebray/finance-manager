'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center space-x-4">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <span className="text-lg font-bold text-white">FT</span>
                    </div>
                    <span className="text-xl font-bold text-white">FinTrack</span>
                  </div>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-all duration-300 group"
                >
                  <span className="text-white">Dashboard</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
                <Link
                  href="/dashboard/transactions"
                  className="relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-all duration-300 group"
                >
                  <span className="text-gray-300 group-hover:text-white">Transactions</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
                <Link
                  href="/dashboard/investments"
                  className="relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-all duration-300 group"
                >
                  <span className="text-gray-300 group-hover:text-white">Investments</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
                <Link
                  href="/dashboard/budget"
                  className="relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-all duration-300 group"
                >
                  <span className="text-gray-300 group-hover:text-white">Budget</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="bg-gray-700 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-all duration-300 hover:bg-gray-600 transform hover:scale-105"
                    id="user-menu-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <span className="text-blue-300 font-medium">
                        {session?.user?.name?.[0] || session?.user?.email?.[0]}
                      </span>
                    </div>
                  </button>
                </div>
                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-300 ease-in-out">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300 flex items-center space-x-2 group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 11-2 0 1 1 0 012 0zm-8.707.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 