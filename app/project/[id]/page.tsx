'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Logo from '@/components/Logo'
import Link from 'next/link'

type Activity = {
  id: string
  date: string
  type: 'created' | 'investment' | 'milestone' | 'update'
  message: string
  user?: string
  amount?: number
}

// Comprehensive project data from Information Memorandum - Dalex Handy AS / L.P.
const dalexHandyProject = {
  id: '1',
  title: 'MV Atlantic Bulker (tbrn MV Kambos)',
  shipName: 'MV Atlantic Bulker',
  shipNameToBeRenamed: 'MV Kambos',
  sector: 'shipping',
  shipType: 'Handysize Dry Bulk Carrier',
  description: 'Acquisition of Japanese 2014-built Handysize Dry Bulk Vessel at an attractive entry level in a rising market. The purchase price for the 36,309dwt unit is USD 16.0m (abt. 10% below newbuild parity). Dalex Shipping will invest min. 30% of the equity in the project and handle the commercial and technical management of the vessel.',
  minInvestment: 142500, // USD 142,500 (1.5% minimum subscription)
  goal: 9500000, // Equity value USD 9,500,000
  raised: 7125000, // 75% pre-subscriptions
  deadline: '2025-11-26',
  investors: 0,
  status: 'open',
  equity: 55, // 55% equity
  debt: 45, // 45% debt (USD 7,750,000)
  riskLevel: 'Medium',
  expectedReturn: '17% p.a.',
  duration: '5 years',
  
  // Vessel Details
  vessel: {
    built: 'April 2014',
    yard: 'Shikoku, Japan',
    design: 'Mitsui Neo36',
    class: 'NKK',
    flag: 'Panama (To be reflagged Marshall Islands)',
    deadweight: 36309,
    cargoHolds: 5,
    hatches: 5,
    speedLaden: '12.5kn / 11.0kn (Eco Speed) / 9.0kn (Super Eco Speed)',
    consumptionLaden: '20.0mt / 16.0mt / 12mt',
    speedBallast: '13.5kn / 11.5kn (Eco Speed) / 9.5kn (Super Eco Speed)',
    consumptionBallast: '20.0mt / 16.0mt / 12mt',
    bwts: 'Alfa Laval Pureblast 3.1, Installed 2022',
    ldwt: 7555,
    ciiRating: 'B (Projected)',
    dimensions: 'LOA: 176.50 / Beam: 28.80 / Draught: 10.72m',
    mainEngine: 'MAN B&W 6S46MCC8',
    nextSSDD: 'March 2027',
    technicalRating: '7.8/10',
    surveyor: 'Aalmar Marine Surveyor',
    inspectionDate: 'October 8, 2025',
  },
  
  // Financial Details
  financials: {
    purchasePrice: 16000000,
    equityValue: 9500000,
    mortgageDebt: 7750000,
    margin: '230 bps, falling to 215 bps after full cash sweep',
    upfrontFee: '100 bps',
    commitmentFee: '100 bps',
    tenor: '5 years from delivery',
    balloonPayment: 2550000, // USD 2,550,000 (USD 3,390,000 if no cash sweep)
    ageAdjustedProfile: '>20-year profile to zero',
    cashBreakeven: 9100, // USD 9,100/Day (excluding SS/DD)
    opexBudget: 4950, // USD 4,950/day including Technical & Commercial Management fee
    baseCaseIRR: 17.1, // %
    moic: 1.91, // Multiple on Invested Capital
  },
  
  // Market & Returns
  market: {
    avgNetTCRate: 13450, // USD/day
    netSalesPrice: 13250000, // USD 13,250,000 (end of year 5)
    historicalAvgBHSI: 13562, // USD/day (2017-2025 YTD)
    historicalAvg16YearOld: 14000000, // USD 14,000,000
  },
  
  // Management
  management: {
    technicalCommercial: 'Dalex Shipping Co. S.A.',
    corporateManager: 'NRP Business Management AS',
    arranger: 'NRP Project Finance AS',
    sponsor: 'Dalex Shipping Co. S.A. (min. 30% equity)',
  },
  
  // Key Highlights
  highlights: [
    'Acquisition at attractive entry level (Abt. 10% below newbuild parity)',
    'Vessel rated technically 7.8 out of 10 by Aalmar Marine Surveyor',
    'Dry bulk market improved significantly since June (>45% earnings lift)',
    'Favorable market outlook for modern Handysize vessels',
    'Attractive debt financing with over 20-year profile to zero',
    'Highly professional Handysize expert, Dalex Shipping, investing 30% equity',
    'Dalex has outperformed market by 4.2% and opex by abt 18% past 10 years',
    'Pre-subscriptions and indications of abt. 75%',
  ],
  
  // Return Scenarios
  returnScenarios: [
    {
      avgTCRate: 10900,
      salesPrice: 9000000,
      irr: -0.3,
      label: 'Low Case',
    },
    {
      avgTCRate: 13450,
      salesPrice: 13250000,
      irr: 17.1,
      label: 'Base Case',
    },
    {
      avgTCRate: 15500,
      salesPrice: 16250000,
      irr: 28.1,
      label: 'High Case',
    },
  ],
  
  subscriptionPeriod: '17.11.2025 – 26.11.2025',
  
  // Risk Factors
  riskFactors: [
    'Market volatility in shipping industry',
    'Regulatory changes affecting maritime operations',
    'Fuel price fluctuations',
    'Currency exchange rate risks',
    'Counterparty risk in charter agreements',
    'Technical and operational risks',
    'Residual value fluctuations',
    'Liquidity of company shares',
    'Legislative, class, environment and tax changes',
  ],
}

// Additional projects data
const projectsData = [
  dalexHandyProject,
  {
    id: '2',
    title: 'MV Pacific Trader',
    shipName: 'MV Pacific Trader',
    shipNameToBeRenamed: '',
    sector: 'shipping',
    shipType: 'Handysize Dry Bulk Carrier',
    description: 'Acquisition of Korean 2015-built Handysize Dry Bulk Vessel. The purchase price for the 37,200dwt unit is USD 17.2m (abt. 8% below newbuild parity). Modern eco-design with fuel-efficient engines.',
    minInvestment: 165000,
    goal: 11000000,
    raised: 8250000, // 75% pre-subscriptions
    deadline: '2025-12-15',
    investors: 0,
    status: 'open',
    equity: 56,
    debt: 44,
    riskLevel: 'Medium',
    expectedReturn: '18.5% p.a.',
    duration: '5 years',
    vessel: {
      built: 'March 2015',
      yard: 'Hyundai Mipo, South Korea',
      design: 'Eco Handysize',
      class: 'KR',
      flag: 'Marshall Islands',
      deadweight: 37200,
      cargoHolds: 5,
      hatches: 5,
      speedLaden: '13.0kn / 11.5kn (Eco Speed) / 9.5kn (Super Eco Speed)',
      consumptionLaden: '19.5mt / 15.5mt / 11.5mt',
      speedBallast: '13.8kn / 12.0kn (Eco Speed) / 10.0kn (Super Eco Speed)',
      consumptionBallast: '19.5mt / 15.5mt / 11.5mt',
      bwts: 'Alfa Laval Pureblast 3.1, Installed 2023',
      ldwt: 7800,
      ciiRating: 'B (Projected)',
      dimensions: 'LOA: 179.20 / Beam: 29.00 / Draught: 10.85m',
      mainEngine: 'MAN B&W 6S46ME-C8',
      nextSSDD: 'April 2028',
      technicalRating: '8.1/10',
      surveyor: 'Aalmar Marine Surveyor',
      inspectionDate: 'November 15, 2025',
    },
    financials: {
      purchasePrice: 17200000,
      equityValue: 11000000,
      mortgageDebt: 8700000,
      margin: '225 bps, falling to 210 bps after full cash sweep',
      upfrontFee: '100 bps',
      commitmentFee: '100 bps',
      tenor: '5 years from delivery',
      balloonPayment: 2900000,
      ageAdjustedProfile: '>20-year profile to zero',
      cashBreakeven: 9200,
      opexBudget: 5100,
      baseCaseIRR: 18.5,
      moic: 2.05,
    },
    market: {
      avgNetTCRate: 13800,
      netSalesPrice: 14500000,
      historicalAvgBHSI: 13562,
      historicalAvg16YearOld: 15000000,
    },
    management: {
      technicalCommercial: 'Dalex Shipping Co. S.A.',
      corporateManager: 'NRP Business Management AS',
      arranger: 'NRP Project Finance AS',
      sponsor: 'Dalex Shipping Co. S.A. (min. 30% equity)',
    },
    highlights: [
      'Acquisition at attractive entry level (Abt. 8% below newbuild parity)',
      'Vessel rated technically 8.1 out of 10 by Aalmar Marine Surveyor',
      'Modern eco-design with fuel-efficient engines',
      'Strong market fundamentals with limited orderbook',
      'Attractive debt financing with over 20-year profile to zero',
      'Dalex Shipping investing 30% equity',
      'Pre-subscriptions and indications of abt. 75%',
    ],
    returnScenarios: [
      {
        avgTCRate: 11200,
        salesPrice: 10500000,
        irr: 2.1,
        label: 'Low Case',
      },
      {
        avgTCRate: 13800,
        salesPrice: 14500000,
        irr: 18.5,
        label: 'Base Case',
      },
      {
        avgTCRate: 15800,
        salesPrice: 17500000,
        irr: 29.8,
        label: 'High Case',
      },
    ],
    subscriptionPeriod: '01.12.2025 – 15.12.2025',
    riskFactors: [
      'Market volatility in shipping industry',
      'Regulatory changes affecting maritime operations',
      'Fuel price fluctuations',
      'Currency exchange rate risks',
      'Counterparty risk in charter agreements',
      'Technical and operational risks',
      'Residual value fluctuations',
      'Liquidity of company shares',
      'Legislative, class, environment and tax changes',
    ],
  },
  {
    id: '3',
    title: 'MV Nordic Carrier',
    shipName: 'MV Nordic Carrier',
    shipNameToBeRenamed: '',
    sector: 'shipping',
    shipType: 'Handysize Dry Bulk Carrier',
    description: 'Acquisition of Japanese 2013-built Handysize Dry Bulk Vessel. The purchase price for the 35,800dwt unit is USD 14.8m (abt. 12% below newbuild parity). Well-maintained vessel with recent drydock completion.',
    minInvestment: 127500,
    goal: 8500000,
    raised: 6375000, // 75% pre-subscriptions
    deadline: '2025-12-20',
    investors: 0,
    status: 'open',
    equity: 54,
    debt: 46,
    riskLevel: 'Medium',
    expectedReturn: '15.8% p.a.',
    duration: '5 years',
    vessel: {
      built: 'September 2013',
      yard: 'Onomichi, Japan',
      design: 'Handysize',
      class: 'NKK',
      flag: 'Marshall Islands',
      deadweight: 35800,
      cargoHolds: 5,
      hatches: 5,
      speedLaden: '12.3kn / 10.8kn (Eco Speed) / 8.8kn (Super Eco Speed)',
      consumptionLaden: '20.5mt / 16.5mt / 12.5mt',
      speedBallast: '13.2kn / 11.2kn (Eco Speed) / 9.2kn (Super Eco Speed)',
      consumptionBallast: '20.5mt / 16.5mt / 12.5mt',
      bwts: 'Alfa Laval Pureblast 3.0, Installed 2021',
      ldwt: 7400,
      ciiRating: 'B (Projected)',
      dimensions: 'LOA: 175.80 / Beam: 28.60 / Draught: 10.65m',
      mainEngine: 'MAN B&W 6S46MCC8',
      nextSSDD: 'February 2027',
      technicalRating: '7.6/10',
      surveyor: 'Aalmar Marine Surveyor',
      inspectionDate: 'November 20, 2025',
    },
    financials: {
      purchasePrice: 14800000,
      equityValue: 8500000,
      mortgageDebt: 6800000,
      margin: '235 bps, falling to 220 bps after full cash sweep',
      upfrontFee: '100 bps',
      commitmentFee: '100 bps',
      tenor: '5 years from delivery',
      balloonPayment: 2200000,
      ageAdjustedProfile: '>20-year profile to zero',
      cashBreakeven: 8900,
      opexBudget: 4800,
      baseCaseIRR: 15.8,
      moic: 1.85,
    },
    market: {
      avgNetTCRate: 13100,
      netSalesPrice: 12000000,
      historicalAvgBHSI: 13562,
      historicalAvg16YearOld: 13000000,
    },
    management: {
      technicalCommercial: 'Dalex Shipping Co. S.A.',
      corporateManager: 'NRP Business Management AS',
      arranger: 'NRP Project Finance AS',
      sponsor: 'Dalex Shipping Co. S.A. (min. 30% equity)',
    },
    highlights: [
      'Acquisition at attractive entry level (Abt. 12% below newbuild parity)',
      'Vessel rated technically 7.6 out of 10 by Aalmar Marine Surveyor',
      'Well-maintained vessel with recent drydock completion',
      'Competitive operating costs',
      'Attractive debt financing with over 20-year profile to zero',
      'Dalex Shipping investing 30% equity',
      'Pre-subscriptions and indications of abt. 75%',
    ],
    returnScenarios: [
      {
        avgTCRate: 10700,
        salesPrice: 8500000,
        irr: -1.2,
        label: 'Low Case',
      },
      {
        avgTCRate: 13100,
        salesPrice: 12000000,
        irr: 15.8,
        label: 'Base Case',
      },
      {
        avgTCRate: 15000,
        salesPrice: 14500000,
        irr: 26.5,
        label: 'High Case',
      },
    ],
    subscriptionPeriod: '05.12.2025 – 20.12.2025',
    riskFactors: [
      'Market volatility in shipping industry',
      'Regulatory changes affecting maritime operations',
      'Fuel price fluctuations',
      'Currency exchange rate risks',
      'Counterparty risk in charter agreements',
      'Technical and operational risks',
      'Residual value fluctuations',
      'Liquidity of company shares',
      'Legislative, class, environment and tax changes',
    ],
  },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'vessel' | 'financials' | 'returns' | 'risks'>(
    'overview'
  )

  const projectId = params?.id as string
  const mockProject = projectsData.find(p => p.id === projectId) || dalexHandyProject

  const progress = (mockProject.raised / mockProject.goal) * 100
  const daysRemaining = Math.ceil(
    (new Date(mockProject.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const handleContact = () => {
    const email = 'chrisalexopoulos01@gmail.com'
    const subject = `Interest in ${mockProject.shipName}`
    const body = `I am interested in participating in the project ${mockProject.shipName}. I'd love to talk more about this.`
    
    // Try Gmail compose URL first (works if user is logged into Gmail)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Fallback to mailto (opens default email client)
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Try opening Gmail in a new window
    const gmailWindow = window.open(gmailUrl, '_blank')
    
    // If Gmail window didn't open or was blocked, fall back to mailto
    if (!gmailWindow || gmailWindow.closed || typeof gmailWindow.closed === 'undefined') {
      window.location.href = mailtoUrl
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        {/* Back Button */}
        <Link
          href="/marketplace"
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
        {/* Header */}
        <div className="bg-black border border-gray-800 rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(144, 238, 144, 0.2)', color: '#90EE90' }}>
                  {mockProject.shipType}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(144, 238, 144, 0.2)', color: '#90EE90' }}>
                  {mockProject.status}
                </span>
              </div>
              <h1 className="text-3xl font-medium text-white mb-3">
                {mockProject.title}
              </h1>
              <p className="text-gray-400 text-lg">{mockProject.description}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-800">
            <div>
              <div className="text-sm text-gray-500 mb-1">Equity Raised</div>
              <div className="text-2xl font-medium text-white">
                ${(mockProject.raised / 1000000).toFixed(2)}M
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Equity Goal</div>
              <div className="text-2xl font-medium text-white">
                ${(mockProject.goal / 1000000).toFixed(2)}M
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Purchase Price</div>
              <div className="text-2xl font-medium text-white">
                ${(mockProject.financials.purchasePrice / 1000000).toFixed(1)}M
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Base Case IRR</div>
              <div className="text-2xl font-medium text-[#90EE90]">
                {mockProject.financials.baseCaseIRR}%
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-white">
                Equity Subscription Progress
              </span>
              <span className="text-lg font-semibold" style={{ color: '#90EE90' }}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: '#90EE90' }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Subscription period: {mockProject.subscriptionPeriod || '17.11.2025 – 26.11.2025'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black rounded-lg border border-gray-800 mb-6">
          <div className="flex border-b border-gray-800">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'vessel', label: 'Vessel Details' },
              { key: 'financials', label: 'Financials' },
              { key: 'returns', label: 'Return Scenarios' },
              { key: 'risks', label: 'Risk Factors' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={activeTab === tab.key ? { borderBottomColor: '#90EE90', color: '#90EE90' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'overview' && <OverviewTab project={mockProject} />}
            {activeTab === 'vessel' && <VesselTab project={mockProject} />}
            {activeTab === 'financials' && <FinancialsTab project={mockProject} />}
            {activeTab === 'returns' && <ReturnsTab project={mockProject} />}
            {activeTab === 'risks' && <RisksTab project={mockProject} />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-black rounded-lg border border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleContact}
              className="flex-1 text-white py-4 px-6 rounded-lg font-medium transition-colors text-center"
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
              Contact
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Minimum subscription: ${(mockProject.minInvestment / 1000).toFixed(0)}K (1.5% of equity)
          </p>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ project }: { project: any }) {
  return (
    <div className="space-y-8">
      {/* Investment Highlights */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Investment Highlights
        </h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <ul className="space-y-3">
            {project.highlights?.map((highlight: string, index: number) => (
              <li key={index} className="flex items-start gap-3 text-gray-300">
                <span className="text-[#90EE90] mt-1">✓</span>
                <span className="text-sm">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Funding Breakdown */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Capital Structure
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Equity</div>
            <div className="text-2xl font-medium text-white">{project.equity}%</div>
            <div className="text-xs text-gray-500 mt-1">${(project.financials?.equityValue / 1000000).toFixed(1)}M</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Debt</div>
            <div className="text-2xl font-medium text-white">{project.debt}%</div>
            <div className="text-xs text-gray-500 mt-1">${(project.financials?.mortgageDebt / 1000000).toFixed(1)}M</div>
          </div>
        </div>
      </div>

      {/* Key Project Details */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Key Project Details
        </h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Minimum Investment</span>
              <span className="font-medium text-white">
                ${(project.minInvestment / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Expected Return (Base Case)</span>
              <span className="font-medium text-[#90EE90]">
                {project.expectedReturn}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Project Duration</span>
              <span className="font-medium text-white">{project.duration}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Cash Breakeven Rate</span>
              <span className="font-medium text-white">
                ${project.financials?.cashBreakeven?.toLocaleString()}/day
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">MOIC (Multiple on Invested Capital)</span>
              <span className="font-medium text-[#90EE90]">
                {project.financials?.moic}x
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-400">Management</span>
              <span className="font-medium text-white text-right">
                {project.management?.technicalCommercial}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VesselTab({ project }: { project: any }) {
  const vessel = project.vessel
  if (!vessel) return <div className="text-white">No vessel details available</div>
  
  return (
    <div className="space-y-8">
      {/* Vessel Specifications */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Vessel Specifications</h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Vessel Name</div>
              <div className="text-white font-medium">{project.shipName}</div>
              <div className="text-xs text-gray-500 mt-1">To be renamed: {project.shipNameToBeRenamed}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Built</div>
              <div className="text-white font-medium">{vessel.built}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Shipyard</div>
              <div className="text-white font-medium">{vessel.yard}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Design</div>
              <div className="text-white font-medium">{vessel.design}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Deadweight</div>
              <div className="text-white font-medium">{vessel.deadweight?.toLocaleString()} dwt</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Class</div>
              <div className="text-white font-medium">{vessel.class}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Flag</div>
              <div className="text-white font-medium">{vessel.flag}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">CII Rating</div>
              <div className="text-white font-medium">{vessel.ciiRating}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Technical Rating</div>
              <div className="text-[#90EE90] font-medium">{vessel.technicalRating} by {vessel.surveyor}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Next SS/DD</div>
              <div className="text-white font-medium">{vessel.nextSSDD}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Characteristics */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Performance Characteristics</h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-2">Speed & Consumption (Laden)</div>
              <div className="text-white">{vessel.speedLaden}</div>
              <div className="text-gray-400 text-sm mt-1">Consumption: {vessel.consumptionLaden}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Speed & Consumption (Ballast)</div>
              <div className="text-white">{vessel.speedBallast}</div>
              <div className="text-gray-400 text-sm mt-1">Consumption: {vessel.consumptionBallast}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Main Engine</div>
              <div className="text-white">{vessel.mainEngine}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Ballast Water Treatment System</div>
              <div className="text-white">{vessel.bwts}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Dimensions</div>
              <div className="text-white">{vessel.dimensions}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Cargo Holds / Hatches</div>
              <div className="text-white">{vessel.cargoHolds} Holds / {vessel.hatches} Hatches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FinancialsTab({ project }: { project: any }) {
  const financials = project.financials
  if (!financials) return <div className="text-white">No financial details available</div>
  
  return (
    <div className="space-y-8">
      {/* Sources & Uses */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Sources & Uses</h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-3">Sources</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Paid in Equity</span>
                  <span className="text-white">${(financials.equityValue / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Mortgage Loan</span>
                  <span className="text-white">${(financials.mortgageDebt / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-3">Uses</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Purchase Price</span>
                  <span className="text-white">${(financials.purchasePrice / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Working Capital</span>
                  <span className="text-white">$0.7M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fees & Expenses</span>
                  <span className="text-white">$0.5M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financing Terms */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Financing Terms</h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Loan Facility</span>
              <span className="text-white">${(financials.mortgageDebt / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Tenor</span>
              <span className="text-white">{financials.tenor}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Margin</span>
              <span className="text-white">{financials.margin}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Upfront Fee</span>
              <span className="text-white">{financials.upfrontFee}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Balloon Payment</span>
              <span className="text-white">${(financials.balloonPayment / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-400">Age-Adjusted Profile</span>
              <span className="text-white">{financials.ageAdjustedProfile}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operating Economics */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Operating Economics</h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Cash Breakeven Rate</span>
              <span className="text-[#90EE90] font-medium">${financials.cashBreakeven?.toLocaleString()}/day</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">OPEX Budget (incl. Management)</span>
              <span className="text-white">${financials.opexBudget?.toLocaleString()}/day</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Average Net TC Rate (Base Case)</span>
              <span className="text-white">${project.market?.avgNetTCRate?.toLocaleString()}/day</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-400">Net Sales Price (Year 5)</span>
              <span className="text-white">${(project.market?.netSalesPrice / 1000000).toFixed(2)}M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReturnsTab({ project }: { project: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Return Scenarios</h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-400 mb-6">
            The return calculation assumes a 60-month holding period with a sale of the vessel at the end of year 5 of operation. 
            IRR calculations are net to owners.
          </p>
          <div className="space-y-4">
            {project.returnScenarios?.map((scenario: any, index: number) => (
              <div key={index} className="border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{scenario.label}</span>
                  <span className={`text-2xl font-bold ${scenario.irr >= 17 ? 'text-[#90EE90]' : scenario.irr >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {scenario.irr > 0 ? '+' : ''}{scenario.irr}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Avg. Net TC Rate</div>
                    <div className="text-white">${scenario.avgTCRate?.toLocaleString()}/day</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Net Sales Price</div>
                    <div className="text-white">${(scenario.salesPrice / 1000000).toFixed(2)}M</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Historical Market Context</h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Historical Average BHSI-38 (2017-2025 YTD)</span>
              <span className="text-white">${project.market?.historicalAvgBHSI?.toLocaleString()}/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Historical Average 16-Year Old Handysize</span>
              <span className="text-white">${(project.market?.historicalAvg16YearOld / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RisksTab({ project }: { project: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Risk Factors</h3>
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
          <p className="text-sm text-gray-400 mb-4">
            Investment in this project is associated with various risks. Investors must be aware of the risk of losing part of or the whole invested amount. 
            This list should not be considered exhaustive.
          </p>
          <ul className="space-y-3">
            {project.riskFactors?.map((risk: string, index: number) => (
              <li key={index} className="flex items-start gap-3 text-gray-300">
                <span className="text-yellow-400 mt-1">⚠</span>
                <span className="text-sm">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

