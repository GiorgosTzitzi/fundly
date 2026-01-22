'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

type Project = {
  id: string
  title: string
  sector: 'shipping' | 'construction'
  description: string
  minInvestment: number
  goal: number
  raised: number
  deadline: string
  investors: number
  status: 'open' | 'funded' | 'closing'
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Container Ship Fleet Expansion',
    sector: 'shipping',
    description:
      'Acquisition of two modern container vessels to expand Mediterranean routes',
    minInvestment: 50000,
    goal: 5000000,
    raised: 2500000,
    deadline: '2024-08-15',
    investors: 12,
    status: 'open',
  },
  {
    id: '2',
    title: 'Residential Complex Development',
    sector: 'construction',
    description:
      'Construction of 120-unit residential complex in Athens metropolitan area',
    minInvestment: 25000,
    goal: 8000000,
    raised: 3200000,
    deadline: '2024-09-30',
    investors: 18,
    status: 'open',
  },
  {
    id: '3',
    title: 'Bulk Carrier Modernization',
    sector: 'shipping',
    description:
      'Retrofit of existing bulk carrier fleet with eco-friendly propulsion systems',
    minInvestment: 75000,
    goal: 3500000,
    raised: 1750000,
    deadline: '2024-07-20',
    investors: 8,
    status: 'open',
  },
  {
    id: '4',
    title: 'Commercial Office Building',
    sector: 'construction',
    description:
      'Development of 15-story office building in central business district',
    minInvestment: 100000,
    goal: 10000000,
    raised: 4500000,
    deadline: '2024-10-15',
    investors: 15,
    status: 'open',
  },
]

export default function MarketplacePage() {
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const sectors = [
    { key: 'all', label: 'All Projects' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'construction', label: 'Construction' },
  ]

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSector =
      selectedSector === 'all' || project.sector === selectedSector
    const matchesSearch =
      searchQuery === '' ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSector && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-6">
            <Logo className="mb-4" />
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-medium text-gray-900">Marketplace</h1>
              <div className="text-sm text-gray-600">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ border: '1px solid #90EE90' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#90EE90'
                  e.currentTarget.style.boxShadow = '0 0 0 2px #90EE90'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#90EE90'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            <div className="flex gap-2">
              {sectors.map((sector) => (
                <button
                  key={sector.key}
                  onClick={() => setSelectedSector(sector.key)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedSector === sector.key
                      ? 'text-black'
                      : 'bg-white text-gray-700'
                  }`}
                  style={selectedSector === sector.key 
                    ? { backgroundColor: '#90EE90' }
                    : { border: '1px solid #90EE90' }
                  }
                  onMouseEnter={(e) => {
                    if (selectedSector !== sector.key) {
                      e.currentTarget.style.backgroundColor = '#90EE90'
                      e.currentTarget.style.color = '#000000'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSector !== sector.key) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF'
                      e.currentTarget.style.color = '#374151'
                    }
                  }}
                >
                  {sector.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const progress = (project.raised / project.goal) * 100
  const daysRemaining = Math.ceil(
    (new Date(project.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const sectorColors = {
    shipping: 'text-[#90EE90]',
    construction: 'text-[#90EE90]',
  }

  const statusColors = {
    open: 'text-[#90EE90]',
    funded: 'bg-gray-100 text-gray-800',
    closing: 'text-[#90EE90]',
  }

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${sectorColors[project.sector]}`}
                style={{ backgroundColor: 'rgba(144, 238, 144, 0.2)' }}
              >
                {project.sector.charAt(0).toUpperCase() +
                  project.sector.slice(1)}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${statusColors[project.status]}`}
                style={project.status === 'open' || project.status === 'closing' 
                  ? { backgroundColor: 'rgba(144, 238, 144, 0.2)' }
                  : {}
                }
              >
                {project.status}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {project.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              €{(project.raised / 1000000).toFixed(1)}M raised
            </span>
            <span className="text-sm text-gray-500">
              of €{(project.goal / 1000000).toFixed(1)}M goal
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: '#90EE90' }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {progress.toFixed(0)}% funded
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500 mb-1">Min. Investment</div>
            <div className="text-sm font-medium text-gray-900">
              €{(project.minInvestment / 1000).toFixed(0)}K
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Investors</div>
            <div className="text-sm font-medium text-gray-900">
              {project.investors}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Days Left</div>
            <div className="text-sm font-medium text-gray-900">
              {daysRemaining > 0 ? daysRemaining : 0}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
