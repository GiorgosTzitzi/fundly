'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { supabase } from '@/lib/supabaseClient'

type ShipProject = {
  id: string
  shipName: string
  shipType: string
  description: string
  minTicketSize: number // Minimum investment amount
  returnPerYear: number // Annual return percentage
  status: 'open' | 'funded' | 'closing'
  purchasePrice?: number
  equityValue?: number
  deadweight?: number
  built?: string
  yard?: string
  technicalRating?: string
  management?: string
  subscriptionPeriod?: string
}

// Ship projects data from Information Memorandum - Dalex Handy AS / L.P.
// Project Finance November 2025
const shipProjects: ShipProject[] = [
  {
    id: '1',
    shipName: 'MV Atlantic Bulker',
    shipType: 'Handysize Dry Bulk Carrier',
    description: 'Japanese 2014-built 36,309dwt Handysize Bulk Carrier. Vessel rated technically 7.8 out of 10 by Aalmar Marine Surveyor. Attractive entry level at approximately 10% below newbuild parity. Acquisition of a Japanese 36kdwt Handysize Bulk Carrier with competitive speed/consumption. Dry bulk market has improved significantly since June with earnings lift (>45%) outpacing asset values (Abt. 14%) – providing a potential attractive time of entry for investors.',
    minTicketSize: 142500, // USD 142,500 (1.5% minimum subscription)
    returnPerYear: 17.0, // Base case return 17% p.a.
    status: 'open',
    purchasePrice: 16000000, // USD 16,000,000
    equityValue: 9500000, // USD 9,500,000
    deadweight: 36309, // 36,309 dwt
    built: 'April 2014',
    yard: 'Shikoku, Japan',
    technicalRating: '7.8/10',
    management: 'Dalex Shipping Co. S.A.',
    subscriptionPeriod: '17.11.2025 – 26.11.2025',
  },
]

function BeProjectOwnerButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        disabled
        className="px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-not-allowed opacity-50"
        style={{ 
          border: '1px solid #90EE90',
          color: '#90EE90',
          backgroundColor: 'transparent'
        }}
      >
        Be a project owner
      </button>
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <div className="bg-gray-900 border border-[#90EE90] rounded-lg p-4 shadow-2xl">
            <p className="text-xs text-gray-300 leading-relaxed">
              You need to be an approved project owner to publish and have an opportunity crowd fund your projects.
            </p>
            <div className="absolute right-4 top-0 -translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-[#90EE90]"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MarketplacePage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    checkAuthorization()
  }, [])

  const checkAuthorization = async () => {
    try {
      // Get email from sessionStorage (only used to identify which user to check)
      const sessionEmail = sessionStorage.getItem('user_email')

      if (!sessionEmail) {
        // No email found, user needs to log in
        setIsAuthorized(false)
        setIsLoading(false)
        return
      }

      // ALWAYS check Supabase directly - this is the single source of truth
      // Only users with status = 'approved' in Supabase can access
      const { data, error } = await supabase
        .from('applications')
        .select('status, email')
        .eq('email', sessionEmail)
        .eq('status', 'approved')
        .single()

      if (data && !error && data.status === 'approved') {
        // User is approved in Supabase - grant access
        setIsAuthorized(true)
        setUserEmail(data.email)
        setIsLoading(false)
      } else {
        // User not found or not approved in Supabase - deny access
        setIsAuthorized(false)
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Authorization error:', err)
      setIsAuthorized(false)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full space-y-8 text-center">
          <Logo />
          <div className="space-y-4">
            <h2 className="text-2xl font-medium text-white">
              Access Restricted
            </h2>
            <p className="text-gray-400 text-sm">
              The marketplace is only available to approved investors.
            </p>
            <p className="text-gray-500 text-xs">
              Access is granted only when your application status is set to "approved" in our system.
              Please check your application status or contact support if you believe this is an error.
            </p>
            <div className="space-y-3 mt-8">
              <Link
                href="/check-application"
                className="block w-full py-4 px-6 rounded-lg font-medium tracking-wider text-black transition-colors"
                style={{ backgroundColor: '#90EE90' }}
              >
                Check Application Status
              </Link>
              <Link
                href="/"
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
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center mb-6 relative">
            <Logo />
            <div className="absolute right-0 flex items-center gap-4">
              <BeProjectOwnerButton />
              <Link
                href="/"
                className="text-gray-400 hover:text-[#90EE90] transition-colors text-sm"
                onClick={() => {
                  sessionStorage.removeItem('user_email')
                }}
              >
                Logout
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-medium text-white mb-3">Investment Marketplace</h1>
              <p className="text-gray-400 text-base">
                {shipProjects.length} investment opportunity{shipProjects.length !== 1 ? 'ies' : ''} available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatWidget
            label="Total Projects"
            value={shipProjects.length.toString()}
            tooltip="The total number of investment opportunities currently available in the marketplace. Each project represents a ship investment opportunity with detailed information available for review."
          />
          <StatWidget
            label="Average Return"
            value={`${shipProjects.reduce((sum, ship) => sum + ship.returnPerYear, 0) / shipProjects.length}%`}
            tooltip="The average annual Internal Rate of Return (IRR) across all available projects. This is calculated as the mean of the base case IRR projections for each project. Returns are net to investors and based on 5-year holding period assumptions."
            isHighlight
          />
          <StatWidget
            label="Minimum Investment"
            value={`$${Math.min(...shipProjects.map(s => s.minTicketSize)) / 1000}K`}
            tooltip="The lowest minimum subscription amount required to invest in any project. This represents the smallest equity stake (typically 1.5% of total equity) that an investor can commit to a project. Minimum investments vary by project."
          />
        </div>

        {/* Ship Projects Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-white mb-6">Available Investments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shipProjects.map((ship) => (
              <ShipCard key={ship.id} ship={ship} />
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 pt-12 border-t border-gray-800">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-medium text-white mb-4">Investment Process</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              All investment opportunities are carefully vetted and managed by experienced professionals. 
              Click on any project above to view detailed information and begin your investment journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatWidget({ 
  label, 
  value, 
  tooltip, 
  isHighlight = false 
}: { 
  label: string
  value: string
  tooltip: string
  isHighlight?: boolean
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6 relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-sm text-gray-500">{label}</div>
        <div 
          className="relative inline-flex"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
        >
          <button
            type="button"
            className="focus:outline-none"
            aria-label="More information"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-500 hover:text-[#90EE90] transition-colors cursor-help"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
          {showTooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 z-50 pointer-events-none">
              <div className="bg-gray-900 border border-[#90EE90] rounded-lg p-4 shadow-2xl">
                <p className="text-xs text-gray-300 leading-relaxed">{tooltip}</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#90EE90]"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={`text-3xl font-medium ${isHighlight ? 'text-[#90EE90]' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}

function ShipCard({ ship }: { ship: ShipProject }) {
  return (
    <Link href={`/project/${ship.id}`}>
      <div className="bg-black border-2 border-gray-800 rounded-xl p-8 hover:border-[#90EE90] transition-all cursor-pointer group shadow-lg hover:shadow-[#90EE90]/20">
        {/* Ship Type Badge */}
        <div className="mb-5">
          <span
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#90EE90] uppercase tracking-wider"
            style={{ backgroundColor: 'rgba(144, 238, 144, 0.1)' }}
          >
            {ship.shipType}
          </span>
        </div>

        {/* Ship Name */}
        <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-[#90EE90] transition-colors">
          {ship.shipName}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-8 line-clamp-3 leading-relaxed">
          {ship.description}
        </p>

        {/* Key Metrics - Highlighted */}
        <div className="space-y-5 pt-6 border-t border-gray-800 mb-6">
          <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Minimum Ticket Size</div>
              <div className="text-2xl font-bold text-white">
                ${(ship.minTicketSize / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="text-3xl opacity-20">💰</div>
          </div>
          <div className="flex items-center justify-between rounded-lg p-4" style={{ backgroundColor: 'rgba(144, 238, 144, 0.1)' }}>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Return Per Year</div>
              <div className="text-2xl font-bold text-[#90EE90]">
                {ship.returnPerYear}%
              </div>
            </div>
            <div className="text-3xl opacity-20">📈</div>
          </div>
        </div>

        {/* Status and CTA */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Status:</span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                color: ship.status === 'open' ? '#90EE90' : '#9CA3AF',
                backgroundColor: ship.status === 'open' ? 'rgba(144, 238, 144, 0.15)' : 'rgba(156, 163, 175, 0.15)',
              }}
            >
              {ship.status.charAt(0).toUpperCase() + ship.status.slice(1)}
            </span>
          </div>
          <div className="text-[#90EE90] group-hover:translate-x-1 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
