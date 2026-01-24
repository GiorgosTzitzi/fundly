'use client'

import { useState, useRef, useEffect } from 'react'

interface CountryCode {
  code: string
  country: string
  flag: string
}

interface CountryCodeDropdownProps {
  value: string
  onChange: (value: string) => void
  options: CountryCode[]
}

export default function CountryCodeDropdown({ value, onChange, options }: CountryCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.code === value) || options[0]

  const filteredOptions = options.filter(opt =>
    opt.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.code.includes(searchTerm)
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (code: string) => {
    onChange(code)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative w-64" ref={dropdownRef}>
      {/* Selected Value Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-black border border-gray-600 text-white rounded-lg outline-none text-left flex items-center justify-between transition-all"
        style={{
          borderColor: isOpen ? '#90EE90' : '#4B5563',
          boxShadow: isOpen ? '0 0 0 2px #90EE90' : 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#90EE90'
          e.currentTarget.style.boxShadow = '0 0 0 2px #90EE90'
        }}
        onBlur={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#4B5563'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{selectedOption.flag}</span>
          <span className="text-sm">{selectedOption.code}</span>
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-black border border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-600">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-gray-600 text-white rounded text-sm outline-none placeholder-gray-500"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#90EE90'
                e.currentTarget.style.boxShadow = '0 0 0 2px #90EE90'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#4B5563'
                e.currentTarget.style.boxShadow = 'none'
              }}
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={`${option.code}-${option.country}-${index}`}
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className="w-full px-4 py-3 text-left text-white hover:bg-gray-900 transition-colors flex items-center gap-3 border-b border-gray-800 last:border-b-0"
                  style={{
                    backgroundColor: value === option.code ? 'rgba(144, 238, 144, 0.1)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== option.code) {
                      e.currentTarget.style.backgroundColor = '#1F2937'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== option.code) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span className="text-lg">{option.flag}</span>
                  <span className="flex-1 text-sm">{option.country}</span>
                  <span className="text-sm text-gray-400">{option.code}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
