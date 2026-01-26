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

type ActiveDeal = {
  id: string
  shipName: string
  shipType: string
  totalStake: number // Percentage of ship being bid on (e.g., 5%)
  highestBid: number // Current highest bid in USD
  minRaise: number // Minimum raise amount in USD
  ceilingInvestment: number // Maximum investment (e.g., $500K)
  guaranteedStake: number // Guaranteed stake at ceiling (e.g., 1.5%)
  endTime: number // Unix timestamp in milliseconds
  bidCount: number // Number of bids placed
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
  {
    id: '2',
    shipName: 'MV Pacific Trader',
    shipType: 'Handysize Dry Bulk Carrier',
    description: 'Korean 2015-built 37,200dwt Handysize Bulk Carrier. Vessel rated technically 8.1 out of 10 by Aalmar Marine Surveyor. Modern eco-design with fuel-efficient engines. Acquisition at attractive entry point approximately 8% below newbuild parity. Strong market fundamentals with limited orderbook and aging fleet supporting favorable outlook.',
    minTicketSize: 165000, // USD 165,000 (1.5% minimum subscription)
    returnPerYear: 18.5, // Base case return 18.5% p.a.
    status: 'open',
    purchasePrice: 17200000, // USD 17,200,000
    equityValue: 11000000, // USD 11,000,000
    deadweight: 37200, // 37,200 dwt
    built: 'March 2015',
    yard: 'Hyundai Mipo, South Korea',
    technicalRating: '8.1/10',
    management: 'Dalex Shipping Co. S.A.',
    subscriptionPeriod: '01.12.2025 – 15.12.2025',
  },
  {
    id: '3',
    shipName: 'MV Nordic Carrier',
    shipType: 'Handysize Dry Bulk Carrier',
    description: 'Japanese 2013-built 35,800dwt Handysize Bulk Carrier. Vessel rated technically 7.6 out of 10 by Aalmar Marine Surveyor. Well-maintained vessel with recent drydock completion. Attractive entry level at approximately 12% below newbuild parity. Competitive operating costs and strong commercial management track record.',
    minTicketSize: 127500, // USD 127,500 (1.5% minimum subscription)
    returnPerYear: 15.8, // Base case return 15.8% p.a.
    status: 'open',
    purchasePrice: 14800000, // USD 14,800,000
    equityValue: 8500000, // USD 8,500,000
    deadweight: 35800, // 35,800 dwt
    built: 'September 2013',
    yard: 'Onomichi, Japan',
    technicalRating: '7.6/10',
    management: 'Dalex Shipping Co. S.A.',
    subscriptionPeriod: '05.12.2025 – 20.12.2025',
  },
]

// Active deals with live bidding
const activeDeals: ActiveDeal[] = [
  {
    id: 'bid-1',
    shipName: 'MV Atlantic Bulker',
    shipType: 'Handysize Dry Bulk Carrier',
    totalStake: 5, // 5% of ship
    highestBid: 285000, // $285K current highest bid
    minRaise: 10000, // Minimum $10K raise
    ceilingInvestment: 500000, // $500K ceiling
    guaranteedStake: 1.5, // 1.5% guaranteed at ceiling
    endTime: Date.now() + (2 * 60 * 60 * 1000) + (45 * 60 * 1000) + (30 * 1000), // 2h 45m 30s from now
    bidCount: 12,
  },
  {
    id: 'bid-2',
    shipName: 'MV Pacific Trader',
    shipType: 'Handysize Dry Bulk Carrier',
    totalStake: 5,
    highestBid: 320000,
    minRaise: 15000,
    ceilingInvestment: 500000,
    guaranteedStake: 1.5,
    endTime: Date.now() + (1 * 60 * 60 * 1000) + (20 * 60 * 1000) + (15 * 1000), // 1h 20m 15s
    bidCount: 8,
  },
]

type Bid = {
  id: string
  dealId: string
  bidderEmail: string
  bidderPhone: string
  bidderName: string
  bidAmount: number
  timestamp: number
  stakePercentage: number
}

function ActiveDealCard({ deal }: { deal: ActiveDeal }) {
  const [timeRemaining, setTimeRemaining] = useState(deal.endTime - Date.now())
  const [bidAmount, setBidAmount] = useState(deal.highestBid + deal.minRaise)
  const [isBidding, setIsBidding] = useState(false)
  const [bids, setBids] = useState<Bid[]>([])
  const [showBidHistory, setShowBidHistory] = useState(false)
  const [currentHighestBid, setCurrentHighestBid] = useState(deal.highestBid)

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = deal.endTime - Date.now()
      setTimeRemaining(Math.max(0, remaining))
    }, 1000)

    return () => clearInterval(interval)
  }, [deal.endTime])

  // Load bids from localStorage on mount
  useEffect(() => {
    const savedBids = localStorage.getItem(`bids_${deal.id}`)
    if (savedBids) {
      const parsedBids = JSON.parse(savedBids) as Bid[]
      setBids(parsedBids)
      if (parsedBids.length > 0) {
        const highest = Math.max(...parsedBids.map(b => b.bidAmount))
        setCurrentHighestBid(highest)
        setBidAmount(highest + deal.minRaise)
      }
    }
  }, [deal.id, deal.minRaise])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleBid = async () => {
    if (bidAmount < currentHighestBid + deal.minRaise) {
      alert(`Minimum bid is $${(currentHighestBid + deal.minRaise).toLocaleString()}`)
      return
    }

    setIsBidding(true)

    try {
      const sessionEmail = sessionStorage.getItem('user_email')
      
      if (!sessionEmail) {
        alert('Please log in to place a bid')
        setIsBidding(false)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('applications')
        .select('email, full_name, phone_number, phone_country_code')
        .eq('email', sessionEmail)
        .single()

      if (userError || !userData) {
        alert('Unable to retrieve user information')
        setIsBidding(false)
        return
      }

      const newBid: Bid = {
        id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dealId: deal.id,
        bidderEmail: userData.email,
        bidderPhone: `${userData.phone_country_code || ''}${userData.phone_number || ''}`,
        bidderName: userData.full_name,
        bidAmount: bidAmount,
        timestamp: Date.now(),
        stakePercentage: (bidAmount / deal.ceilingInvestment) * deal.guaranteedStake,
      }

      const updatedBids = [...bids, newBid].sort((a, b) => b.bidAmount - a.bidAmount)
      setBids(updatedBids)
      localStorage.setItem(`bids_${deal.id}`, JSON.stringify(updatedBids))
      setCurrentHighestBid(bidAmount)
      setBidAmount(bidAmount + deal.minRaise)

      console.log('Bid placed:', {
        bidId: newBid.id,
        dealId: deal.id,
        shipName: deal.shipName,
        bidder: {
          email: newBid.bidderEmail,
          phone: newBid.bidderPhone,
          name: newBid.bidderName,
        },
        bidAmount: newBid.bidAmount,
        stakePercentage: newBid.stakePercentage,
        timestamp: new Date(newBid.timestamp).toISOString(),
      })

      alert('Bid placed successfully!')
    } catch (error) {
      console.error('Error placing bid:', error)
      alert('Error placing bid. Please try again.')
    } finally {
      setIsBidding(false)
    }
  }

  const handleCeilingBid = async () => {
    setIsBidding(true)

    try {
      const sessionEmail = sessionStorage.getItem('user_email')
      
      if (!sessionEmail) {
        alert('Please log in to place a bid')
        setIsBidding(false)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('applications')
        .select('email, full_name, phone_number, phone_country_code')
        .eq('email', sessionEmail)
        .single()

      if (userError || !userData) {
        alert('Unable to retrieve user information')
        setIsBidding(false)
        return
      }

      const ceilingBid: Bid = {
        id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dealId: deal.id,
        bidderEmail: userData.email,
        bidderPhone: `${userData.phone_country_code || ''}${userData.phone_number || ''}`,
        bidderName: userData.full_name,
        bidAmount: deal.ceilingInvestment,
        timestamp: Date.now(),
        stakePercentage: deal.guaranteedStake,
      }

      const updatedBids = [...bids, ceilingBid].sort((a, b) => b.bidAmount - a.bidAmount)
      setBids(updatedBids)
      localStorage.setItem(`bids_${deal.id}`, JSON.stringify(updatedBids))
      setCurrentHighestBid(deal.ceilingInvestment)

      console.log('Ceiling bid placed:', {
        bidId: ceilingBid.id,
        dealId: deal.id,
        shipName: deal.shipName,
        bidder: {
          email: ceilingBid.bidderEmail,
          phone: ceilingBid.bidderPhone,
          name: ceilingBid.bidderName,
        },
        bidAmount: ceilingBid.bidAmount,
        guaranteedStake: ceilingBid.stakePercentage,
        timestamp: new Date(ceilingBid.timestamp).toISOString(),
      })

      alert(`Guaranteed ${deal.guaranteedStake}% stake secured!`)
    } catch (error) {
      console.error('Error placing ceiling bid:', error)
      alert('Error placing bid. Please try again.')
    } finally {
      setIsBidding(false)
    }
  }

  const isExpired = timeRemaining <= 0
  const stakeAtBid = (bidAmount / deal.ceilingInvestment) * deal.guaranteedStake
  const displayHighestBid = bids.length > 0 ? currentHighestBid : deal.highestBid

  return (
    <div className="bg-black border-2 border-[#90EE90] rounded-xl p-6 relative overflow-hidden">
      {/* Pulsing border animation for active deals */}
      <div className="absolute inset-0 border-2 border-[#90EE90] rounded-xl animate-pulse opacity-30"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-[#90EE90] uppercase tracking-wider mb-1">
              {deal.shipType}
            </div>
            <h3 className="text-xl font-semibold text-white">{deal.shipName}</h3>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Stake Available</div>
            <div className="text-lg font-bold text-[#90EE90]">{deal.totalStake}%</div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Time Remaining</div>
              <div className={`text-2xl font-mono font-bold ${isExpired ? 'text-red-400' : 'text-[#90EE90]'}`}>
                {isExpired ? '00:00:00' : formatTime(timeRemaining)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Bids</div>
              <div className="text-lg font-semibold text-white">{bids.length || deal.bidCount}</div>
            </div>
          </div>
        </div>

        {/* Current Bid Info */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Highest Bid</span>
            <span className="text-lg font-bold text-white">${displayHighestBid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Minimum Raise</span>
            <span className="text-sm font-medium text-[#90EE90]">${deal.minRaise.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-800">
            <span className="text-sm text-gray-400">Next Bid Must Be</span>
            <span className="text-lg font-bold text-[#90EE90]">
              ${(displayHighestBid + deal.minRaise).toLocaleString()}+
            </span>
          </div>
          <button
            onClick={() => setShowBidHistory(!showBidHistory)}
            className="w-full mt-3 text-xs text-[#90EE90] hover:underline text-left"
          >
            {showBidHistory ? 'Hide' : 'Show'} Bid History ({bids.length})
          </button>
        </div>

        {/* Ceiling Investment Info */}
        <div className="bg-[#90EE90]/10 border border-[#90EE90]/30 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-400 mb-1">Ceiling Investment</div>
              <div className="text-sm font-semibold text-white">
                ${deal.ceilingInvestment.toLocaleString()} = {deal.guaranteedStake}% guaranteed
              </div>
            </div>
            <button
              onClick={handleCeilingBid}
              disabled={isBidding || isExpired}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-black transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#90EE90' }}
            >
              {isBidding ? 'Processing...' : 'Secure'}
            </button>
          </div>
        </div>

        {/* Bidding Interface */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Your Bid</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={displayHighestBid + deal.minRaise}
                max={deal.ceilingInvestment}
                className="flex-1 px-4 py-2 bg-black border border-gray-700 text-white rounded-lg focus:border-[#90EE90] focus:outline-none"
                placeholder={`Min: $${(displayHighestBid + deal.minRaise).toLocaleString()}`}
              />
              <button
                onClick={handleBid}
                disabled={isBidding || isExpired || bidAmount < displayHighestBid + deal.minRaise}
                className="px-6 py-2 rounded-lg font-semibold text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#90EE90' }}
              >
                {isBidding ? 'Bidding...' : 'Bid'}
              </button>
            </div>
            {bidAmount >= displayHighestBid + deal.minRaise && bidAmount < deal.ceilingInvestment && (
              <p className="text-xs text-gray-500 mt-2">
                Your bid of ${bidAmount.toLocaleString()} ≈ {stakeAtBid.toFixed(2)}% stake
              </p>
            )}
          </div>
        </div>

        {/* Bid History Table */}
        {showBidHistory && bids.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h4 className="text-sm font-semibold text-white mb-4">Bid History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 text-gray-400 font-medium">Bid ID</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Bidder</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Phone</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Amount</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Stake</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid) => (
                    <tr key={bid.id} className="border-b border-gray-900">
                      <td className="py-2 text-gray-500 font-mono text-[10px]">{bid.id.substring(0, 12)}...</td>
                      <td className="py-2 text-white">{bid.bidderName}</td>
                      <td className="py-2 text-gray-400">{bid.bidderEmail}</td>
                      <td className="py-2 text-gray-400">{bid.bidderPhone}</td>
                      <td className="py-2 text-right text-white font-semibold">${bid.bidAmount.toLocaleString()}</td>
                      <td className="py-2 text-right text-[#90EE90]">{bid.stakePercentage.toFixed(2)}%</td>
                      <td className="py-2 text-right text-gray-500">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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
        Publish
      </button>
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <div className="bg-gray-900 border border-[#90EE90] rounded-lg p-4 shadow-2xl">
            <p className="text-xs text-gray-300 leading-relaxed">
              You need to be an approved project owner to crowd fund your projects.
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
            <div className="space-y-3 mt-8">
              <Link
                href="/check-application"
                className="block w-full py-4 px-6 rounded-lg font-medium tracking-wider text-black transition-colors"
                style={{ backgroundColor: '#90EE90' }}
              >
                Status
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
        {/* Active Deals Trading Section */}
        {activeDeals.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium text-white">ACTIVE DEALS TRADING</h2>
              <div className="text-sm text-gray-500">
                {activeDeals.length} active auction{activeDeals.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeDeals.map((deal) => (
                <ActiveDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatWidget
            label="Total Projects"
            value={shipProjects.length.toString()}
            tooltip="The total number of investment opportunities currently available in the marketplace. Each project represents a ship investment opportunity with detailed information available for review."
          />
          <StatWidget
            label="Average Return"
            value={`${(shipProjects.reduce((sum, ship) => sum + ship.returnPerYear, 0) / shipProjects.length).toFixed(2)}%`}
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
