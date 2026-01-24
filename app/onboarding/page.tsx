'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { supabase } from '@/lib/supabaseClient'

type Step = 'account' | 'kyc' | 'confirmation'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('account')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    idNumber: '',
    idType: 'passport',
    bankName: '',
    accountNumber: '',
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
  const canProceed = formData.email && formData.password && formData.fullName

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
  const canProceed = formData.idNumber

  return (
    <div className="space-y-5">
        <div>
          <label
            htmlFor="idType"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            ID type
          </label>
          <select
            id="idType"
            value={formData.idType}
            onChange={(e) => updateField('idType', e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-black border border-gray-600 text-white rounded-lg outline-none"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#90EE90'
              e.currentTarget.style.boxShadow = '0 0 0 2px #90EE90'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#4B5563'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <option value="passport">Passport</option>
            <option value="national-id">National ID</option>
            <option value="drivers-license">Driver's License</option>
          </select>
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

function VerificationStep({
  formData,
  updateField,
  onNext,
  onBack,
}: {
  formData: any
  updateField: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const canProceed = formData.bankName && formData.accountNumber

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium text-white mb-2">
          Link your bank account
        </h3>
        <p className="text-gray-400 text-sm">
          Connect your bank account to enable secure transactions. All payment
          flows are handled by our licensed partners to keep your funds safe.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="bankName"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Bank name
          </label>
          <input
            type="text"
            id="bankName"
            value={formData.bankName}
            onChange={(e) => updateField('bankName', e.target.value)}
            className="w-full px-4 py-3 bg-black border border-gray-600 text-white rounded-lg outline-none placeholder-gray-500"
            style={{ 
              '--tw-ring-color': '#90EE90',
            } as React.CSSProperties}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#90EE90'
              e.currentTarget.style.boxShadow = '0 0 0 2px #90EE90'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#4B5563'
              e.currentTarget.style.boxShadow = 'none'
            }}
            placeholder="Your bank name"
          />
        </div>

        <div>
          <label
            htmlFor="accountNumber"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Account number
          </label>
          <input
            type="text"
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => updateField('accountNumber', e.target.value)}
            className="w-full px-4 py-3 bg-black border border-gray-600 text-white rounded-lg outline-none placeholder-gray-500"
            style={{ 
              '--tw-ring-color': '#90EE90',
            } as React.CSSProperties}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#90EE90'
              e.currentTarget.style.boxShadow = '0 0 0 2px #90EE90'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#4B5563'
              e.currentTarget.style.boxShadow = 'none'
            }}
            placeholder="Enter your account number"
          />
          <p className="mt-1 text-xs text-gray-400">
            Your account details are encrypted and secure
          </p>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="flex-1 text-white py-4 px-6 rounded-lg font-medium transition-colors"
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
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 text-black py-4 px-6 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#90EE90' }}
        >
          Continue
        </button>
      </div>
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
          (idNumberCheckError && idNumberCheckError.code !== 'PGRST116')) {
        console.error('Error checking for existing application:', emailCheckError || idNumberCheckError)
        setSubmitError('Error checking application. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Email doesn't exist, proceed with insertion
      const { error } = await supabase
        .from('applications')
        .insert({
          email: formData.email.toLowerCase().trim(),
          password: formData.password, // Note: In production, hash this!
          full_name: formData.fullName,
          id_type: formData.idType,
          id_number: formData.idNumber.trim(),
          bank_name: formData.bankName || null,
          account_number: formData.accountNumber || null,
          status: 'pending',
        })

      if (error) {
        console.error('Error submitting application:', error)
        
        // Handle duplicate email or ID number error from database constraint
        if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
          if (error.message.includes('email') || error.details?.includes('email')) {
            setSubmitError('An application with this email already exists. Please use "Check Application" to view your status.')
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
        {formData.bankName && (
          <div>
            <span className="text-gray-400 text-sm">Bank:</span>
            <p className="text-white">{formData.bankName}</p>
          </div>
        )}
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
