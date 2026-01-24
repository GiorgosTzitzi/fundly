'use client'

import { useState, useRef, useEffect } from 'react'

interface DropdownOption {
  value: string
  label: string
  icon?: string // Optional icon/emoji for display
}

interface CustomDropdownProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
}

export default function CustomDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select an option',
  searchable = false,
  searchPlaceholder = 'Search...'
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

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

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
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
          {selectedOption?.icon && <span className="text-lg">{selectedOption.icon}</span>}
          <span className="text-sm">{selectedOption?.label || placeholder}</span>
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
          {searchable && (
            <div className="p-2 border-b border-gray-600">
              <input
                type="text"
                placeholder={searchPlaceholder}
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
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="w-full px-4 py-3 text-left text-white hover:bg-gray-900 transition-colors flex items-center gap-3 border-b border-gray-800 last:border-b-0"
                  style={{
                    backgroundColor: value === option.value ? 'rgba(144, 238, 144, 0.1)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== option.value) {
                      e.currentTarget.style.backgroundColor = '#1F2937'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== option.value) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {option.icon && <span className="text-lg">{option.icon}</span>}
                  <span className="flex-1 text-sm">{option.label}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
