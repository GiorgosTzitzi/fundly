'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { supabase } from '@/lib/supabaseClient'

type ApplicationStatus = 'pending' | 'approved' | 'rejected'

interface Application {
  id: number
  email: string
  full_name: string
  status: ApplicationStatus
  created_at: string
}

export default function CheckApplicationPage() {
  const router = useRouter()
  const [showStatus, setShowStatus] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [application, setApplication] = useState<Application | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Query the database for the email
      const { data, error: queryError } = await supabase
        .from('applications')
        .select('id, email, password, full_name, status, created_at')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (queryError) {
        if (queryError.code === 'PGRST116') {
          // No rows returned
          setError('No application found with this email address.')
        } else {
          setError('Error checking application. Please try again.')
          console.error('Query error:', queryError)
        }
        setIsLoading(false)
        return
      }

      // Verify password matches
      if (data.password !== password) {
        setError('Invalid email or password.')
        setIsLoading(false)
        return
      }

      // Credentials are valid
      const appData = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        status: data.status as ApplicationStatus,
        created_at: data.created_at,
      }
      setApplication(appData)
      
      // Store email in sessionStorage for marketplace access
      sessionStorage.setItem('user_email', appData.email)
      
      // Show status page (including for approved users - they'll see the marketplace button)
      setShowStatus(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setShowStatus(false)
    setError(null)
    setApplication(null)
  }

  const getStatusDisplay = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved':
        return {
          label: 'Approved',
          color: '#90EE90',
          bgColor: 'rgba(144, 238, 144, 0.2)',
          message: '',
        }
      case 'rejected':
        return {
          label: 'Rejected',
          color: '#FF6B6B',
          bgColor: 'rgba(255, 107, 107, 0.2)',
          message: 'Your application was not approved.',
        }
      case 'pending':
      default:
        return {
          label: 'Pending',
          color: '#FFD93D',
          bgColor: 'rgba(255, 217, 61, 0.2)',
          message: '',
        }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {/* Back Arrow */}
        {showStatus ? (
          <button
            onClick={handleBack}
            className="mb-6 text-white hover:text-[#90EE90] transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <Link
            href="/"
            className="mb-6 inline-block text-white hover:text-[#90EE90] transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}

        {/* Content */}
        {!showStatus ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-black border border-gray-600 text-white rounded-lg outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#90EE90'
                  e.currentTarget.style.boxShadow = '0 0 0 2px #90EE90'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#4B5563'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-black border border-gray-600 text-white rounded-lg outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#90EE90'
                  e.currentTarget.style.boxShadow = '0 0 0 2px #90EE90'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#4B5563'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-black py-4 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#90EE90' }}
            >
              {isLoading ? 'Checking...' : 'Check'}
            </button>
          </form>
        ) : application ? (
          <div className="space-y-6 text-center">
            <div>
              <h3 className="text-xl font-medium text-white mb-2">
                Application Status
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {application.full_name}
              </p>
              <div className="mt-6">
                <div
                  className="inline-block px-4 py-2 rounded-lg"
                  style={{ backgroundColor: getStatusDisplay(application.status).bgColor }}
                >
                  <span
                    className="font-medium"
                    style={{ color: getStatusDisplay(application.status).color }}
                  >
                    {getStatusDisplay(application.status).label}
                  </span>
                </div>
              </div>
              {getStatusDisplay(application.status).message && (
                <p className="text-gray-400 text-sm mt-4">
                  {getStatusDisplay(application.status).message}
                </p>
              )}
              {application.status === 'approved' && (
                <div className="mt-10 space-y-4">
                  <Link
                    href="/marketplace"
                    className="block w-full py-5 px-8 rounded-lg font-semibold text-lg tracking-wide text-black transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg"
                    style={{ backgroundColor: '#90EE90' }}
                    onClick={() => {
                      // Store email - marketplace will verify approval status directly from Supabase
                      sessionStorage.setItem('user_email', application.email)
                    }}
                  >
                    Invest →
                  </Link>
                </div>
              )}
              {application.status === 'pending' && (
                <p className="text-gray-500 text-xs mt-2">
                  Submitted on {new Date(application.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
