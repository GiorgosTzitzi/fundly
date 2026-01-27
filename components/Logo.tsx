'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Logo({ className = '' }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [href, setHref] = useState('/')

  useEffect(() => {
    const checkUserStatus = async () => {
      // If user is already on marketplace or project page, they're approved - redirect to marketplace
      if (pathname?.startsWith('/marketplace') || pathname?.startsWith('/project/')) {
        setHref('/marketplace')
        return
      }

      const sessionEmail = sessionStorage.getItem('user_email')
      if (sessionEmail) {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('status')
            .eq('email', sessionEmail)
            .eq('status', 'approved')
            .single()

          if (data && !error && data.status === 'approved') {
            setHref('/marketplace')
          }
        } catch (err) {
          // If check fails, default to home
          setHref('/')
        }
      }
    }
    checkUserStatus()
  }, [pathname])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // If on marketplace or project page, go directly to marketplace
    if (pathname?.startsWith('/marketplace') || pathname?.startsWith('/project/')) {
      router.push('/marketplace')
    } else {
      router.push(href)
    }
  }

  return (
    <Link href={href} onClick={handleClick} className={`flex flex-col items-center ${className} cursor-pointer`}>
      {/* Logo Icon - Three circles connected by lines */}
      <svg
        width="160"
        height="60"
        viewBox="0 0 80 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4"
      >
        {/* Left circle (outline) */}
        <circle cx="15" cy="15" r="8" stroke="#90EE90" strokeWidth="2" fill="none" />
        {/* Middle circle (filled) */}
        <circle cx="40" cy="15" r="8" fill="#90EE90" />
        {/* Right circle (outline) */}
        <circle cx="65" cy="15" r="8" stroke="#90EE90" strokeWidth="2" fill="none" />
        {/* Connecting lines */}
        <line x1="23" y1="15" x2="32" y2="15" stroke="#90EE90" strokeWidth="2" />
        <line x1="48" y1="15" x2="57" y2="15" stroke="#90EE90" strokeWidth="2" />
      </svg>
      {/* Text */}
      <span className="text-5xl text-[#90EE90] lowercase" style={{ fontFamily: 'Circular Std Medium, Circular Std, sans-serif' }}>
        fundly
      </span>
    </Link>
  )
}
