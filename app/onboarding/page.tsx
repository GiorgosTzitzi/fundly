'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import CountryCodeDropdown from '@/components/CountryCodeDropdown'
import CustomDropdown from '@/components/CustomDropdown'
import { supabase } from '@/lib/supabaseClient'

type Step = 'account' | 'kyc' | 'confirmation'

// Country codes for phone numbers with flags and full names
const countryCodes = [
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
]
  .filter((item, index, self) => 
    index === self.findIndex((t) => t.country === item.country)
  )
  .sort((a, b) => a.country.localeCompare(b.country))

// Country to flag emoji mapping
const countryFlags: Record<string, string> = {
  'Afghanistan': '🇦🇫', 'Albania': '🇦🇱', 'Algeria': '🇩🇿', 'Andorra': '🇦🇩', 'Angola': '🇦🇴',
  'Argentina': '🇦🇷', 'Armenia': '🇦🇲', 'Australia': '🇦🇺', 'Austria': '🇦🇹', 'Azerbaijan': '🇦🇿',
  'Bahamas': '🇧🇸', 'Bahrain': '🇧🇭', 'Bangladesh': '🇧🇩', 'Barbados': '🇧🇧', 'Belarus': '🇧🇾',
  'Belgium': '🇧🇪', 'Belize': '🇧🇿', 'Benin': '🇧🇯', 'Bhutan': '🇧🇹', 'Bolivia': '🇧🇴',
  'Bosnia and Herzegovina': '🇧🇦', 'Botswana': '🇧🇼', 'Brazil': '🇧🇷', 'Brunei': '🇧🇳', 'Bulgaria': '🇧🇬',
  'Burkina Faso': '🇧🇫', 'Burundi': '🇧🇮', 'Cambodia': '🇰🇭', 'Cameroon': '🇨🇲', 'Canada': '🇨🇦',
  'Cape Verde': '🇨🇻', 'Central African Republic': '🇨🇫', 'Chad': '🇹🇩', 'Chile': '🇨🇱', 'China': '🇨🇳',
  'Colombia': '🇨🇴', 'Comoros': '🇰🇲', 'Congo': '🇨🇬', 'Costa Rica': '🇨🇷', 'Croatia': '🇭🇷',
  'Cuba': '🇨🇺', 'Cyprus': '🇨🇾', 'Czech Republic': '🇨🇿', 'Denmark': '🇩🇰', 'Djibouti': '🇩🇯',
  'Dominica': '🇩🇲', 'Dominican Republic': '🇩🇴', 'East Timor': '🇹🇱', 'Ecuador': '🇪🇨', 'Egypt': '🇪🇬',
  'El Salvador': '🇸🇻', 'Equatorial Guinea': '🇬🇶', 'Eritrea': '🇪🇷', 'Estonia': '🇪🇪', 'Ethiopia': '🇪🇹',
  'Fiji': '🇫🇯', 'Finland': '🇫🇮', 'France': '🇫🇷', 'Gabon': '🇬🇦', 'Gambia': '🇬🇲',
  'Georgia': '🇬🇪', 'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Greece': '🇬🇷', 'Grenada': '🇬🇩',
  'Guatemala': '🇬🇹', 'Guinea': '🇬🇳', 'Guinea-Bissau': '🇬🇼', 'Guyana': '🇬🇾', 'Haiti': '🇭🇹',
  'Honduras': '🇭🇳', 'Hungary': '🇭🇺', 'Iceland': '🇮🇸', 'India': '🇮🇳', 'Indonesia': '🇮🇩',
  'Iran': '🇮🇷', 'Iraq': '🇮🇶', 'Ireland': '🇮🇪', 'Israel': '🇮🇱', 'Italy': '🇮🇹',
  'Jamaica': '🇯🇲', 'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Kazakhstan': '🇰🇿', 'Kenya': '🇰🇪',
  'Kiribati': '🇰🇮', 'Korea, North': '🇰🇵', 'Korea, South': '🇰🇷', 'Kuwait': '🇰🇼', 'Kyrgyzstan': '🇰🇬',
  'Laos': '🇱🇦', 'Latvia': '🇱🇻', 'Lebanon': '🇱🇧', 'Lesotho': '🇱🇸', 'Liberia': '🇱🇷',
  'Libya': '🇱🇾', 'Liechtenstein': '🇱🇮', 'Lithuania': '🇱🇹', 'Luxembourg': '🇱🇺', 'Macedonia': '🇲🇰',
  'Madagascar': '🇲🇬', 'Malawi': '🇲🇼', 'Malaysia': '🇲🇾', 'Maldives': '🇲🇻', 'Mali': '🇲🇱',
  'Malta': '🇲🇹', 'Marshall Islands': '🇲🇭', 'Mauritania': '🇲🇷', 'Mauritius': '🇲🇺', 'Mexico': '🇲🇽',
  'Micronesia': '🇫🇲', 'Moldova': '🇲🇩', 'Monaco': '🇲🇨', 'Mongolia': '🇲🇳', 'Montenegro': '🇲🇪',
  'Morocco': '🇲🇦', 'Mozambique': '🇲🇿', 'Myanmar': '🇲🇲', 'Namibia': '🇳🇦', 'Nauru': '🇳🇷',
  'Nepal': '🇳🇵', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Nicaragua': '🇳🇮', 'Niger': '🇳🇪',
  'Nigeria': '🇳🇬', 'Norway': '🇳🇴', 'Oman': '🇴🇲', 'Pakistan': '🇵🇰', 'Palau': '🇵🇼',
  'Panama': '🇵🇦', 'Papua New Guinea': '🇵🇬', 'Paraguay': '🇵🇾', 'Peru': '🇵🇪', 'Philippines': '🇵🇭',
  'Poland': '🇵🇱', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦', 'Romania': '🇷🇴', 'Russia': '🇷🇺',
  'Rwanda': '🇷🇼', 'Saint Kitts and Nevis': '🇰🇳', 'Saint Lucia': '🇱🇨', 'Saint Vincent': '🇻🇨',
  'Samoa': '🇼🇸', 'San Marino': '🇸🇲', 'Sao Tome and Principe': '🇸🇹', 'Saudi Arabia': '🇸🇦',
  'Senegal': '🇸🇳', 'Serbia': '🇷🇸', 'Seychelles': '🇸🇨', 'Sierra Leone': '🇸🇱', 'Singapore': '🇸🇬',
  'Slovakia': '🇸🇰', 'Slovenia': '🇸🇮', 'Solomon Islands': '🇸🇧', 'Somalia': '🇸🇴', 'South Africa': '🇿🇦',
  'South Sudan': '🇸🇸', 'Spain': '🇪🇸', 'Sri Lanka': '🇱🇰', 'Sudan': '🇸🇩', 'Suriname': '🇸🇷',
  'Swaziland': '🇸🇿', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Syria': '🇸🇾', 'Taiwan': '🇹🇼',
  'Tajikistan': '🇹🇯', 'Tanzania': '🇹🇿', 'Thailand': '🇹🇭', 'Togo': '🇹🇬', 'Tonga': '🇹🇴',
  'Trinidad and Tobago': '🇹🇹', 'Tunisia': '🇹🇳', 'Turkey': '🇹🇷', 'Turkmenistan': '🇹🇲', 'Tuvalu': '🇹🇻',
  'Uganda': '🇺🇬', 'Ukraine': '🇺🇦', 'United Arab Emirates': '🇦🇪', 'United Kingdom': '🇬🇧',
  'United States': '🇺🇸', 'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿', 'Vanuatu': '🇻🇺', 'Vatican City': '🇻🇦',
  'Venezuela': '🇻🇪', 'Vietnam': '🇻🇳', 'Yemen': '🇾🇪', 'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼'
}

// Countries list for nationality
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin',
  'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso',
  'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile',
  'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South',
  'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea',
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
  'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('account')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneCountryCode: '+1', // Default to United States
    phoneNumber: '',
    idNumber: '',
    idType: 'passport',
    nationality: '',
  })

  const steps: { key: Step; label: string }[] = [
    { key: 'account', label: 'Account Info' },
    { key: 'kyc', label: 'KYC Verification' },
    { key: 'confirmation', label: 'Confirmation' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Logo */}
        <div className="mb-8">
          <Logo />
        </div>

        {/* Back Arrow */}
        {currentStepIndex === 0 ? (
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
        ) : (
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
        )}

        {/* Step Indicators */}
        <div className="flex justify-center space-x-4 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: index <= currentStepIndex ? '#90EE90' : '#4B5563' }}
            />
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 'account' && (
          <AccountStep
            formData={formData}
            updateField={updateField}
            onNext={handleNext}
          />
        )}

        {currentStep === 'kyc' && (
          <KYCStep
            formData={formData}
            updateField={updateField}
            onNext={handleNext}
          />
        )}

        {currentStep === 'confirmation' && (
          <ConfirmationStep formData={formData} />
        )}
      </div>
    </div>
  )
}

function AccountStep({
  formData,
  updateField,
  onNext,
}: {
  formData: any
  updateField: (field: string, value: string) => void
  onNext: () => void
}) {
  const canProceed = formData.email && formData.password && formData.fullName && formData.phoneNumber

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Full name
        </label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
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
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Phone number
        </label>
        <div className="flex gap-2">
          <CountryCodeDropdown
            value={formData.phoneCountryCode}
            onChange={(value) => updateField('phoneCountryCode', value)}
            options={countryCodes}
          />
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => updateField('phoneNumber', e.target.value)}
            placeholder="Phone number"
            className="flex-1 px-4 py-3 bg-black border border-gray-600 text-white rounded-lg outline-none placeholder-gray-500"
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
      </div>

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
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
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
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
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
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-4 px-6 rounded-lg font-medium transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#90EE90', color: '#000000' }}
      >
        Continue
      </button>
    </div>
  )
}

function KYCStep({
  formData,
  updateField,
  onNext,
}: {
  formData: any
  updateField: (field: string, value: string) => void
  onNext: () => void
}) {
  const canProceed = formData.idNumber && formData.nationality

  return (
    <div className="space-y-5">
        <div>
          <label
            htmlFor="idType"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            ID type
          </label>
          <CustomDropdown
            value={formData.idType}
            onChange={(value) => updateField('idType', value)}
            options={[
              { value: 'passport', label: 'Passport' },
              { value: 'national-id', label: 'National ID' },
              { value: 'drivers-license', label: "Driver's License" },
            ]}
            placeholder="Select ID type"
          />
        </div>

        <div>
          <label
            htmlFor="idNumber"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            ID number
          </label>
          <input
            type="text"
            id="idNumber"
            value={formData.idNumber}
            onChange={(e) => updateField('idNumber', e.target.value)}
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
            htmlFor="nationality"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Nationality
          </label>
          <CustomDropdown
            value={formData.nationality}
            onChange={(value) => updateField('nationality', value)}
            options={countries.map(country => ({ 
              value: country, 
              label: country,
              icon: countryFlags[country] || '🏳️'
            }))}
            placeholder="Select your nationality"
            searchable={true}
            searchPlaceholder="Search country..."
          />
        </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full text-black py-4 px-6 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#90EE90' }}
      >
        Continue
      </button>
    </div>
  )
}


function ConfirmationStep({ formData }: { formData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // First, check if email already exists
      const { data: existingAppByEmail, error: emailCheckError } = await supabase
        .from('applications')
        .select('email')
        .eq('email', formData.email.toLowerCase().trim())
        .single()

      // If we found an existing application by email
      if (existingAppByEmail && !emailCheckError) {
        setSubmitError('An application with this email already exists. Please use "Check Application" to view your status.')
        setIsSubmitting(false)
        return
      }

      // Check if phone number already exists (combine country code + number)
      const fullPhoneNumberCheck = `${formData.phoneCountryCode}${formData.phoneNumber.trim()}`
      const { data: existingAppByPhone, error: phoneCheckError } = await supabase
        .from('applications')
        .select('phone_number')
        .eq('phone_number', fullPhoneNumberCheck)
        .single()

      // If we found an existing application by phone number
      if (existingAppByPhone && !phoneCheckError) {
        setSubmitError('An application with this phone number already exists. Please use "Check Application" to view your status.')
        setIsSubmitting(false)
        return
      }

      // Check if ID number already exists
      const { data: existingAppByIdNumber, error: idNumberCheckError } = await supabase
        .from('applications')
        .select('id_number')
        .eq('id_number', formData.idNumber.trim())
        .single()

      // If we found an existing application by ID number
      if (existingAppByIdNumber && !idNumberCheckError) {
        setSubmitError('An application with this ID number already exists. Please use "Check Application" to view your status.')
        setIsSubmitting(false)
        return
      }

      // If there's an error other than "not found", handle it
      if ((emailCheckError && emailCheckError.code !== 'PGRST116') || 
          (phoneCheckError && phoneCheckError.code !== 'PGRST116') ||
          (idNumberCheckError && idNumberCheckError.code !== 'PGRST116')) {
        console.error('Error checking for existing application:', emailCheckError || phoneCheckError || idNumberCheckError)
        setSubmitError('Error checking application. Please try again.')
        setIsSubmitting(false)
        return
      }

      // All checks passed, proceed with insertion
      const fullPhoneNumberInsert = `${formData.phoneCountryCode}${formData.phoneNumber.trim()}`
      const { error } = await supabase
        .from('applications')
        .insert({
          email: formData.email.toLowerCase().trim(),
          password: formData.password, // Note: In production, hash this!
          full_name: formData.fullName,
          phone_country_code: formData.phoneCountryCode,
          phone_number: fullPhoneNumberInsert,
          id_type: formData.idType,
          id_number: formData.idNumber.trim(),
          nationality: formData.nationality,
          status: 'pending',
        })

      if (error) {
        console.error('Error submitting application:', error)
        
        // Handle duplicate email, phone number, or ID number error from database constraint
        if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
          if (error.message.includes('email') || error.details?.includes('email')) {
            setSubmitError('An application with this email already exists. Please use "Check Application" to view your status.')
          } else if (error.message.includes('phone_number') || error.details?.includes('phone_number')) {
            setSubmitError('An application with this phone number already exists. Please use "Check Application" to view your status.')
          } else if (error.message.includes('id_number') || error.details?.includes('id_number')) {
            setSubmitError('An application with this ID number already exists. Please use "Check Application" to view your status.')
          } else {
            setSubmitError('An application with this information already exists. Please use "Check Application" to view your status.')
          }
        } else {
          setSubmitError(error.message || 'Failed to submit application. Please try again.')
        }
        setIsSubmitting(false)
      } else {
        setIsSubmitted(true)
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setSubmitError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h3 className="text-xl font-medium text-white mb-2">
            You're all set.
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Your application has been submitted and is pending approval.
          </p>
        </div>
        <Link
          href="/check-application"
          className="block w-full py-4 px-6 rounded-lg font-medium uppercase tracking-wider text-white transition-colors"
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
          Check Your Application
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-xl font-medium text-white mb-2">
          Review your information
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Please review your details before submitting.
        </p>
      </div>

      <div className="text-left space-y-3 bg-gray-900 p-6 rounded-lg">
        <div>
          <span className="text-gray-400 text-sm">Name:</span>
          <p className="text-white">{formData.fullName}</p>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Phone:</span>
          <p className="text-white">{formData.phoneCountryCode}{formData.phoneNumber}</p>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Email:</span>
          <p className="text-white">{formData.email}</p>
        </div>
        <div>
          <span className="text-gray-400 text-sm">ID Type:</span>
          <p className="text-white capitalize">{formData.idType.replace('-', ' ')}</p>
        </div>
        <div>
          <span className="text-gray-400 text-sm">ID Number:</span>
          <p className="text-white">{formData.idNumber}</p>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Nationality:</span>
          <p className="text-white">{formData.nationality}</p>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-lg font-medium transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#90EE90', color: '#000000' }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </div>
  )
}
