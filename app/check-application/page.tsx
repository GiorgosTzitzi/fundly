'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function CheckApplicationPage() {
  const [showStatus, setShowStatus] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would verify credentials
    setShowStatus(true)
  }

  const handleBack = () => {
    setShowStatus(false)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Logo */}
        <div className="mb-8">
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
                className="w-full px-4 py-3 bg-black border border-gray-600 text-white rounded-lg outline-none"
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
                className="w-full px-4 py-3 bg-black border border-gray-600 text-white rounded-lg outline-none"
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

            <button
              type="submit"
              className="w-full text-black py-4 px-6 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#90EE90' }}
            >
              Check Status
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div>
              <h3 className="text-xl font-medium text-white mb-2">
                Application Status
              </h3>
              <div className="mt-6">
                <div className="inline-block px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(144, 238, 144, 0.2)' }}>
                  <span className="text-[#90EE90] font-medium">Waitlist</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                We'll notify you once your application has been reviewed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
