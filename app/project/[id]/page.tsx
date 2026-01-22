'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Logo from '@/components/Logo'

type Activity = {
  id: string
  date: string
  type: 'created' | 'investment' | 'milestone' | 'update'
  message: string
  user?: string
  amount?: number
}

const mockProject = {
  id: '1',
  title: 'Container Ship Fleet Expansion',
  sector: 'shipping',
  description:
    'Acquisition of two modern container vessels to expand Mediterranean routes. This project will enable the operator to serve additional ports and increase capacity by 40%.',
  minInvestment: 50000,
  goal: 5000000,
  raised: 2500000,
  deadline: '2024-08-15',
  investors: 12,
  status: 'open',
  equity: 60,
  debt: 40,
  riskLevel: 'Medium',
  expectedReturn: '12-15%',
  duration: '5 years',
}

const mockActivities: Activity[] = [
  {
    id: '1',
    date: '2024-01-10',
    type: 'created',
    message: 'Project created by owner',
  },
  {
    id: '2',
    date: '2024-01-15',
    type: 'investment',
    message: 'Investment received',
    user: 'Investor A',
    amount: 200000,
  },
  {
    id: '3',
    date: '2024-01-20',
    type: 'investment',
    message: 'Investment received',
    user: 'Investor B',
    amount: 500000,
  },
  {
    id: '4',
    date: '2024-02-01',
    type: 'milestone',
    message: 'Vessel inspection completed',
  },
  {
    id: '5',
    date: '2024-02-15',
    type: 'investment',
    message: 'Investment received',
    user: 'Investor C',
    amount: 300000,
  },
  {
    id: '6',
    date: '2024-03-01',
    type: 'update',
    message: 'Due diligence phase completed',
  },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'activity'>(
    'overview'
  )

  const progress = (mockProject.raised / mockProject.goal) * 100
  const daysRemaining = Math.ceil(
    (new Date(mockProject.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Logo */}
        <div className="mb-6">
          <Logo />
        </div>
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(144, 238, 144, 0.2)', color: '#90EE90' }}>
                  {mockProject.sector.charAt(0).toUpperCase() +
                    mockProject.sector.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(144, 238, 144, 0.2)', color: '#90EE90' }}>
                  {mockProject.status}
                </span>
              </div>
              <h1 className="text-3xl font-medium text-gray-900 mb-3">
                {mockProject.title}
              </h1>
              <p className="text-gray-600 text-lg">{mockProject.description}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Raised</div>
              <div className="text-2xl font-medium text-gray-900">
                €{(mockProject.raised / 1000000).toFixed(2)}M
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Funding Goal</div>
              <div className="text-2xl font-medium text-gray-900">
                €{(mockProject.goal / 1000000).toFixed(2)}M
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Investors</div>
              <div className="text-2xl font-medium text-gray-900">
                {mockProject.investors}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Days Remaining</div>
              <div className="text-2xl font-medium text-gray-900">
                {daysRemaining > 0 ? daysRemaining : 0}
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-900">
                Funding Progress
              </span>
              <span className="text-lg font-semibold" style={{ color: '#90EE90' }}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: '#90EE90' }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'investors', label: 'Investors' },
              { key: 'activity', label: 'Activity' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === tab.key ? { borderBottomColor: '#90EE90', color: '#90EE90' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'overview' && <OverviewTab project={mockProject} />}
            {activeTab === 'investors' && <InvestorsTab />}
            {activeTab === 'activity' && <ActivityTab activities={mockActivities} />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 text-black py-4 px-6 rounded-lg font-medium transition-colors" style={{ backgroundColor: '#90EE90' }}>
              Invest Now
            </button>
            <button 
              className="flex-1 text-gray-700 py-4 px-6 rounded-lg font-medium transition-colors"
              style={{ border: '1px solid #90EE90' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#90EE90'
                e.currentTarget.style.color = '#000000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#374151'
              }}
            >
              Ask a Question
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ project }: { project: any }) {
  return (
    <div className="space-y-8">
      {/* Funding Breakdown */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Funding Breakdown
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Equity</div>
            <div className="text-2xl font-medium text-gray-900">{project.equity}%</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Debt</div>
            <div className="text-2xl font-medium text-gray-900">{project.debt}%</div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Project Details
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Minimum Investment</span>
            <span className="font-medium text-gray-900">
              €{(project.minInvestment / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Expected Return</span>
            <span className="font-medium text-gray-900">
              {project.expectedReturn}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Duration</span>
            <span className="font-medium text-gray-900">{project.duration}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Risk Level</span>
            <span className="font-medium text-gray-900">{project.riskLevel}</span>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Factors</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>Market volatility in shipping industry</li>
            <li>Regulatory changes affecting maritime operations</li>
            <li>Fuel price fluctuations</li>
            <li>Currency exchange rate risks</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function InvestorsTab() {
  const mockInvestors = [
    { name: 'Investor A', amount: 200000, date: '2024-01-15' },
    { name: 'Investor B', amount: 500000, date: '2024-01-20' },
    { name: 'Investor C', amount: 300000, date: '2024-02-15' },
    { name: 'Investor D', amount: 150000, date: '2024-02-20' },
    { name: 'Investor E', amount: 350000, date: '2024-03-01' },
  ]

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Current Investors
      </h3>
      <div className="space-y-3">
        {mockInvestors.map((investor, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-3 border-b border-gray-100"
          >
            <div>
              <div className="font-medium text-gray-900">{investor.name}</div>
              <div className="text-sm text-gray-500">
                Invested on {new Date(investor.date).toLocaleDateString()}
              </div>
            </div>
            <div className="text-lg font-medium text-gray-900">
              €{(investor.amount / 1000).toFixed(0)}K
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityTab({ activities }: { activities: Activity[] }) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return '📋'
      case 'investment':
        return '💰'
      case 'milestone':
        return '🎯'
      case 'update':
        return '📢'
      default:
        return '•'
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
          >
            <div className="text-2xl">{getActivityIcon(activity.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">
                  {activity.message}
                </span>
                {activity.user && (
                  <span className="text-sm text-gray-500">by {activity.user}</span>
                )}
                {activity.amount && (
                  <span className="text-sm font-medium" style={{ color: '#90EE90' }}>
                    €{(activity.amount / 1000).toFixed(0)}K
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(activity.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
