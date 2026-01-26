'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Logo */}
        <div className="mb-4">
          <Logo />
        </div>

        {/* Tagline */}
        <p className="text-white text-xs tracking-widest">
          fundly becomes invite only after 100 investors
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 mb-12 mt-12">
          <Link
            href="/onboarding"
            className="block w-full py-4 px-6 rounded-lg font-medium tracking-wider text-black transition-colors"
            style={{ backgroundColor: '#90EE90' }}
          >
            Apply
          </Link>
          <Link
            href="/check-application"
            className="block w-full py-4 px-6 rounded-lg font-medium tracking-wider text-white transition-colors"
            style={{ border: '1px solid #90EE90' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#90EE90'
              e.currentTarget.style.color = '#000000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#FFFFFF'
            }}
          >
            Status
          </Link>
        </div>
      </div>
    </main>
  )
}
