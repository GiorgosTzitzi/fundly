'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { supabase } from '@/lib/supabaseClient'

// Import project data structure
type ProjectData = {
  id: string
  shipName: string
  shipType: string
  minInvestment: number
  returnPerYear: number
  purchasePrice: number
  equityValue: number
  deadweight: number
  built: string
  technicalRating: string
  financials?: {
    baseCaseIRR: number
    moic: number
    cashBreakeven: number
    opexBudget: number
  }
  market?: {
    avgNetTCRate: number
    netSalesPrice: number
  }
}

// Project data - same as in marketplace and project detail pages
const allProjects: ProjectData[] = [
  {
    id: '1',
    shipName: 'MV Atlantic Bulker',
    shipType: 'Handysize Dry Bulk Carrier',
    minInvestment: 142500,
    returnPerYear: 17.0,
    purchasePrice: 16000000,
    equityValue: 9500000,
    deadweight: 36309,
    built: 'April 2014',
    technicalRating: '7.8/10',
    financials: {
      baseCaseIRR: 17.1,
      moic: 1.91,
      cashBreakeven: 9100,
      opexBudget: 4950,
    },
    market: {
      avgNetTCRate: 13450,
      netSalesPrice: 13250000,
    },
  },
  {
    id: '2',
    shipName: 'MV Pacific Trader',
    shipType: 'Handysize Dry Bulk Carrier',
    minInvestment: 165000,
    returnPerYear: 18.5,
    purchasePrice: 17200000,
    equityValue: 11000000,
    deadweight: 37200,
    built: 'March 2015',
    technicalRating: '8.1/10',
    financials: {
      baseCaseIRR: 18.5,
      moic: 2.05,
      cashBreakeven: 9200,
      opexBudget: 5100,
    },
    market: {
      avgNetTCRate: 13800,
      netSalesPrice: 14500000,
    },
  },
  {
    id: '3',
    shipName: 'MV Nordic Carrier',
    shipType: 'Handysize Dry Bulk Carrier',
    minInvestment: 127500,
    returnPerYear: 15.8,
    purchasePrice: 14800000,
    equityValue: 8500000,
    deadweight: 35800,
    built: 'September 2013',
    technicalRating: '7.6/10',
    financials: {
      baseCaseIRR: 15.8,
      moic: 1.85,
      cashBreakeven: 8900,
      opexBudget: 4800,
    },
    market: {
      avgNetTCRate: 13100,
      netSalesPrice: 12000000,
    },
  },
]

type InvestorProfile = {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentHorizon: 'short' | 'medium' | 'long'
  priority: 'returns' | 'safety' | 'balance'
  experience: 'beginner' | 'intermediate' | 'expert'
  investmentAmount: number
}

type AIRecommendation = {
  recommendedDeal: string
  reasoning: string
  strengths: string[]
  weaknesses: string[]
  riskAssessment: string
  confidence: number
}

function ComparePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null)
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    checkAuthorization()
    // Get selected projects from URL params
    const projectIds = searchParams.get('projects')?.split(',') || []
    setSelectedProjects(projectIds.filter(Boolean))
  }, [searchParams])

  const checkAuthorization = async () => {
    try {
      const sessionEmail = sessionStorage.getItem('user_email')
      if (!sessionEmail) {
        setIsAuthorized(false)
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('applications')
        .select('status, email')
        .eq('email', sessionEmail)
        .eq('status', 'approved')
        .single()

      if (data && !error && data.status === 'approved') {
        setIsAuthorized(true)
        setIsLoading(false)
      } else {
        setIsAuthorized(false)
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Authorization error:', err)
      setIsAuthorized(false)
      setIsLoading(false)
    }
  }

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId)
      } else if (prev.length < 3) {
        return [...prev, projectId]
      }
      return prev
    })
  }

  const getSelectedProjectData = () => {
    return allProjects.filter(p => selectedProjects.includes(p.id))
  }

  const handleAnalyze = async () => {
    if (!investorProfile || selectedProjects.length < 2) return

    setIsAnalyzing(true)
    try {
      const projectsToCompare = getSelectedProjectData()
      
      const response = await fetch('/api/analyze-deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projects: projectsToCompare,
          investorProfile,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Analysis failed`)
      }

      const data = await response.json()
      
      // Validate response has required fields
      if (!data.recommendedDeal) {
        throw new Error('Invalid response from AI analysis')
      }
      
      setAiRecommendation(data)
    } catch (error: any) {
      console.error('Error analyzing deals:', error)
      alert(`Error analyzing deals: ${error.message || 'Please try again.'}`)
    } finally {
      setIsAnalyzing(false)
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
            <h2 className="text-2xl font-medium text-white">Access Restricted</h2>
            <p className="text-gray-400 text-sm">
              The comparison tool is only available to approved investors.
            </p>
            <Link
              href="/marketplace"
              className="block w-full py-4 px-6 rounded-lg font-medium tracking-wider text-black transition-colors"
              style={{ backgroundColor: '#90EE90' }}
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const selectedData = getSelectedProjectData()

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <Logo />
          </div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-medium text-white">Compare Deals</h1>
            <Link
              href="/marketplace"
              className="text-gray-400 hover:text-[#90EE90] transition-colors text-sm"
            >
              ← Back to Marketplace
            </Link>
          </div>
        </div>

        {/* Project Selection */}
        <div className="bg-black border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-medium text-white mb-4">
            Select Projects to Compare (2-3 projects)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => toggleProject(project.id)}
                disabled={!selectedProjects.includes(project.id) && selectedProjects.length >= 3}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedProjects.includes(project.id)
                    ? 'border-[#90EE90] bg-[#90EE90]/10'
                    : 'border-gray-800 hover:border-gray-700'
                } ${!selectedProjects.includes(project.id) && selectedProjects.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{project.shipName}</h3>
                  {selectedProjects.includes(project.id) && (
                    <div className="w-5 h-5 rounded-full bg-[#90EE90] flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400">{project.shipType}</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-[#90EE90]">{project.returnPerYear}% IRR</span>
                  <span className="text-gray-500">${(project.minInvestment / 1000).toFixed(0)}K min</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedProjects.length >= 2 && (
          <div className="bg-black border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-medium text-white mb-6">Quick Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 text-gray-400 font-medium">Metric</th>
                    {selectedData.map((project) => (
                      <th key={project.id} className="text-center py-3 text-white font-medium">
                        {project.shipName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 text-gray-400">Minimum Investment</td>
                    {selectedData.map((project) => (
                      <td key={project.id} className="py-3 text-center text-white">
                        ${(project.minInvestment / 1000).toFixed(0)}K
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 text-gray-400">Base Case IRR</td>
                    {selectedData.map((project) => (
                      <td key={project.id} className="py-3 text-center text-[#90EE90] font-semibold">
                        {project.financials?.baseCaseIRR || project.returnPerYear}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 text-gray-400">MOIC</td>
                    {selectedData.map((project) => (
                      <td key={project.id} className="py-3 text-center text-white">
                        {project.financials?.moic || 'N/A'}x
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 text-gray-400">Purchase Price</td>
                    {selectedData.map((project) => (
                      <td key={project.id} className="py-3 text-center text-white">
                        ${(project.purchasePrice / 1000000).toFixed(1)}M
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 text-gray-400">Equity Value</td>
                    {selectedData.map((project) => (
                      <td key={project.id} className="py-3 text-center text-white">
                        ${(project.equityValue / 1000000).toFixed(1)}M
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 text-gray-400">Deadweight</td>
                    {selectedData.map((project) => (
                      <td key={project.id} className="py-3 text-center text-white">
                        {project.deadweight.toLocaleString()} dwt
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 text-gray-400">Built</td>
                    {selectedData.map((project) => (
                      <td key={project.id} className="py-3 text-center text-white">
                        {project.built}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-900">
                    <td className="py-3 text-gray-400">Technical Rating</td>
                    {selectedData.map((project) => (
                      <td key={project.id} className="py-3 text-center text-white">
                        {project.technicalRating}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-400">Cash Breakeven</td>
                    {selectedData.map((project) => (
                      <td key={project.id} className="py-3 text-center text-white">
                        ${project.financials?.cashBreakeven?.toLocaleString() || 'N/A'}/day
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Investor Profile Form */}
        {selectedProjects.length >= 2 && !investorProfile && (
          <div className="bg-black border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-medium text-white mb-4">Your Investment Profile</h2>
            <p className="text-gray-400 text-sm mb-6">
              Help us understand your investment preferences for personalized recommendations.
            </p>
            <InvestorProfileForm
              onSubmit={(profile) => {
                setInvestorProfile(profile)
                setShowProfileForm(false)
              }}
            />
          </div>
        )}

        {/* AI Analysis */}
        {investorProfile && selectedProjects.length >= 2 && (
          <div className="bg-black border border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-white">AI-Powered Analysis</h2>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-2 rounded-lg font-medium text-black transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#90EE90' }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Get AI Recommendation'}
              </button>
            </div>
            {aiRecommendation && (
              <AIRecommendationDisplay recommendation={aiRecommendation} projects={selectedData} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  )
}

function InvestorProfileForm({ onSubmit }: { onSubmit: (profile: InvestorProfile) => void }) {
  const [profile, setProfile] = useState<InvestorProfile>({
    riskTolerance: 'moderate',
    investmentHorizon: 'medium',
    priority: 'balance',
    experience: 'intermediate',
    investmentAmount: 200000,
  })

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Risk Tolerance</label>
        <select
          value={profile.riskTolerance}
          onChange={(e) => setProfile({ ...profile, riskTolerance: e.target.value as any })}
          className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-lg focus:border-[#90EE90] focus:outline-none"
        >
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Investment Horizon</label>
        <select
          value={profile.investmentHorizon}
          onChange={(e) => setProfile({ ...profile, investmentHorizon: e.target.value as any })}
          className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-lg focus:border-[#90EE90] focus:outline-none"
        >
          <option value="short">Short-term (1-3 years)</option>
          <option value="medium">Medium-term (3-5 years)</option>
          <option value="long">Long-term (5+ years)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Priority</label>
        <select
          value={profile.priority}
          onChange={(e) => setProfile({ ...profile, priority: e.target.value as any })}
          className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-lg focus:border-[#90EE90] focus:outline-none"
        >
          <option value="returns">Maximize Returns</option>
          <option value="safety">Capital Preservation</option>
          <option value="balance">Balanced Approach</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Investment Experience</label>
        <select
          value={profile.experience}
          onChange={(e) => setProfile({ ...profile, experience: e.target.value as any })}
          className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-lg focus:border-[#90EE90] focus:outline-none"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Investment Amount (USD)
        </label>
        <input
          type="number"
          value={profile.investmentAmount}
          onChange={(e) => setProfile({ ...profile, investmentAmount: Number(e.target.value) })}
          min={100000}
          step={10000}
          className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-lg focus:border-[#90EE90] focus:outline-none"
        />
      </div>

      <button
        onClick={() => onSubmit(profile)}
        className="w-full py-3 px-6 rounded-lg font-medium text-black transition-colors"
        style={{ backgroundColor: '#90EE90' }}
      >
        Save Profile & Analyze
      </button>
    </div>
  )
}

function AIRecommendationDisplay({ 
  recommendation, 
  projects 
}: { 
  recommendation: AIRecommendation
  projects: ProjectData[]
}) {
  const recommendedProject = projects.find(p => p.id === recommendation.recommendedDeal)

  return (
    <div className="mt-6 space-y-6">
      {/* Recommended Deal Highlight */}
      <div className="bg-[#90EE90]/10 border-2 border-[#90EE90] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-[#90EE90] mb-1">Recommended Deal</div>
            <h3 className="text-2xl font-semibold text-white">
              {recommendedProject?.shipName}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Confidence</div>
            <div className="text-2xl font-bold text-[#90EE90]">
              {recommendation.confidence}%
            </div>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">{recommendation.reasoning}</p>
      </div>

      {/* Strengths */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">Key Strengths</h4>
        <div className="space-y-2">
          {recommendation.strengths.map((strength, index) => (
            <div key={index} className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3">
              <span className="text-[#90EE90] mt-1">✓</span>
              <span className="text-gray-300 text-sm">{strength}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weaknesses */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">Considerations</h4>
        <div className="space-y-2">
          {recommendation.weaknesses.map((weakness, index) => (
            <div key={index} className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3">
              <span className="text-yellow-400 mt-1">⚠</span>
              <span className="text-gray-300 text-sm">{weakness}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-medium text-white mb-2">Risk Assessment</h4>
        <p className="text-gray-300 text-sm">{recommendation.riskAssessment}</p>
      </div>
    </div>
  )
}
